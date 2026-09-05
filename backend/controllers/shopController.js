import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import { generateQR } from "../utils/qr.js";
import { haversineDistance } from "../utils/distance.js";

// @route POST /api/shops  (role: user)
export const createShop = async (req, res) => {
  try {
    const { shopName, category, licenseNumber, address, city, state, pincode, lat, lng } = req.body;
    if (!shopName || !address || !city || !state) {
      return res.status(400).json({ message: "shopName, address, city and state are required" });
    }

    const shop = await Shop.create({
      owner: req.user._id,
      shopName,
      category,
      licenseNumber,
      address,
      city,
      state,
      pincode,
      location: { lat, lng },
    });

    shop.qrCode = await generateQR("shop", shop.qrId);
    await shop.save();

    res.status(201).json({ shop });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/shops/mine  (role: user)
export const getMyShops = async (req, res) => {
  const shops = await Shop.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ shops });
};

// @route GET /api/shops/:id
export const getShopById = async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate("owner", "name email phone");
  if (!shop) return res.status(404).json({ message: "Shop not found" });
  res.json({ shop });
};

// @route GET /api/shops/nearby?lat=&lng=&city=&state=  (public - citizens browsing,
// no account needed; only public-safe fields are returned, matching the
// "citizens verify without accessing private records" principle)
export const getNearbyShops = async (req, res) => {
  const { lat, lng, city, state } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (state) filter.state = state;

  const shops = await Shop.find(filter).select(
    "shopName category address city state location complianceStatus qrId qrCode"
  );

  const withProductCounts = await Promise.all(
    shops.map(async (s) => {
      const productCount = await Product.countDocuments({ shop: s._id });
      const distanceKm =
        lat && lng ? haversineDistance(parseFloat(lat), parseFloat(lng), s.location?.lat, s.location?.lng) : null;
      return { ...s.toObject(), productCount, distanceKm };
    })
  );

  if (lat && lng) {
    withProductCounts.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }

  res.json({ shops: withProductCounts });
};

// @route GET /api/shops/needing-inspection  (role: inspector)
// Shops that haven't been verified yet (or failed and need re-inspection),
// sorted by distance from this inspector's own base location, for the
// self-serve "pick a shop to inspect yourself" flow.
export const getShopsNeedingInspection = async (req, res) => {
  const shops = await Shop.find({ complianceStatus: { $in: ["unverified", "non-compliant"] } });
  const base = req.user.baseLocation;

  const withDistance = shops.map((s) => {
    const distanceKm = haversineDistance(base?.lat, base?.lng, s.location?.lat, s.location?.lng);
    const sameCity = base?.city && base.city.toLowerCase() === s.city.toLowerCase();
    return { ...s.toObject(), distanceKm, sameCity };
  });

  withDistance.sort((a, b) => {
    if (a.sameCity !== b.sameCity) return a.sameCity ? -1 : 1;
    return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
  });

  res.json({ shops: withDistance });
};

// @route GET /api/shops  (role: admin | inspector)
export const getAllShops = async (req, res) => {
  const { city, state, complianceStatus } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (state) filter.state = state;
  if (complianceStatus) filter.complianceStatus = complianceStatus;

  const shops = await Shop.find(filter).populate("owner", "name email phone").sort({ createdAt: -1 });
  res.json({ shops });
};
