import Inspection from "../models/Inspection.js";
import InspectionSlot from "../models/InspectionSlot.js";
import Shop from "../models/Shop.js";
import Instrument from "../models/Instrument.js";
import ToleranceRule from "../models/ToleranceRule.js";
import { issueCertificateForInspection } from "./certificateController.js";
import { detectAnomalies } from "../utils/anomaly.js";
import { hashEvidence } from "../utils/integrity.js";
import Certificate from "../models/Certificate.js";

const DEFAULT_TOLERANCE_PERCENT = 2; // used only if admin hasn't configured a rule for this instrument type

// Compares the inspector's declared reading against the free in-browser OCR
// reading (if provided) and applies the configured tolerance rule. This is
// the rule-engine + evidence cross-check described in the spec docs, without
// requiring a paid video-AI service.
const evaluateMeasurementCheck = async (check, instrumentType) => {
  const { expectedValue, observedValue, ocrValueParsed } = check;
  const rule = await ToleranceRule.findOne({ instrumentType });
  const toleranceErrorPercent = rule?.toleranceErrorPercent ?? DEFAULT_TOLERANCE_PERCENT;

  let errorPercent = null;
  let ruleResult = "fail";
  if (typeof expectedValue === "number" && typeof observedValue === "number" && expectedValue !== 0) {
    errorPercent = ((observedValue - expectedValue) / expectedValue) * 100;
    ruleResult = Math.abs(errorPercent) <= toleranceErrorPercent ? "pass" : "fail";
  }

  let ocrMatchesInspector = null;
  if (typeof ocrValueParsed === "number" && typeof observedValue === "number") {
    // allow a small margin for OCR digit-recognition noise
    ocrMatchesInspector = Math.abs(ocrValueParsed - observedValue) <= Math.max(0.05 * Math.abs(observedValue), 0.01);
  }

  const conflict = ocrMatchesInspector === false;

  return {
    ...check,
    errorPercent,
    toleranceErrorPercent,
    ruleResult,
    ocrMatchesInspector,
    conflict,
    evidenceHash: check.evidenceImage ? hashEvidence(check.evidenceImage) : undefined,
  };
};

// @route POST /api/inspections/book  (role: user)
export const bookInspection = async (req, res) => {
  try {
    const { shopId, slotId } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this shop" });
    }

    const slot = await InspectionSlot.findById(slotId);
    if (!slot || slot.isBooked) {
      return res.status(409).json({ message: "This slot is no longer available" });
    }

    slot.isBooked = true;
    slot.shop = shopId;
    await slot.save();

    const inspection = await Inspection.create({
      shop: shopId,
      inspector: slot.inspector,
      slot: slot._id,
    });

    shop.complianceStatus = "pending";
    await shop.save();

    res.status(201).json({ inspection });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/inspections/mine  (role: user | inspector)
export const getMyInspections = async (req, res) => {
  const filter =
    req.user.role === "inspector" ? { inspector: req.user._id } : { shop: { $in: await ownedShopIds(req.user._id) } };

  const inspections = await Inspection.find(filter)
    .populate("shop", "shopName city state address")
    .populate("inspector", "name phone")
    .populate("slot")
    .sort({ createdAt: -1 });

  res.json({ inspections });
};

const ownedShopIds = async (userId) => {
  const shops = await Shop.find({ owner: userId }).select("_id");
  return shops.map((s) => s._id);
};

// @route PATCH /api/inspections/:id/complete  (role: inspector)
// body: { remarks, measurementChecks: [{ instrument, expectedValue, observedValue, unit,
//   evidenceImage, ocrExtractedReading, ocrValueParsed }], inspectorVerdict: "compliant" | "non-compliant" }
// The inspector still gives the final field verdict; the system independently evaluates
// each measurement check and flags disagreement instead of silently overriding either side.
export const completeInspection = async (req, res) => {
  try {
    const { remarks, measurementChecks = [], inspectorVerdict } = req.body;
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: "Inspection not found" });
    if (inspection.inspector.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This inspection is not assigned to you" });
    }

    const instrumentIds = measurementChecks.map((c) => c.instrument).filter(Boolean);
    const instruments = await Instrument.find({ _id: { $in: instrumentIds } });
    const typeById = Object.fromEntries(instruments.map((i) => [i._id.toString(), i.instrumentType]));

    const evaluatedChecks = await Promise.all(
      measurementChecks.map((c) => evaluateMeasurementCheck(c, typeById[c.instrument]))
    );

    const anyConflict = evaluatedChecks.some((c) => c.conflict);
    const anyRuleFail = evaluatedChecks.some((c) => c.ruleResult === "fail");

    // Final result: a system/inspector disagreement always routes to human
    // review rather than being auto-decided either way.
    let result;
    if (anyConflict) {
      result = "review-required";
    } else if (inspectorVerdict === "non-compliant" || anyRuleFail) {
      result = "non-compliant";
    } else {
      result = "compliant";
    }

    inspection.status = "completed";
    inspection.result = result;
    inspection.remarks = remarks;
    inspection.instrumentsChecked = instrumentIds;
    inspection.measurementChecks = evaluatedChecks;
    inspection.completedAt = new Date();
    await inspection.save();

    if (instrumentIds.length) {
      await Instrument.updateMany(
        { _id: { $in: instrumentIds } },
        {
          verificationStatus: result === "compliant" ? "verified" : result === "review-required" ? "unverified" : "rejected",
          lastVerifiedDate: new Date(),
        }
      );
    }

    let certificate = null;
    if (result === "compliant") {
      certificate = await issueCertificateForInspection({
        shopId: inspection.shop,
        instrumentIds,
        inspectionId: inspection._id,
        inspectorId: req.user._id,
      });
    } else if (result === "non-compliant") {
      await Shop.findByIdAndUpdate(inspection.shop, { complianceStatus: "non-compliant" });
    } else {
      await Shop.findByIdAndUpdate(inspection.shop, { complianceStatus: "pending" });
    }

    res.json({ inspection, certificate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/inspections/trends  (role: admin)
// Certificates issued per week over the last 8 weeks - the "verification
// trends" chart the government dashboard needs.
export const getVerificationTrends = async (req, res) => {
  const WEEKS = 8;
  const now = new Date();
  const buckets = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7 - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    buckets.push({ start, end, label: `${start.getMonth() + 1}/${start.getDate()}`, count: 0 });
  }

  const certificates = await Certificate.find({ issueDate: { $gte: buckets[0].start } });
  certificates.forEach((c) => {
    const b = buckets.find((bucket) => c.issueDate >= bucket.start && c.issueDate < bucket.end);
    if (b) b.count += 1;
  });

  res.json({ trends: buckets.map((b) => ({ week: b.label, certificatesIssued: b.count })) });
};
// Cases where the inspector's declared reading disagreed with the OCR-extracted
// reading from the evidence photo - these need a human to look at the photo.
export const getReviewQueue = async (req, res) => {
  const inspections = await Inspection.find({ result: "review-required" })
    .populate("shop", "shopName city state")
    .populate("inspector", "name email")
    .sort({ completedAt: -1 });
  res.json({ inspections });
};

// @route GET /api/inspections/analytics  (role: admin)
export const getAnalytics = async (req, res) => {
  const [totalShops, compliantShops, nonCompliantShops, pendingShops, inspections, certificates] = await Promise.all([
    Shop.countDocuments(),
    Shop.countDocuments({ complianceStatus: "compliant" }),
    Shop.countDocuments({ complianceStatus: "non-compliant" }),
    Shop.countDocuments({ complianceStatus: "pending" }),
    Inspection.find(),
    Certificate.find(),
  ]);

  const shops = await Shop.find();
  const shopsWithValidity = shops.map((s) => {
    const cert = certificates
      .filter((c) => c.shop.toString() === s._id.toString() && c.status === "active")
      .sort((a, b) => b.validUntil - a.validUntil)[0];
    return { ...s.toObject(), validUntil: cert?.validUntil };
  });

  const flags = detectAnomalies({ inspections, shops: shopsWithValidity });

  res.json({
    summary: { totalShops, compliantShops, nonCompliantShops, pendingShops, totalCertificates: certificates.length },
    flags,
  });
};
