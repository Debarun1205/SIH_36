import Product from "../models/Product.js";
import Shop from "../models/Shop.js";

// @route POST /api/products  (role: user, must own the shop)
export const addProduct = async (req, res) => {
  try {
    const { shopId, name, category, price, unit, description } = req.body;
    if (!shopId || !name) {
      return res.status(400).json({ message: "shopId and name are required" });
    }
    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not own this shop" });
    }

    const product = await Product.create({ shop: shopId, name, category, price, unit, description });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/products/shop/:shopId  (public - citizens browsing a shop need this)
export const getProductsByShop = async (req, res) => {
  const products = await Product.find({ shop: req.params.shopId }).sort({ category: 1, name: 1 });
  res.json({ products });
};

// @route DELETE /api/products/:id  (role: user, must own the parent shop)
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("shop");
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (product.shop.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You do not own this shop" });
  }
  await product.deleteOne();
  res.json({ deleted: true });
};
