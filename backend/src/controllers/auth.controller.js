import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import model from "../config/gemini.js";
import crypto from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        });

        const verificationLink = `${process.env.APP_URL}/verify-email/${verificationToken}`;

        const emailResponse = await sendVerificationEmail(
            user.email,
            user.name,
            verificationLink
        );

        if (emailResponse.error) {
            console.error(emailResponse.error);

            return res.status(500).json({
                success: false,
                message: "Failed to send verification email.",
            });
        }

        res.status(201).json({
            message: "Account created successfully! Please check your email to verify your account before signing in.",
            user,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid creadentials",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Email not verified. Please verify your email.",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profile: req.validatedData,
            },
            {
                new: true,
            }
        );

        res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        })
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select("-password");

        res.json({
            message: "Profile fetched successfully",
            user,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        if (!email || typeof email !== "string") {
            return res.status(400).json({
                success: false,
                message: "Valid email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });
        if (!user) {
            return res.json({
                success: true,
                message: "If an account with this email exists, a password reset link has been sent."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");


        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink = `${process.env.APP_URL}/reset-password/${resetToken}`;

        const emailResponse = await sendPasswordResetEmail(user.email, user.name, resetLink);

        if (emailResponse.error) {
            console.error(emailResponse.error);

            return res.status(500).json({
                success: false,
                message: "Failed to send password reset email.",
            });
        }

        return res.json({
            success: true,
            message: "If an account with this email exists, a password reset link has been sent.",
        });


    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired password reset token",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return res.json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to reset password.",
        });
    }
}

export const testAI = async (req, res) => {
    try {
        const result = await model.generateContent("Say hello in one sentence");
        const response = result.response.text();
        res.json({ response });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification link",
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        return res.json({
            success: true,
            message: "Email verification successful",
        })
    } catch (error) {
        console.error("VERIFY EMAIL ERROR:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify email",
        })
    }
};