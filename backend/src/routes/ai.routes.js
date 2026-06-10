import express from "express";
import { generatePlan, regeneratePlan, getUserPlans, getPlanById, deletePlanById, activatePlan } from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { aiRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/plans", authMiddleware, aiRateLimiter, generatePlan);
router.post("/plans/:id/regeneration", authMiddleware, aiRateLimiter, regeneratePlan);
router.get("/plans", authMiddleware, getUserPlans);
router.get("/plans/:id", authMiddleware, getPlanById);
router.delete("/plans/:id", authMiddleware, deletePlanById);
router.patch("/plans/:id/activate", authMiddleware, activatePlan);

export default router;
