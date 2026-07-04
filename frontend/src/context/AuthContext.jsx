import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // ── Persisted state — hydrated directly from localStorage so there is
    //    no flash of unauthenticated content on page load.
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser]   = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    // ── Deduplication guard ─────────────────────────────────────────────────
    // A plain ref (not state) so toggling it never causes a re-render.
    // Prevents multiple simultaneous 401 responses from triggering logout
    // more than once (the "thundering herd" problem).
    const sessionExpiredHandled = useRef(false);

    // ── login ───────────────────────────────────────────────────────────────
    const login = (userData, jwtToken) => {
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);

        // Reset the guard so a future expiry in the same browser session is
        // handled correctly if the user logs in and out multiple times.
        sessionExpiredHandled.current = false;
    };

    // ── logout ──────────────────────────────────────────────────────────────
    // Canonical cleanup. Called by both manual logout and handleSessionExpired.
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    // ── handleSessionExpired ────────────────────────────────────────────────
    // The ONLY entry point for expiry-driven logout.
    //
    // Responsibilities (all centralised here — never in Axios):
    //   1. Guard against duplicate execution via sessionExpiredHandled ref.
    //   2. Delegate cleanup to the existing logout() function (no duplication).
    //   3. Show exactly one toast notification.
    //   4. Navigate to /login using React Router (no window.location).
    //
    // useCallback with [logout, navigate] so the event listener in the effect
    // below always references a stable function and can be properly torn down.
    const handleSessionExpired = useCallback(() => {
        // ── Duplicate guard ──────────────────────────────────────────────
        // If another concurrent 401 already triggered this, do nothing.
        if (sessionExpiredHandled.current) return;
        sessionExpiredHandled.current = true;

        // ── Reuse existing logout logic (no duplication) ─────────────────
        logout();

        // ── Single notification ──────────────────────────────────────────
        toast.error(
            "For your security, your session has expired. Please sign in again.",
            { id: "session-expired", duration: 5000 }
            // The `id` option de-duplicates toasts at the library level as a
            // second line of defence — react-hot-toast will ignore any toast
            // call with the same id if one is already visible.
        );

        // ── Navigate without page reload ─────────────────────────────────
        // replace:true removes the expired page from history so the Back
        // button doesn't return to a page that would immediately 401 again.
        navigate("/login", { replace: true });
    }, [logout, navigate]);

    // ── Bridge: listen for the "session:expired" event dispatched by Axios ──
    //
    // Why a custom DOM event instead of passing handleSessionExpired directly
    // to the Axios module?
    //
    // Axios lives outside React's component tree — it is a plain JS module
    // instantiated once at import time.  It cannot consume React context or
    // call hooks.  The cleanest bridge that satisfies every constraint is the
    // browser's native CustomEvent API:
    //
    //   • Axios dispatches ONE event — it detects; it does NOT act.
    //   • AuthContext listens and acts — single source of truth preserved.
    //   • No authRef objects, no window.location, no duplicated logic.
    //   • The listener is torn down on unmount — no memory leaks.
    useEffect(() => {
        const onSessionExpired = () => handleSessionExpired();
        window.addEventListener("session:expired", onSessionExpired);

        return () => {
            window.removeEventListener("session:expired", onSessionExpired);
        };
    }, [handleSessionExpired]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                // Expose handleSessionExpired so any future consumer (e.g.
                // a WebSocket handler) can also trigger the expiry flow.
                handleSessionExpired,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for consuming AuthContext.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
