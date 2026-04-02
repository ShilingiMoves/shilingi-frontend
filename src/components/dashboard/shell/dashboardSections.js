import {
    Activity,
    ArrowDownUp,
    Briefcase,
    CircleUserRound,
    Landmark,
    LayoutDashboard,
    LineChart,
    TrendingUp,
    Wallet,
} from 'lucide-react';

export const dashboardSections = [
    {
        id: 'overview',
        label: 'Dashboard',
        helper: 'See all your tools at a glance',
        icon: LayoutDashboard,
        accent: 'from-slate-800 via-slate-900 to-primary-900',
        iconBg: 'bg-slate-900 text-white',
        badge: 'Home',
        description: 'Your welcome hub for navigating every Shilingi Moves dashboard tool.',
    },
    {
        id: 'cashflow',
        label: 'Income Manager',
        helper: 'Track money coming in',
        icon: ArrowDownUp,
        accent: 'from-primary-500 to-emerald-600',
        iconBg: 'bg-primary-100 text-primary-700',
        badge: 'Core',
        description: 'Track salary, business income, and other money coming in.',
    },
    {
        id: 'budget',
        label: 'Budget & Planning',
        helper: 'Plan spending and save smart',
        icon: Wallet,
        accent: 'from-amber-300 to-amber-500',
        iconBg: 'bg-amber-100 text-amber-700',
        badge: 'Plan',
        description: 'Track income and expenses to understand where your money goes.',
    },
    {
        id: 'debt',
        label: 'Debt Management',
        helper: 'Track and reduce what you owe',
        icon: Landmark,
        accent: 'from-rose-400 to-red-500',
        iconBg: 'bg-rose-100 text-rose-700',
        badge: 'Reduce',
        description: 'Track what you owe, plan your repayments, and reduce debt.',
    },
    {
        id: 'investments',
        label: 'Investment Planner',
        helper: 'Track and grow investments',
        icon: LineChart,
        accent: 'from-sky-500 to-blue-600',
        iconBg: 'bg-sky-100 text-sky-700',
        badge: 'Grow',
        description: 'Plan and track your investments while monitoring growth.',
    },
    {
        id: 'networth',
        label: 'Net Worth',
        helper: 'Track assets and liabilities',
        icon: TrendingUp,
        accent: 'from-violet-500 to-indigo-600',
        iconBg: 'bg-violet-100 text-violet-700',
        badge: 'View',
        description: 'Calculate your total net worth from assets and liabilities.',
    },
    {
        id: 'health',
        label: 'Financial Health',
        helper: 'Monitor your wellness score',
        icon: Activity,
        accent: 'from-teal-500 to-emerald-600',
        iconBg: 'bg-teal-100 text-teal-700',
        badge: 'Score',
        description: 'Check your financial wellness score and spot areas to improve.',
    },
    {
        id: 'user',
        label: 'Your Account',
        helper: 'Manage profile and settings',
        icon: CircleUserRound,
        accent: 'from-slate-600 to-slate-800',
        iconBg: 'bg-slate-100 text-slate-700',
        badge: 'Profile',
        description: 'Update your account details, preferences, and personal information.',
    },
    {
        id: 'advisory',
        label: 'Shilingi Guidance',
        helper: 'Kenyan money tools built around you',
        icon: Briefcase,
        accent: 'from-primary-600 to-amber-400',
        iconBg: 'bg-primary-100 text-primary-700',
        badge: 'Why it matters',
        description: 'A practical dashboard shaped for savings, debt reduction, growth, and clarity.',
    },
];

export const dashboardNavSections = dashboardSections.filter(
    (section) => ['overview', 'cashflow', 'budget', 'debt', 'investments', 'networth', 'health'].includes(section.id)
);

export const dashboardSectionMap = dashboardSections.reduce((accumulator, section) => {
    accumulator[section.id] = section;
    return accumulator;
}, {});
