
import React, { useEffect, useMemo, useState } from 'react';
import NumericInput from '../../common/NumericInput';
import {
    Activity,
    ArrowRight,
    Calculator,
    Car,
    Check,
    ChevronLeft,
    FileText,
    FolderOpen,
    Heart,
    Loader2,
    PiggyBank,
    ShieldAlert,
    ShieldCheck,
    ShieldPlus,
    Sparkles,
    Stethoscope,
    User,
    WalletCards,
    X,
} from 'lucide-react';
import { createAsset, createAssetCategory, deleteAsset, getAssetCategories, getAssets, updateAsset } from '../../../services/investmentTrackerApi';
import { deletePlan, getLatestPlan, savePlan } from '../../../services/plannerApi';
import PlannerSyncStatus from '../common/PlannerSyncStatus';
import { getDebts } from '../../../services/debtApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { usePlannerFinancialContext } from '../../../hooks/usePlannerFinancialContext';
import { buildFinancialSnapshot, buildProtectionInsights } from '../../../utils/financialIntelligence';
import { USER_PROFILE_WORKSPACE_KEY } from '../user/UserGoalsFamilyForm';
import { getStoredUserProfile } from '../../../services/sessionManager';
import { getDashboardDisplayName } from '../../../utils/memberIdentity';
import protectionPlannerHero from '../../../assets/protection-planner-hero.png';

const PROTECTION_CATEGORY_NAME = 'Protection Policy';
const FINANCIAL_CALENDAR_EVENTS_KEY = 'shilingi_financial_calendar_events';
const PROTECTION_ANSWERS_SAVED_MESSAGE = 'Your answers are confidential and have been saved. The recommended cover is great, however you can compare cover before you choose.';

const POLICY_LIBRARY = {
    'Life Insurance': { icon: Heart, color: '#ef4444', label: 'Life Insurance', subtitle: 'Whole life policy', matrixTitle: 'Death / Life', recommendedMultiplier: 4.2, urgency: 'healthy' },
    'Medical Cover': { icon: Stethoscope, color: '#3b82f6', label: 'Medical Cover', subtitle: 'Inpatient + outpatient', matrixTitle: 'Hospitalisation', recommendedMultiplier: 0.45, urgency: 'healthy' },
    'Car Insurance': { icon: Car, color: '#f59e0b', label: 'Car Insurance', subtitle: 'Comprehensive motor cover', matrixTitle: 'Motor Vehicle', recommendedMultiplier: 0.18, urgency: 'watch' },
    'Disability Cover': { icon: ShieldAlert, color: '#ef4444', label: 'Disability Cover', subtitle: 'Income protection', matrixTitle: 'Disability', recommendedMultiplier: 1.4, urgency: 'gap' },
    'Critical Illness Cover': { icon: Activity, color: '#ef4444', label: 'Critical Illness', subtitle: 'Lump-sum illness cover', matrixTitle: 'Critical Illness', recommendedMultiplier: 1.2, urgency: 'gap' },
    'Income Protection': { icon: WalletCards, color: '#f59e0b', label: 'Income Protection', subtitle: 'Salary replacement', matrixTitle: 'Income Protection', recommendedMultiplier: 0.9, urgency: 'watch' },
    'Home Insurance': { icon: ShieldPlus, color: '#f59e0b', label: 'Home Insurance', subtitle: 'Property protection', matrixTitle: 'Property / Home', recommendedMultiplier: 0.35, urgency: 'optional' },
    'Travel Insurance': { icon: Sparkles, color: '#2563eb', label: 'Travel Insurance', subtitle: 'Trip-based cover', matrixTitle: 'Travel Insurance', recommendedMultiplier: 0.12, urgency: 'optional' },
};

const POLICY_OPTIONS = Object.keys(POLICY_LIBRARY);
const defaultPolicyForm = { policyType: 'Life Insurance', provider: '', coverageAmount: '', monthlyPremium: '', status: 'ACTIVE', notes: '' };
const defaultCalculator = { annualIncome: '1140000', dependents: '2', yearsToCover: '10', outstandingDebts: '0' };
const PROTECTION_ONBOARDING_KEY = 'shilingi_protection_onboarding_seen_v1';
const defaultCompareRates = [
    { provider: 'Jubilee Protection', premium: 3200, cover: 5000000, fit: 'Strong fit', delta: '-KES 250/mo' },
    { provider: 'Britam Family Cover', premium: 3600, cover: 6000000, fit: 'Balanced', delta: '+KES 150/mo' },
    { provider: 'APA Shield Plus', premium: 4100, cover: 5500000, fit: 'Highest cover', delta: '+KES 650/mo' },
];
const compareInsuranceCategories = {
    medical: {
        label: 'Medical',
        helper: 'Hospital, outpatient, waiting periods, and claim speed.',
        plans: [
            { provider: 'Afya Premier', premium: 1950, cover: 850000, fit: 'Best fit', delta: '-KES 300/mo', waitingPeriod: '30 days', claimTurnaround: '3 - 5 days', renewal: 'Portable', subtitle: 'Inpatient + outpatient' },
            { provider: 'Jubilee Health', premium: 2450, cover: 1200000, fit: 'Higher cover', delta: '+KES 200/mo', waitingPeriod: '45 days', claimTurnaround: '5 - 7 days', renewal: 'Portable', subtitle: 'Family medical cover' },
            { provider: 'AAR Essential', premium: 1750, cover: 650000, fit: 'Lower premium', delta: '-KES 500/mo', waitingPeriod: '60 days', claimTurnaround: '7 days', renewal: 'Limited', subtitle: 'Core inpatient cover' },
        ],
    },
    life: {
        label: 'Life',
        helper: 'Income replacement, beneficiary support, exclusions, and long-term value.',
        plans: [
            { provider: 'Britam Family Life', premium: 2500, cover: 5000000, fit: 'Best fit', delta: '-KES 150/mo', waitingPeriod: 'Immediate', claimTurnaround: '7 - 10 days', renewal: 'Guaranteed', subtitle: 'Term life cover' },
            { provider: 'ICEA Lion Life', premium: 3200, cover: 7500000, fit: 'Highest cover', delta: '+KES 550/mo', waitingPeriod: 'Immediate', claimTurnaround: '10 days', renewal: 'Guaranteed', subtitle: 'Family protection' },
            { provider: 'Madison Life Plan', premium: 2100, cover: 4000000, fit: 'Affordable', delta: '-KES 550/mo', waitingPeriod: '14 days', claimTurnaround: '10 - 14 days', renewal: 'Annual review', subtitle: 'Starter life cover' },
        ],
    },
    disability: {
        label: 'Disability',
        helper: 'Income continuity if illness or injury affects your ability to work.',
        plans: [
            { provider: 'APA Income Shield', premium: 3000, cover: 3000000, fit: 'Best fit', delta: '-KES 250/mo', waitingPeriod: '60 days', claimTurnaround: '10 days', renewal: 'Portable', subtitle: 'Income protection' },
            { provider: 'Old Mutual Protect', premium: 3600, cover: 4200000, fit: 'Higher payout', delta: '+KES 350/mo', waitingPeriod: '45 days', claimTurnaround: '7 - 10 days', renewal: 'Guaranteed', subtitle: 'Disability income' },
            { provider: 'Sanlam Disability', premium: 2850, cover: 2600000, fit: 'Balanced', delta: '-KES 400/mo', waitingPeriod: '90 days', claimTurnaround: '14 days', renewal: 'Annual review', subtitle: 'Core disability cover' },
        ],
    },
    car: {
        label: 'Car',
        helper: 'Comprehensive value, excess terms, claim handling, and roadside support.',
        plans: [
            { provider: 'APA Motor Plus', premium: 4500, cover: 1800000, fit: 'Best fit', delta: '-KES 300/mo', waitingPeriod: 'Immediate', claimTurnaround: '3 - 5 days', renewal: 'Annual', subtitle: 'Comprehensive motor' },
            { provider: 'Jubilee Auto', premium: 5200, cover: 2200000, fit: 'Higher vehicle value', delta: '+KES 400/mo', waitingPeriod: 'Immediate', claimTurnaround: '5 days', renewal: 'Annual', subtitle: 'Comprehensive + extras' },
            { provider: 'CIC Motor Secure', premium: 3900, cover: 1500000, fit: 'Lower premium', delta: '-KES 900/mo', waitingPeriod: 'Immediate', claimTurnaround: '7 days', renewal: 'Annual', subtitle: 'Core motor cover' },
        ],
    },
};
const compareCategoryForPolicyType = (policyType = '') => {
    if (policyType === 'Life Insurance') return 'life';
    if (policyType === 'Car Insurance') return 'car';
    if (policyType === 'Disability Cover' || policyType === 'Income Protection' || policyType === 'Critical Illness Cover') return 'disability';
    return 'medical';
};

const protectionQuestions = [
    {
        id: 'dependents',
        question: 'How many people depend on your income?',
        helper: 'Count dependants who rely on your income, emergency support, and day-to-day care.',
        options: [
            { label: '0', value: '0', patch: { dependents: '0' } },
            { label: '1', value: '1', patch: { dependents: '1' } },
            { label: '2', value: '2', patch: { dependents: '2' } },
            { label: '3', value: '3', patch: { dependents: '3' } },
            { label: '4+', value: '4', patch: { dependents: '4' } },
        ],
        compact: true,
    },
    {
        id: 'income',
        question: 'What is your take-home monthly income?',
        helper: 'We use this to estimate the income your household would need protected.',
        options: [
            { label: 'Under KES 50,000', value: 'under-50', patch: { annualIncome: '480000' } },
            { label: 'KES 50,000 - KES 100,000', value: '50-100', patch: { annualIncome: '900000' } },
            { label: 'KES 100,000 - KES 250,000', value: '100-250', patch: { annualIncome: '1140000' } },
            { label: 'Over KES 250,000', value: 'over-250', patch: { annualIncome: '3600000' } },
        ],
    },
    {
        id: 'debt',
        question: 'Total outstanding debt - loans, mortgage, etc.?',
        helper: 'Debt cover keeps repayments from becoming a family burden.',
        options: [
            { label: 'Under KES 500,000', value: 'under-500', patch: { outstandingDebts: '250000' } },
            { label: 'KES 500,000 - KES 2,000,000', value: '500-2000', patch: { outstandingDebts: '1000000' } },
            { label: 'Over KES 2,000,000', value: 'over-2000', patch: { outstandingDebts: '2500000' } },
            { label: 'None', value: 'none', patch: { outstandingDebts: '0' } },
        ],
    },
    {
        id: 'lifeStage',
        question: 'Which best describes your life stage?',
        helper: 'Your life stage helps rank medical, life, and disability cover.',
        options: [
            { label: 'Single, no dependants', value: 'single' },
            { label: 'Married, no children', value: 'married' },
            { label: 'Young family with children', value: 'young-family' },
            { label: 'Established family', value: 'established-family' },
            { label: 'Approaching retirement', value: 'retirement' },
        ],
    },
    {
        id: 'priority',
        question: 'What matters most to protect first?',
        helper: 'Your priority helps shape the first cover recommendation before comparing providers.',
        options: [
            { label: 'My health & medical bills', value: 'medical' },
            { label: "My family's future", value: 'family' },
            { label: 'My income', value: 'income' },
            { label: 'My assets (home, car)', value: 'assets' },
        ],
    },
];

const normalize = (value) => String(value || '').trim().toLowerCase();
const asNumber = (value) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
const formatKES = (value) => `KES ${Math.round(asNumber(value)).toLocaleString('en-KE')}`;
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); };
const displayValue = (value) => {
    const text = String(value ?? '').trim();
    return text ? text : 'None';
};
const readAssetDetail = (asset, keys = []) => {
    for (const key of keys) {
        const value = asset?.[key];
        if (value !== undefined && value !== null && String(value).trim()) {
            return String(value).trim();
        }
    }
    return '';
};

const readProfileWorkspace = () => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}');
    } catch {
        return {};
    }
};

const getPlannerDisplayName = (user) => {
    const displayName = getDashboardDisplayName(user || getStoredUserProfile() || {}).trim();
    return displayName && displayName !== 'My Profile' ? displayName : '';
};

const buildPremiumCalendarDate = (index = 0) => {
    const date = new Date();
    date.setDate(Math.min(28, 5 + index * 5));
    if (date < new Date()) date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
};

const parsePolicyType = (asset) => {
    const source = `${asset.name} ${asset.categoryName} ${asset.notes}`;
    return POLICY_OPTIONS.find((option) => normalize(source).includes(normalize(option.replace(' Cover', '')))) || 'Life Insurance';
};

const parseProtectionMeta = (asset) => {
    const status = normalize(asset.notes).includes('status:inactive') ? 'INACTIVE' : 'ACTIVE';
    const policyType = parsePolicyType(asset);
    return { status, policyType, policyMeta: POLICY_LIBRARY[policyType] || POLICY_LIBRARY['Life Insurance'] };
};

const getCategoryIdentifier = (category) => {
    if (!category) return null;
    const candidates = [category.categoryId, category.id, category.uuid, category.raw?.id, category.raw?.pk, category.raw?.category_id, category.raw?.uuid];
    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
        if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
    return null;
};

const findCategoryId = (categories) => {
    const matched = categories.find((item) => normalize(item.name).includes('protection') || normalize(item.name).includes('insurance'));
    return matched ? getCategoryIdentifier(matched) : null;
};

const ProtectionPlanner = ({ onSelectSection, user }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [deletingPolicyId, setDeletingPolicyId] = useState('');
    const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [managePolicyForm, setManagePolicyForm] = useState({ provider: '', coverageAmount: '', monthlyPremium: '', status: 'ACTIVE', notes: '' });
    const [claimForm, setClaimForm] = useState({ claimType: 'Medical claim', incidentDate: '', amount: '', notes: '' });
    const [compareCategory, setCompareCategory] = useState('medical');
    const [calculator, setCalculator] = useState(defaultCalculator);
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [savedPlan, setSavedPlan] = useState(null);
    const [totalDebt, setTotalDebt] = useState(0);
    const [activeTab, setActiveTab] = useState('dependents');
    const [profileWorkspace, setProfileWorkspace] = useState(() => readProfileWorkspace());
    const [showProtectionOnboarding, setShowProtectionOnboarding] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.localStorage.getItem(PROTECTION_ONBOARDING_KEY) !== 'true';
    });
    const [protectionStep, setProtectionStep] = useState(0);
    const [protectionAnswers, setProtectionAnswers] = useState({});
    const [mobileProtectionView, setMobileProtectionView] = useState('overview');
    const [protectionFlowComplete, setProtectionFlowComplete] = useState(() => {
        const workspace = readProfileWorkspace();
        return Boolean(workspace.protectionProfileCompletedAt);
    });
    const plannerContext = usePlannerFinancialContext();
    const displayName = useMemo(() => getPlannerDisplayName(user), [user]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [assetRows, categoryRows, debts, backendPlan] = await Promise.all([
                getAssets(),
                getAssetCategories(),
                getDebts().catch(() => []),
                getLatestPlan('protection'),
            ]);
            setAssets(assetRows);
            setCategories(categoryRows);
            setSavedPlan(backendPlan);
            const debtTotal = Array.isArray(debts) ? debts.reduce((sum, item) => sum + asNumber(item.balance), 0) : 0;
            setTotalDebt(debtTotal);
            setCalculator((current) => ({ ...current, outstandingDebts: String(Math.round(debtTotal)) }));
            if (backendPlan) {
                setCalculator((current) => ({
                    ...current,
                    annualIncome: backendPlan.annual_income || current.annualIncome,
                    dependents: String(backendPlan.dependants ?? current.dependents),
                    yearsToCover: backendPlan.income_replacement_years || current.yearsToCover,
                    outstandingDebts: backendPlan.outstanding_debts || String(Math.round(debtTotal)),
                }));
            }
        } catch (err) {
            setError(err.message || 'Unable to load protection planner data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        const syncProfile = () => setProfileWorkspace(readProfileWorkspace());
        window.addEventListener('storage', syncProfile);
        window.addEventListener('focus', syncProfile);
        return () => {
            window.removeEventListener('storage', syncProfile);
            window.removeEventListener('focus', syncProfile);
        };
    }, []);

    const protectionAssets = useMemo(() => assets.filter((item) => {
        const categoryName = normalize(item.categoryName);
        return categoryName.includes('protection') || categoryName.includes('insurance') || categoryName.includes('policy');
    }).map((asset) => ({ ...asset, protectionMeta: parseProtectionMeta(asset) })), [assets]);

    const recommendedCover = useMemo(() => {
        const income = asNumber(calculator.annualIncome);
        const dependents = asNumber(calculator.dependents);
        const years = asNumber(calculator.yearsToCover);
        const debts = asNumber(calculator.outstandingDebts);
        return income * Math.max(years, 1) + debts + dependents * 600000;
    }, [calculator]);

    const coverageTotal = useMemo(() => protectionAssets.reduce((sum, item) => sum + asNumber(item.currentValue), 0), [protectionAssets]);
    const monthlyPremiums = useMemo(() => protectionAssets.reduce((sum, item) => sum + asNumber(item.purchaseValue), 0), [protectionAssets]);
    const coverageGap = Math.max(recommendedCover - coverageTotal, 0);
    const scoredCoverage = useMemo(() => {
        const ratio = recommendedCover > 0 ? Math.min((coverageTotal / recommendedCover) * 100, 100) : 0;
        const breadthScore = Math.min((protectionAssets.length / 5) * 30, 30);
        return Math.min(Math.round(ratio * 0.7 + breadthScore), 100);
    }, [coverageTotal, recommendedCover, protectionAssets.length]);

    const activePolicies = useMemo(() => protectionAssets.filter((item) => item.protectionMeta.status === 'ACTIVE'), [protectionAssets]);
    const carPolicies = useMemo(() => protectionAssets.filter((item) => item.protectionMeta.policyType === 'Car Insurance'), [protectionAssets]);
    const dependantCount = Math.max(asNumber(profileWorkspace.dependentsCount), asNumber(calculator.dependents));

    const recommendedByType = useMemo(() => {
        const income = asNumber(calculator.annualIncome);
        return POLICY_OPTIONS.reduce((acc, type) => {
            acc[type] = Math.round(income * (POLICY_LIBRARY[type]?.recommendedMultiplier || 0.3));
            return acc;
        }, {});
    }, [calculator.annualIncome]);

    const missingPolicies = POLICY_OPTIONS.filter((type) => !protectionAssets.some((asset) => asset.protectionMeta.policyType === type));
    const coreCoverage = ['Life Insurance', 'Medical Cover', 'Car Insurance', 'Disability Cover', 'Critical Illness Cover'];
    const coverageAdequacy = Math.min(Math.round((activePolicies.length / coreCoverage.length) * 100), 100);

    const protectionSnapshot = useMemo(() => buildFinancialSnapshot({
        profile: profileWorkspace,
        live: {
            income: profileWorkspace.monthly_income || profileWorkspace.monthlyIncome || profileWorkspace.netMonthlyIncome || profileWorkspace.income || asNumber(calculator.annualIncome) / 12,
            raw: {
                budgets: plannerContext.budgets,
                expenses: plannerContext.expenses,
                goals: plannerContext.goals,
                debts: plannerContext.debts,
                investments: assets,
            },
        },
    }), [assets, calculator.annualIncome, plannerContext.budgets, plannerContext.debts, plannerContext.expenses, plannerContext.goals, profileWorkspace]);

    const insightCards = useMemo(() => buildProtectionInsights(protectionSnapshot, {
        missingPolicies,
        coverageTotal,
        recommendedCover,
        dependantCount,
        totalDebt,
        hasCarPolicy: carPolicies.length > 0,
    }), [carPolicies.length, coverageTotal, dependantCount, missingPolicies, protectionSnapshot, recommendedCover, totalDebt]);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const premiumEvents = activePolicies.map((policy, index) => ({
            id: `premium-${policy.uuid || policy.name}-${index}`,
            name: `${policy.protectionMeta.policyType} premium - ${policy.institution || 'Provider'}`,
            date: buildPremiumCalendarDate(index),
            type: 'protection',
        }));
        try {
            const existing = JSON.parse(window.localStorage.getItem(FINANCIAL_CALENDAR_EVENTS_KEY) || '[]');
            const withoutOldPremiums = Array.isArray(existing)
                ? existing.filter((event) => !String(event.id || '').startsWith('premium-'))
                : [];
            window.localStorage.setItem(FINANCIAL_CALENDAR_EVENTS_KEY, JSON.stringify([...withoutOldPremiums, ...premiumEvents]));
            window.dispatchEvent(new Event('shilingi:calendar-events-updated'));
        } catch (err) {
            console.warn('Could not sync protection premiums to dashboard calendar:', err);
        }
    }, [activePolicies]);

    const documents = useMemo(() => protectionAssets.slice(0, 6).map((policy, index) => ({
        id: policy.uuid || `${policy.name}-${index}`,
        policy: displayValue(policy.protectionMeta.policyType),
        insurer: displayValue(readAssetDetail(policy, ['institution', 'provider', 'insurer'])),
        number: displayValue(readAssetDetail(policy, ['accountNumber', 'account_number', 'policyNumber', 'policy_number'])),
        startDate: policy.purchaseDate ? formatDate(policy.purchaseDate) : 'None',
        renewal: policy.lastValuedDate ? formatDate(policy.lastValuedDate) : 'None',
        status: policy.protectionMeta.status === 'ACTIVE' ? 'Active' : 'Inactive',
        contact: displayValue(readAssetDetail(policy, ['contact', 'contactPhone', 'contact_phone', 'phone', 'phoneNumber', 'phone_number'])),
    })), [protectionAssets]);
    const ecosystemLinks = [
        { title: 'My Profile', subtitle: 'Dependants shape your cover needs', action: 'View ->', icon: User, onClick: () => onSelectSection?.('profile') },
        { title: 'Net Worth Tracker', subtitle: 'Policies count as protection assets', action: 'View ->', icon: PiggyBank, onClick: () => onSelectSection?.('networth') },
        { title: 'Compare Hub', subtitle: 'Find better insurance rates', action: 'Compare ->', icon: Sparkles, onClick: () => onSelectSection?.('comparehub') },
        { title: 'Retirement Planner', subtitle: 'Life cover funds retirement gap', action: 'Plan ->', icon: WalletCards, onClick: () => onSelectSection?.('retirement') },
        { title: 'Market Watch', subtitle: 'Track changes affecting cover costs', action: 'Open ->', icon: ShieldPlus, onClick: () => onSelectSection?.('marketwatch') },
    ];

    const handleCalcChange = (key, value) => setCalculator((current) => ({ ...current, [key]: value }));
    const handleFormChange = (key, value) => setPolicyForm((current) => ({ ...current, [key]: value }));
    const handleManageFormChange = (key, value) => setManagePolicyForm((current) => ({ ...current, [key]: value }));
    const handleClaimFormChange = (key, value) => setClaimForm((current) => ({ ...current, [key]: value }));
    const openPolicyManagement = (policy) => {
        setSelectedPolicy(policy);
        setManagePolicyForm({
            provider: policy.institution || '',
            coverageAmount: String(policy.currentValue || ''),
            monthlyPremium: String(policy.purchaseValue || ''),
            status: policy.protectionMeta?.status || 'ACTIVE',
            notes: policy.notes || '',
        });
        setMobileProtectionView('manage-policy');
    };
    const openPolicyClaim = (policy) => {
        setSelectedPolicy(policy);
        setClaimForm({ claimType: policy.protectionMeta?.policyType === 'Car Insurance' ? 'Motor claim' : 'Medical claim', incidentDate: new Date().toISOString().split('T')[0], amount: '', notes: '' });
        setMobileProtectionView('file-claim');
    };
    const openPolicyCompare = (policy) => {
        setCompareCategory(compareCategoryForPolicyType(policy.protectionMeta?.policyType));
        setMobileProtectionView('compare');
    };
    const buildPolicyUpdatePayload = (policy, form, notesOverride) => ({
        name: `${policy.protectionMeta?.policyType || parsePolicyType(policy)} - ${form.provider || 'Provider'}`,
        current_value: String(asNumber(form.coverageAmount)),
        purchase_value: String(asNumber(form.monthlyPremium)),
        currency: policy.currency || 'KES',
        purchase_date: policy.purchaseDate || new Date().toISOString().split('T')[0],
        last_valued_date: policy.lastValuedDate || new Date().toISOString().split('T')[0],
        institution: form.provider || '',
        notes: notesOverride ?? `status:${normalize(form.status) || 'active'}${form.notes ? ` | ${form.notes}` : ''}`,
        is_liquid: false,
        include_in_net_worth: false,
        ...(policy.category ? { category: policy.category } : {}),
    });
    const hasCompletedProtectionProfile = Boolean(profileWorkspace.protectionProfileCompletedAt);
    const startProtectionFlow = () => {
        setShowProtectionOnboarding(false);
        setProtectionFlowComplete(false);
        setSuccess('');
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(PROTECTION_ONBOARDING_KEY, 'true');
        }
    };
    const exitProtectionJourney = () => {
        setShowProtectionOnboarding(false);
        if (hasCompletedProtectionProfile) {
            setProtectionFlowComplete(true);
            setMobileProtectionView('overview');
            return;
        }
        setProtectionStep(0);
    };
    const updateProtectionAnswer = (question, option) => {
        setSuccess('');
        setProtectionAnswers((current) => ({ ...current, [question.id]: option.value }));
        if (option.patch) {
            setCalculator((current) => ({ ...current, ...option.patch }));
        }
    };
    const resetProtectionFlow = () => {
        const nextWorkspace = { ...profileWorkspace };
        delete nextWorkspace.protectionIncomeBand;
        delete nextWorkspace.protectionDebtBand;
        delete nextWorkspace.protectionLifeStage;
        delete nextWorkspace.protectionPriority;
        delete nextWorkspace.protectionProfileCompletedAt;
        setProfileWorkspace(nextWorkspace);
        setProtectionAnswers({});
        setCalculator(defaultCalculator);
        setProtectionStep(0);
        setProtectionFlowComplete(false);
        setMobileProtectionView('overview');
        setShowProtectionOnboarding(false);
        setSuccess('');
        setError('');
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(nextWorkspace));
            window.localStorage.setItem(PROTECTION_ONBOARDING_KEY, 'true');
        }
        if (savedPlan?.uuid) {
            deletePlan('protection', savedPlan.uuid)
                .then(() => setSavedPlan(null))
                .catch((err) => setError(err.message || 'The saved protection plan could not be deleted.'));
        }
    };
    const completeProtectionFlow = async (nextView = 'overview') => {
        const nextWorkspace = {
            ...profileWorkspace,
            dependentsCount: protectionAnswers.dependents ?? calculator.dependents,
            protectionIncomeBand: protectionAnswers.income || '',
            protectionDebtBand: protectionAnswers.debt || '',
            protectionLifeStage: protectionAnswers.lifeStage || '',
            protectionPriority: protectionAnswers.priority || '',
            protectionProfileCompletedAt: new Date().toISOString(),
        };
        setProfileWorkspace(nextWorkspace);
        setProtectionFlowComplete(true);
        setMobileProtectionView(nextView);
        setShowProtectionOnboarding(false);
        setActiveTab('dependents');
        setSuccess(nextView === 'compare' ? PROTECTION_ANSWERS_SAVED_MESSAGE : '');
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(nextWorkspace));
            window.localStorage.setItem(PROTECTION_ONBOARDING_KEY, 'true');
        }
        try {
            const persistedPlan = await savePlan('protection', {
                name: 'Household protection plan',
                dependants: Math.max(asNumber(calculator.dependents), 0),
                annual_income: String(Math.max(asNumber(calculator.annualIncome), 0)),
                income_replacement_years: String(Math.max(asNumber(calculator.yearsToCover), 1)),
                outstanding_debts: String(Math.max(asNumber(calculator.outstandingDebts), 0)),
                existing_life_cover: String(Math.max(coverageTotal, 0)),
            }, savedPlan);
            setSavedPlan(persistedPlan);
        } catch (err) {
            setError(err.message || 'Your answers were kept, but the protection plan could not be saved.');
        }
    };
    const clearProtectionNotice = () => setSuccess('');
    const goToNextProtectionStep = () => {
        const question = protectionQuestions[protectionStep];
        if (!question || !protectionAnswers[question.id]) return;
        if (protectionStep >= protectionQuestions.length - 1) {
            setProtectionStep(protectionQuestions.length);
            setSuccess(PROTECTION_ANSWERS_SAVED_MESSAGE);
            return;
        }
        setProtectionStep((current) => Math.min(current + 1, protectionQuestions.length - 1));
    };
    const goToPreviousProtectionStep = () => {
        if (protectionStep > 0) {
            setProtectionStep((current) => Math.max(current - 1, 0));
            return;
        }
        exitProtectionJourney();
    };

    const ensureCategory = async () => {
        let resolvedCategories = categories;
        let categoryId = findCategoryId(resolvedCategories);
        if (categoryId) return categoryId;
        try {
            await createAssetCategory({ name: PROTECTION_CATEGORY_NAME, color: '#0e7490', is_liquid: false });
        } catch (err) {
            const message = String(err?.message || '').toLowerCase();
            const isDuplicate = message.includes('unique constraint') || message.includes('already exists') || message.includes('duplicate');
            if (!isDuplicate) throw err;
        }
        resolvedCategories = await getAssetCategories();
        setCategories(resolvedCategories);
        categoryId = findCategoryId(resolvedCategories);
        if (!categoryId) throw new Error('Could not resolve protection category id.');
        return categoryId;
    };

    const addPolicy = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const categoryId = await ensureCategory();
            await createAsset({
                name: `${policyForm.policyType} - ${policyForm.provider || 'Provider'}`,
                category: categoryId,
                current_value: String(asNumber(policyForm.coverageAmount)),
                purchase_value: String(asNumber(policyForm.monthlyPremium)),
                currency: 'KES',
                purchase_date: new Date().toISOString().split('T')[0],
                interest_rate: null,
                institution: policyForm.provider || '',
                account_number: '',
                is_liquid: false,
                include_in_net_worth: false,
                last_valued_date: new Date().toISOString().split('T')[0],
                notes: `status:${policyForm.status.toLowerCase()}${policyForm.notes ? ` | ${policyForm.notes}` : ''}`,
            });
            setShowAddModal(false);
            setMobileProtectionView('policies');
            setPolicyForm(defaultPolicyForm);
            markDashboardDataExists();
            setSuccess('Protection policy added.');
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to add protection policy.');
        } finally {
            setSaving(false);
        }
    };

    const updatePolicyDetails = async (event) => {
        event.preventDefault();
        if (!selectedPolicy?.uuid) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateAsset(selectedPolicy.uuid, buildPolicyUpdatePayload(selectedPolicy, managePolicyForm));
            setSelectedPolicy(null);
            setMobileProtectionView('overview');
            markDashboardDataExists();
            setSuccess('Policy details updated.');
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to update protection policy.');
        } finally {
            setSaving(false);
        }
    };

    const submitPolicyClaim = async (event) => {
        event.preventDefault();
        if (!selectedPolicy?.uuid) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const baseNotes = selectedPolicy.notes || `status:${normalize(selectedPolicy.protectionMeta?.status) || 'active'}`;
            const claimNote = `claim:${claimForm.claimType} | date:${claimForm.incidentDate} | amount:${asNumber(claimForm.amount)}${claimForm.notes ? ` | ${claimForm.notes}` : ''}`;
            await updateAsset(selectedPolicy.uuid, buildPolicyUpdatePayload(selectedPolicy, {
                provider: selectedPolicy.institution || '',
                coverageAmount: String(selectedPolicy.currentValue || ''),
                monthlyPremium: String(selectedPolicy.purchaseValue || ''),
                status: selectedPolicy.protectionMeta?.status || 'ACTIVE',
                notes: selectedPolicy.notes || '',
            }, `${baseNotes} | ${claimNote}`));
            setSelectedPolicy(null);
            setMobileProtectionView('overview');
            markDashboardDataExists();
            setSuccess('Claim details saved.');
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to save claim details.');
        } finally {
            setSaving(false);
        }
    };

    const removePolicy = async (asset) => {
        if (!asset?.uuid) return;
        const confirmed = window.confirm(`Delete policy "${asset.name}"?`);
        if (!confirmed) return;
        try {
            setDeletingPolicyId(asset.uuid);
            setError('');
            setSuccess('');
            await deleteAsset(asset.uuid);
            await loadData();
            setSuccess('Policy deleted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to delete protection policy.');
        } finally {
            setDeletingPolicyId('');
        }
    };

    return (
        <div className="space-y-4">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">{success}</div>}
            <PlannerSyncStatus plan={savedPlan} />

            <MobileProtectionFlow
                answers={protectionAnswers}
                activePolicies={activePolicies}
                calculator={calculator}
                complete={protectionFlowComplete}
                compareRows={defaultCompareRates}
                compareCategory={compareCategory}
                coverageAdequacy={coverageAdequacy}
                coverageGap={coverageGap}
                coverageTotal={coverageTotal}
                currentStep={protectionStep}
                displayName={displayName}
                insightCards={insightCards}
                missingPolicies={missingPolicies}
                monthlyPremiums={monthlyPremiums}
                onAnswer={updateProtectionAnswer}
                onBack={goToPreviousProtectionStep}
                onCalcChange={handleCalcChange}
                onComplete={completeProtectionFlow}
                onCompareOptions={() => completeProtectionFlow('compare')}
                onCompare={() => setMobileProtectionView('compare')}
                onFormChange={handleFormChange}
                onClaimChange={handleClaimFormChange}
                onClaimSubmit={submitPolicyClaim}
                onNext={goToNextProtectionStep}
                onPlanChoose={clearProtectionNotice}
                onPolicySubmit={addPolicy}
                onManagePolicy={openPolicyManagement}
                onManagePolicyChange={handleManageFormChange}
                onManagePolicySubmit={updatePolicyDetails}
                onPolicyClaim={openPolicyClaim}
                onPolicyCompare={openPolicyCompare}
                onPolicyDelete={removePolicy}
                onRestart={resetProtectionFlow}
                onSetMobileView={setMobileProtectionView}
                onStart={startProtectionFlow}
                policies={protectionAssets}
                policyForm={policyForm}
                claimForm={claimForm}
                managePolicyForm={managePolicyForm}
                recommendedByType={recommendedByType}
                recommendedCover={recommendedCover}
                saving={saving}
                showOnboarding={showProtectionOnboarding}
                view={mobileProtectionView}
            />

            <section className="hidden overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-4 py-4 text-white shadow-sm sm:px-5 md:block">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-3 dashboard-display-title text-[1.38rem] font-extrabold leading-none sm:text-[1.55rem]"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#b91c1c]"><ShieldCheck size={16} /></span>Protection Planner</p>
                        <p className="mt-2 max-w-[31rem] text-[0.85rem] leading-5 text-white/80 sm:text-[0.9rem]">Protect your income, health, family and legacy with the right cover, tailored to your life stage.</p>
                    </div>
                        <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 lg:justify-end">
                            <button type="button" onClick={() => setShowCompareModal(true)} className="inline-flex h-9 min-w-[154px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-3.5 text-[12px] font-semibold text-white backdrop-blur-sm"><Sparkles size={13} />Compare Insurance</button>
                            <button type="button" onClick={() => setShowAddModal(true)} className="inline-flex h-9 min-w-[118px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-3.5 text-[12px] font-semibold text-primary-700">Add Policy</button>
                        </div>
                </div>
            </section>

            <section className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="My Active Policies" value={String(activePolicies.length)} helper={activePolicies.map((item) => item.protectionMeta.label).slice(0, 2).join(' + ') || 'No active cover'} valueClass="text-[#175f54]" />
                <MetricCard title="Total Monthly Premiums" value={formatKES(monthlyPremiums)} helper={`${calculator.annualIncome ? ((monthlyPremiums * 12 / Math.max(asNumber(calculator.annualIncome), 1)) * 100).toFixed(1) : '0.0'}% of yearly income`} valueClass="text-[#c37a00]" />
                <MetricCard title="Total Cover Value" value={formatKES(coverageTotal)} helper={activePolicies.map((item) => item.protectionMeta.label).slice(0, 3).join(' + ') || 'No active policies'} valueClass="text-[#175f54]" />
                <MetricCard title="Recommended Value" value={formatKES(recommendedCover)} helper={coverageGap > 0 ? `${formatKES(coverageGap)} gap` : 'Cover target met'} valueClass="text-[#2167d8]" cardTone="bg-[linear-gradient(180deg,_#fffef7_0%,_#fff5df_100%)]" />
            </section>

            <section className="hidden rounded-[1.1rem] border border-emerald-100 bg-white p-1 shadow-sm md:block"><div className="flex flex-wrap gap-2"><TabButton active={activeTab === 'dependents'} onClick={() => setActiveTab('dependents')}>My Protection Objectives</TabButton><TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')}>My Active Policies</TabButton><TabButton active={activeTab === 'solutions'} onClick={() => setActiveTab('solutions')}>Explore Protection Solutions</TabButton><TabButton active={activeTab === 'calculators'} onClick={() => setActiveTab('calculators')}>Protection Calculators</TabButton></div></section>

            {activeTab === 'portfolio' && (
                <div className="hidden space-y-4 md:block">
                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between"><PanelHeading icon={FileText} title="My Active Policies" noMargin /><button type="button" onClick={() => setShowAddModal(true)} className="text-sm font-semibold text-[#175f54]">+ Add Policy</button></div>
                            {loading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading protection policies...</div> : protectionAssets.length === 0 ? <EmptyState text="No protection policies yet. Add your first policy to start tracking coverage." /> : <div className="space-y-4">{protectionAssets.map((asset) => <PolicyCard key={asset.uuid} asset={asset} deleting={deletingPolicyId === asset.uuid} recommended={recommendedByType[asset.protectionMeta.policyType]} onDelete={() => removePolicy(asset)} onCompare={() => setShowCompareModal(true)} />)}</div>}
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Sparkles} title="Shilingi Buddy Protection Insights" /><div className="mt-4 space-y-3">{insightCards.map((item) => <InsightCard key={item.title} title={item.title} text={item.text} tone={item.tone} />)}</div></article>
                        </div>
                    </section>

                    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={ShieldPlus} title="Coverage Matrix - What You're Protected Against" /><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{['Life Insurance', 'Medical Cover', 'Car Insurance', 'Disability Cover', 'Critical Illness Cover', 'Income Protection', 'Home Insurance', 'Travel Insurance'].map((type) => <CoverageMatrixCard key={type} type={type} covered={activePolicies.some((item) => item.protectionMeta.policyType === type)} amount={recommendedByType[type]} />)}</div></section>

                    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between"><PanelHeading icon={FileText} title="Policy Documents & Contacts" noMargin /></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-emerald-100 text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]"><th className="py-3 pr-4 font-semibold">Policy</th><th className="py-3 pr-4 font-semibold">Insurer</th><th className="py-3 pr-4 font-semibold">Policy No.</th><th className="py-3 pr-4 font-semibold">Start Date</th><th className="py-3 pr-4 font-semibold">Renewal Date</th><th className="py-3 pr-4 font-semibold">Status</th><th className="py-3 font-semibold">Contact</th></tr></thead><tbody>{documents.length > 0 ? documents.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-b-0"><td className="py-3 pr-4 font-medium text-slate-900">{item.policy}</td><td className="py-3 pr-4 text-slate-700">{item.insurer}</td><td className="py-3 pr-4 text-slate-700">{item.number}</td><td className="py-3 pr-4 text-slate-500">{item.startDate}</td><td className="py-3 pr-4 text-slate-500">{item.renewal}</td><td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-[#eef8f3] text-[#175f54]'}`}>{item.status}</span></td><td className="py-3 text-slate-700">{item.contact}</td></tr>) : <tr className="border-b border-slate-100 last:border-b-0"><td className="py-3 pr-4 font-medium text-slate-500">None</td><td className="py-3 pr-4 text-slate-500">None</td><td className="py-3 pr-4 text-slate-500">None</td><td className="py-3 pr-4 text-slate-500">None</td><td className="py-3 pr-4 text-slate-500">None</td><td className="py-3 pr-4"><span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">None</span></td><td className="py-3 text-slate-500">None</td></tr>}</tbody></table></div>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={ShieldCheck} title="Analytics" />
                            <div className="mt-4 flex items-center gap-4">
                                <ScoreRing value={scoredCoverage} />
                                <div>
                                    <p className="text-[1.35rem] font-extrabold text-slate-950">{scoredCoverage >= 80 ? 'Strong' : scoredCoverage >= 55 ? 'Moderate' : 'Needs Attention'}</p>
                                    <p className="mt-1 text-sm text-slate-600">Cover adequacy is {coverageAdequacy}% across your core protection needs.</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">{coreCoverage.map((type) => {
                                const covered = activePolicies.some((item) => item.protectionMeta.policyType === type);
                                return <span key={type} className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${covered ? 'bg-[#eef8f3] text-[#175f54]' : 'bg-rose-50 text-rose-500'}`}>{covered ? 'Covered' : 'Missing'} {POLICY_LIBRARY[type]?.label || type}</span>;
                            })}</div>
                        </article>
                        {missingPolicies.length > 0 && (
                            <article className="rounded-[1.35rem] border border-[#86181d] bg-[#931b1f] px-5 py-4 text-white shadow-sm">
                                <div className="flex items-start gap-4">
                                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#facc15] text-[#6b070b]"><ShieldAlert size={22} /></span>
                                    <div>
                                        <p className="text-[1.15rem] font-bold">Coverage Gap Alert - {missingPolicies.slice(0, 2).join(' & ')} not covered</p>
                                        <p className="mt-1 text-sm text-white/85">With {dependantCount} dependants and {formatKES(totalDebt)} debt, prioritise medical, disability, and life protection before optional cover.</p>
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button type="button" onClick={() => setShowCompareModal(true)} className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#c11f24]">Get Covered</button>
                                            <button type="button" onClick={() => setActiveTab('calculators')} className="inline-flex h-10 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white">Calculate Cover</button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#0a4d37] via-[#117f5a] to-[#14986b] p-5 text-white shadow-sm">
                        <p className="text-[1.3rem] font-extrabold">Your Protection Links to the Full Ecosystem</p>
                        <p className="mt-2 text-sm text-white/80">Protection data shapes your net worth, dependants' planning, retirement cover, and Buddy AI recommendations.</p>
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

            {activeTab === 'dependents' && (
                <section className="hidden gap-4 md:grid xl:grid-cols-[0.92fr_1.08fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={User} title="My Protection Objectives" />
                        <div className="mt-4 rounded-[1rem] bg-[#eef8f3] p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#6f968a]">Dependants on profile</p>
                            <p className="mt-2 text-[2.6rem] font-extrabold leading-none text-[#175f54]">{dependantCount}</p>
                            <p className="mt-2 text-sm text-slate-600">Each dependant increases the need for income replacement, medical cover, and emergency support.</p>
                        </div>
                        <button type="button" onClick={() => onSelectSection?.('user')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-[#eef8f3] px-4 py-3 text-sm font-semibold text-[#175f54]">Update Protection Objectives<ArrowRight size={14} /></button>
                    </article>
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={ShieldAlert} title="Protection Guidance" />
                        <div className="mt-4 space-y-3">
                            <InsightCard title="Income replacement" text={`Aim for cover that can replace income for ${calculator.yearsToCover || 10} years, plus outstanding debt and education support.`} tone="border-primary-200 bg-primary-50 text-primary-700" />
                            <InsightCard title="Medical first" text="Medical cover should come before optional policies because one hospital event can disrupt every other financial goal." tone="border-[#b8d0ff] bg-[#eef4ff] text-[#1f55c7]" />
                            <InsightCard title="Beneficiaries and documents" text="Keep beneficiaries, policy numbers, and insurer contacts current so dependants can act quickly during a claim." tone="border-amber-200 bg-amber-50 text-amber-800" />
                        </div>
                    </article>
                </section>
            )}

            {activeTab === 'solutions' && (
                <section className="hidden gap-4 md:grid xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Sparkles} title="Explore Protection Solutions" />
                        <div className="mt-4 grid gap-3">
                            {(missingPolicies.length ? missingPolicies : POLICY_OPTIONS.slice(0, 3)).slice(0, 4).map((type) => {
                                const meta = POLICY_LIBRARY[type];
                                const covered = activePolicies.some((item) => item.protectionMeta.policyType === type);
                                return (
                                    <div key={`${type}-solution`} className="rounded-[1rem] border border-slate-200 bg-[#f7fbf9] p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-base font-semibold text-slate-900">{meta?.label || type}</p>
                                                <p className="mt-1 text-sm text-slate-500">{meta?.subtitle || 'Protection cover'} - Suggested cover {formatKES(recommendedByType[type])}</p>
                                            </div>
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${covered ? 'bg-[#eef8f3] text-[#175f54]' : 'bg-amber-50 text-amber-700'}`}>{covered ? 'In portfolio' : 'Coverage gap'}</span>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-700">{covered ? 'Review cover limits, renewal dates, exclusions, and whether premiums still fit the household budget.' : `With ${dependantCount} dependants and ${formatKES(totalDebt)} debt, compare this cover before adding optional protection.`}</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button type="button" onClick={() => setActiveTab('calculators')} className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">Calculate need</button>
                                            <button type="button" onClick={() => setShowCompareModal(true)} className="rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-xs font-semibold text-[#175f54]">Compare options</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={ShieldAlert} title="What to Compare" />
                        <div className="mt-4 space-y-3">
                            <ChecklistRow text="Waiting periods, exclusions, and claim approval speed" />
                            <ChecklistRow text="Cover value compared with income, dependants, and outstanding debt" />
                            <ChecklistRow text="Premium affordability without disrupting budget or savings" />
                            <ChecklistRow text="Renewal terms, lapse rules, and portability between providers" />
                            <ChecklistRow text="Beneficiary details, emergency contacts, and document readiness" />
                        </div>
                        <div className="mt-5 rounded-[1rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Prioritise medical, disability, and life protection first. Optional covers should come after the core family risks are handled.</div>
                    </article>
                </section>
            )}

            {activeTab === 'calculators' && (
                <section className="hidden gap-4 md:grid xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Calculator} title="Coverage Calculator" /><p className="mt-3 text-sm text-slate-600">Estimate how much family protection you need based on income, dependants, and outstanding obligations.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><CalcInput label="Annual income (KES)" value={calculator.annualIncome} onChange={(value) => handleCalcChange('annualIncome', value)} /><CalcInput label="Dependants" value={calculator.dependents} onChange={(value) => handleCalcChange('dependents', value)} /><CalcInput label="Outstanding debts (KES)" value={calculator.outstandingDebts} onChange={(value) => handleCalcChange('outstandingDebts', value)} /><CalcInput label="Years to cover" value={calculator.yearsToCover} onChange={(value) => handleCalcChange('yearsToCover', value)} /></div><div className="mt-5 rounded-[1rem] border border-amber-200 bg-[linear-gradient(180deg,_#fffef7_0%,_#fff4df_100%)] p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">Recommended Cover</p><p className="mt-2 text-[2.6rem] font-extrabold leading-none text-[#175f54]">{formatKES(recommendedCover)}</p><p className="mt-2 text-sm text-slate-600">Formula: annual income x years + debts + dependent support cushion.</p></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setShowCompareModal(true)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#1c6c5d] px-3.5 py-2 text-[12px] font-semibold text-white">Compare Insurance<ArrowRight size={12} /></button><button type="button" onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] border border-emerald-200 bg-[#eef8f3] px-3.5 py-2 text-[12px] font-semibold text-[#175f54]">Add Policy</button></div></article>
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={ShieldAlert} title="Coverage Guidance" /><div className="mt-4 space-y-3"><GuidanceRow label="Current cover" value={formatKES(coverageTotal)} tone="text-[#175f54]" /><GuidanceRow label="Recommended cover" value={formatKES(recommendedCover)} tone="text-[#2167d8]" /><GuidanceRow label="Coverage gap" value={coverageGap > 0 ? formatKES(coverageGap) : 'Covered'} tone={coverageGap > 0 ? 'text-rose-500' : 'text-[#175f54]'} /><GuidanceRow label="Monthly premiums" value={formatKES(monthlyPremiums)} tone="text-[#c37a00]" /></div><div className="mt-5 space-y-3">{missingPolicies.slice(0, 3).map((type) => <InsightCard key={type} title={`${POLICY_LIBRARY[type]?.label || type} gap`} text={`Recommended cover: ${formatKES(recommendedByType[type])}. Add this if you want broader family protection.`} tone="border-rose-200 bg-rose-50 text-rose-700" />)}</div></article>
                </section>
            )}
            {showAddModal && (
                <Modal title="Add Protection Policy" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={addPolicy} className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">Policy type<select value={policyForm.policyType} onChange={(event) => handleFormChange('policyType', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">{POLICY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                        <Input label="Provider" value={policyForm.provider} onChange={(value) => handleFormChange('provider', value)} placeholder="e.g. Jubilee, AAR, Britam" />
                        <div className="grid gap-3 sm:grid-cols-2"><Input label="Coverage amount (KES)" type="number" value={policyForm.coverageAmount} onChange={(value) => handleFormChange('coverageAmount', value)} /><Input label="Monthly premium (KES)" type="number" value={policyForm.monthlyPremium} onChange={(value) => handleFormChange('monthlyPremium', value)} /></div>
                        <label className="block text-sm font-medium text-slate-700">Status<select value={policyForm.status} onChange={(event) => handleFormChange('status', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
                        <label className="block text-sm font-medium text-slate-700">Notes (optional)<textarea value={policyForm.notes} onChange={(event) => handleFormChange('notes', event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>
                        <div className="flex flex-col gap-3 pt-2 sm:flex-row"><button type="submit" disabled={saving || !policyForm.coverageAmount || !policyForm.monthlyPremium} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving && <Loader2 size={15} className="animate-spin" />}Save Policy</button><button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button></div>
                    </form>
                </Modal>
            )}

            {showCompareModal && <CompareInsuranceModal rows={defaultCompareRates} onClose={() => setShowCompareModal(false)} onOpenHub={() => { setShowCompareModal(false); onSelectSection?.('comparehub'); }} />}
        </div>
    );
};

const MobileProtectionFlow = ({
    activePolicies,
    answers,
    calculator,
    claimForm,
    complete,
    compareCategory,
    compareRows,
    coverageAdequacy,
    coverageGap,
    coverageTotal,
    currentStep,
    displayName,
    insightCards,
    missingPolicies,
    monthlyPremiums,
    onAnswer,
    onBack,
    onCalcChange,
    onClaimChange,
    onClaimSubmit,
    onComplete,
    onCompareOptions,
    onCompare,
    onFormChange,
    onManagePolicy,
    onManagePolicyChange,
    onManagePolicySubmit,
    onNext,
    onPlanChoose,
    onPolicyClaim,
    onPolicyCompare,
    onPolicyDelete,
    onPolicySubmit,
    onRestart,
    onSetMobileView,
    onStart,
    policies,
    policyForm,
    managePolicyForm,
    recommendedByType,
    recommendedCover,
    saving,
    showOnboarding,
    view,
}) => {
    if (showOnboarding && !complete) {
        return <MobileProtectionWelcome displayName={displayName} onStart={onStart} />;
    }
    if (complete) {
        if (view === 'manage-policy') {
            return (
                <MobileManagePolicyScreen
                    form={managePolicyForm}
                    onBack={() => onSetMobileView('overview')}
                    onChange={onManagePolicyChange}
                    onSubmit={onManagePolicySubmit}
                    saving={saving}
                />
            );
        }
        if (view === 'file-claim') {
            return (
                <MobileFileClaimScreen
                    form={claimForm}
                    onBack={() => onSetMobileView('overview')}
                    onChange={onClaimChange}
                    onSubmit={onClaimSubmit}
                    saving={saving}
                />
            );
        }
        if (view === 'add-policy') {
            return (
                <MobileAddPolicyScreen
                    form={policyForm}
                    onBack={() => onSetMobileView('policies')}
                    onChange={onFormChange}
                    onSubmit={onPolicySubmit}
                    saving={saving}
                />
            );
        }
        if (view === 'compare') {
            return (
                <MobileCompareInsuranceScreen
                    onDashboard={() => onSetMobileView('overview')}
                    onBack={() => onSetMobileView('overview')}
                    initialCategory={compareCategory}
                    onPlanChoose={onPlanChoose}
                    rows={compareRows}
                />
            );
        }
        return (
            <MobileExistingProtectionDashboard
                activePolicies={activePolicies}
                calculator={calculator}
                coverageAdequacy={coverageAdequacy}
                coverageGap={coverageGap}
                coverageTotal={coverageTotal}
                insightCards={insightCards}
                missingPolicies={missingPolicies}
                monthlyPremiums={monthlyPremiums}
                onAddPolicy={() => onSetMobileView('add-policy')}
                onCalcChange={onCalcChange}
                onCompare={onCompare}
                onManagePolicy={onManagePolicy}
                onPolicyClaim={onPolicyClaim}
                onPolicyCompare={onPolicyCompare}
                onPolicyDelete={onPolicyDelete}
                onRestart={onRestart}
                onSetMobileView={onSetMobileView}
                policies={policies}
                recommendedByType={recommendedByType}
                recommendedCover={recommendedCover}
                view={view}
            />
        );
    }

    const isRecommendationStep = currentStep >= protectionQuestions.length;
    if (isRecommendationStep) {
        return (
            <MobileProtectionShell>
                <div className="px-4 pb-5">
                    <MobileProtectionTitle onBack={onBack} />
                    <div className="mt-4 rounded-[1rem] border border-[#e4efe9] bg-white px-3 py-3 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 text-[0.7rem] font-bold text-[#2e7d6f]"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e6f4ed] text-[#006d67]"><Check size={11} /></span>Recommendation ready</span>
                            <span className="text-[0.68rem] font-bold text-slate-400">5 / 5</span>
                        </div>
                        <MobileProtectionProgress step={protectionQuestions.length - 1} />
                        <h3 className="mt-4 text-[0.98rem] font-extrabold leading-5 text-slate-950">Here is the cover target built from your answers.</h3>
                        <p className="mt-1 text-[0.68rem] leading-4 text-slate-500">Review the estimate, then choose whether to use it as your protection starting point or adjust your answers.</p>
                    </div>
                    <MobileRecommendedCoverCard calculator={calculator} coverageGap={coverageGap} recommendedCover={recommendedCover} />
                    <div className="mt-4 space-y-3">
                        <button type="button" onClick={onCompareOptions} className="h-11 w-full rounded-full border border-[#f0dca4] bg-[#fff8e6] text-[0.72rem] font-extrabold text-[#8a6400]">Compare other covers</button>
                        <div className="grid grid-cols-[0.82fr_1.28fr] gap-3">
                            <button type="button" onClick={onRestart} className="h-11 rounded-full border border-[#dce9e3] bg-white text-[0.72rem] font-extrabold text-[#006d67]">Reset</button>
                            <button type="button" onClick={onComplete} className="h-11 rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm">Use this cover</button>
                        </div>
                    </div>
                </div>
            </MobileProtectionShell>
        );
    }

    const question = protectionQuestions[currentStep] || protectionQuestions[0];
    const selected = answers[question.id];
    const isLastQuestion = currentStep >= protectionQuestions.length - 1;

    return (
        <MobileProtectionShell>
            <div className="px-4 pb-5">
                <MobileProtectionTitle onBack={onBack} />
                <div className="mt-4 rounded-[1rem] border border-[#e4efe9] bg-white px-3 py-3 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[0.7rem] font-bold text-[#2e7d6f]"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e6f4ed] text-[#006d67]"><Check size={11} /></span>Set your objectives</span>
                        <span className="text-[0.68rem] font-bold text-slate-400">{currentStep + 1} / {protectionQuestions.length}</span>
                    </div>
                    <MobileProtectionProgress step={currentStep} />
                    <h3 className="mt-4 text-[0.98rem] font-extrabold leading-5 text-slate-950">{question.question}</h3>
                    <p className="mt-1 text-[0.68rem] leading-4 text-slate-500">{question.helper}</p>
                    <div className={question.compact ? 'mt-3 grid grid-cols-5 gap-2' : 'mt-3 space-y-2'}>
                        {question.options.map((option) => (
                            <MobileProtectionOption
                                compact={question.compact}
                                key={option.value}
                                option={option}
                                selected={selected === option.value}
                                onClick={() => onAnswer(question, option)}
                            />
                        ))}
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-[0.82fr_1.28fr] gap-3">
                    <button type="button" onClick={onRestart} className="h-11 rounded-full border border-[#dce9e3] bg-white text-[0.72rem] font-extrabold text-[#006d67]">Reset</button>
                    <button type="button" onClick={onNext} disabled={!selected} className="h-11 rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm disabled:bg-slate-300">{isLastQuestion ? 'See recommendation' : 'Next'}</button>
                </div>
            </div>
        </MobileProtectionShell>
    );
};

const MobileExistingProtectionDashboard = ({
    activePolicies,
    calculator,
    coverageAdequacy,
    coverageGap,
    coverageTotal,
    insightCards,
    missingPolicies,
    monthlyPremiums,
    onAddPolicy,
    onCalcChange,
    onCompare,
    onManagePolicy,
    onPolicyClaim,
    onPolicyCompare,
    onPolicyDelete,
    onRestart,
    onSetMobileView,
    policies,
    recommendedByType,
    recommendedCover,
    view,
}) => {
    const selectedView = ['overview', 'policies', 'solutions', 'calculator'].includes(view) ? view : 'overview';
    return (
        <MobileProtectionShell>
            <div className="px-4 pb-5">
                <MobileProtectionTitle onBack={selectedView === 'overview' ? undefined : () => onSetMobileView('overview')} />
                <MobileProtectionTabs active={selectedView} onChange={onSetMobileView} />
                {selectedView === 'overview' && (
                    <MobileProtectionOverview
                        activePolicies={activePolicies}
                        coverageAdequacy={coverageAdequacy}
                        coverageGap={coverageGap}
                        coverageTotal={coverageTotal}
                        insightCards={insightCards}
                        monthlyPremiums={monthlyPremiums}
                        onAddPolicy={onAddPolicy}
                        onManagePolicy={onManagePolicy}
                        onPolicyClaim={onPolicyClaim}
                        onPolicyCompare={onPolicyCompare}
                        onPolicyDelete={onPolicyDelete}
                        onRestart={onRestart}
                        onSetMobileView={onSetMobileView}
                        policies={policies}
                        recommendedCover={recommendedCover}
                    />
                )}
                {selectedView === 'policies' && (
                    <MobilePoliciesScreenContent
                        onAddPolicy={onAddPolicy}
                        onCompare={onCompare}
                        policies={policies}
                    />
                )}
                {selectedView === 'solutions' && (
                    <MobileProtectionSolutions
                        missingPolicies={missingPolicies}
                        onCalc={() => onSetMobileView('calculator')}
                        onCompare={onCompare}
                        policies={policies}
                        recommendedByType={recommendedByType}
                    />
                )}
                {selectedView === 'calculator' && (
                    <MobileProtectionCalculator
                        calculator={calculator}
                        coverageGap={coverageGap}
                        coverageTotal={coverageTotal}
                        onCalcChange={onCalcChange}
                        onCompare={onCompare}
                        recommendedCover={recommendedCover}
                    />
                )}
            </div>
        </MobileProtectionShell>
    );
};

const MobileProtectionTabs = ({ active, onChange }) => (
    <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
        {[
            ['overview', 'All'],
            ['policies', 'My Policies'],
            ['solutions', 'Solutions'],
            ['calculator', 'Calculator'],
        ].map(([key, label]) => (
            <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                className={`h-8 shrink-0 rounded-full border px-3 text-[0.64rem] font-extrabold ${active === key ? 'border-[#f2c230] bg-[#f2c230] text-white' : 'border-[#dce9e3] bg-white text-slate-600'}`}
            >
                {label}
            </button>
        ))}
    </div>
);

const MobileProtectionOverview = ({ activePolicies, coverageAdequacy, coverageGap, coverageTotal, insightCards, monthlyPremiums, onAddPolicy, onManagePolicy, onPolicyClaim, onPolicyCompare, onPolicyDelete, onRestart, onSetMobileView, policies, recommendedCover }) => {
    const incomePercent = Math.min(Math.round((asNumber(monthlyPremiums) * 12 / Math.max(asNumber(recommendedCover), 1)) * 100), 100);
    return (
        <div className="mt-3 space-y-3">
            <article className="rounded-[1rem] bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)] p-4 text-white shadow-sm">
                <p className="text-[0.68rem] font-semibold text-white/80">Total Monthly Premiums</p>
                <p className="mt-1 text-[1.4rem] font-extrabold leading-none">{formatKES(monthlyPremiums)}</p>
                <div className="mt-3 flex items-center justify-between text-[0.58rem] font-semibold text-white/80">
                    <span>percentage of income</span>
                    <span className="rounded-full bg-[#f2c230] px-2 py-0.5 text-[#3f4b20]">{incomePercent}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/30">
                    <div className="h-1.5 rounded-full bg-[#f2c230]" style={{ width: `${Math.max(Math.min(incomePercent, 100), 8)}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[0.55rem] font-semibold text-white/80">
                    <span>Medical</span>
                    <span>Life cover</span>
                    <span>Premiums</span>
                </div>
            </article>

            <div className="grid grid-cols-[1fr_1.2fr_0.72fr] gap-2">
                <MobileMiniMetric label="Total Value Cover" value={formatKES(coverageTotal)} helper="Current policies" />
                <MobileMiniMetric label="Recommended Value" value={formatKES(recommendedCover)} helper={`${formatKES(coverageGap)} gap`} />
                <MobileMiniMetric label="Active Policies" value={String(activePolicies.length)} helper="Active covers" />
            </div>

            <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[0.84rem] font-extrabold text-slate-950">My Policies</h3>
                        <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Add your current policies to track and push your cover goals.</p>
                    </div>
                    <button type="button" onClick={onAddPolicy} className="text-[0.62rem] font-extrabold text-[#d99a00]">Add Policies</button>
                </div>
                <div className="mt-3 space-y-2">
                    {(policies.length ? policies.slice(0, 2) : []).map((policy) => (
                        <MobileDetailedPolicyCard
                            key={policy.uuid || policy.name}
                            onClaim={onPolicyClaim}
                            onCompare={onPolicyCompare}
                            onDelete={onPolicyDelete}
                            onManage={onManagePolicy}
                            policy={policy}
                            recommended={recommendedCover}
                        />
                    ))}
                    {policies.length === 0 && <p className="rounded-[0.85rem] bg-[#f8faf9] px-3 py-4 text-center text-[0.66rem] font-semibold text-slate-500">No policies yet. Add one to unlock cover analytics.</p>}
                </div>
                <button type="button" onClick={() => onSetMobileView('policies')} className="mt-3 w-full text-[0.64rem] font-extrabold text-[#d99a00]">View More</button>
            </article>

            <section>
                <div>
                    <h3 className="text-[0.86rem] font-extrabold text-slate-950">Insights</h3>
                    <p className="text-[0.62rem] text-slate-500">Analytic breakdown of how to protect your money.</p>
                </div>
                <div className="mt-3 space-y-2">
                    {(insightCards.length ? insightCards : [
                        { title: 'Medical Cover Comes First', text: 'Prioritise health cover before optional policies.', tone: 'border-orange-100 bg-orange-50 text-orange-700' },
                        { title: 'Income Protection Gap', text: 'Income protection keeps essentials paid if income stops.', tone: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
                        { title: 'Recommended Cover Shortfall', text: 'Compare plans that reduce your cover gap.', tone: 'border-purple-100 bg-purple-50 text-purple-700' },
                    ]).slice(0, 3).map((item) => <MobileInsightRow key={item.title} item={item} />)}
                </div>
            </section>

            <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-4 shadow-sm">
                <h3 className="text-[0.86rem] font-extrabold text-slate-950">Protection Analytics</h3>
                <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Here is your protection analytics to understand what you need to protect next.</p>
                <div className="mt-4 flex items-center gap-4">
                    <ScoreRing value={coverageAdequacy} />
                    <div className="space-y-2 text-[0.62rem]">
                        {['Life Insurance', 'Medical Cover', 'Car Insurance', 'Disability Cover'].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-sm bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)]" />
                                <span className="font-semibold text-slate-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-3 rounded-[0.85rem] bg-[#fff5e8] p-3">
                    <p className="text-[0.72rem] font-extrabold text-[#c36a1b]">Needs Attention</p>
                    <p className="mt-1 text-[0.62rem] leading-4 text-[#9a5a18]">Your next best action is to compare cover options for the largest remaining gaps.</p>
                </div>
            </article>

            <button type="button" onClick={onRestart} className="h-10 w-full rounded-full border border-[#dce9e3] bg-white text-[0.68rem] font-extrabold text-[#006d67]">Reset</button>
        </div>
    );
};

const MobileMiniMetric = ({ helper, label, value }) => (
    <article className="min-w-0 rounded-[0.85rem] border border-[#e4efe9] bg-white p-2 shadow-sm">
        <p className="text-[0.55rem] font-bold text-slate-500">{label}</p>
        <p className="mt-1 truncate text-[0.72rem] font-extrabold text-[#006d67]">{value}</p>
        <p className="mt-1 truncate text-[0.52rem] font-semibold text-slate-400">{helper}</p>
    </article>
);

const MobileDetailedPolicyCard = ({ onClaim, onCompare, onDelete, onManage, policy, recommended }) => {
    const coverValue = asNumber(policy.currentValue);
    const adequacy = Math.min(Math.round((coverValue / Math.max(asNumber(recommended), 1)) * 100), 100);
    const meta = policy.protectionMeta?.policyMeta || POLICY_LIBRARY['Life Insurance'];
    return (
        <article className="rounded-[0.9rem] border border-[#e1ece7] bg-[#fbfdfc] p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="rounded-full bg-[#e7f6ef] px-2 py-0.5 text-[0.52rem] font-extrabold text-[#006d67]">{meta.label}</span>
                    <p className="mt-1 text-[0.78rem] font-extrabold text-slate-950">{policy.institution || 'Jubilee Insurance'}</p>
                </div>
                <div className="text-right">
                    <p className="text-[0.55rem] font-bold text-[#006d67]">Active</p>
                    <p className="text-[0.72rem] font-extrabold text-[#006d67]">{formatKES(policy.currentValue)}</p>
                </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-[0.54rem]">
                <MobileTinyDetail label="Cover" value={formatKES(policy.currentValue)} />
                <MobileTinyDetail label="Beneficiary" value="Family" />
                <MobileTinyDetail label="Type" value={meta.label} />
                <MobileTinyDetail label="Premiums" value="Monthly" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[0.58rem] text-slate-500">
                <span>Cover adequacy</span>
                <span className="font-extrabold text-[#006d67]">{adequacy}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-[#dfe9e3]">
                <div className="h-1.5 rounded-full bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)]" style={{ width: `${Math.max(adequacy, 8)}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-[1fr_1fr_1fr_30px] gap-1.5">
                <button type="button" onClick={() => onManage?.(policy)} className="h-8 rounded-full bg-[#006d67] text-[0.56rem] font-extrabold text-white">Manage</button>
                <button type="button" onClick={() => onCompare?.(policy)} className="h-8 rounded-full bg-[#006d67] text-[0.56rem] font-extrabold text-white">Compare</button>
                <button type="button" onClick={() => onClaim?.(policy)} className="h-8 rounded-full bg-[#006d67] text-[0.56rem] font-extrabold text-white">File Claim</button>
                <button type="button" onClick={() => onDelete?.(policy)} className="h-8 rounded-full border border-rose-100 bg-rose-50 text-[0.6rem] font-extrabold text-rose-500">X</button>
            </div>
        </article>
    );
};

const MobileTinyDetail = ({ label, value }) => (
    <div className="min-w-0">
        <p className="truncate font-bold text-slate-400">{label}</p>
        <p className="mt-1 truncate font-extrabold text-slate-700">{value}</p>
    </div>
);

const MobileInsightRow = ({ item }) => (
    <article className={`rounded-[0.95rem] border p-3 ${item.tone || 'border-[#e4efe9] bg-white text-slate-700'}`}>
        <div className="flex gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70"><ShieldAlert size={14} /></span>
            <div>
                <p className="text-[0.72rem] font-extrabold">{item.title}</p>
                <p className="mt-1 text-[0.62rem] leading-4 opacity-80">{item.text}</p>
            </div>
        </div>
    </article>
);

const MobilePoliciesScreenContent = ({ onAddPolicy, onCompare, policies }) => (
    <>
            <article className="mt-3 rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[0.84rem] font-extrabold text-[#006d67]">My Policies</h3>
                        <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Add your current policies to track and push your financial transfer, gaps and options.</p>
                    </div>
                    <button type="button" onClick={onAddPolicy} className="text-[0.62rem] font-extrabold text-[#d99a00]">+ Add Policy</button>
                </div>
                {policies.length === 0 ? (
                    <div className="py-7 text-center">
                        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eef3f7] text-[#006d67]"><FolderOpen size={24} /></span>
                        <p className="mt-4 text-[0.78rem] font-extrabold text-slate-950">No Policies</p>
                        <p className="mx-auto mt-1 max-w-[220px] text-[0.62rem] leading-4 text-slate-500">Let's get to know your current policies, then you can decide where to improve.</p>
                    </div>
                ) : (
                    <div className="mt-3 space-y-2">
                        {policies.slice(0, 4).map((policy) => <MobilePolicyRow key={policy.uuid || policy.name} policy={policy} />)}
                    </div>
                )}
            </article>
            {policies.length === 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <button type="button" onClick={onAddPolicy} className="h-10 rounded-full bg-[#006d67] text-[0.68rem] font-extrabold text-white">Add Policy</button>
                    <button type="button" onClick={onCompare} className="h-10 rounded-full border border-[#cfe7dd] bg-white text-[0.68rem] font-extrabold text-[#006d67]">I don't have any</button>
                </div>
            ) : (
                <button type="button" onClick={onCompare} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white">Continue</button>
            )}
            <div className="mt-3 rounded-full bg-[#fff2c6] px-3 py-2 text-[0.62rem] font-bold text-[#8b6a00]">Let's get your policies set up</div>
    </>
);

const MobilePolicyRow = ({ policy }) => {
    const meta = policy.protectionMeta?.policyMeta || POLICY_LIBRARY['Life Insurance'];
    const label = policy.protectionMeta?.policyType || parsePolicyType(policy);
    return (
        <div className="rounded-[0.85rem] border border-[#e1ece7] bg-[#fbfdfc] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f6ef] text-[#006d67]"><ShieldCheck size={13} /></span>
                    <div className="min-w-0">
                        <p className="truncate text-[0.66rem] font-extrabold text-slate-900">{policy.institution || 'Provider'} - {meta.label || label}</p>
                        <p className="text-[0.56rem] text-slate-500">Renewal: {policy.lastValuedDate ? formatDate(policy.lastValuedDate) : 'Not set'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[0.66rem] font-extrabold text-slate-900">{formatKES(policy.currentValue)}</p>
                    <p className="text-[0.56rem] text-slate-500">{formatKES(policy.purchaseValue)}/mo</p>
                </div>
            </div>
        </div>
    );
};

const MobileAddPolicyScreen = ({ form, onBack, onChange, onSubmit, saving }) => (
    <MobileProtectionShell>
        <form onSubmit={onSubmit} className="px-4 pb-5">
            <MobileProtectionTitle onBack={onBack} />
            <article className="mt-4 rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[0.84rem] font-extrabold text-[#006d67]">Add your Policy</h3>
                        <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Kindly provide the following to add your policy.</p>
                    </div>
                    <button type="button" onClick={onBack} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400"><X size={12} /></button>
                </div>
                <div className="mt-3 space-y-2.5">
                    <MobileFormSelect label="Policy Type" value={form.policyType} onChange={(value) => onChange('policyType', value)} options={POLICY_OPTIONS} />
                    <MobileFormInput label="Insurer" value={form.provider} onChange={(value) => onChange('provider', value)} placeholder="Eg. Jubilee, AAR, Britam" />
                    <MobileFormInput label="Policy Number" value={form.notes} onChange={(value) => onChange('notes', value)} placeholder="Eg. Policy Number" />
                    <div className="grid grid-cols-2 gap-2">
                        <MobileFormInput label="Cover Value" type="number" value={form.coverageAmount} onChange={(value) => onChange('coverageAmount', value)} placeholder="KES 250,000" />
                        <MobileFormInput label="Premium Per Month" type="number" value={form.monthlyPremium} onChange={(value) => onChange('monthlyPremium', value)} placeholder="KES 10,000" />
                    </div>
                    <MobileFormInput label="Renewal Date" value="" onChange={() => {}} placeholder="26-06-2026" />
                </div>
            </article>
            <button type="submit" disabled={saving || !form.coverageAmount || !form.monthlyPremium} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm disabled:bg-slate-300">{saving ? 'Adding Policy...' : '+ Add Policy'}</button>
        </form>
    </MobileProtectionShell>
);

const MobileManagePolicyScreen = ({ form, onBack, onChange, onSubmit, saving }) => (
    <MobileProtectionShell>
        <form onSubmit={onSubmit} className="px-4 pb-5">
            <MobileProtectionTitle onBack={onBack} />
            <article className="mt-4 rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[0.84rem] font-extrabold text-[#006d67]">Manage policy</h3>
                        <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Update the details you use to track this cover.</p>
                    </div>
                    <button type="button" onClick={onBack} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400"><X size={12} /></button>
                </div>
                <div className="mt-3 space-y-2.5">
                    <MobileFormInput label="Insurer" value={form.provider} onChange={(value) => onChange('provider', value)} placeholder="Eg. Jubilee, AAR, Britam" />
                    <div className="grid grid-cols-2 gap-2">
                        <MobileFormInput label="Cover Value" type="number" value={form.coverageAmount} onChange={(value) => onChange('coverageAmount', value)} placeholder="KES 250,000" />
                        <MobileFormInput label="Premium Per Month" type="number" value={form.monthlyPremium} onChange={(value) => onChange('monthlyPremium', value)} placeholder="KES 10,000" />
                    </div>
                    <MobileFormSelect label="Status" value={form.status} onChange={(value) => onChange('status', value)} options={['ACTIVE', 'INACTIVE']} />
                    <MobileFormInput label="Notes" value={form.notes} onChange={(value) => onChange('notes', value)} placeholder="Policy notes or policy number" />
                </div>
            </article>
            <button type="submit" disabled={saving || !form.coverageAmount || !form.monthlyPremium} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm disabled:bg-slate-300">{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
    </MobileProtectionShell>
);

const MobileFileClaimScreen = ({ form, onBack, onChange, onSubmit, saving }) => (
    <MobileProtectionShell>
        <form onSubmit={onSubmit} className="px-4 pb-5">
            <MobileProtectionTitle onBack={onBack} />
            <article className="mt-4 rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-[0.84rem] font-extrabold text-[#006d67]">File claim</h3>
                        <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Capture the claim details so you can track the next action.</p>
                    </div>
                    <button type="button" onClick={onBack} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400"><X size={12} /></button>
                </div>
                <div className="mt-3 space-y-2.5">
                    <MobileFormSelect label="Claim Type" value={form.claimType} onChange={(value) => onChange('claimType', value)} options={['Medical claim', 'Motor claim', 'Life claim', 'Disability claim', 'Other claim']} />
                    <div className="grid grid-cols-2 gap-2">
                        <MobileFormInput label="Incident Date" value={form.incidentDate} onChange={(value) => onChange('incidentDate', value)} placeholder="2026-06-30" />
                        <MobileFormInput label="Claim Amount" type="number" value={form.amount} onChange={(value) => onChange('amount', value)} placeholder="KES 20,000" />
                    </div>
                    <MobileFormInput label="Notes" value={form.notes} onChange={(value) => onChange('notes', value)} placeholder="What happened?" />
                </div>
            </article>
            <button type="submit" disabled={saving || !form.amount || !form.incidentDate} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm disabled:bg-slate-300">{saving ? 'Saving claim...' : 'Save claim'}</button>
        </form>
    </MobileProtectionShell>
);

const MobileCompareInsuranceScreen = ({ initialCategory = 'medical', onBack, onDashboard, onPlanChoose, rows }) => {
    const categoryKeys = Object.keys(compareInsuranceCategories);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [selectedPlanKey, setSelectedPlanKey] = useState('');
    const category = compareInsuranceCategories[activeCategory] || compareInsuranceCategories.medical;
    const plans = category.plans?.length ? category.plans : rows;
    const bestPlan = plans[0];
    const selectedPlan = plans.find((plan) => plan.provider === selectedPlanKey);
    const premiumRange = plans.reduce((range, plan) => ({
        min: Math.min(range.min, asNumber(plan.premium)),
        max: Math.max(range.max, asNumber(plan.premium)),
    }), { min: Number.POSITIVE_INFINITY, max: 0 });

    const choosePlan = (plan) => {
        setSelectedPlanKey(plan.provider);
        onPlanChoose?.();
    };

    return (
        <MobileProtectionShell>
            <div className="px-4 pb-5">
                <MobileProtectionTitle onBack={onBack} />
                <div className="mt-4">
                    <span className="inline-flex items-center gap-2 text-[0.72rem] font-extrabold text-[#006d67]"><ShieldCheck size={13} />Compare Insurance</span>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {categoryKeys.map((key) => {
                            const item = compareInsuranceCategories[key];
                            const cheapest = item.plans.reduce((min, plan) => Math.min(min, asNumber(plan.premium)), Number.POSITIVE_INFINITY);
                            const active = activeCategory === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(key);
                                        setSelectedPlanKey('');
                                    }}
                                    className={`h-[50px] rounded-[0.75rem] border px-1 text-[0.56rem] font-extrabold ${active ? 'border-[#f2c230] bg-[#f2c230] text-white' : 'border-[#e1ece7] bg-white text-slate-500'}`}
                                >
                                    {item.label}<br /><span className="font-semibold">{formatKES(cheapest)}/mo</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-2 text-[0.62rem] leading-4 text-slate-500">{category.helper}</p>
                </div>
                <article className="mt-3 rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <MobileCompareStat label="Best fit" value={bestPlan.provider} />
                        <MobileCompareStat label="Premium range" value={`${formatKES(premiumRange.min)} - ${formatKES(premiumRange.max)}`} />
                        <MobileCompareStat label="Highest cover" value={formatKES(Math.max(...plans.map((plan) => asNumber(plan.cover))))} />
                    </div>
                </article>
                <div className="mt-3 space-y-3">
                    {plans.map((row, index) => (
                        <MobileInsurancePlan
                            key={row.provider}
                            row={row}
                            featured={index === 0}
                            selected={selectedPlanKey === row.provider}
                            onChoose={() => choosePlan(row)}
                        />
                    ))}
                </div>
                {selectedPlan && (
                    <article className="mt-3 rounded-[1rem] border border-[#cfe7dd] bg-[#eef8f3] p-3 text-[#006d67]">
                        <p className="text-[0.72rem] font-extrabold">{selectedPlan.provider} selected</p>
                        <p className="mt-1 text-[0.62rem] leading-4">You can continue comparing, or go back to your Protection Planner dashboard to see how your plan is doing.</p>
                    </article>
                )}
                <button type="button" onClick={onDashboard} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.72rem] font-extrabold text-white shadow-sm">Go to dashboard</button>
            </div>
        </MobileProtectionShell>
    );
};

const MobileProtectionSolutions = ({ missingPolicies, onCalc, onCompare, policies, recommendedByType }) => {
    const suggested = (missingPolicies.length ? missingPolicies : POLICY_OPTIONS.slice(0, 3)).slice(0, 3);
    return (
        <div className="mt-3 space-y-3">
            <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <h3 className="text-[0.86rem] font-extrabold text-slate-950">Protection Solutions</h3>
                <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Get a gap analysis on your insurances that you need to protect yourself financially.</p>
                <div className="mt-3 space-y-2.5">
                    {suggested.map((type) => {
                        const meta = POLICY_LIBRARY[type] || POLICY_LIBRARY['Life Insurance'];
                        const covered = policies.some((policy) => policy.protectionMeta?.policyType === type);
                        return (
                            <article key={type} className="rounded-[0.9rem] border border-[#e1ece7] bg-[#fbfdfc] p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[0.76rem] font-extrabold text-slate-950">{meta.label}</p>
                                        <p className="mt-1 text-[0.58rem] leading-4 text-slate-500">{meta.subtitle} - suggested cover {formatKES(recommendedByType[type])}</p>
                                    </div>
                                    <span className={`rounded-full px-2 py-1 text-[0.52rem] font-extrabold ${covered ? 'bg-[#e7f6ef] text-[#006d67]' : 'bg-rose-50 text-rose-500'}`}>{covered ? 'Covered' : 'Not Covered'}</span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <button type="button" onClick={onCalc} className="h-8 rounded-full bg-[#006d67] text-[0.58rem] font-extrabold text-white">Calculate Need</button>
                                    <button type="button" onClick={onCompare} className="h-8 rounded-full border border-[#cfe7dd] bg-white text-[0.58rem] font-extrabold text-[#006d67]">Compare Options</button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </article>
            <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
                <h3 className="text-[0.86rem] font-extrabold text-slate-950">What to compare</h3>
                <div className="mt-3 space-y-2">
                    {['Waiting periods, exclusions, and claim approval speed', 'Cover value against income, dependants and debt', 'Premium affordability without disrupting savings', 'Renewal terms, lapse rules, and portability'].map((item, index) => (
                        <div key={item} className="flex items-start gap-2 rounded-[0.8rem] bg-[#fff9e8] px-3 py-2">
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f2c230] text-[0.56rem] font-extrabold text-white">{index + 1}</span>
                            <p className="text-[0.62rem] leading-4 text-slate-600">{item}</p>
                        </div>
                    ))}
                </div>
            </article>
        </div>
    );
};

const MobileProtectionCalculator = ({ calculator, coverageGap, coverageTotal, onCalcChange, onCompare, recommendedCover }) => (
    <div className="mt-3 space-y-3">
        <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
            <h3 className="text-[0.86rem] font-extrabold text-slate-950">Coverage Calculator</h3>
            <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">Estimate how much family protection you need based on income, dependants, and outstanding obligations.</p>
            <div className="mt-3 rounded-[0.9rem] bg-[linear-gradient(135deg,_#006d67_0%,_#3f7c5a_52%,_#879346_100%)] p-4 text-white">
                <p className="text-[0.62rem] font-semibold text-white/80">Recommended Cover</p>
                <p className="mt-1 text-[1.3rem] font-extrabold leading-none">{formatKES(recommendedCover)}</p>
                <p className="mt-2 text-[0.58rem] leading-4 text-white/80">Formula: annual income x years + debts + dependent support cushion.</p>
            </div>
            <div className="mt-3 space-y-2.5">
                <MobileFormInput label="Annual income" type="number" value={calculator.annualIncome} onChange={(value) => onCalcChange('annualIncome', value)} placeholder="KES 1,200,000" />
                <MobileFormInput label="Dependants" type="number" value={calculator.dependents} onChange={(value) => onCalcChange('dependents', value)} placeholder="2" />
                <MobileFormInput label="Outstanding debt" type="number" value={calculator.outstandingDebts} onChange={(value) => onCalcChange('outstandingDebts', value)} placeholder="KES 850,000" />
                <MobileFormInput label="Years to Cover" type="number" value={calculator.yearsToCover} onChange={(value) => onCalcChange('yearsToCover', value)} placeholder="10" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="h-9 rounded-full bg-[#006d67] text-[0.62rem] font-extrabold text-white">Calculate</button>
                <button type="button" onClick={onCompare} className="h-9 rounded-full border border-[#cfe7dd] bg-white text-[0.62rem] font-extrabold text-[#006d67]">Compare Insurance</button>
            </div>
        </article>
        <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
            <h3 className="text-[0.86rem] font-extrabold text-slate-950">Coverage Guidance</h3>
            <div className="mt-3 divide-y divide-[#edf3ef] text-[0.64rem]">
                <MobileGuidanceLine label="Current Portfolio" value={formatKES(coverageTotal)} />
                <MobileGuidanceLine label="Projected Value" value={formatKES(recommendedCover)} />
                <MobileGuidanceLine label="Target Gap" value={coverageGap > 0 ? formatKES(coverageGap) : 'Covered'} />
                <MobileGuidanceLine label="Gap to Target" value={coverageGap > 0 ? formatKES(coverageGap) : 'KES 0'} />
            </div>
        </article>
        <article className="rounded-[1rem] border border-orange-100 bg-orange-50 p-3 text-orange-700">
            <p className="text-[0.72rem] font-extrabold">Medical Cover gap</p>
            <p className="mt-1 text-[0.62rem] leading-4">Recommended cover should come first if you want the fastest reduction in household risk.</p>
        </article>
    </div>
);

const MobileGuidanceLine = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
        <span className="font-semibold text-slate-500">{label}</span>
        <span className="font-extrabold text-slate-950">{value}</span>
    </div>
);

const MobileCompareStat = ({ label, value }) => (
    <div className="min-w-0 rounded-[0.8rem] bg-[#f8faf9] px-2 py-2">
        <p className="truncate text-[0.52rem] font-bold text-slate-500">{label}</p>
        <p className="mt-1 truncate text-[0.62rem] font-extrabold text-[#006d67]">{value}</p>
    </div>
);

const MobileInsurancePlan = ({ featured, onChoose, row, selected }) => (
    <article className="rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-[0.76rem] font-extrabold text-slate-950">{row.provider}</p>
                <p className="mt-0.5 text-[0.58rem] text-slate-500">{row.subtitle || 'Insurance plan'}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[0.54rem] font-extrabold ${selected ? 'bg-[#006d67] text-white' : featured ? 'bg-[#e7f6ef] text-[#006d67]' : 'bg-slate-100 text-slate-500'}`}>{selected ? 'Selected' : row.fit}</span>
        </div>
        <div className="mt-3 space-y-1.5 text-[0.62rem]">
            <MobileCompareLine label="Cover value" value={formatKES(row.cover)} />
            <MobileCompareLine label="Monthly premium" value={formatKES(row.premium)} />
            <MobileCompareLine label="Waiting period" value={row.waitingPeriod} />
            <MobileCompareLine label="Claim turnaround" value={row.claimTurnaround} />
            <MobileCompareLine label="Renewal / portability" value={row.renewal} />
        </div>
        <button type="button" onClick={onChoose} className={`mt-3 h-9 w-full rounded-full text-[0.64rem] font-extrabold ${selected ? 'bg-[#f2c230] text-white' : featured ? 'bg-[#006d67] text-white' : 'border border-[#cfe7dd] bg-white text-[#006d67]'}`}>{selected ? 'Chosen' : 'Choose this plan'}</button>
    </article>
);

const MobileCompareLine = ({ label, value }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-slate-500">{label}</span>
        <span className="font-extrabold text-[#006d67]">{value}</span>
    </div>
);

const MobileFormSelect = ({ label, onChange, options, value }) => (
    <label className="block text-[0.6rem] font-bold text-slate-500">
        {label}
        <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-[0.7rem] border border-[#e1e7ea] bg-[#f7f8fa] px-3 text-[0.66rem] font-semibold text-slate-700">
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
    </label>
);

const MobileFormInput = ({ label, onChange, placeholder, type = 'text', value }) => (
    <label className="block text-[0.6rem] font-bold text-slate-500">
        {label}
        {type === 'number' ? (
            <NumericInput value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full rounded-[0.7rem] border border-[#e1e7ea] bg-[#f7f8fa] px-3 text-[0.66rem] font-semibold text-slate-700" />
        ) : (
            <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-9 w-full rounded-[0.7rem] border border-[#e1e7ea] bg-[#f7f8fa] px-3 text-[0.66rem] font-semibold text-slate-700" />
        )}
    </label>
);

const MobileProtectionWelcome = ({ displayName, onStart }) => (
    <MobileProtectionShell>
        <div className="px-4 pb-5">
            <MobileProtectionTitle />
            <ProtectionMiniHero imageSrc={protectionPlannerHero} />
            <div className="mx-auto mt-2 inline-flex max-w-full items-center rounded-full bg-[#fff2c6] px-3 py-1.5 text-[0.64rem] font-extrabold text-[#8b6a00]">{displayName ? `Welcome ${displayName}, let's get you started` : "Welcome, let's get you started"}</div>
            <p className="mt-3 text-[0.72rem] leading-5 text-slate-500">Protect your income, health, family and legacy with the right cover, tailored to your life stage.</p>
            <MobileInfoGroup
                title="Why it matters"
                rows={[
                    ['Protect years of progress', 'One hospital cover or life income plan can keep bills, fees, and family needs on track.'],
                    ['Road to who depends on you', 'We factor in dependants, debt, and income, so cover matches your real life.'],
                    ['Clarity before you commit', 'Compare waiting periods, claim speed, and premiums before you buy the right cover.'],
                ]}
            />
            <MobileInfoGroup
                title="How it works"
                rows={[
                    ['Set your objectives', 'A few quick questions about your life and finances.'],
                    ['Add policies you have', 'Record existing cover, so you know what is missing.'],
                    ['Compare options', 'See suggested cover and providers side by side.'],
                    ['See your dashboard', 'Track cover, premiums, and gaps in one place.'],
                ]}
            />
            <button type="button" onClick={onStart} className="mt-4 h-11 w-full rounded-full bg-[#006d67] text-[0.78rem] font-extrabold text-white shadow-sm">Get Started</button>
        </div>
    </MobileProtectionShell>
);

const MobileProtectionShell = ({ children }) => (
    <section className="mx-auto max-w-[390px] overflow-hidden rounded-[1.35rem] bg-[#f8f9f8] shadow-sm md:hidden">
        {children}
    </section>
);

const MobileProtectionTitle = ({ onBack }) => (
    <div className="flex items-start gap-3 pt-4">
        {onBack ? (
            <button
                type="button"
                onClick={onBack}
                className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
                aria-label="Go back"
            >
                <ChevronLeft size={17} />
            </button>
        ) : null}
        <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold text-slate-500">Welcome to your</p>
            <h2 className="text-[1.06rem] font-extrabold leading-5 text-[#006d67]">Protection Planner</h2>
            <p className="mt-0.5 text-[0.62rem] text-slate-500">Let's protect what you have built over the years</p>
        </div>
    </div>
);

const ProtectionMiniHero = ({ compact = false, imageSrc }) => (
    <div className={`mx-auto ${compact ? 'mt-3 h-[82px] w-[124px]' : 'mt-5 h-[118px] w-[170px]'} relative`}>
        {imageSrc ? (
            <img src={imageSrc} alt="" className="h-full w-full object-contain" />
        ) : (
            <>
        <div className="absolute bottom-0 left-3 right-3 h-8 rounded-full bg-[#fde8b4]" />
        <div className="absolute bottom-6 left-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f5ec] text-[#006d67]"><ShieldCheck size={compact ? 24 : 30} /></div>
        <div className="absolute bottom-4 left-16 flex h-20 w-20 items-center justify-center rounded-[1.1rem] bg-[#fff7df] text-[#d49600] shadow-sm"><Heart size={compact ? 22 : 28} /></div>
        <div className="absolute bottom-3 right-2 h-12 w-8 rounded-full bg-[#f7c27b]" />
        <div className="absolute bottom-6 right-5 h-7 w-7 rounded-full bg-[#5c3b2e]" />
        <div className="absolute bottom-3 right-12 h-9 w-6 rounded-full bg-[#0f8c76]" />
        <div className="absolute bottom-9 left-2 h-5 w-5 rounded-full bg-[#f6bd30]" />
        <div className="absolute right-4 top-2 h-5 w-5 rounded-full bg-[#f6bd30]" />
            </>
        )}
    </div>
);

const MobileInfoGroup = ({ title, rows }) => (
    <article className="mt-3 rounded-[1rem] border border-[#e4efe9] bg-white p-3 shadow-sm">
        <p className="text-[0.72rem] font-extrabold text-[#006d67]">{title}</p>
        <div className="mt-2 space-y-2">
            {rows.map(([heading, text], index) => (
                <div key={heading} className="flex gap-2 rounded-[0.8rem] bg-[#fff9e8] px-3 py-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f2c230] text-[0.58rem] font-extrabold text-white">{index + 1}</span>
                    <div>
                        <p className="text-[0.68rem] font-extrabold text-slate-800">{heading}</p>
                        <p className="mt-0.5 text-[0.62rem] leading-4 text-slate-500">{text}</p>
                    </div>
                </div>
            ))}
        </div>
    </article>
);

const MobileProtectionProgress = ({ step }) => (
    <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((item) => (
            <React.Fragment key={item}>
                <span className={`h-3.5 w-3.5 rounded-full border ${item <= step ? 'border-[#f2c230] bg-[#f2c230]' : 'border-[#d8e5df] bg-white'}`} />
                {item < 4 && <span className={`h-0.5 flex-1 rounded-full ${item < step ? 'bg-[#f2c230]' : 'bg-[#d8e5df]'}`} />}
            </React.Fragment>
        ))}
    </div>
);

const MobileProtectionOption = ({ compact, onClick, option, selected }) => (
    <button
        type="button"
        onClick={onClick}
        className={`${compact ? 'h-9 justify-center px-1' : 'h-11 justify-between px-3'} flex w-full items-center rounded-[0.8rem] border text-left text-[0.68rem] font-bold transition ${selected ? 'border-[#f2c230] bg-[#fff5cf] text-[#7a5a00]' : 'border-[#dfeae5] bg-white text-slate-700'}`}
    >
        <span>{option.label}</span>
        {!compact && <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${selected ? 'border-[#f2c230] bg-[#f2c230]' : 'border-slate-300 bg-white'}`}>{selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span>}
    </button>
);

const MobileRecommendedCoverCard = ({ calculator, coverageGap, recommendedCover }) => {
    const incomeCover = asNumber(calculator.annualIncome) * Math.max(asNumber(calculator.yearsToCover), 1);
    const familySupport = asNumber(calculator.dependents) * 600000;
    return (
        <article className="mt-3 rounded-[1rem] border border-[#f0dca4] bg-[#fff8e6] p-3 shadow-sm">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.08em] text-[#b88300]">Recommended cover - feeling</p>
            <p className="mt-1 text-[1.08rem] font-extrabold text-[#006d67]">{formatKES(recommendedCover)}</p>
            <p className="text-[0.62rem] text-slate-500">Based on 10-year income replacement</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[0.62rem]">
                <MobileCoverLine label="Income replacement" value={formatKES(incomeCover)} />
                <MobileCoverLine label="Outstanding debt" value={formatKES(calculator.outstandingDebts)} />
                <MobileCoverLine label="Education & family support" value={formatKES(familySupport)} />
                <MobileCoverLine label="Coverage gap" value={coverageGap > 0 ? formatKES(coverageGap) : 'Covered'} />
            </div>
        </article>
    );
};

const MobileCoverLine = ({ label, value }) => (
    <div className="rounded-[0.75rem] bg-white/80 px-2.5 py-2">
        <p className="font-semibold text-slate-500">{label}</p>
        <p className="mt-1 font-extrabold text-slate-900">{value}</p>
    </div>
);

const MetricCard = ({ title, value, helper, valueClass, cardTone = 'bg-white' }) => <article className={`rounded-[1.2rem] border border-primary-100 px-4 py-4 shadow-sm ${cardTone}`}><p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#9bb8af]">{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${valueClass}`}>{value}</p><p className="mt-2 text-[0.82rem] text-slate-500">{helper}</p></article>;
const ScoreRing = ({ value }) => <div className="relative flex h-24 w-24 items-center justify-center"><div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#179b6e ${value * 3.6}deg, #e8f3ef 0deg)` }} /><div className="absolute inset-[8px] rounded-full bg-white" /><div className="relative text-center"><p className="text-[1.6rem] font-extrabold leading-none text-primary-700">{value}</p><p className="text-xs text-slate-500">/100</p></div></div>;
const TabButton = ({ active, onClick, children }) => <button type="button" onClick={onClick} className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-primary-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;
const PanelHeading = ({ icon: Icon, title, noMargin = false }) => <div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-1'}`}><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon size={18} /></span><h3 className="dashboard-display-title text-[1.05rem] font-bold text-slate-950">{title}</h3></div>;
const InfoCell = ({ label, value }) => <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9bb8af]">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div>;
const InsightCard = ({ title, text, tone }) => <div className={`rounded-[1rem] border p-4 text-sm ${tone}`}><p className="font-semibold">{title}</p><p className="mt-1">{text}</p></div>;
const GuidanceRow = ({ label, value, tone }) => <div className="rounded-[1rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="text-sm text-slate-700">{label}</span><span className={`dashboard-metric-value text-[1.08rem] font-extrabold ${tone}`}>{value}</span></div></div>;
const ChecklistRow = ({ text }) => <div className="flex items-start gap-3 rounded-[0.9rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3 text-sm text-slate-700"><span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff3ea] text-[10px] font-extrabold text-[#175f54]">OK</span><span>{text}</span></div>;
const CalcInput = ({ label, value, onChange }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <NumericInput
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
    </label>
);
const Input = ({ label, value, onChange, ...props }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        {props.type === 'number' ? (
            <NumericInput
                {...props}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
        ) : (
            <input
                {...props}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
        )}
    </label>
);
const EmptyState = ({ text }) => <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">{text}</div>;

const PolicyCard = ({ asset, deleting, onDelete, onCompare, recommended }) => {
    const { policyMeta, policyType, status } = asset.protectionMeta;
    const Icon = policyMeta.icon;
    const coverValue = asNumber(asset.currentValue);
    const adequacy = Math.min(Math.round((coverValue / Math.max(asNumber(recommended), 1)) * 100), 100);
    const isGap = status !== 'ACTIVE' || policyType === 'Disability Cover' || policyType === 'Critical Illness Cover';
    const cardTone = isGap ? 'border-rose-200 bg-rose-50' : policyType === 'Car Insurance' ? 'border-amber-200 bg-[#fff8ea]' : 'border-emerald-200 bg-white';
    return <article className={`rounded-[1.1rem] border p-4 shadow-sm ${cardTone}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${policyMeta.color}14`, color: policyMeta.color }}><Icon size={20} /></span><div className="min-w-0"><p className="text-[1.1rem] font-bold text-slate-900">{policyMeta.label} - {asset.institution || 'Provider'}</p><p className="mt-1 text-sm text-slate-500">{policyMeta.subtitle} Â· Annual review</p></div></div><div className="text-left sm:text-right"><p className="text-[1.8rem] font-extrabold leading-none text-[#175f54]">{formatKES(asset.currentValue)}</p><p className={`mt-1 text-sm font-semibold ${status === 'ACTIVE' ? 'text-[#175f54]' : 'text-rose-500'}`}>? {status === 'ACTIVE' ? 'Active' : 'Inactive'}</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><InfoCell label="Cover" value={formatKES(asset.currentValue)} /><InfoCell label="Beneficiary" value={policyType === 'Life Insurance' ? 'Family' : policyType === 'Medical Cover' ? 'Household' : 'Policy holder'} /><InfoCell label="Type" value={policyMeta.label} /><InfoCell label="Premium Mode" value="Monthly" /></div><div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="text-slate-500">Cover adequacy vs recommended {formatKES(recommended)}</span><span className="font-semibold text-[#175f54]">{adequacy}%</span></div><div className="h-2.5 rounded-full bg-[#eaf4ef]"><div className="h-2.5 rounded-full" style={{ width: `${Math.max(Math.min(adequacy, 100), 10)}%`, backgroundColor: policyMeta.color }} /></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" className="rounded-[0.9rem] border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]">Manage</button><button type="button" onClick={onCompare} className="rounded-[0.9rem] border border-[#b8d0ff] bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1f55c7]">Compare Rates ?</button><button type="button" className="rounded-[0.9rem] border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">{policyType === 'Car Insurance' ? 'Renew' : 'File Claim'}</button><button type="button" onClick={onDelete} disabled={deleting} className="rounded-[0.9rem] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60">{deleting ? 'Removing...' : 'Remove'}</button></div></article>;
};

const CoverageMatrixCard = ({ type, covered, amount }) => {
    const meta = POLICY_LIBRARY[type];
    const Icon = meta.icon;
    const tone = covered ? 'border-emerald-200 bg-[#f8fcfa]' : meta.urgency === 'gap' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-[#fff8ea]';
    return <article className={`rounded-[1.1rem] border p-4 text-center ${tone}`}><span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}14`, color: meta.color }}><Icon size={20} /></span><p className="mt-3 font-semibold text-slate-900">{meta.matrixTitle}</p><p className={`mt-2 text-sm font-semibold ${covered ? 'text-[#175f54]' : meta.urgency === 'gap' ? 'text-rose-500' : 'text-amber-700'}`}>{covered ? '? Covered' : meta.urgency === 'optional' ? 'Optional' : meta.urgency === 'watch' ? '? Partial' : '? Not Covered'}</p><p className="mt-1 text-sm text-slate-500">{covered ? formatKES(amount) : meta.urgency === 'optional' ? 'Consider adding' : 'Get Covered'}</p></article>;
};

const Modal = ({ title, children, onClose }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold text-slate-900">{title}</h3><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div><div className="px-5 py-5">{children}</div></div></div>;

const CompareInsuranceModal = ({ rows, onClose, onOpenHub }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div className="w-full max-w-[560px] rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)]"><div className="flex items-start justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-[1.45rem] font-extrabold text-slate-950"><Sparkles size={18} className="text-[#0f5d50]" />Quick Insurance Comparison</p><p className="mt-3 text-sm text-slate-600">Based on your current protection mix, here are a few cover options worth comparing next.</p></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500"><X size={16} /></button></div><div className="mt-5 overflow-hidden rounded-[1rem] border border-emerald-100"><table className="min-w-full text-sm"><thead className="bg-[#f8fcfa] text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]"><tr><th className="px-4 py-3 font-semibold">Provider</th><th className="px-4 py-3 font-semibold">Premium</th><th className="px-4 py-3 font-semibold">Cover</th><th className="px-4 py-3 font-semibold">Fit</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.provider} className={`border-t border-emerald-100 ${index === 0 ? 'bg-[#fff8ea]' : 'bg-white'}`}><td className="px-4 py-3 font-semibold text-slate-900">{row.provider}</td><td className="px-4 py-3 text-slate-700">{formatKES(row.premium)}/mo</td><td className="px-4 py-3 text-slate-700">{formatKES(row.cover)}</td><td className={`px-4 py-3 font-semibold ${index === 0 ? 'text-[#175f54]' : index === 1 ? 'text-[#8b5cf6]' : 'text-rose-500'}`}>{row.fit} Â· {row.delta}</td></tr>)}</tbody></table></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={onClose} className="inline-flex h-12 items-center justify-center rounded-[0.95rem] border border-emerald-100 bg-[#f8fcfa] px-5 text-sm font-semibold text-slate-700 sm:w-[110px]">Close</button><button type="button" onClick={onOpenHub} className="inline-flex h-12 flex-1 items-center justify-center rounded-[0.95rem] bg-[#1c6c5d] px-5 text-sm font-semibold text-white">Open Full Hub ?</button></div></div></div>;

export default ProtectionPlanner;
