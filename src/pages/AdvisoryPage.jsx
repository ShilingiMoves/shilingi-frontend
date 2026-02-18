import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield, Star, Users, Search, ArrowRight,
    TrendingUp, Award, Briefcase, Target,
    CheckCircle, ChevronRight, UserPlus, Eye
} from 'lucide-react';
import Footer from '../components/Footer';
import advisoryHeroVideo from '../video/Advisory-hero-video.mp4';

const AdvisoryPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Advisor Network | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Connect with trusted financial advisors or join the Shilingi Advisor Network. Personalized financial guidance for every stage of your journey.');
        }
    }, []);

    const advisors = [
        {
            name: 'Grace Muthoni',
            title: 'Certified Financial Planner',
            specialty: 'Retirement & Investments',
            rating: 4.9,
            reviews: 127,
            image: 'https://placehold.co/200x200/059669/ffffff?text=GM',
            badge: 'Top Rated'
        },
        {
            name: 'James Ochieng',
            title: 'Wealth Management Advisor',
            specialty: 'Portfolio Management',
            rating: 4.8,
            reviews: 94,
            image: 'https://placehold.co/200x200/7c3aed/ffffff?text=JO',
            badge: 'Verified'
        },
        {
            name: 'Amina Hassan',
            title: 'Budget & Debt Specialist',
            specialty: 'Debt Recovery & Budgeting',
            rating: 4.9,
            reviews: 156,
            image: 'https://placehold.co/200x200/dc2626/ffffff?text=AH',
            badge: 'Most Popular'
        },
        {
            name: 'Peter Kamau',
            title: 'Tax & Estate Advisor',
            specialty: 'Tax Planning & Estate',
            rating: 4.7,
            reviews: 83,
            image: 'https://placehold.co/200x200/2563eb/ffffff?text=PK',
            badge: 'Expert'
        },
    ];

    const howItWorks = {
        clients: [
            { step: '01', title: 'Browse Profiles', desc: 'Search by specialty, rating, or availability.', icon: Search },
            { step: '02', title: 'Compare & Choose', desc: 'Review credentials, ratings, and client feedback.', icon: Eye },
            { step: '03', title: 'Book a Session', desc: 'Schedule a consultation that fits your calendar.', icon: Target },
        ],
        advisors: [
            { step: '01', title: 'Create Your Profile', desc: 'Showcase your credentials and expertise.', icon: UserPlus },
            { step: '02', title: 'Get Matched', desc: 'Receive leads from clients seeking your skills.', icon: Users },
            { step: '03', title: 'Grow Your Practice', desc: 'Build your reputation with reviews and referrals.', icon: TrendingUp },
        ]
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* ═══════════ HERO SECTION — VIDEO BACKGROUND ═══════════ */}
            <section className="relative text-white min-h-[85vh] md:min-h-screen flex items-center overflow-hidden">
                {/* Video Background */}
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        poster=""
                    >
                        <source src={advisoryHeroVideo} type="video/mp4" />
                    </video>
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
                </div>

                {/* Hero Content — Centered */}
                <div className="container-custom relative z-10 py-16 md:py-24 text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 md:mb-8 border border-white/15">
                        <Shield size={16} className="text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-200">Trusted Advisor Network</span>
                    </div>

                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 md:mb-6 leading-[1.1] tracking-tight px-4"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        Where Expertise Meets{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-primary-300">
                            Opportunity
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
                        Connect with trusted financial advisors or showcase your expertise to clients who need you.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-6">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-primary-900 font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg"
                        >
                            👤 Find an Advisor
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500 text-white font-bold rounded-full border border-emerald-400 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg"
                        >
                            🔑 Join Our Network
                        </button>
                    </div>

                    {/* Scroll hint */}
                    <div className="mt-12 md:mt-16 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex justify-center pt-2">
                            <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ TAGLINE BAR ═══════════ */}
            <div className="bg-primary-50 py-5 md:py-6 text-center border-b border-primary-100">
                <p className="text-primary-800 font-semibold text-sm sm:text-base md:text-lg italic tracking-wide px-4">
                    "Expertise you can trust. Connections that drive financial growth."
                </p>
            </div>

            {/* ═══════════ SPLIT LAYOUT: For Clients vs For Advisors ═══════════ */}
            <section className="py-12 md:py-20">
                <div className="container-custom">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4">One Network, <span className="text-primary-600">Two Paths</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base px-4">Whether you need guidance or want to share your expertise, we've got you covered.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-2 sm:px-0">
                        {/* For Clients */}
                        <div className="group relative bg-gradient-to-br from-blue-50 to-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">For Clients</h3>
                                <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm sm:text-base">
                                    Find the right advisor for your journey — budgeting, investing, retirement, or complex portfolios. Browse trusted profiles with credentials and ratings.
                                </p>
                                <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                                    <li className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                                        <CheckCircle size={18} className="text-blue-500 shrink-0" />
                                        <span>Browse verified advisor profiles</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                                        <CheckCircle size={18} className="text-blue-500 shrink-0" />
                                        <span>Compare specializations & ratings</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                                        <CheckCircle size={18} className="text-blue-500 shrink-0" />
                                        <span>Book consultations with confidence</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
                                >
                                    👤 Find an Advisor <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* For Advisors */}
                        <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 border border-emerald-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                                    <Briefcase size={28} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">For Advisors</h3>
                                <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm sm:text-base">
                                    Showcase your expertise, gain visibility, and access a steady stream of qualified leads from the Shilingi community. Your skills are needed.
                                </p>
                                <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                                    <li className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        <span>Create your professional profile</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        <span>Get matched with ideal clients</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        <span>Grow your practice & reputation</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors shadow-lg text-sm sm:text-base"
                                >
                                    🔑 Join Our Network <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ ADVISOR PROFILE CARDS ═══════════ */}
            <section className="py-12 md:py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Meet Our <span className="text-primary-600">Top Advisors</span></h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base px-4">Verified professionals ready to help you reach your financial goals.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 sm:px-0">
                        {advisors.map((advisor, idx) => (
                            <div key={idx} className="group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                {/* Photo */}
                                <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-primary-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                                    <img src={advisor.image} alt={advisor.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-3 md:border-4 border-white shadow-lg object-cover group-hover:scale-110 transition-transform duration-300" />
                                    <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-primary-700 shadow-sm">
                                        {advisor.badge}
                                    </span>
                                </div>
                                {/* Info */}
                                <div className="p-3 sm:p-4 md:p-6">
                                    <h3 className="font-bold text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1 truncate">{advisor.name}</h3>
                                    <p className="text-xs md:text-sm text-primary-600 font-medium mb-1 md:mb-2 truncate">{advisor.title}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4 truncate">{advisor.specialty}</p>
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4">
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="md:w-3 md:h-3" fill="currentColor" />)}
                                        </div>
                                        <span className="text-[10px] md:text-xs text-gray-500">{advisor.rating} ({advisor.reviews})</span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="w-full py-2 md:py-2.5 bg-primary-600 text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-primary-700 transition-colors"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8 md:mt-12">
                        <button
                            onClick={() => navigate('/signup')}
                            className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors text-sm md:text-lg"
                        >
                            Browse All Advisors <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-12 md:py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">How It Works</h2>
                        <p className="text-gray-500 text-sm sm:text-base">Simple steps to get started.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                        {/* Client Flow */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 md:mb-8">
                                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-bold">For Clients</div>
                            </div>
                            <div className="space-y-6 md:space-y-8">
                                {howItWorks.clients.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 md:gap-6 items-start group">
                                        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <item.icon size={22} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-wider">Step {item.step}</span>
                                            <h4 className="font-bold text-base md:text-lg text-gray-900 mt-0.5 md:mt-1">{item.title}</h4>
                                            <p className="text-gray-500 mt-0.5 md:mt-1 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Advisor Flow */}
                        <div>
                            <div className="flex items-center gap-3 mb-6 md:mb-8">
                                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm font-bold">For Advisors</div>
                            </div>
                            <div className="space-y-6 md:space-y-8">
                                {howItWorks.advisors.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 md:gap-6 items-start group">
                                        <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                            <item.icon size={22} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-wider">Step {item.step}</span>
                                            <h4 className="font-bold text-base md:text-lg text-gray-900 mt-0.5 md:mt-1">{item.title}</h4>
                                            <p className="text-gray-500 mt-0.5 md:mt-1 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ TRUST STATS BAR ═══════════ */}
            <section className="py-10 md:py-12 bg-primary-900 text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                        <div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">200+</p>
                            <p className="text-xs md:text-sm text-primary-200 mt-1">Verified Advisors</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">5,000+</p>
                            <p className="text-xs md:text-sm text-primary-200 mt-1">Clients Matched</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">4.8/5</p>
                            <p className="text-xs md:text-sm text-primary-200 mt-1">Avg. Rating</p>
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">KES 2B+</p>
                            <p className="text-xs md:text-sm text-primary-200 mt-1">Assets Managed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary-800 to-emerald-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary-600 rounded-full blur-3xl opacity-20 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 md:w-72 h-48 md:h-72 bg-emerald-500 rounded-full blur-3xl opacity-20 translate-y-1/3"></div>

                <div className="container-custom relative z-10 text-center max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                        Ready to Take the Next Step?
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-8 md:mb-10 max-w-xl mx-auto">
                        Join the Shilingi Advisor Network today — whether you're seeking guidance or sharing expertise.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 md:px-10 py-3.5 md:py-4 bg-white text-primary-900 font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-base md:text-lg"
                        >
                            👤 Find an Advisor
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 md:px-10 py-3.5 md:py-4 bg-emerald-500 text-white font-bold rounded-full border border-emerald-400 hover:bg-emerald-400 transition-all text-base md:text-lg shadow-lg"
                        >
                            🔑 Join as Advisor
                        </button>
                    </div>
                    <p className="mt-5 md:mt-6 text-xs md:text-sm text-primary-300">Free to join • No hidden fees • Cancel anytime</p>
                </div>
            </section>

            <Footer showCTA={false} />
        </div>
    );
};

export default AdvisoryPage;
