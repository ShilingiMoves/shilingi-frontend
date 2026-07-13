import React, { useEffect, useMemo, useState } from 'react';
import NumericInput from '../../common/NumericInput';
import {
    AlertCircle,
    ArrowRight,
    Bell,
    BarChart3,
    Briefcase,
    GraduationCap,
    Home,
    KeyRound,
    Link as LinkIcon,
    Loader2,
    Pencil,
    ShieldCheck,
    Target,
    UserRound,
    Users,
    Wallet,
    WalletCards,
    X,
} from 'lucide-react';
import { getUserAccount, updatePreferredName, updateUserPreferences } from '../../../services/userApi';
import { useIncome } from '../../../contexts/IncomeContext';
import DashboardOverviewFooter from '../shell/DashboardOverviewFooter';
import IncomeForm from '../income/IncomeForm';
import IncomeList from '../income/IncomeList';
import QuickIncomeModal from '../income/QuickIncomeModal';
import {
    getDashboardDisplayName,
    getBackendPreferredName,
    getMemberInitials,
    getMemberLabel,
    getStoredPreferredName,
    normalizePreferredNameToFirstName,
    setStoredPreferredName,
    syncStoredPreferredNameFromUser,
} from '../../../utils/memberIdentity';
import { USER_PROFILE_WORKSPACE_KEY } from './UserGoalsFamilyForm';

const GOAL_META = {
    short: {
        key: 'shortTermGoal',
        detailKey: 'shortTermGoalDetails',
        slotsKey: 'shortTermGoals',
        label: 'Short-Term',
        helper: 'Under 12 months',
        color: 'bg-[#37c837]',
        barColor: '#40b58f',
        softBg: 'bg-[#eef8f4]',
        softBorder: 'border-[#9ed7c1]',
        softText: 'text-[#1c6b57]',
        sectionLine: 'bg-[#b7ddd0]',
        cardBg: 'bg-[linear-gradient(180deg,_#f2fbf7_0%,_#ebf7f1_100%)]',
        badgeBg: 'bg-[#e1f5eb]',
        iconTile: 'bg-[#f5fffb]',
        iconTone: 'text-[#1b7c60]',
        addCardBg: 'bg-[#fbfffd]',
        addTone: 'bg-[#fff6e7] text-[#9a6200]',
        icon: ShieldCheck,
    },
    medium: {
        key: 'mediumTermGoal',
        detailKey: 'mediumTermGoalDetails',
        slotsKey: 'mediumTermGoals',
        label: 'Medium-Term',
        helper: '1 - 5 years',
        color: 'bg-[#f6da1a]',
        barColor: '#4b8ee8',
        softBg: 'bg-[#f5f9ff]',
        softBorder: 'border-[#cfe0ff]',
        softText: 'text-[#2b6fd6]',
        sectionLine: 'bg-[#d8e7ff]',
        cardBg: 'bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_100%)]',
        badgeBg: 'bg-[#eaf2ff]',
        iconTile: 'bg-[#f7fbff]',
        iconTone: 'text-[#2b6fd6]',
        addCardBg: 'bg-[#fcfdff]',
        addTone: 'bg-[#fff6e7] text-[#9a6200]',
        icon: Home,
    },
    long: {
        key: 'longTermGoal',
        detailKey: 'longTermGoalDetails',
        slotsKey: 'longTermGoals',
        label: 'Long-Term',
        helper: '5+ years',
        color: 'bg-[#8a63df]',
        barColor: '#9a77eb',
        softBg: 'bg-[#f7f1ff]',
        softBorder: 'border-[#ddd0ff]',
        softText: 'text-[#7a57d1]',
        sectionLine: 'bg-[#e5d8ff]',
        cardBg: 'bg-[linear-gradient(180deg,_#fbf8ff_0%,_#f4efff_100%)]',
        badgeBg: 'bg-[#f0e9ff]',
        iconTile: 'bg-[#fcfaff]',
        iconTone: 'text-[#7a57d1]',
        addCardBg: 'bg-[#fdfbff]',
        addTone: 'bg-[#fff6e7] text-[#9a6200]',
        icon: GraduationCap,
    },
};

const GOAL_SLOT_LABELS = ['Goal 1', 'Goal 2', 'Goal 3'];
const EMPTY_GOAL_DETAILS = { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' };
const GOAL_NAME_OPTIONS = {
    short: [
        'Build an emergency fund',
        'Pay school fees',
        'Pay off mobile loan',
        'Pay rent deposit',
        'Save for medical expenses',
        'Clear credit card debt',
        'Save for holiday travel',
        'Buy household essentials',
        'Start a sinking fund',
        'Other short-term goal',
    ],
    medium: [
        'Buy a car',
        'Start or grow a business',
        'Save for university or college',
        'Save for a home deposit',
        'Upgrade professional skills',
        'Build an investment portfolio',
        'Buy land',
        'Plan a wedding',
        'Fund a family project',
        'Other medium-term goal',
    ],
    long: [
        'Build my retirement fund',
        'Buy a home',
        'Pay off a mortgage',
        'Build long-term wealth',
        'Create a child education fund',
        'Build a rental property portfolio',
        'Create generational wealth',
        'Set up family protection fund',
        'Reach financial independence',
        'Other long-term goal',
    ],
};
const DEPENDANT_RELATION_GROUPS = [
    {
        label: 'Parents',
        options: ['Father (Papa)', 'Mother (Mama)'],
    },
    {
        label: 'Siblings',
        options: ['Brother', 'Sister'],
    },
    {
        label: 'Extended Family',
        options: ['Cousin', 'Uncle', 'Aunt'],
    },
    {
        label: 'Grandparents',
        options: ['Grandfather', 'Grandmother'],
    },
    {
        label: 'In-Laws',
        options: ['Father-in-Law', 'Mother-in-Law'],
    },
    {
        label: 'Other',
        options: ['Other'],
    },
];
const DEPENDANT_DEFAULT_COUNT = {
    'Father (Papa)': 1,
    'Mother (Mama)': 1,
    'Father-in-Law': 1,
    'Mother-in-Law': 1,
    'Grandfather': 1,
    'Grandmother': 1,
    Other: 1,
    Brother: 2,
    Sister: 2,
    Uncle: 4,
    Aunt: 4,
    Cousin: 3,
};
const DEPENDANT_PERSON_OPTIONS = [
    { value: '1', label: '1 person' },
    { value: '2', label: '2 people' },
    { value: '3', label: '3 people' },
    { value: '4', label: '4 people' },
    { value: '5', label: '5 people' },
    { value: '6', label: '6 or more' },
];
const EMPTY_DEPENDANT_FORM = {
    relation: '',
    number: '1',
    benType: '',
    amount: '',
    freq: 'Monthly',
};

const defaults = {
    shortTermGoal: '',
    mediumTermGoal: '',
    longTermGoal: '',
    dependentsCount: '',
    familyNotes: '',
    shortTermGoalDetails: { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' },
    mediumTermGoalDetails: { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' },
    longTermGoalDetails: { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' },
    shortTermGoals: [],
    mediumTermGoals: [],
    longTermGoals: [],
    dependants: [],
    riskAppetite: 'Moderate',
    investmentHorizon: '5-10 Years',
    preferredProducts: 'T-Bills, MMFs, NSE Equities',
    financialMotivation: '',
};

const tabs = [
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'income', label: 'Income Manager', icon: Briefcase },
    { id: 'dependents', label: 'Dependants', icon: Users },
];

const readWorkspace = () => {
    if (typeof window === 'undefined') return defaults;
    try {
        return { ...defaults, ...JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}') };
    } catch {
        return defaults;
    }
};

const writeWorkspace = (next) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(next));
    }
};

const fmtKES = (v) => Number(v || 0) > 0 ? `KES ${Number(v).toLocaleString('en-KE')}` : 'Not added yet';
const goalLabel = (v) => v ? String(v).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : 'Not added yet';
const resolvedIncome = (s, p) => Number(s?.total_income ?? s?.monthly_income ?? s?.current_month?.total_income ?? 0) || Number(p || 0);
const formatGoalDate = (value) => {
    if (!value) return 'No target date';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};
const goalProgress = (currentSavings, targetAmount) => {
    const current = Number(currentSavings || 0);
    const target = Number(targetAmount || 0);
    if (target <= 0) return 0;
    return Math.max(0, Math.min((current / target) * 100, 100));
};
const normalizeGoalSlot = (goal = {}) => ({ ...EMPTY_GOAL_DETAILS, ...goal });
const goalHasContent = (goal = {}) => Boolean(goal.name || goal.targetAmount || goal.currentSavings || goal.targetDate || goal.monthlyContribution || goal.linkedProduct);
const getGoalSlots = (workspace = defaults, meta) => {
    const savedSlots = Array.isArray(workspace?.[meta.slotsKey]) ? workspace[meta.slotsKey] : [];
    const legacyDetail = workspace?.[meta.detailKey] || {};
    const legacyGoal = goalHasContent(legacyDetail) || workspace?.[meta.key]
        ? [{ ...legacyDetail, name: legacyDetail.name || workspace?.[meta.key] || '' }]
        : [];
    const source = savedSlots.length ? savedSlots : legacyGoal;
    return GOAL_SLOT_LABELS.map((_, index) => normalizeGoalSlot(source[index]));
};
const getGoalNameOptions = (type, currentName = '') => {
    const options = GOAL_NAME_OPTIONS[type] || GOAL_NAME_OPTIONS.short;
    const trimmedName = String(currentName || '').trim();
    return trimmedName && !options.includes(trimmedName) ? [trimmedName, ...options] : options;
};
const incomeAmount = (income) => Number(income?.monthly_equivalent || income?.amount || 0);
const incomeHint = (income) => `${String(income?.description || '')} ${String(income?.category_name || '')} ${String(income?.source || '')}`.toLowerCase();
const estimatePAYE = (amount) => Number(amount || 0) > 0 ? Math.round(Number(amount || 0) * 0.2333) : 0;
const incomeNote = (income) => {
    if (income?.source) return income.source;
    if (income?.is_recurring && income?.frequency_display) return `${income.frequency_display} income`;
    return income?.category_name || 'Income source';
};
const dependantCategory = (relation) => {
    if (['Father (Papa)', 'Mother (Mama)', 'Father-in-Law', 'Mother-in-Law'].includes(relation)) return 'Parent';
    if (['Brother', 'Sister'].includes(relation)) return 'Sibling';
    if (['Grandfather', 'Grandmother'].includes(relation)) return 'Grandparent';
    return 'Extended';
};
const dependantSuggestedBeneficiary = (relation) => {
    if (relation === 'Father (Papa)') return 'Direct';
    if (relation === 'Mother (Mama)') return 'Indirect';
    if (relation) return 'Indirect';
    return '';
};
const dependantMonthlySupport = (amount, frequency) => {
    const numericAmount = Number(amount || 0);
    if (frequency === 'Weekly') return numericAmount * 4.33;
    if (frequency === 'Fortnightly') return numericAmount * 2.17;
    if (frequency === 'Quarterly') return numericAmount / 3;
    if (frequency === 'Annually') return numericAmount / 12;
    if (frequency === 'As needed') return 0;
    return numericAmount;
};
const formatKESValue = (value, fallback = 'KES 0') => {
    const numericValue = Number(value || 0);
    return numericValue > 0 ? `KES ${numericValue.toLocaleString('en-KE')}` : fallback;
};
const buildDependantsSummary = (dependants = []) => {
    const totalPeople = dependants.reduce((sum, dependant) => sum + Number(dependant.number || 0), 0);
    const parentCount = dependants
        .filter((dependant) => ['Father (Papa)', 'Mother (Mama)', 'Father-in-Law', 'Mother-in-Law'].includes(dependant.relation))
        .reduce((sum, dependant) => sum + Number(dependant.number || 0), 0);
    const siblingCount = dependants
        .filter((dependant) => ['Brother', 'Sister'].includes(dependant.relation))
        .reduce((sum, dependant) => sum + Number(dependant.number || 0), 0);
    const otherCount = Math.max(totalPeople - parentCount - siblingCount, 0);
    const totalMonthly = dependants.reduce((sum, dependant) => sum + dependantMonthlySupport(dependant.amount, dependant.freq), 0);

    return { totalPeople, parentCount, siblingCount, otherCount, totalMonthly };
};
const goalIconForName = (name, fallbackIcon) => {
    const value = String(name || '').toLowerCase();
    if (value.includes('emergency') || value.includes('protect')) return ShieldCheck;
    if (value.includes('home') || value.includes('house')) return Home;
    if (value.includes('retire') || value.includes('skill') || value.includes('learn')) return GraduationCap;
    if (value.includes('debt') || value.includes('credit') || value.includes('card')) return WalletCards;
    if (value.includes('invest') || value.includes('wealth')) return BarChart3;
    return fallbackIcon || Target;
};

const Input = ({ label, ...props }) => {
    const isNumeric = label.toLowerCase().includes('amount') || label.toLowerCase().includes('savings') || label.toLowerCase().includes('contribution');
    
    return (
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            {label}
            {isNumeric && !props.type ? (
                <NumericInput {...props} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500" />
            ) : (
                <input {...props} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500" />
            )}
        </label>
    );
};

const Select = ({ label, children, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <select {...props} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500">
            {children}
        </select>
    </label>
);

const TextArea = ({ label, rows = 3, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <textarea {...props} rows={rows} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500" />
    </label>
);

const CheckRow = ({ label, ...props }) => (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
        <input {...props} type="checkbox" className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
        {label}
    </label>
);

const PrimaryButton = ({ className = '', ...props }) => <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-[1rem] bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`} />;
const SecondaryButton = ({ className = '', ...props }) => <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-[1rem] border border-emerald-100 bg-[#f6fbf8] px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#eef8f4] ${className}`} />;
const Datum = ({ label, value }) => <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-1.5 text-base font-semibold text-slate-950">{value}</p></div>;
const SummaryCard = ({ label, value, subtitle, accent = '', dark = false, compact = false, onClick }) => { const Component = onClick ? 'button' : 'div'; return <Component type={onClick ? 'button' : undefined} onClick={onClick} className={`w-full rounded-[1.15rem] border border-emerald-100 bg-white px-4 ${compact ? 'py-4' : 'py-5'} text-left shadow-sm transition-all ${onClick ? 'hover:-translate-y-0.5 hover:shadow-md' : ''} ${accent}`}><p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-white/70' : 'text-slate-400'}`}>{label}</p><p className={`mt-2 ${compact ? 'text-2xl' : 'text-3xl'} font-extrabold ${dark ? 'text-white' : 'text-slate-950'}`}>{value}</p><p className={`mt-1.5 text-sm ${dark ? 'text-white/75' : 'text-slate-500'}`}>{subtitle}</p></Component>; };
const GoalActionCard = ({ label, helper, color, active, onClick }) => <button type="button" onClick={onClick} className={`w-full rounded-[1rem] border px-4 py-4 text-left transition-all ${active ? 'border-primary-300 bg-[#eef8f4] shadow-sm' : 'border-emerald-200 border-dashed bg-[#f8fcfa] hover:border-primary-300 hover:bg-[#f1faf6] hover:shadow-sm'}`}><div className="flex items-start justify-between gap-3"><div className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${active ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'bg-white/95 ring-1 ring-emerald-100'}`}><span className={`inline-flex h-3.5 w-3.5 rounded-full ${color}`} /></div><span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold ${active ? 'bg-primary-100 text-primary-700' : 'bg-white text-primary-700 ring-1 ring-emerald-100'}`}>+</span></div><p className="mt-4 text-sm font-semibold text-slate-900">{label}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></button>;
const SecurityCard = ({ icon: Icon, title, subtitle }) => <div className="rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fbfdfc_0%,_#f4f8f6_100%)] px-4 py-5 text-center shadow-sm"><div className="mx-auto inline-flex rounded-2xl bg-white p-3 text-primary-700 shadow-sm ring-1 ring-slate-200"><Icon size={20} /></div><p className="mt-4 text-base font-bold text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
const ModalShell = ({ title, icon: Icon, onClose, children }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/38 p-3 backdrop-blur-[3px] sm:p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.35rem] border border-emerald-100 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:rounded-[1.5rem]"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-100 bg-white/96 px-4 py-3 backdrop-blur sm:px-5 sm:py-4"><div className="flex items-center gap-2.5 sm:gap-3"><div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef8f4] text-primary-700 sm:h-10 sm:w-10"><Icon size={17} /></div><h3 className="text-[1.2rem] font-extrabold tracking-tight text-slate-950 sm:text-[1.45rem]">{title}</h3></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f6fbf8] text-slate-500 transition-colors hover:text-slate-900"><X size={17} /></button></div><div className="p-4 sm:p-5">{children}</div></div></div>;
const PreferredNameCard = ({ memberLabel, preferredName, saving = false, onChange, onSave }) => (
    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">Privacy-first profile</p>
                <h3 className="mt-2 text-[1.45rem] font-extrabold tracking-tight text-slate-950">Preferred name</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your member number is {memberLabel}. Add the name you prefer to be addressed by here so the dashboard can greet you naturally.
                </p>
            </div>
            <form onSubmit={onSave} className="w-full lg:max-w-md">
                <label className="block text-sm font-medium text-slate-700">
                    Name you prefer
                    <input
                        value={preferredName}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="e.g. Myra"
                        className="mt-2 w-full rounded-[1rem] border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                    />
                </label>
                <button type="submit" disabled={saving} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save preferred name'}
                </button>
            </form>
        </div>
    </section>
);
const GoalTypeCard = ({ active, label, helper, color, onClick }) => <button type="button" onClick={onClick} className={`rounded-[1rem] border px-3 py-4 text-center transition-all sm:px-4 sm:py-4 ${active ? 'border-primary-500 bg-[#eef8f4] shadow-sm' : 'border-emerald-100 bg-white hover:border-primary-300 hover:bg-[#f9fcfa]'}`}><span className={`mx-auto inline-flex h-7 w-7 rounded-full border-2 border-slate-950/70 ${color}`} /><p className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">{label}</p><p className="mt-1 text-xs text-slate-500 sm:text-sm">{helper}</p></button>;
const GoalProgressCard = ({ goal, meta, onClick }) => {
    const progress = goalProgress(goal.currentSavings, goal.targetAmount);
    const Icon = goalIconForName(goal.name, meta.icon);
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-[1.2rem] border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${meta.softBorder} ${meta.cardBg}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ${meta.softBorder} ${meta.iconTile} ${meta.iconTone}`}>
                    <Icon size={18} />
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${meta.softBorder} ${meta.softText} ${meta.badgeBg}`}>
                    {Math.round(progress)}%
                </span>
            </div>
            <p className="mt-4 text-[1.05rem] font-bold text-slate-950">{goal.name || 'Untitled goal'}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
                {fmtKES(goal.currentSavings)} / {fmtKES(goal.targetAmount)}
            </p>
            <div className="mt-4 h-2.5 rounded-full bg-white/80">
                <div className="h-2.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: meta.barColor }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Due {formatGoalDate(goal.targetDate)}</span>
                <span>{goal.linkedProduct ? `${goal.linkedProduct} linked` : 'Planning in profile'}</span>
            </div>
        </button>
    );
};
const AddGoalCard = ({ label, meta, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex min-h-[206px] w-full items-center justify-center rounded-[1.2rem] border border-dashed text-center transition-all hover:shadow-sm ${meta.softBorder} ${meta.addCardBg} ${meta.softText}`}
    >
        <span className="text-base font-semibold">+ Add {label}</span>
    </button>
);
const GoalBucketSection = ({ title, helper, meta, slots, onAdd, onEdit }) => (
    <article className="rounded-[1.5rem] border border-[#cfe8dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.softBg} ${meta.softText}`}>
                    <span className={`mr-2 inline-flex h-3 w-3 rounded-full ${meta.color}`} />
                    {title} Goals
                </span>
                <span className="text-sm text-slate-400">{helper}</span>
                <span className={`hidden h-px flex-1 rounded-full lg:block ${meta.sectionLine}`} />
            </div>
            <button
                type="button"
                onClick={() => onAdd(slots.findIndex((goal) => !goalHasContent(goal)) === -1 ? 0 : slots.findIndex((goal) => !goalHasContent(goal)))}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${meta.addTone}`}
            >
                + Add {title}
            </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slots.map((goal, index) => (
                goalHasContent(goal) ? (
                    <GoalProgressCard
                        key={`${title}-${GOAL_SLOT_LABELS[index]}`}
                        goal={{ ...goal, name: goal.name || GOAL_SLOT_LABELS[index] }}
                        meta={meta}
                        onClick={() => onEdit(index)}
                    />
                ) : (
                    <AddGoalCard key={`${title}-${GOAL_SLOT_LABELS[index]}`} label={GOAL_SLOT_LABELS[index]} meta={meta} onClick={() => onAdd(index)} />
                )
            ))}
        </div>
    </article>
);
const IncomeMetricCard = ({ label, value, subtitle, accent = 'text-[#1f7f63]', featured = false }) => (
    <div className={`rounded-[1.1rem] border border-emerald-100 px-4 py-3.5 shadow-sm ${featured ? 'bg-[#1f6f5a] text-white' : 'bg-white text-slate-950'}`}>
        <p className={`text-[9px] font-semibold uppercase tracking-[0.28em] ${featured ? 'text-white/70' : 'text-slate-400'}`}>{label}</p>
        <p className={`mt-2 text-[1.45rem] sm:text-[1.6rem] font-extrabold tracking-tight ${featured ? 'text-[#f0c94d]' : accent}`}>{value}</p>
        <p className={`mt-1 text-[12px] ${featured ? 'text-white/80' : 'text-slate-500'}`}>{subtitle}</p>
    </div>
);
const IncomeSourceRow = ({ icon: Icon, title, note, amount, subnote, accent = 'text-[#1f7f63]', bg = 'bg-[#f5fbf8]', onEdit }) => (
    <div className="flex items-start justify-between gap-3 border-b border-emerald-100 py-4 last:border-b-0 last:pb-0">
        <div className="flex items-start gap-3">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[1rem] ${bg} ${accent}`}>
                <Icon size={19} />
            </div>
            <div>
                <p className="text-base font-bold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{note}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`text-xl font-extrabold ${accent}`}>{amount}</p>
            <p className="mt-1 text-sm text-slate-400">{subnote}</p>
            {onEdit ? (
                <button
                    type="button"
                    onClick={onEdit}
                    className="mt-2 inline-flex items-center justify-end gap-1 text-xs font-semibold text-[#166a55] transition-colors hover:text-[#0f6a57]"
                >
                    <Pencil size={12} />
                    Edit amount
                </button>
            ) : null}
        </div>
    </div>
);
const AllocationBarRow = ({ label, percent, color }) => (
    <div className="grid grid-cols-[92px_minmax(0,1fr)_44px] items-center gap-3">
        <span className="text-sm text-slate-700">{label}</span>
        <div className="h-2.5 rounded-full bg-[#edf5f1]">
            <div className="h-2.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
        </div>
        <span className="text-right text-sm font-semibold" style={{ color }}>{percent}%</span>
    </div>
);
const RuleHealthCard = ({ title, amount, target, tone, status, note }) => (
    <div className={`rounded-[1.15rem] border-l-4 p-4 ${tone}`}>
        <p className="text-base font-semibold">{title} <span className="font-medium">{status}</span></p>
        <p className="mt-1 text-sm"><span className="font-extrabold text-slate-950">{amount}</span> of {target}</p>
        {note ? <p className="mt-1 text-sm">{note}</p> : null}
    </div>
);
const ProfileEcosystemSection = ({ ecosystemCards }) => (
    <div className="overflow-hidden rounded-[1.5rem] bg-[#1f9c72] px-5 py-5 text-white shadow-[0_18px_40px_rgba(31,156,114,0.22)]">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <p className="text-[1.45rem] font-extrabold tracking-tight">Your Profile Powers The Entire Ecosystem</p>
                <p className="max-w-3xl text-sm leading-6 text-white/80">Everything you&apos;ve added here personalises your planning tools, comparisons, and recommendations.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {ecosystemCards.map(({ title, helper, icon: Icon, cta, action }) => (
                    <button key={title} type="button" onClick={action} className="rounded-[1.15rem] border border-white/18 bg-white/8 px-4 py-5 text-left transition-all hover:bg-white/12 hover:shadow-lg">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1f9c72] shadow-sm">
                            <Icon size={20} />
                        </div>
                        <p className="mt-4 text-base font-bold text-white">{title}</p>
                        <p className="mt-1 text-sm text-white/72">{helper}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#F0C94D]">{cta}<ArrowRight size={14} /></span>
                    </button>
                ))}
            </div>
        </div>
    </div>
);
const DependantsSummaryCard = ({ value, label, accent = 'text-[#166a55]' }) => (
    <div className="rounded-[1.2rem] border border-emerald-100 bg-white px-5 py-5 text-center shadow-[0_8px_24px_rgba(23,43,31,0.08)]">
        <p className={`text-[2rem] font-extrabold tracking-tight ${accent}`}>{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
);
const DependantsSectionHeader = ({ summaryLabel, onAdd }) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#eef8f4] text-[#166a55]">
                <Users size={18} />
            </div>
            <div>
                <p className="text-[1.2rem] font-bold text-slate-950">My Dependants</p>
                <p className="mt-1 text-sm text-slate-500">{summaryLabel}</p>
            </div>
        </div>
        <button type="button" onClick={onAdd} className="inline-flex items-center justify-center gap-2 self-start rounded-[0.95rem] bg-[#1f7f63] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166a55]">
            <span className="text-lg leading-none">+</span>
            Add Dependant
        </button>
    </div>
);
const DependantsFormPanel = ({ form, onChange, onSave, onCancel, isSaving, isEditing }) => (
    <form onSubmit={onSave} className="rounded-[1.3rem] border border-[#c5dfce] bg-white p-4 shadow-[0_12px_30px_rgba(27,107,74,0.08)] sm:p-6">
        <div className="flex items-center gap-3 text-[#166a55]">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#eef8f4]">
                <Users size={18} />
            </div>
            <p className="text-xl font-bold leading-tight tracking-tight sm:text-[1.45rem]">{isEditing ? 'Edit Dependant' : 'Add a New Dependant'}</p>
        </div>
        <div className="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Relation
                <select value={form.relation} onChange={(event) => onChange('relation', event.target.value)} className="h-12 rounded-[0.95rem] border border-emerald-100 px-4 text-base font-medium normal-case tracking-normal text-slate-900 outline-none transition-colors focus:border-primary-500 sm:h-11 sm:text-sm">
                    <option value="">Select relation</option>
                    {DEPENDANT_RELATION_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                            {group.options.map((option) => <option key={option} value={option}>{option}</option>)}
                        </optgroup>
                    ))}
                </select>
            </label>
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Number of People
                <select value={form.number} onChange={(event) => onChange('number', event.target.value)} className="h-12 rounded-[0.95rem] border border-emerald-100 px-4 text-base font-medium normal-case tracking-normal text-slate-900 outline-none transition-colors focus:border-primary-500 sm:h-11 sm:text-sm">
                    {DEPENDANT_PERSON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <span className="text-[11px] font-normal normal-case tracking-normal text-slate-400">Auto-suggested based on relation - adjust if needed</span>
            </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Beneficiary Type
                <select value={form.benType} onChange={(event) => onChange('benType', event.target.value)} className="h-12 rounded-[0.95rem] border border-emerald-100 px-4 text-base font-medium normal-case tracking-normal text-slate-900 outline-none transition-colors focus:border-primary-500 sm:h-11 sm:text-sm">
                    <option value="">Select</option>
                    <option value="Direct">Direct Beneficiary</option>
                    <option value="Indirect">Indirect Beneficiary</option>
                </select>
                <span className="text-[11px] font-normal normal-case tracking-normal text-slate-400">Direct = primary support provider</span>
            </label>
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Support Amount (KES)
                <NumericInput value={form.amount} onChange={(event) => onChange('amount', event.target.value)} placeholder="e.g. 5,000" className="h-12 rounded-[0.95rem] border border-emerald-100 px-4 text-base font-medium normal-case tracking-normal text-slate-900 outline-none transition-colors focus:border-primary-500 sm:h-11 sm:text-sm" />
            </label>
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Frequency
                <select value={form.freq} onChange={(event) => onChange('freq', event.target.value)} className="h-12 rounded-[0.95rem] border border-emerald-100 px-4 text-base font-medium normal-case tracking-normal text-slate-900 outline-none transition-colors focus:border-primary-500 sm:h-11 sm:text-sm">
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Fortnightly">Fortnightly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                    <option value="As needed">As needed</option>
                </select>
            </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-emerald-100 pt-5 sm:flex-row sm:justify-end sm:border-t-0 sm:pt-0">
            <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-[0.95rem] border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 sm:min-h-0">
                Cancel
            </button>
            <button type="submit" disabled={isSaving} className="inline-flex min-h-12 items-center justify-center rounded-[0.95rem] bg-[#1f7f63] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#166a55] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0">
                {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Dependant')}
            </button>
        </div>
    </form>
);
const DependantsEmptyState = () => (
    <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f2f7f4] text-[#166a55]">
            <Users size={28} />
        </div>
        <p className="mt-5 text-base font-semibold text-slate-700">No dependants added yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Tell us who you support financially. This shapes your budget, insurance, and retirement plan automatically.
        </p>
    </div>
);
const DependantsTable = ({ dependants, totalMonthly, onEdit, onDelete }) => (
    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#eef8f4] text-[#166a55]">
                    <Users size={18} />
                </div>
                <p className="text-lg font-bold text-slate-950">Dependants Summary</p>
            </div>
            <div className="flex flex-wrap gap-3">
                <button type="button" className="text-sm font-semibold text-[#175f54]">Export</button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b border-emerald-100 text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]">
                        <th className="py-3 pr-4 font-semibold">Relation</th>
                        <th className="py-3 pr-4 font-semibold">People</th>
                        <th className="py-3 pr-4 font-semibold">Beneficiary</th>
                        <th className="py-3 pr-4 font-semibold">Support</th>
                        <th className="py-3 pr-4 font-semibold">Frequency</th>
                        <th className="py-3 pr-4 font-semibold">Share</th>
                        <th className="py-3 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dependants.length > 0 ? dependants.map((dependant, index) => {
                        const monthlySupport = dependantMonthlySupport(dependant.amount, dependant.freq);
                        const supportShare = totalMonthly > 0 ? Math.round((monthlySupport / totalMonthly) * 100) : 0;
                        const category = dependant.category || dependantCategory(dependant.relation);

                        return (
                            <tr key={`${dependant.relation}-${index}-${dependant.updatedAt || 'saved'}`} className="border-b border-slate-100 last:border-b-0">
                                <td className="py-3 pr-4 font-medium text-slate-900">
                                    {dependant.relation}
                                    <span className="mt-1 block text-xs font-normal text-slate-400">{category}</span>
                                </td>
                                <td className="py-3 pr-4 text-slate-600">{dependant.number} {Number(dependant.number || 0) === 1 ? 'person' : 'people'}</td>
                                <td className="py-3 pr-4"><span className="inline-flex rounded-full bg-[#eef8f3] px-2.5 py-1 text-xs font-semibold text-[#175f54]">{dependant.benType}</span></td>
                                <td className="py-3 pr-4 font-semibold text-[#175f54]">{formatKESValue(dependant.amount, 'KES 0')}</td>
                                <td className="py-3 pr-4 text-slate-700">{dependant.freq}</td>
                                <td className="py-3 pr-4 text-slate-700">{supportShare}%</td>
                                <td className="py-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={() => onEdit(index)} className="rounded-full bg-[#eef8f3] px-3 py-1 text-xs font-semibold text-[#175f54]">Edit</button>
                                        <button type="button" onClick={() => onDelete(index)} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">Remove</button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={7} className="py-8 text-center text-sm text-slate-500">No dependants yet. Add a dependant to populate this table.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </section>
);
const PlanningImpactCard = ({ icon: Icon, title, body, badge, cta, onClick }) => (
    <div className="rounded-[1.2rem] border border-white/60 bg-white/8 px-5 py-5 shadow-sm transition-all hover:bg-white/12 hover:shadow-lg">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-[#1f9c72] shadow-sm">
            <Icon size={18} />
        </div>
        <p className="mt-4 text-[1.15rem] font-bold text-white">{title}</p>
        <p className="mt-3 text-sm leading-6 text-white/78">{body}</p>
        <span className="mt-4 inline-flex rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/16">{badge}</span>
        <button type="button" onClick={onClick} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#F0C94D]">
            {cta}
            <ArrowRight size={14} />
        </button>
    </div>
);

const compactKES = (value) => {
    const amount = Number(value || 0);
    if (amount <= 0) return 'KES 0';
    if (amount >= 1000000) return `KES ${Number(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}M`;
    if (amount >= 1000) return `KES ${Math.round(amount / 1000)}K`;
    return `KES ${amount.toLocaleString('en-KE')}`;
};

const shortRelationName = (relation = '') => String(relation).replace(/\s*\([^)]*\)/g, '').replace(/-in-Law/g, '').trim() || 'Dependant';

const MobileProfileWorkspace = ({
    activeTab,
    completion,
    dateLabel,
    dependants,
    dependantsSummary,
    goalBucketByType,
    goalBuckets,
    goalCount,
    incomeValue,
    incomes,
    memberInitials,
    onAddDependant,
    onAddIncome,
    onEditDependant,
    onEditIncome,
    onOpenGoal,
    onQuickAddIncome,
    onRemoveDependant,
    onSelectTab,
    profileGreeting,
    profileIntro,
    remaining,
    totalDependantsSupport,
}) => (
    <div className="lg:hidden">
        <div className="mx-auto max-w-[430px] space-y-4 pb-20">
            <MobileProfileTabs activeTab={activeTab} onSelectTab={onSelectTab} />
            <MobileProfileHero
                completion={completion}
                dateLabel={dateLabel}
                memberInitials={memberInitials}
                profileGreeting={profileGreeting}
                profileIntro={profileIntro}
                remaining={remaining}
            />

            {activeTab === 'goals' && (
                <MobileGoalsView
                    goalBucketByType={goalBucketByType}
                    goalBuckets={goalBuckets}
                    goalCount={goalCount}
                    onOpenGoal={onOpenGoal}
                />
            )}

            {activeTab === 'income' && (
                <MobileIncomeView
                    incomeValue={incomeValue}
                    incomes={incomes}
                    onAddIncome={onAddIncome}
                    onEditIncome={onEditIncome}
                    onQuickAddIncome={onQuickAddIncome}
                />
            )}

            {activeTab === 'dependents' && (
                <MobileDependantsView
                    dependants={dependants}
                    dependantsSummary={dependantsSummary}
                    onAddDependant={onAddDependant}
                    onEditDependant={onEditDependant}
                    onRemoveDependant={onRemoveDependant}
                    totalDependantsSupport={totalDependantsSupport}
                />
            )}
        </div>
    </div>
);

const MobileProfileTabs = ({ activeTab, onSelectTab }) => (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ id, label }) => (
            <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`h-8 shrink-0 rounded-full border px-3 text-[11px] font-semibold transition-colors ${activeTab === id ? 'border-[#eabb3a] bg-[#eabb3a] text-white' : 'border-[#dde1ea] bg-white text-[#5e6a80]'}`}
            >
                {label}
            </button>
        ))}
    </div>
);

const MobileProfileHero = ({ completion, dateLabel, memberInitials, profileGreeting, profileIntro, remaining }) => (
    <section className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(148deg,_#2a6b55_0%,_#16453a_100%)] p-5 text-white shadow-[0_14px_30px_rgba(20,69,58,0.2)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#e9b54a]/10" />
        <div className="relative">
            <span className="inline-flex rounded-full border border-white/35 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#eaf3ee]">
                {dateLabel}
            </span>
            <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#f0d18a] bg-[#e9b54a] text-lg font-extrabold text-[#143d33]">
                    {memberInitials}
                </div>
                <h1 className="min-w-0 truncate text-[1.35rem] font-extrabold leading-tight tracking-[-0.02em]">
                    {profileGreeting}
                </h1>
            </div>
            <p className="mt-3 text-[12px] leading-5 text-[#d9e8e0]">{profileIntro}</p>
            <div className="mt-4 rounded-[16px] border border-white/15 bg-[#143d33]/55 p-4">
                <p className="text-[1.75rem] font-extrabold leading-none text-[#e9b54a]">{completion}%</p>
                <p className="mt-1 text-[11px] font-bold">Profile Complete</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/16">
                    <div className="h-1.5 rounded-full bg-[#e9b54a]" style={{ width: `${completion}%` }} />
                </div>
                <p className="mt-3 font-mono text-[9px] tracking-[0.08em] text-[#c9dcd3]">
                    {remaining > 0 ? `${remaining} sections remaining` : 'profile setup looks strong'}
                </p>
            </div>
        </div>
    </section>
);

const MobileGoalsView = ({ goalBucketByType, goalBuckets, goalCount, onOpenGoal }) => {
    const totals = Object.fromEntries(goalBuckets.map((bucket) => [
        bucket.type,
        bucket.goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0),
    ]));

    return (
        <section className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <MobileStatCard label="Short term goals" value={compactKES(totals.short)} helper={`${goalBucketByType.short?.goals.length || 0}/3 Goals added`} tone="text-[#15613f]" />
                <MobileStatCard label="Medium term goals" value={compactKES(totals.medium)} helper={`${goalBucketByType.medium?.goals.length || 0}/3 Goals added`} tone="text-[#1f7a5a]" />
                <MobileStatCard label="Long term goals" value={compactKES(totals.long)} helper={`${goalBucketByType.long?.goals.length || 0}/3 Goals added`} tone="text-[#2563eb]" />
                <MobileStatCard label="Active goals" value={String(goalCount)} helper="Goal slots filled" tone="text-[#d6891c]" />
            </div>

            {goalBuckets.map(({ type, meta, goals }) => (
                <MobileGoalSection
                    key={type}
                    goals={goals}
                    meta={meta}
                    onAdd={() => onOpenGoal(type)}
                    onEdit={(slotIndex) => onOpenGoal(type, slotIndex)}
                />
            ))}
        </section>
    );
};

const MobileStatCard = ({ label, value, helper, tone = 'text-[#15613f]' }) => (
    <div className="min-h-[96px] rounded-[14px] border border-[#e7e9e4] bg-white p-3.5">
        <p className="text-[11px] font-extrabold uppercase leading-4 text-[#65746c]">{label}</p>
        <p className={`mt-2 text-[18px] font-extrabold leading-none ${tone}`}>{value}</p>
        <p className="mt-2 text-[11px] leading-4 text-[#5f7168]">{helper}</p>
    </div>
);

const MobileGoalSection = ({ goals, meta, onAdd, onEdit }) => (
    <article className="rounded-[16px] border border-[#e3e3e5] bg-white p-4 shadow-[0_14px_28px_rgba(0,0,0,0.05)]">
        <div className="border-b border-[#dde1ea] pb-2">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-bold text-[#0c6060]">{meta.label.replace('-', ' ')} goals</h2>
                <button type="button" onClick={onAdd} className="text-[11px] font-bold text-[#eabb3a]">+ Add Goal</button>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-[#707974]">
                {meta.label === 'Short-Term' ? 'Here is a summary of your short term financial goals' : meta.label === 'Medium-Term' ? 'Plan your financial objectives for the next few years' : 'Set your ambitions for distant future financial stability'}
            </p>
        </div>
        <div className="mt-4 space-y-3">
            {goals.length > 0 ? goals.map((goal) => (
                <MobileGoalCard key={`${meta.label}-${goal.slotIndex}-${goal.name}`} goal={goal} onEdit={() => onEdit(goal.slotIndex)} />
            )) : (
                <button type="button" onClick={onAdd} className="w-full rounded-[18px] border border-dashed border-[#dde1ea] bg-[#f8faf9] px-4 py-8 text-center text-[12px] font-bold text-[#0c6060]">
                    Add your first {meta.label.toLowerCase()} goal
                </button>
            )}
        </div>
    </article>
);

const MobileGoalCard = ({ goal, onEdit }) => {
    const progress = Math.round(goalProgress(goal.currentSavings, goal.targetAmount));
    return (
        <div className="rounded-[18px] bg-white px-4 py-4 shadow-[0_0_2px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[10px] text-[#67677a]">{goal.slotLabel || 'Goal'}</p>
                    <p className="mt-1 text-[13px] font-bold text-[#303048]">{goal.name || 'Untitled goal'}</p>
                </div>
                <p className="text-right text-[13px] font-extrabold text-[#0c6060]">{formatKESValue(goal.targetAmount, 'KES 0')}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-[#8e97ab]">Progress</p>
                <span className="rounded-full bg-[#eabb3a] px-2 py-0.5 text-[9px] text-white">{progress}%</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-[#e3e3e5]">
                <div className="h-1 rounded-full bg-[#f46040]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-[#8e97ab]">Due {formatGoalDate(goal.targetDate)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed border-[#dde1ea] pt-3">
                <button type="button" onClick={onEdit} className="rounded-lg border border-[#dde1ea] py-2 text-[11px] font-semibold text-[#5e6a80]">Edit</button>
                <button type="button" onClick={onEdit} className="rounded-lg border border-rose-200 py-2 text-[11px] font-semibold text-rose-500">Delete</button>
            </div>
        </div>
    );
};

const MobileIncomeView = ({ incomeValue, incomes, onAddIncome, onEditIncome, onQuickAddIncome }) => {
    const sortedIncomes = [...(incomes || [])].sort((a, b) => incomeAmount(b) - incomeAmount(a));
    const sideIncome = sortedIncomes.slice(1).reduce((sum, income) => sum + incomeAmount(income), 0);
    const savingsRate = incomeValue > 0 ? 0 : 0;

    return (
        <section className="space-y-3">
            <article className="rounded-[16px] border border-[#e3e3e5] bg-white p-4">
                <p className="text-[12px] leading-5 text-[#5f7168]">Capture your income baseline, manage current sources, and keep your planning inputs fresh.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button type="button" onClick={onQuickAddIncome} className="rounded-full border border-[#dce8df] bg-white px-4 py-3 text-[12px] font-bold text-[#0c6060]">+ Quick Add</button>
                    <button type="button" onClick={onAddIncome} className="rounded-full bg-[#0c6060] px-4 py-3 text-[12px] font-bold text-white">+ Add Income</button>
                </div>
            </article>
            <div className="rounded-[16px] bg-[#0c7068] p-4 text-white">
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/65">Total monthly income</p>
                <p className="mt-3 text-[24px] font-extrabold text-[#e9b54a]">{formatKESValue(incomeValue, 'Not added yet')}</p>
                <p className="mt-2 text-[11px] text-white/75">{new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <MobileStatCard label="Primary salary" value={formatKESValue(incomeAmount(sortedIncomes[0]), 'Not added yet')} helper="Add salary income" tone="text-[#0c6060]" />
                <MobileStatCard label="Side income" value={formatKESValue(sideIncome, 'Not added yet')} helper="Add extra income" tone="text-[#0c6060]" />
                <MobileStatCard label="Savings rate" value={`${savingsRate}%`} helper="Goal: 20%" tone="text-[#744af2]" />
                <MobileStatCard label="Income sources" value={String(sortedIncomes.length)} helper="Sources recorded" tone="text-[#d6891c]" />
            </div>
            <article className="rounded-[16px] border border-[#e3e3e5] bg-white p-4">
                <div className="flex items-start justify-between gap-3 border-b border-[#dde1ea] pb-3">
                    <div>
                        <h2 className="text-[15px] font-bold text-[#0c6060]">Source of Income</h2>
                        <p className="mt-1 text-[11px] text-[#707974]">Here is a summary of your sources of income</p>
                    </div>
                    <button type="button" onClick={onAddIncome} className="text-[11px] font-bold text-[#eabb3a]">+ Add Income</button>
                </div>
                <div className="mt-3 space-y-2">
                    {sortedIncomes.length > 0 ? sortedIncomes.slice(0, 5).map((income, index) => (
                        <button key={income.uuid || income.id || `${income.description}-${index}`} type="button" onClick={() => onEditIncome(income)} className="flex w-full items-center justify-between gap-3 rounded-[16px] border border-[#edf0ee] bg-white p-3 text-left">
                            <span className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9b54a] text-white"><Wallet size={15} /></span>
                                <span>
                                    <span className="block text-[10px] text-[#8e97ab]">{income.source || income.category_name || 'Income'}</span>
                                    <span className="block text-[13px] font-bold text-[#303048]">{income.description || income.source || 'Income source'}</span>
                                </span>
                            </span>
                            <span className="text-right text-[12px] font-extrabold text-[#303048]">{formatKESValue(incomeAmount(income), 'KES 0')}</span>
                        </button>
                    )) : (
                        <button type="button" onClick={onAddIncome} className="w-full rounded-[16px] border border-dashed border-[#dde1ea] bg-[#f8faf9] px-4 py-8 text-[12px] font-bold text-[#0c6060]">
                            Add your first income source
                        </button>
                    )}
                </div>
            </article>
        </section>
    );
};

const MobileDependantsView = ({ dependants, dependantsSummary, onAddDependant, onEditDependant, onRemoveDependant, totalDependantsSupport }) => (
    <section className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
            <MobileStatCard label="Total dependants" value={String(dependantsSummary.totalPeople)} helper={`${formatKESValue(Math.round(totalDependantsSupport), 'KES 0')}/mo support`} tone="text-[#0c6060]" />
            <MobileStatCard label="Parents" value={String(dependantsSummary.parentCount)} helper="Parent support" tone="text-[#0c6060]" />
            <MobileStatCard label="Siblings" value={String(dependantsSummary.siblingCount)} helper="Sibling support" tone="text-[#2563eb]" />
            <MobileStatCard label="Other dependants" value={String(dependantsSummary.otherCount)} helper="Other support" tone="text-[#d6891c]" />
        </div>
        <article className="rounded-[16px] border border-[#e3e3e5] bg-white p-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#dde1ea] pb-3">
                <div>
                    <h2 className="text-[15px] font-bold text-[#0c6060]">My Dependants</h2>
                    <p className="mt-1 text-[11px] text-[#707974]">Here is a summary of your dependants</p>
                </div>
                <button type="button" onClick={onAddDependant} className="text-[11px] font-bold text-[#eabb3a]">+ Add Dependants</button>
            </div>
            <div className="mt-3 space-y-2">
                {dependants.length > 0 ? dependants.map((dependant, index) => (
                    <div key={`${dependant.relation}-${index}`} className="rounded-[16px] border border-[#edf0ee] bg-white p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${dependant.benType === 'Direct' ? 'bg-[#e6f8ec] text-[#2fa85a]' : 'bg-[#fff0e8] text-[#f46040]'}`}>
                                    {dependant.benType || 'Beneficiary'}
                                </span>
                                <p className="mt-2 text-[10px] text-[#8e97ab]">{dependant.category || dependantCategory(dependant.relation)}</p>
                                <p className="text-[13px] font-bold text-[#303048]">{shortRelationName(dependant.relation)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#8e97ab]">Support Amount</p>
                                <p className="text-[13px] font-extrabold text-[#303048]">{formatKESValue(dependant.amount, 'KES 0')}</p>
                                <div className="mt-2 flex justify-end gap-2">
                                    <button type="button" onClick={() => onEditDependant(index)} className="text-[#5e6a80]"><Pencil size={14} /></button>
                                    <button type="button" onClick={() => onRemoveDependant(index)} className="text-rose-500"><X size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <button type="button" onClick={onAddDependant} className="w-full rounded-[16px] border border-dashed border-[#dde1ea] bg-[#f8faf9] px-4 py-8 text-center text-[12px] font-bold text-[#0c6060]">
                        No dependants yet. Add the people you support.
                    </button>
                )}
            </div>
        </article>
    </section>
);
const SecurityStatusCard = ({ icon: Icon, title, subtitle, badge, badgeTone = 'bg-[#e7f6f1] text-[#166a55]', accent = false, actionText }) => (
    <div className={`rounded-[1.2rem] border px-5 py-6 text-center shadow-sm ${accent ? 'border-[#b7ddd0] bg-[linear-gradient(180deg,_#eef8f4_0%,_#e6f4ee_100%)]' : 'border-emerald-100 bg-white'}`}>
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f4] text-[#1f7f63]">
            <Icon size={22} />
        </div>
        <p className="mt-5 text-[1.15rem] font-bold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
        <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeTone}`}>{badge}</span>
        {actionText ? <p className="mt-4 text-sm font-semibold text-[#2f74db]">{actionText}</p> : null}
    </div>
);
const SettingsToggleRow = ({ title, subtitle, enabled = false }) => (
    <div className="flex items-center justify-between gap-4 border-b border-emerald-100 py-4 last:border-b-0 last:pb-0">
        <div>
            <p className="text-base font-semibold text-slate-950">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${enabled ? 'bg-[#1f7f63]' : 'bg-[#d7ece4]'}`}>
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-7' : 'left-1'}`} />
        </span>
    </div>
);
const LinkedAccountRow = ({ icon: Icon, title, status, action, tone = 'connect', detail }) => {
    const actionClass = tone === 'disconnect'
        ? 'border-[#f5c6c6] bg-[#fff7f7] text-[#dd5a5a]'
        : tone === 'verify'
            ? 'border-[#b7ddd0] bg-[#eef8f4] text-[#166a55]'
            : 'border-[#b7ddd0] bg-white text-[#166a55]';
    return (
        <div className="flex items-center justify-between gap-4 border-b border-emerald-100 py-4 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#f6fbf8] text-[#1f7f63]">
                    <Icon size={19} />
                </div>
                <div>
                    <p className="text-base font-bold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{status}</p>
                    {detail ? <p className="mt-0.5 text-xs text-slate-400">{detail}</p> : null}
                </div>
            </div>
            <button type="button" className={`rounded-full border px-4 py-2 text-sm font-semibold ${actionClass}`}>{action}</button>
        </div>
    );
};
const PreferenceDatum = ({ label, value, helper, toggle = false, enabled = false, action }) => (
    <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <div className="mt-3 flex items-start justify-between gap-4">
            <div>
                <p className="text-[1.15rem] font-semibold text-slate-950">{value}</p>
                {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
                {action ? <button type="button" className="mt-3 rounded-[0.9rem] border border-[#f0d39a] bg-[#fff6e7] px-4 py-2 text-sm font-semibold text-[#9a6200]">{action}</button> : null}
            </div>
            {toggle ? (
                <span className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${enabled ? 'bg-[#1f7f63]' : 'bg-[#d7ece4]'}`}>
                    <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-7' : 'left-1'}`} />
                </span>
            ) : null}
        </div>
    </div>
);
const ProfileIncomeOverview = ({ incomes, totalIncome, recurringIncome, currentMonth, summary, user, prefsForm, onAddIncome, onEditBaseline, onOpenBudget, onEditIncome }) => {
    const sortedIncomes = [...(incomes || [])].sort((a, b) => incomeAmount(b) - incomeAmount(a));
    const salaryIncomes = sortedIncomes.filter((income) => {
        const hint = incomeHint(income);
        return hint.includes('salary') || hint.includes('employ') || hint.includes('payroll') || hint.includes('paye') || hint.includes('wage');
    });
    const investmentIncomes = sortedIncomes.filter((income) => {
        const hint = incomeHint(income);
        return hint.includes('dividend') || hint.includes('interest') || hint.includes('t-bill') || hint.includes('treasury') || hint.includes('bond') || hint.includes('invest');
    });
    const primarySalaryIncome = salaryIncomes[0] || sortedIncomes[0] || null;
    const hasEmploymentDetails = Boolean(
        primarySalaryIncome
        || user?.profile?.job_title
        || user?.profile?.years_employed
        || totalIncome
    );
    const primarySalary = incomeAmount(primarySalaryIncome);
    const sideIncomeTotal = Math.max(sortedIncomes.reduce((sum, income) => sum + incomeAmount(income), 0) - primarySalary, 0);
    const investmentIncomeTotal = investmentIncomes.reduce((sum, income) => sum + incomeAmount(income), 0);
    const displayedTotal = Number(currentMonth?.total_income || totalIncome || primarySalary || 0);
    const savingsRate = Math.round(Number(currentMonth?.savings_rate || 0));
    const needsPercent = Math.min(65, Math.round(Math.max(0, 100 - savingsRate) * 0.62));
    const wantsPercent = Math.max(0, 100 - savingsRate - needsPercent);
    const savingsPercent = Math.max(0, savingsRate);
    const needsAmount = Math.round((displayedTotal * needsPercent) / 100);
    const wantsAmount = Math.round((displayedTotal * wantsPercent) / 100);
    const savingsAmount = Math.round((displayedTotal * savingsPercent) / 100);
    const sourceRows = [
        primarySalaryIncome ? {
            icon: Briefcase,
            title: primarySalaryIncome.source || primarySalaryIncome.description || 'Primary Salary',
            note: `${primarySalaryIncome.category_name || 'Primary income'} · ${incomeNote(primarySalaryIncome)}`,
            amount: fmtKES(primarySalary),
            subnote: primarySalaryIncome.is_recurring ? 'Monthly net' : 'Current entry',
            accent: 'text-[#1f7f63]',
            bg: 'bg-[#eef8f4]',
            income: primarySalaryIncome,
        } : null,
        sideIncomeTotal > 0 ? {
            icon: WalletCards,
            title: 'Side Income',
            note: 'Freelance, business, and other extra income',
            amount: fmtKES(sideIncomeTotal),
            subnote: 'Monthly average',
            accent: 'text-[#df8a11]',
            bg: 'bg-[#fff6e7]',
            income: sortedIncomes.find((income) => income.uuid !== primarySalaryIncome?.uuid) || null,
        } : null,
        investmentIncomeTotal > 0 ? {
            icon: BarChart3,
            title: 'Investment Returns',
            note: 'Dividends, interest, and treasury income',
            amount: fmtKES(investmentIncomeTotal),
            subnote: 'Monthly estimate',
            accent: 'text-[#2f74db]',
            bg: 'bg-[#eef4ff]',
            income: investmentIncomes[0] || null,
        } : null,
    ].filter(Boolean);
    const topRows = sourceRows.length ? sourceRows : sortedIncomes.slice(0, 3).map((income, index) => ({
        icon: index === 0 ? Briefcase : index === 1 ? WalletCards : BarChart3,
        title: income.description || income.source || `Income ${index + 1}`,
        note: `${income.category_name || 'Tracked source'} · ${incomeNote(income)}`,
        amount: fmtKES(incomeAmount(income)),
        subnote: income.is_recurring ? 'Monthly equivalent' : 'Recorded amount',
        accent: index === 1 ? 'text-[#df8a11]' : index === 2 ? 'text-[#2f74db]' : 'text-[#1f7f63]',
        bg: index === 1 ? 'bg-[#fff6e7]' : index === 2 ? 'bg-[#eef4ff]' : 'bg-[#eef8f4]',
        income,
    }));
    const incomeMix = [
        { label: 'Primary Salary', percent: displayedTotal > 0 ? Math.round((primarySalary / displayedTotal) * 100) : 0, color: '#1f7f63' },
        { label: 'Side Income', percent: displayedTotal > 0 ? Math.round((sideIncomeTotal / displayedTotal) * 100) : 0, color: '#46b78f' },
        { label: 'Investments', percent: displayedTotal > 0 ? Math.round((investmentIncomeTotal / displayedTotal) * 100) : 0, color: '#3b82f6' },
        { label: 'Recurring', percent: displayedTotal > 0 ? Math.round((Number(recurringIncome || 0) / displayedTotal) * 100) : 0, color: '#7b61d9' },
        { label: 'Flexible', percent: displayedTotal > 0 ? Math.max(0, 100 - Math.round((Number(recurringIncome || 0) / displayedTotal) * 100) - Math.round((investmentIncomeTotal / displayedTotal) * 100)) : 0, color: '#ef4444' },
    ];

    return (
        <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <IncomeMetricCard label="Total Monthly Income" value={fmtKES(displayedTotal)} subtitle={currentMonth?.period_display || 'Current period'} featured />
                <IncomeMetricCard label="Primary Salary" value={fmtKES(primarySalary)} subtitle={primarySalaryIncome ? 'Net of PAYE' : 'Add salary income'} />
                <IncomeMetricCard label="Side Income" value={fmtKES(sideIncomeTotal)} subtitle={sideIncomeTotal > 0 ? 'Freelance / other' : 'Add extra income'} />
                <IncomeMetricCard label="Savings Rate" value={`${savingsRate}%`} subtitle={savingsRate >= 20 ? 'Goal achieved' : 'Goal: 20%'} accent="text-[#7a57d1]" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.1fr)]">
                <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e7] text-[#9a6200]">
                            <Wallet size={18} />
                        </div>
                        <p className="text-[1.45rem] font-bold tracking-tight text-slate-950">Income Sources</p>
                    </div>
                    <div className="mt-5 space-y-1">
                        {topRows.map((row) => (
                            <IncomeSourceRow key={`${row.title}-${row.amount}`} {...row} onEdit={row.income ? () => onEditIncome(row.income) : undefined} />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={onAddIncome}
                        className="mt-5 flex w-full items-center justify-center rounded-[1.1rem] border border-dashed border-[#b7ddd0] bg-[#fbfffd] px-4 py-4 text-[#166a55] transition-colors hover:bg-[#f4fbf7]"
                    >
                        <span className="text-base font-semibold">+ Add Another Income Source</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onEditIncome(primarySalaryIncome || sortedIncomes[0] || null)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-[#eef8f4] px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#e5f5ee]"
                    >
                        <Pencil size={15} className="text-[#9a6200]" />
                        Review Income Entries
                    </button>
                </article>

                <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e7] text-[#9a6200]">
                            <Briefcase size={18} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-[1.45rem] font-bold tracking-tight text-slate-950">Employment Details</p>
                            <span className="rounded-full bg-[#fff6e7] px-3 py-1 text-xs font-semibold text-[#9a6200]">Optional</span>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                        Add these details only if you want to give your dashboard more context for salary-based planning.
                    </p>
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <Datum label="Employment status" value={primarySalaryIncome ? 'Income Sources Active' : 'Optional to add'} />
                        <Datum label="Employer" value={primarySalaryIncome?.source || primarySalaryIncome?.description || 'Not added yet'} />
                        <Datum label="Job title" value={user?.profile?.job_title || primarySalaryIncome?.category_name || 'Not added yet'} />
                        <Datum label="Years employed" value={user?.profile?.years_employed || 'Not added yet'} />
                        <Datum label="Default currency" value={`${summary?.currency || 'KES'} - Kenyan Shilling`} />
                        <Datum label="Weekly summary" value={prefsForm.receive_weekly_summary ? 'Enabled' : 'Disabled'} />
                        <Datum label="Gross monthly salary" value={fmtKES(displayedTotal)} />
                        <Datum label="PAYE (estimated)" value={estimatePAYE(primarySalary) ? fmtKES(estimatePAYE(primarySalary)) : 'Not available yet'} />
                    </div>
                    <button
                        type="button"
                        onClick={onEditBaseline}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#f0d39a] bg-[#fff6e7] px-4 py-3 text-sm font-semibold text-[#9a6200] transition-colors hover:bg-[#fff0d8]"
                    >
                        <Pencil size={15} />
                        {hasEmploymentDetails ? 'Edit Employment Details' : 'Add Employment Details'}
                    </button>
                </article>
            </div>

            <article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2f74db]">
                        <BarChart3 size={18} />
                    </div>
                    <p className="text-[1.45rem] font-bold tracking-tight text-slate-950">Income & Allocation Breakdown</p>
                </div>
                <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
                    <div className="space-y-4">
                        <p className="text-lg font-semibold text-slate-900">Your income mix this month</p>
                        <div className="space-y-3">
                            {incomeMix.map((item) => <AllocationBarRow key={item.label} label={item.label} percent={item.percent} color={item.color} />)}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-lg font-semibold text-slate-900">50/30/20 Rule Health Check</p>
                        <RuleHealthCard
                            title="Needs (50%)"
                            status={needsPercent <= 50 ? ' - On Track' : ' - Watch Level'}
                            amount={fmtKES(needsAmount)}
                            target={fmtKES(Math.round(displayedTotal * 0.5))}
                            note={needsPercent <= 50 ? '' : 'A tighter budget can create more breathing room.'}
                            tone={needsPercent <= 50 ? 'border-[#1f9c72] bg-[#edf8f3] text-[#166a55]' : 'border-[#df8a11] bg-[#fff6e7] text-[#9a6200]'}
                        />
                        <RuleHealthCard
                            title="Wants (30%)"
                            status={wantsPercent <= 30 ? ' - On Track' : ' - Review'}
                            amount={fmtKES(wantsAmount)}
                            target={fmtKES(Math.round(displayedTotal * 0.3))}
                            note={wantsPercent <= 30 ? '' : 'You may want to trim flexible spending next month.'}
                            tone={wantsPercent <= 30 ? 'border-[#1f9c72] bg-[#edf8f3] text-[#166a55]' : 'border-[#df8a11] bg-[#fff6e7] text-[#9a6200]'}
                        />
                        <RuleHealthCard
                            title="Savings (20%)"
                            status={savingsPercent >= 20 ? ' - Healthy' : ' - Nearly There'}
                            amount={fmtKES(savingsAmount)}
                            target={fmtKES(Math.round(displayedTotal * 0.2))}
                            note={savingsPercent >= 20 ? 'Your savings pace is in a strong place.' : `Add ${fmtKES(Math.max(Math.round(displayedTotal * 0.2) - savingsAmount, 0))} to hit 20%.`}
                            tone={savingsPercent >= 20 ? 'border-[#1f9c72] bg-[#edf8f3] text-[#166a55]' : 'border-[#df8a11] bg-[#fff6e7] text-[#9a6200]'}
                        />
                        <button
                            type="button"
                            onClick={onOpenBudget}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-[#eef8f4] px-4 py-3 text-sm font-semibold text-[#166a55] transition-colors hover:bg-[#e5f5ee]"
                        >
                            <BarChart3 size={16} />
                            Open Full Budget Planner
                        </button>
                    </div>
                </div>
            </article>
        </section>
    );
};

const UserProfilePanel = ({ initialTab, onSelectSection }) => {
    const { categories, incomes, summary, loading: incomeLoading, error: incomeError, fetchIncomes, fetchSummary, deleteIncome, createCategory, addQuickIncome } = useIncome();
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(readWorkspace);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab || 'goals');
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showQuickIncome, setShowQuickIncome] = useState(false);
    const [editingBaseline, setEditingBaseline] = useState(false);
    const [editingDependents, setEditingDependents] = useState(false);
    const [editingDependantIndex, setEditingDependantIndex] = useState(-1);
    const [editingPrefs, setEditingPrefs] = useState(false);
    const [goalModalOpen, setGoalModalOpen] = useState(false);
    const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
    const [baselineForm, setBaselineForm] = useState({ monthly_income: '' });
    const [dependantsForm, setDependantsForm] = useState(EMPTY_DEPENDANT_FORM);
    const [prefsForm, setPrefsForm] = useState({ receive_notifications: true, receive_weekly_summary: true });
    const [goalForm, setGoalForm] = useState({ selectedType: 'short', slotIndex: 0, name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' });
    const [preferencesForm, setPreferencesForm] = useState({ primary_financial_goal: '', riskAppetite: 'Moderate', investmentHorizon: '5-10 Years', preferredProducts: 'T-Bills, MMFs, NSE Equities', financialMotivation: '' });
    const [preferredName, setPreferredName] = useState(getStoredPreferredName);
    const [preferredNameSaved, setPreferredNameSaved] = useState(() => Boolean(getStoredPreferredName().trim()));
    const [submitting, setSubmitting] = useState({ baseline: false, goal: false, dependents: false, prefs: false, preferencesModal: false, preferredName: false });

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const acct = await getUserAccount();
                const ws = readWorkspace();
                const accountPreferredName = getBackendPreferredName(acct) || getStoredPreferredName();
                setUser(acct);
                syncStoredPreferredNameFromUser(acct);
                setPreferredName(accountPreferredName);
                setPreferredNameSaved(Boolean(accountPreferredName.trim()));
                setWorkspace(ws);
                setBaselineForm({ monthly_income: acct?.profile?.monthly_income || '' });
                setDependantsForm({ ...EMPTY_DEPENDANT_FORM });
                setEditingDependents(false);
                setEditingDependantIndex(-1);
                setPrefsForm({ receive_notifications: acct?.profile?.receive_notifications ?? true, receive_weekly_summary: acct?.profile?.receive_weekly_summary ?? true });
                setPreferencesForm({
                    primary_financial_goal: acct?.profile?.primary_financial_goal || '',
                    riskAppetite: ws.riskAppetite || defaults.riskAppetite,
                    investmentHorizon: ws.investmentHorizon || defaults.investmentHorizon,
                    preferredProducts: ws.preferredProducts || defaults.preferredProducts,
                    financialMotivation: ws.financialMotivation || defaults.financialMotivation,
                });
            } catch (err) {
                setError(err.message || 'We could not load your account workspace right now.');
            } finally {
                setLoading(false);
            }
        };
        load();
        fetchIncomes({ current_month: 'true' });
        fetchSummary();
    }, [fetchIncomes, fetchSummary]);

    const incomeValue = useMemo(() => resolvedIncome(summary, user?.profile?.monthly_income), [summary, user?.profile?.monthly_income]);
    const currentMonth = summary?.current_month || {};
    const goalBuckets = useMemo(() => (
        Object.entries(GOAL_META).map(([type, meta]) => {
            const slots = getGoalSlots(workspace, meta);
            return {
                type,
                meta,
                slots,
                goals: slots
                    .map((goal, index) => ({ ...goal, slotIndex: index, slotLabel: GOAL_SLOT_LABELS[index] }))
                    .filter(goalHasContent),
            };
        })
    ), [workspace]);
    const goalBucketByType = useMemo(() => Object.fromEntries(goalBuckets.map((bucket) => [bucket.type, bucket])), [goalBuckets]);
    const goalCount = goalBuckets.reduce((sum, bucket) => sum + bucket.goals.length, 0);
    const dependants = useMemo(() => Array.isArray(workspace.dependants) ? workspace.dependants : [], [workspace.dependants]);
    const dependantsSummary = useMemo(() => buildDependantsSummary(dependants), [dependants]);
    const sections = useMemo(() => ([
        { id: 'income', label: 'Income', complete: Boolean(incomeValue) || incomes.length > 0 },
        { id: 'goals', label: 'Goals', complete: goalCount > 0 },
        { id: 'dependents', label: 'Dependants', complete: dependants.length > 0 },
    ]), [dependants.length, goalCount, incomeValue, incomes.length, user]);
    const validTabIds = tabs.map((tab) => tab.id);
    const completionChecks = [user?.first_name, incomeValue, goalCount > 0, dependants.length > 0, ...sections.map((s) => s.complete)];
    const completion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);
    const remaining = sections.filter((s) => !s.complete).length;
    const memberLabel = getMemberLabel(user);
    const memberInitials = getMemberInitials(user);
    const profileDisplayName = preferredNameSaved ? preferredName.trim() : getDashboardDisplayName(user);
    const profileGreeting = preferredNameSaved ? `Hello ${profileDisplayName}` : profileDisplayName;
    const dateLabel = useMemo(() => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);
    const profileIntro = 'Your money profile is the engine room. Finish the missing pieces so every planner can give you sharper guidance.';
    const dependantCount = dependantsSummary.totalPeople;
    const parentCount = dependantsSummary.parentCount;
    const siblingCount = dependantsSummary.siblingCount;
    const otherDependantsCount = dependantsSummary.otherCount;
    const totalDependantsSupport = dependantsSummary.totalMonthly;
    const estimatedProtectionCover = dependantCount > 0 ? dependantCount * 3800000 : 0;
    const estimatedEmergencyFund = dependantCount > 0 ? dependantCount * 190000 : 0;
    const ecosystemCards = [
        {
            title: 'Budget Planner',
            helper: 'Powered by your income & goals',
            icon: BarChart3,
            cta: 'Open',
            action: () => onSelectSection?.('budget'),
        },
        {
            title: 'Investment Planner',
            helper: 'Tailored to your risk appetite',
            icon: WalletCards,
            cta: 'Open',
            action: () => onSelectSection?.('investments'),
        },
        {
            title: 'Protection Planner',
            helper: 'Based on your dependants',
            icon: ShieldCheck,
            cta: 'Open',
            action: () => onSelectSection?.('protection'),
        },
        {
            title: 'Compare Hub',
            helper: 'Personalised product comparisons',
            icon: Wallet,
            cta: 'Open',
            action: () => onSelectSection?.('comparehub'),
        },
    ];
    useEffect(() => {
        if (initialTab) {
            setActiveTab(validTabIds.includes(initialTab) ? initialTab : 'goals');
            return;
        }
        setActiveTab('goals');
    }, [initialTab]);

    const patchUserProfile = (updated) => setUser((current) => ({ ...current, profile: { ...current?.profile, ...updated } }));
    const syncIncome = async () => { await Promise.all([fetchSummary(), fetchIncomes({ current_month: 'true' })]); };
    const resetDependantForm = () => {
        setDependantsForm({ ...EMPTY_DEPENDANT_FORM });
        setEditingDependantIndex(-1);
    };
    const openNewDependantForm = () => {
        resetDependantForm();
        setEditingDependents(true);
    };
    const openEditDependantForm = (index) => {
        const dependant = dependants[index];
        if (!dependant) return;

        setDependantsForm({
            relation: dependant.relation || '',
            number: String(dependant.number || '1'),
            benType: dependant.benType || '',
            amount: dependant.amount ? String(dependant.amount) : '',
            freq: dependant.freq || 'Monthly',
        });
        setEditingDependantIndex(index);
        setEditingDependents(true);
    };
    const closeDependantForm = () => {
        setEditingDependents(false);
        resetDependantForm();
    };
    const handleDependantFieldChange = (field, value) => {
        if (field === 'relation') {
            const suggestedCount = String(DEPENDANT_DEFAULT_COUNT[value] || 1);
            const suggestedBeneficiary = dependantSuggestedBeneficiary(value);
            setDependantsForm((current) => ({
                ...current,
                relation: value,
                number: suggestedCount,
                benType: suggestedBeneficiary || current.benType,
            }));
            return;
        }

        setDependantsForm((current) => ({ ...current, [field]: value }));
    };
    const savePreferredName = async (event) => {
        event.preventDefault();
        const nextPreferredName = normalizePreferredNameToFirstName(preferredName);
        if (!nextPreferredName) {
            setError('Please enter the name you prefer to be called.');
            return;
        }
        setSubmitting((current) => ({ ...current, preferredName: true }));
        setPreferredName(nextPreferredName);
        setStoredPreferredName(nextPreferredName);
        try {
            const updatedUser = await updatePreferredName(nextPreferredName);
            if (updatedUser?.email) {
                setUser(updatedUser);
                syncStoredPreferredNameFromUser(updatedUser);
            }
            setPreferredNameSaved(Boolean(nextPreferredName));
            setSuccess('Preferred name saved. Your dashboard will now address you by that name.');
        } catch (err) {
            setPreferredNameSaved(Boolean(nextPreferredName));
            setSuccess('Preferred name saved on this device. It will sync across devices after backend profile support is deployed.');
        } finally {
            setSubmitting((current) => ({ ...current, preferredName: false }));
        }
    };
    const getNextGoalSlotIndex = (type) => {
        const slots = goalBucketByType[type]?.slots || [];
        const emptyIndex = slots.findIndex((goal) => !goalHasContent(goal));
        return emptyIndex === -1 ? 0 : emptyIndex;
    };

    const openGoalModal = (type = 'short', slotIndex = 0) => {
        const meta = GOAL_META[type];
        const details = getGoalSlots(workspace, meta)[slotIndex] || EMPTY_GOAL_DETAILS;
        setGoalForm({
            selectedType: type,
            slotIndex,
            name: details.name || '',
            targetAmount: details.targetAmount || '',
            currentSavings: details.currentSavings || '',
            targetDate: details.targetDate || '',
            monthlyContribution: details.monthlyContribution || '',
            linkedProduct: details.linkedProduct || '',
        });
        setGoalModalOpen(true);
    };

    const saveBaseline = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, baseline: true }));
            setError('');
            setSuccess('');
            const updated = await updateUserPreferences({ monthly_income: baselineForm.monthly_income || null, receive_notifications: user?.profile?.receive_notifications ?? true, receive_weekly_summary: user?.profile?.receive_weekly_summary ?? true, primary_financial_goal: user?.profile?.primary_financial_goal || null });
            const incoming = Number(baselineForm.monthly_income || 0);
            const managerIncome = Number(summary?.total_income ?? summary?.monthly_income ?? summary?.current_month?.total_income ?? 0);
            if (incoming > 0 && managerIncome <= 0) {
                let cat = categories?.[0];
                if (!cat) cat = await createCategory({ name: 'Salary' }).catch(() => null);
                const category = cat?.uuid || cat?.id || cat?.data?.uuid || cat?.data?.id;
                if (category) {
                    await addQuickIncome({ category, amount: incoming, description: 'Monthly income baseline', source: 'Profile setup', income_date: new Date().toISOString().split('T')[0], frequency: 'MONTHLY', is_recurring: true, status: 'RECEIVED', is_taxable: false, notes: 'Created from profile income setup' });
                }
            }
            await syncIncome();
            patchUserProfile(updated);
            setEditingBaseline(false);
            setSuccess('Income baseline updated.');
        } catch (err) {
            setError(err.message || 'We could not save your income baseline right now.');
        } finally {
            setSubmitting((s) => ({ ...s, baseline: false }));
        }
    };

    const saveGoalModal = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, goal: true }));
            setError('');
            setSuccess('');
            const meta = GOAL_META[goalForm.selectedType];
            const currentGoal = {
                name: goalForm.name,
                targetAmount: goalForm.targetAmount,
                currentSavings: goalForm.currentSavings,
                targetDate: goalForm.targetDate,
                monthlyContribution: goalForm.monthlyContribution,
                linkedProduct: goalForm.linkedProduct,
            };
            const nextSlots = getGoalSlots(workspace, meta).map((goal, index) => (
                index === goalForm.slotIndex ? currentGoal : goal
            ));
            const primaryGoal = nextSlots.find(goalHasContent) || EMPTY_GOAL_DETAILS;
            const next = {
                ...workspace,
                [meta.slotsKey]: nextSlots,
                [meta.key]: primaryGoal.name,
                [meta.detailKey]: primaryGoal,
            };
            writeWorkspace(next);
            setWorkspace(next);
            setGoalModalOpen(false);
            setSuccess(`${meta.label} ${GOAL_SLOT_LABELS[goalForm.slotIndex]} saved.`);
        } catch (err) {
            setError(err.message || 'We could not save your goal right now.');
        } finally {
            setSubmitting((s) => ({ ...s, goal: false }));
        }
    };

    const saveDependents = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, dependents: true }));
            setError('');
            setSuccess('');
            if (!dependantsForm.relation) {
                throw new Error('Please select a relation first.');
            }
            if (!dependantsForm.benType) {
                throw new Error('Please choose a beneficiary type.');
            }

            const nowLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const nextEntry = {
                relation: dependantsForm.relation,
                number: Number(dependantsForm.number || 1),
                benType: dependantsForm.benType,
                amount: Number(dependantsForm.amount || 0),
                freq: dependantsForm.freq || 'Monthly',
                category: dependantCategory(dependantsForm.relation),
                updatedAt: nowLabel,
            };
            const nextDependants = editingDependantIndex >= 0
                ? dependants.map((dependant, index) => (index === editingDependantIndex ? nextEntry : dependant))
                : [...dependants, nextEntry];
            const nextSummary = buildDependantsSummary(nextDependants);
            const next = {
                ...workspace,
                dependants: nextDependants,
                dependentsCount: String(nextSummary.totalPeople),
            };
            writeWorkspace(next);
            setWorkspace(next);
            closeDependantForm();
            setSuccess(editingDependantIndex >= 0 ? 'Dependant updated successfully.' : 'Dependant added successfully.');
        } catch (err) {
            setError(err.message || 'We could not save your dependant details right now.');
        } finally {
            setSubmitting((s) => ({ ...s, dependents: false }));
        }
    };
    const removeDependant = (index) => {
        const nextDependants = dependants.filter((_, dependantIndex) => dependantIndex !== index);
        const nextSummary = buildDependantsSummary(nextDependants);
        const next = {
            ...workspace,
            dependants: nextDependants,
            dependentsCount: String(nextSummary.totalPeople),
        };
        writeWorkspace(next);
        setWorkspace(next);
        if (editingDependantIndex === index) {
            closeDependantForm();
        }
        setSuccess('Dependant removed.');
    };

    const savePrefs = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, prefs: true }));
            setError('');
            setSuccess('');
            const updated = await updateUserPreferences({ monthly_income: user?.profile?.monthly_income || null, primary_financial_goal: user?.profile?.primary_financial_goal || null, receive_notifications: prefsForm.receive_notifications, receive_weekly_summary: prefsForm.receive_weekly_summary });
            patchUserProfile(updated);
            setEditingPrefs(false);
            setSuccess('Security preferences updated.');
        } catch (err) {
            setError(err.message || 'We could not save your preferences right now.');
        } finally {
            setSubmitting((s) => ({ ...s, prefs: false }));
        }
    };

    const savePreferencesModal = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, preferencesModal: true }));
            setError('');
            setSuccess('');
            const updated = await updateUserPreferences({ monthly_income: user?.profile?.monthly_income || null, receive_notifications: user?.profile?.receive_notifications ?? true, receive_weekly_summary: user?.profile?.receive_weekly_summary ?? true, primary_financial_goal: preferencesForm.primary_financial_goal || null });
            const next = {
                ...workspace,
                riskAppetite: preferencesForm.riskAppetite,
                investmentHorizon: preferencesForm.investmentHorizon,
                preferredProducts: preferencesForm.preferredProducts,
                financialMotivation: preferencesForm.financialMotivation,
            };
            writeWorkspace(next);
            setWorkspace(next);
            patchUserProfile(updated);
            setPreferencesModalOpen(false);
            setSuccess('Primary goal and preferences updated.');
        } catch (err) {
            setError(err.message || 'We could not save your preferences right now.');
        } finally {
            setSubmitting((s) => ({ ...s, preferencesModal: false }));
        }
    };

    const selectedGoalMeta = GOAL_META[goalForm.selectedType] || GOAL_META.short;
    const selectedGoalSlots = getGoalSlots(workspace, selectedGoalMeta);
    const selectedGoalNameOptions = getGoalNameOptions(goalForm.selectedType, goalForm.name);

    if (loading) {
        return <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"><div className="text-center"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" /><p className="mt-4 text-sm font-medium text-slate-600">Loading your profile workspace...</p></div></div>;
    }

    return (
        <div className="space-y-6">
            {(error || incomeError) && <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm"><div className="flex items-start gap-3"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">We could not finish that update.</p><p className="mt-1">{error || incomeError}</p></div></div></div>}
            {success && <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-primary-800 shadow-sm">{success}</div>}

            <MobileProfileWorkspace
                activeTab={activeTab}
                completion={completion}
                dateLabel={dateLabel}
                dependants={dependants}
                dependantsSummary={dependantsSummary}
                goalBucketByType={goalBucketByType}
                goalBuckets={goalBuckets}
                goalCount={goalCount}
                incomeValue={incomeValue}
                incomes={incomes}
                memberInitials={memberInitials}
                onAddDependant={openNewDependantForm}
                onAddIncome={() => { setSelectedIncome(null); setShowIncomeForm(true); }}
                onEditDependant={openEditDependantForm}
                onEditIncome={(income) => { setSelectedIncome(income || null); setShowIncomeForm(true); }}
                onOpenGoal={(type, slotIndex) => openGoalModal(type, typeof slotIndex === 'number' ? slotIndex : getNextGoalSlotIndex(type))}
                onQuickAddIncome={() => setShowQuickIncome(true)}
                onRemoveDependant={removeDependant}
                onSelectTab={setActiveTab}
                profileGreeting={profileGreeting}
                profileIntro={profileIntro}
                remaining={remaining}
                totalDependantsSupport={totalDependantsSupport}
            />

            <div className="hidden space-y-6 lg:block">
            <section className="relative overflow-hidden rounded-[1.35rem] bg-primary-600 p-4 text-white shadow-[0_16px_48px_rgba(15,23,42,0.12)] sm:p-5">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(240,201,77,0.14),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_30%)]" />
                <div className="relative">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                        <div className="min-w-0">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#d89f2f_0%,_#f0c94d_100%)] text-2xl font-extrabold text-slate-950 ring-2 ring-white/20 shadow-lg shadow-slate-950/20 sm:h-16 sm:w-16">
                                    {memberInitials}
                                </div>
                                <div className="min-w-0 pt-0.5">
                                    <h2 className="truncate text-[1.65rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2rem]">{profileGreeting}</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/82 sm:text-[0.95rem]">{profileIntro}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 lg:items-end">
                            <div className="inline-flex self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm lg:self-end">
                                {dateLabel}
                            </div>
                            <div className="w-full rounded-[1rem] border border-white/15 bg-slate-950/20 px-4 py-3 backdrop-blur-sm lg:w-[210px]">
                                <p className="text-right text-[1.8rem] font-extrabold leading-none text-[#F0C94D]">{completion}%</p>
                                <p className="mt-1 text-right text-xs font-medium text-white/90">Profile Complete</p>
                                <div className="mt-2 h-1.5 rounded-full bg-white/18">
                                    <div className="h-1.5 rounded-full bg-[#F0C94D] transition-all" style={{ width: `${completion}%` }} />
                                </div>
                                <p className="mt-2 text-right text-[11px] text-white/75">{remaining > 0 ? `${remaining} sections remaining` : 'Profile setup looks strong'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {!preferredNameSaved && (
                <PreferredNameCard
                    memberLabel={memberLabel}
                    preferredName={preferredName}
                    saving={submitting.preferredName}
                    onChange={setPreferredName}
                    onSave={savePreferredName}
                />
            )}

            <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-2 shadow-sm"><div className="flex flex-wrap gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all ${activeTab === id ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' : 'text-slate-600 hover:bg-[#f4faf7] hover:text-slate-950'}`}><Icon size={16} />{label}</button>)}</div></section>

            {activeTab === 'goals' && <section className="space-y-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Active Goals" value={String(goalCount)} subtitle="Goal slots filled" accent="bg-primary-600" dark compact onClick={() => openGoalModal(goalForm.selectedType || 'short', getNextGoalSlotIndex(goalForm.selectedType || 'short'))} /><GoalActionCard label="Short-Term Goals" helper={`${goalBucketByType.short?.goals.length || 0}/3 goals filled`} color="bg-[#37c837]" active={(goalBucketByType.short?.goals.length || 0) > 0} onClick={() => openGoalModal('short', getNextGoalSlotIndex('short'))} /><GoalActionCard label="Medium-Term Goals" helper={`${goalBucketByType.medium?.goals.length || 0}/3 goals filled`} color="bg-[#f6da1a]" active={(goalBucketByType.medium?.goals.length || 0) > 0} onClick={() => openGoalModal('medium', getNextGoalSlotIndex('medium'))} /><GoalActionCard label="Long-Term Goals" helper={`${goalBucketByType.long?.goals.length || 0}/3 goals filled`} color="bg-[#8a63df]" active={(goalBucketByType.long?.goals.length || 0) > 0} onClick={() => openGoalModal('long', getNextGoalSlotIndex('long'))} /></div>{goalBuckets.map(({ type, meta, slots }) => <GoalBucketSection key={type} title={meta.label} helper={meta.helper} meta={meta} slots={slots} onAdd={(slotIndex) => openGoalModal(type, slotIndex)} onEdit={(slotIndex) => openGoalModal(type, slotIndex)} />)}</section>}

            {activeTab === 'income' && <section className="space-y-5"><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm text-slate-600">Capture your income baseline, manage current sources, and keep your planning inputs fresh.</p></div><div className="flex flex-wrap gap-3"><SecondaryButton type="button" onClick={() => setShowQuickIncome(true)}>Quick Add</SecondaryButton><PrimaryButton type="button" onClick={() => { setSelectedIncome(null); setShowIncomeForm(true); }}>Add Income</PrimaryButton></div></div></article><ProfileIncomeOverview incomes={incomes} totalIncome={incomeValue} recurringIncome={summary?.monthly_recurring_income} currentMonth={currentMonth} summary={summary} user={user} prefsForm={prefsForm} onAddIncome={() => { setSelectedIncome(null); setShowIncomeForm(true); }} onEditBaseline={() => setEditingBaseline(true)} onOpenBudget={() => onSelectSection?.('budget')} onEditIncome={(income) => { setSelectedIncome(income || null); setShowIncomeForm(true); }} /><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div><p className="text-lg font-bold text-slate-950">Recent income activity</p><p className="mt-1 text-sm text-slate-600">Returning users can adjust, tidy, or add new income without leaving the profile workspace.</p></div><div className="mt-5"><IncomeList incomes={incomes.slice(0, 6)} loading={incomeLoading} onEdit={(income) => { setSelectedIncome(income); setShowIncomeForm(true); }} onDelete={deleteIncome} currency={summary?.currency || 'KES'} /></div></article><ProfileEcosystemSection ecosystemCards={ecosystemCards} /></section>}

            {activeTab === 'dependents' && (
                <section className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <DependantsSummaryCard value={dependantCount} label="Total Dependants" />
                        <DependantsSummaryCard value={parentCount} label="Parents" />
                        <DependantsSummaryCard value={siblingCount} label="Siblings" />
                        <DependantsSummaryCard value={otherDependantsCount} label="Other Dependants" />
                    </div>

                    <article className="space-y-5">
                        <DependantsSectionHeader
                            summaryLabel={dependants.length > 0 ? `Supporting ${dependantCount} ${dependantCount === 1 ? 'person' : 'people'} · ${formatKESValue(Math.round(totalDependantsSupport), 'KES 0')}/mo total` : 'No dependants added yet'}
                            onAdd={openNewDependantForm}
                        />

                        {editingDependents && (
                            <DependantsFormPanel
                                form={dependantsForm}
                                onChange={handleDependantFieldChange}
                                onSave={saveDependents}
                                onCancel={closeDependantForm}
                                isSaving={submitting.dependents}
                                isEditing={editingDependantIndex >= 0}
                            />
                        )}

                        {dependants.length > 0 ? (
                            <>
                                <DependantsTable
                                    dependants={dependants}
                                    totalMonthly={totalDependantsSupport}
                                    onEdit={openEditDependantForm}
                                    onDelete={removeDependant}
                                />
                            </>
                        ) : (
                            <button type="button" onClick={openNewDependantForm} className="block w-full text-left">
                                <DependantsEmptyState />
                            </button>
                        )}
                    </article>

                    <article className="overflow-hidden rounded-[1.5rem] bg-[#1f9c72] p-5 text-white shadow-[0_18px_40px_rgba(31,156,114,0.22)]">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/95 text-[#1f9c72] shadow-sm">
                                <LinkIcon size={18} />
                            </div>
                            <p className="text-[1.4rem] font-extrabold tracking-tight">See How Your Family Profile Shapes Your Planning</p>
                        </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <PlanningImpactCard icon={BarChart3} title="Emergency Fund Target" body={dependantCount > 0 ? `With ${dependantCount} dependants, your recommended emergency fund is about ${fmtKES(estimatedEmergencyFund)}.` : 'Your emergency fund target becomes clearer once household size is added.'} badge={goalCount > 0 ? 'Goal set in profile' : 'Update goal'} badgeTone="bg-[#e7f6f1] text-[#166a55]" cta="View Planner" onClick={() => setActiveTab('goals')} />
                            <PlanningImpactCard icon={ShieldCheck} title="Protection Planner" body={dependantCount > 0 ? `With ${dependantCount} dependants, your recommended life cover starts around ${fmtKES(estimatedProtectionCover)}.` : 'Add dependants to estimate the right cover for your household.'} badge={dependantCount > 0 ? `Cover target: ${fmtKES(estimatedProtectionCover)}` : 'Awaiting dependant details'} badgeTone={dependantCount > 0 ? 'bg-[#ffe8e8] text-[#d94d4d]' : 'bg-[#eef8f4] text-[#166a55]'} cta="View Planner" onClick={() => onSelectSection?.('protection')} />
                            <PlanningImpactCard icon={WalletCards} title="Investment Planner" body={dependantCount > 0 ? `Your investment plan should keep enough liquidity for ${dependantCount} ${dependantCount === 1 ? 'dependant' : 'dependants'} while still growing long-term wealth.` : 'Add dependants to balance growth goals with family support needs.'} badge={dependantCount > 0 ? 'Liquidity in focus' : 'Add dependants first'} badgeTone="bg-[#eef4ff] text-[#2f74db]" cta="View Planner" onClick={() => onSelectSection?.('investments')} />
                            <PlanningImpactCard icon={Wallet} title="Retirement Planner" body={dependantCount > 0 ? `Supporting ${dependantCount} people in retirement means your income plan needs a stronger buffer and clearer milestones.` : 'Household details help shape a more realistic retirement target.'} badge={dependantCount > 0 ? 'Family target in focus' : 'Add dependants first'} badgeTone="bg-[#fff6e7] text-[#9a6200]" cta="View Planner" onClick={() => onSelectSection?.('retirement')} />
                        </div>
                    </article>
                </section>
            )}
            </div>

            {goalModalOpen && <ModalShell title={`${selectedGoalMeta.label} Goal`} icon={Target} onClose={() => setGoalModalOpen(false)}><form onSubmit={saveGoalModal} className="space-y-4 sm:space-y-5"><div><p className="text-sm font-medium text-slate-700">Choose goal slot</p><div className="mt-3 grid gap-2 sm:gap-3 md:grid-cols-3">{GOAL_SLOT_LABELS.map((label, index) => <GoalTypeCard key={label} active={goalForm.slotIndex === index} label={label} helper={selectedGoalMeta.helper} color={selectedGoalMeta.color} onClick={() => { const nextSlot = selectedGoalSlots[index] || EMPTY_GOAL_DETAILS; setGoalForm((current) => ({ ...current, slotIndex: index, name: nextSlot.name || '', targetAmount: nextSlot.targetAmount || '', currentSavings: nextSlot.currentSavings || '', targetDate: nextSlot.targetDate || '', monthlyContribution: nextSlot.monthlyContribution || '', linkedProduct: nextSlot.linkedProduct || '' })); }} />)}</div></div><div className="grid gap-3 sm:gap-4 md:grid-cols-2"><Select label="Goal Name" value={goalForm.name} onChange={(e) => setGoalForm((current) => ({ ...current, name: e.target.value }))}><option value="">Select a goal name</option>{selectedGoalNameOptions.map((goalName) => <option key={goalName} value={goalName}>{goalName}</option>)}</Select><Input label="Target Amount (KES)" value={goalForm.targetAmount} onChange={(e) => setGoalForm((current) => ({ ...current, targetAmount: e.target.value }))} placeholder="e.g. 100,000" /><Input label="Current Savings (KES)" value={goalForm.currentSavings} onChange={(e) => setGoalForm((current) => ({ ...current, currentSavings: e.target.value }))} placeholder="e.g. 25,000" /><Input label="Target Date" type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm((current) => ({ ...current, targetDate: e.target.value }))} /><Input label="Monthly Contribution (KES)" value={goalForm.monthlyContribution} onChange={(e) => setGoalForm((current) => ({ ...current, monthlyContribution: e.target.value }))} placeholder="e.g. 5,000" /></div><Select label="Link to Product (Optional)" value={goalForm.linkedProduct} onChange={(e) => setGoalForm((current) => ({ ...current, linkedProduct: e.target.value }))}><option value="">-- Select a savings vehicle --</option><option value="MMF">Money Market Fund</option><option value="SACCO">SACCO</option><option value="Savings Account">Savings Account</option><option value="Fixed Deposit">Fixed Deposit</option></Select><div className="flex flex-col gap-3 pt-1 sm:flex-row sm:pt-2"><SecondaryButton type="button" className="sm:min-w-[112px]" onClick={() => setGoalModalOpen(false)}>Cancel</SecondaryButton><PrimaryButton type="submit" className="flex-1" disabled={submitting.goal}>{submitting.goal ? 'Saving...' : `Save ${GOAL_SLOT_LABELS[goalForm.slotIndex]}`}</PrimaryButton></div></form></ModalShell>}

            {preferencesModalOpen && <ModalShell title="Primary Goal & Preferences" icon={Wallet} onClose={() => setPreferencesModalOpen(false)}><form onSubmit={savePreferencesModal} className="space-y-4 sm:space-y-5"><Select label="Primary Financial Goal" value={preferencesForm.primary_financial_goal} onChange={(e) => setPreferencesForm((current) => ({ ...current, primary_financial_goal: e.target.value }))}><option value="">Select a goal</option><option value="SAVE_EMERGENCY">Save & Invest</option><option value="PAY_DEBT">Pay Off Debt</option><option value="SAVE_INVEST">Save and Invest</option><option value="BUDGET_BETTER">Budget Better</option><option value="RETIREMENT">Retirement</option><option value="OTHER">Other</option></Select><div className="grid gap-3 sm:gap-4 md:grid-cols-2"><Select label="Risk Appetite" value={preferencesForm.riskAppetite} onChange={(e) => setPreferencesForm((current) => ({ ...current, riskAppetite: e.target.value }))}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></Select><Select label="Investment Horizon" value={preferencesForm.investmentHorizon} onChange={(e) => setPreferencesForm((current) => ({ ...current, investmentHorizon: e.target.value }))}><option>Under 12 months</option><option>1-5 Years</option><option>5-10 Years</option><option>10+ Years</option></Select></div><Input label="Preferred Products" value={preferencesForm.preferredProducts} onChange={(e) => setPreferencesForm((current) => ({ ...current, preferredProducts: e.target.value }))} /><TextArea label="Financial Motivation (Optional)" rows={4} value={preferencesForm.financialMotivation} onChange={(e) => setPreferencesForm((current) => ({ ...current, financialMotivation: e.target.value }))} /><div className="flex flex-col gap-3 pt-1 sm:flex-row sm:pt-2"><SecondaryButton type="button" className="sm:min-w-[112px]" onClick={() => setPreferencesModalOpen(false)}>Cancel</SecondaryButton><PrimaryButton type="submit" className="flex-1" disabled={submitting.preferencesModal}>{submitting.preferencesModal ? 'Saving...' : 'Save Changes'}</PrimaryButton></div></form></ModalShell>}

            {showIncomeForm && <IncomeForm income={selectedIncome} onClose={() => { setSelectedIncome(null); setShowIncomeForm(false); }} onSuccess={async () => { await syncIncome(); setSuccess('Income manager updated.'); }} />}
            <QuickIncomeModal isOpen={showQuickIncome} onClose={() => setShowQuickIncome(false)} />
            <DashboardOverviewFooter onSelectSection={onSelectSection} />
        </div>
    );
};

export default UserProfilePanel;
