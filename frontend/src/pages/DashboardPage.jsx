import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrendingUp,
  HiOutlineSparkles,
  HiOutlineCalendar,
  HiOutlineFire,
  HiOutlineScale,
  HiOutlineBeaker,
  HiOutlineTrash,
  HiOutlineCheckCircle
} from "react-icons/hi";

import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  getUserPlans,
  generatePlan,
  regeneratePlan,
  deletePlan
} from "../services/auth.services";
import MainLayout from "../layouts/MainLayout";

// ─── Grounded Mature Palette ──────────────────────────────────
const C = {
  bg: "#131211",  // deep warm smoked charcoal base
  card: "#1B1A19",  // warm graphite card surface
  panel: "#22201F",  // deep warm graphite panel background
  accent: "#B2967D",  // organic brushed copper highlight
  accentHover: "#C3A58C",
  text: "#F5F4F2",  // warm ivory
  sub: "#9E9790",  // muted stone gray
  muted: "#5C5854",  // dark stone placeholder
  faint: "rgba(255, 255, 255, 0.03)",  // hairline dividers
  danger: "#D26E64",  // soft red text
  dangerBg: "rgba(210, 110, 100, 0.04)",
  dangerBorder: "rgba(210, 110, 100, 0.15)",
  cardBorder: "rgba(255, 255, 255, 0.03)",
  cardShadow: "0 15px 35px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.01) inset",
};



// ─── Spinner ─────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.2" />
    <path d="M13 7.5a5.5 5.5 0 01-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ─── Skeleton Loader Component ───
const SkeletonLoader = () => (
  <div className="max-w-[72rem] w-full mx-auto px-6 mt-8 flex flex-col gap-8 text-left">
    <div className="flex flex-col gap-2.5">
      <div className="h-7 w-52 animate-skeleton" />
      <div className="h-4 w-72 animate-skeleton" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="h-48 w-full animate-skeleton" />
        <div className="h-[30rem] w-full animate-skeleton" />
      </div>
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div className="h-64 w-full animate-skeleton" />
        <div className="h-56 w-full animate-skeleton" />
      </div>
    </div>
  </div>
);

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// ═════════════════════════════════════════════════════════════
// DashboardPage
// ═════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const { user } = useAuth();

  // ── States ──
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);

  // States to evaluate user plan availability
  const [hasProfile, setHasProfile] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);

  // Interaction logs (User-keyed local storage persistence)
  const [hydration, setHydration] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [weight, setWeight] = useState(0);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  // Subsections toggle
  const [dashboardTab, setDashboardTab] = useState("nutrition"); // "nutrition" or "workout"

  // Trigger generation progress
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Deletion overlay targets
  const [planToDelete, setPlanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Load User Application Data ──
  const loadDashboardData = async () => {
    try {
      // 1. Fetch Profile
      const profRes = await getProfile();
      const prof = profRes?.user?.profile;

      if (prof && prof.age && prof.weight && prof.height && prof.goal) {
        setHasProfile(true);
        setProfileData(prof);
        setWeight(prof.weight);
        setWeightInput(prof.weight.toString());

        // Hydration & Streak local storage sync keyed to active user ID
        const userId = profRes?.user?._id || user?.id || "guest";

        const storedHydration = localStorage.getItem(`nf_hydration_${userId}`);
        setHydration(storedHydration !== null ? parseInt(storedHydration, 10) : 0);

        // Load streak — keyed by user, tracks daily protocol completion (not weight logging)
        const storedStreak = localStorage.getItem(`nf_streak_${userId}`);
        const lastCompletion = localStorage.getItem(`nf_lastCompletion_${userId}`);
        let currentStreak = storedStreak !== null ? parseInt(storedStreak, 10) : 0;
        const todayStr = getTodayDateString();

        if (lastCompletion) {
          const diff = getDaysDiff(lastCompletion, todayStr);
          if (diff > 1) {
            // Missed a day — reset streak (will be set to 1 on next completion)
            currentStreak = 0;
            localStorage.setItem(`nf_streak_${userId}`, "0");
          }
          // Mark completed today if last completion was today
          setCompletedToday(lastCompletion === todayStr);
        }
        setStreak(currentStreak);

        // 2. Fetch Plans
        const plansRes = await getUserPlans();
        if (plansRes?.plans && plansRes.plans.length > 0) {
          const sorted = [...plansRes.plans].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setHasPlan(true);
          setAllPlans(sorted);

          const active = sorted.find((p) => p.isActive);
          setActivePlan(active || null);
        } else {
          setHasPlan(false);
          setAllPlans([]);
          setActivePlan(null);
        }
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error("Failed to fetch backend application state", err);
      setErrorMsg("Failed to load targets and profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ── Handlers ──

  /**
   * handleCompleteToday
   * One-per-day protocol completion. Increments streak by 1 each
   * new calendar day the user marks their day complete. Missing a
   * day resets the streak to 1 on the next completion.
   * Persists to localStorage, scoped to authenticated userId.
   */
  const handleCompleteToday = () => {
    const userId = user?._id || user?.id || "guest";
    const todayStr = getTodayDateString();
    const lastCompletion = localStorage.getItem(`nf_lastCompletion_${userId}`);
    const storedStreak = localStorage.getItem(`nf_streak_${userId}`);
    let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;

    // Guard: already completed today — do nothing
    if (lastCompletion === todayStr) return;

    if (lastCompletion) {
      const diff = getDaysDiff(lastCompletion, todayStr);
      if (diff > 1) {
        // Gap > 1 day — streak broken, restart at 1
        currentStreak = 1;
      } else {
        // Consecutive day
        currentStreak += 1;
      }
    } else {
      // First completion ever
      currentStreak = 1;
    }

    localStorage.setItem(`nf_streak_${userId}`, currentStreak.toString());
    localStorage.setItem(`nf_lastCompletion_${userId}`, todayStr);
    setStreak(currentStreak);
    setCompletedToday(true);
  };

  const handleHydrationIncrement = () => {
    if (hydration < 15) {
      const newVal = hydration + 1;
      setHydration(newVal);
      const userId = user?._id || user?.id || "guest";
      localStorage.setItem(`nf_hydration_${userId}`, newVal.toString());
    }
  };

  const handleHydrationDecrement = () => {
    if (hydration > 0) {
      const newVal = hydration - 1;
      setHydration(newVal);
      const userId = user?._id || user?.id || "guest";
      localStorage.setItem(`nf_hydration_${userId}`, newVal.toString());
    }
  };

  const handleWeightSave = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(weightInput);
    if (!isNaN(parsed) && parsed > 30 && parsed < 250) {
      try {
        setSavingWeight(true);
        setErrorMsg("");
        const updatedProfilePayload = {
          ...profileData,
          weight: parsed
        };
        await updateProfile(updatedProfilePayload);
        setWeight(parsed);
        setIsEditingWeight(false);
      } catch (err) {
        console.error("Failed to sync weight to backend", err);
        setErrorMsg("Unable to synchronize weight tracker to server.");
      } finally {
        setSavingWeight(false);
      }
    }
  };

  // ── API Error Parser ──
  // Extracts the backend message on rate-limit (429) responses so the
  // user sees a meaningful message instead of a generic fallback.
  const parseApiError = (err, fallback) => {
    const status = err?.response?.status;
    const backendMsg = err?.response?.data?.message;
    if (status === 429) {
      return backendMsg || "You've reached the AI request limit. Please wait 15 minutes before generating again.";
    }
    return fallback;
  };

  const handleGenerateFirstPlan = async () => {
    setGeneratingPlan(true);
    setErrorMsg("");
    try {
      await generatePlan();
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to generate nutrition plan", err);
      setErrorMsg(parseApiError(err, "Unable to generate plan right now."));
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleRegenerateActivePlan = async () => {
    if (!activePlan?._id) return;
    setRegenerating(true);
    setErrorMsg("");
    try {
      await regeneratePlan(activePlan._id);
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to regenerate plan", err);
      setErrorMsg(parseApiError(err, "Something interrupted the regeneration process."));
    } finally {
      setRegenerating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await deletePlan(planToDelete);
      await loadDashboardData();
      setPlanToDelete(null);
    } catch (err) {
      console.error("Failed to delete plan", err);
      setErrorMsg("Unable to delete plan. Please try again.");
    } finally {
      setDeleting(false);
    }
  };



  // ── Parsing Meal Suggestions Helper ──
  const parseMealSuggestion = (meal, idx) => {
    if (meal && typeof meal === "object") {
      return {
        mealType: meal.mealType || "Meal Option",
        title: meal.title || "",
        ingredients: meal.ingredients || [],
        macros: meal.macros || { calories: 0, protein: 0, carbs: 0, fats: 0 }
      };
    }

    const mealStr = String(meal || "");
    const colonIdx = mealStr.indexOf(":");
    let type = "Meal Option";
    let title = mealStr;

    if (colonIdx !== -1) {
      type = mealStr.substring(0, colonIdx).trim();
      title = mealStr.substring(colonIdx + 1).trim();
    }

    const fallbackTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
    const mealType = idx < 4 ? fallbackTypes[idx] : type;

    return {
      mealType,
      title,
      ingredients: [],
      macros: { calories: 0, protein: 0, carbs: 0, fats: 0 }
    };
  };

  // ── Calculate Target Macros ──
  const caloriesTarget = activePlan?.dailyCalories || 0;
  const proteinTarget = activePlan?.dailyProtein || 0;
  const fatsTarget = caloriesTarget > 0 ? Math.round((caloriesTarget * 0.25) / 9) : 0;
  const carbsTarget = caloriesTarget > 0 ? Math.round((caloriesTarget - (proteinTarget * 4) - (fatsTarget * 9)) / 4) : 0;

  return (
    <MainLayout>

      {/* ── Loading Skeleton State ── */}
      {loading && <SkeletonLoader />}

      {/* ── Loaded App Content ── */}
      {!loading && (
        <main className="max-w-[72rem] w-full mx-auto px-6 mt-8 pb-12 flex-1 flex flex-col gap-8 relative text-left">

          {/* Greeting */}
          <section className="flex flex-col gap-1">
            <h1 className="text-[26px] font-bold tracking-tight text-stone-100 font-sans">
              Forge mode active, {user?.name?.split(" ")[0] || "Athlete"}.
            </h1>
            <p className="text-[13px] text-stone-400 leading-relaxed font-sans">
              Consistency compounds over time.
            </p>
          </section>

          {/* Calm Status alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-[13px] border"
                style={{
                  background: C.dangerBg,
                  borderColor: C.dangerBorder,
                  color: C.danger,
                }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg("")}
                  className="text-stone-400 hover:text-stone-200 font-bold text-sm px-1 rounded cursor-pointer"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. STATE: No Profile Onboarding State */}
          {!hasProfile && (
            <div
              className="rounded-2xl border p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-2xl mx-auto w-full my-8"
              style={{
                background: C.card,
                borderColor: C.cardBorder,
                boxShadow: C.cardShadow,
              }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.03)] bg-[#201F1E] text-[#B2967D]">
                <HiOutlineScale size={28} />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-[20px] font-bold tracking-tight text-stone-100">Metabolic Profile Offline</h2>
                <p className="text-[13px] text-stone-400 max-w-md mx-auto leading-relaxed">
                  Complete your onboarding profile to unlock target daily calories, macronutrient tracks, and custom schedules.
                </p>
              </div>
              <Link
                to="/profile"
                className="px-6 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200"
                style={{
                  background: "#F5F4F2",
                  color: "#121110",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1.5px 0 rgba(255,255,255,0.4)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#DFD8CD")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F4F2")}
              >
                Setup Metabolic Profile
              </Link>
            </div>
          )}

          {/* 2. STATE: Profile Configured but No Plan Generated */}
          {hasProfile && !hasPlan && (
            <div
              className="rounded-2xl border p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-2xl mx-auto w-full my-8 relative overflow-hidden"
              style={{
                background: C.card,
                borderColor: C.cardBorder,
                boxShadow: C.cardShadow,
              }}
            >
              {generatingPlan && (
                <div className="absolute inset-0 bg-[#1B1A19]/90 z-20 flex flex-col items-center justify-center gap-3">
                  <Spinner />
                  <span className="text-xs text-[#B2967D] font-semibold tracking-wider uppercase font-mono">Forging Performance plan...</span>
                </div>
              )}

              <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.03)] bg-[#201F1E] text-[#B2967D]">
                <HiOutlineSparkles size={28} />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-[20px] font-bold tracking-tight text-stone-100">Ready to Forge Transformation</h2>
                <p className="text-[13px] text-stone-400 max-w-md mx-auto leading-relaxed">
                  Your biometric metrics are loaded. Generate your custom AI-driven performance diet recommendations and athletic schedule to launch.
                </p>
              </div>
              <button
                onClick={handleGenerateFirstPlan}
                disabled={generatingPlan}
                className="px-6 py-3 rounded-lg text-[13.5px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                style={{
                  background: "#F5F4F2",
                  color: "#121110",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1.5px 0 rgba(255,255,255,0.4)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#DFD8CD")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F4F2")}
              >
                Generate Performance Plan
              </button>
            </div>
          )}

          {/* 3. STATE: Populated Nutrition & Workout Dashboard */}
          {hasProfile && hasPlan && activePlan && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* LEFT & CENTER: Meal details / Schedule */}
              <div className="lg:col-span-2 flex flex-col gap-8">

                {/* Dynamic Target Limits */}
                <div
                  className="rounded-2xl border"
                  style={{
                    background: C.card,
                    borderColor: C.cardBorder,
                    boxShadow: C.cardShadow,
                  }}
                >
                  <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: C.faint }}>
                    <h2 className="text-[15px] font-semibold text-stone-200 font-sans">Active Target limits</h2>
                    <button
                      onClick={() => setPlanToDelete(activePlan._id)}
                      className="text-[11.5px] font-bold text-[#D26E64] hover:text-[#D26E64]/80 transition-colors cursor-pointer"
                    >
                      Delete Plan
                    </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 bg-[#201F1E] rounded-xl p-4 border border border-[rgba(255,255,255,0.01)]">
                      <div className="flex-1 text-left">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Daily Calories</span>
                        <h3 className="text-2xl font-bold text-stone-100 mt-1">{caloriesTarget.toLocaleString()} <span className="text-xs text-stone-400 font-normal">kcal</span></h3>
                      </div>
                      <div className="w-12 h-12 rounded-full border flex items-center justify-center text-[10.5px] font-bold text-[#B2967D]" style={{ borderColor: "rgba(178, 150, 125, 0.25)" }}>
                        100%
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 justify-center">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px] font-semibold">
                          <span className="text-stone-300">Protein Target</span>
                          <span className="text-stone-200">{proteinTarget}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#242322] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B2967D] rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px] font-semibold">
                          <span className="text-stone-300">Carbohydrates target limit</span>
                          <span className="text-stone-200">{carbsTarget}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#242322] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B2967D] rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px] font-semibold">
                          <span className="text-stone-300">Fats target limit</span>
                          <span className="text-stone-200">{fatsTarget}g</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#242322] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B2967D] rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Plan Recommendations Card (With Toggles) */}
                <div
                  className="rounded-2xl border relative overflow-hidden"
                  style={{
                    background: C.card,
                    borderColor: C.cardBorder,
                    boxShadow: C.cardShadow,
                  }}
                >
                  <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.faint }}>
                    {/* Navigation Toggle Tab */}
                    <div className="flex items-center gap-1.5 bg-[#201F1E] p-1 rounded-lg border border-[rgba(255,255,255,0.01)]">
                      <button
                        onClick={() => setDashboardTab("nutrition")}
                        className="text-[12.5px] font-semibold px-3 py-1 rounded-md transition-all duration-150 cursor-pointer"
                        style={{
                          background: dashboardTab === "nutrition" ? C.panel : "transparent",
                          color: dashboardTab === "nutrition" ? C.text : "#9E9790",
                        }}
                      >
                        Nutrition
                      </button>
                      <button
                        onClick={() => setDashboardTab("workout")}
                        className="text-[12.5px] font-semibold px-3 py-1 rounded-md transition-all duration-150 cursor-pointer"
                        style={{
                          background: dashboardTab === "workout" ? C.panel : "transparent",
                          color: dashboardTab === "workout" ? C.text : "#9E9790",
                        }}
                      >
                        Workout
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <HiOutlineCalendar className="text-stone-400" size={16} />
                      <span className="text-[12px] text-stone-400 font-semibold font-mono">Active Target Plan</span>
                    </div>
                  </div>

                  <div className="p-6 relative min-h-[20rem]">
                    {/* Loader Overlay when Regenerating */}
                    <AnimatePresence>
                      {regenerating && (
                        <motion.div
                          className="absolute inset-0 bg-[rgba(27,26,25,0.95)] z-20 flex flex-col items-center justify-center gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Spinner />
                          <span className="text-xs text-[#B2967D] font-semibold tracking-wider uppercase font-mono">Shaping recommendations...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tab 1: Meal Plan suggestions */}
                    {dashboardTab === "nutrition" && (
                      <div className="flex flex-col gap-5">
                        {activePlan.mealSuggestions && activePlan.mealSuggestions.length > 0 ? (
                          activePlan.mealSuggestions.map((mealStr, idx) => {
                            const meal = parseMealSuggestion(mealStr, idx);
                            return (
                              <div
                                key={idx}
                                className="flex flex-col gap-4 p-4 rounded-xl transition-all duration-200 text-left"
                                style={{ background: C.panel }}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-[rgba(255,255,255,0.02)]">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B2967D] font-mono">{meal.mealType}</span>
                                  {meal.macros && (meal.macros.calories > 0 || meal.macros.protein > 0) && (
                                    <div className="flex flex-wrap gap-2">
                                      <span className="px-2 py-0.5 rounded bg-[#1B1A19] border border-[rgba(255,255,255,0.02)] text-[11px] text-stone-300 font-mono">
                                        {meal.macros.calories} kcal
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#1B1A19] border border-[rgba(255,255,255,0.02)] text-[11px] text-stone-300 font-mono">
                                        P: {meal.macros.protein}g
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#1B1A19] border border-[rgba(255,255,255,0.02)] text-[11px] text-stone-300 font-mono">
                                        C: {meal.macros.carbs}g
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#1B1A19] border border-[rgba(255,255,255,0.02)] text-[11px] text-stone-300 font-mono">
                                        F: {meal.macros.fats}g
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-stone-100 leading-snug">{meal.title}</h4>
                                  {meal.ingredients && meal.ingredients.length > 0 && (
                                    <ul className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-stone-300">
                                      {meal.ingredients.map((ing, ingIdx) => (
                                        <li key={ingIdx} className="flex gap-2 items-center">
                                          <span className="text-[#B2967D] shrink-0">•</span>
                                          <span>{ing}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-12 text-center text-stone-400 text-[13px]">No meal recommendations generated.</div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Workout schedule */}
                    {dashboardTab === "workout" && (
                      <div className="flex flex-col gap-5">
                        {activePlan.workoutPlan && activePlan.workoutPlan.length > 0 ? (
                          activePlan.workoutPlan.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl flex flex-col gap-3 transition-all duration-200 text-left"
                              style={{ background: C.panel }}
                            >
                              <div className="flex items-center justify-between border-b pb-2 border-[rgba(255,255,255,0.02)]">
                                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#B2967D] font-mono">{item.day}</span>
                                <span className="text-[12.5px] text-stone-300 font-semibold font-sans">{item.focus}</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.exercises && item.exercises.map((ex, exIdx) => (
                                  <span
                                    key={exIdx}
                                    className="px-2.5 py-1 rounded bg-[#1B1A19] border border-[rgba(255,255,255,0.02)] text-[12px] text-stone-300 font-sans"
                                  >
                                    {ex}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-stone-400 text-[13px]">No workout schedules generated.</div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Plan History Listing Panel */}
                <div
                  className="rounded-2xl border"
                  style={{
                    background: C.card,
                    borderColor: C.cardBorder,
                    boxShadow: C.cardShadow,
                  }}
                >
                  <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: C.faint }}>
                    <h2 className="text-[15px] font-semibold text-stone-200 font-sans">Recent plans</h2>
                    <span className="text-[11px] font-semibold text-stone-400 font-mono">
                      {allPlans.length} {allPlans.length === 1 ? "Plan" : "Plans"}
                    </span>
                  </div>

                  <div className="p-6">
                    {allPlans.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {allPlans.map((p) => {
                          const dateStr = new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          });
                          const isActive = p._id === activePlan?._id;
                          return (
                            <div
                              key={p._id}
                              className="flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group text-left"
                              style={{
                                background: C.panel,
                                borderColor: isActive ? C.accent : "transparent",
                                boxShadow: isActive ? "0 0 12px rgba(178, 150, 125, 0.06)" : "none"
                              }}
                            >
                              <div
                                onClick={() => navigate(`/plans/${p._id}`)}
                                className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-[13px] font-bold text-stone-200 group-hover:text-[#B2967D] transition-colors leading-tight">
                                      {p.title}
                                    </h4>
                                    {isActive && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#B2967D]/10 text-[#B2967D] border border-[#B2967D]/25 px-1.5 py-0.5 rounded">
                                        Active Plan
                                      </span>
                                    )}
                                  </div>
                                  {p.summary && (
                                    <p className="text-[11px] text-stone-400 font-sans mt-1 leading-normal max-w-md">
                                      {p.summary}
                                    </p>
                                  )}
                                  <p className="text-[11px] text-stone-500 font-sans mt-1">Generated from current metrics • {dateStr}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[12.5px] font-semibold text-stone-300 block leading-tight">{p.dailyCalories.toLocaleString()} kcal</span>
                                  <span className="text-[11px] text-stone-400 font-sans">{p.dailyProtein}g Protein</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 ml-6 shrink-0">
                                <button
                                  onClick={() => navigate(`/plans/${p._id}`)}
                                  className="text-[11.5px] font-semibold text-[#B2967D] hover:underline transition-all cursor-pointer"
                                >
                                  View Plan
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isActive) return;
                                    setPlanToDelete(p._id);
                                  }}
                                  disabled={isActive}
                                  title={isActive ? "Active plans cannot be deleted" : "Delete Plan"}
                                  aria-label={isActive ? "Active plans cannot be deleted" : "Delete Plan"}
                                  className={`p-1.5 rounded transition-all ${isActive
                                    ? "text-stone-700 cursor-not-allowed opacity-40"
                                    : "text-stone-500 hover:text-[#D26E64] hover:bg-stone-900/60 cursor-pointer"
                                    }`}
                                >
                                  <HiOutlineTrash size={15} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-stone-400 text-[13.5px] font-sans">
                        No performance plans generated yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Side Panels (Hydration / Logs) */}
              <div className="lg:col-span-1 flex flex-col gap-8">

                {/* Daily Log Summary */}
                <div
                  className="rounded-2xl border"
                  style={{
                    background: C.card,
                    borderColor: C.cardBorder,
                    boxShadow: C.cardShadow,
                  }}
                >
                  <div className="px-6 py-5 border-b" style={{ borderColor: C.faint }}>
                    <h2 className="text-[15px] font-semibold text-stone-200">Daily Log Summary</h2>
                  </div>

                  <div className="p-6 flex flex-col gap-5">
                    {/* Hydration Tracker */}
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: C.panel }}>
                      <div className="flex items-center gap-3">
                        <div className="text-[#B2967D]">
                          <HiOutlineBeaker size={20} />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Hydration</span>
                          <h4 className="text-[16px] font-bold text-stone-100 mt-0.5">{hydration} <span className="text-xs text-stone-400 font-normal">/ 8 glasses</span></h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleHydrationDecrement}
                          disabled={hydration === 0}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center text-stone-400 hover:text-stone-200 hover:border-stone-400 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ borderColor: C.faint }}
                        >
                          <HiOutlineMinus size={14} />
                        </button>
                        <button
                          onClick={handleHydrationIncrement}
                          disabled={hydration >= 15}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center text-stone-400 hover:text-stone-200 hover:border-stone-400 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ borderColor: C.faint }}
                        >
                          <HiOutlinePlus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Weight Logger */}
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: C.panel }}>
                      <div className="flex-1 text-left">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Current Weight</span>

                        {isEditingWeight ? (
                          <form onSubmit={handleWeightSave} className="flex items-center gap-2 mt-1.5">
                            <input
                              type="text"
                              value={weightInput}
                              onChange={(e) => setWeightInput(e.target.value)}
                              className="w-16 rounded border text-[13px] font-semibold px-2 py-0.5 outline-none"
                              style={{
                                background: C.bg,
                                borderColor: C.accent,
                                color: C.text,
                              }}
                              disabled={savingWeight}
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={savingWeight}
                              className="text-[11px] font-bold text-[#B2967D] hover:underline"
                            >
                              {savingWeight ? "..." : "Save"}
                            </button>
                          </form>
                        ) : (
                          <h4 className="text-[16px] font-bold text-stone-100 mt-0.5">{weight} <span className="text-xs text-stone-400 font-normal">kg</span></h4>
                        )}
                      </div>

                      {!isEditingWeight && (
                        <button
                          onClick={() => {
                            setWeightInput(weight.toString());
                            setIsEditingWeight(true);
                          }}
                          className="text-[11.5px] font-semibold transition-colors duration-200"
                          style={{ color: C.accent }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = C.accentHover)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = C.accent)}
                        >
                          Log Weight
                        </button>
                      )}
                    </div>

                    {/* Streak — Daily Protocol Completion */}
                    <div
                      className="flex flex-col gap-3 p-4 rounded-xl transition-all duration-300"
                      style={{
                        background: completedToday
                          ? "rgba(178, 150, 125, 0.07)"
                          : C.panel,
                        boxShadow: completedToday
                          ? "0 0 18px rgba(178, 150, 125, 0.12), inset 0 1px 0 rgba(178,150,125,0.05)"
                          : "none",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Current Streak</span>
                          <h4 className="text-[16px] font-bold text-stone-100 mt-0.5">
                            {streak} {streak === 1 ? "Day" : "Day"} Streak
                          </h4>
                        </div>
                        <div
                          className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-300"
                          style={{
                            borderColor: completedToday ? "rgba(178, 150, 125, 0.35)" : "rgba(178, 150, 125, 0.15)",
                            color: completedToday ? "#B2967D" : "#6B6460",
                          }}
                        >
                          <HiOutlineFire size={18} />
                        </div>
                      </div>

                      {/* Mark Day Complete button */}
                      <button
                        onClick={handleCompleteToday}
                        disabled={completedToday}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold tracking-wide transition-all duration-200 border disabled:cursor-default
                        ${completedToday ? `bg-[rgba(178,150,125,0.08)] border-[rgba(178,150,125,0.25)] text-[#B2967D] cursor-default` : `bg-[rgba(255,255,255,0.025)] border-[rgba(178,150,125,0.12)] text-[#D6CEC7] cursor-pointer hover:border-[#B2967D] hover:bg-stone-700/10 hover:text-stone-100`}`}
                        aria-label={completedToday ? "Day already completed": "Mark today as complete"}
                      >
                        <HiOutlineCheckCircle size={14} />

                        {completedToday
                          ? "Completed Today"
                          : "Mark Day Complete"}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Actions Shortcut */}
                <div
                  className="rounded-2xl border"
                  style={{
                    background: C.card,
                    borderColor: C.cardBorder,
                    boxShadow: C.cardShadow,
                  }}
                >
                  <div className="px-6 py-5 border-b" style={{ borderColor: C.faint }}>
                    <h2 className="text-[15px] font-semibold text-stone-200">System Actions</h2>
                  </div>

                  <div className="p-6 flex flex-col gap-3">
                    <button
                      onClick={handleRegenerateActivePlan}
                      disabled={regenerating}
                      className="w-full py-2.5 rounded-lg border text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: C.panel,
                        borderColor: C.faint,
                        color: C.text,
                      }}
                      onMouseEnter={(e) => {
                        if (!regenerating) e.currentTarget.style.borderColor = C.accent;
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.faint)}
                    >
                      <HiOutlineSparkles size={14} className="text-[#B2967D]" />
                      Regenerate Targets
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      )}

      {/* ── Confirm Plan Deletion Modal ── */}
      <AnimatePresence>
        {planToDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-6 border text-center relative overflow-hidden"
              style={{
                background: C.card,
                borderColor: C.cardBorder,
                boxShadow: C.cardShadow
              }}
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              {deleting && (
                <div className="absolute inset-0 bg-[#1B1A19]/90 z-10 flex flex-col items-center justify-center gap-3">
                  <Spinner />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B2967D] font-mono">Deleting plan...</span>
                </div>
              )}

              <div className="mx-auto w-12 h-12 rounded-full bg-red-950/20 text-[#D26E64] flex items-center justify-center mb-4 border border-red-950/30">
                <HiOutlineTrash size={22} />
              </div>
              <h3 className="text-lg font-bold text-stone-100 font-sans">Delete Performance Plan?</h3>
              <p className="text-[13px] text-stone-400 mt-2.5 leading-relaxed font-sans">
                This will permanently remove this nutrition and workout plan.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setPlanToDelete(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-lg border text-[13px] font-semibold text-stone-300 transition-colors cursor-pointer"
                  style={{ borderColor: C.faint, background: C.panel }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-[#121110] transition-colors cursor-pointer bg-stone-100 hover:bg-stone-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
};

export default DashboardPage;