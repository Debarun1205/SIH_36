import mongoose from "mongoose";

const inspectionSlotSchema = new mongoose.Schema(
  {
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "10:00"
    city: { type: String, required: true },
    state: { type: String, required: true },
    lat: Number,
    lng: Number,
    isBooked: { type: Boolean, default: false },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("InspectionSlot", inspectionSlotSchema);
