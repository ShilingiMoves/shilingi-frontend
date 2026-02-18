import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeartHandshake, TrendingUp, Users, BarChart3, Shield, Star,
    ArrowRight, CheckCircle, ChevronRight, Building2, Landmark,
    PiggyBank, GraduationCap, Sparkles, Zap, Globe, Award,
    Phone, Mail
} from 'lucide-react';
import Footer from '../components/Footer';
import partnershipsVideo from '../assets/Partnerships-herovideo.mp4';

const PartnershipsPage = () => {
    const navigate = useNavigate();
    const [activeTier, setActiveTier] = useState(1);

    useEffect(() => {
        document.title = 'Partnerships | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Partner with Shilingi Moves to reach financially-conscious Kenyans. Banking, investment, insurance, and education partnership opportunities.');
        }
    }, []);

    const audienceStats = [
        { value: '50K+', label: 'Active Users', icon: Users },
        { value: '85%', label: 'Engagement Rate', icon: BarChart3 },
        { value: '2M+', label: 'Monthly Page Views', icon: Globe },
        { value: '4.8/5', label: 'User Satisfaction', icon: Star },
    ];

    const categories = [
        {
            title: 'Banking',
            icon: Landmark,
            color: 'from-blue-500 to-blue-700',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-100',
            desc: 'Get your products in front of users actively comparing savings accounts, loans, and credit cards.',
            benefits: ['Featured in comparison tools', 'Lead generation pipeline', 'Co-branded content'],
        },
        {
            title: 'Investment',
            icon: TrendingUp,
            color: 'from-emerald-500 to-emerald-700',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            borderColor: 'border-emerald-100',
            desc: 'Connect with users who are learning to invest and ready to open their first investment account.',
            benefits: ['Direct user onboarding', 'Educational co-creation', 'Product showcasing'],
        },
        {
            title: 'Insurance',
            icon: Shield,
            color: 'from-purple-500 to-purple-700',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-100',
            desc: 'Reach users exploring health, life, and asset insurance as part of their financial wellness journey.',
            benefits: ['Insurance comparison listings', 'Targeted audience access', 'Trust-driven leads'],
        },
        {
            title: 'Education',
            icon: GraduationCap,
            color: 'from-amber-500 to-amber-700',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600',
            borderColor: 'border-amber-100',
            desc: 'Co-create financial literacy content and position your brand as a thought leader in the space.',
            benefits: ['Co-branded workshops', 'Content sponsorship', 'Certification programs'],
        },
    ];

    const tiers = [
        {
            name: 'Bronze',
            tagline: 'Get Noticed',
            color: 'from-amber-600 to-amber-800',
            ring: 'ring-amber-200',
            features: [
                'Logo on Partners page',
                'Quarterly newsletter feature',
                'Basic analytics dashboard',
                'Standard support',
            ],
        },
        {
            name: 'Silver',
            tagline: 'Build Presence',
            color: 'from-gray-400 to-gray-600',
            ring: 'ring-gray-300',
            popular: false,
            features: [
                'Everything in Bronze',
                'Featured in comparison tools',
                'Monthly social media mentions',
                'Co-branded blog content',
                'Priority support',
            ],
        },
        {
            name: 'Gold',
            tagline: 'Drive Growth',
            color: 'from-yellow-400 to-amber-600',
            ring: 'ring-yellow-200',
            popular: true,
            features: [
                'Everything in Silver',
                'Homepage banner placement',
                'Quarterly webinar co-hosting',
                'Dedicated lead pipeline',
                'Custom analytics reports',
                'Dedicated account manager',
            ],
        },
        {
            name: 'Platinum',
            tagline: 'Full Integration',
            color: 'from-primary-500 to-emerald-700',
            ring: 'ring-primary-200',
            features: [
                'Everything in Gold',
                'Exclusive category placement',
                'White-label integrations',
                'Joint product development',
                'Board-level quarterly reviews',
                'Custom API integrations',
                'VIP event access',
            ],
        },
    ];

    const howItWorks = [
        { step: '01', title: 'Reach Out', desc: 'Tell us about your organization and partnership goals.', icon: Phone },
        { step: '02', title: 'We Align', desc: 'Our team matches your goals with the right partnership tier.', icon: HeartHandshake },
        { step: '03', title: 'Go Live', desc: 'Launch your partnership and start reaching our audience.', icon: Zap },
        { step: '04', title: 'Grow Together', desc: 'Track results with real-time analytics and scale.', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* ═══════════ HERO — Video background with strong value prop ═══════════ */}
            <section className="relative text-white min-h-[80vh] md:min-h-[85vh] flex items-center overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={partnershipsVideo} type="video/mp4" />
                </video>
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-emerald-900/80"></div>

                <div className="container-custom relative z-10 py-16 md:py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 md:mb-8 border border-white/15">
                            <HeartHandshake size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-200">Partnership Opportunities</span>
                        </div>

                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5 md:mb-6 leading-[1.1] tracking-tight"
                            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                        >
                            Grow Your Brand With{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-yellow-300">
                                Kenya's Financial Community
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
                            Partner with Shilingi Moves and put your products in front of thousands of Kenyans who are actively learning, comparing, and making financial decisions — every day.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-6">
                            <a
                                href="mailto:partnerships@shilingimoves.com"
                                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-primary-900 font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg"
                            >
                                <HeartHandshake size={20} /> Become a Partner
                            </a>
                            <a
                                href="#tiers"
                                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500/20 text-white font-bold rounded-full border border-emerald-400/40 hover:bg-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-base sm:text-lg backdrop-blur-sm"
                            >
                                View Partnership Tiers <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-white/60 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* ═══════════ WHY PARTNER — Audience Stats ═══════════ */}
            <section className="py-12 md:py-16 bg-gray-50 border-b border-gray-100">
                <div className="container-custom">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Why Partner With <span className="text-primary-600">Shilingi Moves</span>?</h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base px-4">
                            Our users don't just scroll — they compare, calculate, and make decisions. Your brand meets them at the moment that matters.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {audienceStats.map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-5 md:p-8 text-center border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-100 text-primary-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                                    <stat.icon size={24} />
                                </div>
                                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ PARTNERSHIP CATEGORIES ═══════════ */}
            <section className="py-12 md:py-20">
                <div className="container-custom">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Partnership <span className="text-primary-600">Categories</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base px-4">
                            We work with organizations across the financial ecosystem. Find where you fit.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 md:gap-6 px-2 sm:px-0">
                        {categories.map((cat, idx) => (
                            <div key={idx} className={`group relative bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border ${cat.borderColor} hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden`}>
                                {/* Decorative accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 ${cat.bgLight} rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity`}></div>

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 md:w-16 md:h-16 ${cat.bgLight} ${cat.textColor} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-5 group-hover:scale-110 transition-transform`}>
                                        <cat.icon size={28} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">{cat.title}</h3>
                                    <p className="text-gray-600 text-sm sm:text-base mb-5 md:mb-6 leading-relaxed">{cat.desc}</p>

                                    <ul className="space-y-2 mb-6">
                                        {cat.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                <CheckCircle size={16} className={`${cat.textColor} shrink-0`} />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>

                                    <a
                                        href="mailto:partnerships@shilingimoves.com"
                                        className={`inline-flex items-center gap-2 text-sm font-bold ${cat.textColor} hover:underline`}
                                    >
                                        Explore {cat.title} Partnership <ChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ PARTNERSHIP TIERS ═══════════ */}
            <section id="tiers" className="py-12 md:py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Partnership <span className="text-primary-600">Tiers</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base px-4">
                            Choose the level that matches your goals. Every tier is designed to deliver real value.
                        </p>
                    </div>

                    {/* Mobile: Swipeable tabs */}
                    <div className="flex md:hidden gap-2 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scrollbar-hide mb-6">
                        {tiers.map((tier, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTier(idx)}
                                className={`shrink-0 snap-start px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTier === idx
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 border border-gray-200'
                                    }`}
                            >
                                {tier.name}
                            </button>
                        ))}
                    </div>

                    {/* Mobile: Show active tier card */}
                    <div className="md:hidden px-2">
                        {(() => {
                            const tier = tiers[activeTier];
                            return (
                                <div className={`relative bg-white rounded-2xl p-6 border-2 ${tier.popular ? 'border-primary-400 shadow-xl' : 'border-gray-100 shadow-md'}`}>
                                    {tier.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Sparkles size={12} /> Most Popular
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                        <Award size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                                    <p className="text-sm font-medium text-primary-600 mb-5">{tier.tagline}</p>
                                    <ul className="space-y-3 mb-6">
                                        {tier.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                <CheckCircle size={16} className="text-primary-500 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href="mailto:partnerships@shilingimoves.com"
                                        className={`block w-full text-center py-3 rounded-xl font-bold transition-colors ${tier.popular
                                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        Let's Talk
                                    </a>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Desktop: Side-by-side tier cards */}
                    <div className="hidden md:grid md:grid-cols-4 gap-5 lg:gap-6">
                        {tiers.map((tier, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-white rounded-2xl p-6 lg:p-8 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${tier.popular
                                    ? 'border-primary-400 shadow-xl scale-105'
                                    : 'border-gray-100 shadow-sm'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                        <Sparkles size={12} /> Most Popular
                                    </div>
                                )}
                                <div className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                    <Award size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                                <p className="text-sm font-medium text-primary-600 mb-5">{tier.tagline}</p>
                                <ul className="space-y-3 mb-6">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                            <CheckCircle size={16} className="text-primary-500 shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <a
                                    href="mailto:partnerships@shilingimoves.com"
                                    className={`block w-full text-center py-3 rounded-xl font-bold transition-colors ${tier.popular
                                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    Let's Talk
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-12 md:py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">How It <span className="text-primary-600">Works</span></h2>
                        <p className="text-gray-500 text-sm sm:text-base">From first conversation to first results — in 4 simple steps.</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-2 sm:px-0">
                        {howItWorks.map((item, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="relative mb-4 md:mb-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300">
                                        <item.icon size={28} />
                                    </div>
                                    <span className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-7 h-7 md:w-8 md:h-8 bg-primary-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg">{item.step}</span>
                                </div>
                                <h4 className="font-bold text-base md:text-lg text-gray-900 mb-1 md:mb-2">{item.title}</h4>
                                <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TRUST BAR ═══════════ */}
            <section className="py-10 md:py-12 bg-primary-900 text-white">
                <div className="container-custom text-center">
                    <p className="text-primary-200 text-sm md:text-base mb-4 md:mb-6 font-medium">Trusted by leading organizations across Kenya</p>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 items-center opacity-60">
                        {['Equity Bank', 'Safaricom', 'Britam', 'KCB', 'CIC Group', 'Cytonn'].map((name, idx) => (
                            <div key={idx} className="text-lg md:text-xl font-bold text-white/80 tracking-wider uppercase">
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary-800 to-emerald-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary-600 rounded-full blur-3xl opacity-20 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 md:w-72 h-48 md:h-72 bg-emerald-500 rounded-full blur-3xl opacity-20 translate-y-1/3"></div>

                <div className="container-custom relative z-10 text-center max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                        Let's Build Something<br className="hidden sm:block" /> Great Together
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-primary-100 mb-8 md:mb-10 max-w-xl mx-auto">
                        Join the Shilingi Moves partner ecosystem and reach the audience that matters most to your business.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <a
                            href="mailto:partnerships@shilingimoves.com"
                            className="px-8 md:px-10 py-3.5 md:py-4 bg-white text-primary-900 font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-base md:text-lg inline-flex items-center justify-center gap-2"
                        >
                            <Mail size={20} /> Email Us
                        </a>
                        <a
                            href="tel:+254700000000"
                            className="px-8 md:px-10 py-3.5 md:py-4 bg-emerald-500 text-white font-bold rounded-full border border-emerald-400 hover:bg-emerald-400 transition-all text-base md:text-lg inline-flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Phone size={20} /> Call Us
                        </a>
                    </div>
                    <p className="mt-5 md:mt-6 text-xs md:text-sm text-primary-300">
                        partnerships@shilingimoves.com • +254 700 000 000
                    </p>
                </div>
            </section>

            <Footer showCTA={false} />
        </div>
    );
};

export default PartnershipsPage;
