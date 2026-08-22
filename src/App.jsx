import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SessionActivityMonitor from './components/auth/SessionActivityMonitor';
import AppErrorBoundary from './components/AppErrorBoundary';
import ShilingiBuddy from './components/ShilingiBuddy';
import CookieConsentBanner from './components/CookieConsentBanner';
import animatedLogo from './assets/shilingi-logo-animated.gif';

const Home = lazy(() => import('./pages/Home'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PartnershipsPage = lazy(() => import('./pages/PartnershipsPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const DataProtectionPage = lazy(() => import('./pages/DataProtectionPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ReferPage = lazy(() => import('./pages/ReferPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'));
const WellnessAssessmentPage = lazy(() => import('./pages/WellnessAssessmentPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DashboardLandingPage = lazy(() => import('./pages/DashboardLandingPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const TrustPage = lazy(() =>
    import('./pages/PlaceholderPages').then((module) => ({ default: module.TrustPage }))
);

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function RouteLoader() {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 text-center">
            <img
                src={animatedLogo}
                alt="Shilingi Moves"
                className="h-auto w-[clamp(150px,28vw,260px)] animate-pulse select-none"
            />
            <p className="mt-6 max-w-xl text-base font-bold leading-7 text-teal-900">
                Powering every step of your financial journey.<br />
                One shilingi at a time.
            </p>
        </div>
    );
}

function LandingPage() {
    return <Home />;
}

function AppLayout() {
    const location = useLocation();
    const isOnboardingSurface = location.pathname === '/onboarding';
    const isProfileSetupSurface = location.pathname === '/profile-setup';
    const isWellnessAssessmentSurface = location.pathname === '/wellness-assessment';
    const hidePublicNavbar = location.pathname === '/dashboard/app' || location.pathname === '/debts' || isOnboardingSurface || isProfileSetupSurface || isWellnessAssessmentSurface;
    const hideShilingiBuddy = location.pathname === '/debts' || isOnboardingSurface || isProfileSetupSurface || isWellnessAssessmentSurface;

    return (
        <div className="min-h-screen flex flex-col">
            {!hidePublicNavbar && <Navbar />}
            <main className="flex-grow">
                <SessionActivityMonitor />
                <Suspense fallback={<RouteLoader />}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/onboarding" element={<OnboardingPage />} />
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
                            path="/profile-setup"
                            element={
                                <ProtectedRoute>
                                    <ProfileSetupPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/wellness-assessment"
                            element={
                                <ProtectedRoute>
                                    <WellnessAssessmentPage />
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
                        <Route path="/partnerships" element={<PartnershipsPage />} />
                        <Route path="/careers" element={<CareersPage />} />
                        <Route path="/career" element={<CareersPage />} />
                        <Route path="/jobs" element={<CareersPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/faqs" element={<FAQPage />} />
                        <Route path="/trust" element={<TrustPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/forgot-password/:token" element={<ForgotPasswordPage />} />
                        <Route path="/forgot-password/:uid/:token" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:uid/:token" element={<ForgotPasswordPage />} />
                        <Route path="/password-reset" element={<ForgotPasswordPage />} />
                        <Route path="/password-reset/:token" element={<ForgotPasswordPage />} />
                        <Route path="/password-reset/:uid/:token" element={<ForgotPasswordPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/data-protection" element={<DataProtectionPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/refer" element={<ReferPage />} />
                    </Routes>
                </Suspense>
            </main>
            {!hideShilingiBuddy && <ShilingiBuddy />}
            {!isOnboardingSurface && !isProfileSetupSurface && !isWellnessAssessmentSurface && <CookieConsentBanner />}
        </div>
    );
}

function App() {
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashComplete = () => {
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
