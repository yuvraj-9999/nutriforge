import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

import { registerUser } from "../services/auth.services.js";
import { useAuth } from "../context/AuthContext.jsx";
import InputField from "../components/InputField.jsx";

// ─── Grounded Mature Palette ──────────────────────────────────
const C = {
  bg:           "#131211",  // deep warm smoked charcoal base
  card:         "#1B1A19",  // warm graphite card surface
  accent:       "#B2967D",  // organic brushed copper highlight
  accentHover:  "#C3A58C",
  text:         "#F5F4F2",  // warm ivory
  sub:          "#9E9790",  // muted stone gray
  muted:        "#5C5854",  // dark stone placeholder
  faint:        "rgba(255, 255, 255, 0.03)",  // hairline card dividers
  danger:       "#D26E64",  // soft red error text
  dangerBg:     "rgba(210, 110, 100, 0.04)",
  dangerBorder: "rgba(210, 110, 100, 0.15)",
  cardBorder:   "rgba(255, 255, 255, 0.03)",
  cardShadow:   "0 20px 48px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.02) inset",
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
    <filter id="nf-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.72"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#nf-grain)" />
  </svg>
);

// ─── Design-Forward Brand Symbol ──────────────────────────────
const BrandMark = () => (
  <div
    style={{
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    aria-hidden="true"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base structural track representing consistency / loop */}
      <circle cx="12" cy="12" r="9.5" stroke="#2C2A29" strokeWidth="1.2" />
      {/* Precision forged wedge track showing raw potential transitioning to polished ivory & copper */}
      <path
        d="M12 2.5C17.25 2.5 21.5 6.75 21.5 12C21.5 15.5 19.5 18.5 16.5 20.5"
        stroke="url(#refine-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Small marker dot at the starting point of the cut, showing target precision */}
      <circle cx="12" cy="2.5" r="1.2" fill="#B2967D" />
      <defs>
        <linearGradient id="refine-grad" x1="12" y1="2.5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5F4F2" />
          <stop offset="50%" stopColor="#B2967D" />
          <stop offset="100%" stopColor="#1B1A19" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// ─── Brand Wordmark (Standard Casing) ──────────────────────────
const Wordmark = () => (
  <div className="flex items-baseline select-none font-sans">
    <span
      style={{
        fontSize: 17.5,
        fontWeight: 400,
        color: C.text,
        letterSpacing: "-0.015em",
      }}
    >
      Nutri
    </span>
    <span
      style={{
        fontSize: 17.5,
        fontWeight: 700,
        color: C.accent,
        letterSpacing: "-0.03em",
        marginLeft: "0.2px",
      }}
    >
      Forge
    </span>
  </div>
);

// ─── Success Banner ──────────────────────────────────────────
const SuccessBanner = ({ message }) => (
  <motion.div
    role="status"
    className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed text-left"
    style={{
      background: "rgba(141, 197, 149, 0.04)",
      border: `1px solid rgba(141, 197, 149, 0.25)`,
      color: "#8DC595",
    }}
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    <svg
      className="mt-0.5 shrink-0"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.5L6 9L9.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span>{message}</span>
  </motion.div>
);

// ─── Error Banner ────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        key="err"
        role="alert"
        className="flex items-start gap-2.5 rounded-lg px-4 py-3 text-[13px] leading-relaxed text-left"
        style={{
          background: C.dangerBg,
          border: `1px solid ${C.dangerBorder}`,
          color: C.danger,
        }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <svg
          className="mt-0.5 shrink-0"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
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

// ═════════════════════════════════════════════════════════════
// RegisterPage — Grounded Redesign matching LoginPage
// ═════════════════════════════════════════════════════════════
const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) {
      e.name = "Full name is required.";
    }
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 6) {
      e.password = "Must be at least 6 characters.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = ({ target: { id, value } }) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) setFieldErrors((prev) => ({ ...prev, [id]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    setSuccess(false);
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1800);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again."
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
      {/* Tactile grain overlay */}
      <GrainTexture />

      {/* Main Container */}
      <motion.div
        className="relative w-full max-w-[24.5rem] flex flex-col items-center z-10 my-6"
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
            {/* Integrated Brand Header inside the card */}
            <div className="flex items-center gap-3.5 mb-5">
              <BrandMark />
              <Wordmark />
            </div>

            {/* Signature Brand Divider with Brushed Copper Highlight bar */}
            <div className="relative w-full h-[1.2px] bg-[rgba(255,255,255,0.03)] mb-8" aria-hidden="true">
              <div
                className="absolute left-0 top-0 h-full w-7 bg-[#B2967D]"
                style={{ opacity: 0.9 }}
              />
            </div>

            {/* Heading — Grounded and clear */}
            <div className="mb-6 text-left">
              <h1 className="text-[22px] font-bold tracking-[-0.025em] mb-1.5 text-stone-100 font-sans">
                Create account
              </h1>
              <p className="text-[13px] text-stone-400 leading-relaxed font-sans">
                Start building better habits.
              </p>
            </div>

            {/* Success State Notification */}
            {success && (
              <div className="mb-5">
                <SuccessBanner message="Account created. Redirecting..." />
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="mb-5">
                <ErrorBanner message={apiError} />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Full Name */}
              <InputField
                id="name"
                label="Full Name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                error={fieldErrors.name}
                disabled={loading || success}
                autoComplete="name"
                autoFocus
              />

              {/* Email */}
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                error={fieldErrors.email}
                disabled={loading || success}
                autoComplete="email"
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-[13px] font-semibold select-none text-left"
                  style={{ color: "#F5F4F2" }}
                >
                  Password
                </label>
                <InputField
                  id="password"
                  label={null}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  disabled={loading || success}
                  autoComplete="new-password"
                  rightElement={
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="transition-colors duration-150 focus:outline-none rounded p-0.5"
                      style={{ color: C.muted }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                    >
                      {showPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                    </button>
                  }
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-[13px] font-semibold select-none text-left"
                  style={{ color: "#F5F4F2" }}
                >
                  Confirm Password
                </label>
                <InputField
                  id="confirmPassword"
                  label={null}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  disabled={loading || success}
                  autoComplete="new-password"
                  rightElement={
                    <button
                      type="button"
                      id="toggle-confirm-password-visibility"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="transition-colors duration-150 focus:outline-none rounded p-0.5"
                      style={{ color: C.muted }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                    >
                      {showConfirmPassword ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                    </button>
                  }
                />
              </div>

              {/* High Contrast Primary Button with py-3.5 height */}
              <motion.button
                id="register-submit-btn"
                type="submit"
                disabled={loading || success}
                whileHover={!(loading || success) ? { scale: 1.008 } : {}}
                whileTap={!(loading || success) ? { scale: 0.992 } : {}}
                className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-[14px] font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#F5F4F2",
                  color: "#121110",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1.5px 0 rgba(255, 255, 255, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                onMouseEnter={(e) => {
                  if (!(loading || success)) {
                    e.currentTarget.style.background = "#DFD8CD"; // warm platinum hover
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F5F4F2";
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Creating account...
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>
            </form>
          </div>

          {/* Card footer strip */}
          <div
            className="px-8 py-4 flex items-center justify-center"
            style={{
              borderTop: `1px solid ${C.faint}`,
              background: "rgba(0,0,0,0.08)",
            }}
          >
            <p className="text-[13px]" style={{ color: C.sub }}>
              Already have an account?{" "}
              <Link
                to="/"
                id="login-link"
                className="font-semibold transition-colors duration-150 text-stone-200"
                onMouseEnter={(e) => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "currentColor")}
              >
                Sign in
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

export default RegisterPage;