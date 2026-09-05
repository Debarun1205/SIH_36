import Application from "../models/Application.js";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import Inspection from "../models/Inspection.js";
import InspectionSlot from "../models/InspectionSlot.js";
import { haversineDistance } from "../utils/distance.js";

// @route POST /api/applications  (role: user)
// The shop owner just asks to be verified - no slot picking. This queues the
// request for an admin to hand down to an inspector.
export const createApplication = async (req, res) => {
  try {
    const { shopId, notes } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this shop" });
    }

    const existing = await Application.findOne({ shop: shopId, status: "pending" });
    if (existing) {
      return res.status(409).json({ message: "There is already a pending application for this shop" });
    }

    const application = await Application.create({ shop: shopId, requestedBy: req.user._id, notes });
    shop.complianceStatus = "pending";
    await shop.save();

    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/applications/mine  (role: user)
export const getMyApplications = async (req, res) => {
  const shops = await Shop.find({ owner: req.user._id }).select("_id");
  const applications = await Application.find({ shop: { $in: shops.map((s) => s._id) } })
    .populate("shop", "shopName city state")
    .populate({ path: "assignedInspection", populate: [{ path: "inspector", select: "name phone" }, { path: "slot" }] })
    .sort({ createdAt: -1 });
  res.json({ applications });
};

// @route GET /api/applications/pending  (role: admin)
export const listPendingApplications = async (req, res) => {
  const applications = await Application.find({ status: "pending" })
    .populate("shop", "shopName city state location")
    .populate("requestedBy", "name phone")
    .sort({ createdAt: 1 }); // oldest first - first come, first served
  res.json({ applications });
};

// @route GET /api/applications/:id/suggest-inspectors  (role: admin)
// Ranks inspectors by distance from the shop (or same city/state if no
// coordinates) and by current workload (fewer upcoming inspections = higher
// priority), so an admin can hand the task down to whoever makes the most
// operational sense - not just whoever happens to be first alphabetically.
export const suggestInspectors = async (req, res) => {
  const application = await Application.findById(req.params.id).populate("shop");
  if (!application) return res.status(404).json({ message: "Application not found" });
  const shop = application.shop;

  const inspectors = await User.find({ role: "inspector", isActive: true });

  const workloadByInspector = {};
  const upcoming = await Inspection.find({ status: "scheduled" });
  upcoming.forEach((i) => {
    const id = i.inspector.toString();
    workloadByInspector[id] = (workloadByInspector[id] || 0) + 1;
  });

  const ranked = inspectors
    .map((insp) => {
      const distanceKm = haversineDistance(
        shop.location?.lat,
        shop.location?.lng,
        insp.baseLocation?.lat,
        insp.baseLocation?.lng
      );
      const sameCity = insp.baseLocation?.city && insp.baseLocation.city.toLowerCase() === shop.city.toLowerCase();
      return {
        inspector: { id: insp._id, name: insp.name, email: insp.email, phone: insp.phone, baseLocation: insp.baseLocation },
        distanceKm,
        sameCity,
        currentWorkload: workloadByInspector[insp._id.toString()] || 0,
      };
    })
    // prioritize: same city first, then known distance, then lower workload
    .sort((a, b) => {
      if (a.sameCity !== b.sameCity) return a.sameCity ? -1 : 1;
      const da = a.distanceKm ?? Infinity;
      const db = b.distanceKm ?? Infinity;
      if (da !== db) return da - db;
      return a.currentWorkload - b.currentWorkload;
    });

  res.json({ shop, ranked });
};

// @route POST /api/applications/:id/assign  (role: admin)
// Hands the application down to a specific inspector at a specific date/time -
// creates the slot (pre-booked) and the Inspection record in one step.
export const assignInspector = async (req, res) => {
  try {
    const { inspectorId, date, startTime, endTime } = req.body;
    const application = await Application.findById(req.params.id).populate("shop");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "pending") {
      return res.status(409).json({ message: "This application has already been handled" });
    }
    const shop = application.shop;

    const slot = await InspectionSlot.create({
      inspector: inspectorId,
      date,
      startTime,
      endTime,
      city: shop.city,
      state: shop.state,
      lat: shop.location?.lat,
      lng: shop.location?.lng,
      isBooked: true,
      shop: shop._id,
    });

    const inspection = await Inspection.create({
      shop: shop._id,
      inspector: inspectorId,
      slot: slot._id,
    });

    application.status = "assigned";
    application.assignedInspection = inspection._id;
    await application.save();

    res.status(201).json({ application, inspection, slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
