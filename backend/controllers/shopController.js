import Shop from "../models/Shop.js";
import { generateQR } from "../utils/qr.js";

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
