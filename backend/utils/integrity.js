import crypto from "crypto";
import Certificate from "../models/Certificate.js";

// SHA-256 of any evidence payload (e.g. a base64 image string) so that if the
// stored file is later swapped or edited, recomputing the hash won't match.
export const hashEvidence = (payload) => crypto.createHash("sha256").update(payload || "").digest("hex");

/**
 * Builds a simple hash-chain (each certificate's hash includes the previous
 * certificate's hash) so that editing any past certificate's core fields
 * breaks the chain and is detectable. This is a lightweight, dependency-free
 * stand-in for anchoring certificates on a real blockchain ledger, and can be
 * swapped for an actual smart-contract call later without changing the
 * calling code.
 */
export const computeCertificateHash = async ({ certificateId, shopId, issueDate, validUntil, issuedBy }) => {
  const lastCert = await Certificate.findOne().sort({ createdAt: -1 });
  const previousHash = lastCert?.integrityHash || "GENESIS";

  const payload = `${certificateId}|${shopId}|${issueDate}|${validUntil}|${issuedBy}|${previousHash}`;
  const integrityHash = crypto.createHash("sha256").update(payload).digest("hex");

  return { integrityHash, previousHash };
};

/**
 * Recomputes the hash for a stored certificate and compares it to what's
 * saved, to detect tampering with core certificate fields.
 */
export const verifyCertificateIntegrity = (cert) => {
  const payload = `${cert.certificateId}|${cert.shop}|${cert.issueDate.toISOString()}|${cert.validUntil.toISOString()}|${cert.issuedBy}|${cert.previousHash}`;
  const recomputed = crypto.createHash("sha256").update(payload).digest("hex");
  return recomputed === cert.integrityHash;
};
