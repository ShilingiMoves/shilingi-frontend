import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasStoredAccessToken } from '../../services/authApi';

/**
 * A wrapper component for routes that require authentication.
 * If the user is not authenticated, it redirects them to the right sign-in surface,
 * while preserving the attempted location so they can be redirected back after login.
 */
const getSignInPath = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
        return '/onboarding?auth=signin';
    }

    return '/signin';
};

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = hasStoredAccessToken();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={getSignInPath()} state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
