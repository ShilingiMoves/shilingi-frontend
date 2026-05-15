import React, { useEffect, useMemo, useRef, useState } from 'react';
import NumericInput from '../../common/NumericInput';
import {
    AlertTriangle,
    ArrowRight,
    BadgeDollarSign,
    BarChart3,
    CalendarDays,
    Check,
    ChevronDown,
    Download,
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
import { getBudgetTypeLimit, readBudgetSetup, saveBudgetSetup } from '../../../utils/budgetSetup';
import { createExpense, getCategories } from '../../../services/budgetApi';

const budgetModels = [
    { id: 'classic', label: '50/30/20 Classic Budget', description: 'Most popular all-purpose budget', split: { needs: 50, wants: 30, savings: 20 } },
    { id: 'aggressive', label: '30/20/50 Aggressive Saver', description: 'FIRE path with maximum wealth building', split: { needs: 30, wants: 20, savings: 50 } },
    { id: 'city', label: '60/20/20 High-Cost Living', description: 'Good for higher rent cities and family costs', split: { needs: 60, wants: 20, savings: 20 } },
    { id: 'debt', label: '50/20/30 Debt Destroyer', description: 'Aggressively eliminate debt fast', split: { needs: 50, wants: 20, savings: 30 } },
    { id: 'balanced', label: '40/40/20 Balanced', description: 'Equal room for needs and wants', split: { needs: 40, wants: 40, savings: 20 } },
];

const tabOptions = [
    { id: 'compare', label: 'Compare Budget Types', icon: Sparkles },
    { id: 'categories', label: 'My Budget Limits', icon: Wallet },
    { id: 'expenses', label: 'My Expense Tracker', icon: Receipt },
    { id: 'summary', label: 'My Budget Summary', icon: BarChart3 },
];

const categoryMeta = (name = '') => {
    const normalized = String(name).toLowerCase();
    if (normalized.includes('housing') || normalized.includes('rent') || normalized.includes('mortgage')) return { type: 'Needs', icon: Home, tint: 'bg-[#fff6e8] text-[#b56a00]', chip: 'bg-[#e7f6f1] text-[#11814f]', bar: '#d38a12' };
    if (normalized.includes('food') || normalized.includes('grocery') || normalized.includes('dining')) return { type: 'Needs', icon: ShoppingBasket, tint: 'bg-[#eef8f4] text-[#11814f]', chip: 'bg-[#e7f6f1] text-[#11814f]', bar: '#11814f' };
    if (normalized.includes('transport') || normalized.includes('travel') || normalized.includes('fuel')) return { type: 'Needs', icon: Landmark, tint: 'bg-[#eef4ff] text-[#2f74db]', chip: 'bg-[#e7f6f1] text-[#11814f]', bar: '#3b82f6' };
    if (normalized.includes('utilit') || normalized.includes('power') || normalized.includes('water') || normalized.includes('internet')) return { type: 'Needs', icon: Zap, tint: 'bg-[#f3ecff] text-[#7a57d1]', chip: 'bg-[#e7f6f1] text-[#11814f]', bar: '#8b5fd3' };
    if (normalized.includes('school') || normalized.includes('fee') || normalized.includes('education')) return { type: 'Needs', icon: GraduationCap, tint: 'bg-[#eef4ff] text-[#2f74db]', chip: 'bg-[#e7f6f1] text-[#11814f]', bar: '#4c8ee8' };
    if (normalized.includes('saving') || normalized.includes('invest') || normalized.includes('goal')) return { type: 'Savings', icon: PiggyBank, tint: 'bg-[#eef8f4] text-[#11814f]', chip: 'bg-[#eef4ff] text-[#2f74db]', bar: '#11814f' };
    if (normalized.includes('entertain') || normalized.includes('fun') || normalized.includes('game')) return { type: 'Wants', icon: Flame, tint: 'bg-[#fff1ef] text-[#d94d4d]', chip: 'bg-[#fff6e8] text-[#b56a00]', bar: '#e24a4a' };
    return { type: 'Needs', icon: Wallet, tint: 'bg-[#f6fbf8] text-[#11814f]', chip: 'bg-[#e7f6f1] text-[#11814f]', bar: '#11814f' };
};

const statusMeta = {
    ON_TRACK: { label: 'On Track', card: 'border-[#bfe2d6] bg-white', badge: 'bg-[#e7f6f1] text-[#11814f]' },
    WARNING: { label: 'Watch Spend', card: 'border-[#f0d39a] bg-[#fffaf0]', badge: 'bg-[#fff3d8] text-[#b56a00]' },
    OVER_BUDGET: { label: 'Over Budget', card: 'border-[#f2bcbc] bg-[#fff5f5]', badge: 'bg-[#ffe7e7] text-[#d94d4d]' },
    default: { label: 'Active', card: 'border-[#bfe2d6] bg-white', badge: 'bg-[#eef8f4] text-[#11814f]' },
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
    if (normalized.includes('emergency')) return { icon: ShieldCheck, tone: 'border-[#bfe2d6] bg-[linear-gradient(180deg,_#f8fcfb_0%,_#eff8f4_100%)]', amount: 'text-[#11814f]', bar: '#11814f', badge: 'bg-[#e7f6f1] text-[#11814f]', label: 'Short' };
    if (normalized.includes('holiday') || normalized.includes('travel')) return { icon: Rocket, tone: 'border-[#f0d39a] bg-[linear-gradient(180deg,_#fffdf7_0%,_#fff7e8_100%)]', amount: 'text-[#c98512]', bar: '#f5a623', badge: 'bg-[#fff3d8] text-[#b56a00]', label: 'Medium' };
    if (normalized.includes('house') || normalized.includes('home')) return { icon: Home, tone: 'border-[#c9d7f4] bg-[linear-gradient(180deg,_#fbfdff_0%,_#f2f7ff_100%)]', amount: 'text-[#2f74db]', bar: '#4c8ee8', badge: 'bg-[#f2edff] text-[#7a57d1]', label: 'Long' };
    if (index % 3 === 1) return { icon: Rocket, tone: 'border-[#f0d39a] bg-[linear-gradient(180deg,_#fffdf7_0%,_#fff7e8_100%)]', amount: 'text-[#c98512]', bar: '#f5a623', badge: 'bg-[#fff3d8] text-[#b56a00]', label: 'Medium' };
    if (index % 3 === 2) return { icon: Home, tone: 'border-[#c9d7f4] bg-[linear-gradient(180deg,_#fbfdff_0%,_#f2f7ff_100%)]', amount: 'text-[#2f74db]', bar: '#4c8ee8', badge: 'bg-[#f2edff] text-[#7a57d1]', label: 'Long' };
    return { icon: ShieldCheck, tone: 'border-[#bfe2d6] bg-[linear-gradient(180deg,_#f8fcfb_0%,_#eff8f4_100%)]', amount: 'text-[#11814f]', bar: '#11814f', badge: 'bg-[#e7f6f1] text-[#11814f]', label: 'Short' };
};

const getBillVisual = (title = '', index = 0) => {
    const normalized = String(title).toLowerCase();
    if (normalized.includes('kplc') || normalized.includes('electric')) return { icon: Zap, tone: 'border-[#f2c2c2] bg-[#fff5f5]', amount: 'text-[#d94d4d]', pill: 'bg-[#ef4444] text-white', status: 'Pay Now' };
    if (normalized.includes('fibre') || normalized.includes('internet') || normalized.includes('safaricom')) return { icon: Landmark, tone: 'border-[#f0d39a] bg-[#fffaf0]', amount: 'text-[#b56a00]', pill: 'bg-[#fff3d8] text-[#b56a00]', status: 'Auto' };
    if (normalized.includes('loan') || normalized.includes('emi')) return { icon: BadgeDollarSign, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#11814f]', pill: 'bg-[#e7f6f1] text-[#11814f]', status: 'Scheduled' };
    if (normalized.includes('insurance')) return { icon: HeartHandshake, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#11814f]', pill: 'bg-[#eef8f4] text-[#11814f]', status: 'Auto' };
    if (normalized.includes('nhif') || normalized.includes('sha')) return { icon: CalendarDays, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#11814f]', pill: 'bg-[#eef8f4] text-[#11814f]', status: 'Auto' };
    return index === 0
        ? { icon: Zap, tone: 'border-[#f2c2c2] bg-[#fff5f5]', amount: 'text-[#d94d4d]', pill: 'bg-[#ef4444] text-white', status: 'Pay Now' }
        : { icon: CalendarDays, tone: 'border-[#bfe2d6] bg-[#f8fcfa]', amount: 'text-[#11814f]', pill: 'bg-[#eef8f4] text-[#11814f]', status: 'Auto' };
};

const normaliseLabel = (value = '') => String(value).trim().toLowerCase();

const SplitChip = ({ label, shell }) => <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${shell}`}>{label}</span>;

const displayFont = { fontFamily: '"Fraunces", Georgia, serif' };

const MetricCard = ({ title, value, helper, accent, line }) => (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1rem] border border-[#d0e8df] bg-white shadow-[0_1px_5px_rgba(27,107,90,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(27,107,90,0.13)]">
        <div className="flex flex-1 flex-col justify-between px-4 py-3.5">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#9ab8af]">{title}</p>
            <p className={`mt-2 text-[1.35rem] font-extrabold leading-tight tracking-tight sm:text-[1.5rem] ${accent}`} style={displayFont}>{value}</p>
            <p className="mt-2 min-h-[1.65rem] text-[11px] leading-4 text-[#3d6158]">{helper}</p>
        </div>
        <div className={`h-0.5 w-full ${line}`} />
    </article>
);

const SectionTitle = ({ icon: Icon, title, subtitle, action }) => (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.7rem] bg-[#e8f5f0] text-[#11814f]">
                <Icon size={17} />
            </span>
            <div>
                <p className="text-[1.25rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>{title}</p>
                {subtitle && <p className="mt-1 text-sm leading-5 text-[#7a9e94]">{subtitle}</p>}
            </div>
        </div>
        {action}
    </div>
);

const HealthMiniCard = ({ value, label, shell }) => (
    <div className={`rounded-[1rem] px-4 py-4 text-center ${shell}`}>
        <p className="text-4xl font-extrabold" style={displayFont}>{value}</p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em]">{label}</p>
    </div>
);

const ActionPill = ({ label, onClick, emphasis = false }) => (
    <button type="button" onClick={onClick} className={`rounded-[0.85rem] border px-3 py-2 text-sm font-semibold transition-colors ${emphasis ? 'border-[#f0d39a] bg-[#fff6e8] text-[#9a6200]' : 'border-[#bfe2d6] bg-[#eef8f4] text-[#11814f] hover:bg-[#e5f4ee]'}`}>{label}</button>
);

const ActionCard = ({ title, body, cta, onClick }) => (
    <div className="rounded-[1rem] border border-[#d8ece3] bg-[#f8fcfa] px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#a8d4c4] hover:shadow-[0_8px_24px_rgba(27,107,90,0.10)]">
        <p className="text-base font-bold text-[#0d2b22]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#3d6158]">{body}</p>
        <button type="button" onClick={onClick} className="mt-3 rounded-[0.65rem] border border-[#a8d4c4] bg-[#e8f5f0] px-3.5 py-2 text-sm font-bold text-[#11814f] transition-colors hover:bg-[#11814f] hover:text-white">{cta}</button>
    </div>
);

const EmptyCard = ({ title, body, cta, onClick }) => (
    <div className="rounded-[1.2rem] border border-dashed border-[#bfe2d6] bg-white px-5 py-10 text-center">
        <p className="text-base font-bold text-slate-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
        <button type="button" onClick={onClick} className="mt-4 rounded-[0.9rem] border border-[#bfe2d6] bg-[#eef8f4] px-4 py-2 text-sm font-semibold text-[#11814f]">{cta}</button>
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

const BudgetLimitRowCard = ({ row, currency }) => (
    <tr className="border-b border-[#edf5f1] last:border-b-0">
        <td className="py-4 pr-3">
            <div className="flex items-center gap-3">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] ${row.tint}`}>
                    <row.icon size={17} />
                </span>
                <div>
                    <p className="font-semibold text-slate-900">{row.category}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{row.helper}</p>
                </div>
            </div>
        </td>
        <td className="py-4 pr-3">
            <div>
                <p className="font-semibold text-[#11814f]">{formatCurrency(row.setLimit, currency)}</p>
                <p className="mt-0.5 text-xs text-slate-500">{row.percent}% from selected budget type</p>
            </div>
        </td>
        <td className="py-4 pr-3 text-sm text-slate-700">{row.itemLabel}</td>
        <td className="py-4 font-semibold text-slate-900">{formatCurrency(row.currentAmount, currency)}</td>
    </tr>
);

const ExpenseTrackerRowCard = ({ expense, summaryRows, currency }) => {
    const budgetRow = summaryRows.find((item) => String(item.category_name || '').toLowerCase() === String(expense.category_name || '').toLowerCase());
    const meta = categoryMeta(expense.category_name);

    return (
        <tr className="border-b border-[#edf5f1] last:border-b-0">
            <td className="py-4 pr-3">
                <div className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] ${meta.tint}`}>
                        <meta.icon size={17} />
                    </span>
                    <div>
                        <p className="font-semibold text-slate-900">{expense.category_name || 'Category'}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{meta.type} lane</p>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-3 font-semibold text-[#11814f]">{formatCurrency(budgetRow?.allocated || 0, budgetRow?.currency || currency)}</td>
            <td className="py-4 pr-3 text-sm text-slate-700">{expense.description} {expense.payment_method ? `· ${paymentMethodLabel(expense.payment_method)}` : ''}</td>
            <td className="py-4 font-semibold text-slate-900">{formatCurrency(expense.amount, expense.currency || currency)}</td>
        </tr>
    );
};

const BudgetCategoryCard = ({ item, currency, onNavigate }) => {
    const meta = categoryMeta(item.category_name);
    const status = statusMeta[item.status] || statusMeta.default;
    const allocated = toNumber(item.amount);
    const spent = toNumber(item.total_spent);
    const left = allocated - spent;
    const progress = allocated > 0 ? clamp((spent / allocated) * 100) : 0;
    const statusShell =
        item.status === 'OVER_BUDGET'
            ? 'border-[#f2bcbc] bg-[#fff0f0]'
            : item.status === 'WARNING'
                ? 'border-[#f0d39a] bg-[#fffbeb]'
                : meta.type === 'Savings'
                    ? 'border-[#bfe2d6] bg-[#f2faf7]'
                    : 'border-[#d0e8df] bg-white';

    return (
        <article className={`relative overflow-hidden rounded-[1rem] border p-4 shadow-[0_1px_5px_rgba(27,107,90,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(27,107,90,0.13)] ${statusShell}`}>
            <span className={`absolute right-0 top-0 rounded-bl-[0.7rem] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${status.badge}`}>
                {status.label}
            </span>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.75rem] ${meta.tint}`}>
                        <meta.icon size={18} />
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[1rem] font-extrabold text-[#0d2b22]">{item.category_name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.chip}`}>{meta.type}</span>
                        </div>
                        <p className="mt-1 text-xs text-[#7a9e94]">{helperCopy(item.category_name)}</p>
                    </div>
                </div>
                <div className="mt-4 shrink-0 text-right sm:mt-2">
                    <p className="text-[1.45rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>{formatCurrency(spent, item.currency || currency)}</p>
                    <p className="text-xs text-[#7a9e94]">of {formatCurrency(allocated, item.currency || currency)} budget</p>
                    <p className={`mt-1 text-xs font-extrabold ${left < 0 ? 'text-[#d94d4d]' : 'text-[#11814f]'}`}>{left < 0 ? `-${formatCurrency(Math.abs(left), item.currency || currency)} over` : `${formatCurrency(left, item.currency || currency)} left`}</p>
                </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-[#edf5f1]">
                <div className="h-2 rounded-full transition-[width] duration-700" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: meta.bar }} />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs">
                <p className={`${left < 0 ? 'font-bold text-[#d94d4d]' : 'text-[#7a9e94]'}`}>{left < 0 ? `${formatCurrency(Math.abs(left), item.currency || currency)} over budget this month` : `${Math.round(progress)}% used`}</p>
                <p className="font-extrabold text-[#3d6158]">{Math.round(progress)}%</p>
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
    const storedBudgetSetup = readBudgetSetup();
    const [activeView, setActiveView] = useState('compare');
    const [selectedModelId, setSelectedModelId] = useState(storedBudgetSetup?.id || 'custom');
    const [hasChosenBudgetType, setHasChosenBudgetType] = useState(Boolean(storedBudgetSetup?.split));
    const [budgetTypePrompt, setBudgetTypePrompt] = useState('');
    const [budgetTypeSuccess, setBudgetTypeSuccess] = useState('');
    const [showModelModal, setShowModelModal] = useState(false);
    const [pendingModel, setPendingModel] = useState(null);
    const [showCustomSplitModal, setShowCustomSplitModal] = useState(false);
    const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);
    const [customBudgetName, setCustomBudgetName] = useState('');
    const [customSplit, setCustomSplit] = useState(storedBudgetSetup?.id === 'custom' && storedBudgetSetup?.split ? storedBudgetSetup.split : { needs: 45, wants: 25, savings: 30 });
    const [expenseFilter, setExpenseFilter] = useState('all');
    const [quickCategories, setQuickCategories] = useState([]);
    const [quickExpenseSubmitting, setQuickExpenseSubmitting] = useState(false);
    const [quickExpenseError, setQuickExpenseError] = useState('');
    const [quickExpenseSuccess, setQuickExpenseSuccess] = useState('');
    const [payingBillId, setPayingBillId] = useState(null);
    const [billActionMessage, setBillActionMessage] = useState('');
    const [billActionError, setBillActionError] = useState('');
    const [shoppingItemForm, setShoppingItemForm] = useState({ name: '', estimate: '', category: '' });
    const [shoppingItems, setShoppingItems] = useState([]);
    const [shoppingMessage, setShoppingMessage] = useState('');
    const [shoppingError, setShoppingError] = useState('');
    const [loggingShoppingId, setLoggingShoppingId] = useState(null);
    const compareSectionRef = useRef(null);
    const compareModelsRef = useRef(null);
    const budgetItemsRef = useRef(null);
    const expensesSectionRef = useRef(null);
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
    const allBudgetModels = useMemo(() => [customModel, ...budgetModels], [customModel]);
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
    const hasBudgetPlan = activeBudgets.length > 0 && totalBudgeted > 0;
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
                setShoppingItemForm((current) => ({
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
        setBudgetTypePrompt('Choose a budget type first so the planner can set your limits automatically.');
        setActiveView('compare');
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                compareSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    };

    const openCompareModels = () => {
        setActiveView('compare');
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                compareModelsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    };

    const openExpensesView = () => {
        setActiveView('expenses');
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                expensesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    };

    const openBudgetItemsView = () => {
        setActiveView('categories');
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() => {
                budgetItemsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    };

    const applyBudgetModel = (model) => {
        if (model.id === 'custom') {
            openCustomSplitModal();
            return;
        }
        setSelectedModelId(model.id);
        setHasChosenBudgetType(true);
        setBudgetTypePrompt('');
        setBudgetTypeSuccess(`${model.label} selected. Now add your items under My Budget Limits.`);
        saveBudgetSetup({ id: model.id, label: model.label, split: model.split });
        openBudgetItemsView();
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
        setHasChosenBudgetType(true);
        setBudgetTypePrompt('');
        setBudgetTypeSuccess('Custom budget selected. Now add your items under My Budget Limits.');
        saveBudgetSetup({ id: 'custom', label: customBudgetName.trim() || 'Custom Split', split: customSplit });
        setShowCustomSplitModal(false);
        setPendingModel(null);
        setShowModelModal(false);
        openBudgetItemsView();
    };

    const handleStartBudgetTypeSelection = () => {
        openCompareView();
    };

    const handleOpenBudgetItems = () => {
        if (!hasChosenBudgetType) {
            openCompareView();
            return;
        }

        openBudgetItemsView();
    };

    const handleOpenQuickExpense = () => {
        if (!hasChosenBudgetType) {
            openCompareView();
            return;
        }

        openExpensesView();
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

        const selectedCategoryName = quickCategories.find((item) => String(item.value) === String(quickExpenseForm.category))?.name || '';
        const matchingBudget = summaryRows.find((item) => String(item.category_name || '').toLowerCase() === selectedCategoryName.toLowerCase());
        if (matchingBudget) {
            const remainingAvailable = Math.max(toNumber(matchingBudget.allocated) - toNumber(matchingBudget.spent), 0);
            if (Number(quickExpenseForm.amount || 0) > remainingAvailable) {
                setQuickExpenseError(`No. This expense goes over the remaining budget for ${matchingBudget.category_name}. Remaining available is KES ${remainingAvailable.toLocaleString('en-KE')}.`);
                return;
            }
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
            setShowQuickExpenseModal(false);
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

    const handleShoppingItemChange = (event) => {
        const { name, value } = event.target;
        setShoppingError('');
        setShoppingMessage('');
        setShoppingItemForm((current) => ({ ...current, [name]: value }));
    };

    const handleAddShoppingItem = (event) => {
        event.preventDefault();
        setShoppingError('');
        setShoppingMessage('');

        if (!shoppingItemForm.name.trim()) {
            setShoppingError('Add the item you plan to buy.');
            return;
        }

        if (shoppingItemForm.estimate && Number(shoppingItemForm.estimate) < 0) {
            setShoppingError('Budget estimate cannot be negative.');
            return;
        }

        setShoppingItems((current) => [
            ...current,
            {
                id: `shopping-${Date.now()}`,
                name: shoppingItemForm.name.trim(),
                estimate: toNumber(shoppingItemForm.estimate),
                actual: '',
                checked: false,
                category: shoppingItemForm.category,
            },
        ]);
        setShoppingItemForm((current) => ({ ...current, name: '', estimate: '' }));
    };

    const updateShoppingItem = (id, updates) => {
        setShoppingError('');
        setShoppingMessage('');
        setShoppingItems((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    };

    const removeShoppingItem = (id) => {
        setShoppingItems((current) => current.filter((item) => item.id !== id));
    };

    const handleLogShoppingItem = async (item) => {
        const amount = toNumber(item.actual || item.estimate);
        const category = item.category || shoppingItemForm.category || quickExpenseForm.category;

        setShoppingError('');
        setShoppingMessage('');

        if (amount <= 0) {
            setShoppingError('Enter the actual amount spent before logging this item.');
            return;
        }

        if (!category) {
            setShoppingError('Choose a budget category before logging shopping spend.');
            return;
        }

        setLoggingShoppingId(item.id);
        try {
            await createExpense({
                amount,
                description: item.name,
                category,
                payment_method: quickExpenseForm.payment_method,
                expense_date: new Date().toISOString().split('T')[0],
                currency,
            });

            updateShoppingItem(item.id, { checked: true, actual: amount });
            setShoppingMessage(`${item.name} has been added to expenses.`);
            onQuickExpenseAdded?.();
        } catch (error) {
            const errorMessage =
                error?.response?.data?.errors ||
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                'We could not log this shopping item right now.';
            setShoppingError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setLoggingShoppingId(null);
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
        { label: 'Total Income', value: formatCurrency(trackedIncome, currency), shell: 'bg-[#edf8f3] text-[#11814f]' },
        { label: 'Total Spent', value: formatCurrency(totalSpent, currency), shell: 'bg-[#fff3f3] text-[#d94d4d]' },
        { label: 'Total Saved', value: formatCurrency(savingsValue, currency), shell: 'bg-[#edf8f3] text-[#11814f]' },
        { label: 'Net Surplus', value: formatCurrency(remainingCash, currency), shell: 'bg-[#f3f7ff] text-[#2f74db]' },
    ];
    const shoppingPlannedTotal = shoppingItems.reduce((sum, item) => sum + toNumber(item.estimate), 0);
    const shoppingSpentTotal = shoppingItems.reduce((sum, item) => sum + toNumber(item.actual), 0);
    const shoppingRemaining = Math.max(shoppingPlannedTotal - shoppingSpentTotal, 0);
    const handleExportBudgetSummary = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const rows = [
            ['My Expense Summary', currentMonthLabel],
            [],
            ['Metric', 'Value'],
            ...monthlySummaryRows.map((item) => [item.label, item.value]),
            [],
            ['Category', 'Allocated', 'Spent', 'Remaining', 'Progress'],
            ...summaryRows.map((item) => [
                item.category_name,
                formatCurrency(item.allocated, item.currency || currency),
                formatCurrency(item.spent, item.currency || currency),
                formatCurrency(item.left, item.currency || currency),
                `${Math.round(item.progress)}%`,
            ]),
        ];
        const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-summary-${currentMonthLabel.toLowerCase().replace(/\s+/g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

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
    const budgetLimitRows = [
        {
            category: 'Needs',
            helper: 'Housing, food, transport, utilities',
            percent: selectedModel.split.needs,
            setLimit: Math.round((trackedIncome * selectedModel.split.needs) / 100),
            items: summaryRows.filter((item) => item.meta.type === 'Needs'),
            icon: Home,
            tint: 'bg-[#eef8f4] text-[#11814f]',
        },
        {
            category: 'Wants',
            helper: 'Lifestyle, entertainment, flexible spending',
            percent: selectedModel.split.wants,
            setLimit: Math.round((trackedIncome * selectedModel.split.wants) / 100),
            items: summaryRows.filter((item) => item.meta.type === 'Wants'),
            icon: Sparkles,
            tint: 'bg-[#fff6e8] text-[#b56a00]',
        },
        {
            category: 'Savings',
            helper: 'Goals, investments, emergency fund, debt',
            percent: selectedModel.split.savings,
            setLimit: Math.round((trackedIncome * selectedModel.split.savings) / 100),
            items: summaryRows.filter((item) => item.meta.type === 'Savings'),
            icon: PiggyBank,
            tint: 'bg-[#eef4ff] text-[#2f74db]',
        },
    ].map((row) => {
        const currentAmount = row.items.reduce((sum, item) => sum + item.allocated, 0);
        const itemLabel = row.items.length
            ? row.items.slice(0, 3).map((item) => item.category_name).join(', ')
            : `${row.category} items`;

        return {
            ...row,
            currentAmount,
            itemLabel: row.items.length > 3 ? `${itemLabel} +${row.items.length - 3} more` : itemLabel,
        };
    });
    const savingsLimitRow = budgetLimitRows.find((row) => row.category === 'Savings');
    const savingsSetLimit = savingsLimitRow?.setLimit || getBudgetTypeLimit({ split: selectedModel.split }, trackedIncome, 'Savings');
    const savingsGuidanceCards = [
        {
            title: 'Emergency Buffer in MMF',
            amount: Math.round(savingsSetLimit * 0.4),
            helper: 'Keep 3-6 months of essentials liquid in a money market fund for fast access and steadier returns than a normal account.',
            tone: 'border-[#bfe2d6] bg-[#edf8f3] text-[#11814f]',
        },
        {
            title: 'Short-Term Goals',
            amount: Math.round(savingsSetLimit * 0.25),
            helper: 'Use MMFs or a high-yield savings lane for goals coming up in under 12 months.',
            tone: 'border-[#f0d39a] bg-[#fff9ec] text-[#9a6200]',
        },
        {
            title: 'Treasury Bills',
            amount: Math.round(savingsSetLimit * 0.2),
            helper: 'Put part of your savings into T-Bills when you want low-risk parking for planned cash.',
            tone: 'border-[#c9d7f4] bg-[#f3f7ff] text-[#2f74db]',
        },
        {
            title: 'Long-Term Wealth',
            amount: Math.max(savingsSetLimit - Math.round(savingsSetLimit * 0.85), 0),
            helper: 'Channel the final slice into retirement, long-term investments, or disciplined debt reduction.',
            tone: 'border-[#ddd0ff] bg-[#f7f1ff] text-[#7a57d1]',
        },
    ];

    const modelVisuals = {
        classic: { icon: Sparkles, shell: 'border-[#bfe2d6] bg-[#f8fcfa]', accent: 'bg-[#11814f]', cta: 'bg-[#11814f] text-white', badge: 'bg-[#e7f6f1] text-[#11814f]', bestFor: 'Balanced lifestyle', note: 'Best for a balanced lifestyle with steady savings.' },
        aggressive: { icon: Rocket, shell: 'border-[#b9d5f2] bg-[#f8fbff]', accent: 'bg-[#3a7fd1]', cta: 'bg-[#3a7fd1] text-white', badge: 'bg-[#eef4ff] text-[#2f74db]', bestFor: 'FIRE path', note: 'Best for early retirement and fast wealth building.' },
        city: { icon: BarChart3, shell: 'border-[#bfe2d6] bg-[#f8fcfa]', accent: 'bg-[#f5a623]', cta: 'bg-[#f5a623] text-slate-950', badge: 'bg-[#fff3d8] text-[#b56a00]', bestFor: 'High rent', note: 'Best for higher rent cities while still protecting savings.' },
        debt: { icon: Swords, shell: 'border-[#f2c2c2] bg-[#fff8f8]', accent: 'bg-[#ef4444]', cta: 'bg-[#ef4444] text-white', badge: 'bg-[#ffe7e7] text-[#d94d4d]', bestFor: 'Debt payoff', note: 'Best for a high debt load and aggressive repayment.' },
        balanced: { icon: BadgeDollarSign, shell: 'border-[#bfe2d6] bg-[#f8fcfa]', accent: 'bg-[#f5a623]', cta: 'bg-[#f5a623] text-slate-950', badge: 'bg-[#f6f0db] text-[#9a6200]', bestFor: 'Equal split', note: 'Best for moderate lifestyle needs and wants.' },
        custom: { icon: Pencil, shell: 'border-[#d9d0f7] bg-[#fbf9ff]', accent: 'bg-[#7a57d1]', cta: 'bg-[#7a57d1] text-white', badge: 'bg-[#f2edff] text-[#7a57d1]', bestFor: 'Flexible limits', note: 'Best when you want the platform to calculate limits from your own split and monthly money picture.' },
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
        { title: totalRemaining >= 0 ? 'Budget still has room' : 'Entertainment over budget', body: totalRemaining >= 0 ? `You still have ${formatCurrency(totalRemaining, currency)} available inside your planned budget.` : `You are ${formatCurrency(Math.abs(totalRemaining), currency)} over your planned budget and should rebalance quickly.`, tone: totalRemaining >= 0 ? 'border-[#bfe2d6] bg-[#edf8f3] text-[#11814f]' : 'border-[#f2bcbc] bg-[#fff5f5] text-[#d94d4d]' },
        { title: 'Housing at a healthy level', body: trackedIncome > 0 ? `Your current housing allocation is ${formatCurrency(summaryRows.find((item) => item.category_name?.toLowerCase().includes('housing'))?.allocated || 0, currency)} against income ${formatCurrency(trackedIncome, currency)}.` : 'Add income to compare housing against your monthly inflow.', tone: 'border-[#f0d39a] bg-[#fff9ec] text-[#9a6200]' },
        { title: savingsValue > 0 ? 'Savings target is moving' : 'Savings target needs setup', body: savingsValue > 0 ? `You have ${formatCurrency(savingsValue, currency)} flowing into savings goals right now.` : 'Create a savings goal or savings category so auto-save can be tracked here.', tone: 'border-[#bfe2d6] bg-[#edf8f3] text-[#11814f]' },
    ];
    const healthScore = clamp(100 - (toNumber(budgetHealth?.over) * 14) - (toNumber(budgetHealth?.warning) * 7) - Math.max(0, spendingProgress - 90) * 0.5);
    const healthTone = healthScore >= 78 ? 'green' : healthScore >= 58 ? 'amber' : 'red';
    const healthCopy = healthTone === 'green'
        ? { title: 'Budget health looks strong', body: 'Most categories are pacing well. Keep expenses updated for precise signals.', color: '#11814f', shell: 'from-[#e8f5f0] to-[#f2faf7] border-[#bfe2d6]' }
        : healthTone === 'amber'
            ? { title: 'Budget needs attention', body: 'A few categories need a check-in before month end. Review watch spend items first.', color: '#f59e0b', shell: 'from-[#fffbeb] to-[#fef6e4] border-[#f0d39a]' }
            : { title: 'Budget needs action', body: 'Overspend is building up. Rebalance limits or trim variable spending today.', color: '#e84545', shell: 'from-[#fff5f5] to-[#fff0f0] border-[#f2bcbc]' };
    return (
        <div className="mx-auto max-w-[1180px] space-y-5 rounded-[1.5rem] bg-[#f0f7f4] p-3 text-[#0d2b22] sm:p-5">
            <section className="relative overflow-hidden rounded-[1.4rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] px-5 py-6 text-white shadow-[0_18px_48px_rgba(13,61,48,0.24)] sm:px-8">
                <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-2xl">
                        <p className="inline-flex items-center gap-2 text-[1.8rem] font-extrabold tracking-tight" style={displayFont}>
                            <BarChart3 size={22} />
                            Budget Planner
                        </p>
                        <p className="mt-2 max-w-[34rem] text-sm leading-7 text-white/70">
                            Track what you allocated, what you have spent, and where to adjust before you go over. Every shilling planned is a step toward financial freedom.
                        </p>
                        {hasBudgetPlan && (
                            <div className="mt-4 flex items-center gap-3">
                                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: healthCopy.color }} />
                                <div>
                                    <p className="text-sm font-extrabold text-white/95">{healthCopy.title}</p>
                                    <p className="text-xs text-white/55">{Math.round(spendingProgress)}% spending progress this month</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 xl:justify-end">
                        <button type="button" onClick={handleStartBudgetTypeSelection} className="inline-flex h-10 items-center gap-3 rounded-full bg-white px-4 text-sm font-semibold text-[#11814f] shadow-sm transition-colors hover:bg-[#f5fbf8]">
                            <span>Select Budget Type</span>
                            <ChevronDown size={16} className="text-[#11814f]" />
                        </button>
                        <button type="button" onClick={handleOpenBudgetItems} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white">
                            <Plus size={15} />
                            Add Item
                        </button>
                        <button type="button" onClick={handleOpenQuickExpense} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#f8b12d] px-4 text-sm font-semibold text-slate-950 shadow-sm">
                            <Plus size={15} />
                            Quick Add Expense
                        </button>
                    </div>
                </div>
                {!hasChosenBudgetType && budgetTypePrompt ? (
                    <div className="mt-4 inline-flex rounded-[0.95rem] border border-white/18 bg-white/10 px-4 py-3 text-sm text-white/85">
                        {budgetTypePrompt}
                    </div>
                ) : null}
                {hasChosenBudgetType && budgetTypeSuccess ? (
                    <div className="mt-4 inline-flex rounded-[0.95rem] border border-white/18 bg-white/12 px-4 py-3 text-sm text-white/90">
                        {budgetTypeSuccess}
                    </div>
                ) : null}
            </section>

            {hasBudgetPlan && (
                <section className={`rounded-[1rem] border bg-gradient-to-br px-5 py-4 shadow-[0_1px_5px_rgba(27,107,90,0.07)] ${healthCopy.shell}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative h-[82px] w-[82px] shrink-0">
                            <svg className="-rotate-90" width="82" height="82" viewBox="0 0 82 82" aria-hidden="true">
                                <circle cx="41" cy="41" r="34" fill="none" stroke="#d0e8df" strokeWidth="8" />
                                <circle cx="41" cy="41" r="34" fill="none" stroke={healthCopy.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(healthScore / 100) * 213.6} 213.6`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-[#0d2b22]" style={displayFont}>{Math.round(healthScore)}</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a9e94]">/100</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-[1.2rem] font-extrabold text-[#0d2b22]" style={displayFont}>{healthCopy.title}</p>
                            <p className="mt-1 text-sm leading-6 text-[#3d6158]">{healthCopy.body}</p>
                        </div>
                        <button type="button" onClick={openExpensesView} className="inline-flex cursor-pointer items-center justify-center rounded-[0.75rem] border border-[#a8d4c4] bg-white/80 px-4 py-2 text-sm font-extrabold text-[#11814f] transition-colors hover:bg-[#11814f] hover:text-white">
                            Review Expenses
                        </button>
                    </div>
                </section>
            )}

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Budget Allocated" value={formatCurrency(totalBudgeted, currency)} helper={`${summary?.active_budgets_count || activeBudgets.length} active categories`} accent="text-[#11814f]" line="bg-[#11814f]" />
                <MetricCard title="Spent So Far" value={formatCurrency(totalSpent, currency)} helper={`${Math.round(spendingProgress)}% of budget used`} accent="text-[#d94d4d]" line="bg-[#e24a4a]" />
                <MetricCard title={totalRemaining >= 0 ? 'Left In Budget' : 'Over Budget'} value={formatCurrency(Math.abs(totalRemaining), currency)} helper={totalRemaining >= 0 ? 'Available inside your budget' : 'Needs immediate attention'} accent={totalRemaining >= 0 ? 'text-[#b56a00]' : 'text-[#d94d4d]'} line={totalRemaining >= 0 ? 'bg-[#f0a62e]' : 'bg-[#e24a4a]'} />
                <MetricCard title="Budget Savings" value={formatCurrency(savingsValue, currency)} helper={savingsValue > 0 ? 'Auto-saved this month' : 'No savings recorded yet'} accent="text-[#2f74db]" line="bg-[#2f74db]" />
            </section>

            <section className="w-fit max-w-full rounded-[0.9rem] border border-[#d0e8df] bg-white p-1.5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                <div className="flex max-w-full flex-nowrap gap-1 overflow-x-auto">
                    {tabOptions.map(({ id, label, icon: Icon }) => {
                        const isActive = activeView === id;
                        return (
                            <button key={id} type="button" onClick={() => setActiveView(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-[0.75rem] px-4 py-2.5 text-sm font-extrabold transition-all ${isActive ? 'bg-[#11814f] text-white shadow-[0_2px_10px_rgba(13,61,48,0.22)]' : 'text-[#7a9e94] hover:bg-[#f4faf7] hover:text-[#0d2b22]'}`}>
                                <Icon size={15} />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {activeView === 'categories' && (
                <div className="space-y-4">
                    <section ref={budgetItemsRef} className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle
                                icon={BarChart3}
                                title="My Budget Limits"
                                action={<button type="button" onClick={() => onNavigate('budgets')} className="text-sm font-extrabold text-[#11814f]">
                                    Add Amount
                                </button>}
                            />

                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#d8ece3] text-left text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                            <th className="py-3 pr-3">Category</th>
                                            <th className="py-3 pr-3">Set Limit</th>
                                            <th className="py-3 pr-3">Item</th>
                                            <th className="py-3">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budgetLimitRows.map((row) => <BudgetLimitRowCard key={row.category} row={row} currency={currency} />)}
                                        <tr className="bg-[#f8fcfa]">
                                            <td className="py-4 pr-3 text-base font-bold text-slate-950">Total</td>
                                            <td className="py-4 pr-3 text-base font-bold text-[#11814f]">{formatCurrency(totalBudgeted, currency)}</td>
                                            <td className="py-4 pr-3 text-base font-bold text-slate-600">{summaryRows.length ? `${summaryRows.length} tracked items` : 'Needs and wants ready'}</td>
                                            <td className="py-4 text-base font-bold text-[#2f74db]">{formatCurrency(budgetLimitRows.reduce((sum, row) => sum + row.currentAmount, 0), currency)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle icon={TrendingUp} title="Use Your Savings Limit Wisely" subtitle="Turn your allocated savings into action with simple next moves." />

                            <div className="rounded-[1rem] border border-[#bfe2d6] bg-[#f8fcfa] px-4 py-4 text-sm leading-6 text-[#3d6158]">
                                {savingsSetLimit > 0
                                    ? `Your selected budget type gives you ${formatCurrency(savingsSetLimit, currency)} for savings and investing. A practical approach is to split that money across safety, short-term goals, and longer-term growth.`
                                    : 'Choose a budget type and add income so we can suggest how to put your savings allocation to work.'}
                            </div>

                            <div className="mt-4 space-y-3">
                                {savingsGuidanceCards.map((item) => (
                                    <div key={item.title} className={`rounded-[1rem] border px-4 py-4 ${item.tone}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6">{item.helper}</p>
                                            </div>
                                            <span className="shrink-0 text-sm font-extrabold">{formatCurrency(item.amount, currency)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-[1.45rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>Budget vs Spending</p>
                                <p className="mt-1 text-sm text-[#7a9e94]">A quick read on whether your month is under control.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-extrabold text-[#11814f]" style={displayFont}>{Math.round(spendingProgress)}%</p>
                                <button type="button" onClick={openExpensesView} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#a8d4c4] bg-[#edf8f3] px-4 py-2 text-sm font-extrabold text-[#11814f] hover:bg-[#11814f] hover:text-white">
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
                            <div className="h-3.5 overflow-hidden rounded-full bg-[#edf5f1]">
                                <div className="h-full rounded-full bg-[linear-gradient(90deg,_#11814f_0%,_#35a86e_100%)] transition-[width] duration-1000" style={{ width: `${Math.min(spendingProgress, 100)}%` }} />
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <HealthMiniCard value={budgetHealth?.healthy || 0} label="On Track" shell="bg-[#edf8f3] text-[#11814f]" />
                            <HealthMiniCard value={budgetHealth?.warning || 0} label="Watch" shell="bg-[#fff9ec] text-[#9a6200]" />
                            <HealthMiniCard value={budgetHealth?.over || 0} label="Over Budget" shell="bg-[#fff3f3] text-[#d94d4d]" />
                        </div>

                        <div className={`mt-4 rounded-[1.05rem] border px-4 py-4 ${budgetHealth?.over > 0 ? 'border-[#f0d39a] bg-[#fff9ec] text-[#9a6200]' : 'border-[#bfe2d6] bg-[#edf8f3] text-[#11814f]'}`}>
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
                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle
                                icon={Receipt}
                                title={`My Budget Limits - ${currentMonthLabel}`}
                                subtitle="See each category, the live spend, and what action to take next."
                                action={<button type="button" onClick={handleOpenBudgetItems} className="text-sm font-extrabold text-[#11814f]">+ Add Item</button>}
                            />

                            <div className="mt-5 space-y-3">
                                {categoryCards.length ? categoryCards.map((item) => (
                                    <BudgetCategoryCard key={item.uuid} item={item} currency={currency} onNavigate={onNavigate} />
                                )) : (
                                    <EmptyCard title="No budget items yet" body="Choose a budget type first, then add your items so the planner can show limits, progress, and spending insights." cta="Add Item" onClick={handleOpenBudgetItems} />
                                )}
                            </div>
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                                <SectionTitle icon={Lightbulb} title="Budget Insight" subtitle="What this month is telling you." />

                                <div className="mt-4 space-y-3">
                                    {insightCards.map((item) => (
                                        <div key={item.title} className={`rounded-[1rem] border px-4 py-4 text-sm leading-6 ${item.tone}`}>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="mt-1">{item.body}</p>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => onSelectSection?.('health')} className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm font-semibold text-[#11814f]">
                                        <Sparkles size={15} />
                                        Ask Shilingi Buddy AI for More Tips
                                    </button>
                                </div>
                            </article>

                            <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                                <SectionTitle icon={Zap} title="Next Best Actions" subtitle="The most useful next steps from this budget." />
                                <div className="mt-4 space-y-3">
                                    <ActionCard title="Update budget items" body="Adjust your budget items if your real spending pattern has changed this month." cta="Manage Items" onClick={handleOpenBudgetItems} />
                                    <ActionCard title="Keep expenses current" body="Log recent spending so the budget health stays accurate and your dashboard stays useful." cta="Add Expense" onClick={handleOpenQuickExpense} />
                                    <ActionCard title="Compare budget models" body="See how switching to another split would change your monthly allocations." cta="Compare Types" onClick={openCompareView} />
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'summary' && (
                <div className="space-y-4">
                    <section className="grid gap-4 lg:grid-cols-2">
                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle
                                icon={BarChart3}
                                title={`${currentMonthLabel} My Expense Summary`}
                                action={(
                                    <button type="button" onClick={handleExportBudgetSummary} className="inline-flex items-center gap-2 rounded-full border border-[#bfe2d6] bg-[#f8fcfa] px-4 py-2 text-sm font-extrabold text-[#11814f] transition-colors hover:bg-[#11814f] hover:text-white">
                                        <Download size={14} />
                                        Export Details
                                    </button>
                                )}
                            />
                            <div className="mt-4 space-y-3">
                                {monthlySummaryRows.map((item) => (
                                    <div key={item.label} className={`flex items-center justify-between rounded-[0.95rem] px-4 py-3 ${item.shell}`}>
                                        <span className="text-sm font-semibold">{item.label}</span>
                                        <span className="text-[1.05rem] font-extrabold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle icon={Lightbulb} title="Budget Insight" subtitle="What this month is telling you." />
                            <div className="mt-4 space-y-3">
                                {insightCards.map((item) => (
                                    <div key={item.title} className={`rounded-[1rem] border px-4 py-4 text-sm leading-6 ${item.tone}`}>
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="mt-1">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                        <SectionTitle icon={TrendingUp} title="Top Spending Categories" />
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {topSpendingCategories.length ? topSpendingCategories.map((item) => (
                                <div key={`${item.uuid}-summary`} className="rounded-[1rem] border border-[#edf5f1] bg-[#f8fcfa] px-4 py-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-900">{item.category_name}</span>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.left < 0 ? 'bg-[#ffe7e7] text-[#d94d4d]' : 'bg-[#e7f6f1] text-[#11814f]'}`}>
                                            {Math.round(item.progress)}%
                                        </span>
                                    </div>
                                    <p className="mt-2 text-2xl font-extrabold text-[#0d2b22]" style={displayFont}>{formatCurrency(item.spent, item.currency || currency)}</p>
                                    <p className="mt-1 text-xs text-[#7a9e94]">of {formatCurrency(item.allocated, item.currency || currency)} planned</p>
                                </div>
                            )) : (
                                <div className="rounded-[1rem] border border-[#edf5f1] bg-[#f8fcfa] px-4 py-4 text-sm text-slate-500 md:col-span-2 xl:col-span-3">Add budget categories and expenses to see your month at a glance.</div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'compare' && (
                <div ref={compareSectionRef} className="space-y-4">
                    <section className="rounded-[1rem] border-2 border-[#a8d4c4] bg-white p-4 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-3.5">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[0.8rem] bg-[linear-gradient(135deg,_#11814f_0%,_#f5a623_100%)] text-white shadow-sm">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <p className="text-[1.1rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>Choose your budget</p>
                                    <p className="mt-1 text-[13px] leading-6 text-[#3d6158]">Please compare the budget types below before you select the one that fits your lifestyle.</p>
                                    <div className="mt-2.5 flex flex-wrap gap-2">
                                        <SplitChip label={`Needs: ${formatCurrency((trackedIncome * selectedModel.split.needs) / 100, currency)} (${selectedModel.split.needs}%)`} shell="bg-[#e7f6f1] text-[#11814f]" />
                                        <SplitChip label={`Wants: ${formatCurrency((trackedIncome * selectedModel.split.wants) / 100, currency)} (${selectedModel.split.wants}%)`} shell="bg-[#fff3d8] text-[#b56a00]" />
                                        <SplitChip label={`Savings: ${formatCurrency((trackedIncome * selectedModel.split.savings) / 100, currency)} (${selectedModel.split.savings}%)`} shell="bg-[#eef4ff] text-[#2f74db]" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:min-w-[15rem]">
                                <label className="relative inline-flex h-9 w-full items-center rounded-full border border-[#a8d4c4] bg-[#f8fcfa] px-3.5 pr-10 text-[13px] font-extrabold text-[#11814f] transition-colors hover:bg-[#e8f5f0]">
                                    <span className="truncate">Select Type</span>
                                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#11814f]" />
                                    <select
                                        value={selectedModelId}
                                        onChange={(event) => {
                                            const nextModel = allBudgetModels.find((model) => model.id === event.target.value);
                                            if (nextModel) applyBudgetModel(nextModel);
                                        }}
                                        aria-label="Select budget type"
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    >
                                        <option value="custom">Choose your budget</option>
                                        {budgetModels.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                                    </select>
                                </label>
                                <button type="button" onClick={openCompareModels} className="inline-flex items-center justify-center rounded-full border border-[#bfe2d6] bg-[#eef8f4] px-4 py-2.5 text-sm font-extrabold text-[#11814f] transition-colors hover:bg-[#11814f] hover:text-white">
                                    Compare Budget Models Below
                                </button>
                            </div>
                        </div>
                    </section>

                    <section ref={compareModelsRef} className="grid gap-4 xl:grid-cols-3">
                        {compareCards.filter((item) => ['custom', 'classic', 'aggressive'].includes(item.id)).map((item) => {
                            const visual = modelVisuals[item.id];
                            const Icon = visual.icon;
                            const isSelected = selectedModelId === item.id;
                            return (
                                <article key={item.id} className={`relative overflow-hidden rounded-[1rem] border-2 p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(27,107,90,0.13)] ${visual.shell} ${isSelected ? 'border-[#11814f] ring-4 ring-[#11814f]/10' : ''}`}>
                                    {item.id === 'custom' && <span className="absolute right-0 top-0 rounded-bl-[0.75rem] bg-[#7a57d1] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-white">Start here</span>}
                                    {item.id === 'classic' && <span className="absolute right-0 top-0 rounded-bl-[0.75rem] bg-[#11814f] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-white">Recommended</span>}
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-slate-900 shadow-sm">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[1.2rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>{item.label}</p>
                                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <SplitChip label={`Needs ${item.split.needs}%`} shell="bg-[#e7f6f1] text-[#11814f]" />
                                        <SplitChip label={`Wants ${item.split.wants}%`} shell="bg-[#fff3d8] text-[#b56a00]" />
                                        <SplitChip label={`Save ${item.split.savings}%`} shell="bg-[#eef4ff] text-[#2f74db]" />
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <ComparisonBar label="Needs" percent={item.split.needs} value={formatCurrency(item.needs, currency)} color="#11814f" />
                                        <ComparisonBar label="Wants" percent={item.split.wants} value={formatCurrency(item.wants, currency)} color="#f5a623" />
                                        <ComparisonBar label={item.id === 'debt' ? 'Debt' : 'Savings'} percent={item.split.savings} value={formatCurrency(item.savings, currency)} color={item.id === 'debt' ? '#ef4444' : '#2f74db'} />
                                    </div>

                                    <div className="mt-4 rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-slate-700">
                                        {visual.note}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => applyBudgetModel(item)}
                                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 py-3 text-sm font-semibold ${isSelected ? 'bg-[#11814f] text-white' : visual.cta}`}
                                    >
                                        {item.id === 'custom' ? (isSelected ? 'Edit Custom Split' : 'Create Custom Split') : (isSelected ? <><Check size={15} /> Currently Active</> : 'Apply This Model')}
                                    </button>
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
                        {compareCards.filter((item) => item.id === 'city' || item.id === 'debt' || item.id === 'balanced').map((item) => {
                            const visual = modelVisuals[item.id];
                            const Icon = visual.icon;
                            const isSelected = selectedModelId === item.id;
                            return (
                                <article key={item.id} className={`relative overflow-hidden rounded-[1rem] border-2 p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(27,107,90,0.13)] ${visual.shell} ${isSelected ? 'border-[#11814f] ring-4 ring-[#11814f]/10' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-slate-900 shadow-sm">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[1.2rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>{item.label}</p>
                                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <SplitChip label={`Needs ${item.split.needs}%`} shell="bg-[#e7f6f1] text-[#11814f]" />
                                        <SplitChip label={`Wants ${item.split.wants}%`} shell="bg-[#fff3d8] text-[#b56a00]" />
                                        <SplitChip label={`${item.id === 'debt' ? 'Debt' : 'Save'} ${item.split.savings}%`} shell={item.id === 'debt' ? 'bg-[#ffe7e7] text-[#d94d4d]' : 'bg-[#eef4ff] text-[#2f74db]'} />
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <ComparisonBar label="Needs" percent={item.split.needs} value={formatCurrency(item.needs, currency)} color="#11814f" />
                                        <ComparisonBar label="Wants" percent={item.split.wants} value={formatCurrency(item.wants, currency)} color="#f5a623" />
                                        <ComparisonBar label={item.id === 'debt' ? 'Debt' : 'Savings'} percent={item.split.savings} value={formatCurrency(item.savings, currency)} color={item.id === 'debt' ? '#ef4444' : '#2f74db'} />
                                    </div>
                                    <div className="mt-4 rounded-[1rem] bg-white/80 px-4 py-3 text-sm text-slate-700">
                                        {visual.note}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => applyBudgetModel(item)}
                                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] px-4 py-3 text-sm font-semibold ${isSelected ? 'bg-[#11814f] text-white' : visual.cta}`}
                                    >
                                        {isSelected ? <><Check size={15} /> Currently Active</> : 'Apply This Model'}
                                    </button>
                                </article>
                            );
                        })}

                    </section>

                    <section className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                        <SectionTitle icon={BarChart3} title={`Model Comparison - ${formatCurrency(trackedIncome, currency)} Income`} />

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
                                                <td className={`py-3 pr-4 font-semibold ${item.id === 'debt' ? 'text-[#d94d4d]' : 'text-[#11814f]'}`}>{formatCurrency(item.savings, currency)}</td>
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
                <div ref={expensesSectionRef} className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.3fr_0.85fr]">
                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle
                                icon={Receipt}
                                title={`My Expense Tracker - ${currentMonthLabel}`}
                                action={<button type="button" onClick={() => onNavigate('expenses')} className="text-sm font-extrabold text-[#11814f]">+ Add</button>}
                            />

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
                                            className={`rounded-[0.85rem] border px-4 py-2 text-sm font-semibold ${isActive ? 'border-[#bfe2d6] bg-[#edf8f3] text-[#11814f]' : 'border-[#d8ece3] bg-white text-slate-600'}`}
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
                                                <p className={`text-[1.05rem] font-extrabold ${isPositive ? 'text-[#11814f]' : 'text-[#d94d4d]'}`}>
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
                                <button type="button" onClick={() => onNavigate('expenses')} className="mt-4 inline-flex w-full items-center justify-center rounded-[1rem] border border-[#bfe2d6] bg-[#f8fcfa] px-4 py-3 text-sm font-semibold text-[#11814f]">
                                    Load More
                                </button>
                            )}
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                                <SectionTitle icon={ShoppingBasket} title="Shopping List" subtitle="Plan before checkout and log what you actually spend." />

                                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                    <div className="rounded-[0.95rem] bg-[#edf8f3] px-3 py-3 text-[#11814f]">
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Planned</p>
                                        <p className="mt-1 text-lg font-extrabold">{formatCurrency(shoppingPlannedTotal, currency)}</p>
                                    </div>
                                    <div className="rounded-[0.95rem] bg-[#fff3f3] px-3 py-3 text-[#d94d4d]">
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Spent</p>
                                        <p className="mt-1 text-lg font-extrabold">{formatCurrency(shoppingSpentTotal, currency)}</p>
                                    </div>
                                    <div className="rounded-[0.95rem] bg-[#f3f7ff] px-3 py-3 text-[#2f74db]">
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Left</p>
                                        <p className="mt-1 text-lg font-extrabold">{formatCurrency(shoppingRemaining, currency)}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAddShoppingItem} className="mt-4 space-y-3">
                                    {shoppingError && (
                                        <div className="rounded-[0.95rem] border border-[#f2c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#d94d4d]">
                                            {shoppingError}
                                        </div>
                                    )}
                                    {shoppingMessage && (
                                        <div className="rounded-[0.95rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm text-[#11814f]">
                                            {shoppingMessage}
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="shopping-item-name" className="text-sm font-semibold text-slate-700">Item</label>
                                        <input
                                            id="shopping-item-name"
                                            type="text"
                                            name="name"
                                            value={shoppingItemForm.name}
                                            onChange={handleShoppingItemChange}
                                            placeholder="e.g. Milk, rice, tomatoes"
                                            className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                        />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="shopping-item-estimate" className="text-sm font-semibold text-slate-700">Budget ({currency})</label>
                                            <NumericInput
                                                id="shopping-item-estimate"
                                                name="estimate"
                                                value={shoppingItemForm.estimate}
                                                onChange={handleShoppingItemChange}
                                                placeholder="e.g. 500"
                                                className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="shopping-item-category" className="text-sm font-semibold text-slate-700">Category</label>
                                            <select
                                                id="shopping-item-category"
                                                name="category"
                                                value={shoppingItemForm.category}
                                                onChange={handleShoppingItemChange}
                                                className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                            >
                                                <option value="">Select category</option>
                                                {quickCategories.map((category) => (
                                                    <option key={`shopping-${category.uuid || category.id}`} value={category.value}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-[0.8rem] bg-[#11814f] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#0f7044]">
                                        <Plus size={15} />
                                        Add Shopping Item
                                    </button>
                                </form>

                                <div className="mt-5 space-y-3">
                                    {shoppingItems.map((item) => (
                                        <div key={item.id} className={`rounded-[1rem] border px-3 py-3 ${item.checked ? 'border-[#bfe2d6] bg-[#edf8f3]' : 'border-[#edf5f1] bg-[#f8fcfa]'}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateShoppingItem(item.id, { checked: !item.checked })}
                                                    className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${item.checked ? 'border-[#11814f] bg-[#11814f] text-white' : 'border-[#a8d4c4] bg-white text-[#11814f]'}`}
                                                    aria-label={item.checked ? `Mark ${item.name} as not bought` : `Mark ${item.name} as bought`}
                                                >
                                                    <Check size={15} />
                                                </button>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`font-semibold ${item.checked ? 'text-[#11814f]' : 'text-slate-900'}`}>{item.name}</p>
                                                    <p className="mt-1 text-xs text-[#7a9e94]">Planned {formatCurrency(item.estimate, currency)}</p>
                                                </div>
                                                <button type="button" onClick={() => removeShoppingItem(item.id)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-[#fff0f0] hover:text-[#d94d4d]" aria-label={`Remove ${item.name}`}>
                                                    <X size={15} />
                                                </button>
                                            </div>
                                            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                                                <NumericInput
                                                    value={item.actual}
                                                    onChange={(event) => updateShoppingItem(item.id, { actual: event.target.value })}
                                                    placeholder="Actual spent"
                                                    aria-label={`Actual spent for ${item.name}`}
                                                    className="w-full rounded-[0.75rem] border border-[#d8ece3] bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleLogShoppingItem(item)}
                                                    disabled={loggingShoppingId === item.id}
                                                    className="inline-flex items-center justify-center rounded-[0.75rem] border border-[#bfe2d6] bg-white px-3 py-2 text-sm font-extrabold text-[#11814f] transition-colors hover:bg-[#11814f] hover:text-white disabled:opacity-70"
                                                >
                                                    {loggingShoppingId === item.id ? 'Logging...' : 'Log Spend'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>

                        </div>
                    </section>

                    <section className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                        <SectionTitle icon={Sparkles} title="Expense Signals" />
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {Object.keys(expenseByMethod).length ? Object.entries(expenseByMethod).map(([label, value]) => (
                                <div key={label} className="rounded-[1rem] border border-[#edf5f1] bg-[#f8fcfa] px-4 py-4">
                                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                                    <p className="mt-2 text-2xl font-extrabold text-[#11814f]">{formatCurrency(value, currency)}</p>
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
                    <section className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                        <SectionTitle
                            icon={Target}
                            title="Savings Goals"
                            subtitle="Keep savings visible because the budget type needs a clear savings lane."
                            action={<button type="button" onClick={() => onNavigate('goals')} className="inline-flex h-10 items-center rounded-full bg-[#11814f] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0f7044]">+ New Goal</button>}
                        />
                    </section>

                    <section className="grid gap-4 xl:grid-cols-3">
                        {savingsItems.length ? savingsItems.slice(0, 3).map((item, index) => {
                            const visual = getSavingsVisual(item.title, index);
                            const Icon = visual.icon;
                            return (
                                <article key={item.title} className={`rounded-[1rem] border px-4 py-4 shadow-[0_1px_5px_rgba(27,107,90,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(27,107,90,0.13)] ${visual.tone}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white shadow-sm">
                                                <Icon size={18} className={visual.amount} />
                                            </div>
                                            <div>
                                                <p className="text-[1.15rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>{item.title}</p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {item.helper}{item.due ? ` · ${item.due}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${visual.badge}`}>{visual.label}</span>
                                    </div>

                                    <p className={`mt-5 text-[2rem] font-extrabold tracking-tight ${visual.amount}`} style={displayFont}>{formatCurrency(item.current, currency)}</p>
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
                        <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                            <SectionTitle
                                icon={CalendarDays}
                                title={`Bills tracked - ${currentMonthLabel}`}
                                action={<button type="button" onClick={() => onNavigate('budgets')} className="text-sm font-extrabold text-[#11814f]">+ Track Bill</button>}
                            />

                            <div className="mt-5 space-y-3">
                                {billActionError && (
                                    <div className="rounded-[1rem] border border-[#f2c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#d94d4d]">
                                        {billActionError}
                                    </div>
                                )}
                                {billActionMessage && (
                                    <div className="rounded-[1rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm text-[#11814f]">
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
                            <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                                <SectionTitle icon={Lightbulb} title="Bills tracked optimisation tips" />

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
                                        <p className="font-semibold text-[#11814f]">Audit subscriptions</p>
                                        <p className="mt-1">Review recurring services so you only keep the subscriptions you actually use.</p>
                                        <button type="button" onClick={openExpensesView} className="mt-3 inline-flex cursor-pointer rounded-full bg-[#11814f] px-4 py-2 text-sm font-semibold text-white">
                                            Audit Now
                                        </button>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-[1rem] border border-[#d0e8df] bg-white p-5 shadow-[0_1px_5px_rgba(27,107,90,0.07)]">
                                <SectionTitle icon={BarChart3} title="Monthly bills tracked" />
                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between rounded-[0.95rem] bg-[#edf8f3] px-4 py-3 text-sm font-semibold text-slate-800">
                                        <span>Essential bills tracked</span>
                                        <span className="text-[#11814f]">{formatCurrency(essentialBills, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-[0.95rem] bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-slate-800">
                                        <span>Subscriptions</span>
                                        <span className="text-[#d94d4d]">{formatCurrency(subscriptionBills, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-[0.95rem] bg-[#edf8f3] px-4 py-3 text-sm font-semibold text-slate-800">
                                        <span>Total bills tracked</span>
                                        <span className="text-[#11814f]">{formatCurrency(totalMonthlyBills, currency)}</span>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            )}
            <section className="overflow-hidden rounded-[1.55rem] bg-[linear-gradient(135deg,_#0a4f32_0%,_#11814f_55%,_#14784e_100%)] px-5 py-5 text-white shadow-[0_18px_44px_rgba(15,77,64,0.18)]">
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-[1.45rem] font-extrabold tracking-tight">Your Budget Connects the Full Ecosystem</p>
                        <p className="mt-2 max-w-4xl text-sm leading-6 text-white/78">Every category and expense you log flows into your goals, debt manager, net worth, investments, and broader financial health.</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                        {ecosystemCards.map(({ title, helper, cta, icon: Icon, action }) => (
                            <button key={title} type="button" onClick={action} className="rounded-[1.1rem] border border-white/15 bg-white/8 px-4 py-4 text-left transition-all hover:bg-white/12">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-[#11814f] shadow-sm">
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

            {showQuickExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
                    <div className="max-h-[92vh] w-full max-w-[27rem] overflow-y-auto rounded-[1.2rem] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[#e8f5f0] text-[#11814f]">
                                    <Zap size={17} />
                                </span>
                                <p className="text-[1.35rem] font-extrabold tracking-tight text-[#0d2b22]" style={displayFont}>Quick Add Expense</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowQuickExpenseModal(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8ece3] text-slate-500 transition-colors hover:bg-[#f8fcfa]"
                                aria-label="Close quick add expense"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleQuickExpenseSubmit} className="mt-5 space-y-3">
                            {quickExpenseError && (
                                <div className="rounded-[0.95rem] border border-[#f2c2c2] bg-[#fff5f5] px-4 py-3 text-sm text-[#d94d4d]">
                                    {quickExpenseError}
                                </div>
                            )}
                            {quickExpenseSuccess && (
                                <div className="rounded-[0.95rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-3 text-sm text-[#11814f]">
                                    {quickExpenseSuccess}
                                </div>
                            )}
                            <div>
                                <label htmlFor="quick-expense-amount" className="text-sm font-semibold text-slate-700">Amount ({currency})</label>
                                <NumericInput
                                    id="quick-expense-amount"
                                    name="amount"
                                    value={quickExpenseForm.amount}
                                    onChange={handleQuickExpenseChange}
                                    placeholder="e.g. 1,500"
                                    className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                />
                            </div>                            <div>
                                <label htmlFor="quick-expense-description" className="text-sm font-semibold text-slate-700">Description</label>
                                <input
                                    id="quick-expense-description"
                                    type="text"
                                    name="description"
                                    value={quickExpenseForm.description}
                                    onChange={handleQuickExpenseChange}
                                    placeholder="e.g. Lunch at Java House"
                                    className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                />
                            </div>
                            <div>
                                <label htmlFor="quick-expense-category" className="text-sm font-semibold text-slate-700">Category</label>
                                <select
                                    id="quick-expense-category"
                                    name="category"
                                    value={quickExpenseForm.category}
                                    onChange={handleQuickExpenseChange}
                                    className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
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
                                        className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
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
                                        className="mt-2 w-full rounded-[0.8rem] border border-[#d8ece3] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#11814f] focus:ring-4 focus:ring-[#11814f]/10"
                                    >
                                        <option value="MPESA">M-Pesa</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CARD">Card</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={quickExpenseSubmitting} className="mt-2 inline-flex w-full items-center justify-center rounded-[0.8rem] bg-[#11814f] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#0f7044] disabled:opacity-70">
                                {quickExpenseSubmitting ? 'Adding Expense...' : '+ Add Expense'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                            Your three values must add up to exactly 100%. Income used: <span className="font-semibold text-[#11814f]">{formatCurrency(customSplitIncome, currency)}/mo</span>
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
                                <span>Needs: <span className="font-semibold text-[#11814f]">{formatCurrency((customSplitIncome * customSplit.needs) / 100, currency)}</span></span>
                                <span>Wants: <span className="font-semibold text-[#b56a00]">{formatCurrency((customSplitIncome * customSplit.wants) / 100, currency)}</span></span>
                                <span>Savings: <span className="font-semibold text-[#2f74db]">{formatCurrency((customSplitIncome * customSplit.savings) / 100, currency)}</span></span>
                            </div>
                            <p className={`mt-2 font-semibold ${customSplitTotal === 100 ? 'text-[#11814f]' : 'text-[#d94d4d]'}`}>
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
                                className="inline-flex items-center justify-center rounded-[0.95rem] bg-[#11814f] px-6 py-3 text-sm font-semibold text-white"
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
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#edf8f3] text-[#11814f]">
                                <Check size={18} />
                            </div>
                            <div>
                                <p className="text-[1.25rem] font-bold tracking-tight text-slate-950">{pendingModel.label}</p>
                                <p className="mt-1 text-sm leading-6 text-slate-600">{pendingModel.description}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <SplitChip label={`Needs ${pendingModel.split.needs}%`} shell="bg-[#e7f6f1] text-[#11814f]" />
                            <SplitChip label={`Wants ${pendingModel.split.wants}%`} shell="bg-[#fff3d8] text-[#b56a00]" />
                            <SplitChip label={`Savings ${pendingModel.split.savings}%`} shell="bg-[#eef4ff] text-[#2f74db]" />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowModelModal(false)}
                                className="inline-flex rounded-[0.9rem] bg-[#11814f] px-4 py-2.5 text-sm font-semibold text-white"
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
