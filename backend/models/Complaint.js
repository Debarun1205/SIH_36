import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    // complainant is optional: citizens can report without a full account
    complainant: {
      name: String,
      contact: String,
    },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    instrument: { type: mongoose.Schema.Types.ObjectId, ref: "Instrument" },
    issueType: {
      type: String,
      enum: ["incorrect-weight", "expired-certificate", "missing-verification-mark", "suspicious-instrument", "other"],
      required: true,
    },
    description: { type: String, required: true },
    photo: String, // base64/data URL
    status: {
      type: String,
      enum: ["submitted", "under-review", "inspection-scheduled", "resolved"],
      default: "submitted",
    },
    resolutionNotes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
