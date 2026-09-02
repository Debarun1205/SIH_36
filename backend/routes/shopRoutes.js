import express from "express";
import { createShop, getMyShops, getShopById, getAllShops } from "../controllers/shopController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("user"), createShop);
router.get("/mine", protect, authorize("user"), getMyShops);
router.get("/", protect, authorize("admin", "inspector"), getAllShops);
router.get("/:id", protect, getShopById);

export default router;
