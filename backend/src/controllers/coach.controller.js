import coachConversation from "../models/CoachConversation.js";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import model from "../config/gemini.js";

export const getCoachHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversation = await coachConversation.findOne({ userId });

        if (!conversation) {
            return res.json({
                success: true,
                messages: [],
            });
        }

        res.json({
            success: true,
            messages: conversation.messages,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const chatWithCoach = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;

        if (!message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a message",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const activePlan = await Plan.findOne({
            user: userId,
            isActive: true,
        });

        let conversation = await coachConversation.findOne({ userId });

        if (!conversation) {
            conversation = new coachConversation({
                userId,
            });
        }

        const conversationHistory = conversation.messages.slice(-20).map((msg) => {
            const speaker = msg.role === "user" ? "User" : "Coach";

            return `${speaker}: ${msg.content}`;
        }).join("\n");

        const profile = user.profile || {};

        const profileContext = `
            Name: ${user.name}
            Age: ${profile.age || "Unknown"}
            Gender: ${profile.gender || "Unknown"}
            Weight: ${profile.weight || "Unknown"} kg
            Height: ${profile.height || "Unknown"} cm
            Goal: ${profile.goal || "Unknown"}
            Diet Preference: ${profile.dietPreference || "Unknown"}
            Workout Experience: ${profile.workoutExperience || "Unknown"}
            Activity Level: ${profile.activityLevel || "Unknown"}
            
        `;

        const planContext = activePlan ? `Plan Title: ${activePlan.title}
                                          Daily Clories : ${activePlan.dailyCalories}
                                          Daily Protein: ${activePlan.dailyProtein}
                                          
                                         `: "No active plan";

        const prompt = `
                        You are NutriForge Coach.

                        You are an experienced fitness and nutrition coach.

                        Your job is to help athletes stay consistent with their goals.

                        Use the athlete profile, active plan, and conversation history provided below.

                        Do not mention being an AI.

                        Keep responses practical, supportive, and actionable.

                        Avoid generic textbook explanations.

                        ATHLETE PROFILE

                        ${profileContext}

                        ACTIVE PLAN

                        ${planContext}

                        RECENT CONVERSATION

                        ${conversationHistory}

                        CURRENT MESSAGE

                        ${message}
                        `;
        
        const result = await model.generateContent(prompt);

        const coachReply = result.response.text();

        conversation.messages.push({
            role: "user",
            content: message,
        });
        conversation.messages.push({
            role: "assistant",
            content: coachReply,
        });

        conversation.lastInteractionAt = new Date();

        await conversation.save();

        res.json({
            success: true,
            coachReply,
        });


    } catch (error) {
    console.error("COACH ERROR:");
    console.error(error);

    return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
    });
}
};