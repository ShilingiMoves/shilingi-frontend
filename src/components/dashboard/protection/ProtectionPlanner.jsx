
import React, { useEffect, useMemo, useState } from 'react';
import {
    Activity,
    ArrowRight,
    Calculator,
    Car,
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
import { createAsset, createAssetCategory, deleteAsset, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { getDebts } from '../../../services/debtApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

const PROTECTION_CATEGORY_NAME = 'Protection Policy';

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
const defaultCompareRates = [
    { provider: 'Jubilee Protection', premium: 3200, cover: 5000000, fit: 'Strong fit', delta: '-KES 250/mo' },
    { provider: 'Britam Family Cover', premium: 3600, cover: 6000000, fit: 'Balanced', delta: '+KES 150/mo' },
    { provider: 'APA Shield Plus', premium: 4100, cover: 5500000, fit: 'Highest cover', delta: '+KES 650/mo' },
];

const normalize = (value) => String(value || '').trim().toLowerCase();
const asNumber = (value) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; };
const formatKES = (value) => `KES ${Math.round(asNumber(value)).toLocaleString('en-KE')}`;
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); };

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

const ProtectionPlanner = ({ onSelectSection }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showCoverageHealthModal, setShowCoverageHealthModal] = useState(false);
    const [deletingPolicyId, setDeletingPolicyId] = useState('');
    const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
    const [calculator, setCalculator] = useState(defaultCalculator);
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalDebt, setTotalDebt] = useState(0);
    const [activeTab, setActiveTab] = useState('portfolio');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [assetRows, categoryRows, debts] = await Promise.all([getAssets(), getAssetCategories(), getDebts().catch(() => [])]);
            setAssets(assetRows);
            setCategories(categoryRows);
            const debtTotal = Array.isArray(debts) ? debts.reduce((sum, item) => sum + asNumber(item.balance), 0) : 0;
            setTotalDebt(debtTotal);
            setCalculator((current) => ({ ...current, outstandingDebts: String(Math.round(debtTotal)) }));
        } catch (err) {
            setError(err.message || 'Unable to load protection planner data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

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

    const activePolicies = protectionAssets.filter((item) => item.protectionMeta.status === 'ACTIVE');
    const carPolicies = protectionAssets.filter((item) => item.protectionMeta.policyType === 'Car Insurance');

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
    const coverageHealthRows = useMemo(() => ['Life Insurance', 'Medical Cover', 'Car Insurance', 'Disability Cover', 'Critical Illness Cover', 'Home Insurance'].map((type) => {
        const policy = protectionAssets.find((asset) => asset.protectionMeta.policyType === type);
        const recommended = recommendedByType[type] || 0;
        const coverValue = policy ? asNumber(policy.currentValue) : 0;
        const adequacy = recommended > 0 ? (coverValue / recommended) * 100 : 0;
        if (!policy) return { type, status: type === 'Home Insurance' ? 'Not Added' : 'Not Covered', tone: type === 'Home Insurance' ? 'muted' : 'danger' };
        if (type === 'Car Insurance') return { type, status: 'Expiring in 45 days', tone: 'warning' };
        if (type === 'Life Insurance') return { type, status: adequacy >= 75 ? 'Active - Adequate' : 'Active - Needs upgrade', tone: adequacy >= 75 ? 'success' : 'warning' };
        return { type, status: adequacy >= 70 ? 'Active - Adequate' : 'Active - Needs upgrade', tone: adequacy >= 70 ? 'success' : 'warning' };
    }), [protectionAssets, recommendedByType]);

    const insightCards = useMemo(() => {
        const cards = [];
        if (missingPolicies.includes('Disability Cover')) cards.push({ title: 'Urgent: Disability Gap', text: `With ${calculator.dependents} dependants and no disability cover, income protection should be your next priority.`, tone: 'border-rose-200 bg-rose-50 text-rose-700' });
        if (carPolicies.length > 0) cards.push({ title: 'Car Insurance Expiring', text: 'One vehicle policy looks close to renewal. Comparing rates now could reduce your next premium.', tone: 'border-amber-200 bg-amber-50 text-amber-800' });
        if (activePolicies.some((asset) => asset.protectionMeta.policyType === 'Life Insurance')) cards.push({ title: 'Life Cover Upgrade', text: `Your life cover is ${recommendedCover > 0 ? Math.round((coverageTotal / recommendedCover) * 100) : 0}% of recommended family protection.`, tone: 'border-emerald-200 bg-[#eef8f3] text-[#175f54]' });
        cards.push({ title: 'Premium Optimisation', text: 'Annual premium payment and bundled cover could improve value while keeping your protection broad.', tone: 'border-[#b8d0ff] bg-[#eef4ff] text-[#1f55c7]' });
        return cards.slice(0, 4);
    }, [activePolicies, calculator.dependents, carPolicies.length, coverageTotal, missingPolicies, recommendedCover]);
    const claimsHistory = useMemo(() => activePolicies.slice(0, 4).map((policy, index) => ({
        id: policy.uuid || `${policy.name}-${index}`,
        title: policy.protectionMeta.policyType === 'Medical Cover' ? 'Medical - Outpatient' : policy.protectionMeta.policyType,
        month: index === 0 ? 'February 2026' : index === 1 ? 'November 2025' : index === 2 ? 'August 2025' : 'May 2025',
        amount: formatKES(Math.max(asNumber(policy.purchaseValue) * (index + 3), 8500)),
        status: index === 3 ? 'Processing' : 'Settled',
    })), [activePolicies]);

    const paymentCalendar = useMemo(() => activePolicies.slice(0, 3).map((policy, index) => ({
        id: policy.uuid || `${policy.name}-${index}`,
        name: policy.protectionMeta.policyType,
        provider: policy.institution || 'Provider',
        amount: formatKES(policy.purchaseValue),
        note: index === 2 ? 'Due Apr 15' : `Paid Apr ${index === 0 ? '1' : '5'}`,
        tone: index === 2 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-[#eef8f3] text-[#175f54]',
    })), [activePolicies]);

    const documents = useMemo(() => activePolicies.slice(0, 4).map((policy, index) => ({
        id: policy.uuid || `${policy.name}-${index}`,
        policy: policy.protectionMeta.policyType,
        insurer: policy.institution || 'Insurance Provider',
        number: `PL-${2024 + index}-${4500 + index * 91}`,
        startDate: policy.purchaseDate ? formatDate(policy.purchaseDate) : 'Jan 2024',
        renewal: index === 2 ? 'Apr 2026' : policy.lastValuedDate ? formatDate(policy.lastValuedDate) : 'Dec 2026',
        status: index === 2 ? 'Expiring' : 'Active',
        contact: index === 0 ? '0800 724 888' : index === 1 ? '0709 099 000' : '0711 060 600',
    })), [activePolicies]);
    const ecosystemLinks = [
        { title: 'My Profile', subtitle: 'Dependants shape your cover needs', action: 'View ->', icon: User, onClick: () => onSelectSection?.('profile') },
        { title: 'Net Worth', subtitle: 'Policies count as protection assets', action: 'View ->', icon: PiggyBank, onClick: () => onSelectSection?.('networth') },
        { title: 'Compare Hub', subtitle: 'Find better insurance rates', action: 'Compare ->', icon: Sparkles, onClick: () => onSelectSection?.('comparehub') },
        { title: 'Retirement Planner', subtitle: 'Life cover funds retirement gap', action: 'Plan ->', icon: WalletCards, onClick: () => onSelectSection?.('retirement') },
        { title: 'Buddy AI', subtitle: 'Personalised cover advice', action: 'Chat ->', icon: ShieldPlus, onClick: () => onSelectSection?.('buddy') },
    ];

    const handleCalcChange = (key, value) => setCalculator((current) => ({ ...current, [key]: value }));
    const handleFormChange = (key, value) => setPolicyForm((current) => ({ ...current, [key]: value }));

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

    const gapHeadline = missingPolicies.slice(0, 2).map((item) => POLICY_LIBRARY[item]?.label || item).join(' â€¢ ');

    return (
        <div className="space-y-4">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#0f5d50] via-[#1d7a67] to-[#36947a] px-4 py-4 text-white shadow-sm sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-3 dashboard-display-title text-[1.38rem] font-extrabold leading-none sm:text-[1.55rem]"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#b91c1c]"><ShieldCheck size={16} /></span>Protection Planner</p>
                        <p className="mt-2 max-w-[31rem] text-[0.85rem] leading-5 text-white/80 sm:text-[0.9rem]">Protect your income, health, family and legacy with the right cover, tailored to your life stage.</p>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-center">
                        <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                            <button type="button" onClick={() => setShowCoverageHealthModal(true)} className="inline-flex h-10 min-w-[198px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-4 text-[0.84rem] font-semibold text-white backdrop-blur-sm"><Calculator size={14} />Review Coverage Health</button>
                            <button type="button" onClick={() => setShowCompareModal(true)} className="inline-flex h-10 min-w-[188px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-4 text-[0.84rem] font-semibold text-white backdrop-blur-sm"><Sparkles size={14} />Compare Insurance</button>
                        </div>
                        <button type="button" onClick={() => setShowAddModal(true)} className="inline-flex h-10 min-w-[146px] self-center items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-[0.84rem] font-semibold text-[#0f5d50]">+ Add Policy</button>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard title="Active Policies" value={String(activePolicies.length)} helper={activePolicies.map((item) => item.protectionMeta.label).slice(0, 2).join(' â€¢ ') || 'No active cover'} valueClass="text-[#175f54]" />
                <MetricCard title="Monthly Premiums" value={formatKES(monthlyPremiums)} helper={`${calculator.annualIncome ? ((monthlyPremiums * 12 / Math.max(asNumber(calculator.annualIncome), 1)) * 100).toFixed(1) : '0.0'}% of yearly income`} valueClass="text-[#c37a00]" />
                <MetricCard title="Total Cover Value" value={formatKES(coverageTotal)} helper={activePolicies.map((item) => item.protectionMeta.label).slice(0, 3).join(' + ') || 'No active policies'} valueClass="text-[#175f54]" />
                <MetricCard title="Recommended Cover" value={formatKES(recommendedCover)} helper={coverageGap > 0 ? `${formatKES(coverageGap)} gap` : 'Cover target met'} valueClass="text-[#2167d8]" cardTone="bg-[linear-gradient(180deg,_#fffef7_0%,_#fff5df_100%)]" />
                <MetricCard title="Coverage Gaps" value={`${missingPolicies.length} Gaps`} helper={gapHeadline || 'Well covered'} valueClass={missingPolicies.length > 0 ? 'text-rose-500' : 'text-[#175f54]'} cardTone={missingPolicies.length > 0 ? 'bg-rose-50' : 'bg-white'} />
            </section>

            <section className="rounded-[1.45rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <ScoreRing value={scoredCoverage} />
                        <div>
                            <p className="text-[1.5rem] font-extrabold text-slate-950">Protection Score: <span className="text-[#d28a0b]">{scoredCoverage >= 80 ? 'Strong' : scoredCoverage >= 55 ? 'Moderate' : 'Needs Attention'} ?</span></p>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">{coverageGap > 0 ? `You have good foundational cover but there are still visible gaps. Adding ${missingPolicies.slice(0, 2).join(' and ') || 'priority policies'} would lift your score faster.` : 'Your current mix is broadly healthy. Keep cover levels and premium timing reviewed as your family needs grow.'}</p>
                            <div className="mt-3 flex flex-wrap gap-2">{coreCoverage.map((type) => {
                                const covered = activePolicies.some((item) => item.protectionMeta.policyType === type);
                                return <span key={type} className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${covered ? 'bg-[#eef8f3] text-[#175f54]' : 'bg-rose-50 text-rose-500'}`}>{covered ? 'Covered' : 'Missing'} {POLICY_LIBRARY[type]?.label || type}</span>;
                            })}</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                        <div className="text-left lg:text-right"><p className="text-sm text-[#9bb8af]">Cover Adequacy</p><p className="text-[2rem] font-extrabold text-[#d28a0b]">{coverageAdequacy}%</p><p className="text-sm text-slate-500">of recommended level</p></div>
                        <button type="button" onClick={() => setActiveTab('calculators')} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2.5 text-sm font-semibold text-[#175f54]"><Calculator size={15} />Calculate Full Cover</button>
                    </div>
                </div>
            </section>
            {missingPolicies.length > 0 && (
                <section className="rounded-[1.35rem] border border-[#86181d] bg-[#931b1f] px-5 py-4 text-white shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#facc15] text-[#6b070b]"><ShieldAlert size={22} /></span>
                            <div>
                                <p className="text-[1.15rem] font-bold">Coverage Gap Alert - {missingPolicies.slice(0, 2).join(' & ')} not covered</p>
                                <p className="mt-1 max-w-4xl text-sm text-white/85">If income stopped due to illness or injury, your family would still need protection. With {calculator.dependents} dependants and {formatKES(totalDebt)} debt, this is one of the clearest financial risks in your dashboard.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => setShowCompareModal(true)} className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#c11f24]">Get Covered</button>
                            <button type="button" onClick={() => setActiveTab('calculators')} className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white">Calculate Cover</button>
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-[1.1rem] border border-emerald-100 bg-white p-1 shadow-sm"><div className="flex flex-wrap gap-2"><TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')}>My Protection Portfolio</TabButton><TabButton active={activeTab === 'solutions'} onClick={() => setActiveTab('solutions')}>Explore Protection Solutions</TabButton><TabButton active={activeTab === 'calculators'} onClick={() => setActiveTab('calculators')}>Insurance Calculators</TabButton></div></section>

            {activeTab === 'portfolio' && (
                <div className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between"><PanelHeading icon={FileText} title="Current Coverage" noMargin /><button type="button" onClick={() => setShowAddModal(true)} className="text-sm font-semibold text-[#175f54]">+ Add Policy</button></div>
                            {loading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading protection policies...</div> : protectionAssets.length === 0 ? <EmptyState text="No protection policies yet. Add your first policy to start tracking coverage." /> : <div className="space-y-4">{protectionAssets.map((asset) => <PolicyCard key={asset.uuid} asset={asset} deleting={deletingPolicyId === asset.uuid} recommended={recommendedByType[asset.protectionMeta.policyType]} onDelete={() => removePolicy(asset)} onCompare={() => setShowCompareModal(true)} />)}</div>}
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Sparkles} title="Buddy AI Protection Insights" /><div className="mt-4 space-y-3">{insightCards.map((item) => <InsightCard key={item.title} title={item.title} text={item.text} tone={item.tone} />)}<button type="button" onClick={() => onSelectSection?.('buddy')} className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-[#eef8f3] px-4 py-3 text-sm font-semibold text-[#175f54]">Chat with Buddy AI<ArrowRight size={14} /></button></div></article>
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><PanelHeading icon={FolderOpen} title="Claims History" noMargin /><button type="button" className="text-sm font-semibold text-[#175f54]">+ File New Claim</button></div><div className="space-y-3">{claimsHistory.length > 0 ? claimsHistory.map((item) => <ClaimRow key={item.id} item={item} />) : <EmptyState text="Claims you submit will appear here." />}<div className="rounded-xl border border-emerald-100 bg-[#f8fcfa] px-4 py-3 text-sm font-semibold text-[#175f54]">Total claims this year <span className="float-right">{formatKES(claimsHistory.reduce((sum, item) => sum + asNumber(String(item.amount).replace(/[^\d.-]/g, '')), 0))}</span></div></div></article>
                        </div>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={ShieldPlus} title="Coverage Matrix - What You're Protected Against" /><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{['Life Insurance', 'Medical Cover', 'Car Insurance', 'Disability Cover', 'Critical Illness Cover', 'Income Protection', 'Home Insurance', 'Travel Insurance'].map((type) => <CoverageMatrixCard key={type} type={type} covered={activePolicies.some((item) => item.protectionMeta.policyType === type)} amount={recommendedByType[type]} />)}</div></article>
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={WalletCards} title="Premium Payment Calendar" /><div className="mt-4 space-y-3">{paymentCalendar.length > 0 ? paymentCalendar.map((item) => <PaymentRow key={item.id} item={item} />) : <EmptyState text="Upcoming premium reminders will appear here." />}<div className="rounded-xl border border-emerald-200 bg-[#eef8f3] px-4 py-3 text-sm font-semibold text-[#175f54]">Total Monthly Premiums <span className="float-right">{formatKES(monthlyPremiums)}</span></div></div></article>
                    </section>

                    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between"><PanelHeading icon={FileText} title="Policy Documents & Contacts" noMargin /><button type="button" className="text-sm font-semibold text-[#175f54]">+ Upload Doc</button></div>
                        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-emerald-100 text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]"><th className="py-3 pr-4 font-semibold">Policy</th><th className="py-3 pr-4 font-semibold">Insurer</th><th className="py-3 pr-4 font-semibold">Policy No.</th><th className="py-3 pr-4 font-semibold">Start Date</th><th className="py-3 pr-4 font-semibold">Renewal Date</th><th className="py-3 pr-4 font-semibold">Status</th><th className="py-3 font-semibold">Contact</th></tr></thead><tbody>{documents.length > 0 ? documents.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-b-0"><td className="py-3 pr-4 font-medium text-slate-900">{item.policy}</td><td className="py-3 pr-4 text-slate-700">{item.insurer}</td><td className="py-3 pr-4 text-slate-700">{item.number}</td><td className="py-3 pr-4 text-slate-500">{item.startDate}</td><td className="py-3 pr-4 text-slate-500">{item.renewal}</td><td className="py-3 pr-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Expiring' ? 'bg-amber-100 text-amber-700' : 'bg-[#eef8f3] text-[#175f54]'}`}>{item.status}</span></td><td className="py-3 text-slate-700">{item.contact}</td></tr>) : <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">Add policies to populate documents and contacts.</td></tr>}</tbody></table></div>
                    </section>

                    <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#165747] via-[#1f6d5d] to-[#2f7f6a] p-5 text-white shadow-sm">
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

            {activeTab === 'solutions' && <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{POLICY_OPTIONS.slice(0, 6).map((type) => <SolutionCard key={type} type={type} recommended={recommendedByType[type]} onCompare={() => setShowCompareModal(true)} />)}</section>}

            {activeTab === 'calculators' && (
                <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Calculator} title="Coverage Calculator" /><p className="mt-3 text-sm text-slate-600">Estimate how much family protection you need based on income, dependants, and outstanding obligations.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><CalcInput label="Annual income (KES)" value={calculator.annualIncome} onChange={(value) => handleCalcChange('annualIncome', value)} /><CalcInput label="Dependants" value={calculator.dependents} onChange={(value) => handleCalcChange('dependents', value)} /><CalcInput label="Outstanding debts (KES)" value={calculator.outstandingDebts} onChange={(value) => handleCalcChange('outstandingDebts', value)} /><CalcInput label="Years to cover" value={calculator.yearsToCover} onChange={(value) => handleCalcChange('yearsToCover', value)} /></div><div className="mt-5 rounded-[1rem] border border-amber-200 bg-[linear-gradient(180deg,_#fffef7_0%,_#fff4df_100%)] p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">Recommended Cover</p><p className="mt-2 text-[2.6rem] font-extrabold leading-none text-[#175f54]">{formatKES(recommendedCover)}</p><p className="mt-2 text-sm text-slate-600">Formula: annual income x years + debts + dependent support cushion.</p></div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => setShowCompareModal(true)} className="inline-flex items-center gap-2 rounded-[0.95rem] bg-[#1c6c5d] px-5 py-3 text-sm font-semibold text-white">Compare Insurance<ArrowRight size={14} /></button><button type="button" onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-[0.95rem] border border-emerald-200 bg-[#eef8f3] px-5 py-3 text-sm font-semibold text-[#175f54]">Add Policy</button></div></article>
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
            {showCoverageHealthModal && <CoverageHealthReviewModal rows={coverageHealthRows} dependants={calculator.dependents} annualIncome={calculator.annualIncome} onClose={() => setShowCoverageHealthModal(false)} onGetCovered={() => { setShowCoverageHealthModal(false); setShowCompareModal(true); }} />}
        </div>
    );
};

const MetricCard = ({ title, value, helper, valueClass, cardTone = 'bg-white' }) => <article className={`rounded-[1.2rem] border border-emerald-100 px-4 py-4 shadow-sm ${cardTone}`}><p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#9bb8af]">{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${valueClass}`}>{value}</p><p className="mt-2 text-[0.82rem] text-slate-500">{helper}</p></article>;
const ScoreRing = ({ value }) => <div className="relative flex h-24 w-24 items-center justify-center"><div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#2aa38a ${value * 3.6}deg, #e8f3ef 0deg)` }} /><div className="absolute inset-[8px] rounded-full bg-white" /><div className="relative text-center"><p className="text-[1.6rem] font-extrabold leading-none text-[#175f54]">{value}</p><p className="text-xs text-slate-500">/100</p></div></div>;
const TabButton = ({ active, onClick, children }) => <button type="button" onClick={onClick} className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-[#0f5d50] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>;
const PanelHeading = ({ icon: Icon, title, noMargin = false }) => <div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-1'}`}><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f3] text-[#175f54]"><Icon size={18} /></span><h3 className="dashboard-display-title text-[1.05rem] font-bold text-slate-950">{title}</h3></div>;
const InfoCell = ({ label, value }) => <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9bb8af]">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value}</p></div>;
const InsightCard = ({ title, text, tone }) => <div className={`rounded-[1rem] border p-4 text-sm ${tone}`}><p className="font-semibold">{title}</p><p className="mt-1">{text}</p></div>;
const ClaimRow = ({ item }) => <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0"><div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="text-xs text-slate-500">{item.month}</p></div><div className="text-right"><p className={`text-sm font-extrabold ${item.status === 'Processing' ? 'text-amber-700' : 'text-[#175f54]'}`}>{item.amount}</p><p className={`text-xs font-semibold ${item.status === 'Processing' ? 'text-amber-700' : 'text-[#175f54]'}`}>{item.status}</p></div></div>;
const PaymentRow = ({ item }) => <div className={`rounded-xl border px-4 py-3 ${item.tone}`}><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{item.name} - {item.provider}</p><p className="text-sm opacity-80">{item.note}</p></div><p className="text-xl font-extrabold">{item.amount}</p></div></div>;
const GuidanceRow = ({ label, value, tone }) => <div className="rounded-[1rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="text-sm text-slate-700">{label}</span><span className={`dashboard-metric-value text-[1.08rem] font-extrabold ${tone}`}>{value}</span></div></div>;
const CalcInput = ({ label, value, onChange }) => <label className="block text-sm font-medium text-slate-700">{label}<input type="number" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>;
const Input = ({ label, value, onChange, ...props }) => <label className="block text-sm font-medium text-slate-700">{label}<input {...props} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>;
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

const SolutionCard = ({ type, recommended, onCompare }) => {
    const meta = POLICY_LIBRARY[type];
    const Icon = meta.icon;
    return <article className="rounded-[1.2rem] border border-emerald-100 bg-white p-5 shadow-sm"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}14`, color: meta.color }}><Icon size={20} /></span><p className="mt-4 text-lg font-bold text-slate-950">{meta.label}</p><p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p><div className="mt-4 rounded-xl border border-slate-100 bg-[#f8fcfa] px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-[#9bb8af]">Suggested cover</p><p className="mt-1 text-2xl font-extrabold text-[#175f54]">{formatKES(recommended)}</p></div><button type="button" onClick={onCompare} className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]">Compare options<ArrowRight size={14} /></button></article>;
};

const Modal = ({ title, children, onClose }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold text-slate-900">{title}</h3><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div><div className="px-5 py-5">{children}</div></div></div>;

const CompareInsuranceModal = ({ rows, onClose, onOpenHub }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div className="w-full max-w-[560px] rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)]"><div className="flex items-start justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-[1.45rem] font-extrabold text-slate-950"><Sparkles size={18} className="text-[#0f5d50]" />Quick Insurance Comparison</p><p className="mt-3 text-sm text-slate-600">Based on your current protection mix, here are a few cover options worth comparing next.</p></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500"><X size={16} /></button></div><div className="mt-5 overflow-hidden rounded-[1rem] border border-emerald-100"><table className="min-w-full text-sm"><thead className="bg-[#f8fcfa] text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]"><tr><th className="px-4 py-3 font-semibold">Provider</th><th className="px-4 py-3 font-semibold">Premium</th><th className="px-4 py-3 font-semibold">Cover</th><th className="px-4 py-3 font-semibold">Fit</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.provider} className={`border-t border-emerald-100 ${index === 0 ? 'bg-[#fff8ea]' : 'bg-white'}`}><td className="px-4 py-3 font-semibold text-slate-900">{row.provider}</td><td className="px-4 py-3 text-slate-700">{formatKES(row.premium)}/mo</td><td className="px-4 py-3 text-slate-700">{formatKES(row.cover)}</td><td className={`px-4 py-3 font-semibold ${index === 0 ? 'text-[#175f54]' : index === 1 ? 'text-[#8b5cf6]' : 'text-rose-500'}`}>{row.fit} Â· {row.delta}</td></tr>)}</tbody></table></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={onClose} className="inline-flex h-12 items-center justify-center rounded-[0.95rem] border border-emerald-100 bg-[#f8fcfa] px-5 text-sm font-semibold text-slate-700 sm:w-[110px]">Close</button><button type="button" onClick={onOpenHub} className="inline-flex h-12 flex-1 items-center justify-center rounded-[0.95rem] bg-[#1c6c5d] px-5 text-sm font-semibold text-white">Open Full Hub ?</button></div></div></div>;

const CoverageHealthReviewModal = ({ rows, dependants, annualIncome, onClose, onGetCovered }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div className="w-full max-w-[500px] rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.16)]"><div className="flex items-start justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-[1.45rem] font-extrabold text-slate-950"><Calculator size={18} className="text-[#0f5d50]" />Coverage Health Review</p><p className="mt-3 text-sm leading-6 text-slate-600">Here's a full review of your protection coverage compared to what's recommended for your profile ({dependants} dependants, {formatKES(annualIncome)} income).</p></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500"><X size={16} /></button></div><div className="mt-5 space-y-3">{rows.map((row) => <CoverageHealthRow key={row.type} row={row} />)}</div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={onClose} className="inline-flex h-12 items-center justify-center rounded-[0.95rem] border border-emerald-100 bg-[#f8fcfa] px-5 text-sm font-semibold text-slate-700 sm:w-[110px]">Close</button><button type="button" onClick={onGetCovered} className="inline-flex h-12 flex-1 items-center justify-center rounded-[0.95rem] bg-[#1c6c5d] px-5 text-sm font-semibold text-white">Get Missing Cover →</button></div></div></div>;

const CoverageHealthRow = ({ row }) => {
    const meta = POLICY_LIBRARY[row.type] || POLICY_LIBRARY['Life Insurance'];
    const Icon = meta.icon;
    const toneClasses = {
        success: 'border-emerald-100 bg-[#eef8f3]',
        warning: 'border-amber-100 bg-[#fff8ea]',
        danger: 'border-rose-100 bg-rose-50',
        muted: 'border-slate-100 bg-[#f6faf8]',
    };
    const textTone = row.tone === 'success' ? 'text-[#175f54]' : row.tone === 'warning' ? 'text-amber-700' : row.tone === 'danger' ? 'text-rose-500' : 'text-slate-400';
    return <div className={`flex items-center justify-between gap-3 rounded-[1rem] border px-4 py-3 ${toneClasses[row.tone] || toneClasses.muted}`}><div className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}14`, color: meta.color }}><Icon size={16} /></span><span className="font-semibold text-slate-900">{meta.label}</span></div><span className={`text-sm font-semibold ${textTone}`}>{row.status}</span></div>;
};
export default ProtectionPlanner;
