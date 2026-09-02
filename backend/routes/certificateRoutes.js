import express from "express";
import { getCertificatesByShop, getCertificateById } from "../controllers/certificateController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/shop/:shopId", protect, getCertificatesByShop);
router.get("/:certificateId", protect, getCertificateById);

export default router;
