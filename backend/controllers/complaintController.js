import Complaint from "../models/Complaint.js";

// @route POST /api/complaints  (public - citizens don't need an account)
export const submitComplaint = async (req, res) => {
  try {
    const { name, contact, shopId, instrumentId, issueType, description, photo } = req.body;
    if (!issueType || !description) {
      return res.status(400).json({ message: "issueType and description are required" });
    }
    const complaint = await Complaint.create({
      complainant: { name, contact },
      shop: shopId || undefined,
      instrument: instrumentId || undefined,
      issueType,
      description,
      photo,
    });
    res.status(201).json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/complaints  (role: admin | inspector)
export const listComplaints = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const complaints = await Complaint.find(filter).populate("shop", "shopName city").sort({ createdAt: -1 });
  res.json({ complaints });
};

// @route PATCH /api/complaints/:id  (role: admin | inspector)
export const updateComplaintStatus = async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, resolutionNotes }, { new: true });
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  res.json({ complaint });
};
