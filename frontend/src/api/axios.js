import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Unchanged from original: attaches the JWT from localStorage to every request.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
//
// Single Responsibility: DETECT authentication failures and signal AuthContext.
//
// This interceptor deliberately does NOT:
//   - clear localStorage
//   - update React state
//   - show toasts
//   - navigate
//
// All of those responsibilities belong exclusively to AuthContext's
// handleSessionExpired().  Axios only dispatches a signal; AuthContext acts.
//
// ── Auth-only endpoints (bypass list) ───────────────────────────────────────
// These routes intentionally return 401 for bad credentials, not for session
// expiry.  Their pages already display inline errors, so we let the error
// propagate normally without triggering the global session-expiry flow.
const AUTH_ENDPOINTS = [
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
];

const isAuthEndpoint = (url = "") =>
    AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

api.interceptors.response.use(
    // ── Successful response — pass through untouched ─────────────────────
    (response) => response,

    // ── Error response ───────────────────────────────────────────────────
    (error) => {
        const status = error?.response?.status;
        const url    = error?.config?.url ?? "";

        // Not a 401, or it came from an auth endpoint — propagate normally.
        // Components that own those requests handle their own error states.
        if (status !== 401 || isAuthEndpoint(url)) {
            return Promise.reject(error);
        }

        // ── 401 on a protected endpoint ──────────────────────────────────
        // Dispatch a CustomEvent to the window.  AuthContext is listening
        // and will call handleSessionExpired() exactly once.
        //
        // Why dispatchEvent instead of calling AuthContext directly?
        // Axios is a plain JS module outside React's component tree — it
        // cannot consume context or call hooks.  The native browser event
        // system is the zero-dependency, no-global-state bridge that keeps
        // Axios decoupled from React while still notifying AuthContext.
        //
        // The deduplication guard inside handleSessionExpired() ensures that
        // if multiple concurrent requests all receive 401 simultaneously,
        // the logout + toast + navigate sequence executes only once.
        window.dispatchEvent(new CustomEvent("session:expired"));

        // Still reject so that any awaiting caller's catch block fires
        // and doesn't hang.  Components won't show their own errors because
        // the page will have already navigated to /login.
        return Promise.reject(error);
    }
);

export default api;