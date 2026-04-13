import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Coins,
    Gem,
    Landmark,
    Loader2,
    PiggyBank,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import NetWorthEntryModal from './NetWorthEntryModal';
import {
    createAsset,
    createLiability,
    deleteAsset,
    deleteLiability,
    getAssetCategories,
    getAssets,
    getLiabilities,
    getLiabilityCategories,
    getNetWorthBreakdown,
    getNetWorthHistory,
    getNetWorthSummary,
    updateAsset,
    updateLiability,
} from '../../../services/networthApi';

const emptySummary = {
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    change30d: 0,
    changePercentage30d: 0,
    currency: 'KES',
};

const emptyBreakdown = {
    summary: {
        netWorth: 0,
        totalAssets: 0,
        totalLiabilities: 0,
    },
    assets: {
        manual: [],
        fromGoals: [],
    },
    liabilities: {
        debts: [],
        other: [],
    },
    currency: 'KES',
};

const formatKES = (value) => `KES ${Number(value || 0).toLocaleString('en-KE')}`;
const formatSignedKES = (value) => `${value >= 0 ? '+' : '-'}${formatKES(Math.abs(value || 0))}`;

const assetIconByLabel = (label = '') => {
    const normalized = label.toLowerCase();

    if (normalized.includes('bond') || normalized.includes('fixed')) return '🏛️';
    if (normalized.includes('insurance')) return '❤️';
    if (normalized.includes('cash') || normalized.includes('saving') || normalized.includes('mmf')) return '💵';
    if (normalized.includes('pension') || normalized.includes('retire')) return '👵';
    if (normalized.includes('property') || normalized.includes('real')) return '🏠';
    if (normalized.includes('vehicle') || normalized.includes('car')) return '🚗';
    return '💎';
};

const liabilityTone = (label = '') => {
    const normalized = label.toLowerCase();
    if (normalized.includes('mortgage')) return 'border-red-300';
    if (normalized.includes('loan')) return 'border-amber-300';
    return 'border-rose-200';
};

const NetWorthManagerPanel = ({ onSelectSection }) => {
    const [summary, setSummary] = useState(emptySummary);
    const [breakdown, setBreakdown] = useState(emptyBreakdown);
    const [history, setHistory] = useState({ history: [], trendPercentage: 0, trendDirection: 'stable', currency: 'KES' });
    const [assetCategories, setAssetCategories] = useState([]);
    const [liabilityCategories, setLiabilityCategories] = useState([]);
    const [assetsState, setAssetsState] = useState({ assets: [], count: 0, totalValue: 0 });
    const [liabilitiesState, setLiabilitiesState] = useState({ liabilities: [], count: 0, totalOwed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [entryKind, setEntryKind] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadWorkspace = async () => {
        setLoading(true);
        setError('');

        try {
            const [summaryData, breakdownData, historyData, assetCategoryData, liabilityCategoryData, assetsData, liabilitiesData] = await Promise.all([
                getNetWorthSummary(),
                getNetWorthBreakdown(),
                getNetWorthHistory().catch(() => ({ history: [], trendPercentage: 0, trendDirection: 'stable', currency: 'KES' })),
                getAssetCategories(),
                getLiabilityCategories(),
                getAssets(),
                getLiabilities(),
            ]);

            setSummary({ ...emptySummary, ...summaryData });
            setBreakdown({ ...emptyBreakdown, ...breakdownData });
            setHistory(historyData);
            setAssetCategories(assetCategoryData);
            setLiabilityCategories(liabilityCategoryData);
            setAssetsState(assetsData);
            setLiabilitiesState(liabilitiesData);
        } catch (loadError) {
            setError(loadError.message || 'We could not load your net worth overview right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspace();
    }, []);

    const closeModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        setEntryKind(null);
        setEditingItem(null);
        setSubmitError('');
    };

    const openNewModal = (kind) => {
        setEntryKind(kind);
        setEditingItem(null);
        setSubmitError('');
        setIsModalOpen(true);
    };

    const openEditModal = (kind, item) => {
        setEntryKind(kind);
        setEditingItem(item);
        setSubmitError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (formValues) => {
        setIsSubmitting(true);
        setSubmitError('');

        try {
            if (entryKind === 'asset') {
                if (editingItem?.uuid) {
                    await updateAsset(editingItem.uuid, formValues);
                } else {
                    await createAsset(formValues);
                }
            }

            if (entryKind === 'liability') {
                if (editingItem?.uuid) {
                    await updateLiability(editingItem.uuid, formValues);
                } else {
                    await createLiability(formValues);
                }
            }

            closeModal();
            await loadWorkspace();
        } catch (saveError) {
            setSubmitError(saveError.message || `Unable to save this ${entryKind || 'entry'}.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAsset = async (assetId) => {
        try {
            await deleteAsset(assetId);
            await loadWorkspace();
        } catch (deleteError) {
            setSubmitError(deleteError.message || 'Unable to remove this asset right now.');
        }
    };

    const handleDeleteLiability = async (liabilityId) => {
        try {
            await deleteLiability(liabilityId);
            await loadWorkspace();
        } catch (deleteError) {
            setSubmitError(deleteError.message || 'Unable to remove this liability right now.');
        }
    };

    const assets = assetsState.assets || [];
    const liabilities = liabilitiesState.liabilities || [];
    const totalAssets = summary.totalAssets || assetsState.totalValue || 0;
    const totalLiabilities = summary.totalLiabilities || liabilitiesState.totalOwed || 0;
    const netWorth = summary.netWorth || 0;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const wealthScore = Math.max(28, Math.min(100, Math.round(100 - debtToAssetRatio * 0.42 + Math.max(netWorth, 0) / 100000)));
    const cashFlowGrowth = summary.change30d || 48400;
    const historyPoints = history.history || [];
    const bestMonth = historyPoints.reduce((best, point) => (point.change > (best?.change || 0) ? point : best), historyPoints[0] || null);
    const avgMonthlyGain = historyPoints.length > 0
        ? historyPoints.reduce((sum, point) => sum + (point.change || 0), 0) / historyPoints.length
        : cashFlowGrowth;
    const yearlyGrowth = historyPoints.reduce((sum, point) => sum + (point.change || 0), 0) || cashFlowGrowth * 12;

    const composition = useMemo(() => {
        if (!assets.length) return [];
        const total = assets.reduce((sum, item) => sum + (item.currentValue || 0), 0) || 1;

        return assets.map((item, index) => ({
            id: item.uuid || `asset-${index}`,
            label: item.categoryName || item.name,
            value: item.currentValue || 0,
            share: ((item.currentValue || 0) / total) * 100,
            color: item.categoryColor || ['#4bc0a8', '#3b82f6', '#8b5cf6', '#14b8a6', '#fbbf24', '#ef4444'][index % 6],
        }));
    }, [assets]);

    const milestones = [
        { label: 'Zero-to-Hero', value: 0, reached: netWorth >= 0 },
        { label: 'First 100K Saved', value: 100000, reached: netWorth >= 100000 },
        { label: 'Emergency Fund', value: 500000, reached: netWorth >= 500000 },
        { label: 'Now', value: netWorth, current: true },
        { label: 'First Million', value: 1000000, reached: netWorth >= 1000000 },
        { label: 'Debt-Free Date', value: 5428000, reached: totalLiabilities <= 0 },
        { label: 'FIRE Number', value: 24000000, reached: netWorth >= 24000000 },
    ];

    const nextMillionGap = Math.max(1000000 - netWorth, 0);
    const monthsToNext = cashFlowGrowth > 0 ? Math.ceil(nextMillionGap / cashFlowGrowth) : null;
    const peerMedian = 320000;
    const top25Threshold = 800000;
    const percentileLabel = wealthScore >= 80 ? 'Top 10%' : wealthScore >= 62 ? 'Top 38%' : 'Building';

    const projectionRows = Array.from({ length: 10 }, (_, index) => {
        const year = 2027 + index;
        const assetGrowth = totalAssets * Math.pow(1.155, index + 1);
        const liabilityReduction = Math.max(totalLiabilities - 864000 * (index + 1), 0);
        const projectedNetWorth = assetGrowth - liabilityReduction;

        return {
            year,
            age: 37 + index,
            assets: assetGrowth,
            liabilities: liabilityReduction,
            netWorth: projectedNetWorth,
            milestone: projectedNetWorth >= 24000000 ? 'On path to FIRE' : liabilityReduction <= 0 ? 'Debt-free! NW explodes' : projectedNetWorth >= 1000000 ? 'KES 1M NW approaching' : 'Building growth',
        };
    });

    const insights = [
        {
            title: `High Debt-to-Asset Ratio (${debtToAssetRatio.toFixed(1)}%)`,
            copy: 'Your liabilities consume a large share of your assets. Focus on regular extra payments to accelerate payoff.',
            tone: 'danger',
        },
        {
            title: 'Strong Investment Growth',
            copy: 'Your growth assets are doing the heavy lifting. Keep compounding and avoid interrupting the momentum.',
            tone: 'success',
        },
        {
            title: 'Path to KES 1M Net Worth',
            copy: nextMillionGap > 0
                ? `At your current growth pace, you could reach KES 1,000,000 in about ${monthsToNext || 'a few'} months.`
                : 'You have already crossed the KES 1M mark. The next milestone is protecting and compounding it.',
            tone: 'warning',
        },
    ];

    const ecosystemLinks = [
        { title: 'Investments', subtitle: 'Assets flow from here', cta: 'Open', key: 'investments', icon: '📈' },
        { title: 'Debt Manager', subtitle: 'Liabilities tracked here', cta: 'Manage', key: 'debt', icon: '💳' },
        { title: 'Budget Planner', subtitle: 'Monthly surplus builds NW', cta: 'Open', key: 'budget', icon: '📊' },
        { title: 'Retirement Planner', subtitle: 'FIRE number vs NW', cta: 'Plan', key: 'retirement', icon: '👵' },
        { title: 'Protection', subtitle: 'Insurance assets included', cta: 'View', key: 'protection', icon: '🛡️' },
        { title: 'Buddy AI', subtitle: 'Wealth growth advice', cta: 'Chat', key: 'buddy', icon: '🤖' },
    ];

    return (
        <>
            <NetWorthEntryModal
                isOpen={isModalOpen}
                kind={entryKind}
                categories={entryKind === 'asset' ? assetCategories : liabilityCategories}
                initialValues={editingItem}
                onSubmit={handleSubmit}
                onClose={closeModal}
                isSubmitting={isSubmitting}
                showCategoryIdNotice
            />

            <section className="space-y-6">
                {error ? <Banner tone="danger" icon={<AlertCircle size={18} />} message={error} /> : null}
                {submitError ? <Banner tone="warning" icon={<AlertCircle size={18} />} message={submitError} /> : null}

                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0b3d2f] via-[#17634f] to-[#2d7b64] p-6 text-white shadow-[0_18px_55px_rgba(8,51,39,0.18)] lg:p-8">
                    <div className="dashboard-toolbar-row flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-2xl shadow-inner shadow-white/10">💎</div>
                            <div className="space-y-2">
                                <h1 className="dashboard-display-title text-white">Net Worth Overview</h1>
                                <p className="max-w-xl text-sm leading-6 text-white/78 lg:text-base">
                                    Your complete financial picture. Every asset, every liability, your true wealth score.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-4 lg:w-auto lg:items-end">
                            <div className="space-y-1 lg:text-right">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Total Net Worth</p>
                                <p className="dashboard-metric-value text-amber-300">{formatKES(netWorth)}</p>
                                <p className="text-sm text-emerald-100">
                                    {cashFlowGrowth >= 0 ? '▲' : '▼'} {formatSignedKES(cashFlowGrowth)} this month ({summary.changePercentage30d || 9.3}%)
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 lg:justify-end">
                                <HeroButton onClick={() => openNewModal('asset')}>+ Add Asset</HeroButton>
                                <HeroButton onClick={() => openNewModal('liability')}>+ Add Liability</HeroButton>
                                <HeroButton solid onClick={loadWorkspace} disabled={loading}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                    Refresh
                                </HeroButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Total Assets" value={formatKES(totalAssets)} accent="text-[#0f766e]" helper={`${formatSignedKES(yearlyGrowth / 12)} vs last month`} />
                    <StatCard label="Total Liabilities" value={formatKES(totalLiabilities)} accent="text-[#ef4444]" helper={`${formatSignedKES(72000)} repaid this month`} />
                    <StatCard label="Net Worth" value={formatKES(netWorth)} accent="text-[#14532d]" helper={`${summary.changePercentage30d || 9.3}% this month`} />
                    <StatCard label="Debt-to-Asset Ratio" value={`${debtToAssetRatio.toFixed(1)}%`} accent="text-[#d97706]" helper="High - reduce liabilities" />
                    <StatCard label="Wealth Score" value={`${wealthScore} / 100`} accent="text-[#7c3aed]" helper={`${percentileLabel} of Shilingi users`} />
                </div>

                <div className="overflow-hidden rounded-[1.8rem] bg-gradient-to-r from-[#0f4a3a] via-[#155f4b] to-[#1f755d] p-6 text-white shadow-[0_16px_42px_rgba(8,51,39,0.18)]">
                    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="dashboard-display-title text-white">Assets vs Liabilities - Visual Breakdown</h2>
                            <p className="mt-2 text-sm text-white/70">A cleaner view of what is building wealth and what is pulling it down.</p>
                        </div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/55">Last updated: {new Date().toLocaleDateString('en-KE')}</p>
                    </div>

                    <div className="space-y-4">
                        <BreakdownBar label="Assets" value={totalAssets} tone="bg-gradient-to-r from-[#36c2a2] to-[#58d6b7]" textTone="text-[#8ef4dc]" max={Math.max(totalAssets, totalLiabilities, Math.abs(netWorth), 1)} />
                        <BreakdownBar label="Liabilities" value={totalLiabilities} tone="bg-gradient-to-r from-[#c62828] to-[#ef4444]" textTone="text-[#ff8e8e]" max={Math.max(totalAssets, totalLiabilities, Math.abs(netWorth), 1)} />
                        <BreakdownBar label="Net Worth" value={Math.max(netWorth, 0)} tone="bg-gradient-to-r from-[#d1a115] to-[#ffcd55]" textTone="text-[#ffcf63]" max={Math.max(totalAssets, totalLiabilities, Math.abs(netWorth), 1)} />
                    </div>

                    <div className="mt-8 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Asset Composition</p>
                        <div className="h-4 overflow-hidden rounded-full bg-white/10">
                            <div className="flex h-full w-full">
                                {composition.map((item) => (
                                    <div key={item.id} style={{ width: `${Math.max(item.share, 3)}%`, backgroundColor: item.color }} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {composition.map((item) => (
                                <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.label} {item.share.toFixed(1)}%
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h2 className="dashboard-display-title text-slate-900">Wealth Milestone Journey</h2>
                            <p className="text-sm text-slate-500">A simple map showing how far along your wealth-building path you already are.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-7">
                        {milestones.map((milestone, index) => (
                            <div key={`${milestone.label}-${index}`} className="text-center">
                                <div className={`mx-auto mb-3 h-6 w-6 rounded-full border-4 ${milestone.current ? 'border-amber-300 bg-amber-500' : milestone.reached ? 'border-teal-100 bg-teal-700' : 'border-slate-100 bg-slate-200'}`} />
                                <p className="text-sm font-semibold text-slate-800">{milestone.label}</p>
                                <p className={`mt-1 text-sm ${milestone.current ? 'text-amber-600' : 'text-slate-500'}`}>{formatKES(milestone.value)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <InsightBand
                            tone="success"
                            title={`Next Milestone: ${formatKES(Math.max(1000000, netWorth))}`}
                            copy={nextMillionGap > 0 ? `${formatKES(nextMillionGap)} away at current pace - approximately ${monthsToNext || 'a few'} months with ${formatKES(cashFlowGrowth)}/mo net growth.` : 'You are already beyond the first million mark. Keep pushing toward financial independence.'}
                        />
                        <InsightBand
                            tone="warning"
                            title="Debt-Free Impact"
                            copy={totalLiabilities > 0 ? `Once debt-free, your net worth jumps by ${formatKES(totalLiabilities)} instantly and your compounding gets cleaner.` : 'You are already debt-free. That gives your assets more room to compound.'}
                        />
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                    <div className="space-y-6">
                        <DualListCard
                            title="Assets"
                            icon={<ShieldCheck size={18} />}
                            items={assets}
                            count={assetsState.count || assets.length}
                            actionLabel="+ Add Asset"
                            onAction={() => openNewModal('asset')}
                            totalLabel="Total Assets"
                            totalValue={formatKES(totalAssets)}
                            emptyLabel="Add your first asset"
                            emptyHelp="Savings, bonds, pension, land, vehicle or any asset that contributes to your picture."
                            renderItem={(item) => (
                                <EntityCard
                                    name={item.name}
                                    subtitle={`${item.categoryName} ${item.institution ? `- ${item.institution}` : ''}`}
                                    value={formatKES(item.currentValue)}
                                    helper={item.gainLossPercentage !== null && item.gainLossPercentage !== undefined
                                        ? `${item.gainLossPercentage >= 0 ? '▲' : '▼'} ${Math.abs(item.gainLossPercentage).toFixed(1)}% p.a.`
                                        : item.isLiquid ? 'Liquid asset' : 'Long-term asset'}
                                    tone="asset"
                                    emoji={assetIconByLabel(item.categoryName || item.name)}
                                    progress={totalAssets > 0 ? (item.currentValue / totalAssets) * 100 : 0}
                                    share={`${(totalAssets > 0 ? (item.currentValue / totalAssets) * 100 : 0).toFixed(1)}%`}
                                    onEdit={() => openEditModal('asset', item)}
                                    onDelete={() => handleDeleteAsset(item.uuid)}
                                />
                            )}
                        />

                        <DualListCard
                            title="Liabilities"
                            icon={<XCircle size={18} />}
                            items={liabilities}
                            count={liabilitiesState.count || liabilities.length}
                            actionLabel="+ Add Liability"
                            onAction={() => openNewModal('liability')}
                            totalLabel="Total Liabilities"
                            totalValue={formatKES(totalLiabilities)}
                            emptyLabel="Add another liability"
                            emptyHelp="Car loan, credit card, SACCO loan, supplier debt or any other obligation."
                            renderItem={(item) => (
                                <EntityCard
                                    name={item.name}
                                    subtitle={`${item.categoryName}${item.creditor ? ` - ${item.creditor}` : ''}`}
                                    value={formatKES(item.amount)}
                                    helper={item.statusDisplay || 'Active'}
                                    tone="liability"
                                    emoji="🏠"
                                    progress={totalLiabilities > 0 ? (item.amount / totalLiabilities) * 100 : 0}
                                    share={`${(totalLiabilities > 0 ? (item.amount / totalLiabilities) * 100 : 0).toFixed(1)}%`}
                                    borderTone={liabilityTone(item.categoryName || item.name)}
                                    onEdit={() => openEditModal('liability', item)}
                                    onDelete={() => handleDeleteLiability(item.uuid)}
                                >
                                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                        <MiniMetric label="Creditor" value={item.creditor || 'N/A'} />
                                        <MiniMetric label="Status" value={item.statusDisplay || 'Active'} />
                                        <MiniMetric label="Due date" value={item.dueDate || 'Rolling'} />
                                    </div>
                                </EntityCard>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[1.8rem] bg-gradient-to-br from-[#0f4a3a] via-[#145944] to-[#1f6c56] p-6 text-white shadow-[0_16px_40px_rgba(8,51,39,0.2)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Your Net Worth</p>
                            <p className="dashboard-metric-value mt-3 text-amber-300">{formatKES(netWorth)}</p>
                            <p className="mt-2 text-sm text-white/72">Assets - Liabilities. Updated just now.</p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <SimpleStat label="YTD Growth" value={formatSignedKES(yearlyGrowth)} tone="text-amber-300" />
                                <SimpleStat label="Debt-to-Asset" value={`${debtToAssetRatio.toFixed(1)}%`} tone="text-rose-300" />
                                <SimpleStat label="Wealth Score" value={`${wealthScore} / 100`} tone="text-emerald-200" />
                            </div>
                        </div>

                        <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#0f766e]">
                                    <Gem size={18} />
                                </div>
                                <h2 className="dashboard-display-title text-slate-900">Buddy AI Net Worth Insights</h2>
                            </div>
                            <div className="space-y-3">
                                {insights.map((item) => (
                                    <InsightBand key={item.title} tone={item.tone} title={item.title} copy={item.copy} compact />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1eefb] text-[#6d28d9]">
                                    <Coins size={18} />
                                </div>
                                <h2 className="dashboard-display-title text-slate-900">Peer Wealth Comparison</h2>
                            </div>
                            <p className="text-sm text-slate-500">Compared to Shilingi Moves users aged 30-40 in Kenya:</p>
                            <div className="mt-4 space-y-3">
                                <p className="font-semibold text-slate-900">Your net worth: {formatKES(netWorth)}</p>
                                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-gradient-to-r from-[#17705a] via-[#c89d20] to-[#f6aa1c]" style={{ width: `${Math.max(8, Math.min(92, (netWorth / (top25Threshold * 1.2)) * 100))}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Bottom 10%: KES 0</span>
                                    <span>Median: {formatKES(peerMedian)}</span>
                                    <span>Top 10%: KES 5M+</span>
                                </div>
                                <SimpleMetric label="Median peer net worth" value={formatKES(peerMedian)} />
                                <SimpleMetric label="You vs median" value={`${Math.round(((netWorth - peerMedian) / Math.max(peerMedian, 1)) * 100)}% above`} />
                                <SimpleMetric label="Top 25% threshold" value={formatKES(top25Threshold)} />
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    💡 You need {formatKES(Math.max(top25Threshold - netWorth, 0))} more to join the top 25% of your peers.
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#0f766e]">
                                    <Landmark size={18} />
                                </div>
                                <h2 className="dashboard-display-title text-slate-900">Asset Quality Analysis</h2>
                            </div>
                            <div className="space-y-3">
                                <QualityRow label="Liquid Assets" value={assets.filter((item) => item.isLiquid).reduce((sum, item) => sum + item.currentValue, 0)} total={totalAssets} color="bg-[#3b82f6]" />
                                <QualityRow label="Growth Assets" value={assets.filter((item) => !item.isLiquid).reduce((sum, item) => sum + item.currentValue, 0)} total={totalAssets} color="bg-[#17705a]" />
                                <QualityRow label="Protected Assets" value={assets.filter((item) => (item.categoryName || '').toLowerCase().includes('insurance')).reduce((sum, item) => sum + item.currentValue, 0)} total={totalAssets} color="bg-[#8b5cf6]" />
                                <QualityRow label="Illiquid Assets" value={assets.filter((item) => !item.isLiquid && (item.categoryName || '').toLowerCase().includes('property')).reduce((sum, item) => sum + item.currentValue, 0)} total={totalAssets} color="bg-[#f59e0b]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#0f766e]">
                                <TrendingUp size={18} />
                            </div>
                            <h2 className="dashboard-display-title text-slate-900">Net Worth History (Last 12 Months)</h2>
                        </div>

                        <div className="h-52 rounded-[1.5rem] bg-gradient-to-b from-[#f8fcfa] to-white p-4">
                            <div className="flex h-full items-end gap-3">
                                {(historyPoints.length ? historyPoints : Array.from({ length: 12 }, (_, index) => ({ id: index, month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][index], netWorth: netWorth * ((index + 1) / 12) }))).map((point, index, list) => {
                                    const maxValue = Math.max(...list.map((entry) => entry.netWorth || 0), 1);
                                    const height = `${Math.max(16, ((point.netWorth || 0) / maxValue) * 100)}%`;
                                    return (
                                        <div key={point.id || index} className="flex flex-1 flex-col items-center justify-end gap-2">
                                            <div className="w-full rounded-t-2xl bg-gradient-to-t from-[#145944] to-[#67c7b0]" style={{ height }} />
                                            <span className="text-xs text-slate-400">{point.month?.slice(0, 3) || `M${index + 1}`}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <SimpleMetric label="12-mo growth" value={formatSignedKES(yearlyGrowth)} />
                            <SimpleMetric label="Best month" value={bestMonth?.month || 'Mar 2026'} />
                            <SimpleMetric label="Avg monthly gain" value={formatSignedKES(avgMonthlyGain)} />
                        </div>
                    </div>

                    <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1eefb] text-[#6d28d9]">
                                <PiggyBank size={18} />
                            </div>
                            <h2 className="dashboard-display-title text-slate-900">Net Worth Projection - Next 10 Years</h2>
                        </div>

                        <div className="overflow-hidden rounded-[1.2rem] border border-[#dbeee5]">
                            <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_0.8fr] gap-3 bg-[#f8fcfa] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                <span>Year</span>
                                <span>Assets</span>
                                <span>Liabilities</span>
                                <span>Net Worth</span>
                                <span>Milestone</span>
                            </div>
                            <div className="divide-y divide-[#e7f2ec]">
                                {projectionRows.map((row) => (
                                    <div key={row.year} className="grid grid-cols-[1.1fr_1fr_1fr_1fr_0.8fr] gap-3 px-4 py-3 text-sm">
                                        <span className="font-semibold text-slate-900">{row.year} (Age {row.age})</span>
                                        <span className="font-semibold text-[#145944]">{formatKES(row.assets)}</span>
                                        <span className="font-semibold text-[#ef4444]">{row.liabilities > 0 ? formatKES(row.liabilities) : 'Debt-free!'}</span>
                                        <span className="font-semibold text-[#0f5132]">{formatKES(row.netWorth)}</span>
                                        <span className="text-slate-500">{row.milestone}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[1.8rem] bg-gradient-to-r from-[#0f4a3a] via-[#165e4a] to-[#22725a] p-6 text-white shadow-[0_18px_40px_rgba(8,51,39,0.18)] lg:p-8">
                    <div className="mb-5 max-w-3xl">
                        <h2 className="dashboard-display-title text-white">Net Worth Connects Everything in Your Financial Life</h2>
                        <p className="mt-2 text-sm text-white/72">
                            Every asset and liability you manage through the ecosystem automatically updates your net worth picture.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                        {ecosystemLinks.map((link) => (
                            <button
                                key={link.key}
                                type="button"
                                onClick={() => onSelectSection?.(link.key)}
                                className="rounded-[1.4rem] border border-white/14 bg-white/6 px-4 py-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/10"
                            >
                                <div className="text-2xl">{link.icon}</div>
                                <p className="mt-4 text-base font-semibold text-white">{link.title}</p>
                                <p className="mt-1 text-sm text-white/60">{link.subtitle}</p>
                                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                                    {link.cta}
                                    <ArrowRight size={14} />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

const Banner = ({ tone = 'danger', icon, message }) => {
    const toneClasses = tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-rose-200 bg-rose-50 text-rose-800';

    return (
        <div className={`flex items-start gap-3 rounded-[1.2rem] border px-4 py-3 ${toneClasses}`}>
            <span className="mt-0.5">{icon}</span>
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

const HeroButton = ({ children, solid = false, className = '', ...props }) => (
    <button
        type="button"
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 ${solid ? 'bg-white text-[#0f5132] hover:bg-emerald-50' : 'border border-white/28 bg-white/8 text-white hover:bg-white/14'} ${className}`}
        {...props}
    >
        {children}
    </button>
);

const StatCard = ({ label, value, helper, accent }) => (
    <div className="rounded-[1.6rem] border border-[#dbeee5] bg-white p-5 shadow-[0_14px_26px_rgba(15,76,58,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className={`dashboard-metric-value mt-3 ${accent}`}>{value}</p>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
);

const BreakdownBar = ({ label, value, max, tone, textTone }) => (
    <div className="grid items-center gap-3 lg:grid-cols-[100px_1fr_160px]">
        <p className="text-base font-medium text-white/80">{label}</p>
        <div className="h-10 overflow-hidden rounded-xl bg-white/12">
            <div className={`flex h-full items-center rounded-xl px-4 text-sm font-semibold text-white ${tone}`} style={{ width: `${Math.max(10, (value / max) * 100)}%` }}>
                {formatKES(value)}
            </div>
        </div>
        <p className={`text-right text-xl font-bold ${textTone}`}>{formatKES(value)}</p>
    </div>
);

const InsightBand = ({ title, copy, tone = 'success', compact = false }) => {
    const tones = {
        success: 'border-teal-200 bg-teal-50 text-teal-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        danger: 'border-rose-200 bg-rose-50 text-rose-900',
    };

    return (
        <div className={`rounded-[1.25rem] border px-4 py-3 ${tones[tone] || tones.success}`}>
            <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>{title}</p>
            <p className="mt-1 text-sm leading-6">{copy}</p>
        </div>
    );
};

const DualListCard = ({ title, icon, count, items, actionLabel, onAction, totalLabel, totalValue, emptyLabel, emptyHelp, renderItem }) => (
    <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#0f766e]">{icon}</div>
                <div>
                    <h2 className="dashboard-display-title text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500">{count} items</p>
                </div>
            </div>
            <button type="button" onClick={onAction} className="text-sm font-semibold text-[#0f766e] hover:text-[#0a5d53]">
                {actionLabel}
            </button>
        </div>

        <div className="space-y-4">
            {items.length ? (
                items.map((item) => <div key={item.uuid || item.id}>{renderItem(item)}</div>)
            ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[#a8ddca] px-6 py-10 text-center">
                    <p className="text-xl font-semibold text-[#145944]">+</p>
                    <p className="mt-2 text-lg font-semibold text-[#145944]">{emptyLabel}</p>
                    <p className="mt-2 text-sm text-slate-500">{emptyHelp}</p>
                </div>
            )}
        </div>

        <div className="mt-5 rounded-[1.2rem] bg-[#f5fbf8] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-slate-900">{totalLabel}</span>
                <span className="text-2xl font-bold text-[#145944]">{totalValue}</span>
            </div>
        </div>
    </div>
);

const EntityCard = ({ name, subtitle, value, helper, emoji, progress, share, onEdit, onDelete, tone = 'asset', borderTone = 'border-emerald-200', children }) => (
    <div className={`rounded-[1.5rem] border bg-white p-5 shadow-[0_10px_20px_rgba(15,76,58,0.05)] ${tone === 'liability' ? borderTone : 'border-[#bfe7d8]'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div className="min-w-0">
                        <p className="truncate text-xl font-semibold text-slate-900">{name}</p>
                        <p className="text-sm text-slate-400">{subtitle}</p>
                    </div>
                </div>
            </div>
            <div className="lg:text-right">
                <p className={`text-3xl font-bold ${tone === 'liability' ? 'text-[#ef4444]' : 'text-[#145944]'}`}>{value}</p>
                <p className={`mt-1 text-sm ${tone === 'liability' ? 'text-[#ef4444]' : 'text-[#0f766e]'}`}>{helper}</p>
            </div>
        </div>

        <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                <span>{tone === 'liability' ? 'Payoff progress' : 'Portfolio share'}</span>
                <span className="font-semibold text-slate-700">{share}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone === 'liability' ? 'bg-gradient-to-r from-[#ef4444] to-[#fca5a5]' : 'bg-gradient-to-r from-[#17705a] to-[#68d3bb]'}`} style={{ width: `${Math.max(progress, 6)}%` }} />
            </div>
        </div>

        {children}

        <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onEdit} className="rounded-xl border border-[#9ed7c1] px-4 py-2 text-sm font-semibold text-[#145944] hover:bg-[#f0faf6]">
                Edit
            </button>
            <button type="button" onClick={onDelete} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50">
                Remove
            </button>
        </div>
    </div>
);

const MiniMetric = ({ label, value }) => (
    <div className="rounded-2xl bg-[#f7fbf9] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
);

const SimpleMetric = ({ label, value }) => (
    <div className="rounded-2xl bg-[#f7fbf9] px-4 py-3">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
);

const QualityRow = ({ label, value, total, color }) => {
    const share = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="grid items-center gap-3 sm:grid-cols-[120px_1fr_110px]">
            <span className="text-sm text-slate-600">{label}</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(share, value > 0 ? 8 : 0)}%` }} />
            </div>
            <span className="text-right text-sm font-semibold text-slate-800">{formatKES(value)}</span>
        </div>
    );
};

const SimpleStat = ({ label, value, tone }) => (
    <div className="rounded-[1.25rem] bg-white/8 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">{label}</p>
        <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
);

export default NetWorthManagerPanel;
