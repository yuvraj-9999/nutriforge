import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PlanPage from "./pages/PlanPage";
import ProfilePage from "./pages/ProfilePage";
import CoachPage from "./pages/CoachPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import VerifyEmailSentPage from "./pages/VerifyEmailSentPage";
import ScrollToTop from "./components/ScrollToTop";

// App.jsx is responsible only for application UI:
// - the global toast renderer
// - scroll restoration
// - the route definitions
// All providers (BrowserRouter, AuthProvider) live in main.jsx.
function App() {
  return (
    <>
      {/*
       * Toaster is the single global mount point for react-hot-toast.
       * Notifications triggered anywhere in the app — including from
       * AuthContext's handleSessionExpired() — render here.
       * Styled to match NutriForge's dark palette.
       */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1B1A19",
            color: "#F5F4F2",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "12px",
            fontSize: "13.5px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            padding: "12px 16px",
          },
          error: {
            iconTheme: {
              primary: "#D26E64",
              secondary: "#1B1A19",
            },
          },
        }}
      />

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/plans/:id" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><CoachPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
