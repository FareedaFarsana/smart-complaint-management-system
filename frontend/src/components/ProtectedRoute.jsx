import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

function ProtectedRoute({ children, allowedRoles }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("access");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("users/me/");
                setRole(response.data.role);
            } catch (error) {
                console.error("Failed to verify user:", error);
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!localStorage.getItem("access")) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
