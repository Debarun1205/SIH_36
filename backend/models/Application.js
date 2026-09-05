import mongoose from "mongoose";

// Represents the "APPLY" step from the PRD workflow: a shop owner requests
// verification without picking a specific inspector/slot themselves. An admin
// (or authorized staff) then assigns it to the best-matched inspector based on
// location and current workload - this is the "hand-down" mechanism, distinct
// from the self-service slot booking in InspectionSlot/Inspection.
const applicationSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "assigned", "cancelled"],
      default: "pending",
    },
    assignedInspection: { type: mongoose.Schema.Types.ObjectId, ref: "Inspection", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
