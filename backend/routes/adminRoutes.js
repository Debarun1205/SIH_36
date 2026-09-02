import express from "express";
import { createInspector, listUsers, deactivateUser } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.post("/inspectors", createInspector);
router.get("/users", listUsers);
router.patch("/users/:id/deactivate", deactivateUser);

export default router;
