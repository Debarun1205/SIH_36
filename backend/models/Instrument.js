import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const instrumentSchema = new mongoose.Schema(
  {
    qrId: { type: String, default: uuidv4, unique: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    instrumentType: { type: String, required: true }, // e.g. Electronic Weighing Scale, Fuel Dispenser
    manufacturer: { type: String },
    modelNumber: { type: String },
    serialNumber: { type: String, required: true },
    capacity: { type: String }, // e.g. "50 kg", "100 L"
    nameplateImage: { type: String }, // base64 or URL of uploaded photo
    ocrExtractedText: { type: String }, // raw OCR output for audit trail
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified", "expired", "rejected"],
      default: "unverified",
    },
    lastVerifiedDate: Date,
    qrCode: { type: String }, // data URL of QR image
  },
  { timestamps: true }
);

export default mongoose.model("Instrument", instrumentSchema);
