import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasStoredAccessToken } from '../../services/authApi';

/**
 * A wrapper component for routes that require authentication.
 * If the user is not authenticated, it redirects them to the right sign-in surface,
 * while preserving the attempted location so they can be redirected back after login.
 */
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = hasStoredAccessToken();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
