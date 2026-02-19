import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
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
import {
    Dashboard,
    Learn,
    // Tools,
    Community,
    TrustPage,
    SignIn,
    SignUp,
} from './pages/PlaceholderPages';

// Scroll to top on route change
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/learn" element={<LearnPage />} />
                        <Route path="/compare" element={<ComparePage />} />
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/advisors" element={<AdvisoryPage />} />
                        <Route path="/partnerships" element={<PartnershipsPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/faqs" element={<FAQPage />} />
                        <Route path="/trust" element={<TrustPage />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
