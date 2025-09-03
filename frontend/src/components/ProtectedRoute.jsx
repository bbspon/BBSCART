import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../services/authService";

const ProtectedRoute = ({ requiredRole }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    if (loading) return <p>Loading...</p>; // ✅ Show loading while fetching user

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;