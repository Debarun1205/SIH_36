import express from "express";
import {
  bookInspection,
  getMyInspections,
  completeInspection,
  getAnalytics,
  getReviewQueue,
  getVerificationTrends,
} from "../controllers/inspectionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/book", protect, authorize("user"), bookInspection);
router.get("/mine", protect, authorize("user", "inspector"), getMyInspections);
router.patch("/:id/complete", protect, authorize("inspector"), completeInspection);
router.get("/analytics", protect, authorize("admin"), getAnalytics);
router.get("/review-queue", protect, authorize("admin"), getReviewQueue);
router.get("/trends", protect, authorize("admin"), getVerificationTrends);

export default router;
