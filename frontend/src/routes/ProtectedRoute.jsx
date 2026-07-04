import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to /login (not "/") so the URL is explicit and consistent
        // with the session-expiry redirect in AuthContext.
        // replace:true prevents the protected page from sitting in history
        // — the user can't click Back to re-enter a route they're not
        // authenticated for.
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;