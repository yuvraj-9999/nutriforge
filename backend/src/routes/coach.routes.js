import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { chatWithCoach, getCoachHistory } from "../controllers/coach.controller.js";

const router = express.Router();

router.post('/chat',authMiddleware, chatWithCoach);
router.get('/history',authMiddleware, getCoachHistory);

export default router;