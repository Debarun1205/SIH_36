import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "InspectionSlot", required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    instrumentsChecked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instrument" }],
    result: {
      type: String,
      enum: ["pending", "compliant", "non-compliant", "review-required"],
      default: "pending",
    },
    remarks: { type: String },
    completedAt: Date,

    // Lightweight, free-to-run stand-in for AEVE (no paid video/CV service):
    // inspector uploads a photo of the instrument's display reading, the
    // browser runs free OCR (Tesseract.js) on it, and the extracted value is
    // cross-checked against the inspector's declared reading + configured
    // tolerance. Disagreement is flagged for human review rather than
    // auto-decided, matching the "AI is decision support, not final
    // authority" principle from the spec docs.
    measurementChecks: [
      {
        instrument: { type: mongoose.Schema.Types.ObjectId, ref: "Instrument" },
        expectedValue: Number,
        observedValue: Number, // value the inspector entered
        unit: String,
        errorPercent: Number,
        toleranceErrorPercent: Number,
        ruleResult: { type: String, enum: ["pass", "fail"] },
        evidenceImage: String, // base64/data URL of the display photo
        ocrExtractedReading: String, // raw text Tesseract.js found in-browser
        ocrValueParsed: Number, // best-effort numeric parse of the OCR text
        ocrMatchesInspector: Boolean, // does OCR reading agree with observedValue?
        evidenceHash: String, // SHA-256 of the evidence image, for tamper-evidence
        conflict: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Inspection", inspectionSchema);
