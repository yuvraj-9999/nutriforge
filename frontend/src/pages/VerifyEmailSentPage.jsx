import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ─── Design Tokens (matches app-wide palette) ────────────────
const C = {
  card:          "#1B1A19",
  accent:        "#B2967D",
  text:          "#F5F4F2",
  sub:           "#9E9790",
  muted:         "#5C5854",
  faint:         "rgba(255, 255, 255, 0.03)",
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
    <filter id="nf-ves-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.72"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#nf-ves-grain)" />
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
        stroke="url(#ves-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.5" r="1.2" fill="#B2967D" />
      <defs>
        <linearGradient id="ves-grad" x1="12" y1="2.5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
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

// ─── Main Page ────────────────────────────────────────────────
const VerifyEmailSentPage = () => (
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

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="flex flex-col items-center text-center gap-5 py-2"
          >
            {/* Email icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(178, 150, 125, 0.08)",
                border: "1px solid rgba(178, 150, 125, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2.5" y="5.5" width="17" height="11" rx="1.5" stroke={C.accent} strokeWidth="1.4" />
                <path
                  d="M2.5 7L11 13L19.5 7"
                  stroke={C.accent}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-[18px] font-bold tracking-[-0.02em] mb-3" style={{ color: C.text }}>
                Check your email
              </h1>
              <p className="text-[13px] leading-relaxed" style={{ color: C.sub }}>
                We've sent a verification link to your email address.
              </p>
              <p className="text-[13px] leading-relaxed mt-1" style={{ color: C.sub }}>
                Please verify your email before signing in.
              </p>
              <p className="text-[12px] leading-relaxed mt-3" style={{ color: C.muted }}>
                If you don't see the email, check your spam folder.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Card footer */}
        <div
          className="px-8 py-4 flex items-center justify-center"
          style={{ borderTop: `1px solid ${C.faint}`, background: "rgba(0,0,0,0.08)" }}
        >
          <p className="text-[12.5px]" style={{ color: C.muted }}>
            Didn't receive it?{" "}
            <Link
              to="/register"
              id="ves-try-again"
              className="transition-colors duration-150"
              style={{ color: C.sub, fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = C.sub)}
            >
              Try signing up again
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

export default VerifyEmailSentPage;
