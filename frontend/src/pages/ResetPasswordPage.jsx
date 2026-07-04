import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

import { resetPassword } from "../services/auth.services.js";
import InputField from "../components/InputField.jsx";

// ─── Grounded Mature Palette (matches app-wide design system) ──
const C = {
  bg:           "#131211",
  card:         "#1B1A19",
  accent:       "#B2967D",
  accentHover:  "#C3A58C",
  text:         "#F5F4F2",
  sub:          "#9E9790",
  muted:        "#5C5854",
  faint:        "rgba(255, 255, 255, 0.03)",
  success:      "#6DBF8A",
  successBg:    "rgba(109, 191, 138, 0.06)",
  successBorder:"rgba(109, 191, 138, 0.18)",
  danger:       "#D26E64",
  dangerBg:     "rgba(210, 110, 100, 0.04)",
  dangerBorder: "rgba(210, 110, 100, 0.15)",
  cardBorder:   "rgba(255, 255, 255, 0.03)",
  cardShadow:   "0 24px 56px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.02) inset",
};

// ─── Tactile Grain Overlay ───────────────────────────────────
const GrainTexture = () => (
  <svg
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.02,
    }}
  >
    <filter id="nf-rp-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.72"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#nf-rp-grain)" />
  </svg>
);

// ─── Brand Mark ──────────────────────────────────────────────
const BrandMark = () => (
  <div
    style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
    aria-hidden="true"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="#2C2A29" strokeWidth="1.2" />
      <path
        d="M12 2.5C17.25 2.5 21.5 6.75 21.5 12C21.5 15.5 19.5 18.5 16.5 20.5"
        stroke="url(#rp-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.5" r="1.2" fill="#B2967D" />
      <defs>
        <linearGradient id="rp-grad" x1="12" y1="2.5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5F4F2" />
          <stop offset="50%" stopColor="#B2967D" />
          <stop offset="100%" stopColor="#1B1A19" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// ─── Wordmark ─────────────────────────────────────────────────
const Wordmark = () => (
  <div className="flex items-baseline select-none font-sans">
    <span style={{ fontSize: 17.5, fontWeight: 400, color: C.text, letterSpacing: "-0.015em" }}>
      Nutri
    </span>
    <span style={{ fontSize: 17.5, fontWeight: 700, color: C.accent, letterSpacing: "-0.03em", marginLeft: "0.2px" }}>
      Forge
    </span>
  </div>
);

// ─── Error Banner ────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        key="rp-err"
        role="alert"
        aria-live="polite"
        className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed text-left"
        style={{ background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, color: C.danger }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 4V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="7" cy="10" r="0.7" fill="currentColor" />
        </svg>
        <span>{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Spinner ─────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.2" />
    <path d="M13 7.5a5.5 5.5 0 01-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ─── Success State ────────────────────────────────────────────
const SuccessView = () => (
  <motion.div
    key="rp-success"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center text-center gap-5 py-4"
  >
    {/* Animated check circle */}
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: C.successBg,
        border: `1px solid ${C.successBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M5 11.5L9 15.5L17 7"
          stroke={C.success}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>

    <div>
      <h2
        className="text-[18px] font-bold tracking-[-0.02em] mb-2"
        style={{ color: C.text }}
      >
        Password reset
      </h2>
      <p className="text-[13px] leading-relaxed" style={{ color: C.sub }}>
        Your password has been updated successfully.
      </p>
      <p className="text-[12px] mt-3 leading-relaxed" style={{ color: C.muted }}>
        Redirecting you to login…
      </p>
    </div>
  </motion.div>
);

// ─── Password Field with Toggle ───────────────────────────────
const PasswordField = ({ id, label, value, onChange, error, disabled, showPassword, onToggle, placeholder, autoComplete }) => (
  <div className="flex flex-col gap-1.5">
    <InputField
      id={id}
      label={label}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      autoComplete={autoComplete}
      rightElement={
        <button
          type="button"
          id={`${id}-toggle`}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={onToggle}
          className="transition-colors duration-150 focus:outline-none rounded p-0.5"
          style={{ color: C.muted }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          {showPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
        </button>
      }
    />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────
const ResetPasswordPage = () => {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError,  setApiError]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);

  // ── Client-side validation ──────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = ({ target: { id, value } }) => {
    // Map input id to form key (strip "rp-" prefix)
    const key = id === "rp-password" ? "password" : "confirmPassword";
    setForm(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      await resetPassword(token, form.password);
      setDone(true);
      // Redirect to /login after ~2 seconds
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-5 sm:p-8 relative"
      style={{ background: "radial-gradient(circle at top, #1E1C1B 0%, #121110 50%, #0C0B0A 100%)" }}
    >
      <GrainTexture />

      {/* Main Container */}
      <motion.div
        className="relative w-full max-w-[24.5rem] flex flex-col items-center z-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            background: C.card,
            border: `1px solid ${C.cardBorder}`,
            boxShadow: C.cardShadow,
          }}
        >
          {/* Card body */}
          <div className="px-8 pt-8 pb-8">

            {/* Brand Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <BrandMark />
              <Wordmark />
            </div>

            {/* Brushed Copper Brand Divider */}
            <div className="relative w-full h-[1.2px] bg-[rgba(255,255,255,0.03)] mb-8" aria-hidden="true">
              <div className="absolute left-0 top-0 h-full w-7 bg-[#B2967D]" style={{ opacity: 0.9 }} />
            </div>

            <AnimatePresence mode="wait">
              {done ? (
                <SuccessView key="success" />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Heading */}
                  <div className="mb-6 text-left">
                    <h1 className="text-[22px] font-bold tracking-[-0.025em] mb-1.5 text-stone-100">
                      Reset Password
                    </h1>
                    <p className="text-[13px] text-stone-400 leading-relaxed">
                      Choose a strong new password for your account.
                    </p>
                  </div>

                  {/* API Error */}
                  {apiError && (
                    <div className="mb-5">
                      <ErrorBanner message={apiError} />
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                    {/* New Password */}
                    <PasswordField
                      id="rp-password"
                      label="New Password"
                      value={form.password}
                      onChange={handleChange}
                      error={fieldErrors.password}
                      disabled={loading}
                      showPassword={showPw}
                      onToggle={() => setShowPw(v => !v)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />

                    {/* Confirm Password */}
                    <PasswordField
                      id="rp-confirm"
                      label="Confirm Password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      error={fieldErrors.confirmPassword}
                      disabled={loading}
                      showPassword={showConfPw}
                      onToggle={() => setShowConfPw(v => !v)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />

                    {/* Password strength hint */}
                    <p className="text-[12px] leading-relaxed -mt-1" style={{ color: C.muted }}>
                      Minimum 8 characters. Use a mix of letters and numbers for a stronger password.
                    </p>

                    {/* Submit Button */}
                    <motion.button
                      id="rp-submit-btn"
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.008 } : {}}
                      whileTap={!loading ? { scale: 0.992 } : {}}
                      className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-[14px] font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: "#F5F4F2",
                        color: "#121110",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1.5px 0 rgba(255, 255, 255, 0.45)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#DFD8CD"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#F5F4F2"; }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spinner />
                          Resetting...
                        </span>
                      ) : (
                        <span>Reset Password</span>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card footer strip */}
          <div
            className="px-8 py-4 flex items-center justify-center"
            style={{ borderTop: `1px solid ${C.faint}`, background: "rgba(0,0,0,0.08)" }}
          >
            <p className="text-[13px]" style={{ color: C.sub }}>
              <Link
                to="/login"
                id="rp-back-to-login"
                className="font-semibold transition-colors duration-150 text-stone-200 inline-flex items-center gap-1.5"
                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = "")}
                aria-label="Back to login page"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M8 2.5L4.5 6.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-[11.5px] text-center" style={{ color: C.muted }}>
          © {new Date().getFullYear()} NutriForge. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
