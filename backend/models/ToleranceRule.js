import mongoose from "mongoose";

// Lets an admin configure acceptable measurement error by instrument type
// instead of the system hard-coding a universal tolerance (per FR-09 / the
// verification engine spec: tolerance must be authorized and configurable).
const toleranceRuleSchema = new mongoose.Schema(
  {
    instrumentType: { type: String, required: true, unique: true },
    toleranceErrorPercent: { type: Number, required: true }, // e.g. 1.0 = 1%
    notes: { type: String },
    setBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("ToleranceRule", toleranceRuleSchema);
