import React from 'react';
import {
    AbsoluteFill,
    Easing,
    Img,
    Sequence,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import {
    Coins,
    Landmark,
    PiggyBank,
    ShieldCheck,
    TrendingUp,
    Umbrella,
    Wallet,
} from 'lucide-react';
import shilingiLogo from '../assets/shilingi-logo-animated.gif';

const colors = {
    cream: '#F5F0E4',
    navy: '#0D1B2A',
    green: '#1A6B3C',
    greenMid: '#22A05A',
    mint: '#D6EFE1',
    yellow: '#F0C94D',
    white: '#FFFFFF',
    slate: '#64748B',
    soft: '#EEF2F7',
};

const clamp = {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame, start, end) => interpolate(frame, [start, end], [0, 1], { ...clamp, easing: ease });
const exit = (frame, start, end) => interpolate(frame, [start, end], [1, 0], { ...clamp, easing: ease });

const planningTools = [
    {
        label: 'Budget Planner',
        value: 'KSh 45K/mo',
        note: 'Spending aligned to your plan',
        icon: Wallet,
        color: '#16A34A',
        bg: '#F0FDF4',
        pct: 73,
    },
    {
        label: 'Debt Manager',
        value: '9 mo faster',
        note: 'See the cleanest payoff path',
        icon: Landmark,
        color: '#EF4444',
        bg: '#FEF2F2',
        pct: 56,
    },
    {
        label: 'Investment Planner',
        value: '+12.4% YTD',
        note: 'Track growth in one place',
        icon: TrendingUp,
        color: '#2563EB',
        bg: '#EFF6FF',
        pct: 78,
    },
    {
        label: 'Protection Planner',
        value: '2 policies',
        note: 'Protect income and family',
        icon: Umbrella,
        color: '#D97706',
        bg: '#FFFBEB',
        pct: 62,
    },
    {
        label: 'Retirement Planner',
        value: '34% ready',
        note: 'Know your future target',
        icon: PiggyBank,
        color: '#7C3AED',
        bg: '#F5F3FF',
        pct: 34,
    },
    {
        label: 'Net Worth Tracker',
        value: 'KSh 2.45M',
        note: 'Assets, debts and growth together',
        icon: Coins,
        color: colors.green,
        bg: '#ECFDF5',
        pct: 86,
    },
];

const LogoMark = ({ size = 58 }) => (
    <div
        style={{
            width: size,
            height: size,
            borderRadius: size * 0.28,
            display: 'grid',
            placeItems: 'center',
            background: colors.greenMid,
            color: colors.white,
        }}
    >
        <Coins size={size * 0.52} strokeWidth={2.8} />
    </div>
);

const PhoneShell = ({ children }) => (
    <div
        style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 548,
            height: 1094,
            transform: 'translate(-50%, -50%)',
            borderRadius: 86,
            background: '#060A12',
            padding: 15,
            boxShadow: '0 46px 100px rgba(13,27,42,0.24)',
        }}
    >
        <div
            style={{
                position: 'absolute',
                left: 139,
                top: 25,
                width: 270,
                height: 58,
                borderRadius: 999,
                background: '#000000',
                zIndex: 4,
            }}
        />
        <div
            style={{
                width: '100%',
                height: '100%',
                borderRadius: 72,
                overflow: 'hidden',
                background: colors.soft,
                position: 'relative',
            }}
        >
            {children}
        </div>
    </div>
);

const LogoIntro = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 96, mass: 0.8 } });
    const opacity = exit(frame, 2.55 * fps, 3.15 * fps);

    return (
        <AbsoluteFill
            style={{
                opacity,
                background: `radial-gradient(circle at 50% 42%, ${colors.mint} 0%, ${colors.cream} 62%)`,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}
        >
            <div style={{ transform: `scale(${0.82 + logoScale * 0.18})` }}>
                <Img
                    src={shilingiLogo}
                    style={{
                        width: 190,
                        height: 190,
                        objectFit: 'contain',
                        margin: '0 auto',
                    }}
                />
                <div style={{ marginTop: 24, color: colors.navy, fontSize: 52, fontWeight: 950 }}>
                    Shilingi Moves
                </div>
                <div style={{ marginTop: 12, color: colors.green, fontSize: 24, fontWeight: 850 }}>
                    See your money move.
                </div>
            </div>
        </AbsoluteFill>
    );
};

const AppHeader = () => (
    <div
        style={{
            height: 158,
            padding: '86px 28px 22px',
            background: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderBottom: '1px solid #E2E8F0',
        }}
    >
        <LogoMark size={52} />
        <div style={{ flex: 1 }}>
            <div style={{ color: colors.navy, fontSize: 24, fontWeight: 940 }}>Shilingi Moves</div>
            <div style={{ color: colors.slate, fontSize: 16, fontWeight: 650, marginTop: 4 }}>Your financial dashboard</div>
        </div>
        <div
            style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                display: 'grid',
                placeItems: 'center',
                background: colors.mint,
                color: colors.green,
                fontSize: 18,
                fontWeight: 900,
            }}
        >
            M
        </div>
    </div>
);

const NetWorthCard = ({ compact = false }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const count = Math.round(interpolate(frame, [0.2 * fps, 1.35 * fps], [0, 2450000], clamp));

    return (
        <div
            style={{
                margin: compact ? '18px 24px 0' : '26px 24px 0',
                borderRadius: 34,
                padding: compact ? '24px 28px' : 30,
                background: colors.green,
                color: colors.white,
                boxShadow: '0 18px 34px rgba(26,107,60,0.22)',
            }}
        >
            <div style={{ fontSize: 17, letterSpacing: 2.4, textTransform: 'uppercase', opacity: 0.72, fontWeight: 800 }}>
                Total net worth
            </div>
            <div style={{ marginTop: 12, fontSize: compact ? 42 : 46, lineHeight: 1, fontWeight: 950 }}>
                KSh {count.toLocaleString('en-US')}
            </div>
            <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 10, fontSize: 19, fontWeight: 800 }}>
                <TrendingUp size={23} />
                Up 8.3% this month
            </div>
        </div>
    );
};

const ToolRow = ({ item, index }) => {
    const frame = useCurrentFrame();
    const start = index * 8;
    const opacity = fade(frame, start, start + 16);
    const y = interpolate(frame, [start, start + 18], [22, 0], { ...clamp, easing: ease });
    const fill = interpolate(frame, [start + 8, start + 30], [0, item.pct], { ...clamp, easing: ease });
    const Icon = item.icon;

    return (
        <div
            style={{
                opacity,
                transform: `translateY(${y}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: 20,
                marginBottom: 16,
                borderRadius: 27,
                background: colors.white,
                boxShadow: '0 12px 30px rgba(13,27,42,0.07)',
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 21,
                    display: 'grid',
                    placeItems: 'center',
                    color: item.color,
                    background: item.bg,
                }}
            >
                <Icon size={32} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: colors.navy, fontSize: 20, fontWeight: 930 }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color, whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
                <div style={{ marginTop: 5, color: colors.slate, fontSize: 16, fontWeight: 650 }}>{item.note}</div>
                <div style={{ marginTop: 12, height: 7, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${fill}%`, borderRadius: 999, background: item.color }} />
                </div>
            </div>
        </div>
    );
};

const ToolsScroller = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scroll = interpolate(frame, [0.8 * fps, 6.9 * fps], [0, -350], { ...clamp, easing: Easing.bezier(0.45, 0, 0.18, 1) });

    return (
        <div style={{ position: 'absolute', left: 24, right: 24, top: 398, bottom: 22, overflow: 'hidden' }}>
            <div style={{ transform: `translateY(${scroll}px)` }}>
                {planningTools.map((item, index) => (
                    <ToolRow key={item.label} item={item} index={index} />
                ))}
                <div
                    style={{
                        marginTop: 6,
                        borderRadius: 30,
                        background: colors.white,
                        padding: '26px 24px',
                        boxShadow: '0 14px 34px rgba(13,27,42,0.08)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: colors.green, fontSize: 19, fontWeight: 900 }}>
                        <ShieldCheck size={24} />
                        One app. One full money picture.
                    </div>
                    <div style={{ marginTop: 12, color: colors.navy, fontSize: 27, lineHeight: 1.14, fontWeight: 950 }}>
                        Better decisions start when your net worth, plans and progress are visible together.
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardScreen = () => (
    <AbsoluteFill style={{ background: colors.soft }}>
        <AppHeader />
        <NetWorthCard />
        <ToolsScroller />
    </AbsoluteFill>
);

const FinalNetWorthScreen = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const opacity = fade(frame, 0, 22);
    const scale = spring({ frame, fps, config: { damping: 16, stiffness: 92, mass: 0.9 } });

    return (
        <AbsoluteFill style={{ opacity, background: colors.soft }}>
            <AppHeader />
            <div style={{ transform: `scale(${0.92 + scale * 0.08})` }}>
                <NetWorthCard compact />
            </div>
            <div
                style={{
                    margin: '34px 24px 0',
                    borderRadius: 32,
                    padding: '34px 30px',
                    background: colors.white,
                    textAlign: 'center',
                    boxShadow: '0 18px 40px rgba(13,27,42,0.08)',
                }}
            >
                <LogoMark size={74} />
                <div style={{ marginTop: 24, color: colors.navy, fontSize: 42, lineHeight: 1.05, fontWeight: 950 }}>
                    Every financial decision in one dashboard.
                </div>
                <div style={{ marginTop: 20, color: colors.slate, fontSize: 22, lineHeight: 1.28, fontWeight: 720 }}>
                    Budget, debt, investments, protection, retirement and net worth working together.
                </div>
                <div
                    style={{
                        margin: '32px auto 0',
                        display: 'inline-flex',
                        borderRadius: 18,
                        padding: '18px 26px',
                        background: colors.yellow,
                        color: colors.navy,
                        fontSize: 22,
                        fontWeight: 950,
                    }}
                >
                    Start for Free
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const ShilingiDashboardGuideVideo = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const phoneEnter = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 16, stiffness: 75 } });

    return (
        <AbsoluteFill style={{ background: colors.cream, fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden' }}>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 48%, ${colors.mint} 0%, rgba(214,239,225,0.44) 48%, ${colors.cream} 76%)`,
                }}
            />
            <div style={{ transform: `scale(${0.92 + phoneEnter * 0.08})`, width: '100%', height: '100%' }}>
                <PhoneShell>
                    <Sequence from={0} durationInFrames={94} premountFor={30}>
                        <LogoIntro />
                    </Sequence>
                    <Sequence from={76} durationInFrames={244} premountFor={30}>
                        <DashboardScreen />
                    </Sequence>
                    <Sequence from={302} durationInFrames={88} premountFor={30}>
                        <FinalNetWorthScreen />
                    </Sequence>
                </PhoneShell>
            </div>
        </AbsoluteFill>
    );
};
