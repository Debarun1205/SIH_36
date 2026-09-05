import express from "express";
import { askChatbot } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Any authenticated role can use the chatbot - the role-based data scoping
// happens inside askChatbot itself, based on req.user set by protect.
router.post("/", protect, askChatbot);

export default router;
