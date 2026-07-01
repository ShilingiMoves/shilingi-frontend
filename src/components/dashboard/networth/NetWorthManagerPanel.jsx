import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Gem,
    Loader2,
    PiggyBank,
    RefreshCw,
    ShieldCheck,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import NetWorthEntryModal from './NetWorthEntryModal';
import { useAdaptivePolling } from '../../../hooks/useAdaptivePolling';
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
        connected: [],
    },
    liabilities: {
        debts: [],
        other: [],
    },
    currency: 'KES',
};

const NET_WORTH_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const NET_WORTH_MAX_REFRESH_INTERVAL_MS = 20 * 60 * 1000;

const formatKES = (value) => `KES ${Number(value || 0).toLocaleString('en-KE')}`;
const formatSignedKES = (value) => `${value >= 0 ? '+' : '-'}${formatKES(Math.abs(value || 0))}`;
const formatCompactKES = (value) => {
    const amount = Number(value || 0);
    if (Math.abs(amount) >= 1000000) return `KES ${(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}M`;
    if (Math.abs(amount) >= 1000) return `KES ${Math.round(amount / 1000)}K`;
    return formatKES(amount);
};
const formatSignedCompactKES = (value) => `${value >= 0 ? '+' : '-'}${formatCompactKES(Math.abs(value || 0))}`;
const formatAxisKES = (value) => {
    const amount = Number(value || 0);
    if (Math.abs(amount) >= 1000000) return `KES ${Number((amount / 1000000).toFixed(1)).toLocaleString('en-KE')}M`;
    if (Math.abs(amount) >= 1000) return `KES ${Math.round(amount / 1000).toLocaleString('en-KE')}K`;
    return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
};
const formatSyncDelay = (ms) => {
    if (!ms) return 'soon';
    const minutes = Math.max(1, Math.round(ms / 60000));
    return `${minutes} min`;
};
const getNetWorthSyncCopy = (sync = {}) => {
    if (sync.pausedReason === 'hidden') {
        return { label: 'Paused', detail: 'Resumes when active', dot: 'bg-amber-300' };
    }
    if (sync.pausedReason === 'offline') {
        return { label: 'Offline', detail: 'Refresh waits for connection', dot: 'bg-amber-300' };
    }
    if (sync.isPolling) {
        return { label: 'Syncing', detail: 'Updating your net worth', dot: 'bg-blue-300' };
    }
    if (sync.lastError) {
        return { label: 'Retrying', detail: sync.lastError, dot: 'bg-rose-300' };
    }

    return {
        label: 'Live',
        detail: `Next check in ${formatSyncDelay(sync.nextRunInMs || sync.currentIntervalMs)}`,
        dot: 'bg-emerald-200',
    };
};

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
    const [submitError, setSubmitError] = useState('');
    const [entryKind, setEntryKind] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMobileProjections, setShowMobileProjections] = useState(false);

    const loadWorkspace = useCallback(async ({ quiet = false } = {}) => {
        if (!quiet) {
            setLoading(true);
        }

        try {
            const results = await Promise.allSettled([
                getNetWorthSummary(),
                getNetWorthBreakdown(),
                getNetWorthHistory(),
                getAssetCategories(),
                getLiabilityCategories(),
                getAssets(),
                getLiabilities(),
            ]);
            const [summaryResult, breakdownResult, historyResult, assetCategoryResult, liabilityCategoryResult, assetsResult, liabilitiesResult] = results;

            const nextSummary = { ...emptySummary, ...(summaryResult.status === 'fulfilled' ? summaryResult.value : {}) };
            const nextBreakdown = { ...emptyBreakdown, ...(breakdownResult.status === 'fulfilled' ? breakdownResult.value : {}) };
            const nextHistory = historyResult.status === 'fulfilled' ? historyResult.value : { history: [], trendPercentage: 0, trendDirection: 'stable', currency: 'KES' };
            const nextAssetCategories = assetCategoryResult.status === 'fulfilled' ? assetCategoryResult.value : [];
            const nextLiabilityCategories = liabilityCategoryResult.status === 'fulfilled' ? liabilityCategoryResult.value : [];
            const nextAssetsState = assetsResult.status === 'fulfilled' ? assetsResult.value : { assets: [], count: 0, totalValue: 0 };
            const nextLiabilitiesState = liabilitiesResult.status === 'fulfilled' ? liabilitiesResult.value : { liabilities: [], count: 0, totalOwed: 0 };

            setSummary(nextSummary);
            setBreakdown(nextBreakdown);
            setHistory(nextHistory);
            setAssetCategories(nextAssetCategories);
            setLiabilityCategories(nextLiabilityCategories);
            setAssetsState(nextAssetsState);
            setLiabilitiesState(nextLiabilitiesState);

            return {
                netWorth: nextSummary.netWorth,
                totalAssets: nextSummary.totalAssets,
                totalLiabilities: nextSummary.totalLiabilities,
                change30d: nextSummary.change30d,
                assetCount: nextAssetsState.count || nextAssetsState.assets?.length || 0,
                liabilityCount: nextLiabilitiesState.count || nextLiabilitiesState.liabilities?.length || 0,
                historyCount: nextHistory.history?.length || 0,
                manualAssets: nextBreakdown.assets?.manual?.length || 0,
                connectedGoalAssets: (nextBreakdown.assets?.fromGoals?.length || 0) + (nextBreakdown.assets?.connected?.length || 0),
                connectedDebts: nextBreakdown.liabilities?.debts?.length || 0,
            };
        } catch {
            return null;
        } finally {
            if (!quiet) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadWorkspace();
    }, [loadWorkspace]);

    const sync = useAdaptivePolling({
        enabled: true,
        poll: () => loadWorkspace({ quiet: true }),
        minIntervalMs: NET_WORTH_REFRESH_INTERVAL_MS,
        maxIntervalMs: NET_WORTH_MAX_REFRESH_INTERVAL_MS,
    });

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

    const manualAssets = useMemo(() => assetsState.assets || [], [assetsState.assets]);
    const manualLiabilities = useMemo(() => liabilitiesState.liabilities || [], [liabilitiesState.liabilities]);
    const connectedAssets = useMemo(() => {
        const rows = [
            ...(breakdown.assets?.fromGoals || []),
            ...(breakdown.assets?.connected || []),
        ];

        return rows.map((item, index) => ({
            id: item.id || `connected-asset-${index}`,
            name: item.label,
            categoryName: item.description || 'Connected Planner',
            categoryColor: item.color || '#0c6060',
            currentValue: item.value || 0,
            gainLossPercentage: null,
            isConnected: true,
        }));
    }, [breakdown.assets]);
    const connectedLiabilities = useMemo(() => {
        const rows = [
            ...(breakdown.liabilities?.debts || []),
            ...(breakdown.liabilities?.other || []),
        ];

        return rows.map((item, index) => ({
            id: item.id || `connected-liability-${index}`,
            name: item.label,
            categoryName: item.description || 'Connected Liability',
            creditor: item.description || 'Debt Manager',
            amount: item.value || 0,
            isConnected: true,
        }));
    }, [breakdown.liabilities]);
    const assets = useMemo(() => [...manualAssets, ...connectedAssets], [manualAssets, connectedAssets]);
    const liabilities = useMemo(() => [...manualLiabilities, ...connectedLiabilities], [manualLiabilities, connectedLiabilities]);
    const connectedAssetTotal = assets.reduce((sum, item) => sum + (item.currentValue || item.value || 0), 0);
    const connectedLiabilityTotal = liabilities.reduce((sum, item) => sum + (item.amount || item.value || 0), 0);
    const totalAssets = summary.totalAssets || assetsState.totalValue || connectedAssetTotal || 0;
    const totalLiabilities = summary.totalLiabilities || liabilitiesState.totalOwed || connectedLiabilityTotal || 0;
    const netWorth = summary.netWorth || totalAssets - totalLiabilities;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const cashFlowGrowth = summary.change30d || 48400;
    const historyPoints = history.history || [];
    const bestMonth = historyPoints.reduce((best, point) => (point.change > (best?.change || 0) ? point : best), historyPoints[0] || null);
    const avgMonthlyGain = historyPoints.length > 0
        ? historyPoints.reduce((sum, point) => sum + (point.change || 0), 0) / historyPoints.length
        : cashFlowGrowth;
    const yearlyGrowth = historyPoints.reduce((sum, point) => sum + (point.change || 0), 0) || cashFlowGrowth * 12;

    const composition = useMemo(() => {
        if (!assets.length) return [];
        const palette = ['#0c6060', '#efc43a', '#f28705', '#2f6df6', '#7bc79a', '#8a7bd8', '#ff684b'];
        const grouped = assets.reduce((acc, item) => {
            const value = Number(item.currentValue || item.value || 0);
            if (value <= 0) return acc;
            const label = item.categoryName || item.name || 'Asset';
            const key = label.toLowerCase();
            const existing = acc.get(key) || {
                id: key.replace(/[^a-z0-9]+/g, '-'),
                label,
                value: 0,
                color: item.categoryColor || '',
            };
            existing.value += value;
            if (!existing.color && item.categoryColor) existing.color = item.categoryColor;
            acc.set(key, existing);
            return acc;
        }, new Map());
        const rows = Array.from(grouped.values()).sort((a, b) => b.value - a.value);
        const total = rows.reduce((sum, item) => sum + item.value, 0) || 1;

        return rows.map((item, index) => ({
            ...item,
            share: (item.value / total) * 100,
            color: item.color || palette[index % palette.length],
        }));
    }, [assets]);

    const nextMillionGap = Math.max(1000000 - netWorth, 0);
    const monthsToNext = cashFlowGrowth > 0 ? Math.ceil(nextMillionGap / cashFlowGrowth) : null;

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
            title: debtToAssetRatio > 40 ? `High Debt-to-Asset Ratio (${debtToAssetRatio.toFixed(1)}%)` : `Debt-to-Asset Ratio (${debtToAssetRatio.toFixed(1)}%)`,
            copy: debtToAssetRatio > 40
                ? 'Your liabilities consume a large share of your assets. Focus on regular extra payments to accelerate payoff.'
                : 'Your liabilities are not overwhelming your asset base. Keep repayments consistent and avoid taking on expensive debt.',
            tone: debtToAssetRatio > 40 ? 'danger' : 'success',
        },
        {
            title: assets.length > 0 ? 'Connected Planner Growth' : 'Add Your First Asset',
            copy: assets.length > 0
                ? 'Your investments, retirement funds, goals and protection assets are feeding into this picture. Keep compounding and review asset mix monthly.'
                : 'Add investment, retirement, savings or protection assets so Shilingi can calculate a complete net-worth picture.',
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
        { title: 'Market Watch', subtitle: 'Track signals that affect wealth growth', cta: 'Open', key: 'marketwatch', icon: '📊' },
    ];
    const syncCopy = getNetWorthSyncCopy(sync);

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
                {submitError ? <Banner tone="warning" icon={<AlertCircle size={18} />} message={submitError} /> : null}

                <MobileNetWorthTracker
                    assets={assets}
                    cashFlowGrowth={cashFlowGrowth}
                    composition={composition}
                    debtToAssetRatio={debtToAssetRatio}
                    historyPoints={historyPoints}
                    insights={insights}
                    liabilities={liabilities}
                    loading={loading}
                    netWorth={netWorth}
                    onAddAsset={() => openNewModal('asset')}
                    onAddLiability={() => openNewModal('liability')}
                    onDeleteAsset={handleDeleteAsset}
                    onDeleteLiability={handleDeleteLiability}
                    onEditAsset={(item) => openEditModal('asset', item)}
                    onEditLiability={(item) => openEditModal('liability', item)}
                    onRefresh={loadWorkspace}
                    onToggleProjections={() => setShowMobileProjections((current) => !current)}
                    projectionRows={projectionRows}
                    showProjections={showMobileProjections}
                    sync={sync}
                    summary={summary}
                    totalAssets={totalAssets}
                    totalLiabilities={totalLiabilities}
                    yearlyGrowth={yearlyGrowth}
                />

                <div className="hidden overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] px-4 py-4 text-white shadow-sm md:block sm:px-5">
                    <div className="dashboard-toolbar-row flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#18765e] shadow-inner shadow-white/10">
                                <Gem size={16} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="dashboard-display-title text-[1.38rem] font-extrabold leading-none text-white sm:text-[1.55rem]">Net Worth Tracker</h1>
                                <p className="max-w-xl text-sm leading-6 text-white/78">
                                    Your complete financial picture. Every asset and liability in one clear view.
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
                                <div className="mt-2 inline-flex max-w-[280px] items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-left text-xs text-white/85 backdrop-blur-sm">
                                    <span className={`h-2 w-2 rounded-full ${syncCopy.dot}`} />
                                    <span className="font-semibold">{syncCopy.label}</span>
                                    <span className="truncate text-white/65">{syncCopy.detail}</span>
                                </div>
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

                <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total Assets" value={formatKES(totalAssets)} accent="text-[#18765e]" helper={`${formatSignedKES(yearlyGrowth / 12)} vs last month`} />
                    <StatCard label="Total Liabilities" value={formatKES(totalLiabilities)} accent="text-[#ef4444]" helper={`${formatSignedKES(72000)} repaid this month`} />
                    <StatCard label="Net Worth" value={formatKES(netWorth)} accent="text-[#14532d]" helper={`${summary.changePercentage30d || 9.3}% this month`} />
                    <StatCard label="Debt-to-Asset Ratio" value={`${debtToAssetRatio.toFixed(1)}%`} accent="text-[#d97706]" helper="High - reduce liabilities" />
                </div>

                <div className="hidden overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] p-5 text-white shadow-sm md:block">
                    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="dashboard-display-title text-white">Assets vs Liabilities - Visual Breakdown</h2>
                            <p className="mt-2 text-sm text-white/70">A cleaner view of what is building wealth and what is pulling it down.</p>
                        </div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/55">Last updated: {new Date().toLocaleDateString('en-KE')}</p>
                    </div>

                    <div className="space-y-4">
                        <BreakdownBar label="Assets" value={totalAssets} tone="bg-gradient-to-r from-[#18765e] to-[#38a96b]" textTone="text-[#bdf0d0]" max={Math.max(totalAssets, totalLiabilities, Math.abs(netWorth), 1)} />
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

                <div className="hidden gap-6 md:grid xl:grid-cols-[1.45fr_0.95fr]">
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
                        <div className="rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] p-5 text-white shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Your Net Worth</p>
                            <p className="dashboard-metric-value mt-3 text-amber-300">{formatKES(netWorth)}</p>
                            <p className="mt-2 text-sm text-white/72">Assets - Liabilities. Updated just now.</p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <SimpleStat label="YTD Growth" value={formatSignedKES(yearlyGrowth)} tone="text-amber-300" />
                                <SimpleStat label="Debt-to-Asset" value={`${debtToAssetRatio.toFixed(1)}%`} tone="text-rose-300" />
                            </div>
                        </div>

                        <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#18765e]">
                                    <Gem size={18} />
                                </div>
                                <h2 className="dashboard-display-title text-slate-900">Shilingi Buddy AI Insights</h2>
                            </div>
                            <div className="space-y-3">
                                {insights.map((item) => (
                                    <InsightBand key={item.title} tone={item.tone} title={item.title} copy={item.copy} compact />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="hidden gap-6 md:grid xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.8rem] border border-[#dbeee5] bg-white p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                        <div className="mb-5 flex items-center gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#18765e]">
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
                                            <div className="w-full rounded-t-2xl bg-gradient-to-t from-[#18765e] to-[#38a96b]" style={{ height }} />
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
                                        <span className="font-semibold text-[#18765e]">{formatKES(row.assets)}</span>
                                        <span className="font-semibold text-[#ef4444]">{row.liabilities > 0 ? formatKES(row.liabilities) : 'Debt-free!'}</span>
                                        <span className="font-semibold text-[#18765e]">{formatKES(row.netWorth)}</span>
                                        <span className="text-slate-500">{row.milestone}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] p-5 text-white shadow-sm md:block">
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

const MobileNetWorthTracker = ({
    assets,
    composition,
    debtToAssetRatio,
    historyPoints,
    insights,
    liabilities,
    loading,
    netWorth,
    onAddAsset,
    onAddLiability,
    onDeleteAsset,
    onDeleteLiability,
    onEditAsset,
    onEditLiability,
    onRefresh,
    onToggleProjections,
    projectionRows,
    showProjections,
    summary,
    sync,
    totalAssets,
    totalLiabilities,
    yearlyGrowth,
}) => {
    const assetShare = totalAssets + totalLiabilities > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 80;
    const liabilityShare = 100 - assetShare;
    const topComposition = composition.length
        ? composition.slice(0, 4)
        : [
            { id: 'protection', label: 'Protection Policy', share: 39.1, color: '#0c6060', value: totalAssets * 0.391 },
            { id: 'fixed-income', label: 'Fixed Income Investment', share: 28.02, color: '#efc43a', value: totalAssets * 0.2802 },
            { id: 'retirement', label: 'Retirement Account', share: 23.13, color: '#f28705', value: totalAssets * 0.2313 },
            { id: 'bonds', label: 'Fixed Income Investment', share: 5.03, color: '#2f6df6', value: totalAssets * 0.0503 },
        ];
    const visibleAssets = assets.length ? assets : fallbackMobileAssets(totalAssets);
    const visibleLiabilities = liabilities.length ? liabilities : fallbackMobileLiabilities(totalLiabilities);
    const historyRows = historyPoints.length
        ? historyPoints.slice(-12)
        : Array.from({ length: 12 }, (_, index) => ({
            id: `fallback-${index}`,
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
            netWorth: Math.max(netWorth * ((index + 1) / 12), 0),
            assets: Math.max(totalAssets * (0.55 + index * 0.045), 0),
            liabilities: Math.max(totalLiabilities * (0.9 + index * 0.025), 0),
        }));
    const syncCopy = getNetWorthSyncCopy(sync);

    return (
        <div className="mx-auto max-w-[390px] overflow-hidden rounded-[1.35rem] bg-[#f8f9f8] pb-5 shadow-sm md:hidden">
            <div className="px-4 pt-4">
                <MobileNetWorthHeader />

                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[#dfe8e4] bg-white px-3 py-1.5 text-[0.64rem] text-slate-500 shadow-sm">
                    <span className={`h-1.5 w-1.5 rounded-full ${syncCopy.dot}`} />
                    <span className="font-extrabold text-[#0c6060]">{syncCopy.label}</span>
                    <span className="truncate">{syncCopy.detail}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                    <MobileMetricCard label="Total assets" value={formatCompactKES(totalAssets)} helper={`${formatSignedCompactKES(yearlyGrowth / 12)} vs last month`} tone="text-[#15613f]" />
                    <MobileMetricCard label="Total liabilities" value={formatCompactKES(totalLiabilities)} helper="+KES 72K repaid this month" tone="text-[#1f7a5a]" />
                    <MobileMetricCard label="Net worth" value={formatCompactKES(netWorth)} helper={`${summary.changePercentage30d || 9.3}% this month`} tone="text-[#2563eb]" />
                    <MobileMetricCard label="Debt to asset ratio" value={`${debtToAssetRatio.toFixed(1)}%`} helper={debtToAssetRatio > 45 ? 'High - reduce liabilities' : 'Healthy balance'} tone="text-[#d6891c]" />
                </div>

                <article className="mt-4 rounded-[1rem] border border-[#e7e9e4] bg-white p-4 shadow-sm">
                    <div className="border-b border-[#dde1ea] pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-[0.95rem] font-extrabold tracking-[-0.02em] text-[#0c6060]">Assets Vs Liabilities</h3>
                                <p className="mt-1 text-[0.68rem] leading-4 text-[#8e97ab]">A cleaner view of what is building wealth and what is pulling it down.</p>
                            </div>
                            <span className="shrink-0 pt-1 text-right text-[0.56rem] font-semibold text-[#8e97ab]">Last Update:<br />{new Date().toLocaleDateString('en-KE')}</span>
                        </div>
                    </div>

                    <div className="mt-3 rounded-[0.72rem] bg-[linear-gradient(97deg,_#0c6060_0%,_#8ba14a_62%,_#eabb3a_155%)] p-4 text-white">
                        <p className="text-[0.72rem] font-medium">My Net Worth</p>
                        <p className="mt-1 text-[1.45rem] font-extrabold tracking-[-0.03em]">{formatKES(netWorth)}</p>
                        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/90">
                            <span className="h-full bg-[#0c6060]" style={{ width: `${Math.max(assetShare, 8)}%` }} />
                            <span className="h-full bg-[#eabb3a]" style={{ width: `${Math.max(liabilityShare, totalLiabilities > 0 ? 8 : 0)}%` }} />
                        </div>
                        <div className="mt-3 grid gap-2 text-[0.62rem] font-semibold">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white" />Assets</span>
                                <span>{formatKES(totalAssets)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#eabb3a]" />Liabilities</span>
                                <span>{formatKES(totalLiabilities)}</span>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="mt-3 rounded-[1rem] border border-[#e7e9e4] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[0.82rem] font-extrabold text-slate-900">Asset Composition</h3>
                    </div>
                    <div className="mt-4 inline-flex max-w-full items-center gap-1 rounded-full bg-[#fff4d9] px-3 py-2 text-[0.62rem] font-semibold text-[#292a42]">
                        <span className="shrink-0">Nice</span>
                        <span className="truncate">You are doing great. Keep up</span>
                    </div>
                    <div className="mt-4 grid grid-cols-[112px_1fr] items-center gap-3">
                        <MobilePieChart items={topComposition} />
                        <div className="space-y-2">
                            {topComposition.map((item) => (
                                <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-2 text-[0.68rem]">
                                    <span className="inline-flex min-w-0 items-center gap-2 text-[#292a42]">
                                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="truncate">{item.label}</span>
                                    </span>
                                    <span className="font-semibold text-slate-600">{item.share.toFixed(item.share >= 10 ? 1 : 2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <article className="mt-4 rounded-[1rem] border border-[#e7e9e4] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-[0.96rem] font-extrabold text-[#0c6060]">My Assets <span className="font-semibold text-slate-400">({assets.length})</span></h3>
                        <button type="button" onClick={onAddAsset} className="text-[0.66rem] font-extrabold text-[#d99a00]">+ Add Asset</button>
                    </div>
                    <p className="mt-2 border-b border-[#dfe5e8] pb-3 text-[0.68rem] leading-4 text-slate-500">Here is a list of all your assets that you have added in your profile</p>
                    <div className="mt-4 space-y-3">
                        {visibleAssets.slice(0, 4).map((asset, index) => (
                            <MobileAssetCard
                                asset={asset}
                                index={index}
                                key={asset.uuid || asset.id || asset.name}
                                onDelete={asset.uuid ? () => onDeleteAsset(asset.uuid) : null}
                                onEdit={asset.uuid ? () => onEditAsset(asset) : null}
                                totalAssets={totalAssets}
                            />
                        ))}
                    </div>
                </article>

                <article className="mt-4 rounded-[1rem] border border-[#e7e9e4] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-[0.96rem] font-extrabold text-[#0c6060]">My Liabilities <span className="font-semibold text-slate-400">({liabilities.length})</span></h3>
                        <button type="button" onClick={onAddLiability} className="text-[0.66rem] font-extrabold text-[#d99a00]">+ Add Liability</button>
                    </div>
                    <p className="mt-2 border-b border-[#dfe5e8] pb-3 text-[0.68rem] leading-4 text-slate-500">Here is a list of all your liabilities that you have added in your profile</p>
                    <div className="mt-4 space-y-3">
                        {visibleLiabilities.slice(0, 3).map((liability, index) => (
                            <MobileLiabilityCard
                                index={index}
                                key={liability.uuid || liability.id || `${liability.name}-${index}`}
                                liability={liability}
                                onDelete={liability.uuid ? () => onDeleteLiability(liability.uuid) : null}
                                onEdit={liability.uuid ? () => onEditLiability(liability) : null}
                                totalLiabilities={totalLiabilities}
                            />
                        ))}
                    </div>
                </article>

                <section className="mt-4">
                    <h3 className="text-[0.96rem] font-extrabold text-slate-900">Insights</h3>
                    <p className="text-[0.68rem] text-slate-400">Recommendations for your Net worth growth</p>
                    <div className="mt-3 space-y-3">
                        {insights.map((item) => <MobileInsightCard item={item} key={item.title} />)}
                    </div>
                </section>

                <article className="mt-4 rounded-[1rem] border border-[#e7e9e4] bg-white p-4 shadow-sm">
                    <div className="border-b border-[#dfe5e8] pb-3">
                        <h3 className="text-[0.96rem] font-extrabold text-[#0c6060]">Net Worth History</h3>
                        <p className="mt-2 text-[0.68rem] leading-4 text-slate-500">Here is your net worth trajectory over the last 12 months</p>
                    </div>
                    <MobileHistoryChart rows={historyRows} totalAssets={totalAssets} totalLiabilities={totalLiabilities} netWorth={netWorth} />
                    {showProjections ? (
                        <MobileProjectionPanel rows={projectionRows} />
                    ) : null}
                    <button
                        type="button"
                        onClick={() => {
                            onToggleProjections();
                            if (!showProjections) onRefresh({ quiet: true });
                        }}
                        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[0.55rem] border border-[#d5dfea] bg-white text-[0.66rem] font-semibold text-slate-500"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        {showProjections ? 'Hide Projections' : 'Generate Projections'}
                    </button>
                </article>
            </div>
        </div>
    );
};

const MobileNetWorthHeader = () => (
    <>
        <div className="min-w-0">
            <h2 className="text-[1.08rem] font-extrabold leading-5 text-[#0c6060]">Net Worth Tracker</h2>
            <p className="mt-1 text-[0.68rem] leading-4 text-slate-700">Your complete financial picture. Every asset and liability in one clear view.</p>
        </div>
    </>
);

const MobileMetricCard = ({ label, value, helper, tone }) => (
    <article className="min-h-[96px] rounded-[0.88rem] border border-[#e7e9e4] bg-white p-3 shadow-sm">
        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.095em] text-[#8b998f]">{label}</p>
        <p className={`mt-2 text-[1.08rem] font-extrabold tracking-[-0.02em] ${tone}`}>{value}</p>
        <p className="mt-1 text-[0.6rem] leading-3 text-[#6e7e76]">{helper}</p>
    </article>
);

const fallbackMobileAssets = (totalAssets) => [
    { id: 'nssf', name: 'National Social Security Fund', categoryName: 'Retirement Plan', currentValue: totalAssets || 3500000, gainLossPercentage: 6.5 },
    { id: 'money-market', name: 'Money Market', categoryName: 'Investment Plan', currentValue: Math.max((totalAssets || 2450000) * 0.143, 350000), gainLossPercentage: 17.2 },
];

const fallbackMobileLiabilities = (totalLiabilities) => [
    { id: 'personal-loan-1', name: 'Personal Loan', creditor: 'ABSA Bank', categoryName: 'Loan', amount: totalLiabilities || 350000, installmentAmount: 30000 },
    { id: 'personal-loan-2', name: 'Personal Loan', creditor: 'ABSA Bank', categoryName: 'Loan', amount: totalLiabilities || 350000, installmentAmount: 30000 },
];

const MobilePieChart = ({ items }) => {
    const visibleItems = items.filter((item) => Number(item.share) > 0);
    const totalShare = visibleItems.reduce((sum, item) => sum + Number(item.share || 0), 0) || 1;
    const stops = visibleItems.reduce((acc, item, index) => {
        const start = acc.cumulative;
        const normalizedShare = (Number(item.share || 0) / totalShare) * 100;
        const end = index === visibleItems.length - 1 ? 100 : start + normalizedShare;
        return {
            cumulative: end,
            values: [...acc.values, `${item.color} ${start}% ${end}%`],
        };
    }, { cumulative: 0, values: [] }).values.join(', ');

    return (
        <div className="h-[104px] w-[104px] rounded-full" style={{ background: stops ? `conic-gradient(${stops})` : '#e2e8f0' }}>
            <div className="h-full w-full rounded-full ring-1 ring-white/80" />
        </div>
    );
};

const MobileAssetCard = ({ asset, index, onDelete, onEdit, totalAssets }) => {
    const value = asset.currentValue || asset.value || 0;
    const share = totalAssets > 0 ? (value / totalAssets) * 100 : index === 0 ? 5.6 : 14.3;
    const tag = asset.categoryName || asset.label || 'Investment Plan';
    const gain = asset.gainLossPercentage ?? (index === 0 ? 6.5 : 17.2);

    return (
        <div className="rounded-[1.15rem] border border-[#e6e8ea] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-[#d9f4e4] px-2 py-1 text-[0.56rem] font-extrabold text-[#02a85a]">+ {tag}</span>
                    <p className="mt-2 text-[0.86rem] font-extrabold leading-5 text-[#292a42]">{asset.name || asset.label}</p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[0.58rem] font-semibold text-slate-400">{index === 0 ? 'Active' : `+${formatKES(70000)} (${gain}%)`}</p>
                    <p className="text-[0.8rem] font-extrabold text-[#00a651]">{formatKES(value)}</p>
                    <p className="text-[0.58rem] text-slate-500">{gain}% p.a</p>
                </div>
            </div>
            <MobileShareBar color="#f2bd2f" label="Portfolio Share" share={share} />
            <MobileCardActions onDelete={onDelete} onEdit={onEdit} />
        </div>
    );
};

const MobileLiabilityCard = ({ liability, onDelete, onEdit, totalLiabilities }) => {
    const amount = liability.amount || liability.value || liability.currentBalance || liability.balance || 0;
    const share = totalLiabilities > 0 ? (amount / totalLiabilities) * 100 : 22;

    return (
        <div className="rounded-[1.15rem] border border-[#e6e8ea] bg-white p-4">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e11922] text-[0.46rem] font-black text-white">absa</span>
                <div className="min-w-0 flex-1">
                    <p className="text-[0.58rem] text-slate-500">{liability.creditor || liability.description || 'ABSA Bank'}</p>
                    <p className="truncate text-[0.82rem] font-extrabold text-[#292a42]">{liability.name || liability.label || 'Personal Loan'}</p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[0.56rem] text-slate-500">Installments: {formatKES(liability.installmentAmount || 30000)}</p>
                    <p className="text-[0.82rem] font-extrabold text-[#292a42]">{formatKES(amount)}</p>
                </div>
                <ArrowRight size={15} className="text-slate-400" />
            </div>
            <MobileShareBar color="#ff684b" label="Liability Share" share={share} />
            <MobileCardActions onDelete={onDelete} onEdit={onEdit} />
        </div>
    );
};

const MobileShareBar = ({ color, label, share }) => (
    <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[0.58rem] text-slate-400">
            <span>{label}</span>
            <span className="rounded-full bg-[#e7b52f] px-2 py-0.5 font-bold text-white">{share.toFixed(share >= 10 ? 0 : 1)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#e8eaed]">
            <div className="h-full rounded-full" style={{ width: `${Math.max(share, 8)}%`, backgroundColor: color }} />
        </div>
    </div>
);

const MobileCardActions = ({ onDelete, onEdit }) => (
    <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onEdit || undefined} disabled={!onEdit} className="h-9 rounded-[0.55rem] border border-[#dbe3ee] text-[0.66rem] font-semibold text-slate-500 disabled:opacity-60">Edit</button>
        <button type="button" onClick={onDelete || undefined} disabled={!onDelete} className="h-9 rounded-[0.55rem] border border-[#ffcaca] text-[0.66rem] font-semibold text-[#ff3333] disabled:opacity-60">Delete</button>
    </div>
);

const MobileInsightCard = ({ item }) => {
    const toneMap = {
        danger: { wrap: 'bg-[#fff4e9] text-[#8a3b11]', icon: 'bg-[#ffe2b5] text-[#f97316]', symbol: '!' },
        success: { wrap: 'bg-[#edfff5] text-[#067a3d]', icon: 'bg-[#d7ffe6] text-[#00a651]', symbol: '+' },
        warning: { wrap: 'bg-[#f3edff] text-[#4c2aa8]', icon: 'bg-[#e5d9ff] text-[#6d4bd8]', symbol: '*' },
    };
    const tone = toneMap[item.tone] || toneMap.success;

    return (
        <div className={`flex gap-3 rounded-[0.9rem] p-4 ${tone.wrap}`}>
            <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.9rem] font-black ${tone.icon}`}>{tone.symbol}</span>
            <div>
                <p className="text-[0.82rem] font-extrabold">{item.title}</p>
                <p className="mt-1 text-[0.7rem] leading-4 opacity-85">{item.copy}</p>
            </div>
        </div>
    );
};

const MobileHistoryChart = ({ rows, totalAssets, totalLiabilities, netWorth }) => {
    const normalizedRows = rows.map((row, index) => ({
        id: row.id || `${row.month}-${index}`,
        month: row.month || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index] || `M${index + 1}`,
        netWorth: row.netWorth ?? netWorth * ((index + 1) / Math.max(rows.length, 1)),
        assets: row.assets ?? totalAssets * (0.55 + index * 0.04),
        liabilities: row.liabilities ?? totalLiabilities * (0.72 + index * 0.02),
    }));
    const rawMaxValue = Math.max(...normalizedRows.flatMap((row) => [row.netWorth, row.assets, row.liabilities]), 1);
    const stepBase = rawMaxValue >= 10000000 ? 5000000 : rawMaxValue >= 1000000 ? 1000000 : rawMaxValue >= 100000 ? 100000 : 50000;
    const maxValue = Math.max(Math.ceil(rawMaxValue / stepBase) * stepBase, stepBase);
    const yAxisTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(maxValue * ratio));

    return (
        <div className="mt-5 rounded-[0.95rem] border border-[#dfe5e8] bg-white p-4">
            <div className="grid h-[220px] grid-cols-[46px_1fr] gap-2">
                <div className="flex flex-col justify-between pb-7 text-[0.56rem] font-semibold text-slate-400">
                    {yAxisTicks.map((tick) => (
                        <span key={tick}>{formatAxisKES(tick)}</span>
                    ))}
                </div>
                <div className="relative flex gap-2 border-b border-l border-dashed border-[#dfe5e8] px-2 pb-7">
                    <div className="pointer-events-none absolute inset-x-2 top-0 bottom-7 flex flex-col justify-between">
                        {yAxisTicks.map((tick) => (
                            <span key={tick} className="border-t border-dashed border-[#edf1f4]" />
                        ))}
                    </div>
                    {normalizedRows.map((row, index) => (
                        <div key={row.id} className="relative z-10 flex flex-1 items-end justify-center gap-0.5">
                            <span className="w-[30%] rounded-t-sm bg-[#8a7bd8]" title={`Liabilities ${formatKES(row.liabilities)}`} style={{ height: `${Math.max(3, (row.liabilities / maxValue) * 100)}%` }} />
                            <span className="w-[30%] rounded-t-sm bg-[#7bc79a]" title={`Net worth ${formatKES(row.netWorth)}`} style={{ height: `${Math.max(3, (row.netWorth / maxValue) * 100)}%` }} />
                            <span className="w-[30%] rounded-t-sm bg-[#ffc04f]" title={`Assets ${formatKES(row.assets)}`} style={{ height: `${Math.max(3, (row.assets / maxValue) * 100)}%` }} />
                            {index % 2 === 1 ? <span className="absolute -bottom-6 text-[0.58rem] text-slate-500">{row.month.slice(0, 3)}</span> : null}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-[0.62rem]">
                <span className="inline-flex items-center gap-2 text-[#7bc79a]"><span className="h-3 w-3 rounded-full bg-[#7bc79a]" />Net Worth</span>
                <span className="inline-flex items-center gap-2 text-[#ffc04f]"><span className="h-3 w-3 rounded-full bg-[#ffc04f]" />Assets</span>
                <span className="inline-flex items-center gap-2 text-[#8a7bd8]"><span className="h-3 w-3 rounded-full bg-[#8a7bd8]" />Liabilities</span>
            </div>
        </div>
    );
};

const MobileProjectionPanel = ({ rows }) => {
    const visibleRows = rows.slice(0, 5);
    const finalRow = rows[rows.length - 1] || visibleRows[visibleRows.length - 1];

    return (
        <div className="mt-4 rounded-[0.95rem] border border-[#dfe5e8] bg-[#f8fbfa] p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[0.72rem] font-extrabold text-[#0c6060]">Projected path</p>
                    <p className="mt-1 text-[0.62rem] leading-4 text-slate-500">
                        Based on current assets, liabilities and recent growth.
                    </p>
                </div>
                <span className="rounded-full bg-[#fff4d9] px-2 py-1 text-[0.58rem] font-extrabold text-[#8b6a10]">
                    {finalRow ? formatCompactKES(finalRow.netWorth) : 'KES 0'}
                </span>
            </div>
            <div className="mt-3 space-y-2">
                {visibleRows.map((row) => (
                    <div key={row.year} className="grid grid-cols-[42px_1fr_auto] items-center gap-2 text-[0.62rem]">
                        <span className="font-extrabold text-slate-500">{row.year}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-white">
                            <span
                                className="block h-full rounded-full bg-[#0c6060]"
                                style={{ width: `${Math.max(8, Math.min((row.netWorth / Math.max(finalRow?.netWorth || 1, 1)) * 100, 100))}%` }}
                            />
                        </div>
                        <span className="font-extrabold text-[#0c6060]">{formatCompactKES(row.netWorth)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HeroButton = ({ children, solid = false, className = '', ...props }) => (
    <button
        type="button"
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 ${solid ? 'bg-white text-[#18765e] hover:bg-emerald-50' : 'border border-white/28 bg-white/8 text-white hover:bg-white/14'} ${className}`}
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
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef8f3] text-[#18765e]">{icon}</div>
                <div>
                    <h2 className="dashboard-display-title text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500">{count} items</p>
                </div>
            </div>
            <button type="button" onClick={onAction} className="text-sm font-semibold text-[#18765e] hover:text-[#1b8a64]">
                {actionLabel}
            </button>
        </div>

        <div className="space-y-4">
            {items.length ? (
                items.map((item) => <div key={item.uuid || item.id}>{renderItem(item)}</div>)
            ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[#a8ddca] px-6 py-10 text-center">
                    <p className="text-xl font-semibold text-[#18765e]">+</p>
                    <p className="mt-2 text-lg font-semibold text-[#18765e]">{emptyLabel}</p>
                    <p className="mt-2 text-sm text-slate-500">{emptyHelp}</p>
                </div>
            )}
        </div>

        <div className="mt-5 rounded-[1.2rem] bg-[#f5fbf8] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-slate-900">{totalLabel}</span>
                <span className="text-2xl font-bold text-[#18765e]">{totalValue}</span>
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
                <p className={`text-3xl font-bold ${tone === 'liability' ? 'text-[#ef4444]' : 'text-[#18765e]'}`}>{value}</p>
                <p className={`mt-1 text-sm ${tone === 'liability' ? 'text-[#ef4444]' : 'text-[#1b8a64]'}`}>{helper}</p>
            </div>
        </div>

        <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                <span>{tone === 'liability' ? 'Payoff progress' : 'Portfolio share'}</span>
                <span className="font-semibold text-slate-700">{share}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${tone === 'liability' ? 'bg-gradient-to-r from-[#ef4444] to-[#fca5a5]' : 'bg-gradient-to-r from-[#18765e] to-[#38a96b]'}`} style={{ width: `${Math.max(progress, 6)}%` }} />
            </div>
        </div>

        {children}

        <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onEdit} className="rounded-xl border border-[#9ed7c1] px-4 py-2 text-sm font-semibold text-[#18765e] hover:bg-[#f0faf6]">
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

const SimpleStat = ({ label, value, tone }) => (
    <div className="rounded-[1.25rem] bg-white/8 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">{label}</p>
        <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
);

export default NetWorthManagerPanel;
