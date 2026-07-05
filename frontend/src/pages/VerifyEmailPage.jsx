import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { verifyEmail } from "../services/auth.services.js";

// ─── Design Tokens (matches app-wide palette) ────────────────
const C = {
  bg:            "#131211",
  card:          "#1B1A19",
  accent:        "#B2967D",
  text:          "#F5F4F2",
  sub:           "#9E9790",
  muted:         "#5C5854",
  faint:         "rgba(255, 255, 255, 0.03)",
  success:       "#6DBF8A",
  successBg:     "rgba(109, 191, 138, 0.06)",
  successBorder: "rgba(109, 191, 138, 0.18)",
  danger:        "#D26E64",
  dangerBg:      "rgba(210, 110, 100, 0.06)",
  dangerBorder:  "rgba(210, 110, 100, 0.18)",
  cardBorder:    "rgba(255, 255, 255, 0.03)",
  cardShadow:    "0 24px 56px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.02) inset",
};

// ─── Grain Overlay ───────────────────────────────────────────
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
    <filter id="nf-ve-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.72"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#nf-ve-grain)" />
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
        stroke="url(#ve-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.5" r="1.2" fill="#B2967D" />
      <defs>
        <linearGradient id="ve-grad" x1="12" y1="2.5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
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

// ─── Loading State ───────────────────────────────────────────
const LoadingView = () => (
  <motion.div
    key="ve-loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="flex flex-col items-center text-center gap-5 py-6"
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: `1.5px solid rgba(255,255,255,0.07)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      {/* Spinner ring */}
      <svg
        className="animate-spin"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.12" />
        <path
          d="M21 12a9 9 0 01-9 9"
          stroke={C.accent}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>

    <div>
      <p className="text-[14px] font-medium" style={{ color: C.sub }}>
        Verifying your email…
      </p>
    </div>
  </motion.div>
);

// ─── Success State ───────────────────────────────────────────
const SuccessView = () => (
  <motion.div
    key="ve-success"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center text-center gap-5 py-4"
  >
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
      <h1 className="text-[18px] font-bold tracking-[-0.02em] mb-2" style={{ color: C.text }}>
        Email Verified
      </h1>
      <p className="text-[13px] leading-relaxed" style={{ color: C.sub }}>
        Your email has been successfully verified.
      </p>
      <p className="text-[13px] leading-relaxed mt-1" style={{ color: C.sub }}>
        You can now sign in to your account.
      </p>
    </div>

    <Link
      to="/login"
      id="ve-go-to-login"
      className="mt-1 w-full flex items-center justify-center rounded-lg py-3.5 text-[14px] font-semibold transition-all duration-200 focus:outline-none"
      style={{
        background: "#F5F4F2",
        color: "#121110",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1.5px 0 rgba(255, 255, 255, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#DFD8CD")}
      onMouseLeave={e => (e.currentTarget.style.background = "#F5F4F2")}
    >
      Go to Login
    </Link>
  </motion.div>
);

// ─── Error State ─────────────────────────────────────────────
const ErrorView = () => (
  <motion.div
    key="ve-error"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center text-center gap-5 py-4"
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: C.dangerBg,
        border: `1px solid ${C.dangerBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke={C.danger} strokeWidth="1.4" />
        <path d="M10 6.5V11" stroke={C.danger} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="0.85" fill={C.danger} />
      </svg>
    </div>

    <div>
      <h1 className="text-[18px] font-bold tracking-[-0.02em] mb-2" style={{ color: C.text }}>
        Verification Failed
      </h1>
      <p className="text-[13px] leading-relaxed" style={{ color: C.sub }}>
        The verification link is invalid or has expired.
      </p>
    </div>

    <Link
      to="/login"
      id="ve-back-to-login"
      className="mt-1 w-full flex items-center justify-center rounded-lg py-3.5 text-[14px] font-semibold transition-all duration-200 focus:outline-none"
      style={{
        background: "#F5F4F2",
        color: "#121110",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1.5px 0 rgba(255, 255, 255, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#DFD8CD")}
      onMouseLeave={e => (e.currentTarget.style.background = "#F5F4F2")}
    >
      Back to Login
    </Link>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────
const VerifyEmailPage = () => {
  const { token } = useParams();

  // "loading" | "success" | "error"
  const [status, setStatus] = useState("loading");

  // Prevent duplicate verification requests in StrictMode
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const run = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus(data?.success ? "success" : "error");
      } catch {
        setStatus("error");
      }
    };
    run();
  }, [token]);

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-5 sm:p-8 relative"
      style={{ background: "radial-gradient(circle at top, #1E1C1B 0%, #121110 50%, #0C0B0A 100%)" }}
    >
      <GrainTexture />

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

            {/* Brushed Copper Divider */}
            <div className="relative w-full h-[1.2px] bg-[rgba(255,255,255,0.03)] mb-8" aria-hidden="true">
              <div className="absolute left-0 top-0 h-full w-7 bg-[#B2967D]" style={{ opacity: 0.9 }} />
            </div>

            <AnimatePresence mode="wait">
              {status === "loading" && <LoadingView key="loading" />}
              {status === "success" && <SuccessView key="success" />}
              {status === "error"   && <ErrorView   key="error"   />}
            </AnimatePresence>
          </div>

          {/* Card footer */}
          <div
            className="px-8 py-4 flex items-center justify-center"
            style={{ borderTop: `1px solid ${C.faint}`, background: "rgba(0,0,0,0.08)" }}
          >
            <p className="text-[13px]" style={{ color: C.sub }}>
              <Link
                to="/login"
                id="ve-footer-login"
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

        {/* Page footer */}
        <p className="mt-8 text-[11.5px] text-center" style={{ color: C.muted }}>
          © {new Date().getFullYear()} NutriForge. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
