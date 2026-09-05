import express from "express";
import {
  createApplication,
  getMyApplications,
  listPendingApplications,
  suggestInspectors,
  assignInspector,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("user"), createApplication);
router.get("/mine", protect, authorize("user"), getMyApplications);
router.get("/pending", protect, authorize("admin"), listPendingApplications);
router.get("/:id/suggest-inspectors", protect, authorize("admin"), suggestInspectors);
router.post("/:id/assign", protect, authorize("admin"), assignInspector);

export default router;
