import Certificate from "../models/Certificate.js";
import Shop from "../models/Shop.js";
import { generateQR } from "../utils/qr.js";
import { computeCertificateHash, verifyCertificateIntegrity } from "../utils/integrity.js";

const VALIDITY_MONTHS = 12;

// Called internally when an inspection is marked "compliant".
export const issueCertificateForInspection = async ({ shopId, instrumentIds, inspectionId, inspectorId }) => {
  const issueDate = new Date();
  const validUntil = new Date(issueDate);
  validUntil.setMonth(validUntil.getMonth() + VALIDITY_MONTHS);

  const cert = new Certificate({
    shop: shopId,
    instruments: instrumentIds,
    inspection: inspectionId,
    issuedBy: inspectorId,
    issueDate,
    validUntil,
  });

  const { integrityHash, previousHash } = await computeCertificateHash({
    certificateId: cert.certificateId,
    shopId,
    issueDate,
    validUntil,
    issuedBy: inspectorId,
  });
  cert.integrityHash = integrityHash;
  cert.previousHash = previousHash;
  cert.qrCode = await generateQR("certificate", cert.certificateId);

  await cert.save();

  await Shop.findByIdAndUpdate(shopId, { complianceStatus: "compliant" });

  return cert;
};

// @route GET /api/certificates/shop/:shopId
export const getCertificatesByShop = async (req, res) => {
  const certs = await Certificate.find({ shop: req.params.shopId })
    .populate({ path: "shop", populate: { path: "owner", select: "name email phone" } })
    .populate("issuedBy", "name email")
    .populate("instruments")
    .sort({ createdAt: -1 });
  res.json({ certificates: certs });
};

// @route GET /api/certificates/:certificateId  (public-safe fields only; full detail via /verify)
export const getCertificateById = async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate({ path: "shop", populate: { path: "owner", select: "name email phone" } })
    .populate("issuedBy", "name")
    .populate("instruments");
  if (!cert) return res.status(404).json({ message: "Certificate not found" });

  const isValid = verifyCertificateIntegrity(cert) && cert.validUntil > new Date() && cert.status === "active";

  res.json({ certificate: cert, integrityVerified: verifyCertificateIntegrity(cert), currentlyValid: isValid });
};