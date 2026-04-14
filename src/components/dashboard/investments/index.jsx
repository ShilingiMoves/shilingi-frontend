import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Eye,
    Landmark,
    LineChart,
    Loader2,
    Plus,
    ShieldCheck,
    Sparkles,
    Trophy,
    WalletCards,
    X,
} from 'lucide-react';
import { createAsset, createAssetCategory, deleteAsset, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const INVESTMENT_TYPES = [
    { id: 'fixed-income', label: 'Bonds', categoryName: 'Fixed Income Investment', keywords: ['fixed income', 'bond', 'treasury', 'money market', 'mmf'], color: '#179b6e', isLiquid: true, icon: Landmark, tag: 'Fixed Income' },
    { id: 'insurance', label: 'Life Insurance', categoryName: 'Insurance Policy', keywords: ['insurance', 'policy', 'cover'], color: '#f59e0b', isLiquid: false, icon: ShieldCheck, tag: 'Protection' },
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

const futureValue = (monthlyContribution, years, expectedReturn) => {
    const pmt = toNumber(monthlyContribution);
    const n = Math.max(toNumber(years) * 12, 0);
    const r = toNumber(expectedReturn) / 100 / 12;
    if (!n) return 0;
    if (!r) return pmt * n;
    return pmt * (((1 + r) ** n - 1) / r);
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
    const [activeTab, setActiveTab] = useState('portfolio');
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showRebalanceModal, setShowRebalanceModal] = useState(false);
    const [targetAllocation, setTargetAllocation] = useState({});
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [simulator, setSimulator] = useState({ monthlyContribution: '18000', durationYears: '5', expectedReturn: '12.4', targetAmount: '10000000' });

    const refreshData = async () => {
        setLoading(true);
        setError('');
        try {
            const [categoryList, assetList] = await Promise.all([getAssetCategories(), getAssets()]);
            setCategories(categoryList);
            setAssets(assetList);
        } catch (err) {
            setError(err.message || 'Failed to load investments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshData(); }, []);

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
    const targetAmount = toNumber(simulator.targetAmount);
    const progressToTarget = targetAmount > 0 ? Math.min((totals.totalValue / targetAmount) * 100, 100) : 0;
    const targetDate = useMemo(() => {
        const end = new Date();
        end.setMonth(end.getMonth() + Math.max(toNumber(simulator.durationYears) * 12, 1));
        return end.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }, [simulator.durationYears]);

    const portfolioInsights = useMemo(() => {
        const dominant = allocation[0];
        return [
            dominant ? { title: 'Rebalancing Opportunity', text: `${dominant.label} is at ${dominant.percent.toFixed(0)}% of your portfolio. Consider diversifying toward underweight assets.`, tone: 'border-primary-200 bg-primary-50 text-primary-700' } : null,
            { title: 'Goal Acceleration', text: `Adding ${formatKES(5000)}/mo extra gets you to ${formatKES(targetAmount || 10000000)} faster than your current target pace.`, tone: 'border-amber-200 bg-amber-50 text-amber-800' },
            { title: 'T-Bill Opportunity', text: 'Current 91-day T-Bill rates remain attractive for short-term top-ups and low-risk parking.', tone: 'border-[#b8d0ff] bg-[#eef4ff] text-[#1f55c7]' },
        ].filter(Boolean);
    }, [allocation, targetAmount]);

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
                interest_rate: formData.interest_rate ? String(toNumber(formData.interest_rate)) : null,
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

    return (
        <div className="space-y-4">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">{success}</div>}

            <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-4 py-4 text-white shadow-sm sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-3 dashboard-display-title text-[1.38rem] font-extrabold leading-none sm:text-[1.55rem]"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-900"><LineChart size={16} /></span>Investment Planner</p>
                        <p className="mt-2 max-w-[31rem] text-[0.85rem] leading-5 text-white/80 sm:text-[0.9rem]">Grow your wealth with curated Kenyan and global investment options. Track, rebalance, and simulate your portfolio.</p>
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-3 sm:flex-nowrap">
                        <button type="button" onClick={openRebalanceModal} className="inline-flex h-10 min-w-[190px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-4 text-[0.84rem] font-semibold text-white backdrop-blur-sm"><Sparkles size={14} />Rebalance Portfolio</button>
                        <button type="button" onClick={() => setShowTypeModal(true)} className="inline-flex h-10 min-w-[158px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-[0.84rem] font-semibold text-primary-700">+ New Investment</button>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Portfolio Value" value={formatKES(totals.totalValue)} helper={`${totals.totalGainLoss >= 0 ? '+' : '-'}${formatKES(Math.abs(totals.totalGainLoss))} total returns`} valueClass="text-[#f4c95d]" featured progress={progressToTarget} />
                <StatCard title="Target Amount" value={formatKES(targetAmount)} helper={`${progressToTarget.toFixed(1)}% achieved � On track`} valueClass="text-[#175f54]" />
                <StatCard title="Monthly Top-Ups" value={formatKES(simulator.monthlyContribution)} helper={`Add ${formatKES(2000)} to reach goal faster`} valueClass="text-[#2167d8]" />
                <StatCard title="Target Date" value={targetDate} helper={`${toNumber(simulator.durationYears)} yrs horizon`} valueClass="text-[#8b5cf6]" />
            </section>

            <section className="rounded-[1.1rem] border border-primary-100 bg-white p-1 shadow-sm"><div className="flex flex-wrap gap-2"><TabButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')}>My Portfolio</TabButton><TabButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')}>Explore Products</TabButton><TabButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')}>Simulator</TabButton></div></section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Total Invested" value={formatKES(totals.totalInvested)} valueClass="text-primary-700" />
                <MetricCard title="Total Returns" value={`${totals.totalGainLoss >= 0 ? '+' : '-'}${formatKES(Math.abs(totals.totalGainLoss))}`} valueClass={totals.totalGainLoss >= 0 ? 'text-[#175f54]' : 'text-rose-500'} />
                <MetricCard title="Portfolio Return" value={`${totals.totalInvested > 0 ? ((totals.totalGainLoss / Math.max(totals.totalInvested, 1)) * 100).toFixed(1) : '0.0'}%`} valueClass="text-primary-700" />
                <MetricCard title="Annualised Return" value={`${totals.annualisedReturn.toFixed(1)}% p.a.`} valueClass="text-[#8b5cf6]" />
            </section>

            {activeTab === 'portfolio' && (
                <div className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between"><PanelHeading icon={WalletCards} title={`Portfolio Overview - ${formatKES(totals.totalValue)}`} noMargin /><button type="button" onClick={openRebalanceModal} className="text-sm font-semibold text-[#175f54]">Rebalance</button></div>
                            <div className="mb-4 h-3 overflow-hidden rounded-full bg-[#edf5f2]"><div className="flex h-3 w-full">{allocation.length > 0 ? allocation.map((item) => <div key={item.label} style={{ width: `${item.percent}%`, backgroundColor: item.color }} className="h-3 border-r border-white last:border-r-0" />) : <div className="h-3 w-full bg-slate-300" />}</div></div>
                            {loading ? (
                                <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading portfolio...</div>
                            ) : investmentAssets.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">No investments yet. Click + New Investment to begin.</p>
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                                    <div className="flex items-center justify-center"><div className="flex h-36 w-36 items-center justify-center rounded-full border-[14px] border-[#19725f] text-center text-sm font-bold text-slate-900 shadow-sm">KES<br />{(totals.totalValue / 1000000).toFixed(1)}M</div></div>
                                    <div className="space-y-2">{allocation.map((item) => <LegendRow key={item.label} color={item.color} label={item.label} value={`${item.percent.toFixed(1)}%`} />)}</div>
                                </div>
                            )}
                            <div className="mt-5 border-t border-slate-200 pt-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">Overall Risk Profile</p><span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Moderate</span></div><p className="mt-2 text-sm text-slate-500">Your portfolio is well-diversified. Consider adding more growth assets to reach your long-term target faster.</p></div>
                        </article>

                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Trophy} title="Performance Summary" />
                            <div className="mt-4 rounded-[1rem] bg-[#165747] px-5 py-6 text-center text-white"><p className="text-xs uppercase tracking-[0.18em] text-white/70">Portfolio Total Return</p><p className="mt-2 text-[3rem] font-extrabold leading-none text-[#f4c95d]">{totals.totalInvested > 0 ? ((totals.totalGainLoss / Math.max(totals.totalInvested, 1)) * 100).toFixed(1) : '0.0'}%</p><p className="mt-2 text-sm text-white/80">{formatKES(totals.totalInvested)} invested to {formatKES(totals.totalValue)} today</p></div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoMiniCard label="This Month" value={formatKES(Math.max(totals.totalGainLoss * 0.12, 0))} helper="Latest change" valueClass="text-[#175f54]" /><InfoMiniCard label="This Year (YTD)" value={formatKES(Math.max(totals.totalGainLoss * 0.55, 0))} helper="Year to date" valueClass="text-[#175f54]" /></div>
                            <div className="mt-5 space-y-3"><p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">Returns by Asset Class</p>{allocation.length > 0 ? allocation.map((item) => <AssetReturnRow key={item.label} label={item.label} color={item.color} value={`+${(Math.max(item.percent / 3.4, 0)).toFixed(1)}%`} width={Math.min(item.percent * 1.6, 100)} />) : <p className="text-sm text-slate-500">Add holdings to see return contributions.</p>}</div>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between"><PanelHeading icon={WalletCards} title="Investment Holdings" noMargin /><button type="button" onClick={() => setShowTypeModal(true)} className="text-sm font-semibold text-[#175f54]">+ Add Holding</button></div>
                            <div className="space-y-4">{investmentAssets.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">No holdings yet. Add an investment to start building your portfolio.</p> : investmentAssets.map((asset) => <HoldingCard key={asset.uuid} asset={asset} deleting={deletingAssetId === asset.uuid} onDelete={() => handleDeleteInvestment(asset)} onTopUp={() => setShowTypeModal(true)} />)}</div>
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Sparkles} title="Buddy AI Portfolio Insights" /> <div className="mt-4 space-y-3">{portfolioInsights.map((item) => <InsightCard key={item.title} title={item.title} text={item.text} tone={item.tone} />)}<button type="button" onClick={() => onSelectSection && onSelectSection('buddy')} className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-[#eef8f3] px-4 py-3 text-sm font-semibold text-[#175f54]">Chat with Buddy AI<ArrowRight size={14} /></button></div></article>
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><PanelHeading icon={Eye} title="Watchlist" noMargin /><button type="button" onClick={() => onSelectSection && onSelectSection('comparehub')} className="text-sm font-semibold text-[#175f54]">+ Add</button></div><div className="space-y-3">{WATCHLIST_ITEMS.map((item) => <WatchlistRow key={item.name} {...item} />)}</div></article>
                        </div>
                    </section>

                    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><PanelHeading icon={WalletCards} title="Recent Investment Activity" noMargin /><button type="button" className="text-sm font-semibold text-[#175f54]">Export</button></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-emerald-100 text-left text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]"><th className="py-3 pr-4 font-semibold">Date</th><th className="py-3 pr-4 font-semibold">Asset</th><th className="py-3 pr-4 font-semibold">Type</th><th className="py-3 pr-4 font-semibold">Amount</th><th className="py-3 pr-4 font-semibold">Units / Details</th><th className="py-3 font-semibold">Status</th></tr></thead><tbody>{activityRows.length > 0 ? activityRows.map((row) => <tr key={row.id} className="border-b border-slate-100 last:border-b-0"><td className="py-3 pr-4 text-slate-500">{formatDate(row.date)}</td><td className="py-3 pr-4 font-medium text-slate-900">{row.asset}</td><td className="py-3 pr-4"><span className="inline-flex rounded-full bg-[#eef8f3] px-2.5 py-1 text-xs font-semibold text-[#175f54]">{row.type}</span></td><td className="py-3 pr-4 font-semibold text-[#175f54]">{row.amount}</td><td className="py-3 pr-4 text-slate-700">{row.details}</td><td className="py-3"><span className="inline-flex rounded-full bg-[#eef8f3] px-2.5 py-1 text-xs font-semibold text-[#175f54]">{row.status}</span></td></tr>) : <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">No activity yet. Add or update investments to populate this table.</td></tr>}</tbody></table></div></section>

                    <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#0a4d37] via-[#117f5a] to-[#14986b] p-5 text-white shadow-sm">
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

            {activeTab === 'explore' && (<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{WATCHLIST_ITEMS.map((item) => <ExploreProductCard key={item.name} {...item} onCompare={() => onSelectSection && onSelectSection('comparehub')} />)}</section>)}

            {activeTab === 'simulator' && (<section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]"><article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Sparkles} title="Investment Simulator" /><p className="mt-3 text-sm text-slate-600">Test how faster top-ups and returns could get you to your target portfolio.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><TextField type="number" label="Monthly Contribution" value={simulator.monthlyContribution} onChange={(value) => setSimulator((c) => ({ ...c, monthlyContribution: value }))} /><TextField type="number" label="Duration (Years)" value={simulator.durationYears} onChange={(value) => setSimulator((c) => ({ ...c, durationYears: value }))} /><TextField type="number" label="Expected Return (%)" value={simulator.expectedReturn} onChange={(value) => setSimulator((c) => ({ ...c, expectedReturn: value }))} /><TextField type="number" label="Target Amount (KES)" value={simulator.targetAmount} onChange={(value) => setSimulator((c) => ({ ...c, targetAmount: value }))} /></div><div className="mt-5 rounded-[1rem] border border-amber-200 bg-[linear-gradient(180deg,_#f7fbf8_0%,_#fff4df_100%)] p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9bb8af]">Projected Portfolio Value</p><p className="mt-2 text-[2.6rem] font-extrabold leading-none text-[#175f54]">{formatKES(projectedValue)}</p><p className="mt-2 text-sm text-slate-600">Target progress: {targetAmount > 0 ? ((projectedValue / targetAmount) * 100).toFixed(1) : '0.0'}%</p></div></article><article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm"><PanelHeading icon={Trophy} title="Scenario Summary" /><div className="mt-4 space-y-3"><MetricPanel label="Current Portfolio" value={formatKES(totals.totalValue)} valueClass="text-[#175f54]" /><MetricPanel label="Projected Value" value={formatKES(projectedValue)} valueClass="text-[#2167d8]" /><MetricPanel label="Target Date" value={targetDate} valueClass="text-[#8b5cf6]" /><MetricPanel label="Gap To Target" value={formatKES(Math.max(targetAmount - projectedValue, 0))} valueClass="text-rose-500" /><button type="button" onClick={openRebalanceModal} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white">Rebalance Portfolio<ArrowRight size={14} /></button></div></article></section>)}

            {showRebalanceModal && <RebalanceModal allocation={allocation} targetAllocation={targetAllocation} onChangeTarget={handleTargetAllocationChange} onClose={() => setShowRebalanceModal(false)} onSave={handleSaveTargetAllocation} />}

            {showTypeModal && <TypeModal types={INVESTMENT_TYPES} submitting={submitting} onClose={() => setShowTypeModal(false)} onSelect={handleSelectType} />}

            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><div><h3 className="text-xl font-bold text-slate-900">Add {selectedType?.label}</h3><p className="text-sm text-slate-500">Category: {selectedCategory?.name}</p></div><button type="button" onClick={() => setShowFormModal(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6"><TextField label="Investment name" value={formData.name} onChange={(value) => setFormData((c) => ({ ...c, name: value }))} required /><div className="grid gap-4 sm:grid-cols-2"><TextField type="number" label="Current value (KES)" value={formData.current_value} onChange={(value) => setFormData((c) => ({ ...c, current_value: value }))} required /><TextField type="number" label="Purchase value (KES)" value={formData.purchase_value} onChange={(value) => setFormData((c) => ({ ...c, purchase_value: value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><TextField type="date" label="Purchase date" value={formData.purchase_date} onChange={(value) => setFormData((c) => ({ ...c, purchase_date: value }))} /><TextField type="number" label="Interest / Growth rate (%)" value={formData.interest_rate} onChange={(value) => setFormData((c) => ({ ...c, interest_rate: value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><TextField label="Institution" value={formData.institution} onChange={(value) => setFormData((c) => ({ ...c, institution: value }))} /><TextField label="Account / Reference number" value={formData.account_number} onChange={(value) => setFormData((c) => ({ ...c, account_number: value }))} /></div><label className="block text-sm font-medium text-slate-700">Notes<textarea rows={3} value={formData.notes} onChange={(event) => setFormData((c) => ({ ...c, notes: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></label><div className="flex items-center gap-3 pt-2"><button type="submit" disabled={submitting} className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving...' : 'Save Investment'}</button><button type="button" onClick={() => setShowFormModal(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button></div></form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, helper, valueClass, featured = false, progress = 0 }) => (<article className={`rounded-[1.2rem] border border-primary-100 px-4 py-4 shadow-sm ${featured ? 'bg-primary-800 text-white' : 'bg-white'}`}><p className={`text-[11px] font-semibold uppercase tracking-[0.17em] ${featured ? 'text-white/70' : 'text-[#9bb8af]'}`}>{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${featured ? 'text-[#f4c95d]' : valueClass}`}>{value}</p><p className={`mt-2 text-[0.82rem] ${featured ? 'text-white/85' : 'text-slate-500'}`}>{helper}</p>{featured ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#f4c95d]" style={{ width: `${Math.min(progress, 100)}%` }} /></div> : null}</article>);
const MetricCard = ({ title, value, valueClass }) => (<article className="rounded-[1.2rem] border border-primary-100 bg-white px-4 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#9bb8af]">{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${valueClass}`}>{value}</p></article>);
const TabButton = ({ active, onClick, children }) => (<button type="button" onClick={onClick} className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-primary-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>);
const PanelHeading = ({ icon: Icon, title, noMargin = false }) => (<div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-1'}`}><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700"><Icon size={18} /></span><h3 className="dashboard-display-title text-[1.05rem] font-bold text-slate-950">{title}</h3></div>);
const InfoMiniCard = ({ label, value, helper, valueClass }) => (<div className="rounded-[1rem] border border-slate-200 bg-[#f8fcfa] p-4"><p className="text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]">{label}</p><p className={`dashboard-metric-value mt-2 text-[1.38rem] font-extrabold leading-none sm:text-[1.5rem] ${valueClass}`}>{value}</p><p className="mt-2 text-[0.82rem] text-slate-500">{helper}</p></div>);
const MetricPanel = ({ label, value, valueClass }) => (<div className="rounded-[1rem] border border-slate-100 bg-[#f7fbf9] px-4 py-3"><div className="flex items-center justify-between gap-4"><span className="text-sm text-slate-700">{label}</span><span className={`dashboard-metric-value text-[1.08rem] font-extrabold ${valueClass}`}>{value}</span></div></div>);
const LegendRow = ({ color, label, value }) => (<div className="flex items-center justify-between text-sm"><div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} /><span className="text-slate-700">{label}</span></div><span className="font-semibold text-slate-900">{value}</span></div>);
const AssetReturnRow = ({ label, color, value, width }) => (<div><div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-700">{label}</span><span style={{ color }} className="font-semibold">{value}</span></div><div className="h-2.5 rounded-full bg-[#eef5f2]"><div className="h-2.5 rounded-full" style={{ width: `${width}%`, backgroundColor: color }} /></div></div>);
const InsightCard = ({ title, text, tone }) => (<div className={`rounded-[1rem] border p-4 text-sm ${tone}`}><p className="font-semibold">{title}</p><p className="mt-1">{text}</p></div>);
const WatchlistRow = ({ name, meta, value, move, tone }) => (<div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0"><div><p className="text-sm font-semibold text-slate-900">{name}</p><p className="text-xs text-slate-500">{meta}</p></div><div className="text-right"><p className={`text-sm font-extrabold ${tone}`}>{value}</p><p className={`text-xs ${tone}`}>{move}</p></div></div>);
const ExploreProductCard = ({ name, meta, value, move, tone, onCompare }) => (<article className="rounded-[1.2rem] border border-emerald-100 bg-white p-5 shadow-sm"><p className="text-lg font-bold text-slate-950">{name}</p><p className="mt-1 text-sm text-slate-500">{meta}</p><div className="mt-4 flex items-center justify-between"><p className={`text-2xl font-extrabold ${tone}`}>{value}</p><span className={`text-sm font-semibold ${tone}`}>{move}</span></div><button type="button" onClick={onCompare} className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]">Open Compare Hub<ArrowRight size={14} /></button></article>);
const HoldingCard = ({ asset, deleting, onDelete, onTopUp }) => { const gain = Number(asset.gainLoss || 0); const rate = Number(asset.raw?.interest_rate || 0); const tone = asset.typeMeta.color; const purchaseValue = Number(asset.purchaseValue || asset.currentValue || 0); const progress = purchaseValue > 0 ? Math.min((Number(asset.currentValue || 0) / purchaseValue) * 100, 100) : 0; return (<div className="rounded-[1.1rem] border border-emerald-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[1.1rem] font-bold text-slate-900">{asset.name}</p><p className="mt-1 text-sm text-slate-500">{asset.institution || asset.categoryName || 'Investment holding'} <span className="ml-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${tone}18`, color: tone }}>{asset.typeMeta.tag}</span></p></div><div className="text-left sm:text-right"><p className="text-[2rem] font-extrabold leading-none text-slate-900">{formatKES(asset.currentValue)}</p><p className={`mt-1 text-sm font-semibold ${gain >= 0 ? 'text-[#175f54]' : 'text-rose-500'}`}>{gain >= 0 ? '+' : '-'}{formatKES(Math.abs(gain))} {purchaseValue > 0 ? `(${(((Number(asset.currentValue || 0) - purchaseValue) / purchaseValue) * 100).toFixed(1)}%)` : ''}</p></div></div><div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">Return p.a.</span><span className="font-semibold" style={{ color: tone }}>{rate ? `${rate.toFixed(1)}%` : `${(Math.max(progress / 7, 0)).toFixed(1)}%`}</span></div><div className="h-2.5 rounded-full bg-[#edf5f2]"><div className="h-2.5 rounded-full" style={{ width: `${Math.max(Math.min(progress, 100), 10)}%`, backgroundColor: tone }} /></div></div><p className="mt-3 text-sm text-slate-500">{asset.purchaseDate ? `Started ${formatDate(asset.purchaseDate)}` : 'Recently added'} � {asset.isLiquid ? 'Liquid' : 'Long-term'} � {asset.lastValuedDate ? `Updated ${formatDate(asset.lastValuedDate)}` : 'Awaiting first update'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onTopUp} className="rounded-[0.9rem] border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-sm font-semibold text-[#175f54]">+ Top Up</button><button type="button" onClick={onDelete} disabled={deleting} className="rounded-[0.9rem] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete'}</button></div></div>); };
const TypeModal = ({ types, submitting, onClose, onSelect }) => (<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between rounded-t-2xl bg-primary-700 px-5 py-4 text-white"><h3 className="text-xl font-bold">Select Investment Type</h3><button type="button" onClick={onClose} className="rounded-lg p-1 text-white/90 hover:bg-white/10"><X size={22} /></button></div><div className="space-y-3 p-5">{types.map((type) => <button key={type.id} type="button" disabled={submitting} onClick={() => onSelect(type)} className="flex w-full items-center gap-3 rounded-xl bg-primary-600 px-4 py-3 text-left text-base font-semibold text-white hover:bg-primary-700 disabled:opacity-60"><type.icon size={18} />{`Add ${type.label}`}</button>)}</div></div></div>);
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
const TextField = ({ label, value, onChange, type = 'text', required = false }) => (<label className="block text-sm font-medium text-slate-700">{label}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" /></label>);
const formatDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };

export default InvestmentTracker;
