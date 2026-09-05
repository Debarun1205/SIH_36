import InspectionSlot from "../models/InspectionSlot.js";
import User from "../models/User.js";
import { haversineDistance } from "../utils/distance.js";

// @route POST /api/slots  (role: inspector)
export const createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, city, state, lat, lng } = req.body;
    if (!date || !startTime || !endTime || !city || !state) {
      return res.status(400).json({ message: "date, startTime, endTime, city and state are required" });
    }
    const slot = await InspectionSlot.create({
      inspector: req.user._id,
      date,
      startTime,
      endTime,
      city,
      state,
      lat,
      lng,
    });
    res.status(201).json({ slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/slots/mine  (role: inspector)
export const getMySlots = async (req, res) => {
  const slots = await InspectionSlot.find({ inspector: req.user._id })
    .populate("shop", "shopName city")
    .sort({ date: 1, startTime: 1 });
  res.json({ slots });
};

// @route GET /api/slots/available?city=&state=&lat=&lng=
// Returns open slots, nearest-first when lat/lng are supplied (simple
// location-aware matching so shop owners get inspectors close to them).
export const getAvailableSlots = async (req, res) => {
  const { city, state, lat, lng } = req.query;
  const approvedInspectorIds = await User.find({ role: "inspector", approvalStatus: "approved" }).select("_id");
  const filter = {
    isBooked: false,
    date: { $gte: new Date(new Date().toDateString()) },
    inspector: { $in: approvedInspectorIds.map((i) => i._id) },
  };
  if (city) filter.city = city;
  if (state) filter.state = state;

  let slots = await InspectionSlot.find(filter)
    .populate("inspector", "name email phone baseLocation")
    .sort({ date: 1, startTime: 1 });

  if (lat && lng) {
    slots = slots
      .map((s) => ({
        slot: s,
        distanceKm: haversineDistance(parseFloat(lat), parseFloat(lng), s.lat, s.lng),
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .map((x) => ({ ...x.slot.toObject(), distanceKm: x.distanceKm }));
  }

  res.json({ slots });
};
