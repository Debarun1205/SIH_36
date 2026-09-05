import Shop from "../models/Shop.js";
import Instrument from "../models/Instrument.js";
import Certificate from "../models/Certificate.js";
import Application from "../models/Application.js";
import Inspection from "../models/Inspection.js";
import InspectionSlot from "../models/InspectionSlot.js";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { askGroq } from "../utils/groqClient.js";

const PLATFORM_BLURB = `MaanVerify is a digital verification platform for weighing and measuring
instruments (SIH26036). Businesses register shops and instruments; inspectors
verify them on-site; compliant results get a tamper-evident certificate with a
QR code; citizens can scan that QR to check a shop's status instantly.`;

// Each of these builds a *role-scoped* context string using only data the
// requesting user is entitled to see - this is the actual data-isolation
// mechanism, not a prompt instruction alone. The model never receives a raw
// database handle, only whatever string these functions decide to hand it.

const buildUserContext = async (user) => {
  const shops = await Shop.find({ owner: user._id });
  const parts = [];
  for (const shop of shops) {
    const instruments = await Instrument.find({ shop: shop._id });
    const cert = await Certificate.findOne({ shop: shop._id, status: "active" }).sort({ validUntil: -1 });
    const pendingApp = await Application.findOne({ shop: shop._id, status: "pending" });
    const upcoming = await Inspection.findOne({ shop: shop._id, status: "scheduled" }).populate("slot");
    parts.push(
      `Shop "${shop.shopName}" (${shop.city}, ${shop.state}) - compliance status: ${shop.complianceStatus}. ` +
        `Instruments: ${instruments.map((i) => `${i.instrumentType} (${i.verificationStatus})`).join(", ") || "none registered"}. ` +
        `${cert ? `Active certificate valid until ${cert.validUntil.toDateString()}.` : "No active certificate."} ` +
        `${pendingApp ? "Has a pending inspection request awaiting admin assignment." : ""} ` +
        `${upcoming ? `Has a scheduled inspection on ${new Date(upcoming.slot.date).toDateString()} at ${upcoming.slot.startTime}.` : ""}`
    );
  }
  return parts.length ? parts.join("\n") : "This business owner has not registered any shops yet.";
};

const buildCitizenContext = async (user) => {
  const complaints = await Complaint.find({ citizen: user._id }).populate("shop", "shopName city");
  if (!complaints.length) return "This citizen has not filed any complaints yet.";
  return complaints
    .map((c) => `Complaint (${c.issueType}) about ${c.shop?.shopName || "an unspecified shop"} - status: ${c.status}.`)
    .join("\n");
};

const buildInspectorContext = async (user) => {
  if (user.approvalStatus !== "approved") {
    return `This inspector's registration is currently "${user.approvalStatus}" and does not yet have dashboard access.`;
  }
  const inspections = await Inspection.find({ inspector: user._id, status: "scheduled" })
    .populate("shop", "shopName city")
    .populate("slot");
  const openSlots = await InspectionSlot.find({ inspector: user._id, isBooked: false });
  const needing = await Shop.find({ complianceStatus: { $in: ["unverified", "non-compliant"] } }).limit(5);

  return (
    `Assigned upcoming inspections: ${
      inspections
        .map((i) => `${i.shop?.shopName} on ${new Date(i.slot?.date).toDateString()}`)
        .join("; ") || "none"
    }.\n` +
    `Open (unbooked) availability slots: ${openSlots.length}.\n` +
    `A few shops that still need inspection (for self-serve pickup): ${
      needing.map((s) => `${s.shopName} (${s.city})`).join("; ") || "none currently"
    }.`
  );
};

const buildAdminContext = async () => {
  const [totalShops, compliant, nonCompliant, pending, certificates, pendingInspectors, pendingApps, reviewQueue, complaints] =
    await Promise.all([
      Shop.countDocuments(),
      Shop.countDocuments({ complianceStatus: "compliant" }),
      Shop.countDocuments({ complianceStatus: "non-compliant" }),
      Shop.countDocuments({ complianceStatus: "pending" }),
      Certificate.countDocuments(),
      User.countDocuments({ role: "inspector", approvalStatus: "pending" }),
      Application.countDocuments({ status: "pending" }),
      Inspection.countDocuments({ result: "review-required" }),
      Complaint.countDocuments({ status: { $ne: "resolved" } }),
    ]);
  return (
    `Shops: ${totalShops} total (${compliant} compliant, ${nonCompliant} non-compliant, ${pending} pending). ` +
    `Certificates issued: ${certificates}. Pending inspector approvals: ${pendingInspectors}. ` +
    `Pending inspection-request assignments: ${pendingApps}. OCR-conflict cases awaiting review: ${reviewQueue}. ` +
    `Open citizen complaints: ${complaints}.`
  );
};

const ROLE_SCOPE_NOTE = {
  user: "You may ONLY discuss this business owner's own shops, instruments, certificates, and inspection requests. Never reveal other businesses' data, citizen complaint details, or inspector/government information.",
  citizen: "You may ONLY discuss this citizen's own complaints and general public information about how to verify a shop or file a report. Never reveal shop owner contact details, inspector information, or other citizens' complaints.",
  inspector: "You may ONLY discuss this inspector's own assignments, availability, and shops available for self-serve inspection. Never reveal other inspectors' data, citizen personal complaint details, or government-only analytics.",
  admin: "You may discuss platform-wide summary statistics with this government official. Do not fabricate figures beyond what's given below.",
};

// @route POST /api/chat  (any authenticated role)
export const askChatbot = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "message is required" });

    let contextBlock = "";
    if (req.user.role === "user") contextBlock = await buildUserContext(req.user);
    else if (req.user.role === "citizen") contextBlock = await buildCitizenContext(req.user);
    else if (req.user.role === "inspector") contextBlock = await buildInspectorContext(req.user);
    else if (req.user.role === "admin") contextBlock = await buildAdminContext();

    const systemPrompt = `${PLATFORM_BLURB}

You are the MaanVerify assistant, currently helping a logged-in "${req.user.role}" named ${req.user.name}.
${ROLE_SCOPE_NOTE[req.user.role]}
If asked for anything outside this scope, politely explain you can only help with things relevant to their own account and role.

Current data for this user:
${contextBlock}

Answer concisely and helpfully. Do not invent data not given above.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((h) => ({ role: h.role === "assistant" ? "assistant" : "user", content: h.content })),
      { role: "user", content: message },
    ];

    const reply = await askGroq(messages);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
