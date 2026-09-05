import Instrument from "../models/Instrument.js";
import Shop from "../models/Shop.js";
import { generateQR } from "../utils/qr.js";

// @route POST /api/instruments  (role: user)
// nameplateImage + ocrExtractedText are produced client-side (Tesseract.js reads
// the instrument's nameplate photo in-browser) and sent here for storage/audit.
export const addInstrument = async (req, res) => {
  try {
    const {
      shopId,
      instrumentType,
      manufacturer,
      modelNumber,
      serialNumber,
      capacity,
      nameplateImage,
      ocrExtractedText,
    } = req.body;

    if (!shopId || !instrumentType || !serialNumber) {
      return res.status(400).json({ message: "shopId, instrumentType and serialNumber are required" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "You do not own this shop" });
    }

    const instrument = await Instrument.create({
      shop: shopId,
      instrumentType,
      manufacturer,
      modelNumber,
      serialNumber,
      capacity,
      nameplateImage,
      ocrExtractedText,
    });

    instrument.qrCode = await generateQR("instrument", instrument.qrId);
    await instrument.save();

// If the shop was previously compliant, adding a new instrument
// means the shop needs inspection again.
if (shop.complianceStatus === "compliant") {
  shop.complianceStatus = "pending";
  await shop.save();
}

    res.status(201).json({ instrument });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/instruments/shop/:shopId
export const getInstrumentsByShop = async (req, res) => {
  const instruments = await Instrument.find({ shop: req.params.shopId }).sort({ createdAt: -1 });
  res.json({ instruments });
};

// @route GET /api/instruments/:id
export const getInstrumentById = async (req, res) => {
  const instrument = await Instrument.findById(req.params.id).populate("shop");
  if (!instrument) return res.status(404).json({ message: "Instrument not found" });
  res.json({ instrument });
};

// @route PATCH /api/instruments/:id/verify  (role: inspector)
export const setInstrumentVerification = async (req, res) => {
  const { verificationStatus } = req.body;
  const instrument = await Instrument.findById(req.params.id);
  if (!instrument) return res.status(404).json({ message: "Instrument not found" });

  instrument.verificationStatus = verificationStatus;
  if (verificationStatus === "verified") instrument.lastVerifiedDate = new Date();
  await instrument.save();

  res.json({ instrument });
};
