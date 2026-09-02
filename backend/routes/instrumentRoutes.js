import express from "express";
import {
  addInstrument,
  getInstrumentsByShop,
  getInstrumentById,
  setInstrumentVerification,
} from "../controllers/instrumentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("user", "admin"), addInstrument);
router.get("/shop/:shopId", protect, getInstrumentsByShop);
router.get("/:id", protect, getInstrumentById);
router.patch("/:id/verify", protect, authorize("inspector"), setInstrumentVerification);

export default router;
