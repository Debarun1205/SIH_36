import express from "express";
import { createSlot, getMySlots, getAvailableSlots } from "../controllers/slotController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("inspector"), createSlot);
router.get("/mine", protect, authorize("inspector"), getMySlots);
router.get("/available", protect, authorize("user"), getAvailableSlots);

export default router;
