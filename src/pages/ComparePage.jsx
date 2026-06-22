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
            title: 'Loans',
            icon: '🏦',
            accent: 'from-emerald-500 to-primary-700',
            helper: 'Compare banks, SACCOs, microfinance, and digital lenders.',
        },
        {
            title: 'MMFs',
            icon: '💰',
            accent: 'from-amber-400 to-orange-500',
            helper: 'Review yields, fees, liquidity, and minimum investment.',
        },
        {
            title: 'Investments',
            icon: '📈',
            accent: 'from-sky-500 to-blue-700',
            helper: 'Explore T-Bills, bonds, NSE shares, and managed products.',
        },
        {
            title: 'Banking',
            icon: '🧾',
            accent: 'from-slate-700 to-primary-900',
            helper: 'Compare everyday accounts, fees, interest, and features.',
        },
        {
            title: 'Transfers',
            icon: '🌍',
            accent: 'from-cyan-500 to-primary-700',
            helper: 'Check local and global transfer options side by side.',
        },
        {
            title: 'Retirement',
            icon: '🛡️',
            accent: 'from-violet-500 to-indigo-700',
            helper: 'Compare pension plans and long-term retirement options.',
        },
        {
            title: 'Mortgages',
            icon: '🏠',
            accent: 'from-rose-400 to-red-600',
            helper: 'Review home loan rates, terms, and affordability signals.',
        },
        {
            title: 'Insurance',
            icon: '✅',
            accent: 'from-primary-500 to-emerald-700',
            helper: 'Compare health, motor, life, and protection products.',
        },
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
                        <p className="text-lg text-gray-600">Select a category to open the Compare Hub experience inside your Shilingi dashboard.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.map((cat, index) => (
                            <article
                                key={cat.title}
                                className="group relative overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
                            >
                                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cat.accent}`} />
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.accent} text-2xl shadow-lg shadow-primary-900/10 transition-transform duration-300 group-hover:scale-110`}>
                                        <span aria-hidden="true">{cat.icon}</span>
                                    </div>
                                    <span className="rounded-full bg-[#eef8f4] px-3 py-1 text-xs font-bold text-primary-700">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-2xl font-extrabold text-gray-900">{cat.title}</h3>
                                <p className="mt-2 min-h-[3.5rem] text-sm leading-6 text-gray-600">{cat.helper}</p>
                                <Link
                                    to="/signin"
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-[#f6fbf8] px-4 py-3 text-sm font-bold text-primary-700 transition-all hover:border-transparent hover:bg-primary-600 hover:text-white group/btn"
                                >
                                    Compare Now <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </article>
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
                    <div className="flex justify-center">
                        <Link to="/signup" className="px-10 py-4 bg-white text-primary-700 font-bold rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            Create Free Account <ArrowRight size={20} />
                        </Link>
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
