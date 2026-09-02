import express from "express";
import { verifyByQr } from "../controllers/verifyController.js";

const router = express.Router();

// Fully public - no auth. This is the endpoint the citizen QR scan hits.
router.get("/:type/:id", verifyByQr);

export default router;
