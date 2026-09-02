import Shop from "../models/Shop.js";
import Instrument from "../models/Instrument.js";
import Certificate from "../models/Certificate.js";
import { verifyCertificateIntegrity } from "../utils/integrity.js";

// @route GET /api/verify/:type/:id   (public, no auth - this is what scanning a QR hits)
export const verifyByQr = async (req, res) => {
  const { type, id } = req.params;

  try {
    if (type === "shop") {
      const shop = await Shop.findOne({ qrId: id });
      if (!shop) return res.status(404).json({ message: "Shop not found" });

      const instruments = await Instrument.find({ shop: shop._id });
      const activeCert = await Certificate.findOne({ shop: shop._id, status: "active" }).sort({ validUntil: -1 });

      return res.json({
        type: "shop",
        shop,
        instruments,
        certificate: activeCert
          ? {
              certificateId: activeCert.certificateId,
              issueDate: activeCert.issueDate,
              validUntil: activeCert.validUntil,
              currentlyValid: activeCert.validUntil > new Date() && verifyCertificateIntegrity(activeCert),
            }
          : null,
      });
    }

    if (type === "instrument") {
      const instrument = await Instrument.findOne({ qrId: id }).populate("shop");
      if (!instrument) return res.status(404).json({ message: "Instrument not found" });
      return res.json({ type: "instrument", instrument });
    }

    if (type === "certificate") {
      const cert = await Certificate.findOne({ certificateId: id }).populate("shop").populate("instruments");
      if (!cert) return res.status(404).json({ message: "Certificate not found" });
      const currentlyValid = cert.validUntil > new Date() && cert.status === "active" && verifyCertificateIntegrity(cert);
      return res.json({ type: "certificate", certificate: cert, currentlyValid, integrityVerified: verifyCertificateIntegrity(cert) });
    }

    return res.status(400).json({ message: "Unknown QR type" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
