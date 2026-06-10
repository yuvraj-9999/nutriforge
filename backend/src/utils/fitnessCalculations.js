export const calculateProtein = (weight, goal) => {
    if (goal === "muscle_gain") {
        return Math.round(weight * 2.0);
    }

    if (goal === "fat_loss") {
        return Math.round(weight * 1.8);
    }

    return Math.round(weight * 1.6);

};

export const calculateCalories = (weight, height, age, gender, activityLevel, goal) => {
    let bmr;

    if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
    };


    const multiplier = activityMultipliers[activityLevel] || 1.375;
    let calories = bmr * multiplier;

    if (goal === "muscle_gain") {
        calories += 300;
    }

    if (goal === "fat_loss") {
        calories -= 300;
    }

    return Math.round(calories);
};