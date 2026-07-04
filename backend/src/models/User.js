import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },
        profile: {

            age: {
                type: Number,
            },

            gender: {
                type: String,
                enum: ["male", "female"],
            },

            weight: {
                type: Number,
            },

            height: {
                type: Number,
            },

            activityLevel: {
                type: String,
                enum: ["sedentary", "lightly_active", "moderately_active", "very_active"],
            },

            goal: {
                type: String,
                enum: ["muscle_gain", "fat_loss", "maintenance"],
            },

            dietPreference: {
                type: String,
                enum: ["vegetarian", "non_vegetarian", "vegan"],
            },

            bodyFatPercentage: {
                type: Number,
            },
            workoutExperience: {
                type: String,
                enum: [
                    "beginner",
                    "intermediate",
                    "advanced"
                ],
            },

            workoutDaysPerWeek: {
                type: Number,
            },

            preferredWorkoutLocation: {
                type: String,
                enum: [
                    "gym",
                    "home"
                ],
            },

            foodAllergies: {
                type: [String],
                default: [],
            },

        },

        passwordResetToken: {
            type: String,
        },

        passwordResetExpires: {
            type: Date
        },

    },
    { timestamps: true }

);

const User = mongoose.model("User", userSchema);

export default User;