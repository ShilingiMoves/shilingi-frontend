import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, PlayCircle, Brain, Gamepad2, Route, ArrowRight,
    ChevronDown, Clock, Star, Users, FileText, Trophy, Sparkles,
    GraduationCap, Target, TrendingUp, CheckCircle2
} from 'lucide-react';
import HeroImg from '../assets/Learn-pg-hero-image.png';
import HeroImg2 from '../assets/Learn-pg-hero-image-2.png';
import Footer from '../components/Footer';

const LearnPage = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [HeroImg, HeroImg2];

    // Carousel Effect with Performance Optimization
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds 

        return () => clearInterval(interval);
    }, [images.length]);

    // SEO
    useEffect(() => {
        document.title = 'Learn — Financial Education for Kenya | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Access Kenya-focused financial education: expert articles, videos, quizzes, and interactive games. Build money skills from beginner to advanced.');
        }

        // Structured Data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Shilingi Moves Financial Education",
            "description": "Practical, Kenya-focused financial education covering budgeting, investing, and wealth management.",
            "provider": {
                "@type": "Organization",
                "name": "Shilingi Moves",
                "sameAs": "https://shilingimoves.com"
            },
            "educationalLevel": ["Beginner", "Intermediate", "Advanced"],
            "inLanguage": "en",
            "isAccessibleForFree": true,
            "audience": {
                "@type": "EducationalAudience",
                "educationalRole": "learner"
            }
        });
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

    const features = [
        { icon: FileText, title: 'Expert Articles', description: 'Deep-dive guides written by Kenyan financial experts', color: 'from-blue-500 to-blue-600' },
        { icon: PlayCircle, title: 'Short Videos', description: 'Quick explainer videos you can watch anytime', color: 'from-red-500 to-rose-600' },
        { icon: Brain, title: 'Quizzes & Assessments', description: 'Test your knowledge and track your progress', color: 'from-purple-500 to-violet-600' },
        { icon: Gamepad2, title: 'Financial Games', description: 'Learn through play with curated skill-based games', color: 'from-amber-500 to-orange-600' },
        { icon: Route, title: 'Learning Paths', description: 'Guided journeys tailored to your skill level', color: 'from-primary-500 to-primary-700' },
    ];

    const contentItems = [
        { type: 'Article', level: 'Beginner', title: 'Budgeting 101: The 50/30/20 Rule for Kenyans', description: 'Learn how to split your income wisely using a framework adapted for Kenyan salaries and lifestyles.', icon: FileText, duration: '8 min read', featured: true },
        { type: 'Video', level: 'Beginner', title: 'Understanding M-Pesa Savings vs Bank Accounts', description: 'A quick breakdown of when to use mobile money savings and when a bank account makes more sense.', icon: PlayCircle, duration: '5 min watch', featured: false },
        { type: 'Quiz', level: 'Intermediate', title: 'Investment Risk Assessment', description: 'Discover your risk profile and find out which investment vehicles match your comfort level.', icon: Brain, duration: '10 questions', featured: true },
        { type: 'Game', level: 'Beginner', title: 'Budget Buster Challenge', description: 'Can you make it through the month without overspending? A fun simulation of real Kenyan expenses.', icon: Gamepad2, duration: '15 min play', featured: false },
        { type: 'Article', level: 'Advanced', title: 'Nairobi Securities Exchange: Building a Portfolio', description: 'Step-by-step guide to investing in NSE stocks, government bonds, and REITs for Kenyan investors.', icon: FileText, duration: '12 min read', featured: true },
        { type: 'Video', level: 'Intermediate', title: 'SACCOs vs Money Market Funds', description: 'Compare returns, risk, and liquidity of SACCOs against money market funds like CIC and Cytonn.', icon: PlayCircle, duration: '7 min watch', featured: false },
        { type: 'Quiz', level: 'Advanced', title: 'Tax Optimization Masterclass Quiz', description: 'Test your knowledge of Kenyan tax laws, reliefs, and how to legally minimize your tax burden.', icon: Brain, duration: '15 questions', featured: false },
        { type: 'Game', level: 'Intermediate', title: 'Investment Tycoon', description: 'Start with KES 100,000 and grow your wealth through strategic investing in this simulation game.', icon: Gamepad2, duration: '20 min play', featured: true },
        { type: 'Article', level: 'Advanced', title: 'Offshore Investing for Kenyan HNWI', description: 'Advanced strategies for diversifying your portfolio internationally while staying CBK compliant.', icon: FileText, duration: '15 min read', featured: false },
    ];

    const learningPaths = [
        {
            level: 'Beginner',
            title: 'Financial Foundations',
            description: 'Start here if you\'re new to managing money. Learn budgeting, saving, and the basics of M-Pesa and banking.',
            modules: 12,
            duration: '4 weeks',
            icon: GraduationCap,
            color: 'from-green-400 to-emerald-600',
            skills: ['Budgeting', 'Saving', 'Debt Management', 'Emergency Funds'],
        },
        {
            level: 'Intermediate',
            title: 'Wealth Builder',
            description: 'Ready to grow? Explore SACCOs, money markets, and the Nairobi Securities Exchange.',
            modules: 16,
            duration: '6 weeks',
            icon: Target,
            color: 'from-blue-400 to-indigo-600',
            skills: ['Investing', 'SACCOs', 'Insurance', 'Tax Planning'],
        },
        {
            level: 'Advanced',
            title: 'Wealth Mastery',
            description: 'For experienced investors. Master portfolio management, offshore diversification, and estate planning.',
            modules: 10,
            duration: '8 weeks',
            icon: TrendingUp,
            color: 'from-amber-400 to-orange-600',
            skills: ['Portfolio Strategy', 'Offshore Investing', 'Estate Planning', 'Tax Optimization'],
        },
    ];

    const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const filteredItems = activeFilter === 'All'
        ? contentItems
        : contentItems.filter(item => item.level === activeFilter);

    const typeColors = {
        Article: 'bg-blue-100 text-blue-700',
        Video: 'bg-red-100 text-red-700',
        Quiz: 'bg-purple-100 text-purple-700',
        Game: 'bg-amber-100 text-amber-700',
    };

    const levelColors = {
        Beginner: 'bg-green-100 text-green-700',
        Intermediate: 'bg-blue-100 text-blue-700',
        Advanced: 'bg-orange-100 text-orange-700',
    };

    return (
        <div className="min-h-screen bg-white">
            {/* =============== SECTION 1: HERO =============== */}
            <section className="relative bg-gray-900 text-white overflow-hidden">
                {/* Background Image Carousel */}
                <div className="absolute inset-0 z-0">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{ willChange: 'opacity' }} // Optimization for smoother mobile transitions
                        >
                            <img
                                src={img}
                                alt={`Financial Education Background ${index + 1}`}
                                className="w-full h-full object-cover opacity-90"
                            />
                            {/* Overlay is now part of the fading container to ensure smooth image+overlay transition */}
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
                        </div>
                    ))}
                </div>

                <div className="relative z-10 container-custom py-20 md:py-28 lg:py-32">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-300 mb-6">
                            <Sparkles size={16} /> Kenya's #1 Financial Education Platform
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-sm mb-6">
                            Learn. Improve.<br />
                            <span className="text-primary-400">Master Your Money.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-100 leading-relaxed max-w-lg drop-shadow-sm font-medium mb-8">
                            Access high-quality, practical, Kenya-focused financial education created for Kenyan realities, anytime you need it. From beginner basics to advanced strategies, we've got you covered.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12">
                            <a
                                href="#content"
                                className="inline-flex items-center justify-center px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all bg-primary-600 border-transparent hover:bg-primary-500 text-white font-bold rounded-full group w-full sm:w-auto"
                            >
                                Visit the Education Hub
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="#paths"
                                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white shadow-lg font-bold rounded-full transition-all duration-300 w-full sm:w-auto"
                            >
                                View Learning Paths
                                <ChevronDown className="ml-2 w-5 h-5" />
                            </a>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-8 md:gap-12">
                            {[
                                { value: '200+', label: 'Articles & Guides', icon: FileText },
                                { value: '50+', label: 'Video Lessons', icon: PlayCircle },
                                { value: '30+', label: 'Quizzes & Games', icon: Trophy },
                                { value: '10K+', label: 'Active Learners', icon: Users },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                        <stat.icon size={18} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{stat.value}</p>
                                        <p className="text-xs text-gray-400">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* =============== SECTION 2: FEATURE HIGHLIGHTS =============== */}
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Build Your Money Skills, Step by Step
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose how you learn best — read, watch, play, or follow a guided path.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                            >
                                <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={26} className="text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== SECTION 3: CONTENT CARDS + FILTERS =============== */}
            <section id="content" className="py-16 md:py-20 bg-white scroll-mt-20">
                <div className="container-custom">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Explore Our Content Library
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Articles, videos, quizzes, and games — all created for Kenyan financial realities.
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex justify-center gap-2 mb-10">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeFilter === filter
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Card Header with gradient */}
                                <div className={`h-2 ${item.type === 'Article' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                    item.type === 'Video' ? 'bg-gradient-to-r from-red-400 to-rose-600' :
                                        item.type === 'Quiz' ? 'bg-gradient-to-r from-purple-400 to-violet-600' :
                                            'bg-gradient-to-r from-amber-400 to-orange-600'
                                    }`}></div>

                                <div className="p-6">
                                    {/* Badges */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[item.type]}`}>
                                            {item.type}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${levelColors[item.level]}`}>
                                            {item.level}
                                        </span>
                                        {item.featured && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 flex items-center gap-1">
                                                <Star size={10} /> Featured
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Clock size={14} /> {item.duration}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 transition-all">
                                            Start <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== SECTION 4: LEARNING PATHS =============== */}
            <section id="paths" className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Guided Learning Paths
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Not sure where to start? Follow a structured path designed for your experience level.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                        {learningPaths.map((path, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Gradient Header */}
                                <div className={`bg-gradient-to-br ${path.color} p-6 text-white`}>
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                                        <path.icon size={28} className="text-white" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{path.level}</span>
                                    <h3 className="text-xl font-bold mt-1">{path.title}</h3>
                                </div>

                                <div className="p-6">
                                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                                        {path.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex gap-4 mb-5 text-sm">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <BookOpen size={14} /> {path.modules} modules
                                        </span>
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                            <Clock size={14} /> {path.duration}
                                        </span>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {path.skills.map((skill, i) => (
                                            <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                                                <CheckCircle2 size={10} className="text-primary-500" /> {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center gap-2 group">
                                        Start This Path
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== SECTION 5: BOTTOM CTA =============== */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl shadow-2xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                        {/* Decorative */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10">
                            <GraduationCap size={48} className="mx-auto mb-6 text-primary-200" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                                Start Your Learning Journey Today
                            </h2>
                            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto leading-relaxed">
                                Join thousands of Kenyans who are building their financial future — one lesson at a time. Free to start, always practical.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300 group"
                                >
                                    Create Free Account
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="#content"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold rounded-full transition-all duration-300"
                                >
                                    Browse Content
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LearnPage;
