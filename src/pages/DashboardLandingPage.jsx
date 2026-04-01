import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
    ArrowRight,
    Bot,
    BookOpen,
    Briefcase,
    Calculator,
    Check,
    ChevronDown,
    Compass,
    Landmark,
    Minus,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import Footer from '../components/Footer';
import { hasStoredAccessToken } from '../services/authApi';

const dashboardDestination = { pathname: '/dashboard/app' };
const pageShell = 'min-h-screen bg-[linear-gradient(180deg,_#f7fdfb_0%,_#ffffff_24%,_#f0f7f9_100%)] text-slate-900';
const brandYellow = '#F0C94D';
const brandYellowHover = '#E3BC43';

const stats = [
    { value: '4', label: 'Dashboard tiers' },
    { value: '50+', label: 'Financial tools and calculators' },
    { value: '6', label: 'Ecosystem modules' },
    { value: 'KES 0', label: 'To get started' },
];

const plans = [
    {
        key: 'basic',
        tier: 'Basic',
        name: 'Shilingi Basic',
        tagline: 'Get oriented. See the essentials of your money.',
        price: { monthly: 'Free', annual: 'Free' },
        cta: 'Start for free',
        buttonClass: 'text-slate-950 hover:opacity-95',
        labelClass: 'text-slate-400',
        annualText: '',
        includedTitle: "What's included",
        features: [
            { text: 'Financial Health Indicator', included: true, tone: 'green' },
            { text: 'Budget Tracker (1 account)', included: true, tone: 'green' },
            { text: 'Emergency Fund Calculator', included: true, tone: 'green' },
            { text: '3 Learning Hub articles/month', included: true, tone: 'green' },
            { text: 'Investment trackers (Plus+)', included: false },
            { text: 'Debt repayment planner (Plus+)', included: false },
            { text: 'Shilingi Buddy AI (Elite)', included: false },
        ],
    },
    {
        key: 'plus',
        tier: 'Plus',
        name: 'Shilingi Plus',
        tagline: 'Organize deeply. Build your money habits.',
        price: { monthly: '299', annual: '239' },
        currency: 'KES',
        period: '/mo',
        cta: 'Start 7-day free trial',
        buttonClass: 'text-slate-950 hover:opacity-95',
        labelClass: 'text-sky-300',
        annualText: { monthly: 'or KES 239/mo billed annually', annual: 'Save KES 720/yr billed annually' },
        includedTitle: 'Everything in Basic, plus',
        features: [
            { text: 'Unlimited Budget Accounts', included: true, tone: 'blue' },
            { text: 'Debt Repayment Planner', included: true, tone: 'blue' },
            { text: 'Savings Goals Tracker', included: true, tone: 'blue' },
            { text: 'Full Learning Hub access', included: true, tone: 'blue' },
            { text: 'Comparison Portal access', included: true, tone: 'blue' },
            { text: 'Retirement readiness meter (Pro+)', included: false },
            { text: 'Shilingi Buddy AI (Elite)', included: false },
        ],
    },
    {
        key: 'pro',
        tier: 'Pro',
        name: 'Shilingi Pro',
        tagline: 'See the bigger picture. Build wealth with intent.',
        price: { monthly: '399', annual: '319' },
        currency: 'KES',
        period: '/mo',
        cta: 'Choose Pro',
        buttonClass: 'text-slate-950 hover:opacity-95',
        labelClass: 'text-[#C4973A]',
        annualText: { monthly: 'or KES 319/mo billed annually', annual: 'Save KES 960/yr billed annually' },
        includedTitle: 'Everything in Plus, plus',
        featured: true,
        badge: 'Most Popular',
        features: [
            { text: 'Investment Tracker - full view', included: true, tone: 'gold' },
            { text: 'Retirement Readiness Meter', included: true, tone: 'gold' },
            { text: 'Tax Estimation Tools', included: true, tone: 'gold' },
            { text: 'Insurance Checker', included: true, tone: 'gold' },
            { text: 'Tools Suite - premium access', included: true, tone: 'gold' },
            { text: 'Comparison Portal - full access', included: true, tone: 'gold' },
            { text: 'Shilingi Buddy AI (Elite only)', included: false },
        ],
    },
    {
        key: 'elite',
        tier: 'Elite',
        name: 'Shilingi Elite',
        tagline: 'Advanced intelligence. Your personal advisor ecosystem.',
        price: { monthly: '499', annual: '399' },
        currency: 'KES',
        period: '/mo',
        cta: 'Get Elite access',
        buttonClass: 'text-slate-950 hover:opacity-95',
        labelClass: 'text-[#E8B84B]',
        annualText: { monthly: 'or KES 399/mo billed annually', annual: 'Save KES 1200/yr billed annually' },
        includedTitle: 'Everything in Pro, plus',
        features: [
            { text: 'Shilingi Buddy AI companion', included: true, tone: 'amber' },
            { text: 'Personalized Advisor Matching', included: true, tone: 'amber' },
            { text: 'Advanced Tax and Estate Planning', included: true, tone: 'amber' },
            { text: 'Diaspora Financial Tools', included: true, tone: 'amber' },
            { text: 'Legacy and Wealth Transfer Planning', included: true, tone: 'amber' },
            { text: 'Priority Support - 24hr response', included: true, tone: 'amber' },
        ],
    },
];

const comparisonColumns = [
    { name: 'Basic', price: 'Free' },
    { name: 'Plus', price: 'KES 299' },
    { name: 'Pro', price: 'KES 399', highlight: true },
    { name: 'Elite', price: 'KES 499' },
];

const comparisonGroups = [
    {
        category: 'Budgeting and Cash Flow',
        rows: [
            { feature: 'Budget tracking', values: ['1 account', true, true, true] },
            { feature: 'Spending categories', values: ['5 categories', true, true, true] },
            { feature: 'Net worth snapshot', values: [true, true, true, true] },
        ],
    },
    {
        category: 'Savings and Emergency Fund',
        rows: [
            { feature: 'Emergency fund calculator', values: [true, true, true, true] },
            { feature: 'Savings goals', values: ['-', '3 goals', 'Unlimited', true] },
        ],
    },
    {
        category: 'Debt Management',
        rows: [
            { feature: 'Debt repayment planner', values: ['-', true, true, true] },
        ],
    },
    {
        category: 'Investments and Wealth',
        rows: [
            { feature: 'Investment tracker', values: ['-', 'Basic', 'Full', true] },
            { feature: 'Retirement readiness meter', values: ['-', '-', true, true] },
            { feature: 'Legacy and wealth transfer', values: ['-', '-', '-', true] },
        ],
    },
    {
        category: 'Tax and Protection',
        rows: [
            { feature: 'Tax estimation tools', values: ['-', '-', true, 'Advanced'] },
            { feature: 'Insurance checker', values: ['-', '-', true, true] },
        ],
    },
    {
        category: 'AI and Advisor Access',
        rows: [
            { feature: 'Shilingi Buddy AI', values: ['-', '-', '-', true] },
            { feature: 'Advisor matching', values: ['-', '-', '-', true] },
        ],
    },
    {
        category: 'Ecosystem Access',
        rows: [
            { feature: 'Learning Hub', values: ['3 articles/mo', 'Full', true, true] },
            { feature: 'Comparison Portal', values: ['Limited', 'Standard', 'Full', true] },
            { feature: 'Community access', values: [true, true, true, true] },
            { feature: 'Diaspora tools', values: ['-', '-', '-', true] },
        ],
    },
];

const ecosystemCards = [
    {
        icon: BookOpen,
        title: 'Learning Hub',
        text: 'Curated articles, podcasts and books matched to your financial stage.',
        tier: 'All tiers',
        bg: 'bg-emerald-500/15 text-emerald-300',
    },
    {
        icon: Compass,
        title: 'Comparison Portal',
        text: 'Side-by-side product comparisons linked to your cash flow and risk profile.',
        tier: 'Plus and above',
        bg: 'bg-sky-500/15 text-sky-300',
    },
    {
        icon: Calculator,
        title: 'Tools Suite',
        text: '50+ calculators covering tax, retirement, mortgage, emergency fund and more.',
        tier: 'Pro and above',
        bg: 'bg-amber-500/15 text-[#E8B84B]',
    },
    {
        icon: Bot,
        title: 'Shilingi Buddy AI',
        text: 'Your always-on financial companion for context, nudges, and decision support.',
        tier: 'Elite only',
        bg: 'bg-[#C4973A]/15 text-[#E8B84B]',
    },
    {
        icon: Users,
        title: 'Community',
        text: 'Peer groups, challenges, and accountability around your money goals.',
        tier: 'All tiers',
        bg: 'bg-emerald-500/15 text-emerald-300',
    },
    {
        icon: Briefcase,
        title: 'Advisor Matching',
        text: 'Vetted Kenyan financial advisors matched to your goals and life stage.',
        tier: 'Elite only',
        bg: 'bg-[#C4973A]/15 text-[#E8B84B]',
    },
];

const faqs = [
    {
        question: 'Which tier should I start with?',
        answer: 'Start with Basic to explore the dashboard and see your financial health indicator. If you are actively paying off debt or growing savings, Plus is the natural next step. Choose Pro for investing and planning depth, and Elite for AI guidance or advisor access.',
    },
    {
        question: 'Can I switch tiers later?',
        answer: 'Yes. You can upgrade or downgrade later. Your historical data stays with you, and higher-tier tools simply become read-only if you move down.',
    },
    {
        question: 'Does the dashboard connect to Kenyan bank accounts?',
        answer: 'Manual entry works today. The page can still present the upcoming bank-integration roadmap for institutions like M-Pesa, KCB, Equity, and NCBA.',
    },
    {
        question: 'What makes Shilingi different?',
        answer: 'Shilingi Moves is shaped around Kenyan financial realities, including M-Pesa, SACCOs, chama savings, NHIF and NSSF context, and local tax expectations.',
    },
    {
        question: 'Is my financial data secure?',
        answer: 'Yes. Data is protected in transit and at rest, and access still goes through the existing sign-in flow before users reach the private dashboard.',
    },
];

const toneClasses = {
    green: 'bg-emerald-500/15 text-emerald-300',
    blue: 'bg-primary-100 text-primary-700',
    gold: 'bg-primary-100 text-primary-700',
    amber: 'bg-primary-100 text-primary-700',
};

const DashboardLandingPage = () => {
    const [billingMode, setBillingMode] = useState('monthly');
    const [openFaq, setOpenFaq] = useState(0);

    if (hasStoredAccessToken()) {
        return <Navigate to="/dashboard/app" replace />;
    }

    return (
        <div className={pageShell}>
            <section className="relative overflow-hidden border-b border-primary-100 bg-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_30%),radial-gradient(circle_at_70%_20%,_rgba(240,201,77,0.16),_transparent_24%)]" />
                <div className="container-custom relative flex justify-center py-20 sm:py-24 lg:py-28">
                    <div className="max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
                            <ShieldCheck size={16} />
                            Your personal financial command centre
                        </div>

                        <h1 className="mt-6 text-4xl font-[300] leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
                            One Dashboard.
                            <br />
                            Every <span className="font-[300] text-primary-500">Financial Decision</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-xl">
                            Track, plan and grow your finances with a dashboard built for Kenyan realities. Choose the tier that fits your journey and upgrade when you are ready.
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/signin"
                                    state={{ from: dashboardDestination }}
                                    className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl px-7 py-4 text-base font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5"
                                    style={{ backgroundColor: brandYellow }}
                                >
                                    Start for Free
                                </Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-300 px-7 py-4 text-base font-medium text-slate-900 transition-colors hover:bg-slate-50"
                                >
                                    View Demo
                                </Link>
                            </div>

                        <p className="mt-4 text-sm text-slate-500">
                            No credit card required. Cancel anytime. KES pricing.
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-b border-primary-100 bg-[#f0f7f9]">
                <div className="container-custom grid gap-6 py-7 text-center sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label}>
                            <p className="text-3xl font-extrabold text-primary-500">{stat.value}</p>
                            <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container-custom py-16 sm:py-20">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Dashboard tiers</p>
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                        Choose your financial clarity level
                    </h2>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                        Start free and upgrade as your financial life grows. Every tier connects to the wider Shilingi ecosystem:
                        learning, comparisons, tools, and community.
                    </p>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setBillingMode('monthly')}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            billingMode === 'monthly'
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        onClick={() => setBillingMode('annual')}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            billingMode === 'annual'
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        Annual
                    </button>
                    {billingMode === 'annual' && (
                        <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                            Save 20%
                        </span>
                    )}
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-4">
                    {plans.map((plan) => {
                        const isFree = plan.price[billingMode] === 'Free';
                        return (
                            <article
                                key={plan.key}
                                className={`relative flex flex-col rounded-[1.75rem] border p-6 shadow-sm ${
                                    plan.featured
                                        ? 'border-primary-200 bg-primary-50/70'
                                        : 'border-slate-200 bg-white'
                                }`}
                            >
                                {plan.badge && (
                                    <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-950" style={{ backgroundColor: brandYellow }}>
                                        {plan.badge}
                                    </div>
                                )}
                                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${plan.labelClass}`}>
                                    {plan.tier}
                                </p>
                                <h3 className="mt-3 text-2xl font-bold text-slate-950">{plan.name}</h3>
                                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">{plan.tagline}</p>

                                <div className="mt-6 flex items-end gap-2">
                                    {!isFree && <span className="mb-1 text-sm text-slate-500">{plan.currency}</span>}
                                    <span className="text-4xl font-extrabold text-slate-950">{plan.price[billingMode]}</span>
                                    {!isFree && <span className="mb-1 text-sm text-slate-500">{plan.period}</span>}
                                </div>

                                <p className="mt-2 min-h-[24px] text-xs text-slate-500">
                                    {typeof plan.annualText === 'string' ? plan.annualText : plan.annualText?.[billingMode]}
                                </p>

                                <Link
                                    to="/signin"
                                    state={{ from: dashboardDestination }}
                                    className={`mt-6 inline-flex min-h-[46px] items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-colors ${plan.buttonClass}`}
                                    style={{ backgroundColor: brandYellow }}
                                >
                                    {plan.cta}
                                </Link>

                                <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{plan.includedTitle}</p>
                                <div className="mt-4 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <div key={`${plan.key}-${feature.text}`} className={`${index === 4 ? 'border-t border-slate-200 pt-4' : ''} flex items-start gap-3`}>
                                            <FeatureBullet included={feature.included} tone={feature.tone} />
                                            <p className={`text-sm leading-6 ${feature.included ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {feature.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>

                <p className="mt-5 text-center text-sm text-slate-500">
                    All paid plans can be positioned with a 7-day free trial, and users still enter through the existing secure sign-in flow.
                </p>
            </section>

            <section className="container-custom pb-16">
                <div className="mb-8 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Full Feature Breakdown</p>
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                        What does each tier actually include?
                    </h2>
                </div>

                <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="px-4 py-4 text-left font-medium text-slate-500">Feature</th>
                                {comparisonColumns.map((column) => (
                                    <th
                                        key={column.name}
                                        className={`px-4 py-4 text-center ${column.highlight ? 'bg-primary-50' : ''}`}
                                    >
                                        <span className={`block text-base font-bold ${column.highlight ? 'text-primary-700' : 'text-slate-900'}`}>
                                            {column.name}
                                        </span>
                                        <span className="mt-1 block text-xs font-normal text-slate-500">{column.price}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonGroups.map((group) => (
                                <React.Fragment key={group.category}>
                                    <tr className="bg-slate-50">
                                        <th colSpan={5} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: brandYellowHover }}>
                                            {group.category}
                                        </th>
                                    </tr>
                                    {group.rows.map((row) => (
                                        <tr key={row.feature} className="border-b border-slate-100 last:border-b-0">
                                            <td className="px-4 py-4 text-slate-900">{row.feature}</td>
                                            {row.values.map((value, index) => (
                                                <td
                                                    key={`${row.feature}-${comparisonColumns[index].name}`}
                                                    className={`px-4 py-4 text-center text-slate-600 ${comparisonColumns[index].highlight ? 'bg-primary-50' : ''}`}
                                                >
                                                    <ComparisonValue value={value} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="border-y border-emerald-100 bg-[#f0f7f9] py-16 sm:py-20">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">The Shilingi Ecosystem</p>
                        <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                            Your dashboard is the hub. Everything connects.
                        </h2>
                        <p className="mt-4 text-base leading-8 text-slate-600">
                            The landing page now communicates the broader product clearly, not just the dashboard itself.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {ecosystemCards.map(({ icon: Icon, title, text, tier, bg }) => (
                            <article key={title} className="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-primary-200">
                                <div className={`inline-flex rounded-xl p-3 ${bg}`}>
                                    <Icon size={20} />
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                                <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${bg}`}>
                                    {tier}
                                </span>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container-custom py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Common Questions</p>
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                        Frequently asked
                    </h2>
                </div>

                <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 rounded-[1.5rem] border border-slate-200 bg-white px-6 shadow-sm">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <button
                                key={faq.question}
                                type="button"
                                onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                className="w-full py-5 text-left"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-base font-medium text-slate-900">{faq.question}</span>
                                    <ChevronDown
                                        size={18}
                                        className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                {isOpen && <p className="pt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="container-custom pb-16">
                <div className="rounded-[2rem] border border-primary-100 bg-[linear-gradient(135deg,_#ecfdf5_0%,_#ffffff_100%)] px-6 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Get Started</p>
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
                        Your money deserves a command centre.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
                        Stop guessing. Start seeing. Build your personalized Shilingi Dashboard and guide users from this page straight into the live product.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/signin"
                            state={{ from: dashboardDestination }}
                            className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-primary-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-primary-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-500"
                        >
                            Create My Dashboard
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/signin"
                            className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-slate-300 px-7 py-4 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white/70"
                        >
                            Log In
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2"><Sparkles size={16} /> Same Shilingi Moves brand direction</span>
                        <span className="inline-flex items-center gap-2"><Landmark size={16} /> Built around Kenyan money realities</span>
                        <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Existing protected dashboard remains intact</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const FeatureBullet = ({ included, tone = 'green' }) => {
    if (!included) {
        return (
            <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Minus size={14} />
            </span>
        );
    }

    return (
        <span className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}>
            <Check size={14} />
        </span>
    );
};

const ComparisonValue = ({ value }) => {
    if (value === true) {
        return (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Check size={14} />
            </span>
        );
    }

    if (value === '-') {
        return <span className="text-slate-400">-</span>;
    }

    return <span className="text-sm text-slate-600">{value}</span>;
};

export default DashboardLandingPage;
