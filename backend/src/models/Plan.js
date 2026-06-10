import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
        },

        summary: {
            type: String,
            trim: true,
            maxlength: 180,
        },

        dailyCalories: {
            type: Number,
            required: true,
        },

        dailyProtein: {
            type: Number,
            required: true,
        },

        workoutPlan : [
            {
                day: String,
                focus: String,
                exercises: [String],
            },
        ],

        mealSuggestions : [mongoose.Schema.Types.Mixed],

        recommendations : [String],

        isActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;