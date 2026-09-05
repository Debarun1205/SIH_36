import User from "../models/User.js";

// @route GET /api/admin/inspectors/pending  (role: admin)
export const listPendingInspectors = async (req, res) => {
  const inspectors = await User.find({ role: "inspector", approvalStatus: "pending" })
    .select("-password")
    .sort({ createdAt: 1 });
  res.json({ inspectors });
};

// @route PATCH /api/admin/inspectors/:id/approve  (role: admin)
export const approveInspector = async (req, res) => {
  const inspector = await User.findOneAndUpdate(
    { _id: req.params.id, role: "inspector" },
    { approvalStatus: "approved" },
    { new: true }
  ).select("-password");
  if (!inspector) return res.status(404).json({ message: "Inspector not found" });
  res.json({ inspector });
};

// @route PATCH /api/admin/inspectors/:id/reject  (role: admin)
export const rejectInspector = async (req, res) => {
  const inspector = await User.findOneAndUpdate(
    { _id: req.params.id, role: "inspector" },
    { approvalStatus: "rejected" },
    { new: true }
  ).select("-password");
  if (!inspector) return res.status(404).json({ message: "Inspector not found" });
  res.json({ inspector });
};

// @route POST /api/admin/inspectors  (role: admin)
export const createInspector = async (req, res) => {
  try {
    const { name, email, password, phone, baseLocation } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const inspector = await User.create({ name, email, password, phone, baseLocation, role: "inspector" });
    res.status(201).json({
      inspector: { id: inspector._id, name: inspector.name, email: inspector.email, baseLocation: inspector.baseLocation },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/users?role=  (role: admin)
export const listUsers = async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
  res.json({ users });
};

// @route PATCH /api/admin/users/:id/deactivate  (role: admin)
export const deactivateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
};
