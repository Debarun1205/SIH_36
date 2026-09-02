import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, default: uuidv4, unique: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    instruments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instrument" }],
    inspection: { type: mongoose.Schema.Types.ObjectId, ref: "Inspection" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // inspector
    issueDate: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
    // simple tamper-evident hash chain: hash of this cert's core fields + previous cert's hash
    integrityHash: { type: String },
    previousHash: { type: String, default: "GENESIS" },
    qrCode: { type: String }, // data URL of QR image encoding the verify link
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
