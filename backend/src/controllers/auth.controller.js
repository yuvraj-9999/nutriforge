import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import model from "../config/gemini.js";
import { updateProfileSchema } from "../validations/profile.validation.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User created successfully",
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

export const testAI = async (req, res) => {
    try {

        const result = await model.generateContent(
            "Say hello in one sentence"
        );

        const response = result.response.text();

        res.json({
            response,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message,
        });

    }
};