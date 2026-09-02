import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const shopSchema = new mongoose.Schema(
  {
    qrId: { type: String, default: uuidv4, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shopName: { type: String, required: true, trim: true },
    category: { type: String, trim: true }, // e.g. Grocery, Fuel Station, Jewellery
    licenseNumber: { type: String, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },
    complianceStatus: {
      type: String,
      enum: ["unverified", "pending", "compliant", "non-compliant"],
      default: "unverified",
    },
    qrCode: { type: String }, // data URL of QR image
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);
