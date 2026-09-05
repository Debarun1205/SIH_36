import jwt from "jsonwebtoken";
import User from "../models/User.js";
import InspectionSlot from "../models/InspectionSlot.js";

// The only email allowed to register as a government/admin account. Anyone
// else requesting the admin role is rejected outright, not silently downgraded.
const GOV_ADMIN_EMAIL = "debarunbanerjee1205@gmail.com";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  baseLocation: user.baseLocation,
  approvalStatus: user.approvalStatus,
});

// @route POST /api/auth/register
// Handles four distinct registration paths behind one endpoint:
//  - role "user"     -> business/shop owner, open signup
//  - role "citizen"  -> consumer, open signup
//  - role "admin"    -> government official, ONLY allowed for GOV_ADMIN_EMAIL
//  - role "inspector"-> self-registration, requires baseLocation + at least
//                       one initial availability slot, and starts "pending"
//                       until a govt admin approves them
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, baseLocation, slots } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (role === "admin" && normalizedEmail !== GOV_ADMIN_EMAIL) {
      return res.status(403).json({ message: "Only authorized personnel may register as a government official" });
    }

    let finalRole = "user";
    if (role === "citizen") finalRole = "citizen";
    if (role === "admin" && normalizedEmail === GOV_ADMIN_EMAIL) finalRole = "admin";
    if (role === "inspector") finalRole = "inspector";

    if (finalRole === "inspector") {
      if (!baseLocation?.city || !baseLocation?.state) {
        return res.status(400).json({ message: "Your city and state are required to register as an inspector" });
      }
      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ message: "Please add at least one available time slot" });
      }
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      role: finalRole,
      baseLocation: finalRole === "inspector" ? baseLocation : undefined,
      approvalStatus: finalRole === "inspector" ? "pending" : "approved",
    });

    if (finalRole === "inspector") {
      await InspectionSlot.insertMany(
        slots.map((s) => ({
          inspector: user._id,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          city: baseLocation.city,
          state: baseLocation.state,
          lat: baseLocation.lat,
          lng: baseLocation.lng,
        }))
      );
    }

    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }
    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};
