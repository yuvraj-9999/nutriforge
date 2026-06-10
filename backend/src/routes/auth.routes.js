import express from "express";
import { signup, login, updateProfile, getProfile, testAI } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validations/profile.validation.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

router.put("/profile", authMiddleware, validate(updateProfileSchema),updateProfile);

router.get("/profile", authMiddleware, getProfile);

router.get("/test-ai", testAI);

export default router;