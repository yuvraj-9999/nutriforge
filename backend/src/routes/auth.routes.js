import express from "express";
import { signup, login, updateProfile, getProfile } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validations/profile.validation.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/profile", authMiddleware, validate(updateProfileSchema), updateProfile);
router.get("/profile", authMiddleware, getProfile);

export default router;