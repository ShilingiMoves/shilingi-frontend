import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, CheckCircle2, ChevronRight, Calculator,
    Landmark, Smartphone, TrendingUp, ShieldCheck, Home,
    PiggyBank, LineChart, Users, BarChart3, PieChart,
    Search, DollarSign, Briefcase, RefreshCcw, PauseCircle, PlayCircle
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

    // Interactive Widget State
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState('');
    const [detail, setDetail] = useState('');

    const handleGoalSelect = (selectedGoal) => {
        setGoal(selectedGoal);
        setStep(2);
    };

    const handleDetailSelect = (selectedDetail) => {
        setDetail(selectedDetail);
        setStep(3);
    };

    const resetWidget = () => {
        setStep(1);
        setGoal('');
        setDetail('');
    };

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
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* HERO SECTION - VIDEO BACKGROUND + INTERACTIVE WIDGET */}
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
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Text Content */}
                        <div className="w-full lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-primary-300 text-sm font-medium mb-8 animate-fadeIn">
                                <Search size={16} /> Smart Product Finder
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-8 drop-shadow-lg animate-slideUp">
                                Compare Financial Products,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-green-400">Make Smarter Choices.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md animate-slideUp delay-100">
                                Answer 3 quick questions and let our AI match you with the best rates, loans, or insurance plans for your specific needs.
                            </p>

                            <div className="hidden lg:flex items-center gap-6 text-sm text-gray-300 animate-slideUp delay-200">
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Free to use</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> No signup required</div>
                                <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Unbiased Results</div>
                            </div>
                        </div>

                        {/* Interactive Widget Overlay */}
                        <div className="w-full lg:w-1/2 relative perspective-1000 animate-slideUp delay-300">
                            <div className="relative bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-500 min-h-[420px] flex flex-col border border-white/20">

                                {/* Header */}
                                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="font-bold text-xl">Quick Match</h3>
                                        <p className="text-sm text-gray-500">Step {step} of 3</p>
                                    </div>
                                    <button onClick={resetWidget} className="text-gray-400 hover:text-primary-600 transition-colors p-2 hover:bg-gray-100 rounded-full" title="Start Over">
                                        <RefreshCcw size={18} />
                                    </button>
                                </div>

                                {/* Step 1: Goal Select */}
                                {step === 1 && (
                                    <div className="flex-grow animate-fadeIn">
                                        <h4 className="text-lg font-bold mb-6 text-center">What is your main financial goal right now?</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { label: 'Grow Savings', icon: TrendingUp, id: 'savings' },
                                                { label: 'Get a Loan', icon: DollarSign, id: 'loans' },
                                                { label: 'Insure Myself', icon: ShieldCheck, id: 'insurance' },
                                                { label: 'Plan Retirement', icon: PiggyBank, id: 'retirement' },
                                            ].map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleGoalSelect(option.id)}
                                                    className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 group"
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:text-primary-600 transition-colors text-gray-600">
                                                        <option.icon size={20} />
                                                    </div>
                                                    <span className="font-bold text-sm group-hover:text-primary-700 transition-colors">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Detail Select */}
                                {step === 2 && (
                                    <div className="flex-grow animate-fadeIn">
                                        <h4 className="text-lg font-bold mb-6 text-center">
                                            {goal === 'savings' ? 'How much can you save monthly?' :
                                                goal === 'loans' ? 'What is the loan for?' :
                                                    goal === 'insurance' ? 'What do you want to protect?' :
                                                        'When do you plan to retire?'}
                                        </h4>
                                        <div className="space-y-3">
                                            {/* Dynamic Options based on Goal */}
                                            {(goal === 'savings' ? ['Less than KES 5,000', 'KES 5,000 - 20,000', 'Over KES 20,000'] :
                                                goal === 'loans' ? ['Personal/Emergency', 'Business Growth', 'Home/Asset Purchase'] :
                                                    goal === 'insurance' ? ['My Health', 'Car/Vehicle', 'Family/Life'] :
                                                        ['In 1-5 years', 'In 10-20 years', 'Just started working']
                                            ).map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleDetailSelect(opt)}
                                                    className="w-full text-left px-6 py-4 rounded-xl border border-gray-200 hover:border-primary-500 hover:bg-primary-50 font-medium transition-all flex items-center justify-between group"
                                                >
                                                    {opt}
                                                    <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-600" />
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-500 hover:text-gray-900 underline font-medium">Back</button>
                                    </div>
                                )}

                                {/* Step 3: Results */}
                                {step === 3 && (
                                    <div className="flex-grow animate-fadeIn text-center flex flex-col justify-center">
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-short shadow-sm">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h4 className="text-2xl font-bold mb-3 text-gray-900">Great news!</h4>
                                        <p className="text-gray-600 mb-8 max-w-xs mx-auto">We found <strong className="text-primary-600">3 perfect matches</strong> for {goal === 'loans' ? 'loans' : goal} based on your needs.</p>

                                        <a href="#categories" className="block w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-600/30 transition-all mb-4 transform hover:-translate-y-1">
                                            View Your Matches
                                        </a>
                                        <p className="text-xs text-gray-400 font-medium">Results are 100% unbiased & verified</p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator - Hidden on mobile if needed, but keeping for desktop */}
                <a href="#categories" className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-colors animate-bounce">
                    <ChevronRight size={32} className="rotate-90" />
                </a>
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
                                <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-primary-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn">
                                    Compare Now <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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

            <Footer showCTA={false} />
        </div>
    );
};

export default ComparePage;
