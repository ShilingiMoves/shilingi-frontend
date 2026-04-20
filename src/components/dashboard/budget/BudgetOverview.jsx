import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    BadgeDollarSign,
    BarChart3,
    CalendarDays,
    Check,
    ChevronDown,
    Flame,
    GraduationCap,
    HeartHandshake,
    Home,
    Landmark,
    Lightbulb,
    Pencil,
    PiggyBank,
    Plus,
    Receipt,
    Rocket,
    ShieldCheck,
    ShoppingBasket,
    Sparkles,
    Swords,
    Target,
    TrendingUp,
    Wallet,
    X,
    Zap,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';
import { createExpense, getCategories } from '../../../services/budgetApi';

const budgetModels = [
    { id: 'classic', label: '50/30/20 Classic Budget', description: 'Most popular all-purpose budget', split: { needs: 50, wants: 30, savings: 20 } },
    { id: 'aggressive', label: '30/20/50 Aggressive Saver', description: 'FIRE path with maximum wealth building', split: { needs: 30, wants: 20, savings: 50 } },
    { id: 'city', label: '60/20/20 High-Cost Living', description: 'Good for higher rent cities and family costs', split: { needs: 60, wants: 20, savings: 20 } },
    { id: 'debt', label: '50/20/30 Debt Destroyer', description: 'Aggressively eliminate debt fast', split: { needs: 50, wants: 20, savings: 30 } },
    { id: 'balanced', label: '40/40/20 Balanced', description: 'Equal room for needs and wants', split: { needs: 40, wants: 40, savings: 20 } },
];

const tabOptions = [
    { id: 'summary', label: 'Budget Summary', icon: BarChart3 },
    { id: 'compare', label: 'Compare Budget Types', icon: Sparkles },
    { id: 'expenses', label: 'Expense Tracker', icon: Receipt },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'bills', label: 'Bills tracked', icon: CalendarDays },
];

const isSavingsCategoryName = (name = '') => {
    const normalized = String(name).toLowerCase();
    return normalized.includes('saving') || normalized.includes('invest') || normalized.includes('goal');
};

const categoryMeta = (name = '') => {
    const normalized = String(name).toLowerCase();
    if (normalized.includes('housing') || normalized.includes('rent') || normalized.includes('mortgage')) return { type: 'Needs', icon: Home, tint: 'bg-[#fff6e8] text-[#b56a00]', chip: 'bg-[#e7f6f1] text-[#166a55]', bar: '#d38a12' };
    if (normalized.includes('food') || normalized.includes('grocery') || normalized.includes('dining')) return { type: 'Needs', icon: ShoppingBasket, tint: 'bg-[#eef8f4] text-[#166a55]', chip: 'bg-[#e7f6f1] text-[#166a55]', bar: '#1f7f63' };
    if (normalized.includes('transport') || normalized.includes('travel') || normalized.includes('fuel')) return { type: 'Needs', icon: Landmark, tint: 'bg-[#eef4ff] text-[#2f74db]', chip: 'bg-[#e7f6f1] text-[#166a55]', bar: '#3b82f6' };
    if (normalized.includes('utilit') || normalized.includes('power') || normalized.includes('water') || normalized.includes('internet')) return { type: 'Needs', icon: Zap, tint: 'bg-[#f3ecff] text-[#7a57d1]', chip: 'bg-[#e7f6f1] text-[#166a55]', bar: '#8b5fd3' };
    if (normalized.includes('school') || normalized.includes('fee') || normalized.includes('education')) return { type: 'Needs', icon: GraduationCap, tint: 'bg-[#eef4ff] text-[#2f74db]', chip: 'bg-[#e7f6f1] text-[#166a55]', bar: '#4c8ee8' };
    if (normalized.includes('saving') || normalized.includes('invest') || normalized.includes('goal')) return { type: 'Savings', icon: PiggyBank, tint: 'bg-[#eef8f4] text-[#166a55]', chip: 'bg-[#eef4ff] text-[#2f74db]', bar: '#39a88c' };
    if (normalized.includes('entertain') || normalized.includes('fun') || normalized.includes('game')) return { type: 'Wants', icon: Flame, tint: 'bg-[#fff1ef] text-[#d94d4d]', chip: 'bg-[#fff6e8] text-[#b56a00]', bar: '#e24a4a' };
    return { type: 'Needs', icon: Wallet, tint: 'bg-[#f6fbf8] text-[#1f7f63]', chip: 'bg-[#e7f6f1] text-[#166a55]', bar: '#1f9c72' };
};

const statusMeta = {
    ON_TRACK: { label: 'On Track', card: 'border-[#bfe2d6] bg-white', badge: 'bg-[#e7f6f1] text-[#166a55]' },
    WARNING: { label: 'Watch Spend', card: 'border-[#f0d39a] bg-[#fffaf0]', badge: 'bg-[#fff3d8] text-[#b56a00]' },
    OVER_BUDGET: { label: 'Over Budget', card: 'border-[#f2bcbc] bg-[#fff5f5]', badge: 'bg-[#ffe7e7] text-[#d94d4d]' },
    default: { label: 'Active', card: 'border-[#bfe2d6] bg-white', badge: 'bg-[#eef8f4] text-[#166a55]' },
};

const getMonthLabel = () => new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const clamp = (value) => Math.max(0, Math.min(100, Number(value || 0)));
const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const paymentMethodLabel = (value) => {
    const labels = { CASH: 'Cash', CARD: 'Card', MPESA: 'Mobile Money', MOBILE_MONEY: 'Mobile Money', BANK_TRANSFER: 'Bank Transfer', OTHER: 'Other' };
    return labels[value] || 'Other';
};

const expenseTypeLabel = (value) => {
    const labels = { EXPENSE: 'Expense', SAVING: 'Savings', INCOME: 'Income' };
    return labels[value] || 'Expense';
};

const helperCopy = (categoryName = '') => {
    const normalized = String(categoryName).toLowerCase();
    if (normalized.includes('housing')) return 'Rent, mortgage, water, security';
    if (normalized.includes('food')) return 'Naivas, Carrefour, restaurants';
    if (normalized.includes('transport')) return 'Fuel, matatu, Uber, parking';
    if (normalized.includes('entertain')) return 'Netflix, Spotify, events, games';
    if (normalized.includes('utilit')) return 'KPLC, water, internet';
    if (normalized.includes('school')) return 'Term fees, books, activities';
    if (normalized.includes('saving')) return 'MMF, pension, emergency fund';
    return 'Track and manage this category';
};

const getSavingsVisual = (title = '', index = 0) => {
    const normalized = String(title).toLowerCase();
    if (normalized.includes('emergency')) return { icon: ShieldCheck, tone: 'border-[#bfe2d6] bg-[linear-gradient(180deg,_#f8fcfb_0%,_#eff8f4_100%)]', amount: 'text-[#166a55]', bar: '#52b89b', badge: 'bg-[#e7f6f1] text-[#166a55]', label: 'Short' };
    if (normalized.includes('holiday') || normalized.includes('travel')) return { icon: Rocket, tone: 'border-[#f0d39a] bg-[linear-gradient(180deg,_#fffdf7_0%,_#fff7e8_100%)]', amount: 'text-[#c98512]', bar: '#f5a623', badge: 'bg-[#fff3d8] text-[#b56a00]', label: 'Medium' };
    if (normalized.includes('house') || normalized.includes('home')) return { icon: Home, tone: 'border-[#c9d7f4] bg-[linear-gradient(180deg,_#fbfdff_0%,_#f2f7ff_100%)]', amount: 'text-[#2f74db]', bar: '#4c8ee8', badge: 'bg-[#f2edff] text-[#7a57d1]', label: 'Long' };
    if (index % 3 === 1) return { icon: Rocket, tone: 'border-[#f0d39a] bg-[linear-gradient(180deg,_#fffdf7_0%,_#fff7e8_100%)]', amount: 'text-[#c98512]', bar: '#f5a623', badge: 'bg-[#fff3d8] text-[#b56a00]', label: 'Medium' };
    if (index % 3 === 2) return { icon: Home, tone: 'border-[#c9d7f4] bg-[linear-gradient(180deg,_#fbfdff_0%,_#f2f7ff_100%)]', amount: 'text-[#2f74db]', bar: '#4c8ee8', badge: 'bg-[#f2edff] text-[#7a57d1]', label: 'Long' };
    return { icon: ShieldCheck, tone: 'border-[#bfe2d6] bg-[linear-gradient(180deg,_#f8fcfb_0%,_#eff8f4_100%)]', amount: 'text-[#166a55]', bar: '#52b89b', badge: 'bg-[#e7f6f1] text-[#166a55]', label: 'Short' };
};

const getBillVisual = (title = '', index = 0) => {
    const normalized = String(title).toLowerCase();
    if (normalized.includes('kplc') || normalized.includes('electric')) return { icon: Zap, tone: 'border-[#f2c2c2] bg-[#fff5f5]', amount: 'text-[#d94d4d]', pill: 'bg-[#ef4444] text-white', status: 'Pay Now' };
    if (normalized.includes('fibre') || normalized.includes('internet') || normalized.includes('safaricom')) return { icon: Landmark, tone: 'border-[#f0d39a] bg-[#fffaf0]', amount: 'text-[#b56a00]', pill: 'bg-[#fff3d8] text-[#b56a00]', status: 'Auto' };
    if (normalized.includes('loan') || normalized.includes('emi')) return { icon: BadgeDollarSign, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#166a55]', pill: 'bg-[#e7f6f1] text-[#166a55]', status: 'Scheduled' };
    if (normalized.includes('insurance')) return { icon: HeartHandshake, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#166a55]', pill: 'bg-[#eef8f4] text-[#166a55]', status: 'Auto' };
    if (normalized.includes('nhif') || normalized.includes('sha')) return { icon: CalendarDays, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#166a55]', pill: 'bg-[#eef8f4] text-[#166a55]', status: 'Auto' };
    return index === 0
        ? { icon: Zap, tone: 'border-[#f2c2c2] bg-[#fff5f5]', amount: 'text-[#d94d4d]', pill: 'bg-[#ef4444] text-white', status: 'Pay Now' }
        : { icon: CalendarDays, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#166a55]', pill: 'bg-[#eef8f4] text-[#166a55]', status: 'Auto' };
};

const normaliseLabel = (value = '') => String(value).trim().toLowerCase();

const SplitChip = ({ label, shell }) => <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${shell}`}>{label}</span>;

const MetricCard = ({ title, value, helper, accent, line }) => (
    <article className="flex h-full flex-col overflow-hidden rounded-[1rem] border border-[#bfe2d6] bg-white shadow-sm">
        <div className="flex flex-1 flex-col justify-between px-4 py-3.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</p>
            <p className={`mt-2 text-[1.55rem] sm:text-[1.7rem] font-extrabold tracking-tight ${accent}`}>{value}</p>
            <p className="mt-2.5 min-h-[2.7rem] text-[12px] leading-5 text-slate-600">{helper}</p>
        </div>
        <div className={`h-1 w-full ${line}`} />
    </article>
);

const HealthMiniCard = ({ value, label, shell }) => (
    <div className={`rounded-[1rem] px-4 py-4 text-center ${shell}`}>
        <p className="text-4xl font-extrabold">{value}</p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em]">{label}</p>
    </div>
);

const ActionPill = ({ label, onClick, emphasis = false }) => (
    <button type="button" onClick={onClick} className={`rounded-[0.85rem] border px-3 py-2 text-sm font-semibold transition-colors ${emphasis ? 'border-[#f0d39a] bg-[#fff6e8] text-[#9a6200]' : 'border-[#bfe2d6] bg-[#eef8f4] text-[#166a55] hover:bg-[#e5f4ee]'}`}>{label}</button>
);

const ActionCard = ({ title, body, cta, onClick }) => (
    <div className="rounded-[1rem] border border-[#d8ece3] bg-[#f8fcfa] px-4 py-4">
        <p className="text-base font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
        <button type="button" onClick={onClick} className="mt-3 rounded-[0.9rem] border border-[#bfe2d6] bg-white px-3.5 py-2 text-sm font-semibold text-[#166a55]">{cta}</button>
    </div>
);

const EmptyCard = ({ title, body, cta, onClick }) => (
    <div className="rounded-[1.2rem] border border-dashed border-[#bfe2d6] bg-white px-5 py-10 text-center">
        <p className="text-base font-bold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
        <button type="button" onClick={onClick} className="mt-4 rounded-[0.9rem] border border-[#bfe2d6] bg-[#eef8f4] px-4 py-2 text-sm font-semibold text-[#166a55]">{cta}</button>
    </div>
);

const ComparisonBar = ({ label, percent, value, color }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{label}</span>
            <span className="font-semibold text-slate-900">{value}</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#edf5f1]">
            <div className="h-2.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
        </div>
    </div>
);

const BudgetCategoryCard = ({ item, currency, onNavigate }) => {
    const meta = categoryMeta(item.category_name);
    const status = statusMeta[item.status] || statusMeta.default;
    const allocated = toNumber(item.amount);
    const spent = toNumber(item.total_spent);
    const left = allocated - spent;
    const progress = allocated > 0 ? clamp((spent / allocated) * 100) : 0;

    return (
        <article className={`rounded-[1.2rem] border p-4 shadow-sm ${status.card}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-[1rem] ${meta.tint}`}>
                        <meta.icon size={18} />
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[1.1rem] font-bold text-slate-950">{item.category_name}</p>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>{meta.type}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{helperCopy(item.category_name)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}>{status.label.toUpperCase()}</span>
                    <p className="mt-2 text-[1.7rem] font-extrabold tracking-tight text-slate-950">{formatCurrency(spent, item.currency || currency)}</p>
                    <p className="text-sm text-slate-500">of {formatCurrency(allocated, item.currency || currency)} budget</p>
                    <p className={`mt-1 text-sm font-semibold ${left < 0 ? 'text-[#d94d4d]' : 'text-[#166a55]'}`}>{left < 0 ? `-${formatCurrency(Math.abs(left), item.currency || currency)} over` : `${formatCurrency(left, item.currency || currency)} left`}</p>
                </div>
            </div>

            <div className="mt-4 h-2.5 rounded-full bg-[#edf5f1]">
                <div className="h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: meta.bar }} />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
                <p className={`${left < 0 ? 'text-[#d94d4d]' : 'text-slate-500'}`}>{left < 0 ? `${formatCurrency(Math.abs(left), item.currency || currency)} over budget this month` : `${Math.round(progress)}% used`}</p>
                <p className="font-semibold text-slate-500">{Math.round(progress)}%</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <ActionPill label="Transactions" onClick={() => onNavigate('expenses')} />
                <ActionPill label="Edit Budget" onClick={() => onNavigate('budgets')} />
                {item.status === 'OVER_BUDGET' && <ActionPill label="Fix with AI" onClick={() => onNavigate('expenses')} emphasis />}
                {meta.type === 'Savings' && <ActionPill label="View Investments" onClick={() => onNavigate('goals')} />}
                {spent === 0 && item.status !== 'OVER_BUDGET' && <ActionPill label="Add Expense" onClick={() => onNavigate('expenses')} />}
            </div>
        </article>
    );
};

const BudgetOverview = ({
    summary,
    budgets,
    expenses,
    goals,
    goalSummary,
    expenseTotal,
    totalIncome,
    budgetHealth,
    onNavigate,
    onSelectSection,
    onQuickExpenseAdded,
}) => {
    const [activeView, setActiveView] = useState('summary');
    const [selectedModelId, setSelectedModelId] = useState('classic');
    const [showModelModal, setShowModelModal] = useState(false);
    const [pendingModel, setPendingModel] = useState(null);
    const [showCustomSplitModal, setShowCustomSplitModal] = useState(false);
    const [customBudgetName, setCustomBudgetName] = useState('');
    const [customSplit, setCustomSplit] = useState({ needs: 45, wants: 25, savings: 30 });
    const [expenseFilter, setExpenseFilter] = useState('all');
    const [quickCategories, setQuickCategories] = useState([]);
    const [quickExpenseSubmitting, setQuickExpenseSubmitting] = useState(false);
    const [quickExpenseError, setQuickExpenseError] = useState('');
    const [quickExpenseSuccess, setQuickExpenseSuccess] = useState('');
    const [payingBillId, setPayingBillId] = useState(null);
    const [billActionMessage, setBillActionMessage] = useState('');
    const [billActionError, setBillActionError] = useState('');
    const compareSectionRef = useRef(null);
    const [quickExpenseForm, setQuickExpenseForm] = useState({
        amount: '',
        description: '',
        category: '',
        type: 'EXPENSE',
        payment_method: 'MPESA',
    });
    const currency = summary?.currency || 'KES';
    const activeBudgets = useMemo(() => (Array.isArray(budgets) ? budgets : []), [budgets]);
    const activeExpenses = useMemo(() => (Array.isArray(expenses) ? expenses : []), [expenses]);
    const activeGoals = useMemo(() => (Array.isArray(goals) ? goals : []), [goals]);
    // Keep the custom split aligned with the same model shape as the preset options
    // so the compare view, summary card, and selector can all reuse one data flow.
    const customModel = useMemo(() => ({
        id: 'custom',
        label: 'Custom Split',
        description: 'Set your own needs, wants, and savings percentages',
        split: customSplit,
    }), [customSplit]);
    const allBudgetModels = useMemo(() => [...budgetModels, customModel], [customModel]);
    const selectedModel = allBudgetModels.find((item) => item.id === selectedModelId) || allBudgetModels[0];
    const totalBudgeted = toNumber(summary?.total_budget);
    const totalSpent = toNumber(summary?.total_spent || expenseTotal);
    const totalRemaining = toNumber(summary?.total_remaining || (totalBudgeted - totalSpent));
    const trackedIncome = toNumber(totalIncome);
    const savingsFromGoals = toNumber(goalSummary?.total_saved);
    const savingsBudget = activeBudgets.filter((item) => categoryMeta(item.category_name).type === 'Savings').reduce((sum, item) => sum + Math.max(toNumber(item.total_spent), toNumber(item.amount)), 0);
    const savingsValue = savingsFromGoals || savingsBudget;
    const spendingProgress = totalBudgeted > 0 ? clamp((totalSpent / totalBudgeted) * 100) : 0;
    const remainingCash = trackedIncome - totalSpent;
    const savingsRate = trackedIncome > 0 ? clamp((savingsValue / trackedIncome) * 100) : 0;
    const currentMonthLabel = getMonthLabel();
    const customSplitTotal = toNumber(customSplit.needs) + toNumber(customSplit.wants) + toNumber(customSplit.savings);

    // The quick-add card needs real category ids from the API, otherwise expense creation
    // will fail even if the UI shows the correct category label.
    useEffect(() => {
        let mounted = true;
        const loadQuickCategories = async () => {
            try {
                const data = await getCategories();
                if (!mounted) return;
                setQuickCategories(Array.isArray(data) ? data : []);
                setQuickExpenseForm((current) => ({
                    ...current,
                    category: current.category || data?.[0]?.value || '',
                }));
            } catch {
                if (!mounted) return;
                setQuickExpenseError('We could not load categories for quick add right now.');
            }
        };

        loadQuickCategories();
        return () => {
            mounted = false;
        };
    }, []);

    const openModelModal = (model) => {
        setPendingModel(model);
        setShowModelModal(true);
    };

    // Opening compare should feel immediate and contextual, so we switch tabs and
    // scroll the comparison section into view instead of leaving the user at the top.
    // Jump straight into the compare tab and scroll the models into view so
    // the user can immediately understand the difference before switching.
    const openCompareView = () => {
        setActiveView('compare');
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                compareSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    };

    const applyBudgetModel = (model) => {
        if (model.id === 'custom') {
            openCustomSplitModal();
            return;
        }
        setSelectedModelId(model.id);
    };

    const handleCustomSplitChange = (field, value) => {
        setCustomSplit((current) => ({
            ...current,
            [field]: Math.max(0, Math.min(100, Number(value) || 0)),
        }));
    };

    const openCustomSplitModal = () => {
        setShowCustomSplitModal(true);
    };

    const closeCustomSplitModal = () => {
        setShowCustomSplitModal(false);
    };

    const handleApplyCustomSplit = () => {
        if (customSplitTotal !== 100) {
            openModelModal({
                label: 'Custom Split Needs Attention',
                description: `Your current split totals ${customSplitTotal}%. Update it to exactly 100% before applying it.`,
                split: customSplit,
            });
            return;
        }

        setSelectedModelId('custom');
        setShowCustomSplitModal(false);
        setPendingModel(null);
        setShowModelModal(false);
    };

    const handleQuickExpenseChange = (event) => {
        const { name, value } = event.target;
        setQuickExpenseError('');
        setQuickExpenseSuccess('');
        setQuickExpenseForm((current) => ({ ...current, [name]: value }));
    };

    // The quick add form mirrors the main expense flow, but keeps the payload
    // intentionally small so users can log spending without leaving the tab.
    const handleQuickExpenseSubmit = async (event) => {
        event.preventDefault();
        setQuickExpenseError('');
        setQuickExpenseSuccess('');

        if (!quickExpenseForm.amount || Number(quickExpenseForm.amount) <= 0) {
            setQuickExpenseError('Enter a valid amount greater than zero.');
            return;
        }

        if (!quickExpenseForm.description.trim()) {
            setQuickExpenseError('Add a short description for this expense.');
            return;
        }

        if (!quickExpenseForm.category) {
            setQuickExpenseError('Choose a budget category first.');
            return;
        }

        setQuickExpenseSubmitting(true);
        try {
            await createExpense({
                amount: quickExpenseForm.amount,
                description: quickExpenseForm.description,
                category: quickExpenseForm.category,
                payment_method: quickExpenseForm.payment_method,
                expense_date: new Date().toISOString().split('T')[0],
                currency,
            });

            setQuickExpenseSuccess('Expense added successfully.');
            setBillActionMessage('');
            setBillActionError('');
            setQuickExpenseForm((current) => ({
                ...current,
                amount: '',
                description: '',
                type: 'EXPENSE',
                payment_method: 'MPESA',
            }));
            onQuickExpenseAdded?.();
        } catch (error) {
            const errorMessage =
                error?.response?.data?.errors ||
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                'We could not add this expense right now.';
            setQuickExpenseError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setQuickExpenseSubmitting(false);
        }
    };

    // "Pay Now" records only the unpaid remainder as a real expense. That keeps bill
    // reminders and budget spend in sync without double-counting what is already paid.
    // Bills are treated as real expenses once paid so the budget, bills panel,
    // and monthly summaries stay in sync instead of drifting apart.
    const handlePayBill = async (item) => {
        const matchingCategory = quickCategories.find((category) => {
            const itemName = normaliseLabel(item.category_name);
            return (
                normaliseLabel(category.name) === itemName ||
                String(category.id || '') === String(item.category_id || '') ||
                String(category.uuid || '') === String(item.category_uuid || '') ||
                String(category.value || '') === String(item.category_id || '') ||
                String(category.value || '') === String(item.category_uuid || '')
            );
        });
        const categoryValue =
            matchingCategory?.value ??
            item.category_id ??
            item.category_uuid ??
            item.category;
        const outstandingAmount = Math.max(toNumber(item.allocated) - toNumber(item.spent), 0);

        setBillActionMessage('');
        setBillActionError('');

        if (!categoryValue) {
            setBillActionError('We could not find the matching category for this bill.');
            return;
        }

        if (outstandingAmount <= 0) {
            setBillActionMessage('This bill is already fully covered in your tracked expenses.');
            return;
        }

        setPayingBillId(item.uuid);
        try {
            await createExpense({
                amount: outstandingAmount,
                description: `${item.category_name} bill payment`,
                category: categoryValue,
                payment_method: 'MPESA',
                expense_date: new Date().toISOString().split('T')[0],
                currency: item.currency || currency,
            });

            setBillActionMessage(`${item.category_name} has been recorded as paid and added to your expenses.`);
            onQuickExpenseAdded?.();
        } catch (error) {
            const errorMessage =
                error?.response?.data?.errors ||
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                'We could not record this bill payment right now.';
            setBillActionError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setPayingBillId(null);
        }
    };

    // Normalize raw budget rows once here so every tab can consume the same derived
    // amounts, progress values, and category metadata without duplicating logic.
    const summaryRows = useMemo(() => [...activeBudgets].sort((a, b) => toNumber(b.amount) - toNumber(a.amount)).map((item) => {
        const meta = categoryMeta(item.category_name);
        const spent = toNumber(item.total_spent);
        const allocated = toNumber(item.amount);
        const left = allocated - spent;
        return { ...item, meta, spent, allocated, left, progress: allocated > 0 ? clamp((spent / allocated) * 100) : 0 };
    }), [activeBudgets]);

    const categoryCards = useMemo(() => [...summaryRows].sort((a, b) => b.spent - a.spent), [summaryRows]);
    const topSpendingCategories = [...summaryRows].filter((item) => item.spent > 0 || item.allocated > 0).sort((a, b) => b.spent - a.spent).slice(0, 5);

    const expenseByMethod = activeExpenses.reduce((accumulator, expense) => {
        const key = paymentMethodLabel(expense.payment_method);
        accumulator[key] = (accumulator[key] || 0) + toNumber(expense.amount);
        return accumulator;
    }, {});

    const filteredExpenses = activeExpenses.filter((expense) => {
        if (expenseFilter === 'all') return true;
        const meta = categoryMeta(expense.category_name);
        return meta.type.toLowerCase() === expenseFilter;
    });

    const displayedExpenses = filteredExpenses.slice(0, 8);
    const monthlySummaryRows = [
        { label: 'Total Income', value: formatCurrency(trackedIncome, currency), shell: 'bg-[#edf8f3] text-[#166a55]' },
        { label: 'Total Spent', value: formatCurrency(totalSpent, currency), shell: 'bg-[#fff3f3] text-[#d94d4d]' },
        { label: 'Total Saved', value: formatCurrency(savingsValue, currency), shell: 'bg-[#edf8f3] text-[#166a55]' },
        { label: 'Net Surplus', value: formatCurrency(remainingCash, currency), shell: 'bg-[#f3f7ff] text-[#2f74db]' },
    ];

    const savingsItems = activeGoals.length
        ? activeGoals.slice(0, 4).map((goal) => {
            const target = toNumber(goal.target_amount);
            const current = toNumber(goal.current_amount);
            return {
                title: goal.name || 'Savings Goal',
                helper: goal.goal_type ? String(goal.goal_type).replace(/_/g, ' ') : 'Goal',
                current,
                target,
                progress: target > 0 ? clamp((current / target) * 100) : clamp(goal.progress_percentage),
                action: 'Track Progress',
                due: goal.target_date ? new Date(goal.target_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '',
            };
        })
        : summaryRows.filter((item) => item.meta.type === 'Savings').map((item) => ({
            title: item.category_name,
            helper: 'Savings allocation',
            current: item.spent,
            target: item.allocated,
            progress: item.progress,
            action: 'Track Progress',
            due: '',
        }));

    const billItems = summaryRows.filter((item) => {
        const normalized = String(item.category_name || '').toLowerCase();
        return normalized.includes('housing') || normalized.includes('utilit') || normalized.includes('school') || normalized.includes('fee');
    }).slice(0, 5).map((item, index) => ({ ...item, dueLabel: index === 0 ? 'Due in 3 days' : index === 1 ? 'Due in 8 days' : index === 2 ? 'Due 25 Mar' : index === 3 ? 'Due 1 Apr' : 'Due 10 Apr' }));
    const essentialBills = billItems.filter((item) => !String(item.category_name || '').toLowerCase().includes('subscription')).reduce((sum, item) => sum + toNumber(item.allocated), 0);
    const totalMonthlyBills = billItems.reduce((sum, item) => sum + toNumber(item.allocated), 0);
    const subscriptionBills = Math.max(totalMonthlyBills - essentialBills, 0);

    const compareCards = allBudgetModels.map((model) => {
        const needs = Math.round((trackedIncome * model.split.needs) / 100);
        const wants = Math.round((trackedIncome * model.split.wants) / 100);
        const savings = Math.round((trackedIncome * model.split.savings) / 100);
        const score = Math.abs(model.split.savings - Math.round(savingsRate || model.split.savings)) + Math.abs(model.split.needs - 50);
        return { ...model, needs, wants, savings, annualSavings: savings * 12, score };
    }).sort((a, b) => a.score - b.score);

    const modelVisuals = {
        classic: { icon: Sparkles, shell: 'border-[#bfe2d6] bg-[#f8fcfa]', accent: 'bg-[#1f7f63]', cta: 'bg-[#1f7f63] text-white', badge: 'bg-[#e7f6f1] text-[#166a55]', bestFor: 'Balanced lifestyle', note: 'Best for a balanced lifestyle with steady savings.' },
        aggressive: { icon: Rocket, shell: 'border-[#b9d5f2] bg-[#f8fbff]', accent: 'bg-[#3a7fd1]', cta: 'bg-[#3a7fd1] text-white', badge: 'bg-[#eef4ff] text-[#2f74db]', bestFor: 'FIRE path', note: 'Best for early retirement and fast wealth building.' },
        city: { icon: BarChart3, shell: 'border-[#bfe2d6] bg-[#f8fcfa]', accent: 'bg-[#f5a623]', cta: 'bg-[#f5a623] text-slate-950', badge: 'bg-[#fff3d8] text-[#b56a00]', bestFor: 'High rent', note: 'Best for higher rent cities while still protecting savings.' },
        debt: { icon: Swords, shell: 'border-[#f2c2c2] bg-[#fff8f8]', accent: 'bg-[#ef4444]', cta: 'bg-[#ef4444] text-white', badge: 'bg-[#ffe7e7] text-[#d94d4d]', bestFor: 'Debt payoff', note: 'Best for a high debt load and aggressive repayment.' },
        balanced: { icon: BadgeDollarSign, shell: 'border-[#bfe2d6] bg-[#f8fcfa]', accent: 'bg-[#f5a623]', cta: 'bg-[#f5a623] text-slate-950', badge: 'bg-[#f6f0db] text-[#9a6200]', bestFor: 'Equal split', note: 'Best for moderate lifestyle needs and wants.' },
        custom: { icon: Pencil, shell: 'border-[#d9d0f7] bg-[#fbf9ff]', accent: 'bg-[#7a57d1]', cta: 'bg-[#7a57d1] text-white', badge: 'bg-[#f2edff] text-[#7a57d1]', bestFor: 'Your own plan', note: 'Create your own percentages when the preset models do not fit.' },
    };

    const customSplitIncome = trackedIncome;

    const ecosystemCards = [
        { title: 'Goals', helper: 'Track your targets', cta: 'Track', icon: Target, action: () => onSelectSection?.('user') },
        { title: 'Debt Manager', helper: 'Plan repayments', cta: 'Manage', icon: BadgeDollarSign, action: () => onSelectSection?.('debt') },
        { title: 'Net Worth', helper: 'See the full picture', cta: 'View', icon: PiggyBank, action: () => onSelectSection?.('networth') },
        { title: 'Investments', helper: 'Grow extra cash', cta: 'Open', icon: TrendingUp, action: () => onSelectSection?.('investments') },
        { title: 'Protection', helper: 'Cover what matters', cta: 'View', icon: ShieldCheck, action: () => onSelectSection?.('protection') },
        { title: 'Financial Health', helper: 'See the score impact', cta: 'Open', icon: Sparkles, action: () => onSelectSection?.('health') },
    ];

    const insightCards = [
        { title: totalRemaining >= 0 ? 'Budget still has room' : 'Entertainment over budget', body: totalRemaining >= 0 ? `You still have ${formatCurrency(totalRemaining, currency)} available inside your planned budget.` : `You are ${formatCurrency(Math.abs(totalRemaining), currency)} over your planned budget and should rebalance quickly.`, tone: totalRemaining >= 0 ? 'border-[#bfe2d6] bg-[#edf8f3] text-[#166a55]' : 'border-[#f2bcbc] bg-[#fff5f5] text-[#d94d4d]' },
        { title: 'Housing at a healthy level', body: trackedIncome > 0 ? `Your current housing allocation is ${formatCurrency(summaryRows.find((item) => item.category_name?.toLowerCase().includes('housing'))?.allocated || 0, currency)} against income ${formatCurrency(trackedIncome, currency)}.` : 'Add income to compare housing against your monthly inflow.', tone: 'border-[#f0d39a] bg-[#fff9ec] text-[#9a6200]' },
        { title: savingsValue > 0 ? 'Savings target is moving' : 'Savings target needs setup', body: savingsValue > 0 ? `You have ${formatCurrency(savingsValue, currency)} flowing into savings goals right now.` : 'Create a savings goal or savings category so auto-save can be tracked here.', tone: 'border-[#bfe2d6] bg-[#edf8f3] text-[#166a55]' },
    ];

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[1.65rem] bg-[linear-gradient(135deg,_#0d3f36_0%,_#1a6e5a_55%,_#1f856b_100%)] px-5 py-5 text-white shadow-[0_20px_50px_rgba(17,73,58,0.18)]">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-2xl">
                        <p className="inline-flex items-center gap-2 text-[1.8rem] font-extrabold tracking-tight">
                            <BarChart3 size={22} />
                            Budget Planner
                        </p>
                        <p className="mt-2 text-sm leading-7 text-white/82">
                            Track what you allocated, what you have spent, and where to adjust before you go over. Every shilling planned is a step toward financial freedom.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 xl:justify-end">
                        <label className="relative inline-flex h-10 items-center gap-3 rounded-full bg-white px-4 pr-10 text-sm font-semibold text-[#166a55] shadow-sm">
                            <span>Select Budget Type</span>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#166a55]" />
                            <select
                                value={selectedModelId}
                                onChange={(event) => {
                                    const nextModel = allBudgetModels.find((model) => model.id === event.target.value);
                                    if (nextModel) applyBudgetModel(nextModel);
                                }}
                                aria-label="Select Budget Type"
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            >
                                {budgetModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                                <option value="custom">Custom Split</option>
                            </select>
                        </label>
                        <button type="button" onClick={() => onNavigate('budgets')} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white">
                            <Plus size={15} />
                            Add Category
                        </button>
                        <button type="button" onClick={() => onNavigate('expenses')} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#f8b12d] px-4 text-sm font-semibold text-slate-950 shadow-sm">
                            <Plus size={15} />
                            Add Expense
                        </button>
                    </div>
                </div>
            </section>

            <section className="rounded-[1.3rem] border border-[#bfe2d6] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3.5">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[0.95rem] bg-[linear-gradient(135deg,_#1f7f63_0%,_#f2b13c_100%)] text-white shadow-sm">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <p className="text-[1.1rem] sm:text-[1.2rem] font-bold tracking-tight text-slate-950">{selectedModel.label}</p>
                            <p className="mt-1 text-[13px] text-slate-500">{selectedModel.description}. Income: {formatCurrency(trackedIncome, currency)}/mo</p>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                                <SplitChip label={`Needs: ${formatCurrency((trackedIncome * selectedModel.split.needs) / 100, currency)} (${selectedModel.split.needs}%)`} shell="bg-[#e7f6f1] text-[#166a55]" />
                                <SplitChip label={`Wants: ${formatCurrency((trackedIncome * selectedModel.split.wants) / 100, currency)} (${selectedModel.split.wants}%)`} shell="bg-[#fff3d8] text-[#b56a00]" />
                                <SplitChip label={`Savings: ${formatCurrency((trackedIncome * selectedModel.split.savings) / 100, currency)} (${selectedModel.split.savings}%)`} shell="bg-[#eef4ff] text-[#2f74db]" />
                            </div>
                        </div>
                    </div>
                    <label className="relative inline-flex h-9 min-w-[13rem] items-center rounded-full border border-[#bfe2d6] bg-[#f8fcfa] px-3.5 pr-10 text-[13px] font-semibold text-[#166a55] transition-colors hover:bg-[#f6fbf8]">
                        <span className="truncate">Change Type</span>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#166a55]" />
                        <select
                            value={selectedModelId}
                            onChange={(event) => {
                                const nextModel = allBudgetModels.find((model) => model.id === event.target.value);
                                if (nextModel) applyBudgetModel(nextModel);
                            }}
                            aria-label="Change budget type"
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        >
                            {budgetModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                            <option value="custom">Custom Split</option>
                        </select>
                    </label>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Budget Allocated" value={formatCurrency(totalBudgeted, currency)} helper={`${summary?.active_budgets_count || activeBudgets.length} active categories`} accent="text-[#166a55]" line="bg-[#1f9c72]" />
                <MetricCard title="Spent So Far" value={formatCurrency(totalSpent, currency)} helper={`${Math.round(spendingProgress)}% of budget used`} accent="text-[#d94d4d]" line="bg-[#e24a4a]" />
                <MetricCard title={totalRemaining >= 0 ? 'Left In Budget' : 'Over Budget'} value={formatCurrency(Math.abs(totalRemaining), currency)} helper={totalRemaining >= 0 ? 'Available inside your budget' : 'Needs immediate attention'} accent={totalRemaining >= 0 ? 'text-[#b56a00]' : 'text-[#d94d4d]'} line={totalRemaining >= 0 ? 'bg-[#f0a62e]' : 'bg-[#e24a4a]'} />
                <MetricCard title="Budget Savings" value={formatCurrency(savingsValue, currency)} helper={savingsValue > 0 ? 'Auto-saved this month' : 'No savings recorded yet'} accent="text-[#2f74db]" line="bg-[#2f74db]" />
            </section>

            <section className="rounded-[1.2rem] border border-[#bfe2d6] bg-white p-2 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {tabOptions.map(({ id, label, icon: Icon }) => {
                        const isActive = activeView === id;
                        return (
                            <button key={id} type="button" onClick={() => setActiveView(id)} className={`inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#0f4d40] text-white shadow-md shadow-[#0f4d40]/20' : 'text-slate-600 hover:bg-[#f4faf7] hover:text-slate-950'}`}>
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {activeView === 'summary' && (
                <div className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
                        <article className="rounded-[1.45rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2f74db]">
                                        <BarChart3 size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Budget Categories - Summary Table</p>
                                </div>
                                <button type="button" onClick={() => onNavigate('budgets')} className="text-sm font-semibold text-[#166a55]">
                                    Manage Categories
                                </button>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#d8ece3] text-left text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                            <th className="py-3 pr-3">Category</th>
                                            <th className="py-3 pr-3">Type</th>
                                            <th className="py-3 pr-3">Allocated</th>
                                            <th className="py-3 pr-3">Spent</th>
                                            <th className="py-3 pr-3">Left</th>
                                            <th className="py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summaryRows.map((item) => (
                                            <tr key={`${item.uuid}-summary`} className="border-b border-[#edf5f1] last:border-b-0">
                                                <td className="py-3 pr-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${item.meta.tint}`}>
                                                            <item.meta.icon size={16} />
                                                        </span>
                                                        <span className="font-semibold text-slate-900">{item.category_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.meta.chip}`}>{item.meta.type}</span></td>
                                                <td className="py-3 pr-3 text-slate-700">{formatCurrency(item.allocated, item.currency || currency)}</td>
                                                <td className={`py-3 pr-3 font-semibold ${item.left < 0 ? 'text-[#d94d4d]' : 'text-slate-900'}`}>{formatCurrency(item.spent, item.currency || currency)}</td>
                                                <td className={`py-3 pr-3 font-semibold ${item.left < 0 ? 'text-[#d94d4d]' : 'text-[#166a55]'}`}>{item.left < 0 ? `-${formatCurrency(Math.abs(item.left), item.currency || currency)}` : formatCurrency(item.left, item.currency || currency)}</td>
                                                <td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${(statusMeta[item.status] || statusMeta.default).badge}`}>{(statusMeta[item.status] || statusMeta.default).label}</span></td>
                                            </tr>
                                        ))}
                                        <tr className="bg-[#f8fcfa]">
                                            <td className="py-4 pr-3 text-base font-bold text-slate-950">Total</td>
                                            <td />
                                            <td className="py-4 pr-3 text-base font-bold text-[#166a55]">{formatCurrency(totalBudgeted, currency)}</td>
                                            <td className="py-4 pr-3 text-base font-bold text-[#d94d4d]">{formatCurrency(totalSpent, currency)}</td>
                                            <td className="py-4 pr-3 text-base font-bold text-[#166a55]">{formatCurrency(totalRemaining, currency)}</td>
                                            <td />
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="rounded-[1.45rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef8f4] text-[#1f7f63]">
                                    <TrendingUp size={18} />
                                </div>
                                <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Spending Breakdown</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Where most of your budget is currently going.</p>

                            <div className="mt-4 space-y-4">
                                {topSpendingCategories.map((item) => (
                                    <div key={`${item.uuid}-breakdown`} className="rounded-[1rem] border border-[#edf5f1] bg-[#fbfdfc] px-4 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{item.category_name}</p>
                                                <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.spent, item.currency || currency)} of {formatCurrency(item.allocated, item.currency || currency)}</p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(statusMeta[item.status] || statusMeta.default).badge}`}>{(statusMeta[item.status] || statusMeta.default).label}</span>
                                        </div>
                                        <div className="mt-3 h-2.5 rounded-full bg-[#edf5f1]">
                                            <div className="h-2.5 rounded-full" style={{ width: `${Math.min(item.progress, 100)}%`, backgroundColor: item.meta.bar }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-[1.5rem] font-bold tracking-tight text-slate-950">Budget vs Spending</p>
                                <p className="mt-1 text-sm text-slate-500">A quick read on whether your month is under control.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-extrabold text-[#166a55]">{Math.round(spendingProgress)}%</p>
                                <button type="button" onClick={() => setActiveView('expenses')} className="inline-flex items-center gap-2 rounded-full border border-[#bfe2d6] bg-[#edf8f3] px-4 py-2 text-sm font-semibold text-[#166a55]">
                                    Review Expenses
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                                <span>Spending progress</span>
                                <span className="font-semibold text-slate-700">{Math.round(spendingProgress)}%</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-[#edf5f1]">
                                <div className="h-full rounded-full bg-[linear-gradient(90deg,_#52c3ac_0%,_#1f9c72_100%)]" style={{ width: `${Math.min(spendingProgress, 100)}%` }} />
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <HealthMiniCard value={budgetHealth?.healthy || 0} label="On Track" shell="bg-[#edf8f3] text-[#166a55]" />
                            <HealthMiniCard value={budgetHealth?.warning || 0} label="Watch" shell="bg-[#fff9ec] text-[#9a6200]" />
                            <HealthMiniCard value={budgetHealth?.over || 0} label="Over Budget" shell="bg-[#fff3f3] text-[#d94d4d]" />
                        </div>

                        <div className={`mt-4 rounded-[1.05rem] border px-4 py-4 ${budgetHealth?.over > 0 ? 'border-[#f0d39a] bg-[#fff9ec] text-[#9a6200]' : 'border-[#bfe2d6] bg-[#edf8f3] text-[#166a55]'}`}>
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">{budgetHealth?.over > 0 ? 'You are close to your limits' : 'Your month is moving well'}</p>
                                    <p className="mt-1 text-sm">
                                        {budgetHealth?.over > 0
                                            ? `${budgetHealth.over} category is over budget or approaching its cap. Review spending before month end.`
                                            : `${budgetHealth?.healthy || 0} categories are pacing well against plan. Keep your expenses updated for cleaner insights.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
                        <article className="rounded-[1.45rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef8f4] text-[#1f7f63]">
                                        <Receipt size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[1.45rem] font-bold tracking-tight text-slate-950">Budget Categories - {currentMonthLabel}</p>
                                        <p className="mt-1 text-sm text-slate-500">See each category, the live spend, and what action to take next.</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => onNavigate('budgets')} className="text-sm font-semibold text-[#166a55]">
                                    + Add Category
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {categoryCards.length ? categoryCards.map((item) => (
                                    <BudgetCategoryCard key={item.uuid} item={item} currency={currency} onNavigate={onNavigate} />
                                )) : (
                                    <EmptyCard title="No budget categories yet" body="Start by adding a few categories so your planner can show progress, warnings, and spending insights." cta="Add Category" onClick={() => onNavigate('budgets')} />
                                )}
                            </div>
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.45rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e8] text-[#b56a00]">
                                        <Lightbulb size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Budget Insight</p>
                                        <p className="mt-1 text-sm text-slate-500">What this month is telling you.</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {insightCards.map((item) => (
                                        <div key={item.title} className={`rounded-[1rem] border px-4 py-4 text-sm leading-6 ${item.tone}`}>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="mt-1">{item.body}</p>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => onSelectSection?.('health')} className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm font-semibold text-[#166a55]">
                                        <Sparkles size={15} />
                                        Ask Shilingi Buddy AI for More Tips
                                    </button>
                                </div>
                            </article>

                            <article className="rounded-[1.45rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef8f4] text-[#1f7f63]">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Next Best Actions</p>
                                        <p className="mt-1 text-sm text-slate-500">The most useful next steps from this budget.</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <ActionCard title="Update categories" body="Adjust category limits if your real spending pattern has changed this month." cta="Manage Budgets" onClick={() => onNavigate('budgets')} />
                                    <ActionCard title="Keep expenses current" body="Log recent spending so the budget health stays accurate and your dashboard stays useful." cta="Add Expense" onClick={() => onNavigate('expenses')} />
                                    <ActionCard title="Compare budget models" body="See how switching to another split would change your monthly allocations." cta="Compare Types" onClick={openCompareView} />
                                    <ActionCard title="Set up bills tracked" body="Track key bill-like categories such as rent, utilities, and school fees." cta="Manage Bills tracked" onClick={() => setActiveView('bills')} />
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'compare' && (
                <div ref={compareSectionRef} className="space-y-4">
                    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[1.55rem] font-bold tracking-tight text-slate-950">Compare Budget Models</p>
                            <p className="mt-1 text-sm text-slate-500">See how different needs, wants, and savings splits would look on your {formatCurrency(trackedIncome, currency)}/mo income.</p>
                        </div>
                        <button type="button" onClick={openCustomSplitModal} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0f6a57] px-4 text-sm font-semibold text-white">
                            <Pencil size={15} />
                            Custom Split
                        </button>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-3">
                        {compareCards.filter((item) => ['classic', 'aggressive', 'city'].includes(item.id)).map((item) => {
                            const visual = modelVisuals[item.id];
                            const Icon = visual.icon;
                            const isSelected = selectedModelId === item.id;
                            return (
                                <article key={item.id} className={`rounded-[1.4rem] border p-5 shadow-sm ${visual.shell} ${isSelected ? 'ring-2 ring-[#1f9c72]/30' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-slate-900 shadow-sm">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[1.2rem] font-bold tracking-tight text-slate-950">{item.label}</p>
                                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <SplitChip label={`Needs ${item.split.needs}%`} shell="bg-[#e7f6f1] text-[#166a55]" />
                                        <SplitChip label={`Wants ${item.split.wants}%`} shell="bg-[#fff3d8] text-[#b56a00]" />
                                        <SplitChip label={`Save ${item.split.savings}%`} shell="bg-[#eef4ff] text-[#2f74db]" />
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <ComparisonBar label="Needs" percent={item.split.needs} value={formatCurrency(item.needs, currency)} color="#1f7f63" />
                                        <ComparisonBar label="Wants" percent={item.split.wants} value={formatCurrency(item.wants, currency)} color="#f5a623" />
                                        <ComparisonBar label={item.id === 'debt' ? 'Debt' : 'Savings'} percent={item.split.savings} value={formatCurrency(item.savings, currency)} color={item.id === 'debt' ? '#ef4444' : '#2f74db'} />
                                    </div>

                                    <div className="mt-4 rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-slate-700">
                                        {visual.note}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => applyBudgetModel(item)}
                                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 py-3 text-sm font-semibold ${isSelected ? 'bg-[#1f7f63] text-white' : visual.cta}`}
                                    >
                                        {isSelected ? <><Check size={15} /> Currently Active</> : 'Apply This Model'}
                                    </button>
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
                        {compareCards.filter((item) => item.id === 'debt' || item.id === 'balanced').map((item) => {
                            const visual = modelVisuals[item.id];
                            const Icon = visual.icon;
                            const isSelected = selectedModelId === item.id;
                            return (
                                <article key={item.id} className={`rounded-[1.4rem] border p-5 shadow-sm ${visual.shell} ${isSelected ? 'ring-2 ring-[#1f9c72]/30' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-slate-900 shadow-sm">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[1.2rem] font-bold tracking-tight text-slate-950">{item.label}</p>
                                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <SplitChip label={`Needs ${item.split.needs}%`} shell="bg-[#e7f6f1] text-[#166a55]" />
                                        <SplitChip label={`Wants ${item.split.wants}%`} shell="bg-[#fff3d8] text-[#b56a00]" />
                                        <SplitChip label={`${item.id === 'debt' ? 'Debt' : 'Save'} ${item.split.savings}%`} shell={item.id === 'debt' ? 'bg-[#ffe7e7] text-[#d94d4d]' : 'bg-[#eef4ff] text-[#2f74db]'} />
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <ComparisonBar label="Needs" percent={item.split.needs} value={formatCurrency(item.needs, currency)} color="#1f7f63" />
                                        <ComparisonBar label="Wants" percent={item.split.wants} value={formatCurrency(item.wants, currency)} color="#f5a623" />
                                        <ComparisonBar label={item.id === 'debt' ? 'Debt' : 'Savings'} percent={item.split.savings} value={formatCurrency(item.savings, currency)} color={item.id === 'debt' ? '#ef4444' : '#2f74db'} />
                                    </div>
                                    <div className="mt-4 rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-slate-700">
                                        {visual.note}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => applyBudgetModel(item)}
                                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 py-3 text-sm font-semibold ${isSelected ? 'bg-[#1f7f63] text-white' : visual.cta}`}
                                    >
                                        {isSelected ? <><Check size={15} /> Currently Active</> : 'Apply This Model'}
                                    </button>
                                </article>
                            );
                        })}

                        <article className="rounded-[1.4rem] border border-[#d9d0f7] bg-[#fbf9ff] p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-[#7a57d1] shadow-sm">
                                    <Pencil size={18} />
                                </div>
                                <div>
                                    <p className="text-[1.2rem] font-bold tracking-tight text-slate-950">Custom Split</p>
                                    <p className="mt-1 text-sm text-slate-500">Set your own percentages and keep total at 100%.</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3 rounded-[1rem] border border-dashed border-[#d7cdf4] bg-white px-4 py-4">
                                {[
                                    ['needs', 'Needs'],
                                    ['wants', 'Wants'],
                                    ['savings', 'Savings'],
                                ].map(([field, label]) => (
                                    <label key={field} className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={customSplit[field]}
                                            onChange={(event) => handleCustomSplitChange(field, event.target.value)}
                                            className="w-24 rounded-[0.8rem] border border-[#d7cdf4] bg-[#fbf9ff] px-3 py-2 text-right text-sm font-semibold text-slate-900 outline-none"
                                        />
                                    </label>
                                ))}
                                <div className={`rounded-[0.8rem] px-3 py-2 text-sm font-semibold ${customSplitTotal === 100 ? 'bg-[#eef8f4] text-[#166a55]' : 'bg-[#fff3d8] text-[#b56a00]'}`}>
                                    Total: {customSplitTotal}% {customSplitTotal === 100 ? 'ready to apply' : 'must equal 100%'}
                                </div>
                            </div>

                            <button type="button" onClick={openCustomSplitModal} className="mt-5 inline-flex w-full items-center justify-center rounded-[0.95rem] bg-[#7a57d1] px-4 py-3 text-sm font-semibold text-white">
                                Create Custom Split
                            </button>
                        </article>
                    </section>

                    <section className="rounded-[1.45rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef8f4] text-[#1f7f63]">
                                <BarChart3 size={18} />
                            </div>
                            <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Model Comparison - {formatCurrency(trackedIncome, currency)} Income</p>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#d8ece3] text-left text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                        <th className="py-3 pr-4">Budget Model</th>
                                        <th className="py-3 pr-4">Needs</th>
                                        <th className="py-3 pr-4">Wants</th>
                                        <th className="py-3 pr-4">Savings/Debt</th>
                                        <th className="py-3 pr-4">Annual Savings</th>
                                        <th className="py-3">Best For</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compareCards.map((item) => {
                                        const visual = modelVisuals[item.id];
                                        const Icon = visual.icon;
                                        return (
                                            <tr key={`${item.id}-table`} className="border-b border-[#edf5f1] last:border-b-0">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                                                        <Icon size={16} />
                                                        {item.label}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">{formatCurrency(item.needs, currency)}</td>
                                                <td className="py-3 pr-4">{formatCurrency(item.wants, currency)}</td>
                                                <td className={`py-3 pr-4 font-semibold ${item.id === 'debt' ? 'text-[#d94d4d]' : 'text-[#166a55]'}`}>{formatCurrency(item.savings, currency)}</td>
                                                <td className="py-3 pr-4 font-semibold text-[#2f74db]">{formatCurrency(item.annualSavings, currency)}</td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${visual.badge}`}>{visual.bestFor}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'expenses' && (
                <div className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.3fr_0.85fr]">
                        <article className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e8] text-[#b56a00]">
                                        <Receipt size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">All Expenses - {currentMonthLabel}</p>
                                </div>
                                <button type="button" onClick={() => onNavigate('expenses')} className="text-sm font-semibold text-[#166a55]">
                                    + Add
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'needs', label: 'Needs' },
                                    { id: 'wants', label: 'Wants' },
                                    { id: 'savings', label: 'Savings' },
                                ].map((item) => {
                                    const isActive = expenseFilter === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setExpenseFilter(item.id)}
                                            className={`rounded-[0.85rem] border px-4 py-2 text-sm font-semibold ${isActive ? 'border-[#bfe2d6] bg-[#edf8f3] text-[#166a55]' : 'border-[#d8ece3] bg-white text-slate-600'}`}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-5 space-y-1">
                                {displayedExpenses.length ? displayedExpenses.map((expense) => {
                                    const meta = categoryMeta(expense.category_name);
                                    const amount = toNumber(expense.amount);
                                    const isPositive = String(expenseTypeLabel(expense.type || expense.entry_type)).toLowerCase() !== 'expense' || meta.type === 'Savings';

                                    return (
                                        <div key={expense.uuid} className="flex items-start justify-between gap-4 border-b border-[#edf5f1] py-4 last:border-b-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-[1rem] ${meta.tint}`}>
                                                    <meta.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{expense.description}</p>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {expense.category_name || 'Category'} · {meta.type} {expense.payment_method ? `· ${paymentMethodLabel(expense.payment_method)}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[1.05rem] font-extrabold ${isPositive ? 'text-[#166a55]' : 'text-[#d94d4d]'}`}>
                                                    {isPositive ? '' : '-'}{formatCurrency(Math.abs(amount), expense.currency || currency)}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">{expense.expense_date || 'This month'}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <EmptyCard title="No expenses recorded yet" body="As soon as expenses are added, this section will show the latest transactions for the month." cta="Add Expense" onClick={() => onNavigate('expenses')} />
                                )}
                            </div>

                            {filteredExpenses.length > displayedExpenses.length && (
                                <button type="button" onClick={() => onNavigate('expenses')} className="mt-4 inline-flex w-full items-center justify-center rounded-[1rem] border border-[#bfe2d6] bg-[#f8fcfa] px-4 py-3 text-sm font-semibold text-[#166a55]">
                                    Load More
                                </button>
                            )}
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e8] text-[#b56a00]">
                                        <Zap size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Quick Add Expense</p>
                                </div>

                                <form onSubmit={handleQuickExpenseSubmit} className="mt-4 space-y-3">
                                    {quickExpenseError && (
                                        <div className="rounded-[0.95rem] border border-[#f2c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#d94d4d]">
                                            {quickExpenseError}
                                        </div>
                                    )}
                                    {quickExpenseSuccess && (
                                        <div className="rounded-[0.95rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm text-[#166a55]">
                                            {quickExpenseSuccess}
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="quick-expense-amount" className="text-sm font-semibold text-slate-700">Amount ({currency})</label>
                                        <input
                                            id="quick-expense-amount"
                                            type="number"
                                            name="amount"
                                            min="0"
                                            step="0.01"
                                            value={quickExpenseForm.amount}
                                            onChange={handleQuickExpenseChange}
                                            placeholder="e.g. 1,500"
                                            className="mt-2 w-full rounded-[1rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="quick-expense-description" className="text-sm font-semibold text-slate-700">Description</label>
                                        <input
                                            id="quick-expense-description"
                                            type="text"
                                            name="description"
                                            value={quickExpenseForm.description}
                                            onChange={handleQuickExpenseChange}
                                            placeholder="e.g. Lunch at Java House"
                                            className="mt-2 w-full rounded-[1rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="quick-expense-category" className="text-sm font-semibold text-slate-700">Category</label>
                                        <select
                                            id="quick-expense-category"
                                            name="category"
                                            value={quickExpenseForm.category}
                                            onChange={handleQuickExpenseChange}
                                            className="mt-2 w-full rounded-[1rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none"
                                        >
                                            <option value="">Select category</option>
                                            {quickCategories.map((category) => (
                                                <option key={category.uuid || category.id} value={category.value}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="quick-expense-type" className="text-sm font-semibold text-slate-700">Type</label>
                                            <select
                                                id="quick-expense-type"
                                                name="type"
                                                value={quickExpenseForm.type}
                                                onChange={handleQuickExpenseChange}
                                                className="mt-2 w-full rounded-[1rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none"
                                            >
                                                <option value="EXPENSE">Expense</option>
                                                <option value="SAVING">Savings</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="quick-expense-payment-method" className="text-sm font-semibold text-slate-700">Payment Method</label>
                                            <select
                                                id="quick-expense-payment-method"
                                                name="payment_method"
                                                value={quickExpenseForm.payment_method}
                                                onChange={handleQuickExpenseChange}
                                                className="mt-2 w-full rounded-[1rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none"
                                            >
                                                <option value="MPESA">M-Pesa</option>
                                                <option value="CASH">Cash</option>
                                                <option value="CARD">Card</option>
                                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={quickExpenseSubmitting} className="mt-2 inline-flex w-full items-center justify-center rounded-[1rem] bg-[#0f6a57] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">
                                        {quickExpenseSubmitting ? 'Adding Expense...' : '+ Add Expense'}
                                    </button>
                                </form>
                            </article>

                            <article className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#f8fcfa] text-slate-600">
                                        <Receipt size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">{currentMonthLabel} Summary</p>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {monthlySummaryRows.map((item) => (
                                        <div key={item.label} className={`flex items-center justify-between rounded-[0.95rem] px-4 py-3 ${item.shell}`}>
                                            <span className="text-sm font-semibold">{item.label}</span>
                                            <span className="text-[1.05rem] font-extrabold">{item.value}</span>
                                        </div>
                                    ))}
                                    <button type="button" className="inline-flex w-full items-center justify-center rounded-[1rem] border border-[#bfe2d6] bg-[#f8fcfa] px-4 py-3 text-sm font-semibold text-[#166a55]">
                                        Export Statement
                                    </button>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef8f4] text-[#166a55]">
                                <Sparkles size={18} />
                            </div>
                            <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Expense Signals</p>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {Object.keys(expenseByMethod).length ? Object.entries(expenseByMethod).map(([label, value]) => (
                                <div key={label} className="rounded-[1rem] border border-[#edf5f1] bg-[#f8fcfa] px-4 py-4">
                                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                                    <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{formatCurrency(value, currency)}</p>
                                </div>
                            )) : (
                                <div className="rounded-[1rem] border border-[#edf5f1] bg-[#f8fcfa] px-4 py-4 text-sm text-slate-500 md:col-span-3">Add expenses to see how spending is split across cash, card, and mobile money.</div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'goals' && (
                <div className="space-y-4">
                    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e8] text-[#d94d4d]">
                                <Target size={18} />
                            </div>
                            <p className="text-[1.5rem] font-bold tracking-tight text-slate-950">Savings Goals</p>
                        </div>
                        <button type="button" onClick={() => onNavigate('goals')} className="inline-flex h-10 items-center rounded-full bg-[#0f6a57] px-5 text-sm font-semibold text-white">
                            + New Goal
                        </button>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-3">
                        {savingsItems.length ? savingsItems.slice(0, 3).map((item, index) => {
                            const visual = getSavingsVisual(item.title, index);
                            const Icon = visual.icon;
                            return (
                                <article key={item.title} className={`rounded-[1.35rem] border px-4 py-4 shadow-sm ${visual.tone}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white shadow-sm">
                                                <Icon size={18} className={visual.amount} />
                                            </div>
                                            <div>
                                                <p className="text-[1.15rem] font-bold tracking-tight text-slate-950">{item.title}</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {item.helper}{item.due ? ` · ${item.due}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${visual.badge}`}>{visual.label}</span>
                                    </div>

                                    <p className={`mt-5 text-[2rem] font-extrabold tracking-tight ${visual.amount}`}>{formatCurrency(item.current, currency)}</p>
                                    <p className="mt-1 text-sm text-slate-400">of {formatCurrency(item.target, currency)} target</p>

                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Progress</span>
                                        <span className={`font-semibold ${visual.amount}`}>{Math.round(item.progress)}%</span>
                                    </div>
                                    <div className="mt-2 h-2.5 rounded-full bg-white">
                                        <div className="h-2.5 rounded-full" style={{ width: `${Math.min(item.progress, 100)}%`, backgroundColor: visual.bar }} />
                                    </div>

                                    <p className="mt-3 text-sm text-slate-600">
                                        Saving {formatCurrency(Math.max(item.target - item.current, 0) / Math.max(1, 6), currency)}/mo · {item.due ? `goal by ${item.due}` : 'keep contributing monthly'}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => onNavigate('goals')}
                                        className="mt-4 inline-flex w-full items-center justify-center rounded-[0.95rem] border px-4 py-3 text-sm font-semibold"
                                        style={{ borderColor: visual.bar, color: visual.bar, backgroundColor: '#ffffff99' }}
                                    >
                                        {item.action} →
                                    </button>
                                </article>
                            );
                        }) : (
                            <div className="xl:col-span-3">
                                <EmptyCard title="No savings goals yet" body="Create a goal or add a savings budget category to see this section come alive." cta="Create Goal" onClick={() => onNavigate('goals')} />
                            </div>
                        )}
                    </section>
                </div>
            )}

            {activeView === 'bills' && (
                <div className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
                        <article className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e8] text-[#b56a00]">
                                        <CalendarDays size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Bills tracked - {currentMonthLabel}</p>
                                </div>
                                <button type="button" onClick={() => onNavigate('budgets')} className="text-sm font-semibold text-[#166a55]">
                                    + Track Bill
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {billActionError && (
                                    <div className="rounded-[1rem] border border-[#f2c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#d94d4d]">
                                        {billActionError}
                                    </div>
                                )}
                                {billActionMessage && (
                                    <div className="rounded-[1rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm text-[#166a55]">
                                        {billActionMessage}
                                    </div>
                                )}
                                {billItems.length ? billItems.map((item, index) => {
                                    const visual = getBillVisual(item.category_name, index);
                                    const Icon = visual.icon;
                                    const outstandingAmount = Math.max(toNumber(item.allocated) - toNumber(item.spent), 0);
                                    const canPayNow = visual.status === 'Pay Now' && outstandingAmount > 0;
                                    return (
                                        <article key={`${item.uuid}-bill`} className={`rounded-[1.05rem] border px-4 py-4 ${visual.tone}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white shadow-sm">
                                                        <Icon size={18} className={visual.amount} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{item.category_name}</p>
                                                        <p className="mt-1 text-sm text-slate-400">{item.status === 'ON_TRACK' ? 'Auto-pay ON' : 'Auto-pay OFF'} · {item.dueLabel}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-[1.15rem] font-extrabold ${visual.amount}`}>{formatCurrency(outstandingAmount || item.allocated, item.currency || currency)}</p>
                                                    {canPayNow ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePayBill(item)}
                                                            disabled={payingBillId === item.uuid}
                                                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${visual.pill} disabled:opacity-70`}
                                                        >
                                                            {payingBillId === item.uuid ? 'Paying...' : 'Pay Now'}
                                                        </button>
                                                    ) : (
                                                        <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${visual.pill}`}>{outstandingAmount <= 0 ? 'Paid ✓' : `${visual.status}${visual.status === 'Scheduled' ? ' ✓' : visual.status === 'Auto' ? ' ✓' : ''}`}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }) : (
                                    <EmptyCard title="No bills tracked yet" body="Create categories like utilities, school fees, insurance, or subscriptions to manage them here." cta="Track Bill" onClick={() => onNavigate('budgets')} />
                                )}
                            </div>
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff6e8] text-[#b56a00]">
                                        <Lightbulb size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Bills tracked optimisation tips</p>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="rounded-[1rem] border border-[#f2c2c2] bg-[#fff5f5] px-4 py-4 text-sm leading-6 text-slate-700">
                                        <p className="font-semibold text-[#d94d4d]">Enable KPLC auto-pay</p>
                                        <p className="mt-1">Avoid late payment penalties. Set up M-Pesa auto-pay so power stays uninterrupted.</p>
                                    </div>
                                    <div className="rounded-[1rem] border border-[#f0d39a] bg-[#fffaf0] px-4 py-4 text-sm leading-6 text-slate-700">
                                        <p className="font-semibold text-[#b56a00]">Pay insurance annually</p>
                                        <p className="mt-1">Switching to annual payment can reduce fees and keep monthly cash flow cleaner.</p>
                                    </div>
                                    <div className="rounded-[1rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-4 text-sm leading-6 text-slate-700">
                                        <p className="font-semibold text-[#166a55]">Audit subscriptions</p>
                                        <p className="mt-1">Review recurring services so you only keep the subscriptions you actually use.</p>
                                        <button type="button" onClick={() => setActiveView('expenses')} className="mt-3 inline-flex rounded-full bg-[#0f6a57] px-4 py-2 text-sm font-semibold text-white">
                                            Audit Now
                                        </button>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-[1.5rem] border border-[#bfe2d6] bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#f2edff] text-[#7a57d1]">
                                        <BarChart3 size={18} />
                                    </div>
                                    <p className="text-[1.35rem] font-bold tracking-tight text-slate-950">Monthly bills tracked</p>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between rounded-[0.95rem] bg-[#edf8f3] px-4 py-3 text-sm font-semibold text-slate-800">
                                        <span>Essential bills tracked</span>
                                        <span className="text-[#166a55]">{formatCurrency(essentialBills, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-[0.95rem] bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-slate-800">
                                        <span>Subscriptions</span>
                                        <span className="text-[#d94d4d]">{formatCurrency(subscriptionBills, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-[0.95rem] bg-[#edf8f3] px-4 py-3 text-sm font-semibold text-slate-800">
                                        <span>Total bills tracked</span>
                                        <span className="text-[#166a55]">{formatCurrency(totalMonthlyBills, currency)}</span>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            )}
            <section className="overflow-hidden rounded-[1.55rem] bg-[linear-gradient(135deg,_#0d4d40_0%,_#1a6e5a_55%,_#2b7d68_100%)] px-5 py-5 text-white shadow-[0_18px_44px_rgba(15,77,64,0.18)]">
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-[1.45rem] font-extrabold tracking-tight">Your Budget Connects the Full Ecosystem</p>
                        <p className="mt-2 max-w-4xl text-sm leading-6 text-white/78">Every category and expense you log flows into your goals, debt manager, net worth, investments, and broader financial health.</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        {ecosystemCards.map(({ title, helper, cta, icon: Icon, action }) => (
                            <button key={title} type="button" onClick={action} className="rounded-[1.1rem] border border-white/15 bg-white/8 px-4 py-4 text-left transition-all hover:bg-white/12">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-[#166a55] shadow-sm">
                                    <Icon size={18} />
                                </div>
                                <p className="mt-4 text-sm font-bold text-white">{title}</p>
                                <p className="mt-1 text-sm text-white/70">{helper}</p>
                                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#f0c94d]">{cta}<ArrowRight size={13} /></span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {showCustomSplitModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4">
                    <div className="w-full max-w-[34rem] rounded-[1.25rem] bg-white p-4 sm:p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#fff3d8] text-[#9a6200]">
                                    <Pencil size={17} />
                                </div>
                                <div>
                                    <p className="text-[1.28rem] font-bold tracking-tight text-slate-950">Custom Budget Split</p>
                                    <p className="mt-1 text-sm leading-5 text-slate-600">Your three values must add up to exactly 100%. Income used: {formatCurrency(customSplitIncome, currency)}/mo</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeCustomSplitModal}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8ece3] text-slate-500 hover:bg-[#f8fcfa]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="mt-4 rounded-[0.95rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm leading-5 text-slate-700">
                            Your three values must add up to exactly 100%. Income used: <span className="font-semibold text-[#166a55]">{formatCurrency(customSplitIncome, currency)}/mo</span>
                        </div>

                        <div className="mt-4 space-y-3.5">
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700">Budget Name</span>
                                <input
                                    type="text"
                                    value={customBudgetName}
                                    onChange={(event) => setCustomBudgetName(event.target.value)}
                                    placeholder="e.g. My 2026 Plan"
                                    className="mt-2 w-full rounded-[0.95rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </label>

                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">Needs (%) - Housing, Food, Transport</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={customSplit.needs}
                                        onChange={(event) => handleCustomSplitChange('needs', event.target.value)}
                                        className="mt-2 w-full rounded-[0.95rem] border border-[#d8ece3] px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-semibold text-slate-700">Wants (%) - Entertainment, Lifestyle</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={customSplit.wants}
                                        onChange={(event) => handleCustomSplitChange('wants', event.target.value)}
                                        className="mt-2 w-full rounded-[0.95rem] border border-[#d8ece3] px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700">Savings / Debt (%) - Investments, Emergency, Debt</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={customSplit.savings}
                                    onChange={(event) => handleCustomSplitChange('savings', event.target.value)}
                                    className="mt-2 w-full rounded-[0.95rem] border border-[#d8ece3] px-4 py-3 text-sm font-semibold text-slate-900 outline-none"
                                />
                            </label>
                        </div>

                        <div className="mt-4 rounded-[0.95rem] bg-[#f8fcfa] px-4 py-3 text-sm leading-6 text-slate-700">
                            <div className="flex flex-wrap gap-3">
                                <span>Needs: <span className="font-semibold text-[#166a55]">{formatCurrency((customSplitIncome * customSplit.needs) / 100, currency)}</span></span>
                                <span>Wants: <span className="font-semibold text-[#b56a00]">{formatCurrency((customSplitIncome * customSplit.wants) / 100, currency)}</span></span>
                                <span>Savings: <span className="font-semibold text-[#2f74db]">{formatCurrency((customSplitIncome * customSplit.savings) / 100, currency)}</span></span>
                            </div>
                            <p className={`mt-2 font-semibold ${customSplitTotal === 100 ? 'text-[#166a55]' : 'text-[#d94d4d]'}`}>
                                {customSplitTotal === 100 ? `Total: ${customSplitTotal}%` : `Total: ${customSplitTotal}% - adjust to 100%`}
                            </p>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeCustomSplitModal}
                                className="inline-flex items-center justify-center rounded-[0.95rem] border border-[#d8ece3] px-5 py-3 text-sm font-semibold text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyCustomSplit}
                                className="inline-flex items-center justify-center rounded-[0.95rem] bg-[#0f6a57] px-6 py-3 text-sm font-semibold text-white"
                            >
                                Apply Custom Split
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModelModal && pendingModel && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4">
                    <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                        <div className="flex items-start gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#edf8f3] text-[#166a55]">
                                <Check size={18} />
                            </div>
                            <div>
                                <p className="text-[1.25rem] font-bold tracking-tight text-slate-950">{pendingModel.label}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{pendingModel.description}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <SplitChip label={`Needs ${pendingModel.split.needs}%`} shell="bg-[#e7f6f1] text-[#166a55]" />
                            <SplitChip label={`Wants ${pendingModel.split.wants}%`} shell="bg-[#fff3d8] text-[#b56a00]" />
                            <SplitChip label={`Savings ${pendingModel.split.savings}%`} shell="bg-[#eef4ff] text-[#2f74db]" />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowModelModal(false)}
                                className="inline-flex rounded-[0.9rem] bg-[#0f4d40] px-4 py-2.5 text-sm font-semibold text-white"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetOverview;
