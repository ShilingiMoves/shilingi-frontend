import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LearnPage from './pages/LearnPage';
import {
    Dashboard,
    Learn,
    Compare,
    Tools,
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
                        <Route path="/compare" element={<Compare />} />
                        <Route path="/tools" element={<Tools />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/trust" element={<TrustPage />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
