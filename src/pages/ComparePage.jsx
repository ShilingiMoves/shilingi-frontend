import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, CheckCircle2, ChevronRight, Calculator,
    Landmark, Smartphone, TrendingUp, ShieldCheck, Home,
    PiggyBank, LineChart, Users, BarChart3, PieChart,
    Search, Briefcase, PauseCircle, PlayCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import HeroVideo from '../video/AI_Video-compare.mp4';

const ComparePage = () => {
    // SEO
    useEffect(() => {
        document.title = 'Compare Financial Products | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Make informed decisions with transparent, side-by-side comparisons of Kenya’s financial products. Compare banks, loans, insurance, and more.');
        }
    }, []);

    const categories = [
        {
            title: 'Banking & Mobile Money',
            icon: Smartphone,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            items: ['Savings Accounts', 'Current Accounts', 'M-Pesa Rates', 'Bank to M-Pesa Charges']
        },
        {
            title: 'Loans & Digital Credit',
            icon: Landmark,
            color: 'text-green-600',
            bg: 'bg-green-50',
            items: ['Personal Loans', 'Mobile Loans', 'Business Loans', 'Sacco Loans']
        },
        {
            title: 'Investment Options',
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            items: ['Money Market Funds', 'Treasury Bonds', 'NSE Stocks', 'Unit Trusts']
        },
        {
            title: 'Insurance Plans',
            icon: ShieldCheck,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            items: ['Health Insurance', 'Car Insurance', 'Life Insurance', 'Education Policies']
        },
        {
            title: 'Retirement Solutions',
            icon: PiggyBank,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            items: ['Pension Plans', 'NSSF Updates', 'Individual Retirement', 'Annuities']
        },
        {
            title: 'Mortgages & Housing',
            icon: Home,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            items: ['Mortgage Rates', 'Construction Loans', 'Plot Loans', 'Affordable Housing']
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* HERO SECTION */}
            <section className="relative h-auto md:h-[80vh] min-h-[700px] flex items-center justify-center overflow-hidden py-24 md:py-0">
                {/* Video Background */}
                <div className="absolute inset-0 z-0">
                    <video
                        className="w-full h-full object-cover"
                        src={HeroVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>
                    {/* Overlay for Readability */}
                    <div className="absolute inset-0 bg-gray-900/80 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="flex items-center justify-center">
                        <div className="w-full max-w-4xl text-center">
                            <h1
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight"
                                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                            >
                                Compare Financial Products,
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-green-400">Make Smarter Choices.</span>
                            </h1>
                            <a
                                href="#categories"
                                className="mt-8 inline-flex rounded-xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                            >
                                Explore
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES GRID */}
            <section id="categories" className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">What would you like to compare?</h2>
                        <p className="text-lg text-gray-600">Select a category to see top-rated products tailored to your needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((cat, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-primary-100 relative overflow-hidden">
                                <div className={`w-14 h-14 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <cat.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{cat.title}</h3>
                                <ul className="space-y-3 mb-8">
                                    {cat.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup" className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-primary-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn">
                                    Compare Now <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY COMPARE SECTION - VISUAL */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2">
                            <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <PieChart size={48} className="text-primary-400 mb-6" />
                                <h3 className="text-3xl font-bold mb-4">See the Full Picture</h3>
                                <p className="text-gray-300 mb-8 leading-relaxed">
                                    We analyze hidden fees, real interest rates, and terms so you don't have to.
                                    Our visual tools make it easy to spot the best deal in seconds.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div className="bg-green-500 w-[85%] h-full rounded-full"></div>
                                        </div>
                                        <span className="font-bold text-green-400">85% Savings</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div className="bg-primary-500 w-[60%] h-full rounded-full"></div>
                                        </div>
                                        <span className="font-bold text-primary-400">High Returns</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Stop losing money to <span className="text-primary-600">hidden details.</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Financial products in Kenya can be confusing. We strip away the marketing jargon and show you the raw numbers side-by-side.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Real-time interest rate updates',
                                    'Verified fees and charges',
                                    'Unbiased user reviews',
                                    'Direct application links'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-800">
                                        <CheckCircle2 size={20} className="text-green-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-20 bg-primary-600 text-white text-center">
                <div className="container-custom max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to find the perfect match?</h2>
                    <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                        Join Shilingi Moves today to access advanced comparison tools detailed specifically for your financial goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="px-10 py-4 bg-white text-primary-700 font-bold rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            Create Free Account <ArrowRight size={20} />
                        </Link>
                        <button className="px-10 py-4 bg-primary-700 text-white font-bold rounded-full border border-primary-500 hover:bg-primary-800 transition-colors">
                            Explore All Products
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-primary-200 opacity-80">
                        Linked directly to your dashboard goals ⚡
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ComparePage;
