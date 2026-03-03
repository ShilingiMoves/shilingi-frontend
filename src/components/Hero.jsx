import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, TrendingUp, TrendingDown, Target, Landmark, Wallet, PiggyBank, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomePage1 from '../assets/home-page-1.png';
import HomePage2 from '../assets/home-page-2.png';
import HomePage3 from '../assets/home-page-3.png';

/* ─── Reusable glass card wrapper ─────────────────────────────────────────── */
const GlassCard = ({ children, className = '', style = {}, delay = '0s' }) => (
    <div
        className={`hidden md:flex flex-col gap-2 rounded-2xl px-5 py-4 shadow-2xl ${className}`}
        style={{
            background: 'rgba(15, 23, 30, 0.55)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.14)',
            animation: `floatCard 5s ease-in-out infinite ${delay}`,
            ...style,
        }}
    >
        {children}
    </div>
);

/* ─── Stroke-bar row (like Monarch's spend lines) ─────────────────────────── */
const StrokeRow = ({ label, amount, pct, color = '#10b981', icon: Icon }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                {Icon && <Icon size={11} color={color} strokeWidth={2.5} />}
                <span className="text-white/70 text-[11px] font-medium">{label}</span>
            </div>
            <span className="text-white/90 text-[11px] font-semibold">{amount}</span>
        </div>
        {/* Stroke bar */}
        <div className="w-full h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div
                className="h-[3px] rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
            />
        </div>
    </div>
);

/* ─── Slide-specific card sets ────────────────────────────────────────────── */

/* SLIDE 0 — Cash Flow (income vs spend) */
const SlideCards0 = () => (
    <>
        {/* Card A: Monthly Cash Flow */}
        <GlassCard className="absolute top-28 right-6 lg:right-14 w-60" delay="0s">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Cash Flow · March</p>
            <div className="flex items-end justify-between mt-1 mb-1">
                <div>
                    <p className="text-[10px] text-primary-400 uppercase tracking-wide">Income</p>
                    <p className="text-xl font-bold text-white">Ksh 85,000</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-red-400 uppercase tracking-wide">Spent</p>
                    <p className="text-xl font-bold text-white">Ksh 54,200</p>
                </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-10 mt-1">
                {[40, 65, 55, 80, 60, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                        <div className="w-full rounded-sm bg-primary-500/70" style={{ height: `${h * 0.38}px` }} />
                        <div className="w-full rounded-sm bg-red-400/50" style={{ height: `${(100 - h) * 0.22}px` }} />
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp size={12} className="text-primary-400" />
                <span className="text-primary-400 text-[11px] font-semibold">Ksh 30,800 saved this month</span>
            </div>
        </GlassCard>

        {/* Card B: Where money went (stroke-bar list) */}
        <GlassCard className="absolute bottom-24 right-6 lg:right-14 w-60" delay="1.5s">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Where It Went</p>
            <div className="flex flex-col gap-2.5 mt-1">
                <StrokeRow label="Housing" amount="Ksh 18,000" pct={85} color="#10b981" icon={Landmark} />
                <StrokeRow label="Food & Groceries" amount="Ksh 9,500" pct={55} color="#34d399" icon={Wallet} />
                <StrokeRow label="Transport" amount="Ksh 5,200" pct={38} color="#6ee7b7" icon={BarChart2} />
                <StrokeRow label="Savings" amount="Ksh 21,300" pct={72} color="#059669" icon={PiggyBank} />
            </div>
        </GlassCard>
    </>
);

/* SLIDE 1 — Net Worth + Accounts */
const SlideCards1 = () => (
    <>
        {/* Card A: Net Worth */}
        <GlassCard className="absolute top-28 right-6 lg:right-14 w-60" delay="0s">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Net Worth</p>
            <p className="text-3xl font-bold text-white tracking-tight mt-0.5">Ksh 335,608</p>
            <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-primary-400" />
                <span className="text-primary-400 text-xs font-semibold">+Ksh 3,356 (1.0%)</span>
                <span className="text-white/40 text-xs">this month</span>
            </div>
            {/* Asset breakdown strokes */}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                <StrokeRow label="Savings" amount="Ksh 120K" pct={80} color="#10b981" />
                <StrokeRow label="Investments" amount="Ksh 180K" pct={90} color="#34d399" />
                <StrokeRow label="M-Pesa" amount="Ksh 35K" pct={30} color="#6ee7b7" />
            </div>
        </GlassCard>

        {/* Card B: Linked Accounts */}
        <GlassCard className="absolute bottom-24 right-6 lg:right-14 w-60" delay="1.5s">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Linked Accounts</p>
            <div className="flex flex-col gap-2 mt-1">
                {[
                    { name: 'KCB Savings', amount: 'Ksh 120,000', dot: '#10b981' },
                    { name: 'Equity Loan', amount: '−Ksh 45,000', dot: '#f87171' },
                    { name: 'M-Pesa Wallet', amount: 'Ksh 35,608', dot: '#34d399' },
                    { name: 'NSE Portfolio', amount: 'Ksh 225,000', dot: '#a7f3d0' },
                ].map((acc, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: acc.dot }} />
                            <span className="text-white/80 text-[12px]">{acc.name}</span>
                        </div>
                        <span className="text-white text-[12px] font-semibold">{acc.amount}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    </>
);

/* SLIDE 2 — Savings Goals + Budget Ring */
const SlideCards2 = () => (
    <>
        {/* Card A: Budget ring + breakdown */}
        <GlassCard className="absolute top-28 right-6 lg:right-14 w-60" delay="0s">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Monthly Budget</p>
            <div className="flex items-center gap-4 mt-1">
                {/* SVG ring */}
                <svg width="64" height="64" viewBox="0 0 64 64" className="flex-shrink-0 -rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                    <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="#10b981" strokeWidth="7"
                        strokeDasharray={`${2 * Math.PI * 26 * 0.68} ${2 * Math.PI * 26}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div>
                    <p className="text-primary-400 text-xs font-bold">68% used</p>
                    <p className="text-white text-sm font-semibold">Ksh 34K</p>
                    <p className="text-white/40 text-[11px]">of Ksh 50K</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <StrokeRow label="Fixed Expenses" amount="Ksh 23K" pct={75} color="#10b981" icon={Landmark} />
                <StrokeRow label="Flex Spend" amount="Ksh 11K" pct={45} color="#34d399" icon={Wallet} />
                <StrokeRow label="Remaining" amount="Ksh 16K" pct={32} color="#6ee7b7" icon={PiggyBank} />
            </div>
        </GlassCard>

        {/* Card B: Savings Goals */}
        <GlassCard className="absolute bottom-24 right-6 lg:right-14 w-60" delay="1.5s">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Your Goals</p>
            <div className="flex flex-col gap-2.5 mt-1">
                {[
                    { label: '🔥 Emergency Fund', pct: 100, note: 'Complete!', color: '#10b981' },
                    { label: '🏖️ Vacation — Mombasa', pct: 68, note: 'Ksh 68K / 100K', color: '#34d399' },
                    { label: '🏠 Home Deposit', pct: 22, note: 'Ksh 220K / 1M', color: '#6ee7b7' },
                    { label: '📈 Investment Top-up', pct: 45, note: 'Ksh 45K / 100K', color: '#a7f3d0' },
                ].map((g, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-white/80 text-[11px] font-medium">{g.label}</span>
                            <span className="text-[10px]" style={{ color: g.color }}>{g.pct === 100 ? '✓' : `${g.pct}%`}</span>
                        </div>
                        <div className="w-full h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
                            <div className="h-[3px] rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                        </div>
                        <span className="text-white/35 text-[10px]">{g.note}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    </>
);

const slideCards = [<SlideCards0 key={0} />, <SlideCards1 key={1} />, <SlideCards2 key={2} />];

/* ─── Main component ──────────────────────────────────────────────────────── */
const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [cardVisible, setCardVisible] = useState(true);
    const images = [HomePage1, HomePage2, HomePage3];

    useEffect(() => {
        const interval = setInterval(() => {
            /* Fade cards out, swap slide, fade back in */
            setCardVisible(false);
            setTimeout(() => {
                setCurrentImageIndex(prev => (prev + 1) % images.length);
                setCardVisible(true);
            }, 600);
        }, 5500);
        return () => clearInterval(interval);
    }, [images.length]);

    const scrollToContent = () => {
        window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
    };

    return (
        <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">

            {/* Background Image Carousel */}
            <div className="absolute inset-0 z-0">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={img}
                            alt={`Shilingi Moves Background ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                    </div>
                ))}
            </div>

            {/* Hero Content */}
            <div className="container-custom relative z-10 w-full pt-20 pb-28">
                <div className="max-w-2xl">
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-5"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        Take control of your money.{' '}
                        <span className="text-primary-400">Build the life you want.</span>
                    </h1>

                    <p
                        className="font-sans text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-8 max-w-lg font-light"
                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                    >
                        Shilingi Moves is your complete financial wellness platform. Learn, plan, compare, and grow your money built for Kenyan realities. One Shilingi at a time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                            to="/signup"
                            className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary-900/40 hover:-translate-y-0.5 group text-base w-full sm:w-auto"
                        >
                            Create your account
                            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                                <ArrowRight size={15} />
                            </span>
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-between gap-4 px-6 py-4 border-2 border-white/80 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-0.5 group text-base w-full sm:w-auto sm:min-w-[200px]"
                        >
                            <span>Launch your Shilingi Dashboard</span>
                            <span className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
                                <ArrowRight size={15} />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Slide-specific floating cards — fade in/out on slide change */}
            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    opacity: cardVisible ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                }}
            >
                {slideCards[currentImageIndex]}
            </div>

            {/* Scroll Cue */}
            <div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 animate-bounce cursor-pointer"
                onClick={scrollToContent}
            >
                <div className="flex flex-col items-center gap-1.5 text-white hover:text-primary-300 transition-colors drop-shadow-lg">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em]">Explore</span>
                    <div className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center hover:border-white transition-colors">
                        <ArrowDown size={16} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
