import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineLogout, HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

// ─── Shared Palette (mirrors page-level C object) ─────────────
const C = {
  bg:          "#131211",
  card:        "#1B1A19",
  panel:       "#22201F",
  accent:      "#B2967D",
  accentHover: "#C3A58C",
  text:        "#F5F4F2",
  faint:       "rgba(255, 255, 255, 0.03)",
};

// ─── Brand Symbol ─────────────────────────────────────────────
const BrandMark = () => (
  <div
    style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}
    aria-hidden="true"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="#2D2C2A" strokeWidth="1.2" />
      <path
        d="M12 2.5C17.25 2.5 21.5 6.75 21.5 12C21.5 15.5 19.5 18.5 16.5 20.5"
        stroke="url(#nav-brand-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2.5" r="1.2" fill="#B2967D" />
      <defs>
        <linearGradient id="nav-brand-grad" x1="12" y1="2.5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5F4F2" />
          <stop offset="50%" stopColor="#B2967D" />
          <stop offset="100%" stopColor="#1B1A19" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// ─── Brand Wordmark ───────────────────────────────────────────
const Wordmark = () => (
  <div className="flex items-baseline select-none font-sans">
    <span style={{ fontSize: 15.5, fontWeight: 400, color: C.text, letterSpacing: "-0.015em" }}>
      Nutri
    </span>
    <span style={{ fontSize: 15.5, fontWeight: 700, color: C.accent, letterSpacing: "-0.03em", marginLeft: "0.2px" }}>
      Forge
    </span>
  </div>
);

// ─── Navigation links definition ──────────────────────────────
const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Coach",     to: "/coach"     },
  { label: "Profile",   to: "/profile"   },
];

// ═════════════════════════════════════════════════════════════
// Navbar
// ═════════════════════════════════════════════════════════════
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    setMobileOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Desktop + Mobile Header Bar ── */}
      <header
        className="w-full border-b sticky top-0 z-30"
        style={{
          background: "rgba(19, 18, 17, 0.82)",
          backdropFilter: "blur(14px)",
          borderColor: C.faint,
        }}
      >
        <div className="max-w-[72rem] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Brand + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-3"
              onClick={handleNavClick}
              aria-label="NutriForge home"
            >
              <BrandMark />
              <Wordmark />
            </Link>

            {/* Desktop nav links — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, to }) => {
                const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className="text-[13px] font-semibold tracking-wide transition-colors duration-200"
                    style={{ color: isActive ? C.accent : "#9E9790" }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = C.text; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#9E9790"; }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: User + Signout (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-4">
            {/* Username — hide on very small screens */}
            <span className="text-[13px] font-semibold text-stone-300 hidden sm:inline">
              {user?.name || "Athlete"}
            </span>

            {/* Desktop sign out button */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-md border text-stone-400 transition-all duration-200 cursor-pointer"
              style={{ borderColor: C.faint, background: C.panel }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.text;
                e.currentTarget.style.borderColor = C.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#A8A29E";
                e.currentTarget.style.borderColor = C.faint;
              }}
              aria-label="Sign out"
            >
              <HiOutlineLogout size={14} />
              <span>Sign Out</span>
            </button>

            {/* Mobile hamburger button — visible only on small screens */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border text-stone-300 transition-all duration-200 cursor-pointer"
              style={{ borderColor: C.faint, background: C.panel }}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileOpen ? <HiOutlineX size={18} /> : <HiOutlineMenuAlt3 size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Dropdown Panel ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-down panel */}
            <motion.nav
              id="mobile-nav-menu"
              role="navigation"
              aria-label="Mobile navigation"
              className="fixed top-16 left-0 right-0 z-30 md:hidden border-b"
              style={{
                background: "rgba(27, 26, 25, 0.97)",
                backdropFilter: "blur(20px)",
                borderColor: C.faint,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="max-w-[72rem] mx-auto px-6 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ label, to }) => {
                  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200"
                      style={{
                        color: isActive ? C.accent : "#9E9790",
                        background: isActive ? "rgba(178,150,125,0.06)" : "transparent",
                      }}
                    >
                      {isActive && (
                        <span
                          className="w-1 h-4 rounded-full"
                          style={{ background: C.accent }}
                          aria-hidden="true"
                        />
                      )}
                      {label}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="my-1 border-t" style={{ borderColor: C.faint }} />

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-stone-400 hover:text-[#D26E64] transition-all duration-200 cursor-pointer text-left"
                >
                  <HiOutlineLogout size={16} />
                  Sign Out
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
