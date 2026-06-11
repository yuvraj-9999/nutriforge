import User from "../models/User.js";
import Plan from "../models/Plan.js";
import model from "../config/gemini.js";
import { calculateCalories, calculateProtein } from "../utils/fitnessCalculations.js";

const isDietaryCompliant = (text, dietPreference) => {
  if (!text) return true;
  let lower = text.toLowerCase();
  
  // Clean suffix/prefix modifiers like "-free" or "non-" that negate the ingredient
  lower = lower.replace(/\b(whey|egg|eggs|dairy|meat|milk|chicken|beef|pork|fish|seafood|gelatin|honey)-free\b/g, '');
  lower = lower.replace(/\bnon-dairy\b/g, '');
  
  // Vegetarian check: strictly forbidden meats
  const forbiddenMeat = /\b(chicken|turkey|beef|pork|fish|seafood|meat|bacon|ham|steak|salmon|tuna|shrimp|prawn|lobster|crab|anchovy|sardine|sausage|pepperoni|salami)\b/i;
  if (dietPreference === "vegetarian" || dietPreference === "vegan") {
    if (forbiddenMeat.test(lower)) {
      return false;
    }
  }
  
  // Vegan check: forbidden dairy, eggs, whey, honey, and yogurt/cheese/butter/milk (unless plant-based)
  if (dietPreference === "vegan") {
    // Eggs, whey, honey are forbidden (unless explicitly prefixed with vegan)
    const cleanEggsWheyHoney = lower.replace(/\bvegan\s+(eggs?|honey)\b/g, '');
    if (/\b(egg|eggs|whey|honey)\b/i.test(cleanEggsWheyHoney)) {
      return false;
    }
    
    // Dairy word itself is strictly forbidden
    if (/\bdairy\b/i.test(lower)) {
      return false;
    }
    
    // Yogurt: forbidden unless vegan/coconut/soy/almond/oat/plant-based
    const cleanYogurt = lower.replace(/\b(vegan|coconut|soy|almond|oat|plant-based)\s+yogurt\b/g, '');
    if (/\byogurt\b/i.test(cleanYogurt)) {
      return false;
    }
    
    // Cheese: forbidden unless vegan/coconut/soy/almond/cashew/plant-based
    const cleanCheese = lower.replace(/\b(vegan|coconut|soy|almond|cashew|plant-based)\s+cheese\b/g, '');
    if (/\bcheese\b/i.test(cleanCheese)) {
      return false;
    }
    
    // Butter: forbidden unless peanut/almond/cashew/sunflower/seed/cocoa/coconut/vegan/apple/cookie/pecan/hazelnut/nut/plant-based
    const cleanButter = lower.replace(/\b(peanut|almond|cashew|sunflower|seed|cocoa|coconut|vegan|apple|cookie|pecan|hazelnut|nut|plant-based)\s+butter\b/g, '');
    if (/\bbutter\b/i.test(cleanButter)) {
      return false;
    }
    
    // Milk: forbidden unless plant milk (soy/almond/oat/coconut/cashew/vegan/plant/rice/pea/hemp/macadamia/dairy-free)
    const cleanMilk = lower.replace(/\b(soy|almond|oat|coconut|cashew|vegan|plant|rice|pea|hemp|macadamia|dairy-free)\s+milk\b/g, '');
    if (/\bmilk\b/i.test(cleanMilk)) {
      return false;
    }
  }
  
  return true;
};

const validatePlanDiet = (plan, dietPreference) => {
  if (!plan || !Array.isArray(plan.mealSuggestions)) {
    return false;
  }
  for (const meal of plan.mealSuggestions) {
    if (!meal) continue;
    const title = meal.title || "";
    const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : [];
    
    if (!isDietaryCompliant(title, dietPreference)) {
      console.warn(`[Diet Validation] Rejected plan: title "${title}" is not compliant with ${dietPreference}`);
      return false;
    }
    for (const ing of ingredients) {
      if (!isDietaryCompliant(ing, dietPreference)) {
        console.warn(`[Diet Validation] Rejected plan: ingredient "${ing}" is not compliant with ${dietPreference}`);
        return false;
      }
    }
  }
  return true;
};

const formatPlanForClient = (plan) => {
  if (!plan) return null;
  const planObj = plan.toObject ? plan.toObject() : plan;
  
  planObj.title = planObj.title || "Performance System";
  planObj.summary = planObj.summary || "Precision nutrition and recovery protocol.";
  
  if (Array.isArray(planObj.mealSuggestions)) {
    planObj.mealSuggestions = planObj.mealSuggestions.map((meal, idx) => {
      if (!meal) return null;
      if (typeof meal === "string") {
        const colonIdx = meal.indexOf(":");
        let type = "Meal Option";
        let title = meal;
        if (colonIdx !== -1) {
          type = meal.substring(0, colonIdx).trim();
          title = meal.substring(colonIdx + 1).trim();
        }
        const fallbackTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
        const mealType = idx < 4 ? fallbackTypes[idx] : type;
        
        return {
          mealType,
          title,
          ingredients: [],
          macros: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
          }
        };
      }
      return {
        mealType: meal.mealType || "Meal Option",
        title: meal.title || "",
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        macros: meal.macros || { calories: 0, protein: 0, carbs: 0, fats: 0 }
      };
    }).filter(Boolean);
  }
  return planObj;
};


export const generatePlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user.profile?.age || !user.profile?.weight || !user.profile?.height || !user.profile?.goal) {
      return res.status(400).json({
        message: "Please complete your profile first",
      });
    }

    // Safe profile metric fallbacks to prevent NaN calculations and empty slots
    const gender = user.profile.gender || "male";
    const activityLevel = user.profile.activityLevel || "moderately_active";
    const dietPreference = user.profile.dietPreference || "non_vegetarian";
    const workoutExperience = user.profile.workoutExperience || "intermediate";
    const workoutDaysPerWeek = user.profile.workoutDaysPerWeek || 3;
    const preferredWorkoutLocation = user.profile.preferredWorkoutLocation || "gym";
    const foodAllergies = user.profile.foodAllergies || [];

    const caloriesTarget = calculateCalories(
      user.profile.weight,
      user.profile.height,
      user.profile.age,
      gender,
      activityLevel,
      user.profile.goal
    );

    const proteinTarget = calculateProtein(
      user.profile.weight,
      user.profile.goal
    );

    const prompt = `
You are precision fitness coaching software designed to generate high-performance athletic nutrition and training blueprints.
Do not write conversational blogging text, friendly greetings, or optional qualifiers. Be concise, structured, and focused purely on performance.

User Metrics & Goals:
- Age: ${user.profile.age}
- Gender: ${gender}
- Weight: ${user.profile.weight} kg
- Height: ${user.profile.height} cm
- Goal: ${user.profile.goal}
- Activity Level: ${activityLevel}
- Diet Preference: ${dietPreference}
- Workout Experience: ${workoutExperience}
- Workout Days Per Week: ${workoutDaysPerWeek}
- Preferred Workout Location: ${preferredWorkoutLocation}
- Food Allergies: ${foodAllergies.join(", ") || "None"}

Targets:
- Daily Calories: Target is ${caloriesTarget} kcal. The sum of calories in all generated meals must equal approximately ${caloriesTarget} kcal (allowable variance ±50 kcal).
- Daily Protein: Target is ${proteinTarget}g. The sum of protein in all generated meals must equal approximately ${proteinTarget}g (allowable variance ±5g).

STRICT DIETARY INTEGRITY RULES (Violation will reject the generation):
The user's diet preference is: ${dietPreference}
Strictly adhere to these requirements:
${dietPreference === "vegetarian" ? `
- Vegetarian Diet:
  - NEVER include chicken, turkey, beef, pork, fish, seafood, or any meat/animal flesh products.
  - Dairy, eggs, and whey are permitted.
` : ""}
${dietPreference === "vegan" ? `
- Vegan Diet:
  - NEVER include chicken, turkey, beef, pork, fish, seafood, or any meat/animal flesh products.
  - NEVER include dairy, milk (unless plant-based like almond/soy milk), cheese (unless vegan cheese), butter (unless plant-based/nut butter like peanut butter), eggs, yogurt (unless plant-based), whey, or honey.
  - All foods must be 100% plant-based.
` : ""}
- Food Allergies: NEVER include any ingredients containing or relating to: ${foodAllergies.join(", ") || "None"}.

PLAN META INSTRUCTIONS:
- You MUST generate a premium short-form plan title. It must be 2 to 5 words maximum, sound like an elite athletic protocol/system, reflect the user's specific goals and diet style, and strictly avoid generic words like "Performance Plan", "Diet Plan", "Workout Plan", "Blueprint", or "Program".
- You MUST generate a concise plan summary/subtitle. It must be one concise sentence, describe the strategy/focus of the plan, and sound professional and performance-oriented (e.g., "High-protein hypertrophy nutrition system optimized for lean muscle recovery.").

MEAL INSTRUCTIONS:
- Every meal MUST include concise, performance-focused, and athletic naming (e.g., 'Recovery Yogurt Bowl', 'High Protein Tofu Wrap', 'Post-Workout Recovery Plate'). Avoid vague or conversational descriptions like 'Greek yogurt with fruit if preferred'.
- Every single meal ingredient MUST contain a precise, measurable, and trackable quantity (e.g., grams (g), milliliters (ml), exact serving counts, scoop counts). Avoid vague, non-trackable qualifiers like 'some almonds', 'handful of nuts', 'if preferred', 'if dairy is okay', or 'optional'.
- Every meal suggestion MUST be a structured object containing: mealType, title, ingredients (array of strings), and macros (calories, protein, carbs, fats).
- You must generate a total of 4 meals (e.g., Breakfast, Lunch, Dinner, Snack).

Return ONLY valid JSON in this exact structure:

{
  "title": "Elite Athletic Protocol Title",
  "summary": "One-sentence strategy/focus of the plan.",
  "dailyCalories": ${caloriesTarget},
  "dailyProtein": ${proteinTarget},
  "workoutPlan": [
    {
      "day": "Day 1",
      "focus": "workout focus description",
      "exercises": [
        "Exercise Name: sets x reps (e.g., Bench Press: 4 sets x 8 reps)"
      ]
    }
  ],
  "mealSuggestions": [
    {
      "mealType": "Breakfast",
      "title": "Protein Oat Bowl",
      "ingredients": [
        "80g rolled oats",
        "250ml soy milk",
        "1 scoop vegan protein",
        "100g berries",
        "15g almonds"
      ],
      "macros": {
        "calories": 620,
        "protein": 38,
        "carbs": 61,
        "fats": 18
      }
    }
  ],
  "recommendations": [
    "precise performance guideline string"
  ]
}
`;

    let attempts = 0;
    const maxAttempts = 3;
    let plan = null;
    let savedPlan = null;
    let dailyCalories, dailyProtein, workoutPlan, mealSuggestions, recommendations, title, summary;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[AI Generation] Attempt ${attempts} of ${maxAttempts} for user ${userId} (${dietPreference})`);
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const cleanedResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonStart = cleanedResponse.indexOf("{");
      const jsonEnd = cleanedResponse.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        if (attempts >= maxAttempts) {
          throw new Error("AI did not return a valid JSON block. Raw output: " + response.substring(0, 100));
        }
        continue;
      }

      const jsonString = cleanedResponse.slice(jsonStart, jsonEnd + 1);
      try {
        plan = JSON.parse(jsonString);
      } catch (err) {
        if (attempts >= maxAttempts) {
          throw new Error("AI did not return a valid parsable JSON. Error: " + err.message);
        }
        continue;
      }

      title = (plan.title || "").trim();
      summary = (plan.summary || "").trim();

      if (!title) {
        title = "Performance System";
      } else {
        if (title.length > 60) {
          title = title.substring(0, 60).trim();
        }
      }

      if (!summary) {
        summary = "Precision nutrition and recovery protocol.";
      } else {
        if (summary.length > 180) {
          summary = summary.substring(0, 180).trim();
        }
      }

      dailyCalories = Number(plan.dailyCalories) || caloriesTarget;
      dailyProtein = Number(plan.dailyProtein) || proteinTarget;
      workoutPlan = Array.isArray(plan.workoutPlan)
        ? plan.workoutPlan.map((w) => ({
            day: String(w.day || ""),
            focus: String(w.focus || ""),
            exercises: Array.isArray(w.exercises) ? w.exercises.map(String) : [],
          }))
        : [];
      
      const rawMealSuggestions = Array.isArray(plan.mealSuggestions)
        ? plan.mealSuggestions.map((m) => {
            if (typeof m === "string") {
              const colonIdx = m.indexOf(":");
              let type = "Meal Option";
              let title = m;
              if (colonIdx !== -1) {
                type = m.substring(0, colonIdx).trim();
                title = m.substring(colonIdx + 1).trim();
              }
              return {
                mealType: type,
                title: title,
                ingredients: [],
                macros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
              };
            }
            return {
              mealType: String(m.mealType || ""),
              title: String(m.title || ""),
              ingredients: Array.isArray(m.ingredients) ? m.ingredients.map(String) : [],
              macros: {
                calories: Number(m.macros?.calories || 0),
                protein: Number(m.macros?.protein || 0),
                carbs: Number(m.macros?.carbs || 0),
                fats: Number(m.macros?.fats || 0),
              }
            };
          })
        : [];

      recommendations = Array.isArray(plan.recommendations)
        ? plan.recommendations.map(String)
        : [];

      const mockPlanObj = { mealSuggestions: rawMealSuggestions };
      if (validatePlanDiet(mockPlanObj, dietPreference)) {
        mealSuggestions = rawMealSuggestions;
        break;
      } else {
        console.warn(`[Diet Validation] Attempt ${attempts} failed validation checks.`);
        if (attempts >= maxAttempts) {
          return res.status(422).json({
            success: false,
            message: "Generated plan failed dietary integrity checks after multiple attempts."
          });
        }
      }
    }

    const planCount = await Plan.countDocuments({ user: userId });
    const isFirstPlan = planCount === 0;

    savedPlan = await Plan.create({
      user: userId,
      title,
      summary,
      dailyCalories,
      dailyProtein,
      workoutPlan,
      mealSuggestions,
      recommendations,
      isActive: isFirstPlan,
    });

    res.json({
      success: true,
      plan: formatPlanForClient(savedPlan),
    });

  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserPlans = async (req, res) => {
  try {
    const userId = req.user.userId;

    const plans = await Plan.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    const formattedPlans = plans.map(formatPlanForClient);

    res.json({
      success: true,
      count: formattedPlans.length,
      plans: formattedPlans,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await Plan.findOne({
      _id: id,
      user: userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      plan: formatPlanForClient(plan),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    });
  }
};

export const deletePlanById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await Plan.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    if (plan.isActive) {
      const nextPlan = await Plan.findOne({
        user: userId
      }).sort({ createdAt: -1 });

      if (nextPlan) {
        nextPlan.isActive = true;
        await nextPlan.save();
      }
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    });
  }
};

export const regeneratePlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existingPlan = await Plan.findOne({
      _id: id,
      user: userId,
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const user = await User.findById(userId);

    // Safe profile metric fallbacks to prevent NaN calculations and empty slots
    const gender = user.profile.gender || "male";
    const activityLevel = user.profile.activityLevel || "moderately_active";
    const dietPreference = user.profile.dietPreference || "non_vegetarian";
    const workoutExperience = user.profile.workoutExperience || "intermediate";
    const workoutDaysPerWeek = user.profile.workoutDaysPerWeek || 3;
    const preferredWorkoutLocation = user.profile.preferredWorkoutLocation || "gym";
    const foodAllergies = user.profile.foodAllergies || [];

    const caloriesTarget = calculateCalories(
      user.profile.weight,
      user.profile.height,
      user.profile.age,
      gender,
      activityLevel,
      user.profile.goal
    );

    const proteinTarget = calculateProtein(
      user.profile.weight,
      user.profile.goal
    );

    const prompt = `
You are precision fitness coaching software designed to generate an ALTERNATIVE high-performance athletic nutrition and training blueprint.
Do not write conversational blogging text, friendly greetings, or optional qualifiers. Be concise, structured, and focused purely on performance.
Create DIFFERENT workouts and meals than the current focus areas:
${existingPlan.workoutPlan.map((day) => `${day.day}: ${day.focus}`).join("\n")}

User Metrics & Goals:
- Age: ${user.profile.age}
- Gender: ${gender}
- Weight: ${user.profile.weight} kg
- Height: ${user.profile.height} cm
- Goal: ${user.profile.goal}
- Activity Level: ${activityLevel}
- Diet Preference: ${dietPreference}
- Workout Experience: ${workoutExperience}
- Workout Days Per Week: ${workoutDaysPerWeek}
- Preferred Workout Location: ${preferredWorkoutLocation}
- Food Allergies: ${foodAllergies.join(", ") || "None"}

Targets:
- Daily Calories: Target is ${caloriesTarget} kcal. The sum of calories in all generated meals must equal approximately ${caloriesTarget} kcal (allowable variance ±50 kcal).
- Daily Protein: Target is ${proteinTarget}g. The sum of protein in all generated meals must equal approximately ${proteinTarget}g (allowable variance ±5g).

STRICT DIETARY INTEGRITY RULES (Violation will reject the generation):
The user's diet preference is: ${dietPreference}
Strictly adhere to these requirements:
${dietPreference === "vegetarian" ? `
- Vegetarian Diet:
  - NEVER include chicken, turkey, beef, pork, fish, seafood, or any meat/animal flesh products.
  - Dairy, eggs, and whey are permitted.
` : ""}
${dietPreference === "vegan" ? `
- Vegan Diet:
  - NEVER include chicken, turkey, beef, pork, fish, seafood, or any meat/animal flesh products.
  - NEVER include dairy, milk (unless plant-based like almond/soy milk), cheese (unless vegan cheese), butter (unless plant-based/nut butter like peanut butter), eggs, yogurt (unless plant-based), whey, or honey.
  - All foods must be 100% plant-based.
` : ""}
- Food Allergies: NEVER include any ingredients containing or relating to: ${foodAllergies.join(", ") || "None"}.

PLAN META INSTRUCTIONS:
- You MUST generate a premium short-form plan title. It must be 2 to 5 words maximum, sound like an elite athletic protocol/system, reflect the user's specific goals and diet style, and strictly avoid generic words like "Performance Plan", "Diet Plan", "Workout Plan", "Blueprint", or "Program".
- You MUST generate a concise plan summary/subtitle. It must be one concise sentence, describe the strategy/focus of the plan, and sound professional and performance-oriented (e.g., "High-protein hypertrophy nutrition system optimized for lean muscle recovery.").

MEAL INSTRUCTIONS:
- Every meal MUST include concise, performance-focused, and athletic naming (e.g., 'Recovery Yogurt Bowl', 'High Protein Tofu Wrap', 'Post-Workout Recovery Plate'). Avoid vague or conversational descriptions like 'Greek yogurt with fruit if preferred'.
- Every single meal ingredient MUST contain a precise, measurable, and trackable quantity (e.g., grams (g), milliliters (ml), exact serving counts, scoop counts). Avoid vague, non-trackable qualifiers like 'some almonds', 'handful of nuts', 'if preferred', 'if dairy is okay', or 'optional'.
- Every meal suggestion MUST be a structured object containing: mealType, title, ingredients (array of strings), and macros (calories, protein, carbs, fats).
- You must generate a total of 4 meals (e.g., Breakfast, Lunch, Dinner, Snack).

Return ONLY valid JSON in this exact structure:

{
  "title": "Elite Athletic Protocol Title",
  "summary": "One-sentence strategy/focus of the plan.",
  "dailyCalories": ${caloriesTarget},
  "dailyProtein": ${proteinTarget},
  "workoutPlan": [
    {
      "day": "Day 1",
      "focus": "workout focus description",
      "exercises": [
        "Exercise Name: sets x reps (e.g., Bench Press: 4 sets x 8 reps)"
      ]
    }
  ],
  "mealSuggestions": [
    {
      "mealType": "Breakfast",
      "title": "Protein Oat Bowl",
      "ingredients": [
        "80g rolled oats",
        "250ml soy milk",
        "1 scoop vegan protein",
        "100g berries",
        "15g almonds"
      ],
      "macros": {
        "calories": 620,
        "protein": 38,
        "carbs": 61,
        "fats": 18
      }
    }
  ],
  "recommendations": [
    "precise performance guideline string"
  ]
}
`;

    let attempts = 0;
    const maxAttempts = 3;
    let plan = null;
    let savedPlan = null;
    let dailyCalories, dailyProtein, workoutPlan, mealSuggestions, recommendations, title, summary;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[AI Regeneration] Attempt ${attempts} of ${maxAttempts} for user ${userId} (${dietPreference})`);
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const cleanedResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonStart = cleanedResponse.indexOf("{");
      const jsonEnd = cleanedResponse.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        if (attempts >= maxAttempts) {
          throw new Error("AI did not return a valid JSON block. Raw output: " + response.substring(0, 100));
        }
        continue;
      }

      const jsonString = cleanedResponse.slice(jsonStart, jsonEnd + 1);
      try {
        plan = JSON.parse(jsonString);
      } catch (err) {
        if (attempts >= maxAttempts) {
          throw new Error("AI did not return a valid parsable JSON. Error: " + err.message);
        }
        continue;
      }

      title = (plan.title || "").trim();
      summary = (plan.summary || "").trim();

      if (!title) {
        title = "Performance System";
      } else {
        if (title.length > 60) {
          title = title.substring(0, 60).trim();
        }
      }

      if (!summary) {
        summary = "Precision nutrition and recovery protocol.";
      } else {
        if (summary.length > 180) {
          summary = summary.substring(0, 180).trim();
        }
      }

      dailyCalories = Number(plan.dailyCalories) || caloriesTarget;
      dailyProtein = Number(plan.dailyProtein) || proteinTarget;
      workoutPlan = Array.isArray(plan.workoutPlan)
        ? plan.workoutPlan.map((w) => ({
            day: String(w.day || ""),
            focus: String(w.focus || ""),
            exercises: Array.isArray(w.exercises) ? w.exercises.map(String) : [],
          }))
        : [];
      
      const rawMealSuggestions = Array.isArray(plan.mealSuggestions)
        ? plan.mealSuggestions.map((m) => {
            if (typeof m === "string") {
              const colonIdx = m.indexOf(":");
              let type = "Meal Option";
              let title = m;
              if (colonIdx !== -1) {
                type = m.substring(0, colonIdx).trim();
                title = m.substring(colonIdx + 1).trim();
              }
              return {
                mealType: type,
                title: title,
                ingredients: [],
                macros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
              };
            }
            return {
              mealType: String(m.mealType || ""),
              title: String(m.title || ""),
              ingredients: Array.isArray(m.ingredients) ? m.ingredients.map(String) : [],
              macros: {
                calories: Number(m.macros?.calories || 0),
                protein: Number(m.macros?.protein || 0),
                carbs: Number(m.macros?.carbs || 0),
                fats: Number(m.macros?.fats || 0),
              }
            };
          })
        : [];

      recommendations = Array.isArray(plan.recommendations)
        ? plan.recommendations.map(String)
        : [];

      const mockPlanObj = { mealSuggestions: rawMealSuggestions };
      if (validatePlanDiet(mockPlanObj, dietPreference)) {
        mealSuggestions = rawMealSuggestions;
        break;
      } else {
        console.warn(`[Diet Validation] Attempt ${attempts} failed validation checks.`);
        if (attempts >= maxAttempts) {
          return res.status(422).json({
            success: false,
            message: "Generated plan failed dietary integrity checks after multiple attempts."
          });
        }
      }
    }

    savedPlan = await Plan.create({
      user: userId,
      title,
      summary,
      dailyCalories,
      dailyProtein,
      workoutPlan,
      mealSuggestions,
      recommendations,
    });

    res.json({
      success: true,
      plan: formatPlanForClient(savedPlan),
    });

  } catch (error) {
    console.error("Error regenerating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const activatePlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const plan = await Plan.findOne({
      _id: id,
      user: userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    await Plan.updateMany(
      { user: userId },
      { isActive: false }
    );

    plan.isActive = true;
    await plan.save();

    res.json({
      success: true,
      message: "Plan activated successfully",
      plan: formatPlanForClient(plan),
    });
  } catch (error) {
    console.error("Error activating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to activate plan",
    });
  }
};
