import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, TrendingUp, Target, Landmark, Wallet, PiggyBank, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomePage1 from '../assets/home-page-1.png';
import HomePage2 from '../assets/home-page-2.png';
import HomePage3 from '../assets/home-page-3.png';

/* ─── Card style matching the screenshot: dark charcoal glass ─────────────── */
const cardBase = {
    background: 'rgba(130, 120, 115, 0.52)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
};

/* ─── Reusable glass card ──────────────────────────────────────────────────── */
const Card = ({ children, className = '', delay = '0s', style = {} }) => (
    <div
        className={`hidden md:flex flex-col gap-1.5 px-4 py-3 ${className}`}
        style={{ ...cardBase, animation: `floatCard 5s ease-in-out infinite ${delay}`, ...style }}
    >
        {children}
    </div>
);

/* ─── Stroke-bar row ───────────────────────────────────────────────────────── */
const StrokeRow = ({ label, amount, pct, color = '#10b981', icon: Icon }) => (
    <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                {Icon && <Icon size={10} color={color} strokeWidth={2.5} />}
                <span className="text-white/65 text-[10px] font-medium">{label}</span>
            </div>
            <span className="text-white/90 text-[10px] font-semibold">{amount}</span>
        </div>
        <div className="w-full h-[2.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div className="h-[2.5px] rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
    </div>
);

/* ─── Green connector line SVG (Monarch-style) ─────────────────────────────── */
/* Draws a thin green line from a card anchor point to a "device" focal point   */
const ConnectorLine = ({ x1, y1, x2, y2 }) => (
    <svg
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="greenLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
            </linearGradient>
        </defs>
        {/* Connector — draws itself in */}
        <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#greenLine)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            style={{ strokeDashoffset: 300, animation: 'drawLine 1.2s ease-out forwards 0.3s' }}
        />
        {/* Dot at card anchor */}
        <circle cx={x1} cy={y1} r="3" fill="#10b981"
            style={{ opacity: 0, animation: 'fadeInDot 0.4s ease forwards 0.2s' }}
        />
        {/* Pulsing target at device focal point */}
        <circle cx={x2} cy={y2} r="5" fill="#10b981"
            style={{ opacity: 0, animation: 'fadeInDot 0.4s ease forwards 1.4s' }}
        />
        <circle cx={x2} cy={y2} r="12" fill="none" stroke="#10b981" strokeWidth="1"
            style={{ opacity: 0, animation: 'pulseRing 2s ease-out infinite 1.6s' }}
        />
        <circle cx={x2} cy={y2} r="20" fill="none" stroke="#10b981" strokeWidth="0.6"
            style={{ opacity: 0, animation: 'pulseRing 2s ease-out infinite 1.9s' }}
        />
        <style>{`
            @keyframes drawLine  { to { stroke-dashoffset: 0; } }
            @keyframes fadeInDot { to { opacity: 0.85; } }
            @keyframes pulseRing {
                0%   { opacity: 0.5; }
                100% { opacity: 0;   }
            }
        `}</style>
    </svg>
);

/* ══════════════════════════════════════════════════════════════════════════════
   SLIDE 0  —  Cash Flow + Spending breakdown
   Cards: top-LEFT (small) + bottom-RIGHT (small)
   Line: connects bottom-right card → centre of image where "device" is
══════════════════════════════════════════════════════════════════════════════ */
const SlideCards0 = () => (
    <>
        {/* Green connector line — anchored bottom-right card → person's screen */}
        <ConnectorLine x1="78%" y1="72%" x2="55%" y2="58%" />

        {/* Card A — Cash Flow (top-right) */}
        <Card className="absolute top-28 right-6 lg:right-14 w-44" delay="0s">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Cash Flow · March</p>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[9px] text-primary-400 uppercase">Income</p>
                    <p className="text-base font-bold text-white leading-tight">Ksh 85K</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-red-400 uppercase">Spent</p>
                    <p className="text-base font-bold text-white leading-tight">Ksh 54K</p>
                </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-0.5 h-7">
                {[40, 65, 55, 80, 60, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-px items-center">
                        <div className="w-full rounded-sm bg-primary-500/70" style={{ height: `${h * 0.25}px` }} />
                        <div className="w-full rounded-sm bg-red-400/45" style={{ height: `${(100 - h) * 0.14}px` }} />
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-1">
                <TrendingUp size={10} className="text-primary-400" />
                <span className="text-primary-400 text-[9px] font-semibold">Ksh 30,800 saved</span>
            </div>
        </Card>

        {/* Card B — Spending breakdown (bottom-right) */}
        <Card className="absolute bottom-28 right-6 lg:right-14 w-48" delay="1.8s">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Where It Went</p>
            <div className="flex flex-col gap-1.5 mt-0.5">
                <StrokeRow label="Housing" amount="Ksh 18K" pct={85} color="#10b981" icon={Landmark} />
                <StrokeRow label="Food & Groceries" amount="Ksh 9.5K" pct={55} color="#34d399" icon={Wallet} />
                <StrokeRow label="Transport" amount="Ksh 5.2K" pct={38} color="#6ee7b7" icon={BarChart2} />
                <StrokeRow label="Savings" amount="Ksh 21K" pct={72} color="#059669" icon={PiggyBank} />
            </div>
        </Card>
    </>
);

/* ══════════════════════════════════════════════════════════════════════════════
   SLIDE 1  —  Net Worth + Linked Accounts
   Cards: centre-right (tall) + bottom-left (short)
   Line: connects centre-right → lower-centre image focus
══════════════════════════════════════════════════════════════════════════════ */
const SlideCards1 = () => (
    <>
        <ConnectorLine x1="78%" y1="50%" x2="55%" y2="62%" />

        {/* Card A — Net Worth (top-right) */}
        <Card className="absolute top-28 right-6 lg:right-14 w-48" delay="0s">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Net Worth</p>
            <p className="text-xl font-bold text-white tracking-tight leading-tight">Ksh 335,608</p>
            <div className="flex items-center gap-1">
                <TrendingUp size={11} className="text-primary-400" />
                <span className="text-primary-400 text-[10px] font-semibold">+Ksh 3,356 (1.0%)</span>
            </div>
            <div className="flex flex-col gap-1.5 mt-1 pt-1.5 border-t border-white/10">
                <StrokeRow label="Savings" amount="Ksh 120K" pct={80} color="#10b981" />
                <StrokeRow label="Investments" amount="Ksh 180K" pct={90} color="#34d399" />
                <StrokeRow label="M-Pesa" amount="Ksh 35K" pct={30} color="#6ee7b7" />
            </div>
        </Card>

        {/* Card B — Linked Accounts (bottom-right) */}
        <Card className="absolute bottom-28 right-6 lg:right-14 w-44" delay="1.6s">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Accounts</p>
            <div className="flex flex-col gap-1.5 mt-0.5">
                {[
                    { name: 'KCB Savings', amount: 'Ksh 120K', dot: '#10b981' },
                    { name: 'Equity Loan', amount: '−Ksh 45K', dot: '#f87171' },
                    { name: 'M-Pesa', amount: 'Ksh 35K', dot: '#34d399' },
                    { name: 'NSE Portfolio', amount: 'Ksh 225K', dot: '#a7f3d0' },
                ].map((acc, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: acc.dot }} />
                            <span className="text-white/75 text-[10px]">{acc.name}</span>
                        </div>
                        <span className="text-white text-[10px] font-semibold">{acc.amount}</span>
                    </div>
                ))}
            </div>
        </Card>
    </>
);

/* ══════════════════════════════════════════════════════════════════════════════
   SLIDE 2  —  Budget Ring + Savings Goals
   Cards: top-right (budget) + mid-left (goals)
   Line: connects top-right card → upper-centre where device screen is
══════════════════════════════════════════════════════════════════════════════ */
const SlideCards2 = () => (
    <>
        {/* Line: FROM phone (centre of image) TO top-right card */}
        <ConnectorLine x1="42%" y1="62%" x2="78%" y2="30%" />

        {/* Card A — Budget ring (top-right) */}
        <Card className="absolute top-28 right-6 lg:right-14 w-48" delay="0s">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Monthly Budget</p>
            <div className="flex items-center gap-3">
                <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0 -rotate-90">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                    <circle
                        cx="24" cy="24" r="18" fill="none"
                        stroke="#10b981" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 18 * 0.68} ${2 * Math.PI * 18}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div>
                    <p className="text-primary-400 text-[10px] font-bold">68% used</p>
                    <p className="text-white text-sm font-semibold">Ksh 34K</p>
                    <p className="text-white/40 text-[9px]">of Ksh 50K</p>
                </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/10">
                <StrokeRow label="Fixed" amount="Ksh 23K" pct={75} color="#10b981" icon={Landmark} />
                <StrokeRow label="Flex" amount="Ksh 11K" pct={45} color="#34d399" icon={Wallet} />
            </div>
        </Card>

        {/* Card B — Savings Goals (bottom-right) */}
        <Card className="absolute bottom-28 right-6 lg:right-14 w-44" delay="1.6s">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Your Goals</p>
            <div className="flex flex-col gap-2 mt-0.5">
                {[
                    { label: '🔥 Emergency Fund', pct: 100, note: 'Complete!', color: '#10b981' },
                    { label: '🏖️ Mombasa Trip', pct: 68, note: 'Ksh 68K / 100K', color: '#34d399' },
                    { label: '🏠 Home Deposit', pct: 22, note: 'Ksh 220K / 1M', color: '#6ee7b7' },
                ].map((g, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center">
                            <span className="text-white/75 text-[10px] font-medium">{g.label}</span>
                            <span className="text-[9px] font-bold" style={{ color: g.color }}>
                                {g.pct === 100 ? '✓' : `${g.pct}%`}
                            </span>
                        </div>
                        <div className="w-full h-[2.5px] rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }}>
                            <div className="h-[2.5px] rounded-full" style={{ width: `${g.pct}%`, background: g.color }} />
                        </div>
                        <span className="text-white/30 text-[9px]">{g.note}</span>
                    </div>
                ))}
            </div>
        </Card>
    </>
);

const slideCards = [<SlideCards0 key={0} />, <SlideCards1 key={1} />, <SlideCards2 key={2} />];

/* ─── Main Hero component ──────────────────────────────────────────────────── */
const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [cardsShown, setCardsShown] = useState(false); // cards hidden until image settles
    const images = [HomePage1, HomePage2, HomePage3];

    useEffect(() => {
        // UX sequence per slide:
        // 0ms   — new image fades in (1s CSS transition)
        // 2000ms — cards + connector line fade/draw in
        // 10000ms — cards fade out, image starts to change, cycle repeats

        // Kick off the very first card appearance on mount
        const firstShow = setTimeout(() => setCardsShown(true), 2000);

        const interval = setInterval(() => {
            // 1. Hide cards
            setCardsShown(false);
            // 2. Change image after cards are gone (500ms fade)
            setTimeout(() => {
                setCurrentImageIndex(prev => (prev + 1) % images.length);
            }, 500);
            // 3. Show cards 2s after image started fading in
            setTimeout(() => setCardsShown(true), 2000);
        }, 10000); // 10s per slide

        return () => { clearInterval(interval); clearTimeout(firstShow); };
    }, [images.length]);

    const scrollToContent = () => {
        const target = document.getElementById('what-you-get');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    };

    const handleHeroClick = (e) => {
        // Only scroll if the user clicked on empty space, not on a button/link/card
        const tag = e.target.tagName.toLowerCase();
        const isInteractive = e.target.closest('a, button, [data-no-scroll]');
        if (!isInteractive && tag !== 'svg' && tag !== 'path') {
            scrollToContent();
        }
    };

    return (
        <section
            className="relative h-screen min-h-[600px] flex items-center overflow-hidden cursor-pointer"
            onClick={handleHeroClick}
        >

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
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
                    </div>
                ))}
            </div>

            {/* Hero Content */}
            <div className="container-custom relative z-10 w-full pt-20 pb-28">
                <div className="max-w-xl">
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-5"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        Take control of your money.{' '}
                        <span className="text-primary-400">Build the life you want.</span>
                    </h1>

                    <p
                        className="font-sans text-base sm:text-lg text-gray-200 leading-relaxed mb-8 max-w-md font-light"
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
                            className="inline-flex items-center justify-between gap-4 px-6 py-4 border-2 border-white/80 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-0.5 group text-base w-full sm:w-auto"
                        >
                            <span>Launch your Shilingi Dashboard</span>
                            <span className="w-8 h-8 rounded-full border-2 border-white/70 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
                                <ArrowRight size={15} />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Slide-synced floating cards + connector line */}
            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    opacity: cardsShown ? 1 : 0,
                    transition: 'opacity 0.7s ease-in-out',
                }}
            >
                {slideCards[currentImageIndex]}
            </div>


        </section>
    );
};

export default Hero;
