import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChevronLeft,
  HiOutlineSave,
} from "react-icons/hi";

import { getProfile, updateProfile } from "../services/auth.services";
import InputField from "../components/InputField";
import MainLayout from "../layouts/MainLayout";

// ─── Grounded Mature Palette ──────────────────────────────────
const C = {
  bg:           "#131211",  // deep warm smoked charcoal base
  card:         "#1B1A19",  // warm graphite card surface
  panel:        "#22201F",  // deep warm graphite panel background
  accent:       "#B2967D",  // organic brushed copper highlight
  accentHover:  "#C3A58C",
  text:         "#F5F4F2",  // warm ivory
  sub:          "#9E9790",  // muted stone gray
  muted:        "#5C5854",  // dark stone placeholder
  faint:        "rgba(255, 255, 255, 0.03)",  // hairline dividers
  danger:       "#D26E64",  // soft red text
  dangerBg:     "rgba(210, 110, 100, 0.04)",
  dangerBorder: "rgba(210, 110, 100, 0.15)",
  cardBorder:   "rgba(255, 255, 255, 0.03)",
  cardShadow:   "0 15px 35px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.01) inset",
};



// ─── Dropdown Styled Control ──────────────────────────────────
const SelectField = ({ id, label, value, onChange, options, error, disabled }) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const borderColor = hasError ? C.danger : focused ? C.accent : "#2C2A29";
  const insetShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.22)";
  const ringStyle = focused && !hasError
    ? { boxShadow: `${insetShadow}, 0 0 0 3px rgba(178, 150, 125, 0.08)` }
    : { boxShadow: insetShadow };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-stone-200 text-left select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-lg text-[14px] outline-none transition-all duration-200 px-3.5 py-[11px] appearance-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            background: disabled ? "#181716" : C.panel,
            border: `1px solid ${borderColor}`,
            color: value ? C.text : "#5C5854",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            ...ringStyle,
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#1B1A19] text-[#F5F4F2]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {hasError && (
        <p className="text-[12px] text-left text-red-400 mt-0.5">{error}</p>
      )}
    </div>
  );
};

// ─── Spinner ─────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.2" />
    <path d="M13 7.5a5.5 5.5 0 01-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ═════════════════════════════════════════════════════════════
// ProfilePage
// ═════════════════════════════════════════════════════════════
const ProfilePage = () => {
  const navigate = useNavigate();

  // ── Form State ──
  const [form, setForm] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    goal: "",
    dietPreference: "",
    workoutExperience: "",
    workoutDaysPerWeek: "",
    preferredWorkoutLocation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isNewProfile, setIsNewProfile] = useState(true);

  // ── Fetch Profile ──
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getProfile();
        if (data?.user?.profile) {
          const p = data.user.profile;
          const hasRequiredFields = Boolean(p.age && p.weight && p.height && p.goal);
          setIsNewProfile(!hasRequiredFields);

          setForm({
            age: p.age ? p.age.toString() : "",
            gender: p.gender || "",
            weight: p.weight ? p.weight.toString() : "",
            height: p.height ? p.height.toString() : "",
            activityLevel: p.activityLevel || "",
            goal: p.goal || "",
            dietPreference: p.dietPreference || "",
            workoutExperience: p.workoutExperience || "",
            workoutDaysPerWeek: p.workoutDaysPerWeek ? p.workoutDaysPerWeek.toString() : "",
            preferredWorkoutLocation: p.preferredWorkoutLocation || "",
          });
        } else {
          setIsNewProfile(true);
        }
      } catch (err) {
        console.error("Failed to fetch profile settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // ── Actions ──
  const handleChange = ({ target: { id, value } }) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    const ageNum = parseInt(form.age, 10);
    const weightNum = parseFloat(form.weight);
    const heightNum = parseFloat(form.height);
    const daysNum = parseInt(form.workoutDaysPerWeek, 10);

    if (!form.age) {
      e.age = "Age is required.";
    } else if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      e.age = "Enter an age between 13 and 100.";
    }

    if (!form.gender) {
      e.gender = "Please select your gender.";
    }

    if (!form.weight) {
      e.weight = "Weight is required.";
    } else if (isNaN(weightNum) || weightNum < 25 || weightNum > 300) {
      e.weight = "Enter weight between 25kg and 300kg.";
    }

    if (!form.height) {
      e.height = "Height is required.";
    } else if (isNaN(heightNum) || heightNum < 100 || heightNum > 300) {
      e.height = "Enter height between 100cm and 300cm.";
    }

    if (!form.goal) {
      e.goal = "Please select your goal.";
    }

    if (!form.activityLevel) {
      e.activityLevel = "Please select your activity level.";
    }

    if (!form.dietPreference) {
      e.dietPreference = "Please select your diet preference.";
    }

    if (!form.workoutExperience) {
      e.workoutExperience = "Please select your experience level.";
    }

    if (!form.workoutDaysPerWeek) {
      e.workoutDaysPerWeek = "Workout days per week is required.";
    } else if (isNaN(daysNum) || daysNum < 1 || daysNum > 7) {
      e.workoutDaysPerWeek = "Enter between 1 and 7 days.";
    }

    if (!form.preferredWorkoutLocation) {
      e.preferredWorkoutLocation = "Please select your location.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    setSuccessMessage("");
    try {
      const payload = {
        age: parseInt(form.age, 10),
        gender: form.gender,
        weight: parseFloat(form.weight),
        height: parseFloat(form.height),
        activityLevel: form.activityLevel,
        goal: form.goal,
        dietPreference: form.dietPreference,
        workoutExperience: form.workoutExperience,
        workoutDaysPerWeek: parseInt(form.workoutDaysPerWeek, 10),
        preferredWorkoutLocation: form.preferredWorkoutLocation,
      };
      await updateProfile(payload);
      
      // Also update localStorage cached user weight
      localStorage.setItem("nf_weight", payload.weight.toString());

      setSuccessMessage(isNewProfile ? "Profile setup complete. Welcome." : "Profile targets optimized successfully.");
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save targets. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <MainLayout>
      {/* ── Main Container ── */}
      <main className="max-w-[48rem] w-full mx-auto px-6 mt-8 pb-12 flex-1 flex flex-col gap-6 relative z-10 text-left">
        {/* Navigation Breadcrumb (Only show if not new onboarding state) */}
        {!isNewProfile && (
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 text-[13px] font-semibold self-start transition-colors duration-200"
          >
            <HiOutlineChevronLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        )}

        {/* Headline */}
        <section className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold tracking-tight text-stone-100 font-sans">
            {isNewProfile ? "Complete Onboarding" : "Profile Settings"}
          </h1>
          <p className="text-[13px] text-stone-400 leading-relaxed font-sans">
            {isNewProfile ? "Set your target metrics to launch your custom AI plans." : "Shaping metrics to fine-tune AI recommendations."}
          </p>
        </section>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Spinner />
            <span className="text-xs text-[#B2967D] font-semibold tracking-wider uppercase font-mono">
              Loading metabolic data...
            </span>
          </div>
        ) : (
          <div
            className="rounded-2xl border"
            style={{
              background: C.card,
              borderColor: C.cardBorder,
              boxShadow: C.cardShadow,
            }}
          >
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-8">
              
              {/* Onboarding Welcome Message */}
              {isNewProfile && (
                <div 
                  className="rounded-xl px-4 py-3 text-[13px] leading-relaxed flex items-center gap-3"
                  style={{
                    background: "rgba(178, 150, 125, 0.05)",
                    border: "1px solid rgba(178, 150, 125, 0.15)",
                    color: C.accent,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="7.5" cy="7.5" r="6" />
                    <path d="M7.5 4v4M7.5 10.5h.01" strokeLinecap="round" />
                  </svg>
                  <span>First steps. Provide your details below so our engine can forge your target calorie and protein limits.</span>
                </div>
              )}

              {/* API Banners */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed"
                    style={{
                      background: "rgba(141, 197, 149, 0.04)",
                      border: `1px solid rgba(141, 197, 149, 0.25)`,
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
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                {apiError && (
                  <motion.div
                    className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed"
                    style={{
                      background: C.dangerBg,
                      border: `1px solid ${C.dangerBorder}`,
                      color: C.danger,
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
                    <span>{apiError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SECTION: Biological Metrics */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#B2967D] border-b pb-2 border-[rgba(255,255,255,0.03)] font-mono">
                  Biological Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <InputField
                    id="age"
                    label="Age"
                    type="number"
                    placeholder="e.g. 28"
                    value={form.age}
                    onChange={handleChange}
                    error={errors.age}
                    disabled={saving}
                  />

                  <SelectField
                    id="gender"
                    label="Gender"
                    value={form.gender}
                    onChange={handleChange}
                    disabled={saving}
                    error={errors.gender}
                    options={[
                      { value: "", label: "Select gender...", disabled: true },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      id="weight"
                      label="Weight (kg)"
                      type="number"
                      placeholder="e.g. 74"
                      value={form.weight}
                      onChange={handleChange}
                      error={errors.weight}
                      disabled={saving}
                    />
                    <InputField
                      id="height"
                      label="Height (cm)"
                      type="number"
                      placeholder="e.g. 178"
                      value={form.height}
                      onChange={handleChange}
                      error={errors.height}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Lifestyle & Preferences */}
              <div className="flex flex-col gap-4">
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#B2967D] border-b pb-2 border-[rgba(255,255,255,0.03)] font-mono">
                  Lifestyle & Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SelectField
                    id="goal"
                    label="Fitness Goal"
                    value={form.goal}
                    onChange={handleChange}
                    disabled={saving}
                    error={errors.goal}
                    options={[
                      { value: "", label: "Select goal...", disabled: true },
                      { value: "muscle_gain", label: "Muscle Gain (+300 kcal surplus)" },
                      { value: "fat_loss", label: "Fat Loss (-300 kcal deficit)" },
                      { value: "maintenance", label: "Maintenance (Zero balance)" },
                    ]}
                  />

                  <SelectField
                    id="activityLevel"
                    label="Daily Activity Multiplier"
                    value={form.activityLevel}
                    onChange={handleChange}
                    disabled={saving}
                    error={errors.activityLevel}
                    options={[
                      { value: "", label: "Select activity level...", disabled: true },
                      { value: "sedentary", label: "Sedentary (desk work, no exercise)" },
                      { value: "lightly_active", label: "Lightly Active (1-3 days light workout)" },
                      { value: "moderately_active", label: "Moderately Active (3-5 days gym workout)" },
                      { value: "very_active", label: "Very Active (6-7 days heavy training)" },
                    ]}
                  />

                  <SelectField
                    id="dietPreference"
                    label="Diet Preference"
                    value={form.dietPreference}
                    onChange={handleChange}
                    disabled={saving}
                    error={errors.dietPreference}
                    options={[
                      { value: "", label: "Select diet preference...", disabled: true },
                      { value: "non_vegetarian", label: "Non-Vegetarian" },
                      { value: "vegetarian", label: "Vegetarian" },
                      { value: "vegan", label: "Vegan" },
                    ]}
                  />

                  <SelectField
                    id="workoutExperience"
                    label="Workout Experience"
                    value={form.workoutExperience}
                    onChange={handleChange}
                    disabled={saving}
                    error={errors.workoutExperience}
                    options={[
                      { value: "", label: "Select experience level...", disabled: true },
                      { value: "beginner", label: "Beginner" },
                      { value: "intermediate", label: "Intermediate" },
                      { value: "advanced", label: "Advanced" },
                    ]}
                  />

                  <InputField
                    id="workoutDaysPerWeek"
                    label="Workout Days per Week"
                    type="number"
                    placeholder="e.g. 4"
                    value={form.workoutDaysPerWeek}
                    onChange={handleChange}
                    error={errors.workoutDaysPerWeek}
                    disabled={saving}
                  />

                  <SelectField
                    id="preferredWorkoutLocation"
                    label="Preferred Workout Location"
                    value={form.preferredWorkoutLocation}
                    onChange={handleChange}
                    disabled={saving}
                    error={errors.preferredWorkoutLocation}
                    options={[
                      { value: "", label: "Select location...", disabled: true },
                      { value: "gym", label: "Gymnasium" },
                      { value: "home", label: "Home gym / Calisthenics" },
                    ]}
                  />
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                id="profile-save-btn"
                type="submit"
                disabled={saving}
                whileHover={!saving ? { scale: 1.006 } : {}}
                whileTap={!saving ? { scale: 0.994 } : {}}
                className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-lg py-3.5 text-[14px] font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: "#F5F4F2",
                  color: "#121110",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1.5px 0 rgba(255, 255, 255, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "#DFD8CD";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F5F4F2";
                }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Optimizing metrics...
                  </span>
                ) : (
                  <>
                    <HiOutlineSave size={16} />
                    <span>{isNewProfile ? "Complete Onboarding Setup" : "Save Target Metrics"}</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        )}
      </main>
    </MainLayout>
  );
};

export default ProfilePage;