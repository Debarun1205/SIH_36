import express from "express";
import {
  createShop,
  getMyShops,
  getShopById,
  getAllShops,
  getNearbyShops,
  getShopsNeedingInspection,
} from "../controllers/shopController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("user"), createShop);
router.get("/mine", protect, authorize("user"), getMyShops);
router.get("/nearby", getNearbyShops); // public - citizens browsing, no account needed
router.get("/needing-inspection", protect, authorize("inspector"), getShopsNeedingInspection);
router.get("/", protect, authorize("admin", "inspector"), getAllShops);
router.get("/:id", protect, getShopById);

export default router;
