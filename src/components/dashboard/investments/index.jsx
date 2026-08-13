import React, { useEffect, useMemo, useState } from 'react';
import NumericInput from '../../common/NumericInput';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Landmark,
    LineChart,
    Loader2,
    Plus,
    ShieldCheck,
    Sparkles,
    Target as TargetIcon,
    Trophy,
    WalletCards,
    X,
} from 'lucide-react';
import { createAsset, createAssetCategory, deleteAsset, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { getLatestPlan, savePlan } from '../../../services/plannerApi';
import PlannerSyncStatus from '../common/PlannerSyncStatus';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';
import { usePlannerFinancialContext } from '../../../hooks/usePlannerFinancialContext';
import { buildFinancialSnapshot, buildInvestmentInsights } from '../../../utils/financialIntelligence';
import { USER_PROFILE_WORKSPACE_KEY } from '../user/UserGoalsFamilyForm';
import investmentPlannerHero from '../../../assets/investment-planner-hero.png';

const INVESTMENT_TYPES = [
    { id: 'fixed-income', label: 'Bonds', categoryName: 'Fixed Income Investment', keywords: ['fixed income', 'bond', 'treasury', 'money market', 'mmf'], color: '#179b6e', isLiquid: true, icon: Landmark, tag: 'Fixed Income' },
    { id: 'mmf', label: 'Money Market', categoryName: 'Fixed Income Investment', keywords: ['money market', 'mmf'], color: '#3b82f6', isLiquid: true, icon: WalletCards, tag: 'Unit Trust' },
    { id: 'sacco', label: 'SACCO', categoryName: 'Other Investment', keywords: ['sacco'], color: '#8b5cf6', isLiquid: false, icon: WalletCards, tag: 'SACCO' },
    { id: 'stocks', label: 'NSE Equities', categoryName: 'Stocks Investment', keywords: ['stock', 'equity', 'shares', 'nse'], color: '#ef4444', isLiquid: true, icon: LineChart, tag: 'High Growth' },
    { id: 'other', label: 'Other Investment', categoryName: 'Other Investment', keywords: ['investment'], color: '#475569', isLiquid: false, icon: Plus, tag: 'Other' },
];

const WATCHLIST_ITEMS = [
    { name: '91-Day T-Bill (CBK)', meta: 'Government � Very Low Risk', value: '16.2%', move: '+0.1%', tone: 'text-[#19725f]' },
    { name: 'Safaricom (SCOM)', meta: 'NSE � KES 103.00', value: 'KES 103', move: '+1.5%', tone: 'text-[#19725f]' },
    { name: 'Sanlam Unit Trust', meta: 'Unit Trust � 14.1% p.a.', value: '14.1%', move: 'Stable', tone: 'text-[#2563eb]' },
    { name: 'KCB Group (KCB)', meta: 'NSE � KES 34.75', value: 'KES 34.75', move: '+2.2%', tone: 'text-[#19725f]' },
    { name: 'Britam Bond Fund', meta: 'Unit Trust � 13.1% p.a.', value: '13.1%', move: 'Stable', tone: 'text-[#8b5cf6]' },
];

const defaultFormData = {
    name: '',
    current_value: '',
    purchase_value: '',
    purchase_date: '',
    interest_rate: '',
    institution: '',
    account_number: '',
    notes: '',
};

const formatKES = (amount) => `KES ${Math.round(Number(amount || 0)).toLocaleString('en-KE')}`;
const normalize = (value) => String(value || '').trim().toLowerCase();
const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const profileDefaults = {
    riskAppetite: 'Moderate',
    investmentHorizon: '5-10 Years',
    preferredProducts: 'T-Bills, MMFs, NSE Equities',
    shortTermGoals: [],
    mediumTermGoals: [],
    longTermGoals: [],
    shortTermGoalDetails: {},
    mediumTermGoalDetails: {},
    longTermGoalDetails: {},
};

const RISK_PROFILE_ONBOARDING_KEY = 'shilingi_investment_risk_profile_seen_v1';

const riskProfileQuestions = [
    {
        id: 'horizon',
        eyebrow: 'Investment horizon',
        title: 'When do you expect to need this money?',
        helper: "We'll need to know your time frame for investing to assess your risk profile.",
        options: [
            { value: 'Within 2 years', label: 'Within 2 years', detail: 'Very short term goal' },
            { value: '2-5 Years', label: '2-5 Years', detail: 'Short term goal' },
            { value: '5-10 Years', label: '5-10 Years', detail: 'Medium term goal' },
            { value: '10+ Years', label: '10+ Years', detail: 'Long term goal' },
        ],
    },
    {
        id: 'reaction',
        eyebrow: 'Risk appetite',
        title: 'If your investment dropped 20% in a month, what would you do?',
        helper: "We'll need to know your risk appetite and comfort to assess your risk profile.",
        options: [
            { value: 'Sell everything', label: 'Sell everything', detail: "Very low risk appetite" },
            { value: 'Sell some of it', label: 'Sell some of it', detail: 'Low risk appetite' },
            { value: 'Hold and wait out', label: 'Hold and wait out', detail: 'Medium risk appetite' },
            { value: 'Buy more when it is cheap', label: 'Buy more when it is cheap', detail: 'High risk appetite' },
        ],
    },
    {
        id: 'objective',
        eyebrow: 'Investment objective',
        title: 'What are you mainly investing for?',
        helper: "We'll need to know your investment objective to assess your risk profile.",
        options: [
            { value: 'Protecting what I have', label: 'Protecting what I have', detail: 'Conservative objective' },
            { value: 'Steady income', label: 'Steady income', detail: 'Cashflow objective' },
            { value: 'Balanced growth', label: 'Balanced growth', detail: 'Medium growth objective' },
            { value: 'Maximum long-term growth', label: 'Maximum long-term growth', detail: 'Long term growth objective' },
        ],
    },
    {
        id: 'experience',
        eyebrow: 'Investment experience',
        title: 'How long have you been investing for?',
        helper: "We'll need to know your investment experience to assess your risk profile.",
        options: [
            { value: 'Below 2 years', label: 'Below 2 years', detail: 'New to investing' },
            { value: '2-5 years', label: '2-5 years', detail: 'Some experience' },
            { value: '5-10 years', label: '5-10 years', detail: 'Fairly experienced' },
            { value: '10+ years', label: '10+ years', detail: 'Very experienced' },
        ],
    },
    {
        id: 'contribution',
        eyebrow: 'Investment capacity',
        title: 'How much of your income can you invest?',
        helper: "We'll need to know your capacity to invest so your profile stays realistic.",
        options: [
            { value: 'Below 5%', label: 'Below 5%', detail: 'Start small' },
            { value: '5-10%', label: '5-10%', detail: 'Steady habit' },
            { value: '10-20%', label: '10-20%', detail: 'Strong commitment' },
            { value: 'Above 20%', label: 'Above 20%', detail: 'Aggressive investing' },
        ],
    },
];

const readProfileWorkspace = () => {
    if (typeof window === 'undefined') return profileDefaults;
    try {
        return {
            ...profileDefaults,
            ...JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}'),
        };
    } catch {
        return profileDefaults;
    }
};

const riskReturnTargets = {
    conservative: 8,
    moderate: 12,
    aggressive: 16,
};

const goalHasValue = (goal = {}) => Boolean(goal.name || goal.targetAmount || goal.currentSavings || goal.targetDate || goal.monthlyContribution || goal.linkedProduct);

const parseHorizonYears = (horizon) => {
    const normalized = normalize(horizon);
    if (normalized.includes('under')) return 1;
    if (normalized.includes('1-5')) return 5;
    if (normalized.includes('5-10')) return 7;
    if (normalized.includes('10+')) return 10;
    const firstNumber = normalized.match(/\d+/)?.[0];
    return firstNumber ? Number(firstNumber) : 5;
};

const formatMonthYear = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const futureValue = (monthlyContribution, years, expectedReturn) => {
    const pmt = toNumber(monthlyContribution);
    const n = Math.max(toNumber(years) * 12, 0);
    const r = toNumber(expectedReturn) / 100 / 12;
    if (!n) return 0;
    if (!r) return pmt * n;
    return pmt * (((1 + r) ** n - 1) / r);
};

const calculateAnnualizedGrowthRate = ({ currentValue, purchaseValue, purchaseDate }) => {
    const current = toNumber(currentValue);
    const purchase = toNumber(purchaseValue);
    if (current <= 0 || purchase <= 0) return '';

    const start = purchaseDate ? new Date(purchaseDate) : null;
    const yearsHeld = start && !Number.isNaN(start.getTime())
        ? Math.max((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25), 1 / 12)
        : 1;

    return ((((current / purchase) ** (1 / yearsHeld)) - 1) * 100).toFixed(2);
};

const getCategoryIdentifier = (category) => {
    if (!category) return null;
    const candidates = [category.categoryId, category.id, category.raw?.id, category.raw?.pk, category.raw?.category_id];
    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
        if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
    return null;
};

const findTypeMeta = (asset) => {
    const value = normalize(asset.categoryName || asset.name);
    return INVESTMENT_TYPES.find((type) => type.keywords.some((keyword) => value.includes(keyword))) || INVESTMENT_TYPES[INVESTMENT_TYPES.length - 1];
};

const findAllocationMeta = (label) => {
    const directMatch = INVESTMENT_TYPES.find((type) => normalize(type.label) === normalize(label));
    if (directMatch) return directMatch;
    return INVESTMENT_TYPES.find((type) => normalize(label).includes(normalize(type.label))) || INVESTMENT_TYPES[INVESTMENT_TYPES.length - 1];
};

const buildTargetAllocation = (items) =>
    items.reduce((acc, item) => {
        acc[item.label] = Math.round(item.percent);
        return acc;
    }, {});

const InvestmentTracker = ({ onSelectSection }) => {
    const { triggerHealthRefresh } = useHealthRefresh();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingAssetId, setDeletingAssetId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [savedPlan, setSavedPlan] = useState(null);
    const [activeTab, setActiveTab] = useState('risk');
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showRebalanceModal, setShowRebalanceModal] = useState(false);
    const [targetAllocation, setTargetAllocation] = useState({});
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [profileWorkspace, setProfileWorkspace] = useState(() => readProfileWorkspace());
    const [showRiskOnboarding, setShowRiskOnboarding] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(RISK_PROFILE_ONBOARDING_KEY) !== 'true';
    });
    const [riskStep, setRiskStep] = useState(0);
    const [riskAnswers, setRiskAnswers] = useState({});
    const [riskProfileComplete, setRiskProfileComplete] = useState(() => Boolean(readProfileWorkspace().riskProfileCompletedAt));
    const [mobileInvestmentView, setMobileInvestmentView] = useState('overview');
    const [simulator, setSimulator] = useState({ monthlyContribution: '18000', durationYears: '5', expectedReturn: '12.4', targetAmount: '10000000' });
    const plannerContext = usePlannerFinancialContext();

    const refreshData = async () => {
        setLoading(true);
        setError('');
        try {
            const [categoryList, assetList, backendPlan] = await Promise.all([
                getAssetCategories(),
                getAssets(),
                getLatestPlan('investment'),
            ]);
            setCategories(categoryList);
            setAssets(assetList);
            setSavedPlan(backendPlan);
            if (backendPlan) {
                setSimulator((current) => ({
                    ...current,
                    monthlyContribution: backendPlan.monthly_contribution || current.monthlyContribution,
                    durationYears: String(backendPlan.horizon_years || current.durationYears),
                    expectedReturn: backendPlan.expected_annual_return_percent || current.expectedReturn,
                    targetAmount: backendPlan.target_amount || current.targetAmount,
                }));
            }
        } catch (err) {
            setError(err.message || 'Failed to load investments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshData(); }, []);

    useEffect(() => {
        const syncProfileWorkspace = () => setProfileWorkspace(readProfileWorkspace());
        window.addEventListener('storage', syncProfileWorkspace);
        window.addEventListener('focus', syncProfileWorkspace);
        return () => {
            window.removeEventListener('storage', syncProfileWorkspace);
            window.removeEventListener('focus', syncProfileWorkspace);
        };
    }, []);

    const investmentAssets = useMemo(() => assets.map((asset) => ({ ...asset, typeMeta: findTypeMeta(asset) })), [assets]);

    const totals = useMemo(() => {
        const totalValue = investmentAssets.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
        const totalInvested = investmentAssets.reduce((sum, item) => sum + Number(item.purchaseValue || item.currentValue || 0), 0);
        const totalGainLoss = totalValue - totalInvested;
        const annualisedReturn = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
        return { totalValue, totalInvested, totalGainLoss, annualisedReturn, count: investmentAssets.length };
    }, [investmentAssets]);

    const allocation = useMemo(() => {
        if (!totals.totalValue) return [];
        const grouped = investmentAssets.reduce((acc, item) => {
            const key = item.typeMeta.label;
            if (!acc[key]) {
                acc[key] = { label: item.typeMeta.label, value: 0, color: item.typeMeta.color };
            }
            acc[key].value += Number(item.currentValue || 0);
            return acc;
        }, {});
        return Object.values(grouped).map((item) => ({ ...item, percent: (item.value / totals.totalValue) * 100 })).sort((a, b) => b.value - a.value);
    }, [investmentAssets, totals.totalValue]);

    const projectedValue = useMemo(() => futureValue(simulator.monthlyContribution, simulator.durationYears, simulator.expectedReturn), [simulator]);
    const investmentPlan = useMemo(() => {
        const goalCandidates = [
            ...(Array.isArray(profileWorkspace.shortTermGoals) ? profileWorkspace.shortTermGoals : []),
            ...(Array.isArray(profileWorkspace.mediumTermGoals) ? profileWorkspace.mediumTermGoals : []),
            ...(Array.isArray(profileWorkspace.longTermGoals) ? profileWorkspace.longTermGoals : []),
            profileWorkspace.shortTermGoalDetails,
            profileWorkspace.mediumTermGoalDetails,
            profileWorkspace.longTermGoalDetails,
        ].filter(goalHasValue);
        const investmentGoal = goalCandidates.find((goal) => {
            const hint = normalize(`${goal.name} ${goal.linkedProduct} ${profileWorkspace.primary_financial_goal}`);
            return hint.includes('invest') || hint.includes('wealth') || hint.includes('portfolio') || hint.includes('retire');
        }) || goalCandidates.find((goal) => toNumber(goal.targetAmount) > 0) || {};
        const riskAppetite = profileWorkspace.riskAppetite || 'Moderate';
        const expectedReturn = riskReturnTargets[normalize(riskAppetite)] || riskReturnTargets.moderate;
        const targetAmountValue = toNumber(investmentGoal.targetAmount) || toNumber(simulator.targetAmount);
        const monthlyContribution = toNumber(investmentGoal.monthlyContribution) || toNumber(simulator.monthlyContribution);
        const horizonYears = investmentGoal.targetDate
            ? Math.max((new Date(investmentGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365.25), 0.5)
            : parseHorizonYears(profileWorkspace.investmentHorizon);
        const fallbackDate = new Date();
        fallbackDate.setMonth(fallbackDate.getMonth() + Math.round(horizonYears * 12));
        const targetDateLabel = formatMonthYear(investmentGoal.targetDate)
            || fallbackDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        return {
            goal: investmentGoal,
            riskAppetite,
            expectedReturn,
            preferredProducts: profileWorkspace.preferredProducts || 'T-Bills, MMFs, NSE Equities',
            horizon: profileWorkspace.investmentHorizon || '5-10 Years',
            horizonYears,
            targetAmount: targetAmountValue,
            monthlyContribution,
            expectedAmount: totals.totalValue + futureValue(monthlyContribution, horizonYears, expectedReturn),
            targetDateLabel,
            annualizedTargetAmount: horizonYears > 0 ? targetAmountValue / horizonYears : targetAmountValue,
        };
    }, [profileWorkspace, simulator.monthlyContribution, simulator.targetAmount, totals.totalValue]);
    const targetAmount = investmentPlan.targetAmount;
    const progressToTarget = targetAmount > 0 ? Math.min((totals.totalValue / targetAmount) * 100, 100) : 0;
    const targetDate = useMemo(() => {
        const end = new Date();
        end.setMonth(end.getMonth() + Math.max(toNumber(simulator.durationYears) * 12, 1));
        return end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }, [simulator.durationYears]);

    const investmentSnapshot = useMemo(() => buildFinancialSnapshot({
        profile: profileWorkspace,
        live: {
            income: profileWorkspace.monthly_income || profileWorkspace.monthlyIncome || profileWorkspace.netMonthlyIncome || profileWorkspace.income,
            raw: {
                budgets: plannerContext.budgets,
                expenses: plannerContext.expenses,
                goals: plannerContext.goals,
                debts: plannerContext.debts,
                investments: assets,
            },
        },
    }), [assets, plannerContext.budgets, plannerContext.debts, plannerContext.expenses, plannerContext.goals, profileWorkspace]);

    const portfolioInsights = useMemo(() => buildInvestmentInsights(investmentSnapshot, {
        allocation,
        targetAmount,
        riskAppetite: investmentPlan.riskAppetite,
        horizon: investmentPlan.horizon,
        preferredProducts: investmentPlan.preferredProducts,
    }), [allocation, investmentPlan.horizon, investmentPlan.preferredProducts, investmentPlan.riskAppetite, investmentSnapshot, targetAmount]);

    const activityRows = useMemo(
        () =>
            investmentAssets.slice(0, 5).map((asset, index) => ({
                id: asset.uuid || `${asset.name}-${index}`,
                date: asset.lastValuedDate || asset.purchaseDate || new Date().toISOString().split('T')[0],
                asset: asset.name,
                type: index === 0 ? 'Top-Up' : index === 1 ? 'Deposit' : index === 2 ? 'Buy' : 'Update',
                amount: Number(asset.currentValue || 0) - Number(asset.purchaseValue || 0) >= 0 ? `+${formatKES(asset.purchaseValue || asset.currentValue)}` : formatKES(asset.purchaseValue || asset.currentValue),
                details: asset.institution || asset.categoryName || 'Portfolio update',
                status: 'Settled',
            })),
        [investmentAssets]
    );
    const ecosystemLinks = [
        { title: 'Net Worth Tracker', subtitle: 'Portfolio added to assets', action: 'View ->', icon: WalletCards, onClick: () => onSelectSection && onSelectSection('networth') },
        { title: 'Budget Planner', subtitle: 'Top-ups sync to budget', action: 'Open ->', icon: LineChart, onClick: () => onSelectSection && onSelectSection('budget') },
        { title: 'Compare Hub', subtitle: 'Find better-returning products', action: 'Compare ->', icon: Sparkles, onClick: () => onSelectSection && onSelectSection('comparehub') },
        { title: 'Retirement Planner', subtitle: 'Investments fund your FIRE goal', action: 'Plan ->', icon: Landmark, onClick: () => onSelectSection && onSelectSection('retirement') },
        { title: 'Market Watch', subtitle: 'Track signals affecting investments', action: 'Open ->', icon: Trophy, onClick: () => onSelectSection && onSelectSection('marketwatch') },
    ];

    const findCategoryForType = (type) => categories.find((category) => type.keywords.some((keyword) => normalize(category.name).includes(keyword))) || null;

    const handleSelectType = async (type) => {
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            let category = findCategoryForType(type);
            if (!category) {
                await createAssetCategory({ name: type.categoryName, color: type.color, is_liquid: type.isLiquid });
                const updatedCategories = await getAssetCategories();
                setCategories(updatedCategories);
                category = updatedCategories.find((item) => normalize(item.name) === normalize(type.categoryName)) || null;
            }
            if (!getCategoryIdentifier(category)) throw new Error(`Unable to resolve a category id for ${type.label}.`);
            setSelectedType(type);
            setSelectedCategory(category);
            setFormData(defaultFormData);
            setShowTypeModal(false);
            setShowFormModal(true);
        } catch (err) {
            setError(err.message || 'Failed to prepare selected investment type');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedCategory) return;
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const categoryIdentifier = getCategoryIdentifier(selectedCategory);
            if (!categoryIdentifier) throw new Error('Could not map this investment category to a valid id.');
            await createAsset({
                name: formData.name,
                category: categoryIdentifier,
                current_value: String(toNumber(formData.current_value)),
                purchase_value: formData.purchase_value ? String(toNumber(formData.purchase_value)) : null,
                currency: 'KES',
                purchase_date: formData.purchase_date || null,
                interest_rate: formData.interest_rate ? String(toNumber(formData.interest_rate)) : calculatedGrowthRate ? String(toNumber(calculatedGrowthRate)) : null,
                institution: formData.institution || '',
                account_number: formData.account_number || '',
                is_liquid: selectedType?.isLiquid || false,
                include_in_net_worth: true,
                last_valued_date: new Date().toISOString().split('T')[0],
                notes: formData.notes || '',
            });

            await refreshData();
            setSuccess('Investment added successfully.');
            markDashboardDataExists();
            triggerHealthRefresh('investment:create');
            setShowFormModal(false);
            setActiveTab('portfolio');
            setMobileInvestmentView('investments');
        } catch (err) {
            setError(err.message || 'Failed to add investment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteInvestment = async (asset) => {
        if (!asset?.uuid) return;
        const confirmed = window.confirm(`Delete "${asset.name}"?`);
        if (!confirmed) return;
        try {
            setDeletingAssetId(asset.uuid);
            setError('');
            setSuccess('');
            await deleteAsset(asset.uuid);
            await refreshData();
            setSuccess('Investment deleted successfully.');
            triggerHealthRefresh('investment:delete');
        } catch (err) {
            setError(err.message || 'Failed to delete investment');
        } finally {
            setDeletingAssetId('');
        }
    };

    const openRebalanceModal = () => {
        setTargetAllocation(buildTargetAllocation(allocation));
        setShowRebalanceModal(true);
    };

    const handleTargetAllocationChange = (label, value) => {
        const trimmed = String(value ?? '').trim();
        if (trimmed === '') {
            setTargetAllocation((current) => ({ ...current, [label]: '' }));
            return;
        }

        const parsed = Math.max(0, Math.min(100, Number(trimmed)));
        if (!Number.isFinite(parsed)) return;
        setTargetAllocation((current) => ({ ...current, [label]: parsed }));
    };

    const handleSaveTargetAllocation = () => {
        const totalTarget = allocation.reduce((sum, item) => sum + toNumber(targetAllocation[item.label]), 0);
        if (allocation.length > 0 && totalTarget !== 100) {
            setError(`Target allocation must total 100%. It is currently ${totalTarget}%.`);
            return;
        }

        setError('');
        setSuccess('Target allocation saved for your current portfolio review.');
        setShowRebalanceModal(false);
    };

    const markRiskOnboardingSeen = () => {
        setShowRiskOnboarding(false);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(RISK_PROFILE_ONBOARDING_KEY, 'true');
        }
    };

    const handleRiskAnswer = (questionId, value) => {
        setRiskAnswers((current) => ({ ...current, [questionId]: value }));
    };

    const completeRiskProfile = async (answers) => {
        const conservativeSignals = [
            answers.horizon === 'Within 2 years',
            answers.reaction === 'Sell everything',
            answers.reaction === 'Sell some of it',
            answers.objective === 'Protecting what I have',
            answers.contribution === 'Below 5%',
        ].filter(Boolean).length;
        const aggressiveSignals = [
            answers.horizon === '10+ Years',
            answers.reaction === 'Buy more when it is cheap',
            answers.objective === 'Maximum long-term growth',
            answers.experience === '10+ years',
            answers.contribution === 'Above 20%',
        ].filter(Boolean).length;
        const riskAppetite = aggressiveSignals >= 2 ? 'Aggressive' : conservativeSignals >= 2 ? 'Conservative' : 'Moderate';
        const preferredProducts = riskAppetite === 'Aggressive'
            ? 'NSE Equities, REITs, Unit Trusts'
            : riskAppetite === 'Conservative'
                ? 'T-Bills, Money Market Funds, Bonds'
                : 'T-Bills, MMFs, Unit Trusts, NSE Equities';
        const nextWorkspace = {
            ...profileWorkspace,
            riskAppetite,
            investmentHorizon: answers.horizon || profileWorkspace.investmentHorizon || profileDefaults.investmentHorizon,
            preferredProducts,
            investmentExperience: answers.experience || profileWorkspace.investmentExperience,
            investmentObjective: answers.objective || profileWorkspace.investmentObjective,
            investmentCapacity: answers.contribution || profileWorkspace.investmentCapacity,
            investmentRiskReaction: answers.reaction || profileWorkspace.investmentRiskReaction,
            riskProfileCompletedAt: new Date().toISOString(),
        };

        setProfileWorkspace(nextWorkspace);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(nextWorkspace));
            window.localStorage.setItem(RISK_PROFILE_ONBOARDING_KEY, 'true');
        }
        setShowRiskOnboarding(false);
        setRiskProfileComplete(true);
        try {
            const horizonYears = Math.max(parseInt(String(nextWorkspace.investmentHorizon).match(/\d+/)?.[0] || '5', 10), 1);
            const persistedPlan = await savePlan('investment', {
                name: 'Investment risk profile',
                goal_name: nextWorkspace.investmentObjective || 'Build long-term wealth',
                risk_profile: riskAppetite === 'Aggressive' ? 'GROWTH' : riskAppetite === 'Conservative' ? 'CONSERVATIVE' : 'BALANCED',
                initial_investment: String(Math.max(totals.totalValue, 0)),
                monthly_contribution: String(Math.max(investmentPlan.monthlyContribution, 0)),
                target_amount: String(Math.max(investmentPlan.targetAmount, 1)),
                horizon_years: horizonYears,
                expected_annual_return_percent: String(investmentPlan.expectedReturn),
                annual_fee_percent: '0',
                inflation_percent: '0',
            }, savedPlan);
            setSavedPlan(persistedPlan);
            setSuccess(`Risk profile saved as ${riskAppetite}.`);
        } catch (err) {
            setError(err.message || 'Risk profile was completed, but the investment plan could not be saved.');
        }
    };

    const handleRiskContinue = () => {
        const currentQuestion = riskProfileQuestions[riskStep];
        if (!riskAnswers[currentQuestion.id]) return;
        if (riskStep < riskProfileQuestions.length - 1) {
            setRiskStep((current) => current + 1);
            return;
        }
        void completeRiskProfile(riskAnswers);
    };

    const calculatedGrowthRate = calculateAnnualizedGrowthRate({
        currentValue: formData.current_value,
        purchaseValue: formData.purchase_value,
        purchaseDate: formData.purchase_date,
    });
    const investmentNameLabel = selectedType?.id === 'fixed-income' ? 'Bond name' : 'Investment name';
    const growthRateHelper = calculatedGrowthRate
        ? 'Calculated from purchase value, current value, and purchase date.'
        : 'Enter purchase value and current value to calculate automatically.';

    return (
        <div className="space-y-4">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">{success}</div>}
            <PlannerSyncStatus plan={savedPlan} />

            {activeTab === 'risk' && (
                <MobileRiskProfileFlow
                    answers={riskAnswers}
                    currentStep={riskStep}
                    investmentPlan={investmentPlan}
                    isComplete={riskProfileComplete}
                    onAnswer={handleRiskAnswer}
                    onContinue={handleRiskContinue}
                    onContinueToInvestments={() => {
                        setActiveTab('portfolio');
                        setMobileInvestmentView('overview');
                    }}
                    onGetStarted={markRiskOnboardingSeen}
                    showOnboarding={showRiskOnboarding}
                />
            )}

            {activeTab === 'portfolio' && (
                <MobileInvestmentPortfolioFlow
                    activeView={mobileInvestmentView}
                    allocation={allocation}
                    assets={investmentAssets}
                    deletingAssetId={deletingAssetId}
                    investmentPlan={investmentPlan}
                    onAddInvestment={() => setShowTypeModal(true)}
                    onDelete={handleDeleteInvestment}
                    onSelectView={setMobileInvestmentView}
                    onTopUp={() => setShowTypeModal(true)}
                    portfolioInsights={portfolioInsights}
                    projectedValue={projectedValue}
                    simulator={simulator}
                    targetAmount={targetAmount}
                    targetDate={targetDate}
                    totals={totals}
                    updateSimulator={(key, value) => setSimulator((current) => ({ ...current, [key]: value }))}
                />
            )}

            <section className="hidden overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] px-4 py-4 text-white shadow-sm md:block sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-3 dashboard-display-title text-[1.38rem] font-extrabold leading-none sm:text-[1.55rem]"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-900"><LineChart size={16} /></span>Investment Planner</p>
                        <p className="mt-2 max-w-[31rem] text-[0.85rem] leading-5 text-white/80 sm:text-[0.9rem]">Grow your wealth with targets from your risk profile, then track real investments against the plan.</p>
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-3 sm:flex-nowrap">
                        <button type="button" onClick={() => setActiveTab('risk')} className="inline-flex h-10 min-w-[176px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-4 text-[0.84rem] font-semibold text-white backdrop-blur-sm"><Sparkles size={14} />Review Risk Profile</button>
                        <button type="button" onClick={() => setShowTypeModal(true)} className="inline-flex h-10 min-w-[158px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-[0.84rem] font-semibold text-[#18765e]">+ Add Investment</button>
                    </div>
                </div>
            </section>

            <section className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Investment" value={formatKES(totals.totalValue)} helper={`${progressToTarget.toFixed(1)}% of target`} valueClass="text-[#f4c95d]" featured progress={progressToTarget} />
                <StatCard title="Target Investment Amount" value={formatKES(investmentPlan.targetAmount)} helper={`From ${investmentPlan.riskAppetite} risk profile`} valueClass="text-[#175f54]" />
                <StatCard title="Expected Amount" value={formatKES(investmentPlan.expectedAmount)} helper={`${investmentPlan.expectedReturn.toFixed(1)}% annual target return`} valueClass="text-[#2167d8]" />
                <StatCard title="Target Investment Date" value={investmentPlan.targetDateLabel} helper={`${investmentPlan.horizon} horizon`} valueClass="text-[#8b5cf6]" />
            </section>

            <section className="hidden rounded-[1.1rem] border border-primary-100 bg-white p-1 shadow-sm md:block"><div className="flex flex-wrap gap-2"><TabButton active={activeTab === 'risk'} onClick={() => setActiveTab('risk')}>My Investment Objectives</TabButton><TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')}>My Current Investments</TabButton><TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')}>Explore Investment Solutions</TabButton><TabButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')}>Investment Calculators</TabButton></div></section>

            {activeTab === 'portfolio' && (
                <section className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard title="Total Current Investments" value={formatKES(totals.totalValue)} valueClass="text-primary-700" />
                    <MetricCard title="Target Investments" value={formatKES(investmentPlan.targetAmount)} valueClass="text-[#175f54]" />
                    <MetricCard title="Target Annualized Return" value={`${investmentPlan.expectedReturn.toFixed(1)}% p.a.`} valueClass="text-primary-700" />
                    <MetricCard title="Annualized Target Amount" value={formatKES(investmentPlan.annualizedTargetAmount)} valueClass="text-[#8b5cf6]" />
                </section>
            )}

            {activeTab === 'portfolio' && (
                <div className="hidden space-y-4 md:block">
                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3"><PanelHeading icon={WalletCards} title="My Current Investments" noMargin /><button type="button" onClick={() => setShowTypeModal(true)} className="text-sm font-semibold text-[#175f54]">+ Add Investment</button></div>
                            <div className="space-y-4">{investmentAssets.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">No investments yet. Add an investment to start building your portfolio.</p> : investmentAssets.map((asset) => <HoldingCard key={asset.uuid} asset={asset} deleting={deletingAssetId === asset.uuid} onDelete={() => handleDeleteInvestment(asset)} onTopUp={() => setShowTypeModal(true)} />)}</div>
                        </article>

                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Sparkles} title="Shilingi Buddy Investment Insights" /> <div className="mt-4 space-y-3">{portfolioInsights.map((item) => <InsightCard key={item.title} title={item.title} text={item.text} tone={item.tone} />)}</div></article>
                    </section>

                    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><PanelHeading icon={WalletCards} title="Recent Investment Activity" noMargin /><button type="button" className="text-sm font-semibold text-[#175f54]">Export</button></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-emerald-100 text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]"><th className="py-3 pr-4 font-semibold">Date</th><th className="py-3 pr-4 font-semibold">Asset</th><th className="py-3 pr-4 font-semibold">Type</th><th className="py-3 pr-4 font-semibold">Amount</th><th className="py-3 pr-4 font-semibold">Units / Details</th><th className="py-3 font-semibold">Status</th></tr></thead><tbody>{activityRows.length > 0 ? activityRows.map((row) => <tr key={row.id} className="border-b border-slate-100 last:border-b-0"><td className="py-3 pr-4 text-slate-500">{formatDate(row.date)}</td><td className="py-3 pr-4 font-medium text-slate-900">{row.asset}</td><td className="py-3 pr-4"><span className="inline-flex rounded-full bg-[#eef8f3] px-2.5 py-1 text-xs font-semibold text-[#175f54]">{row.type}</span></td><td className="py-3 pr-4 font-semibold text-[#175f54]">{row.amount}</td><td className="py-3 pr-4 text-slate-700">{row.details}</td><td className="py-3"><span className="inline-flex rounded-full bg-[#eef8f3] px-2.5 py-1 text-xs font-semibold text-[#175f54]">{row.status}</span></td></tr>) : <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">No activity yet. Add or update investments to populate this table.</td></tr>}</tbody></table></div></section>

                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between"><PanelHeading icon={WalletCards} title={`Portfolio Overview - ${formatKES(totals.totalValue)}`} noMargin /><button type="button" onClick={openRebalanceModal} className="text-sm font-semibold text-[#175f54]">Rebalance</button></div>
                            <div className="mb-4 h-3 overflow-hidden rounded-full bg-[#edf5f2]"><div className="flex h-3 w-full">{allocation.length > 0 ? allocation.map((item) => <div key={item.label} style={{ width: `${item.percent}%`, backgroundColor: item.color }} className="h-3 border-r border-white last:border-r-0" />) : <div className="h-3 w-full bg-slate-300" />}</div></div>
                            {loading ? (<div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading portfolio...</div>) : investmentAssets.length === 0 ? (<p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">No investments yet. Click + Add Investment to begin.</p>) : (<div className="grid gap-4 lg:grid-cols-[180px_1fr]"><div className="flex items-center justify-center"><div className="flex h-36 w-36 items-center justify-center rounded-full border-[14px] border-[#19725f] text-center text-sm font-bold text-slate-900 shadow-sm">KES<br />{(totals.totalValue / 1000000).toFixed(1)}M</div></div><div className="space-y-2">{allocation.map((item) => <LegendRow key={item.label} color={item.color} label={item.label} value={`${item.percent.toFixed(1)}%`} />)}</div></div>)}
                        </article>

                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Trophy} title="Performance Summary" />
                            <div className="mt-4 rounded-[1rem] bg-[#165747] px-5 py-6 text-center text-white"><p className="text-xs uppercase tracking-[0.18em] text-white/70">Portfolio Total Return</p><p className="mt-2 text-[3rem] font-extrabold leading-none text-[#f4c95d]">{totals.totalInvested > 0 ? ((totals.totalGainLoss / Math.max(totals.totalInvested, 1)) * 100).toFixed(1) : '0.0'}%</p><p className="mt-2 text-sm text-white/80">{formatKES(totals.totalInvested)} invested to {formatKES(totals.totalValue)} today</p></div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoMiniCard label="This Month" value={formatKES(Math.max(totals.totalGainLoss * 0.12, 0))} helper="Latest change" valueClass="text-[#175f54]" /><InfoMiniCard label="This Year (YTD)" value={formatKES(Math.max(totals.totalGainLoss * 0.55, 0))} helper="Year to date" valueClass="text-[#175f54]" /></div>
                            <div className="mt-5 space-y-3"><p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">Returns by Asset Class</p>{allocation.length > 0 ? allocation.map((item) => <AssetReturnRow key={item.label} label={item.label} color={item.color} value={`+${(Math.max(item.percent / 3.4, 0)).toFixed(1)}%`} width={Math.min(item.percent * 1.6, 100)} />) : <p className="text-sm text-slate-500">Add investments to see return contributions.</p>}</div>
                        </article>
                    </section>

                    <section className="overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] p-5 text-white shadow-sm">
                        <p className="text-[1.3rem] font-extrabold">Your Investments Power the Whole Ecosystem</p>
                        <p className="mt-2 text-sm text-white/80">Portfolio data flows into your net worth, budget, and Buddy AI recommendations automatically.</p>
                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            {ecosystemLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button key={item.title} type="button" onClick={item.onClick} className="rounded-[1rem] border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#f4c95d]"><Icon size={18} /></span>
                                        <p className="mt-4 font-semibold text-white">{item.title}</p>
                                        <p className="mt-2 text-sm text-white/70">{item.subtitle}</p>
                                        <p className="mt-3 text-sm font-semibold text-[#f4c95d]">{item.action}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'risk' && (
                <section className="hidden gap-4 md:grid xl:grid-cols-[0.95fr_1.05fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={ShieldCheck} title="My Investment Objectives" />
                        <div className="mt-4 rounded-[1rem] bg-[#eef8f3] p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#6f968a]">Risk appetite</p>
                            <p className="mt-2 text-[2.3rem] font-extrabold leading-none text-[#175f54]">{investmentPlan.riskAppetite}</p>
                            <p className="mt-2 text-sm text-slate-600">{investmentPlan.horizon} horizon with {investmentPlan.preferredProducts} as preferred products.</p>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <InfoMiniCard label="Target Return" value={`${investmentPlan.expectedReturn.toFixed(1)}%`} helper="Annualized target" valueClass="text-[#175f54]" />
                            <InfoMiniCard label="Monthly Plan" value={formatKES(investmentPlan.monthlyContribution)} helper="From profile goal" valueClass="text-[#2167d8]" />
                        </div>
                    </article>

                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={TargetIcon} title="Investment Target Summary" />
                        <div className="mt-4 space-y-3">
                            <MetricPanel label="Current Investments" value={formatKES(totals.totalValue)} valueClass="text-[#175f54]" />
                            <MetricPanel label="Target Investment Amount" value={formatKES(investmentPlan.targetAmount)} valueClass="text-[#2167d8]" />
                            <MetricPanel label="Expected Amount" value={formatKES(investmentPlan.expectedAmount)} valueClass="text-[#175f54]" />
                            <MetricPanel label="Target Investment Date" value={investmentPlan.targetDateLabel} valueClass="text-[#8b5cf6]" />
                        </div>
                        <button type="button" onClick={() => onSelectSection && onSelectSection('user')} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#18765e] px-4 py-3 text-sm font-semibold text-white">Update Investment Objectives<ArrowRight size={14} /></button>
                    </article>
                </section>
            )}

            {activeTab === 'explore' && (
                <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Sparkles} title="Explore Investment Solutions" />
                        <div className="mt-4 grid gap-3">
                            {investmentAssets.length === 0 ? (
                                <p className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">Add an investment first so Shilingi can suggest product reviews from your real portfolio and risk profile.</p>
                            ) : (
                                allocation.slice(0, 3).map((item) => (
                                    <div key={`${item.label}-solution`} className="rounded-[1rem] border border-slate-200 bg-[#f7fbf9] p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-base font-semibold text-slate-900">{item.label}</p>
                                                <p className="mt-1 text-sm text-slate-500">{formatKES(item.value)} current value - {item.percent.toFixed(1)}% of portfolio</p>
                                            </div>
                                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{item.percent > 45 ? 'Diversify this position' : 'Worth comparing'}</span>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-700">{item.percent > 45 ? 'This product type carries a large share of your portfolio. Compare lower-risk or complementary options before adding more.' : `Compare options that match your ${investmentPlan.riskAppetite.toLowerCase()} risk profile and ${investmentPlan.horizon} horizon.`}</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button type="button" onClick={() => setActiveTab('simulator')} className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">Simulate growth</button>
                                            <button type="button" onClick={() => onSelectSection && onSelectSection('comparehub')} className="rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-xs font-semibold text-[#175f54]">Compare products</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </article>
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={ShieldCheck} title="What to Compare" />
                        <div className="mt-4 space-y-3">
                            <ChecklistRow text="Net annual return after all fees, taxes, and charges" />
                            <ChecklistRow text={`Fit with your ${investmentPlan.riskAppetite.toLowerCase()} risk profile`} />
                            <ChecklistRow text={`Liquidity and lock-in period for your ${investmentPlan.horizon} horizon`} />
                            <ChecklistRow text="Minimum top-up amount and contribution flexibility" />
                            <ChecklistRow text="Whether the product improves your current allocation mix" />
                        </div>
                        <div className="mt-5 rounded-[1rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Your preferred products from profile: {investmentPlan.preferredProducts}. Use this as a starting point, then compare suitability against your current portfolio.</div>
                    </article>
                </section>
            )}

            {activeTab === 'simulator' && (<section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]"><article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Sparkles} title="Investment Calculators" /><p className="mt-3 text-sm text-slate-600">Test how faster top-ups and returns could get you to your target portfolio.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><TextField type="number" label="Monthly Contribution" value={simulator.monthlyContribution} onChange={(value) => setSimulator((c) => ({ ...c, monthlyContribution: value }))} /><TextField type="number" label="Duration (Years)" value={simulator.durationYears} onChange={(value) => setSimulator((c) => ({ ...c, durationYears: value }))} /><TextField type="number" label="Expected Return (%)" value={simulator.expectedReturn} onChange={(value) => setSimulator((c) => ({ ...c, expectedReturn: value }))} /><TextField type="number" label="Target Amount (KES)" value={simulator.targetAmount} onChange={(value) => setSimulator((c) => ({ ...c, targetAmount: value }))} /></div><div className="mt-5 rounded-[1rem] border border-amber-200 bg-[linear-gradient(180deg,_#f7fbf8_0%,_#fff4df_100%)] p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">Projected Portfolio Value</p><p className="mt-2 text-[2.6rem] font-extrabold leading-none text-[#175f54]">{formatKES(projectedValue)}</p><p className="mt-2 text-sm text-slate-600">Target progress: {targetAmount > 0 ? ((projectedValue / targetAmount) * 100).toFixed(1) : '0.0'}%</p></div></article><article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Trophy} title="Scenario Summary" /><div className="mt-4 space-y-3"><MetricPanel label="Current Portfolio" value={formatKES(totals.totalValue)} valueClass="text-[#175f54]" /><MetricPanel label="Projected Value" value={formatKES(projectedValue)} valueClass="text-[#2167d8]" /><MetricPanel label="Target Date" value={targetDate} valueClass="text-[#8b5cf6]" /><MetricPanel label="Gap To Target" value={formatKES(Math.max(targetAmount - projectedValue, 0))} valueClass="text-rose-500" /><button type="button" onClick={openRebalanceModal} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white">Rebalance Portfolio<ArrowRight size={14} /></button></div></article></section>)}

            {showRebalanceModal && <RebalanceModal allocation={allocation} targetAllocation={targetAllocation} onChangeTarget={handleTargetAllocationChange} onClose={() => setShowRebalanceModal(false)} onSave={handleSaveTargetAllocation} />}

            {showTypeModal && <TypeModal types={INVESTMENT_TYPES} submitting={submitting} onClose={() => setShowTypeModal(false)} onSelect={handleSelectType} />}

            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-3 pb-0 pt-6 backdrop-blur-[1px] sm:items-center sm:p-4">
                    <div className="flex max-h-[92vh] w-full max-w-[390px] flex-col overflow-hidden rounded-t-[1.35rem] bg-white shadow-2xl sm:max-w-[30rem] sm:rounded-[1.35rem]">
                        <div className="shrink-0 px-4 pb-2 pt-3">
                            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-[0.9rem] font-extrabold text-slate-950">Add your investment</h3>
                                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Kindly provide the following to add your investment.</p>
                                </div>
                                <button type="button" onClick={() => setShowFormModal(false)} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400"><X size={13} /></button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-2">
                            <label className="block text-[10px] font-semibold text-slate-500">
                                Investment Type
                                <div className="mt-1.5 flex h-10 items-center justify-between rounded-[0.7rem] border border-slate-200 bg-[#f7faf8] px-3 text-[11px] font-semibold text-slate-700">
                                    <span>{investmentTypeDetails[selectedType?.id]?.label || selectedType?.label || 'Investment'}</span>
                                    <span className="text-slate-300">v</span>
                                </div>
                            </label>
                            <TextField label={investmentNameLabel} value={formData.name} onChange={(value) => setFormData((c) => ({ ...c, name: value }))} required placeholder="Eg. Money Market Fund" compact />
                            <div className="grid gap-2.5">
                                <TextField type="number" label="Current Value" value={formData.current_value} onChange={(value) => setFormData((c) => ({ ...c, current_value: value }))} required placeholder="Eg. KES 3,000,000" compact />
                                <TextField type="number" label="Purchase Value" value={formData.purchase_value} onChange={(value) => setFormData((c) => ({ ...c, purchase_value: value }))} placeholder="Eg. KES 300,000" compact />
                            </div>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                <TextField type="number" label="Interest Rate" value={formData.interest_rate} onChange={(value) => setFormData((c) => ({ ...c, interest_rate: value }))} placeholder="Eg. 12%" compact />
                                <TextField type="date" label="Purchase Date" value={formData.purchase_date} onChange={(value) => setFormData((c) => ({ ...c, purchase_date: value }))} compact />
                            </div>
                            <div className="grid gap-2.5">
                                <TextField label="Institution" value={formData.institution} onChange={(value) => setFormData((c) => ({ ...c, institution: value }))} placeholder="Eg. CBK" compact />
                                <TextField label="Account Reference Number" value={formData.account_number} onChange={(value) => setFormData((c) => ({ ...c, account_number: value }))} placeholder="Eg. 0001" compact />
                            </div>
                            <label className="block text-[10px] font-semibold text-slate-500">Notes<textarea rows={2} value={formData.notes} placeholder="Type Something" onChange={(event) => setFormData((c) => ({ ...c, notes: event.target.value }))} className="mt-1.5 w-full rounded-[0.7rem] border border-slate-200 bg-[#f7faf8] px-3 py-2.5 text-[11px] outline-none transition placeholder:text-slate-400 focus:border-[#006d67] focus:ring-2 focus:ring-[#006d67]/10" /></label>
                            </div>
                            <div className="shrink-0 bg-white px-4 pb-4 pt-2"><button type="submit" disabled={submitting} className="h-11 w-full rounded-full bg-[#006d67] text-[0.78rem] font-extrabold text-white shadow-sm disabled:opacity-60">{submitting ? 'Adding...' : '+ Add Investment'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const MobileRiskProfileFlow = ({ answers, currentStep, investmentPlan, isComplete, onAnswer, onContinue, onContinueToInvestments, onGetStarted, showOnboarding }) => {
    const question = riskProfileQuestions[currentStep] || riskProfileQuestions[0];
    const selectedValue = answers[question.id];

    if (showOnboarding) {
        return (
            <section className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-slate-200 bg-[#f8f8f8] shadow-sm md:hidden">
                <div className="bg-white px-4 pb-5 pt-4">
                    <div>
                        <p className="text-[10px] text-slate-500">Welcome to your</p>
                        <h2 className="dashboard-display-title text-[1rem] font-extrabold leading-tight text-[#006d67]">Investment Planner</h2>
                        <p className="mt-1 max-w-[15.5rem] text-[10px] leading-4 text-slate-500">Let's take your investments to the next level.</p>
                    </div>

                    <div className="mx-auto mt-5 flex h-24 w-28 items-center justify-center">
                        <img src={investmentPlannerHero} alt="" className="h-full w-full object-contain" />
                    </div>
                </div>

                <div className="px-4 pb-5">
                    <div className="-mt-3 rounded-full bg-[#fff4d6] px-3 py-2 text-center text-[10px] font-semibold text-[#8a6811]">Welcome! Let's get you started.</div>
                    <div className="mt-4 rounded-[1rem] bg-white p-4 shadow-sm">
                        <p className="text-[0.78rem] font-extrabold text-slate-900">Let's set your investment planner</p>
                        <p className="mt-1 text-[10px] leading-4 text-slate-500">This quick setup helps Shilingi Moves understand your goals and recommend investments you can actually stick with.</p>
                        <div className="mt-4 space-y-3">
                            <MobileSetupStep active title="Risk Profile" text="Set your risk profile to know your kind of investor." />
                            <MobileSetupStep title="Current Investments" text="Add your current investments to your investment portfolio." />
                            <MobileSetupStep title="Goals / Objectives" text="Add your goals and objectives to tailor investment strategies." />
                        </div>
                    </div>
                    <button type="button" onClick={onGetStarted} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.78rem] font-extrabold text-white shadow-sm">Get Started</button>
                </div>
            </section>
        );
    }

    if (isComplete) {
        return (
            <section className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-slate-200 bg-[#f8f8f8] shadow-sm md:hidden">
                <MobileInvestmentHeader />
                <div className="px-4 pb-5">
                    <article className="rounded-[1rem] bg-white p-4 shadow-sm">
                        <p className="inline-flex rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#14815f]">Risk profile saved</p>
                        <h2 className="mt-3 dashboard-display-title text-[1.35rem] font-extrabold leading-tight text-slate-950">{investmentPlan.riskAppetite} Investor</h2>
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">{investmentPlan.horizon} horizon with {investmentPlan.preferredProducts} as your suggested starting mix.</p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <MobileResultMetric label="Target return" value={`${investmentPlan.expectedReturn.toFixed(1)}%`} />
                            <MobileResultMetric label="Monthly plan" value={formatKES(investmentPlan.monthlyContribution)} />
                        </div>
                        <button type="button" onClick={onContinueToInvestments} className="mt-4 h-10 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white">Continue</button>
                    </article>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-slate-200 bg-[#f8f8f8] shadow-sm md:hidden">
            <MobileInvestmentHeader />
            <div className="px-4 pb-5">
                <article className="rounded-[1rem] bg-white p-4 shadow-sm">
                    <p className="inline-flex rounded-full bg-[#e9f8ef] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#14815f]">Step {currentStep + 1} of {riskProfileQuestions.length}</p>
                    <h2 className="mt-3 dashboard-display-title text-[1.22rem] font-extrabold leading-tight text-slate-950">{question.title}</h2>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">{question.helper}</p>
                    <div className="mt-4 space-y-2.5">
                        {question.options.map((option) => {
                            const active = selectedValue === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onAnswer(question.id, option.value)}
                                    className={`flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-[0.8rem] border px-3 py-2 text-left transition ${active ? 'border-[#006d67] bg-[#eaf6ee]' : 'border-slate-200 bg-white'}`}
                                >
                                    <span>
                                        <span className="block text-[0.75rem] font-extrabold text-slate-900">{option.label}</span>
                                        <span className="mt-0.5 block text-[9px] text-slate-400">{option.detail}</span>
                                    </span>
                                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-[#006d67]' : 'border-slate-300'}`}>
                                        {active ? <span className="h-2 w-2 rounded-full bg-[#006d67]" /> : null}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <button type="button" onClick={onContinue} disabled={!selectedValue} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.78rem] font-extrabold text-white shadow-sm disabled:bg-slate-300">Continue</button>
                </article>
            </div>
        </section>
    );
};

const MobileInvestmentPortfolioFlow = ({
    activeView,
    allocation,
    assets,
    deletingAssetId,
    investmentPlan,
    onAddInvestment,
    onDelete,
    onSelectView,
    onTopUp,
    portfolioInsights,
    projectedValue,
    simulator,
    targetAmount,
    targetDate,
    totals,
    updateSimulator,
}) => {
    const recommendedAsset = assets[0];
    return (
        <section className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[1.45rem] border border-slate-200 bg-[#f8f8f8] shadow-sm md:hidden">
            <MobileInvestmentHeader />
            <div className="px-4 pb-5">
                <MobileInvestmentTabs activeView={activeView} onSelectView={onSelectView} />
                {activeView === 'overview' && (
                    <MobileInvestmentOverview
                        allocation={allocation}
                        assets={assets}
                        investmentPlan={investmentPlan}
                        onAddInvestment={onAddInvestment}
                        onSelectView={onSelectView}
                        totals={totals}
                    />
                )}
                {activeView === 'investments' && (
                    <MobileInvestmentListView
                        assets={assets}
                        deletingAssetId={deletingAssetId}
                        onAddInvestment={onAddInvestment}
                        onDelete={onDelete}
                        onTopUp={onTopUp}
                        portfolioInsights={portfolioInsights}
                        totals={totals}
                    />
                )}
                {activeView === 'solutions' && (
                    <MobileInvestmentSolutionsView
                        investmentPlan={investmentPlan}
                        onCompare={() => onSelectView('calculator')}
                        recommendedAsset={recommendedAsset}
                    />
                )}
                {activeView === 'calculator' && (
                    <MobileInvestmentCalculatorView
                        projectedValue={projectedValue}
                        simulator={simulator}
                        targetAmount={targetAmount}
                        targetDate={targetDate}
                        totals={totals}
                        updateSimulator={updateSimulator}
                    />
                )}
            </div>
        </section>
    );
};

const MobileInvestmentTabs = ({ activeView, onSelectView }) => {
    const tabs = [
        { id: 'overview', label: 'All' },
        { id: 'investments', label: 'My Investments' },
        { id: 'solutions', label: 'Solutions' },
        { id: 'calculator', label: 'Calculator' },
    ];
    return (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {tabs.map((tab) => {
                const active = activeView === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectView(tab.id)}
                        className={`h-7 shrink-0 rounded-full px-3 text-[9px] font-extrabold transition ${active ? 'bg-[#f2b928] text-white' : 'bg-white text-slate-500 shadow-sm'}`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

const MobileInvestmentOverview = ({ allocation, assets, investmentPlan, onAddInvestment, onSelectView, totals }) => (
    <div className="space-y-3">
        <MobileTotalInvestmentCard totals={totals} />
        <MobileRiskProfileSummary investmentPlan={investmentPlan} />
        <article className="rounded-[1rem] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">My Investments</h2>
                <button type="button" onClick={() => onSelectView('investments')} className="text-[9px] font-extrabold text-[#d8a019]">View All</button>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">Add your current investments to track and push your financial future toward your goals and objectives.</p>
            {assets.length === 0 ? (
                <MobileNoInvestments onAddInvestment={onAddInvestment} />
            ) : (
                <div className="mt-3 space-y-3">
                    {assets.slice(0, 2).map((asset) => <MobileInvestmentCard key={asset.uuid} asset={asset} onTopUp={() => onSelectView('investments')} />)}
                </div>
            )}
        </article>
        <MobilePortfolioOverview allocation={allocation} totals={totals} />
    </div>
);

const MobileInvestmentListView = ({ assets, deletingAssetId, onAddInvestment, onDelete, onTopUp, portfolioInsights, totals }) => (
    <div className="space-y-3">
        <MobileTotalInvestmentCard totals={totals} />
        <article className="rounded-[1rem] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">My Investments</h2>
                    <p className="mt-1 max-w-[14rem] text-[10px] leading-4 text-slate-500">Add your current investments to track and push your financial future toward your goals and objectives.</p>
                </div>
                {assets.length > 0 ? <button type="button" onClick={onAddInvestment} className="shrink-0 text-[9px] font-extrabold text-[#d8a019]">+ Add Investment</button> : null}
            </div>
            {assets.length === 0 ? (
                <MobileNoInvestments onAddInvestment={onAddInvestment} />
            ) : (
                <div className="mt-4 space-y-3">
                    {assets.slice(0, 5).map((asset) => (
                        <MobileInvestmentCard key={asset.uuid} asset={asset} deleting={deletingAssetId === asset.uuid} onDelete={() => onDelete(asset)} onTopUp={onTopUp} showActions />
                    ))}
                </div>
            )}
        </article>
        {assets.length > 0 ? (
            <article className="rounded-[1rem] bg-white p-4 shadow-sm">
                <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">Insights</h2>
                <div className="mt-3 space-y-2">
                    {portfolioInsights.slice(0, 3).map((item) => <MobileInsight key={item.title} title={item.title} text={item.text} />)}
                </div>
            </article>
        ) : null}
    </div>
);

const MobileInvestmentSolutionsView = ({ investmentPlan, onCompare, recommendedAsset }) => (
    <div className="space-y-3">
        <article className="rounded-[1rem] bg-white p-4 shadow-sm">
            <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">Recommendations</h2>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">Apply this move toward enriching your debt free goal and your future.</p>
            <div className="mt-3 rounded-[0.9rem] border border-emerald-100 bg-[#f7fbf9] p-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <span className="inline-flex rounded-full bg-[#eaf6ee] px-2 py-0.5 text-[8px] font-extrabold text-[#16835d]">{investmentPlan.riskAppetite}</span>
                        <p className="mt-2 text-[0.78rem] font-extrabold text-slate-950">{recommendedAsset?.name || 'Money Market Fund'}</p>
                        <p className="mt-1 text-[9px] leading-4 text-slate-500">{investmentPlan.preferredProducts}</p>
                    </div>
                    <p className="shrink-0 text-right text-[0.72rem] font-extrabold text-[#006d67]">{formatKES(investmentPlan.monthlyContribution)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={onCompare} className="h-8 rounded-full bg-[#006d67] text-[10px] font-extrabold text-white">Investing Strategy</button>
                    <button type="button" onClick={onCompare} className="h-8 rounded-full border border-emerald-200 bg-white text-[10px] font-extrabold text-[#006d67]">Compare Options</button>
                </div>
            </div>
        </article>
        <article className="rounded-[1rem] bg-[#f2b928] p-4 text-white shadow-sm">
            <h2 className="text-[0.82rem] font-extrabold">What To Compare</h2>
            <p className="mt-1 text-[10px] leading-4 text-white/85">What to check, and what to do after reviewing your investment.</p>
        </article>
        <article className="rounded-[1rem] bg-white p-4 shadow-sm">
            <div className="space-y-2">
                <MobileCompareRow text="Net annual return after all fees, taxes, and charges" />
                <MobileCompareRow text="Fit with your moderate risk profile" />
                <MobileCompareRow text="Liquidity and lock-in period for your horizon" />
                <MobileCompareRow text="Minimum top-up amount and contribution flexibility" />
                <MobileCompareRow text="Whether the product improves your current allocation mix" />
            </div>
        </article>
    </div>
);

const MobileInvestmentCalculatorView = ({ projectedValue, simulator, targetAmount, targetDate, totals, updateSimulator }) => (
    <div className="space-y-3">
        <article className="rounded-[1rem] bg-white p-4 shadow-sm">
            <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">Investment Calculator</h2>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">Test how faster top-ups and returns could get you to your target portfolio.</p>
            <div className="mt-3 rounded-[1rem] bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)] p-4 text-white">
                <p className="text-[9px] font-bold text-white/75">Estimated Portfolio Value</p>
                <p className="mt-1 text-[1.35rem] font-extrabold">{formatKES(projectedValue)}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-[#f2b928]" style={{ width: `${Math.min(targetAmount > 0 ? (projectedValue / targetAmount) * 100 : 0, 100)}%` }} /></div>
            </div>
            <div className="mt-3 space-y-2.5">
                <MobileCalculatorInput label="Monthly Contribution" value={simulator.monthlyContribution} onChange={(value) => updateSimulator('monthlyContribution', value)} placeholder="Eg. KES 3,000,000" />
                <MobileCalculatorInput label="Duration" value={simulator.durationYears} onChange={(value) => updateSimulator('durationYears', value)} placeholder="Eg. 12 Years" />
                <MobileCalculatorInput label="Expected Return" value={simulator.expectedReturn} onChange={(value) => updateSimulator('expectedReturn', value)} placeholder="Eg. 12%" />
                <MobileCalculatorInput label="Target Amount" value={simulator.targetAmount} onChange={(value) => updateSimulator('targetAmount', value)} placeholder="Eg. 10,000,000" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="h-8 rounded-full bg-[#006d67] text-[10px] font-extrabold text-white">Calculate</button>
                <button type="button" className="h-8 rounded-full border border-emerald-200 bg-white text-[10px] font-extrabold text-[#006d67]">Reset</button>
            </div>
        </article>
        <article className="rounded-[1rem] bg-white p-4 shadow-sm">
            <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">Scenario Summary</h2>
            <div className="mt-3 space-y-2">
                <MobileSummaryRow label="Current Portfolio" value={formatKES(totals.totalValue)} />
                <MobileSummaryRow label="Projected Value" value={formatKES(projectedValue)} />
                <MobileSummaryRow label="Target Date" value={targetDate} />
                <MobileSummaryRow label="Gap To Target" value={formatKES(Math.max(targetAmount - projectedValue, 0))} />
            </div>
            <button type="button" className="mt-3 h-9 w-full rounded-full bg-[#006d67] text-[10px] font-extrabold text-white">Rebalance Portfolio</button>
        </article>
    </div>
);

const MobileInvestmentCard = ({ asset, deleting, onDelete, onTopUp, showActions = false }) => {
    const rate = Number(asset.raw?.interest_rate || 0);
    return (
        <div className="rounded-[0.9rem] border border-emerald-100 bg-[#fbfefd] p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[#eaf6ee] px-2 py-0.5 text-[8px] font-extrabold text-[#16835d]">{asset.typeMeta?.tag || 'Investment'}</span>
                    <p className="mt-2 truncate text-[0.78rem] font-extrabold text-slate-950">{asset.name}</p>
                    <p className="mt-1 text-[9px] text-slate-500">{asset.institution || asset.categoryName || 'Investment account'}</p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[9px] text-slate-400">KES {Math.round(Number(asset.currentValue || 0)).toLocaleString('en-KE')}</p>
                    <p className="mt-1 text-[0.72rem] font-extrabold text-[#006d67]">{rate ? `${rate.toFixed(1)}%` : 'Tracking'}</p>
                    <span className="mt-1 inline-flex rounded-full bg-[#fff4d6] px-2 py-0.5 text-[8px] font-bold text-[#8a6811]">Active</span>
                </div>
            </div>
            <p className="mt-3 text-[9px] leading-4 text-slate-500">{asset.purchaseDate ? `Started ${formatDate(asset.purchaseDate)}` : 'Recently added'} | Liquid: {asset.isLiquid ? 'Yes' : 'No'}</p>
            {showActions ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={onTopUp} className="h-8 rounded-full bg-[#006d67] text-[10px] font-extrabold text-white">+ Top-Up</button>
                    <button type="button" onClick={onDelete} disabled={deleting} className="h-8 rounded-full bg-rose-50 text-[10px] font-extrabold text-rose-600 disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete'}</button>
                </div>
            ) : null}
        </div>
    );
};

const MobileTotalInvestmentCard = ({ totals }) => (
    <article className="rounded-[1rem] bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)] p-4 text-white shadow-sm">
        <p className="text-[9px] font-bold text-white/75">Total Investment</p>
        <p className="mt-1 text-[1.35rem] font-extrabold">{formatKES(totals.totalValue)}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full w-[72%] rounded-full bg-[#f2b928]" /></div>
        <div className="mt-3 grid grid-cols-3 gap-2">
            <MobileMiniMetric label="Return" value={formatKES(Math.max(totals.totalGainLoss, 0))} />
            <MobileMiniMetric label="Invested" value={formatKES(totals.totalInvested)} />
            <MobileMiniMetric label="Assets" value={String(totals.count)} />
        </div>
    </article>
);

const MobileMiniMetric = ({ label, value }) => (
    <div className="rounded-[0.65rem] bg-white/12 px-2 py-2">
        <p className="text-[8px] text-white/70">{label}</p>
        <p className="mt-0.5 truncate text-[10px] font-extrabold text-white">{value}</p>
    </div>
);

const MobileRiskProfileSummary = ({ investmentPlan }) => (
    <article className="rounded-[1rem] bg-white p-4 shadow-sm">
        <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">Risk Profile</h2>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">Here is your risk appetite profile tailored for you.</p>
        <div className="mt-3 rounded-[0.9rem] bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)] p-4 text-white">
            <p className="text-[1rem] font-extrabold">{investmentPlan.riskAppetite}</p>
            <p className="mt-1 text-[9px] leading-4 text-white/80">{investmentPlan.horizon} horizon with {investmentPlan.preferredProducts}.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <MobileMiniMetric label="Target Return" value={`${investmentPlan.expectedReturn.toFixed(1)}%`} />
                <MobileMiniMetric label="Monthly Plan" value={formatKES(investmentPlan.monthlyContribution)} />
            </div>
        </div>
    </article>
);

const MobileNoInvestments = ({ onAddInvestment }) => (
    <div className="pt-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5f7] text-[#006d67] shadow-inner">
            <WalletCards size={22} />
        </span>
        <p className="mt-5 text-[0.76rem] font-extrabold text-slate-900">No Investments</p>
        <p className="mx-auto mt-1 max-w-[13rem] text-[9px] leading-4 text-slate-500">Let us get to know your current investments that you might have already set up.</p>
        <button type="button" onClick={onAddInvestment} className="mt-4 h-10 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm">Add Investment</button>
        <div className="mt-3 rounded-full bg-[#fff4d6] px-3 py-2 text-center text-[10px] font-semibold text-[#8a6811]">Let's get your investments set up.</div>
    </div>
);

const MobilePortfolioOverview = ({ allocation, totals }) => (
    <article className="rounded-[1rem] bg-white p-4 shadow-sm">
        <h2 className="text-[0.82rem] font-extrabold text-[#006d67]">Portfolio Overview</h2>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">Here is a summary of your investment portfolio.</p>
        <p className="mt-4 text-center text-[9px] text-slate-400">Total Investment</p>
        <p className="mt-1 text-center text-[1.3rem] font-extrabold text-slate-900">{formatKES(totals.totalValue)}</p>
        <div className="mt-3 h-4 overflow-hidden rounded-[0.35rem] bg-slate-100">
            <div className="flex h-full w-full">
                {allocation.length > 0 ? allocation.map((item) => <span key={item.label} className="h-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />) : <span className="h-full w-full bg-slate-300" />}
            </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
            {(allocation.length > 0 ? allocation : [{ label: 'Money Market', percent: 100, color: '#006d67' }]).slice(0, 4).map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[8px] text-slate-500">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.label}</span>
                    <span className="font-bold">{Math.round(item.percent)}%</span>
                </div>
            ))}
        </div>
    </article>
);

const MobileInsight = ({ title, text }) => (
    <div className="rounded-[0.85rem] bg-[#fff8ea] p-3">
        <p className="text-[0.72rem] font-extrabold text-[#b56900]">{title}</p>
        <p className="mt-1 text-[9px] leading-4 text-slate-600">{text}</p>
    </div>
);

const MobileCompareRow = ({ text }) => (
    <div className="flex items-start justify-between gap-3 rounded-[0.85rem] bg-[#f7faf8] px-3 py-3 text-[10px] leading-4 text-slate-600">
        <span>{text}</span>
        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#f2b928] text-[8px] font-black text-white">i</span>
    </div>
);

const MobileCalculatorInput = ({ label, value, onChange, placeholder }) => (
    <label className="block text-[10px] font-semibold text-slate-500">
        {label}
        <NumericInput
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="mt-1.5 w-full rounded-[0.7rem] border border-slate-200 bg-[#f7faf8] px-3 py-2.5 text-[11px] outline-none transition placeholder:text-slate-400 focus:border-[#006d67] focus:ring-2 focus:ring-[#006d67]/10"
        />
    </label>
);

const MobileSummaryRow = ({ label, value }) => (
    <div className="flex items-center justify-between rounded-[0.75rem] bg-[#f7faf8] px-3 py-2.5">
        <span className="text-[10px] text-slate-500">{label}</span>
        <span className="text-[10px] font-extrabold text-slate-900">{value}</span>
    </div>
);

const MobileInvestmentHeader = () => (
    <div className="bg-white px-4 pb-5 pt-4">
        <div>
            <p className="text-[10px] text-slate-500">Welcome to your</p>
            <h2 className="dashboard-display-title text-[1rem] font-extrabold leading-tight text-[#006d67]">Investment Planner</h2>
            <p className="mt-1 max-w-[15.5rem] text-[10px] leading-4 text-slate-500">Let's take your investments to the next level.</p>
        </div>
    </div>
);

const MobileSetupStep = ({ active = false, title, text }) => (
    <div className="flex gap-3">
        <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${active ? 'bg-[#16835d] text-white' : 'bg-[#dfeee9] text-[#006d67]'}`}>{active ? '1' : ''}</span>
        <span>
            <span className="block text-[0.72rem] font-extrabold text-slate-900">{title}</span>
            <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">{text}</span>
        </span>
    </div>
);

const MobileResultMetric = ({ label, value }) => (
    <div className="rounded-[0.85rem] border border-emerald-100 bg-[#f7fbf9] p-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#82a79c]">{label}</p>
        <p className="mt-1 text-[0.85rem] font-extrabold text-[#006d67]">{value}</p>
    </div>
);

const StatCard = ({ title, value, helper, valueClass, featured = false, progress = 0 }) => (<article className={`rounded-[1.2rem] border border-primary-100 px-4 py-4 shadow-sm ${featured ? 'bg-[#176f5a] text-white' : 'bg-white'}`}><p className={`text-[11px] font-semibold uppercase tracking-[0.17em] ${featured ? 'text-white/70' : 'text-[#9bb8af]'}`}>{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${featured ? 'text-[#f4c95d]' : valueClass}`}>{value}</p><p className={`mt-2 text-[0.82rem] ${featured ? 'text-white/85' : 'text-slate-500'}`}>{helper}</p>{featured ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#f4c95d]" style={{ width: `${Math.min(progress, 100)}%` }} /></div> : null}</article>);
const MetricCard = ({ title, value, valueClass }) => (<article className="rounded-[1.2rem] border border-primary-100 bg-white px-4 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#9bb8af]">{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${valueClass}`}>{value}</p></article>);
const TabButton = ({ active, onClick, children }) => (<button type="button" onClick={onClick} className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-[#18765e] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>);
const PanelHeading = ({ icon: Icon, title, noMargin = false }) => (<div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-1'}`}><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon size={18} /></span><h3 className="dashboard-display-title text-[1.05rem] font-bold text-slate-950">{title}</h3></div>);
const InfoMiniCard = ({ label, value, helper, valueClass }) => (<div className="rounded-[1rem] border border-slate-200 bg-[#f8fcfa] p-4"><p className="text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]">{label}</p><p className={`dashboard-metric-value mt-2 text-[1.38rem] font-extrabold leading-none sm:text-[1.5rem] ${valueClass}`}>{value}</p><p className="mt-2 text-[0.82rem] text-slate-500">{helper}</p></div>);
const MetricPanel = ({ label, value, valueClass }) => (<div className="rounded-[1rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="text-sm text-slate-700">{label}</span><span className={`dashboard-metric-value text-[1.08rem] font-extrabold ${valueClass}`}>{value}</span></div></div>);
const ChecklistRow = ({ text }) => (<div className="flex items-start gap-3 rounded-[0.9rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3 text-sm text-slate-700"><span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff3ea] text-[10px] font-extrabold text-[#175f54]">OK</span><span>{text}</span></div>);
const LegendRow = ({ color, label, value }) => (<div className="flex items-center justify-between text-sm"><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} /><span className="text-slate-700">{label}</span></div><span className="font-semibold text-slate-900">{value}</span></div>);
const AssetReturnRow = ({ label, color, value, width }) => (<div><div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-700">{label}</span><span style={{ color }} className="font-semibold">{value}</span></div><div className="h-2.5 rounded-full bg-[#eef5f2]"><div className="h-2.5 rounded-full" style={{ width: `${width}%`, backgroundColor: color }} /></div></div>);
const InsightCard = ({ title, text, tone }) => (<div className={`rounded-[1rem] border p-4 text-sm ${tone}`}><p className="font-semibold">{title}</p><p className="mt-1">{text}</p></div>);
const WatchlistRow = ({ name, meta, value, move, tone }) => (<div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0"><div><p className="text-sm font-semibold text-slate-900">{name}</p><p className="text-xs text-slate-500">{meta}</p></div><div className="text-right"><p className={`text-sm font-extrabold ${tone}`}>{value}</p><p className={`text-xs ${tone}`}>{move}</p></div></div>);
const ExploreProductCard = ({ name, meta, value, move, tone, onCompare }) => (<article className="rounded-[1.2rem] border border-emerald-100 bg-white p-5 shadow-sm"><p className="text-lg font-bold text-slate-950">{name}</p><p className="mt-1 text-sm text-slate-500">{meta}</p><div className="mt-4 flex items-center justify-between"><p className={`text-2xl font-extrabold ${tone}`}>{value}</p><span className={`text-sm font-semibold ${tone}`}>{move}</span></div><button type="button" onClick={onCompare} className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]">Open Compare Hub<ArrowRight size={14} /></button></article>);
const HoldingCard = ({ asset, deleting, onDelete, onTopUp }) => { const gain = Number(asset.gainLoss || 0); const rate = Number(asset.raw?.interest_rate || 0); const tone = asset.typeMeta.color; const purchaseValue = Number(asset.purchaseValue || asset.currentValue || 0); const progress = purchaseValue > 0 ? Math.min((Number(asset.currentValue || 0) / purchaseValue) * 100, 100) : 0; return (<div className="rounded-[1.1rem] border border-emerald-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[1.1rem] font-bold text-slate-900">{asset.name}</p><p className="mt-1 text-sm text-slate-500">{asset.institution || asset.categoryName || 'Investment holding'} <span className="ml-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${tone}18`, color: tone }}>{asset.typeMeta.tag}</span></p></div><div className="text-left sm:text-right"><p className="text-[2rem] font-extrabold leading-none text-slate-900">{formatKES(asset.currentValue)}</p><p className={`mt-1 text-sm font-semibold ${gain >= 0 ? 'text-[#175f54]' : 'text-rose-500'}`}>{gain >= 0 ? '+' : '-'}{formatKES(Math.abs(gain))} {purchaseValue > 0 ? `(${(((Number(asset.currentValue || 0) - purchaseValue) / purchaseValue) * 100).toFixed(1)}%)` : ''}</p></div></div><div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">Return p.a.</span><span className="font-semibold" style={{ color: tone }}>{rate ? `${rate.toFixed(1)}%` : `${(Math.max(progress / 7, 0)).toFixed(1)}%`}</span></div><div className="h-2.5 rounded-full bg-[#edf5f2]"><div className="h-2.5 rounded-full" style={{ width: `${Math.max(Math.min(progress, 100), 10)}%`, backgroundColor: tone }} /></div></div><p className="mt-3 text-sm text-slate-500">{asset.purchaseDate ? `Started ${formatDate(asset.purchaseDate)}` : 'Recently added'} � {asset.isLiquid ? 'Liquid' : 'Long-term'} � {asset.lastValuedDate ? `Updated ${formatDate(asset.lastValuedDate)}` : 'Awaiting first update'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onTopUp} className="rounded-[0.9rem] border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]">+ Top Up</button><button type="button" onClick={onDelete} disabled={deleting} className="rounded-[0.9rem] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete'}</button></div></div>); };
const investmentTypeDetails = {
    'fixed-income': { label: 'Stocks', detail: 'This includes government Treasury bonds available' },
    mmf: { label: 'Money Market', detail: 'This is regulated fund that hold short-term deposits.' },
    sacco: { label: 'SACCO', detail: 'This is where capital is within registered SACCOs in Kenya.' },
    stocks: { label: 'NSE Equities', detail: 'This is Nairobi Stock Exchange where you buy shares of listed companies.' },
    other: { label: 'Other Investments', detail: 'Add an investment group that is not listed here.' },
};

const TypeModal = ({ types, submitting, onClose, onSelect }) => (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 px-3 pb-0 pt-6 backdrop-blur-[1px] md:items-center md:p-4">
        <div className="w-full max-w-[390px] rounded-t-[1.35rem] bg-white px-4 pb-4 pt-3 shadow-2xl md:max-w-md md:rounded-[1.35rem]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-[0.9rem] font-extrabold text-[#006d67]">Investment Type</h3>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">Kindly select one investment type to add investment.</p>
                </div>
                <button type="button" onClick={onClose} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                    <X size={13} />
                </button>
            </div>
            <div className="mt-4 space-y-2.5">
                {types.map((type) => {
                    const Icon = type.icon;
                    const detail = investmentTypeDetails[type.id] || { label: type.label, detail: 'Add this investment to your portfolio.' };
                    return (
                        <button
                            key={type.id}
                            type="button"
                            disabled={submitting}
                            onClick={() => onSelect(type)}
                            className="flex w-full items-center justify-between gap-3 rounded-[0.85rem] border border-slate-100 bg-[#f8fbfa] px-3 py-3 text-left shadow-sm transition hover:border-emerald-200 disabled:opacity-60"
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf6ee] text-[#006d67]"><Icon size={15} /></span>
                                <span className="min-w-0">
                                    <span className="block text-[0.74rem] font-extrabold text-slate-950">{detail.label}</span>
                                    <span className="mt-0.5 block truncate text-[9px] text-slate-500">{detail.detail}</span>
                                </span>
                            </span>
                            <ArrowRight size={13} className="shrink-0 text-slate-300" />
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);
const RebalanceModal = ({ allocation, targetAllocation, onChangeTarget, onClose, onSave }) => {
    const totalTarget = allocation.reduce((sum, item) => sum + toNumber(targetAllocation[item.label]), 0);
    const totalDifference = totalTarget - 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4">
            <div className="max-h-[92vh] w-full max-w-[540px] overflow-y-auto rounded-[1.5rem] border border-emerald-100 bg-white px-4 py-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:px-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="pr-2">
                        <p className="inline-flex items-center gap-2 text-[1.35rem] font-extrabold text-slate-950 sm:text-[1.55rem]">
                            <Sparkles size={18} className="text-[#0f5d50]" />
                            Portfolio Rebalancing
                        </p>
                        <p className="mt-3 max-w-[420px] text-sm leading-6 text-slate-600">
                            Set your target allocation and Shilingi Moves will recommend adjustments to keep your portfolio balanced.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500">
                        <X size={16} />
                    </button>
                </div>

                {allocation.length === 0 ? (
                    <div className="mt-5 rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                        Add investments first so we can calculate your current allocation and rebalance targets.
                    </div>
                ) : (
                    <>
                        <div className="mt-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9bb8af]">Target Allocation (Must Total 100%)</p>
                                <p className={`text-sm font-semibold ${totalDifference === 0 ? 'text-[#175f54]' : 'text-amber-700'}`}>
                                    Total: {totalTarget}%{totalDifference === 0 ? '' : ` (${totalDifference > 0 ? '+' : ''}${totalDifference}%)`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            {allocation.map((item) => {
                                const meta = findAllocationMeta(item.label);
                                const Icon = meta.icon;
                                const currentPercent = Math.round(item.percent);
                                const targetPercent = targetAllocation[item.label] === '' ? '' : toNumber(targetAllocation[item.label]);
                                const delta = typeof targetPercent === 'number' ? targetPercent - currentPercent : 0;
                                const isOnTarget = delta === 0;
                                const amountTone = delta > 0 ? 'text-[#175f54]' : delta < 0 ? 'text-rose-500' : 'text-[#8da8a2]';
                                const statusTone = delta > 0 ? 'text-[#175f54]' : delta < 0 ? 'text-rose-500' : 'text-[#8da8a2]';
                                const statusText = isOnTarget ? 'On target' : `${Math.abs(delta)}% ${delta > 0 ? 'needed' : 'over'}`;

                                return (
                                    <div key={item.label} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 gap-3">
                                                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}14`, color: meta.color }}>
                                                    <Icon size={19} />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-[1rem] font-bold text-slate-950">{item.label}</p>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                                        <span>Current: {currentPercent}%</span>
                                                        <span>•</span>
                                                        <label className="inline-flex items-center gap-2">
                                                            <span>Target:</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={targetAllocation[item.label] ?? ''}
                                                                onChange={(event) => onChangeTarget(item.label, event.target.value)}
                                                                className="h-9 w-16 rounded-lg border border-emerald-200 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1c6c5d] focus:ring-2 focus:ring-[#1c6c5d]/10"
                                                            />
                                                            <span>%</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className={`text-[1.4rem] font-extrabold leading-none sm:text-[1.55rem] ${amountTone}`}>{formatKES(item.value)}</p>
                                                <p className={`mt-2 text-sm font-semibold ${statusTone}`}>{statusText}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button type="button" onClick={onClose} className="inline-flex h-12 items-center justify-center rounded-[0.95rem] border border-emerald-100 bg-[#f8fcfa] px-5 text-sm font-semibold text-slate-700 sm:w-[112px]">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={totalTarget !== 100}
                                className="inline-flex h-12 flex-1 items-center justify-center rounded-[0.95rem] bg-[#1c6c5d] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9bc3ba]"
                            >
                                Save Target Allocation
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
const TextField = ({ label, value, onChange, type = 'text', required = false, placeholder = '', compact = false }) => (
    <label className={`block ${compact ? 'text-[10px] font-semibold text-slate-500' : 'text-sm font-medium text-slate-700'}`}>
        {label}
        {type === 'number' ? (
            <NumericInput
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={compact ? 'mt-1.5 w-full rounded-[0.7rem] border border-slate-200 bg-[#f7faf8] px-3 py-2.5 text-[11px] outline-none transition placeholder:text-slate-400 focus:border-[#006d67] focus:ring-2 focus:ring-[#006d67]/10' : 'mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm'}
            />
        ) : (
            <input
                type={type}
                required={required}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={compact ? 'mt-1.5 w-full rounded-[0.7rem] border border-slate-200 bg-[#f7faf8] px-3 py-2.5 text-[11px] outline-none transition placeholder:text-slate-400 focus:border-[#006d67] focus:ring-2 focus:ring-[#006d67]/10' : 'mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm'}
            />
        )}
    </label>
);
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };

export default InvestmentTracker;

