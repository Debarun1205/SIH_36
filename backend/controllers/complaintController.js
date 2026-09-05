import Complaint from "../models/Complaint.js";

// @route POST /api/complaints  (public - citizens don't need an account, but
// if they're logged in as a citizen, req.user is attached via optionalAuth
// and we link the complaint to their account so they can track it later)
export const submitComplaint = async (req, res) => {
  try {
    const { name, contact, shopId, instrumentId, issueType, description, photo } = req.body;
    if (!issueType || !description) {
      return res.status(400).json({ message: "issueType and description are required" });
    }
    const complaint = await Complaint.create({
      complainant: { name: name || req.user?.name, contact: contact || req.user?.phone },
      citizen: req.user?.role === "citizen" ? req.user._id : null,
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

// @route GET /api/complaints/track/:id  (public - for citizens without an
// account who only have the reference ID shown after submitting)
export const trackComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .select("issueType status resolutionNotes createdAt shop")
      .populate("shop", "shopName city");
    if (!complaint) return res.status(404).json({ message: "No report found with that reference ID" });
    res.json({ complaint });
  } catch {
    res.status(404).json({ message: "No report found with that reference ID" });
  }
};

// @route GET /api/complaints/mine  (role: citizen)
export const listMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ citizen: req.user._id }).populate("shop", "shopName city").sort({ createdAt: -1 });
  res.json({ complaints });
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
