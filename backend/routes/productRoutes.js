import express from "express";
import { addProduct, getProductsByShop, deleteProduct } from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("user"), addProduct);
router.get("/shop/:shopId", getProductsByShop); // public - citizens browsing a shop
router.delete("/:id", protect, authorize("user"), deleteProduct);

export default router;
