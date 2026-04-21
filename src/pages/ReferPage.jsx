import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Gift, Users, Share2, ArrowRight, CheckCircle, Copy, Check,
    Sparkles, TrendingUp, Heart, Crown, Star, Mail, MessageCircle,
    ChevronDown, ChevronUp, Zap, Target, Award
} from 'lucide-react';
import Footer from '../components/Footer';
import animatedLogo from '../assets/shilingi-logo-animated.gif';
import referHeroVideo from '../video/Refer-friend.mp4';

const ReferPage = () => {
    const [copied, setCopied] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        document.title = 'Refer a Friend | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Refer friends to Shilingi Moves and earn rewards. Help your friends take control of their finances while you both benefit.');
        }
    }, []);

    const referralCode = 'SHILINGI2026';

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://shilingimoves.com/signup?ref=${referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const howItWorks = [
        {
            step: '01',
            icon: Share2,
            title: 'Share Your Link',
            desc: 'Copy your unique referral link and share it with friends and family via WhatsApp, SMS, or social media.',
        },
        {
            step: '02',
            icon: Users,
            title: 'They Join & Explore',
            desc: 'Your friend signs up for Shilingi Moves and starts their financial wellness journey — completely free.',
        },
        {
            step: '03',
            icon: Gift,
            title: 'You Both Earn',
            desc: 'Once they complete their profile, you both unlock exclusive rewards and premium features.',
        },
    ];

    const rewards = [
        {
            icon: Crown,
            title: '1 Month Premium',
            desc: 'Get one free month of Premium access for every friend who joins.',
            color: 'from-amber-400 to-amber-600',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600',
        },
        {
            icon: Target,
            title: 'Exclusive Tools',
            desc: 'Unlock advanced budget planners, investment trackers, and financial calculators.',
            color: 'from-primary-400 to-primary-600',
            bgLight: 'bg-primary-50',
            textColor: 'text-primary-600',
        },
        {
            icon: Star,
            title: 'Lifetime Access',
            desc: 'Refer 5 friends and earn lifetime access to all Shilingi Moves premium features.',
            color: 'from-purple-400 to-purple-600',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            icon: Award,
            title: 'Ambassador Badge',
            desc: 'Refer 10+ friends and earn the Shilingi Ambassador badge on your profile.',
            color: 'from-rose-400 to-rose-600',
            bgLight: 'bg-rose-50',
            textColor: 'text-rose-600',
        },
    ];

    const milestones = [
        { count: 1, reward: '1 month Premium access', unlocked: true },
        { count: 3, reward: 'Advanced financial tools', unlocked: false },
        { count: 5, reward: 'Lifetime Premium access', unlocked: false },
        { count: 10, reward: 'Shilingi Ambassador badge', unlocked: false },
    ];

    const faqs = [
        {
            q: 'Who can I refer?',
            a: 'Anyone! Share your unique link with friends, family, or colleagues. They just need to be new to Shilingi Moves.',
        },
        {
            q: 'When do I receive my reward?',
            a: 'Your reward is credited as soon as your friend signs up and completes their financial profile — usually within minutes.',
        },
        {
            q: 'Is there a limit to how many friends I can refer?',
            a: 'No limit! The more friends you refer, the more rewards you earn. Plus, you unlock milestone rewards at 3, 5, and 10 referrals.',
        },
        {
            q: 'What does my friend get?',
            a: 'Your friend gets a free month of Premium access when they join through your referral link — so you both win.',
        },
        {
            q: 'How do I track my referrals?',
            a: 'Log in to your Shilingi Moves dashboard and visit the "My Referrals" section to track your progress and rewards.',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* ═══════════ HERO — Dark background with overlapping avatars ═══════════ */}
            <section className="relative bg-gray-900 text-white overflow-hidden min-h-[75vh] flex flex-col justify-center">
                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source src={referHeroVideo} type="video/mp4" />
                </video>

                {/* Subtle dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gray-900/30 z-10" />

                <div className="container-custom relative z-10 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
                    {/* Overlapping avatars with Shilingi logo */}
                    <div className="hidden">
                        <div className="relative flex items-center">
                            {/* Left avatar */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary-900 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl md:text-4xl shadow-xl z-10 relative overflow-hidden">
                                <span role="img" aria-label="woman">👩🏾</span>
                            </div>

                            {/* Center — Shilingi logo */}
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-primary-900 bg-primary-900 flex items-center justify-center shadow-2xl z-20 -mx-4 relative">
                                <img
                                    src={animatedLogo}
                                    alt="Shilingi Moves"
                                    className="w-16 h-16 md:w-20 md:h-20 object-contain"
                                />
                            </div>

                            {/* Right avatar */}
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary-900 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl md:text-4xl shadow-xl z-10 relative overflow-hidden">
                                <span role="img" aria-label="man">👨🏾</span>
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 md:mb-8 leading-[1.1] tracking-tight max-w-4xl mx-auto px-4"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        You got better with money.{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-green-400">
                            Now help a friend do the same.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-200 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 drop-shadow-md">
                        Shilingi Moves changed the way you see your finances. Share that with the people you care about — and earn lifetime access along the way.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center px-6">
                        <a
                            href="#share"
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg"
                        >
                            <Gift size={20} /> Start Referring
                        </a>
                        <a
                            href="#how-it-works"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/15 text-white font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg"
                        >
                            How It Works <ArrowRight size={18} />
                        </a>
                    </div>
                </div>

                {/* Curved bottom edge */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" className="w-full">
                        <path d="M0,60 L0,30 Q720,0 1440,30 L1440,60 Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how-it-works" className="py-16 md:py-24 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-sm font-semibold text-primary-700 mb-4">
                            <Zap size={14} /> Simple & Quick
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            How It <span className="text-primary-600">Works</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Three easy steps to share the wealth — literally.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
                        {howItWorks.map((item, idx) => (
                            <div key={idx} className="relative text-center group">
                                {/* Connector line (desktop only) */}
                                {idx < howItWorks.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-200 to-primary-100" />
                                )}

                                <div className="relative mb-6">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                        <item.icon size={32} />
                                    </div>
                                    <span className="absolute -top-2 -right-2 md:-top-3 md:-right-1 w-8 h-8 bg-primary-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg">
                                        {item.step}
                                    </span>
                                </div>

                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ REWARDS ═══════════ */}
            <section className="py-16 md:py-24 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-sm font-semibold text-amber-700 mb-4">
                            <Sparkles size={14} /> Rewards for Everyone
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            What You <span className="text-primary-600">Earn</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            The more friends you bring, the bigger your rewards. You both win.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                        {rewards.map((reward, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 ${reward.bgLight} ${reward.textColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <reward.icon size={28} />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{reward.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{reward.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ MILESTONE TRACKER ═══════════ */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-custom max-w-3xl">
                    <div className="text-center mb-12 md:mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Referral <span className="text-primary-600">Milestones</span>
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Track your progress and unlock bigger rewards as you reach each milestone.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {milestones.map((m, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl border-2 transition-all ${m.unlocked
                                    ? 'border-primary-200 bg-primary-50/50'
                                    : 'border-gray-100 bg-white'
                                    }`}
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${m.unlocked
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {m.unlocked ? <Check size={24} /> : m.count}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-base md:text-lg">
                                        {m.count} {m.count === 1 ? 'Friend' : 'Friends'} Referred
                                    </p>
                                    <p className="text-gray-500 text-sm">{m.reward}</p>
                                </div>
                                {m.unlocked && (
                                    <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                                        <CheckCircle size={14} /> Unlocked
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SHARE YOUR LINK ═══════════ */}
            <section id="share" className="py-16 md:py-24 bg-gradient-to-br from-primary-800 to-primary-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                </div>

                <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-6">
                        <Share2 size={14} /> Share & Earn
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                        Ready to spread the word?
                    </h2>
                    <p className="text-primary-200 text-base md:text-lg mb-10 max-w-xl mx-auto">
                        Share your unique referral link and start earning rewards today.
                    </p>

                    {/* Referral link box */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 max-w-lg mx-auto mb-8">
                        <p className="text-sm text-primary-200 mb-3 font-medium">Your referral link</p>
                        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                            <span className="flex-1 text-sm md:text-base text-white truncate font-mono">
                                shilingimoves.com/signup?ref={referralCode}
                            </span>
                            <button
                                onClick={handleCopy}
                                className={`shrink-0 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all duration-300 ${copied
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-primary-800 hover:bg-gray-100'
                                    }`}
                            >
                                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                            </button>
                        </div>
                    </div>

                    {/* Share buttons */}
                    <p className="text-sm text-primary-300 mb-4 font-medium">Or share directly via</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a
                            href={`https://wa.me/?text=Join%20me%20on%20Shilingi%20Moves%20and%20start%20your%20financial%20wellness%20journey!%20https://shilingimoves.com/signup?ref=${referralCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1dad50] text-white font-bold rounded-full text-sm transition-all duration-200 shadow-lg"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            WhatsApp
                        </a>
                        <a
                            href={`mailto:?subject=Join%20Shilingi%20Moves&body=I%27ve%20been%20using%20Shilingi%20Moves%20to%20manage%20my%20finances%20and%20I%20think%20you%27d%20love%20it!%20Sign%20up%20here%3A%20https://shilingimoves.com/signup?ref=${referralCode}`}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold rounded-full text-sm transition-all duration-200"
                        >
                            <Mail size={16} /> Email
                        </a>
                        <a
                            href={`sms:?body=Join%20me%20on%20Shilingi%20Moves!%20https://shilingimoves.com/signup?ref=${referralCode}`}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold rounded-full text-sm transition-all duration-200"
                        >
                            <MessageCircle size={16} /> SMS
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════ SOCIAL PROOF ═══════════ */}
            <section className="py-14 md:py-20 bg-gray-50">
                <div className="container-custom text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
                        {[
                            { value: '12,000+', label: 'Friends Referred' },
                            { value: '8,500+', label: 'Rewards Earned' },
                            { value: '98%', label: 'Would Refer Again' },
                            { value: '4.9/5', label: 'Referral Satisfaction' },
                        ].map((stat, idx) => (
                            <div key={idx} className="group">
                                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FAQ ═══════════ */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-custom max-w-3xl">
                    <div className="text-center mb-12 md:mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Frequently Asked <span className="text-primary-600">Questions</span>
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Everything you need to know about the referral programme.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-primary-200"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                                >
                                    <span className="font-bold text-gray-900 text-sm md:text-base pr-4">
                                        {faq.q}
                                    </span>
                                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openFaq === idx
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </span>
                                </button>
                                {openFaq === idx && (
                                    <div className="px-6 pb-5 text-gray-600 text-sm md:text-base leading-relaxed animate-fadeIn">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary-800 to-primary-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
                </div>

                <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <Heart size={40} className="text-primary-400" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                        Good things are better<br className="hidden sm:block" /> when shared.
                    </h2>
                    <p className="text-primary-200 text-base md:text-lg mb-8 md:mb-10 max-w-xl mx-auto">
                        Help someone you care about start their financial journey. It takes 10 seconds.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 text-base md:text-lg"
                    >
                        <Gift size={20} /> Start Referring Now
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ReferPage;
