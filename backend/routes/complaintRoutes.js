import express from "express";
import {
  submitComplaint,
  listComplaints,
  updateComplaintStatus,
  listMyComplaints,
  trackComplaint,
} from "../controllers/complaintController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", optionalAuth, submitComplaint); // public - citizens may or may not be logged in
router.get("/mine", protect, authorize("citizen"), listMyComplaints);
router.get("/track/:id", trackComplaint); // public - lookup by reference ID, no account needed
router.get("/", protect, authorize("admin", "inspector"), listComplaints);
router.patch("/:id", protect, authorize("admin", "inspector"), updateComplaintStatus);

export default router;
