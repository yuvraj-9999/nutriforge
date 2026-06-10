import { z } from "zod";

export const updateProfileSchema = z.object({
    age: z.number().min(13).max(100).optional(),

    gender: z.enum(["male", "female"]).optional(),

    weight: z.number().min(25).max(300).optional(),

    height: z.number().min(100).max(300).optional(),

    activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active"]).optional(),

    goal: z.enum(["muscle_gain", "fat_loss", "maintenance"]).optional(),

    dietPreference: z.enum(["vegetarian", "non_vegetarian", "vegan"]).optional(),

    workoutExperience: z.enum(["beginner", "intermediate", "advanced"]).optional(),

    workoutDaysPerWeek: z.number().min(1).max(7).optional(),

    preferredWorkoutLocation: z.enum(["gym", "home"]).optional(),

    foodAllergies: z.array(z.string()).optional(),
});