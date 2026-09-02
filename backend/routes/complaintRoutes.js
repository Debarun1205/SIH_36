import express from "express";
import { submitComplaint, listComplaints, updateComplaintStatus } from "../controllers/complaintController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", submitComplaint); // public - citizens may not have an account
router.get("/", protect, authorize("admin", "inspector"), listComplaints);
router.patch("/:id", protect, authorize("admin", "inspector"), updateComplaintStatus);

export default router;
