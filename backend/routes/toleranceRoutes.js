import express from "express";
import { upsertToleranceRule, listToleranceRules } from "../controllers/toleranceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, listToleranceRules);
router.post("/", protect, authorize("admin"), upsertToleranceRule);

export default router;
