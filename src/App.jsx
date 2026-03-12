import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import LearnPage from './pages/LearnPage';
import ComparePage from './pages/ComparePage';
import ToolsPage from './pages/ToolsPage';
import CommunityPage from './pages/CommunityPage';
import AdvisoryPage from './pages/AdvisoryPage';
import PartnershipsPage from './pages/PartnershipsPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ReferPage from './pages/ReferPage';
import DashboardPage from './pages/DashboardPage';
import DebtManagementPage from './pages/DebtManagementPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { TrustPage } from './pages/PlaceholderPages';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    const [showSplash, setShowSplash] = useState(
        () => !sessionStorage.getItem('sm_splashed')
    );

    const handleSplashComplete = () => {
        sessionStorage.setItem('sm_splashed', '1');
        setShowSplash(false);
    };

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <Router>
                <ScrollToTop />
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/debts" element={<DebtManagementPage />} />
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
                            <Route path="/terms" element={<TermsPage />} />
                            <Route path="/refer" element={<ReferPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </>
    );
}

export default App;
