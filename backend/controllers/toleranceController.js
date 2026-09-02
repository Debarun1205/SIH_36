import ToleranceRule from "../models/ToleranceRule.js";

// @route POST /api/tolerance-rules  (role: admin)
export const upsertToleranceRule = async (req, res) => {
  const { instrumentType, toleranceErrorPercent, notes } = req.body;
  if (!instrumentType || toleranceErrorPercent === undefined) {
    return res.status(400).json({ message: "instrumentType and toleranceErrorPercent are required" });
  }
  const rule = await ToleranceRule.findOneAndUpdate(
    { instrumentType },
    { instrumentType, toleranceErrorPercent, notes, setBy: req.user._id },
    { upsert: true, new: true }
  );
  res.json({ rule });
};

// @route GET /api/tolerance-rules
export const listToleranceRules = async (req, res) => {
  const rules = await ToleranceRule.find().sort({ instrumentType: 1 });
  res.json({ rules });
};
