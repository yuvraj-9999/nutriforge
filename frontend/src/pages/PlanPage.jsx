import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChevronLeft,
  HiOutlineCalendar,
  HiOutlineSparkles,
  HiOutlineTrash
} from "react-icons/hi";

import { useAuth } from "../context/AuthContext";
import { getPlanById, regeneratePlan, deletePlan, activatePlan } from "../services/auth.services";
import MainLayout from "../layouts/MainLayout";

// ─── Grounded Mature Palette ──────────────────────────────────
const C = {
  bg:           "#131211",  // deep warm smoked charcoal base
  card:         "#1B1A19",  // warm graphite card surface
  panel:        "#22201F",  // deep warm graphite panel background
  accent:       "#B2967D",  // organic brushed copper highlight
  text:         "#F5F4F2",  // warm ivory
  sub:          "#9E9790",  // muted stone gray
  muted:        "#5C5854",  // dark stone placeholder
  faint:        "rgba(255, 255, 255, 0.03)",  // hairline dividers
  danger:       "#D26E64",  // soft red text
  cardBorder:   "rgba(255, 255, 255, 0.03)",
  cardShadow:   "0 15px 35px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.01) inset",
};



// ─── Spinner ─────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.2" />
    <path d="M13 7.5a5.5 5.5 0 01-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ─── Plan Detail Skeleton Loader ───
const PlanSkeletonLoader = () => (
  <div className="max-w-[56rem] w-full mx-auto px-6 mt-8 flex flex-col gap-8 text-left animate-pulse">
    {/* Header Info Skeleton */}
    <div className="flex flex-col gap-2.5 border-b pb-4 border-[rgba(255,255,255,0.03)]">
      <div className="h-8 w-64 rounded bg-stone-800" />
      <div className="h-4 w-40 rounded bg-stone-800" />
    </div>

    {/* Macros Target Card Skeleton */}
    <div className="h-48 w-full rounded-2xl bg-stone-900 border border-[rgba(255,255,255,0.02)]" />

    {/* Recommendations Tab Skeleton */}
    <div className="h-80 w-full rounded-2xl bg-stone-900 border border-[rgba(255,255,255,0.02)]" />
  </div>
);

// ═════════════════════════════════════════════════════════════
// PlanPage
// ═════════════════════════════════════════════════════════════
const PlanPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("nutrition"); // "nutrition" or "workout"

  const [regenerating, setRegenerating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await getPlanById(id);
        if (data?.plan) {
          setPlan(data.plan);
        } else {
          setErrorMsg("No performance plan found.");
        }
      } catch (err) {
        console.error("Failed to load plan details", err);
        setErrorMsg("Unable to retrieve this plan right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [id]);

  // ── API Error Parser ──
  const parseApiError = (err, fallback) => {
    const status = err?.response?.status;
    const backendMsg = err?.response?.data?.message;
    if (status === 429) {
      return backendMsg || "You've reached the AI request limit. Please wait 15 minutes before trying again.";
    }
    return fallback;
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setErrorMsg("");
      const res = await regeneratePlan(id);
      if (res?.plan) {
        setPlan(res.plan);
      }
    } catch (err) {
      console.error("Failed to regenerate plan", err);
      setErrorMsg(parseApiError(err, "Something interrupted the regeneration process."));
    } finally {
      setRegenerating(false);
    }
  };

  const handleActivate = async () => {
    try {
      setActivating(true);
      setErrorMsg("");
      setSuccessMsg("");
      const data = await activatePlan(id);
      if (data?.plan) {
        setPlan(data.plan);
        setSuccessMsg("Plan activated successfully. Dashboard updated.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Failed to activate plan", err);
      setErrorMsg("Failed to activate this plan.");
    } finally {
      setActivating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (plan?.isActive) {
      setErrorMsg("Active plans cannot be deleted.");
      return;
    }
    try {
      setDeleting(true);
      setErrorMsg("");
      await deletePlan(id);
      setPlanToDelete(null);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Failed to delete plan", err);
      setErrorMsg("Unable to delete plan. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/", { replace: true });
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

  // ── Calculations ──
  const caloriesTarget = plan?.dailyCalories || 0;
  const proteinTarget = plan?.dailyProtein || 0;
  const fatsTarget = caloriesTarget > 0 ? Math.round((caloriesTarget * 0.25) / 9) : 0;
  const carbsTarget = caloriesTarget > 0 ? Math.round((caloriesTarget - (proteinTarget * 4) - (fatsTarget * 9)) / 4) : 0;

  // Format creation date
  const formattedDate = plan?.createdAt 
    ? new Date(plan.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "";

  return (
    <MainLayout>
      {/* ── Main Container ── */}
      <main className="max-w-[56rem] w-full mx-auto px-6 mt-8 pb-12 flex-1 flex flex-col gap-6 relative z-10 text-left">
        {/* Navigation Breadcrumb */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 text-[13px] font-semibold self-start transition-colors duration-200"
        >
          <HiOutlineChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Loading details */}
        {loading && <PlanSkeletonLoader />}

        {/* Full-screen error when no plan loaded */}
        {!loading && !plan && errorMsg && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="rounded-xl px-4 py-3 text-[13px] border border-red-950 bg-red-950/20 text-red-400 max-w-md">
              {errorMsg}
            </div>
            <Link
              to="/dashboard"
              className="text-stone-300 font-semibold hover:underline text-[13px]"
            >
              Return to Dashboard
            </Link>
          </div>
        )}

        {/* Loaded Plan Details */}
        {!loading && plan && (
          <motion.div
            className="flex flex-col gap-8 relative"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Loader Overlays */}
            <AnimatePresence>
              {regenerating && (
                <motion.div
                  className="absolute inset-0 bg-[rgba(19,18,17,0.95)] z-20 flex flex-col items-center justify-center gap-3 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Spinner />
                  <span className="text-xs text-[#B2967D] font-semibold tracking-wider uppercase font-mono">Shaping recommendations...</span>
                </motion.div>
              )}

              {activating && (
                <motion.div
                  className="absolute inset-0 bg-[rgba(19,18,17,0.95)] z-20 flex flex-col items-center justify-center gap-3 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Spinner />
                  <span className="text-xs text-[#B2967D] font-semibold tracking-wider uppercase font-mono">Activating plan...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transient Alert Banners */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed border"
                  style={{
                    background: "rgba(141, 197, 149, 0.04)",
                    borderColor: "rgba(141, 197, 149, 0.25)",
                    color: "#8DC595",
                  }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4.5 7.5L6 9L9.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {errorMsg && (
                <motion.div
                  className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed border"
                  style={{
                    background: "rgba(210, 110, 100, 0.04)",
                    borderColor: "rgba(210, 110, 100, 0.15)",
                    color: "#D26E64",
                  }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M7 4V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="7" cy="10" r="0.7" fill="currentColor" />
                  </svg>
                  <span>{errorMsg}</span>
                  <button 
                    onClick={() => setErrorMsg("")} 
                    className="ml-auto text-stone-400 hover:text-stone-200 font-bold text-sm px-1 rounded cursor-pointer"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b pb-4 border-[rgba(255,255,255,0.03)]">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h1 className="text-[26px] font-bold tracking-tight text-stone-100 font-sans">
                    {plan.title || "Performance System"}
                  </h1>
                  {plan.isActive ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B2967D]/10 text-[#B2967D] border border-[#B2967D]/25 px-2.5 py-1 rounded self-start sm:self-center font-mono">
                      Currently Active
                    </span>
                  ) : (
                    <button
                      onClick={handleActivate}
                      disabled={activating || regenerating || deleting}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#B2967D] text-[#121110] border border-[#B2967D] hover:bg-[#C3A58C] transition-all cursor-pointer self-start sm:self-center disabled:opacity-50 font-mono"
                    >
                      Activate Plan
                    </button>
                  )}
                </div>
                {plan.summary && (
                  <p className="text-[14px] text-stone-400 mt-1.5 leading-relaxed max-w-2xl font-sans">
                    {plan.summary}
                  </p>
                )}
                <p className="text-[12px] text-[#B2967D]/85 font-medium mt-1.5 font-mono">
                  Generated from current metrics • {formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center mt-2 sm:mt-0">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || deleting || activating}
                  className="flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase px-3 py-2 rounded-md border text-stone-300 hover:text-stone-100 hover:border-[#B2967D] transition-all duration-200 bg-stone-900/60 disabled:opacity-40 cursor-pointer"
                  style={{ borderColor: C.faint }}
                >
                  <HiOutlineSparkles size={14} className="text-[#B2967D]" />
                  <span>Regenerate Plan</span>
                </button>
                <button
                  onClick={() => setPlanToDelete(id)}
                  disabled={plan.isActive || regenerating || deleting || activating}
                  title={plan.isActive ? "Active plans cannot be deleted" : "Delete Plan"}
                  className={`flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase px-3 py-2 rounded-md border transition-all duration-200 bg-stone-900/60 disabled:opacity-40 cursor-pointer ${
                    plan.isActive 
                      ? "text-stone-600 border-stone-800/40 cursor-not-allowed opacity-30" 
                      : "text-stone-400 hover:text-[#D26E64] hover:border-[#D26E64]/40"
                  }`}
                  style={!plan.isActive ? { borderColor: C.faint } : {}}
                >
                  <HiOutlineTrash size={14} />
                  <span>Delete Plan</span>
                </button>
              </div>
            </div>

            {/* Calories / Macros targets */}
            <div
              className="rounded-2xl border"
              style={{
                background: C.card,
                borderColor: C.cardBorder,
                boxShadow: C.cardShadow,
              }}
            >
              <div className="px-6 py-5 border-b" style={{ borderColor: C.faint }}>
                <h2 className="text-[15px] font-semibold text-stone-200 font-sans">Macro Targets</h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-[#201F1E] rounded-xl p-4 border border-[rgba(255,255,255,0.01)]">
                  <div className="flex-1 text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Daily Calories</span>
                    <h3 className="text-2xl font-bold text-stone-100 mt-1">{caloriesTarget.toLocaleString()} <span className="text-xs text-stone-400 font-normal">kcal</span></h3>
                  </div>
                  <div className="w-12 h-12 rounded-full border flex items-center justify-center text-[10.5px] font-bold text-[#B2967D]" style={{ borderColor: "rgba(178, 150, 125, 0.25)" }}>
                    Limits
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
                      <span className="text-stone-300">Carbohydrates</span>
                      <span className="text-stone-200">{carbsTarget}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#242322] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B2967D] rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[12px] font-semibold">
                      <span className="text-stone-300">Fats</span>
                      <span className="text-stone-200">{fatsTarget}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#242322] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B2967D] rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Sub-tabs */}
            <div
              className="rounded-2xl border relative overflow-hidden"
              style={{
                background: C.card,
                borderColor: C.cardBorder,
                boxShadow: C.cardShadow,
              }}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.faint }}>
                <div className="flex items-center gap-1.5 bg-[#201F1E] p-1 rounded-lg border border-[rgba(255,255,255,0.01)]">
                  <button
                    onClick={() => setActiveTab("nutrition")}
                    className="text-[12.5px] font-semibold px-3 py-1 rounded-md transition-all duration-150 cursor-pointer"
                    style={{
                      background: activeTab === "nutrition" ? C.panel : "transparent",
                      color: activeTab === "nutrition" ? C.text : "#9E9790",
                    }}
                  >
                    Nutrition Plan
                  </button>
                  <button
                    onClick={() => setActiveTab("workout")}
                    className="text-[12.5px] font-semibold px-3 py-1 rounded-md transition-all duration-150 cursor-pointer"
                    style={{
                      background: activeTab === "workout" ? C.panel : "transparent",
                      color: activeTab === "workout" ? C.text : "#9E9790",
                    }}
                  >
                    Workout Plan
                  </button>
                </div>
              </div>

              <div className="p-6 min-h-[16rem]">
                {/* nutrition suggestions */}
                {activeTab === "nutrition" && (
                  <div className="flex flex-col gap-5">
                    {plan.mealSuggestions && plan.mealSuggestions.length > 0 ? (
                      plan.mealSuggestions.map((mealStr, idx) => {
                        const meal = parseMealSuggestion(mealStr, idx);
                        return (
                          <div
                            key={idx}
                            className="flex flex-col gap-4 p-4 rounded-xl text-left"
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
                      <div className="py-12 text-center text-stone-400 text-[13px]">No meal targets saved.</div>
                    )}
                  </div>
                )}

                {/* workout schedules */}
                {activeTab === "workout" && (
                  <div className="flex flex-col gap-5">
                    {plan.workoutPlan && plan.workoutPlan.length > 0 ? (
                      plan.workoutPlan.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl flex flex-col gap-3 text-left"
                          style={{ background: C.panel }}
                        >
                          <div className="flex items-center justify-between border-b pb-2 border-[rgba(255,255,255,0.02)]">
                            <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#B2967D] font-mono">{item.day}</span>
                            <span className="text-[12.5px] text-stone-300 font-semibold">{item.focus}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.exercises && item.exercises.map((ex, exIdx) => (
                              <span
                                key={exIdx}
                                className="px-2.5 py-1 rounded bg-[#1B1A19] border border-[rgba(255,255,255,0.02)] text-[12px] text-stone-300"
                              >
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-stone-400 text-[13px]">No training program logged.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations / Tips summary list */}
            {plan.recommendations && plan.recommendations.length > 0 && (
              <div
                className="rounded-2xl border p-6 flex flex-col gap-4"
                style={{
                  background: C.card,
                  borderColor: C.cardBorder,
                  boxShadow: C.cardShadow,
                }}
              >
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#B2967D] border-b pb-2 border-[rgba(255,255,255,0.03)] font-mono">
                  Engine Guidelines
                </h3>
                <ul className="flex flex-col gap-3 text-left">
                  {plan.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2.5 text-[13px] text-stone-300 leading-relaxed font-sans">
                      <span className="text-[#B2967D] mt-0.5 shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </main>

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
                This will permanently remove this nutrition and workout plan and redirect you to the dashboard.
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
                  onClick={handleDeleteConfirm}
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

export default PlanPage;