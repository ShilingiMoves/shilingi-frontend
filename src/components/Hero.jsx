import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Landmark, Wallet, PiggyBank, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomePage1 from '../assets/home-page-1.webp';
import HomePage2 from '../assets/home-page-2.webp';
import HomePage3 from '../assets/home-page-3.webp';

/* ─── Animated Number Component ────────────────────────────────────────────── */
const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0, isActive = true }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isActive) return;
        let startTime;
        const duration = 1500; // 1.5s animation
        const endValue = parseFloat(value);

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // easeOutQuart for smooth slow-down at the end
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            setCount(endValue * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [value, isActive]);

    const formatted = count.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return <>{prefix}{formatted}{suffix}</>;
};

/* ─── Card style: warm grey frosted glass matching screenshot ──────────────── */
const cardBase = {
    background: 'rgba(130, 120, 115, 0.52)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
};

/* ─── Reusable glass card ──────────────────────────────────────────────────── */
const Card = ({ children, className = '', animDelay = '0s', delayMs = 0, isActive = true, style = {} }) => (
    <div
        className={`hidden md:flex flex-col gap-1.5 px-4 py-3 transition-all duration-700 ease-out ${className}`}
        style={{
            ...cardBase,
            animation: isActive ? `floatCard 5s ease-in-out infinite ${animDelay}` : 'none',
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.95)',
            transitionDelay: `${delayMs}ms`,
            ...style
        }}
    >
        {children}
    </div>
);

/* ─── Stroke-bar row ───────────────────────────────────────────────────────── */
const StrokeRow = ({ label, amount, pct, color = '#10b981', icon: Icon, isActive = true, delayMs = 0 }) => (
    <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between transition-opacity duration-500" style={{ opacity: isActive ? 1 : 0, transitionDelay: `${delayMs}ms` }}>
            <div className="flex items-center gap-1">
                {Icon && <Icon size={10} color={color} strokeWidth={2.5} />}
                <span className="text-white/65 text-[10px] font-medium">{label}</span>
            </div>
            <span className="text-white/90 text-[10px] font-semibold">{amount}</span>
        </div>
        <div className="w-full h-[2.5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div className="h-[2.5px] rounded-full transform origin-left transition-transform duration-1000 ease-out"
                style={{ width: `${pct}%`, background: color, transform: isActive ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: `${delayMs + 200}ms` }} />
        </div>
    </div>
);

/* ─── Green connector line (Monarch-style dashed line with dots) ───────────── */
const ConnectorLine = ({ x1, y1, x2, y2, isActive = true }) => (
    <svg
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-1000 ease-out"
        style={{ opacity: isActive ? 1 : 0, transitionDelay: '300ms' }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="greenLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="40%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
            </linearGradient>
        </defs>
        <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#greenLine)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
        />
        <circle cx={x1} cy={y1} r="3" fill="#10b981" opacity="0.8" />
        <circle cx={x2} cy={y2} r="4" fill="#10b981" opacity="0.25" />
        <circle cx={x2} cy={y2} r="7" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.2" />
    </svg>
);

/* ══════════════════════════════════════════════════════════════════════════════
   SLIDE 0: Cash Flow + Spending breakdown
   Card A: top-right | Card B: bottom-right
══════════════════════════════════════════════════════════════════════════════ */
const SlideCards0 = ({ isActive }) => (
    <>
        <ConnectorLine x1="75%" y1="72%" x2="52%" y2="58%" isActive={isActive} />

        {/* Card A: Cash Flow (top-right) */}
        <Card className="absolute top-28 right-6 lg:right-14 w-44" animDelay="0s" delayMs={400} isActive={isActive}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Cash Flow · March</p>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[9px] text-primary-400 uppercase">Income</p>
                    <p className="text-base font-bold text-white leading-tight"><AnimatedNumber value={85} prefix="Ksh " suffix="K" isActive={isActive} delayMs={800} /></p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-red-400 uppercase">Spent</p>
                    <p className="text-base font-bold text-white leading-tight"><AnimatedNumber value={54} prefix="Ksh " suffix="K" isActive={isActive} delayMs={900} /></p>
                </div>
            </div>
            <div className="flex items-end gap-0.5 h-7">
                {[40, 65, 55, 80, 60, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-px items-center transition-all duration-700 ease-out" style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'bottom', transitionDelay: `${1200 + (i * 100)}ms` }}>
                        <div className="w-full rounded-sm bg-primary-500/70" style={{ height: `${h * 0.25}px` }} />
                        <div className="w-full rounded-sm bg-red-400/45" style={{ height: `${(100 - h) * 0.14}px` }} />
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-1 transition-opacity duration-500" style={{ opacity: isActive ? 1 : 0, transitionDelay: '1900ms' }}>
                <TrendingUp size={10} className="text-primary-400" />
                <span className="text-primary-400 text-[9px] font-semibold"><AnimatedNumber value={30800} prefix="Ksh " suffix=" saved" isActive={isActive} delayMs={2000} /></span>
            </div>
        </Card>

        {/* Card B: Spending breakdown (bottom-right) */}
        <Card className="absolute bottom-28 right-6 lg:right-14 w-48" animDelay="1s" delayMs={1200} isActive={isActive}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Where It Went</p>
            <div className="flex flex-col gap-1.5 mt-0.5">
                <StrokeRow label="Housing" amount="Ksh 18K" pct={85} color="#10b981" icon={Landmark} isActive={isActive} delayMs={1400} />
                <StrokeRow label="Food & Groceries" amount="Ksh 9.5K" pct={55} color="#34d399" icon={Wallet} isActive={isActive} delayMs={1450} />
                <StrokeRow label="Transport" amount="Ksh 5.2K" pct={38} color="#6ee7b7" icon={BarChart2} isActive={isActive} delayMs={1500} />
                <StrokeRow label="Savings" amount="Ksh 21K" pct={72} color="#059669" icon={PiggyBank} isActive={isActive} delayMs={1550} />
            </div>
        </Card>
    </>
);

/* ══════════════════════════════════════════════════════════════════════════════
   SLIDE 1: Net Worth + Linked Accounts
   Card A: CENTRE GAP (between hero text and person) | Card B: bottom-right
   Line:  FROM laptop (right) → TO card in centre gap
══════════════════════════════════════════════════════════════════════════════ */
const SlideCards1 = ({ isActive }) => (
    <>
        {/* Line: FROM phone on right side → TO Card A in centre */}
        <ConnectorLine x1="72%" y1="58%" x2="52%" y2="35%" isActive={isActive} />

        {/* Card A: Net Worth (Moved to centre to avoid left-side text) */}
        <Card className="absolute top-20 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[52%] w-48" animDelay="0s" delayMs={400} isActive={isActive}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Net Worth</p>
            <p className="text-xl font-bold text-white tracking-tight leading-tight">
                <AnimatedNumber value={335608} prefix="Ksh " isActive={isActive} delayMs={800} />
            </p>
            <div className="flex items-center gap-1">
                <TrendingUp size={11} className="text-primary-400" />
                <span className="text-primary-400 text-[10px] font-semibold">
                    +<AnimatedNumber value={3356} prefix="Ksh " isActive={isActive} delayMs={1000} /> (1.0%)
                </span>
            </div>
            <div className="flex flex-col gap-1.5 mt-1 pt-1.5 border-t border-white/10">
                <StrokeRow label="Savings" amount="Ksh 120K" pct={80} color="#10b981" isActive={isActive} delayMs={1200} />
                <StrokeRow label="Investments" amount="Ksh 180K" pct={90} color="#34d399" isActive={isActive} delayMs={1250} />
                <StrokeRow label="M-Pesa" amount="Ksh 35K" pct={30} color="#6ee7b7" isActive={isActive} delayMs={1300} />
            </div>
        </Card>

        {/* Card B: Linked Accounts (bottom-right) */}
        <Card className="absolute bottom-28 right-6 lg:right-14 w-44" animDelay="1s" delayMs={1400} isActive={isActive}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Accounts</p>
            <div className="flex flex-col gap-1.5 mt-0.5">
                {[
                    { name: 'KCB Savings', amount: 'Ksh 120K', dot: '#10b981' },
                    { name: 'Equity Loan', amount: '−Ksh 45K', dot: '#f87171' },
                    { name: 'M-Pesa', amount: 'Ksh 35K', dot: '#34d399' },
                    { name: 'NSE Portfolio', amount: 'Ksh 225K', dot: '#a7f3d0' },
                ].map((acc, i) => (
                    <div key={i} className="flex items-center justify-between transition-all duration-500 ease-out" style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translateY(0)' : 'translateY(10px)', transitionDelay: `${1700 + (i * 100)}ms` }}>
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
   SLIDE 2: Budget Ring + Savings Goals
   Card A: top-right | Card B: mid-left
   Line:  FROM phone (centre) → TO top-right card
══════════════════════════════════════════════════════════════════════════════ */
const SlideCards2 = ({ isActive }) => (
    <>
        {/* Line: FROM device in image → TO top-right card */}
        <ConnectorLine x1="42%" y1="62%" x2="72%" y2="30%" isActive={isActive} />

        {/* Card A: Budget ring (top-right) */}
        <Card className="absolute top-20 right-6 lg:right-14 w-48" animDelay="0s" delayMs={400} isActive={isActive}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Monthly Budget</p>
            <div className="flex items-center gap-3">
                <svg width="48" height="48" viewBox="0 0 48 48" className="flex-shrink-0 -rotate-90">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                    <circle
                        cx="24" cy="24" r="18" fill="none"
                        stroke="#10b981" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 18 * 0.68} ${2 * Math.PI * 18}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ strokeDashoffset: isActive ? 0 : 2 * Math.PI * 18 * 0.68, transitionDelay: '1000ms' }}
                    />
                </svg>
                <div>
                    <p className="text-primary-400 text-[10px] font-bold">
                        <AnimatedNumber value={68} suffix="% used" isActive={isActive} delayMs={800} />
                    </p>
                    <p className="text-white text-sm font-semibold">
                        <AnimatedNumber value={34} prefix="Ksh " suffix="K" isActive={isActive} delayMs={900} />
                    </p>
                    <p className="text-white/40 text-[9px]">of Ksh 50K</p>
                </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/10">
                <StrokeRow label="Fixed" amount="Ksh 23K" pct={75} color="#10b981" icon={Landmark} isActive={isActive} delayMs={1300} />
                <StrokeRow label="Flex" amount="Ksh 11K" pct={45} color="#34d399" icon={Wallet} isActive={isActive} delayMs={1350} />
            </div>
        </Card>

        {/* Card B: Savings Goals (Moved from left to bottom centre-right to avoid text) */}
        <Card className="absolute bottom-16 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-[55%] w-48" animDelay="1s" delayMs={1400} isActive={isActive}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Your Goals</p>
            <div className="flex flex-col gap-2 mt-0.5">
                {[
                    { label: '🔥 Emergency Fund', pct: 100, note: 'Complete!', color: '#10b981' },
                    { label: '🏖️ Mombasa Trip', pct: 68, note: 'Ksh 68K / 100K', color: '#34d399' },
                    { label: '🏠 Home Deposit', pct: 22, note: 'Ksh 220K / 1M', color: '#6ee7b7' },
                ].map((g, i) => (
                    <div key={i} className="flex flex-col gap-0.5 transition-all duration-500 ease-out" style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translateY(0)' : 'translateY(10px)', transitionDelay: `${1700 + (i * 150)}ms` }}>
                        <div className="flex justify-between items-center">
                            <span className="text-white/75 text-[10px] font-medium">{g.label}</span>
                            <span className="text-[9px] font-bold" style={{ color: g.color }}>
                                {g.pct === 100 ? '✓' : `${g.pct}%`}
                            </span>
                        </div>
                        <div className="w-full h-[2.5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                            <div className="h-[2.5px] rounded-full transform origin-left transition-transform duration-1000 ease-out"
                                style={{ width: `${g.pct}%`, background: g.color, transform: isActive ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: `${1900 + (i * 150)}ms` }} />
                        </div>
                        <span className="text-white/30 text-[9px]">{g.note}</span>
                    </div>
                ))}
            </div>
        </Card>
    </>
);

const slideCards = [SlideCards0, SlideCards1, SlideCards2];

/* ─── Main Hero component ──────────────────────────────────────────────────── */
const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [cardsShown, setCardsShown] = useState(false);
    
    const images = [HomePage1, HomePage2, HomePage3];

    useEffect(() => {
        // UX sequence: cards appear after 2s
        const firstShow = setTimeout(() => setCardsShown(true), 2000);

        const interval = setInterval(() => {
            setCardsShown(false);
            setTimeout(() => {
                setCurrentImageIndex(prev => (prev + 1) % images.length);
            }, 500);
            setTimeout(() => setCardsShown(true), 2000);
        }, 10000); // 10s per slide

        return () => { clearInterval(interval); clearTimeout(firstShow); };
    }, [images.length]);

    const scrollToContent = () => {
        const target = document.getElementById('what-you-get');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    };

    const handleHeroClick = (e) => {
        const isInteractive = e.target.closest('a, button, [data-no-scroll]');
        const tag = e.target.tagName.toLowerCase();
        if (!isInteractive && tag !== 'svg' && tag !== 'path') {
            scrollToContent();
        }
    };

    return (
        <section
            className="relative flex min-h-[560px] items-center overflow-hidden cursor-pointer md:h-[calc(100vh-88px)] md:min-h-[560px]"
            onClick={handleHeroClick}
        >
            {/* Full Width Background Image Carousel */}
            <div className="absolute inset-0 z-0">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={img}
                            alt={`Shilingi Moves Feature ${index + 1}`}
                            className="w-full h-full object-cover object-center lg:object-right"
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                        />
                        {/* Gradient overlay to ensure text on the left is readable */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent text-white" />
                    </div>
                ))}
            </div>

            {/* Slide-synced floating cards */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {slideCards.map((SlideComponent, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${index === currentImageIndex && cardsShown ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <SlideComponent isActive={index === currentImageIndex && cardsShown} />
                    </div>
                ))}
            </div>

            {/* Left-Aligned Text Content */}
            <div className="container-custom relative z-20 w-full pt-16 pb-16 pl-6 sm:pl-12 md:pt-12 md:pb-12 lg:pl-20">
                <div className="max-w-xl">
                    <h1
                        className="mb-4 text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4rem]"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
                    >
                        Take control of <br className="hidden md:block"/> your money.{' '}
                        <br />
                        <span className="text-[#34d399]">Build the life you want.</span>
                    </h1>

                    <p
                        className="mb-6 max-w-md font-sans text-base font-medium leading-relaxed text-gray-200 sm:text-lg md:mb-7"
                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}
                    >
                        Shilingi Moves is your complete financial wellness platform. Learn, plan, compare, and grow your money built for Kenyan realities. One Shilingi at a time.
                    </p>

                    <div className="flex flex-col sm:flex-row">
                        <Link
                            to="/onboarding"
                            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#10b981] px-7 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#059669] hover:shadow-lg sm:w-auto"
                        >
                            Unlock better money habits
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors">
                                <ArrowRight size={15} />
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
