import Navbar from "../components/Navbar";

// ─── Grain Texture Overlay ─────────────────────────────────────
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
    <filter id="nf-layout-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.72"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#nf-layout-grain)" />
  </svg>
);

/**
 * MainLayout
 *
 * Shared authenticated page wrapper that renders:
 *  - GrainTexture background overlay
 *  - Navbar (sticky, glass)
 *  - Slotted page children
 *
 * Usage:
 *   <MainLayout>
 *     <YourPageContent />
 *   </MainLayout>
 */
const MainLayout = ({ children }) => {
  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-x-hidden"
      style={{ background: "#131211" }}
    >
      <GrainTexture />
      <Navbar />
      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
