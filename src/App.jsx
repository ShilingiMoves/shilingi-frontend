import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppErrorBoundary from './components/AppErrorBoundary';
import ShilingiBuddy from './components/ShilingiBuddy';
import CookieConsentBanner from './components/CookieConsentBanner';

const Home = lazy(() => import('./pages/Home'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const AdvisoryPage = lazy(() => import('./pages/AdvisoryPage'));
const PartnershipsPage = lazy(() => import('./pages/PartnershipsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const DataProtectionPage = lazy(() => import('./pages/DataProtectionPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ReferPage = lazy(() => import('./pages/ReferPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DashboardLandingPage = lazy(() => import('./pages/DashboardLandingPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const TrustPage = lazy(() =>
    import('./pages/PlaceholderPages').then((module) => ({ default: module.TrustPage }))
);

function getSplashSeen() {
    try {
        return sessionStorage.getItem('sm_splashed') === '1';
    } catch (error) {
        console.warn('Session storage unavailable for splash state:', error);
        return false;
    }
}

function setSplashSeen() {
    try {
        sessionStorage.setItem('sm_splashed', '1');
    } catch (error) {
        console.warn('Could not persist splash state:', error);
    }
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function RouteLoader() {
    return (
        <div className="flex min-h-[40vh] items-center justify-center px-6">
            <div className="rounded-[1.25rem] border border-[#d8ece3] bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-sm">
                Loading page...
            </div>
        </div>
    );
}

function AppLayout() {
    const location = useLocation();
    const hidePublicNavbar = location.pathname === '/dashboard/app' || location.pathname === '/debts';

    return (
        <div className="min-h-screen flex flex-col">
            {!hidePublicNavbar && <Navbar />}
            <main className="flex-grow">
                <Suspense fallback={<RouteLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<DashboardLandingPage />} />
                        <Route
                            path="/dashboard/app"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/debts"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/app" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/learn" element={<LearnPage />} />
                        <Route path="/compare" element={<ComparePage />} />
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/advisors" element={<AdvisoryPage />} />
                        <Route path="/partnerships" element={<PartnershipsPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/faqs" element={<FAQPage />} />
                        <Route path="/trust" element={<TrustPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/data-protection" element={<DataProtectionPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/refer" element={<ReferPage />} />
                    </Routes>
                </Suspense>
            </main>
            <ShilingiBuddy />
            <CookieConsentBanner />
        </div>
    );
}

function App() {
    const [showSplash, setShowSplash] = useState(
        () => !getSplashSeen()
    );

    const handleSplashComplete = () => {
        setSplashSeen();
        setShowSplash(false);
    };

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <Router>
                <ScrollToTop />
                <AppErrorBoundary>
                    <AppLayout />
                </AppErrorBoundary>
            </Router>
        </>
    );
}

export default App;
