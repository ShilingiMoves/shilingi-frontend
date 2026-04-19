import React, { useMemo, useState } from 'react';
import {
    ArrowRight,
    Bell,
    BookOpen,
    Bot,
    Briefcase,
    CalendarDays,
    ChevronRight,
    CircleDollarSign,
    Compass,
    Fuel,
    Globe,
    GraduationCap,
    Landmark,
    LineChart,
    PiggyBank,
    ShieldCheck,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Wallet,
    X,
} from 'lucide-react';

const heroSignals = [
    {
        label: 'Inflation Rate',
        value: '5.1%',
        change: 'From 5.8% last month',
        direction: 'down',
        plain: 'Prices are rising slower, so your grocery budget could breathe a bit this month.',
        jargon: 'YoY CPI softened, helped by food inflation cooling after better rains.',
    },
    {
        label: 'CBK Policy Rate',
        value: '10.0%',
        change: 'Unchanged this quarter',
        direction: 'flat',
        plain: 'Loan pricing is holding steady, so this is a good moment to review debt without fresh surprises.',
        jargon: 'The Monetary Policy Committee held rates, keeping borrowing conditions broadly steady.',
    },
    {
        label: '91-Day T-Bill',
        value: '16.2%',
        change: '+0.4% vs last week',
        direction: 'up',
        plain: 'Government paper is paying strongly right now, especially for surplus cash sitting idle.',
        jargon: 'Accepted short-term government yields remain elevated versus bank deposit alternatives.',
    },
    {
        label: 'NSE 20 Index',
        value: '1,814.2',
        change: '-1.3% this week',
        direction: 'down',
        plain: 'Equities slipped this week, which may create better entry points for patient investors.',
        jargon: 'The index retraced on softer sentiment, with pressure across some financial counters.',
    },
    {
        label: 'USD / KES',
        value: '130.1',
        change: 'KES slightly stronger',
        direction: 'up',
        plain: 'The shilling has steadied a little, which matters for remittances, imports, and fuel costs.',
        jargon: 'USDKES eased slightly as FX pressure moderated.',
    },
];

const tickerItems = [
    { name: 'SCOM', price: '103.00', change: '+1.5%', direction: 'up' },
    { name: 'KCB', price: '34.75', change: '+2.2%', direction: 'up' },
    { name: 'EQTY', price: '48.00', change: '-0.8%', direction: 'down' },
    { name: 'COOP', price: '14.20', change: '+0.7%', direction: 'up' },
    { name: 'BAT', price: '410.00', change: '0.0%', direction: 'flat' },
    { name: 'NSE 20', price: '1,814.2', change: '-1.3%', direction: 'down' },
    { name: 'USD/KES', price: '130.10', change: 'KES stronger', direction: 'up' },
    { name: '91-DAY T-BILL', price: '16.2%', change: '+0.4%', direction: 'up' },
];

const weeklySignals = [
    {
        id: 'tbills',
        tone: 'green',
        eyebrow: 'Opportunity',
        value: '16.2%',
        valueChange: 'T-Bill rate rising',
        title: 'Government T-Bills are paying the strongest short-term rates on the dashboard',
        tags: ['Savings', 'Fixed income'],
        plain: 'If cash is parked in a low-interest account, this is one of the clearest places to improve returns without taking on equity-style risk.',
        jargon: 'Short tenor government yields remain elevated relative to bank deposits and many MMFs.',
        explain: 'Think of it as lending money to the government for a short period and getting paid more than most savings accounts.',
        cta: 'Compare Fixed Income',
        action: 'comparehub',
        source: 'CBK',
    },
    {
        id: 'cbk',
        tone: 'blue',
        eyebrow: 'Watch',
        value: '10.0%',
        valueChange: 'CBK rate unchanged',
        title: 'CBK kept policy steady, so loan planning can stay calm for now',
        tags: ['Debt', 'Business'],
        plain: 'Existing borrowers avoid a fresh rate shock, but new credit is still expensive enough that comparisons matter.',
        jargon: 'Policy remains restrictive, with commercial lending rates still elevated for households and SMEs.',
        explain: 'When the benchmark rate stays flat, banks usually do not rush to reprice loans upward.',
        cta: 'Review Debt Strategy',
        action: 'debt',
        source: 'CBK MPC',
    },
    {
        id: 'inflation',
        tone: 'green',
        eyebrow: 'Good news',
        value: '5.1%',
        valueChange: 'Inflation cooling',
        title: 'Inflation eased, which creates some breathing room for household budgets',
        tags: ['Budget', 'Savings'],
        plain: 'Your money is still under pressure, but not as fast as before, so disciplined savers regain a bit of ground.',
        jargon: 'Headline inflation moderated, led by softer food basket pressure.',
        explain: 'Lower inflation means prices are still rising, just not racing upward as quickly.',
        cta: 'Adjust Budget Plan',
        action: 'budget',
        source: 'KNBS',
    },
    {
        id: 'nse',
        tone: 'amber',
        eyebrow: 'Watch',
        value: '1,814',
        valueChange: 'NSE dipped',
        title: 'The NSE pulled back this week, which may matter more for buyers than sellers',
        tags: ['Investments', 'Portfolio'],
        plain: 'Short-term dips can feel noisy, but they often help long-term investors accumulate at better prices.',
        jargon: 'The index weakened on softer flows, though selected large caps showed resilience.',
        explain: 'A market dip does not always mean danger. Sometimes it simply means better prices for long-term investing.',
        cta: 'Review Equity Exposure',
        action: 'investments',
        source: 'NSE',
    },
    {
        id: 'fx',
        tone: 'green',
        eyebrow: 'Diaspora',
        value: '130.1',
        valueChange: 'KES strengthening',
        title: 'FX has stabilized enough to matter for remittances and imported costs',
        tags: ['Remittances', 'FX'],
        plain: 'Families receiving money from abroad and businesses exposed to dollar costs should keep watching this closely.',
        jargon: 'FX conditions have improved modestly, easing some near-term exchange pressure.',
        explain: 'Exchange rates shape how much Kenya shillings you finally receive or spend when foreign currency is involved.',
        cta: 'Open Resources',
        action: 'resourceshub',
        source: 'CBK FX',
    },
    {
        id: 'fuel',
        tone: 'red',
        eyebrow: 'Budget impact',
        value: 'KES 191',
        valueChange: 'Fuel cost up',
        title: 'Fuel is still a household pressure point, so transport budgets need attention',
        tags: ['Budget', 'Transport'],
        plain: 'Even when inflation cools overall, fuel can still squeeze commuting, deliveries, and family spending.',
        jargon: 'The latest price review keeps pump costs high enough to pressure transport-linked expenses.',
        explain: 'When fuel goes up, both moving yourself and moving goods around the country gets more expensive.',
        cta: 'Adjust Transport Budget',
        action: 'budget',
        source: 'EPRA',
    },
];

const ratesRows = [
    { name: '91-Day T-Bill', helper: 'CBK - Min KES 100K', value: '16.2%', change: '+0.4%', bars: [56, 61, 72, 84], impact: 'Opportunity', tone: 'green' },
    { name: '182-Day T-Bill', helper: 'CBK - Min KES 100K', value: '16.8%', change: '+0.2%', bars: [60, 66, 74, 86], impact: 'Opportunity', tone: 'green' },
    { name: '364-Day T-Bill', helper: 'CBK - Min KES 100K', value: '17.1%', change: '+0.3%', bars: [62, 67, 77, 88], impact: 'Opportunity', tone: 'green' },
    { name: 'CIC Money Market Fund', helper: 'Daily liquidity - Min KES 1,000', value: '14.8%', change: 'Stable', bars: [76, 74, 75, 74], impact: 'Stable', tone: 'brand' },
    { name: 'Average Bank Savings', helper: 'KCB, Equity, Co-op average', value: '7.5%', change: 'Low', bars: [36, 35, 38, 37], impact: 'Review', tone: 'amber' },
];

const lendingRows = [
    { name: 'Mortgage Rate', value: '13.5%', status: 'Steady', impact: 'Stable - no urgent move' },
    { name: 'Car Loan', value: '14.2%', status: 'Steady', impact: 'Monitor' },
    { name: 'Personal Loan', value: '18.5%', status: 'High', impact: 'Avoid where possible' },
    { name: 'Mobile Loans', value: '~90% p.a.', status: 'Very high', impact: 'Emergency use only' },
    { name: 'SACCO Loans', value: '12.0%', status: 'Best value', impact: 'Worth comparing' },
];

const personalNudges = [
    {
        tone: 'positive',
        title: 'Your surplus cash has a better home',
        body: 'Moving idle savings from a basic account into stronger short-term rates could materially improve returns this quarter.',
        primary: 'Compare options',
        primaryAction: 'comparehub',
        secondary: 'Open planner',
        secondaryAction: 'investments',
    },
    {
        tone: 'caution',
        title: 'Fuel is the pressure point to watch',
        body: 'Transport looks like the biggest likely budget leak right now, so a quick budget refresh can prevent drift.',
        primary: 'Review budget',
        primaryAction: 'budget',
    },
    {
        tone: 'action',
        title: 'NSE weakness may suit gradual investors',
        body: 'If your horizon is long, market softness can be a disciplined accumulation window rather than a reason to freeze.',
        primary: 'Open investments',
        primaryAction: 'investments',
    },
];

const radarOpportunities = [
    { title: 'High T-Bill Yields', body: 'Short-term government rates remain the cleanest near-term opportunity for conservative savers.', cta: 'Invest via Compare Hub', action: 'comparehub' },
    { title: 'NSE Dip as Entry Point', body: 'Selective buying during softer weeks can work well for patient, long-horizon investors.', cta: 'Review investment plan', action: 'investments' },
    { title: 'Inflation Relief', body: 'If food and essentials stabilize, redirect the difference into emergency savings rather than letting it disappear.', cta: 'Open budget planner', action: 'budget' },
];

const radarRisks = [
    { title: 'Fuel Price Pressure', body: 'Transport and logistics-linked expenses can still rise even when headline inflation improves.', cta: 'Adjust transport budget', action: 'budget' },
    { title: 'Expensive Personal Loans', body: 'Unsecured borrowing remains costly enough that alternatives should be explored first.', cta: 'Open debt manager', action: 'debt' },
    { title: 'Low Savings Rates', body: 'Keeping too much cash in weak-yield accounts means silently giving up return every month.', cta: 'Find better rates', action: 'comparehub' },
];

const actionCards = [
    { title: 'Move surplus cash into stronger fixed income', body: 'The gap between high-yield government paper and regular savings is wide enough to act on.', action: 'comparehub', icon: Landmark },
    { title: 'Refresh your monthly budget for transport', body: 'Fuel and linked costs deserve a quick update before they distort the rest of the month.', action: 'budget', icon: Wallet },
    { title: 'Review gradual stock accumulation', body: 'Build your investing plan around consistency instead of reacting to one week of volatility.', action: 'investments', icon: LineChart },
    { title: 'Stress-test your borrowing options', body: 'If you need credit, compare bank, SACCO, and digital lending with total cost in mind.', action: 'debt', icon: Briefcase },
];

const ecosystemLinks = [
    { title: 'Budget Planner', subtitle: 'Adjust spending quickly', action: 'budget', icon: Wallet },
    { title: 'Investment Planner', subtitle: 'Rebalance and build', action: 'investments', icon: PiggyBank },
    { title: 'Debt Manager', subtitle: 'Respond to borrowing costs', action: 'debt', icon: Landmark },
    { title: 'Compare Hub', subtitle: 'See better rates side by side', action: 'comparehub', icon: Compass },
    { title: 'Learning Hub', subtitle: 'Understand the why', action: 'learninghub', icon: GraduationCap },
    { title: 'Buddy AI', subtitle: 'Talk through the market story', action: 'overview', icon: Bot },
];

const alertOptions = [
    'T-Bill rates fall below 15%',
    'CBK changes the policy rate',
    'NSE 20 drops more than 3%',
    'Inflation rises above 7%',
    'Fuel prices change',
];

const toneClasses = {
    green: { shell: 'border-[#9ed8bf] bg-[#eef8f3]', value: 'text-[#239c69]', cta: 'bg-[#dcf2e8] text-[#239c69] hover:bg-[#239c69] hover:text-white', stripe: 'bg-[#2aa975]' },
    blue: { shell: 'border-sky-200 bg-sky-50/80', value: 'text-sky-700', cta: 'bg-sky-100 text-sky-800 hover:bg-sky-700 hover:text-white', stripe: 'bg-sky-500' },
    amber: { shell: 'border-amber-200 bg-amber-50/80', value: 'text-amber-800', cta: 'bg-amber-100 text-amber-800 hover:bg-amber-500 hover:text-white', stripe: 'bg-amber-500' },
    red: { shell: 'border-rose-200 bg-rose-50/80', value: 'text-rose-700', cta: 'bg-rose-100 text-rose-800 hover:bg-rose-600 hover:text-white', stripe: 'bg-rose-500' },
    brand: { value: 'text-primary-700' },
};

const MarketWatchPanel = ({ onSelectSection }) => {
    const [plainEnglish, setPlainEnglish] = useState(true);
    const [timeFilter, setTimeFilter] = useState('week');
    const [openExplain, setOpenExplain] = useState({});
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [alertSelections, setAlertSelections] = useState(() => ({
        'T-Bill rates fall below 15%': true,
        'CBK changes the policy rate': true,
        'NSE 20 drops more than 3%': false,
        'Inflation rises above 7%': true,
        'Fuel prices change': true,
    }));

    const tickerLoop = useMemo(() => [...tickerItems, ...tickerItems], []);

    const toggleExplain = (id) => {
        setOpenExplain((current) => ({
            ...current,
            [id]: !current[id],
        }));
    };

    const jumpTo = (section) => {
        if (section) {
            onSelectSection?.(section);
        }
    };

    const marketMood = timeFilter === 'today'
        ? { label: 'Calm today', shell: 'border border-[#9ed8bf] bg-[#e4f5ec] text-[#239c69]' }
        : timeFilter === 'month'
            ? { label: 'Opportunity-rich month', shell: 'bg-amber-100/80 text-amber-900 border border-amber-200' }
            : { label: 'Cautiously stable', shell: 'bg-white/10 text-white border border-white/20' };

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#0f4d35_0%,_#197a53_40%,_#239c69_78%,_#2fb07b_100%)] px-5 py-6 text-white shadow-[0_18px_48px_rgba(25,122,83,0.22)] sm:px-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">Insights - Market Watch</p>
                        <h1 className="mt-3 dashboard-display-title text-[2rem] font-extrabold leading-tight sm:text-[2.4rem]">Your Financial Weather</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-[0.98rem]">
                            Kenya's market signals rebuilt for the dashboard, translated into practical next moves instead of abstract numbers.
                        </p>
                    </div>

                    <div className="flex w-full max-w-md flex-col gap-3 xl:items-end">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${marketMood.shell}`}>
                                <Sparkles size={13} className="mr-2" />
                                {marketMood.label}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPlainEnglish((current) => !current)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                            >
                                <BookOpen size={14} />
                                {plainEnglish ? 'Plain English' : 'Financial Terms'}
                            </button>
                        </div>

                        <div className="dashboard-toolbar-row">
                            {[
                                { key: 'today', label: 'Today' },
                                { key: 'week', label: 'This Week' },
                                { key: 'month', label: 'This Month' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setTimeFilter(item.key)}
                                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                        timeFilter === item.key
                                            ? 'bg-white text-[#14553d]'
                                            : 'border border-white/20 bg-white/10 text-white/80 hover:bg-white/15'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setAlertsOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                            >
                                <Bell size={14} />
                                Set Alerts
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {heroSignals.map((signal) => {
                        const changeTone = signal.direction === 'up'
                            ? 'text-[#b8f1d1]'
                            : signal.direction === 'down'
                                ? 'text-rose-200'
                                : 'text-white/65';
                        const ValueIcon = signal.direction === 'up' ? TrendingUp : signal.direction === 'down' ? TrendingDown : CalendarDays;

                        return (
                            <article key={signal.label} className="rounded-[1.1rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{signal.label}</p>
                                <div className="mt-3 flex items-start justify-between gap-3">
                                    <p className="dashboard-metric-value text-[1.6rem] font-extrabold text-white">{signal.value}</p>
                                    <ValueIcon size={17} className={changeTone} />
                                </div>
                                <p className={`mt-1 text-xs font-semibold ${changeTone}`}>{signal.change}</p>
                                <p className="mt-3 text-sm leading-6 text-white/78">
                                    {plainEnglish ? signal.plain : signal.jargon}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="overflow-hidden rounded-[1.4rem] border border-[#f0c56b] bg-[linear-gradient(135deg,_#f7c655_0%,_#e8a020_100%)] px-4 py-3 shadow-sm">
                <div className="marketwatch-ticker flex min-w-max items-center gap-7 text-sm text-[#3f2a04]">
                    {tickerLoop.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                            <span className="font-bold text-[#201400]">{item.name}</span>
                            <span className="text-[#5d4310]">{item.price}</span>
                            <span className={item.direction === 'up' ? 'text-[#176a4e]' : item.direction === 'down' ? 'text-[#9f1d2c]' : 'text-[#6e541f]'}>
                                {item.change}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="dashboard-display-title text-[1.65rem] font-extrabold text-slate-950">What Changed This Week</h2>
                        <p className="text-sm text-slate-500">A clearer market story for savers, borrowers, and investors.</p>
                    </div>
                    <button type="button" onClick={() => jumpTo('comparehub')} className="text-sm font-semibold text-primary-700">
                        View all signals
                    </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    {weeklySignals.map((signal) => {
                        const tone = toneClasses[signal.tone];
                        const isOpen = Boolean(openExplain[signal.id]);
                        return (
                            <article key={signal.id} className={`relative overflow-hidden rounded-[1.4rem] border p-4 shadow-sm ${tone.shell}`}>
                                <span className={`absolute inset-y-0 left-0 w-1.5 ${tone.stripe}`} />
                                <div className="pl-3">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className={`dashboard-metric-value text-[1.55rem] font-extrabold ${tone.value}`}>{signal.value}</p>
                                            <p className={`text-[13px] font-semibold ${tone.value}`}>{signal.valueChange}</p>
                                        </div>
                                        <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                            {signal.eyebrow}
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-[1.05rem] font-bold leading-7 text-slate-950">{signal.title}</h3>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {signal.tags.map((tag) => (
                                            <span key={tag} className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-slate-600">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="mt-4 text-sm leading-7 text-slate-600">
                                        {plainEnglish ? signal.plain : signal.jargon}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => toggleExplain(signal.id)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-500 hover:text-white"
                                    >
                                        <Sparkles size={13} />
                                        {isOpen ? 'Hide explanation' : "Explain like I'm 15"}
                                    </button>

                                    {isOpen && (
                                        <div className="mt-3 rounded-[0.95rem] border border-amber-200 bg-white/75 px-4 py-3 text-sm leading-7 text-slate-600">
                                            {signal.explain}
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => jumpTo(signal.action)}
                                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tone.cta}`}
                                        >
                                            {signal.cta}
                                            <ArrowRight size={14} />
                                        </button>
                                        <span className="text-xs font-medium text-slate-500">Source: {signal.source}</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                <div className="space-y-4">
                    <article className="rounded-[1.5rem] border border-[#cfe9dd] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                                <CircleDollarSign size={20} />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Kenya Rates Dashboard</h2>
                                <p className="text-sm text-slate-500">Key savings, fixed income, and lending signals in one place.</p>
                            </div>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                        <th className="px-2 py-3 font-semibold">Instrument</th>
                                        <th className="px-2 py-3 font-semibold">Rate</th>
                                        <th className="px-2 py-3 font-semibold">Change</th>
                                        <th className="px-2 py-3 font-semibold">Trend</th>
                                        <th className="px-2 py-3 font-semibold">Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ratesRows.map((row) => (
                                        <tr key={row.name} className="border-b border-slate-100 last:border-b-0 hover:bg-[#f8fcfa]">
                                            <td className="px-2 py-4 align-top">
                                                <p className="font-semibold text-slate-900">{row.name}</p>
                                                <p className="mt-1 text-xs text-slate-500">{row.helper}</p>
                                            </td>
                                            <td className={`px-2 py-4 align-top text-lg font-extrabold ${toneClasses[row.tone]?.value || 'text-slate-900'}`}>{row.value}</td>
                                            <td className={`px-2 py-4 align-top text-sm font-semibold ${row.change.includes('+') ? 'text-[#239c69]' : row.change === 'Stable' ? 'text-slate-500' : 'text-amber-700'}`}>{row.change}</td>
                                            <td className="px-2 py-4 align-top">
                                                <div className="flex h-10 items-end gap-1">
                                                    {row.bars.map((bar) => (
                                                        <span
                                                            key={`${row.name}-${bar}`}
                                                            className={`w-2 rounded-t-full ${row.tone === 'green' ? 'bg-[#2aa975]/85' : row.tone === 'amber' ? 'bg-amber-400/85' : 'bg-primary-600/85'}`}
                                                            style={{ height: `${bar}%` }}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 align-top">
                                                <span className="rounded-full bg-[#edf9f4] px-3 py-1 text-xs font-semibold text-primary-700">{row.impact}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
                            If you are still earning roughly 7.5% in a basic savings account while short T-Bills sit above 16%, the opportunity cost is big enough to review immediately.
                        </div>
                    </article>

                    <article className="rounded-[1.5rem] border border-[#cfe9dd] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                <Landmark size={20} />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">Lending Snapshot</h2>
                                <p className="text-sm text-slate-500">Borrowing still needs careful comparison, even in a steadier rate environment.</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {lendingRows.map((row) => (
                                <div key={row.name} className="grid gap-2 rounded-[1rem] border border-slate-200 bg-[#fafcfb] px-4 py-4 sm:grid-cols-[1.5fr_0.7fr_0.8fr_1fr] sm:items-center">
                                    <p className="font-semibold text-slate-900">{row.name}</p>
                                    <p className="dashboard-metric-value text-lg font-extrabold text-slate-950">{row.value}</p>
                                    <p className={`text-sm font-semibold ${row.status.toLowerCase().includes('high') ? 'text-rose-600' : row.status === 'Best value' ? 'text-primary-700' : 'text-slate-500'}`}>{row.status}</p>
                                    <p className="text-sm text-slate-600">{row.impact}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <div className="space-y-4">
                    <article className="rounded-[1.5rem] border border-[#cfe9dd] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                                <Sparkles size={20} />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">How This Affects You</h2>
                                <p className="text-sm text-slate-500">Personal-style nudges connected to the rest of the dashboard.</p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {personalNudges.map((nudge) => (
                                <div
                                    key={nudge.title}
                                    className={`rounded-[1.2rem] border p-4 ${
                                        nudge.tone === 'positive'
                                            ? 'border-[#9ed8bf] bg-[#eef8f3]'
                                            : nudge.tone === 'caution'
                                                ? 'border-amber-200 bg-amber-50/70'
                                                : 'border-sky-200 bg-sky-50/70'
                                    }`}
                                >
                                    <p className="font-bold text-slate-950">{nudge.title}</p>
                                    <p className="mt-2 text-sm leading-7 text-slate-600">{nudge.body}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => jumpTo(nudge.primaryAction)}
                                            className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                                        >
                                            {nudge.primary}
                                        </button>
                                        {nudge.secondary ? (
                                            <button
                                                type="button"
                                                onClick={() => jumpTo(nudge.secondaryAction)}
                                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                {nudge.secondary}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#176246_0%,_#239c69_100%)] p-5 text-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <Bot size={20} />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold">Buddy AI Summary</h2>
                                <p className="text-sm text-white/70">A short narrative for the current dashboard climate.</p>
                            </div>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-white/80">
                            This market setup still looks constructive for disciplined savers. Fixed income is strong, inflation is calmer, and equities look more interesting for long-term accumulation than they did a few weeks ago.
                        </p>
                        <div className="mt-5 space-y-2 text-sm text-white/80">
                            <div className="flex items-start gap-2"><ShieldCheck size={16} className="mt-1 shrink-0 text-[#b8f1d1]" />Keep surplus cash working harder than a basic savings account.</div>
                            <div className="flex items-start gap-2"><Fuel size={16} className="mt-1 shrink-0 text-amber-200" />Watch fuel-linked spending before it leaks into the rest of the budget.</div>
                            <div className="flex items-start gap-2"><LineChart size={16} className="mt-1 shrink-0 text-[#b8f1d1]" />Stay patient with equities and buy through a plan, not a mood swing.</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => jumpTo('overview')}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                            Chat with Buddy AI
                        </button>
                    </article>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <article className="rounded-[1.5rem] border border-[#cfe9dd] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-[#2aa975]" />
                        <h2 className="text-xl font-bold text-[#239c69]">Green Zone Opportunities</h2>
                    </div>
                    <div className="space-y-3">
                        {radarOpportunities.map((item) => (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => jumpTo(item.action)}
                                className="w-full rounded-[1.1rem] border border-[#9ed8bf] bg-[#eef8f3] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                            >
                                <p className="font-bold text-slate-950">{item.title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                                    {item.cta}
                                    <ChevronRight size={14} />
                                </span>
                            </button>
                        ))}
                    </div>
                </article>

                <article className="rounded-[1.5rem] border border-amber-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <h2 className="text-xl font-bold text-amber-900">Watch Zone Risks</h2>
                    </div>
                    <div className="space-y-3">
                        {radarRisks.map((item) => (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => jumpTo(item.action)}
                                className="w-full rounded-[1.1rem] border border-amber-200 bg-amber-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                            >
                                <p className="font-bold text-slate-950">{item.title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
                                    {item.cta}
                                    <ChevronRight size={14} />
                                </span>
                            </button>
                        ))}
                    </div>
                </article>
            </section>

            <section className="rounded-[1.5rem] border border-[#cfe9dd] bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <h2 className="dashboard-display-title text-[1.65rem] font-extrabold text-slate-950">Take Action</h2>
                    <p className="text-sm text-slate-500">Turn the market read into the next best move on the platform.</p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                    {actionCards.map(({ title, body, action, icon: Icon }) => (
                        <button
                            key={title}
                            type="button"
                            onClick={() => jumpTo(action)}
                            className="flex items-start gap-4 rounded-[1.15rem] border border-slate-200 bg-[#fafcfb] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-[#f5fbf8] hover:shadow-sm"
                        >
                            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                                <Icon size={20} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-950">{title}</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
                            </div>
                            <ArrowRight size={18} className="mt-1 shrink-0 text-primary-700" />
                        </button>
                    ))}
                </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#cfe9dd] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                        <Globe size={20} />
                    </span>
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">Transparent Sources</h2>
                        <p className="text-sm text-slate-500">Market Watch should feel practical and accountable.</p>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {['CBK', 'NSE', 'KNBS', 'EPRA', 'IMF', 'KBA'].map((source) => (
                        <span key={source} className="rounded-full border border-slate-200 bg-[#f8fbfa] px-3 py-2 text-xs font-semibold text-slate-600">
                            {source}
                        </span>
                    ))}
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                    This view is designed for education and decision support. It should help members know what to review next, not replace regulated financial advice.
                </p>
            </section>

            <section className="overflow-hidden rounded-[1.7rem] bg-[linear-gradient(135deg,_#176246_0%,_#239c69_100%)] px-5 py-6 text-white shadow-sm">
                <div className="max-w-2xl">
                    <h2 className="dashboard-display-title text-[1.7rem] font-extrabold">Market Watch Connects the Dashboard</h2>
                    <p className="mt-2 text-sm leading-7 text-white/75">
                        Every signal should lead somewhere useful, so this panel now points directly into the other green-brand dashboard tools.
                    </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {ecosystemLinks.map(({ title, subtitle, action, icon: Icon }) => (
                        <button
                            key={title}
                            type="button"
                            onClick={() => jumpTo(action)}
                            className="rounded-[1.15rem] border border-white/15 bg-white/10 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/15"
                        >
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                                <Icon size={20} />
                            </span>
                            <p className="mt-4 font-bold text-white">{title}</p>
                            <p className="mt-2 text-sm leading-6 text-white/70">{subtitle}</p>
                        </button>
                    ))}
                </div>
            </section>

            {alertsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && setAlertsOpen(false)}>
                    <div className="w-full max-w-xl rounded-[1.6rem] border border-[#cfe9dd] bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="inline-flex items-center gap-2 text-[1.45rem] font-extrabold text-slate-950">
                                    <Bell size={18} className="text-primary-700" />
                                    Set Market Alerts
                                </p>
                                <p className="mt-2 text-sm leading-7 text-slate-500">
                                    Choose the signals you want highlighted next time you come back to Market Watch.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAlertsOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-3">
                            {alertOptions.map((option) => (
                                <label key={option} className="flex cursor-pointer items-center justify-between gap-4 rounded-[1rem] border border-slate-200 bg-[#fafcfb] px-4 py-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{option}</p>
                                        <p className="mt-1 text-sm text-slate-500">Show this as a dashboard alert when conditions change.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(alertSelections[option])}
                                        onChange={() =>
                                            setAlertSelections((current) => ({
                                                ...current,
                                                [option]: !current[option],
                                            }))
                                        }
                                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setAlertsOpen(false)}
                                className="inline-flex h-12 flex-1 items-center justify-center rounded-[1rem] bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700"
                            >
                                Save Alerts
                            </button>
                            <button
                                type="button"
                                onClick={() => setAlertsOpen(false)}
                                className="inline-flex h-12 items-center justify-center rounded-[1rem] border border-slate-200 px-5 text-sm font-semibold text-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketWatchPanel;
