import React from 'react';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import Steps from '../components/Steps';
import TrustAndCTA from '../components/TrustAndCTA';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Section 1: Hero + Product Proof */}
            <Hero />

            {/* Section 2: What You Get (6 feature cards) */}
            <FeatureGrid />

            {/* Section 3: How It Works (3 steps) */}
            <Steps />

            {/* Section 4: Trust + Results + Final CTA */}
            <TrustAndCTA />

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Home;
