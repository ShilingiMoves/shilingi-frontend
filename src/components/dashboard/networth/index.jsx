import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCw, Wallet, X } from 'lucide-react';
import { getDebts } from '../../../services/debtApi';
import {
    createAsset,
    createLiability,
    getAssetCategories,
    getAssets,
    getLiabilities,
    getLiabilityCategories,
} from '../../../services/networthApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

function formatKES(value) {
    return `KES ${Number(value || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

const initialAssetForm = {
    name: '',
    categoryId: '',
    currentValue: '',
    purchaseValue: '',
    institution: '',
    purchaseDate: '',
    includeInNetWorth: true,
    isLiquid: false,
};

const initialLiabilityForm = {
    name: '',
    categoryId: '',
    amount: '',
    creditor: '',
    dueDate: '',
    includeInNetWorth: true,
    status: 'ACTIVE',
};

const NetWorthDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [assets, setAssets] = useState([]);
    const [liabilities, setLiabilities] = useState([]);
    const [debts, setDebts] = useState([]);
    const [assetCategories, setAssetCategories] = useState([]);
    const [liabilityCategories, setLiabilityCategories] = useState([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showLiabilityModal, setShowLiabilityModal] = useState(false);
    const [assetForm, setAssetForm] = useState(initialAssetForm);
    const [liabilityForm, setLiabilityForm] = useState(initialLiabilityForm);

    const loadOverview = async () => {
        setLoading(true);
        setError('');
        try {
            const [assetsData, liabilitiesData, debtsData, assetCategoryRows, liabilityCategoryRows] = await Promise.all([
                getAssets(),
                getLiabilities(),
                getDebts(),
                getAssetCategories(),
                getLiabilityCategories(),
            ]);
            setAssets(assetsData.assets || []);
            setLiabilities(liabilitiesData.liabilities || []);
            setDebts(debtsData || []);
            setAssetCategories(assetCategoryRows || []);
            setLiabilityCategories(liabilityCategoryRows || []);
        } catch (err) {
            setError(err.message || 'Unable to load net worth overview right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOverview();
    }, []);

    const metrics = useMemo(() => {
        const totalAssets = assets.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
        const totalLiabilitiesFromModule = liabilities.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const totalDebt = debts.reduce((sum, item) => sum + Number(item.balance || 0), 0);
        const totalLiabilities = totalLiabilitiesFromModule + totalDebt;
        const netWorth = totalAssets - totalLiabilities;
        const maxForBars = Math.max(totalAssets, totalLiabilities, Math.abs(netWorth), 1);

        return {
            totalAssets,
            totalLiabilities,
            netWorth,
            maxForBars,
            liabilityRows: [
                ...liabilities.map((item) => ({
                    id: item.uuid,
                    name: item.name,
                    value: Number(item.amount || 0),
                })),
                ...debts.map((item) => ({
                    id: item.uuid,
                    name: item.name,
                    value: Number(item.balance || 0),
                })),
            ],
        };
    }, [assets, liabilities, debts]);

    const barWidth = (value) => `${Math.min((Math.abs(value) / metrics.maxForBars) * 100, 100)}%`;

    const handleAssetChange = (key, value) => {
        setAssetForm((current) => ({ ...current, [key]: value }));
    };

    const handleLiabilityChange = (key, value) => {
        setLiabilityForm((current) => ({ ...current, [key]: value }));
    };

    const submitAsset = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await createAsset({
                ...assetForm,
                currency: 'KES',
                lastValuedDate: new Date().toISOString().split('T')[0],
            });
            markDashboardDataExists();
            setSuccess('Asset added successfully.');
            setShowAssetModal(false);
            setAssetForm(initialAssetForm);
            await loadOverview();
        } catch (err) {
            setError(err.message || 'Failed to add asset.');
        } finally {
            setSubmitting(false);
        }
    };

    const submitLiability = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await createLiability({
                ...liabilityForm,
                currency: 'KES',
            });
            markDashboardDataExists();
            setSuccess('Liability added successfully.');
            setShowLiabilityModal(false);
            setLiabilityForm(initialLiabilityForm);
            await loadOverview();
        } catch (err) {
            setError(err.message || 'Failed to add liability.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f2f4f7] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setShowAssetModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        <Plus size={14} />
                        Add Asset
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowLiabilityModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
                    >
                        <Plus size={14} />
                        Add Liability
                    </button>
                    <button
                        type="button"
                        onClick={loadOverview}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
                )}
                {success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
                )}

                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-center text-3xl font-semibold text-slate-900">Net Worth Overview</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-slate-500">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : (
                        <div className="mx-auto mt-6 max-w-4xl space-y-4">
                            <MetricRow label="Assets" labelClass="text-emerald-700" value={metrics.totalAssets} width={barWidth(metrics.totalAssets)} />
                            <MetricRow label="Liabilities" labelClass="text-red-700" value={metrics.totalLiabilities} width={barWidth(metrics.totalLiabilities)} />
                            <MetricRow label="Net Worth" labelClass="text-blue-700" value={metrics.netWorth} width={barWidth(metrics.netWorth)} />
                        </div>
                    )}
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    <OverviewTable
                        title="Assets"
                        emptyLabel="No assets found"
                        rows={assets.map((item) => ({ id: item.uuid, name: item.name, value: Number(item.currentValue || 0) }))}
                        total={metrics.totalAssets}
                        totalLabel="Total Assets"
                    />
                    <OverviewTable
                        title="Liabilities"
                        emptyLabel="No liabilities found"
                        rows={metrics.liabilityRows}
                        total={metrics.totalLiabilities}
                        totalLabel="Total Liabilities"
                    />
                </section>
            </div>

            {showAssetModal && (
                <Modal title="Add Asset" onClose={() => setShowAssetModal(false)}>
                    <form onSubmit={submitAsset} className="space-y-4">
                        <Input label="Asset name" value={assetForm.name} onChange={(value) => handleAssetChange('name', value)} required />
                        <label className="block text-sm font-medium text-slate-700">
                            Category
                            <select
                                value={assetForm.categoryId}
                                onChange={(event) => handleAssetChange('categoryId', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                required
                            >
                                <option value="">Select category</option>
                                {assetCategories.map((category) => (
                                    <option key={category.id} value={category.categoryId}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input label="Current value (KES)" type="number" value={assetForm.currentValue} onChange={(value) => handleAssetChange('currentValue', value)} required />
                            <Input label="Purchase value (optional)" type="number" value={assetForm.purchaseValue} onChange={(value) => handleAssetChange('purchaseValue', value)} />
                        </div>
                        <Input label="Institution (optional)" value={assetForm.institution} onChange={(value) => handleAssetChange('institution', value)} />
                        <Input label="Purchase date (optional)" type="date" value={assetForm.purchaseDate} onChange={(value) => handleAssetChange('purchaseDate', value)} />
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                            <input type="checkbox" checked={assetForm.includeInNetWorth} onChange={(event) => handleAssetChange('includeInNetWorth', event.target.checked)} />
                            Include in net worth
                        </label>
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                            <input type="checkbox" checked={assetForm.isLiquid} onChange={(event) => handleAssetChange('isLiquid', event.target.checked)} />
                            Liquid asset
                        </label>
                        <div className="flex items-center gap-3 pt-1">
                            <button type="submit" disabled={submitting || !assetForm.name || !assetForm.currentValue || !assetForm.categoryId} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                                {submitting && <Loader2 size={15} className="animate-spin" />}
                                Save Asset
                            </button>
                            <button type="button" onClick={() => setShowAssetModal(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {showLiabilityModal && (
                <Modal title="Add Liability" onClose={() => setShowLiabilityModal(false)}>
                    <form onSubmit={submitLiability} className="space-y-4">
                        <Input label="Liability name" value={liabilityForm.name} onChange={(value) => handleLiabilityChange('name', value)} required />
                        <label className="block text-sm font-medium text-slate-700">
                            Category
                            <select
                                value={liabilityForm.categoryId}
                                onChange={(event) => handleLiabilityChange('categoryId', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                required
                            >
                                <option value="">Select category</option>
                                {liabilityCategories.map((category) => (
                                    <option key={category.id} value={category.categoryId}>{category.name}</option>
                                ))}
                            </select>
                        </label>
                        <Input label="Amount (KES)" type="number" value={liabilityForm.amount} onChange={(value) => handleLiabilityChange('amount', value)} required />
                        <Input label="Creditor (optional)" value={liabilityForm.creditor} onChange={(value) => handleLiabilityChange('creditor', value)} />
                        <Input label="Due date (optional)" type="date" value={liabilityForm.dueDate} onChange={(value) => handleLiabilityChange('dueDate', value)} />
                        <label className="block text-sm font-medium text-slate-700">
                            Status
                            <select
                                value={liabilityForm.status}
                                onChange={(event) => handleLiabilityChange('status', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="PAID">Paid</option>
                            </select>
                        </label>
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                            <input type="checkbox" checked={liabilityForm.includeInNetWorth} onChange={(event) => handleLiabilityChange('includeInNetWorth', event.target.checked)} />
                            Include in net worth
                        </label>
                        <div className="flex items-center gap-3 pt-1">
                            <button type="submit" disabled={submitting || !liabilityForm.name || !liabilityForm.amount || !liabilityForm.categoryId} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                                {submitting && <Loader2 size={15} className="animate-spin" />}
                                Save Liability
                            </button>
                            <button type="button" onClick={() => setShowLiabilityModal(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const MetricRow = ({ label, labelClass, value, width }) => (
    <div className="grid grid-cols-[120px_1fr_120px] items-center gap-3">
        <p className={`text-sm font-medium ${labelClass}`}>{label}</p>
        <div className="h-8 overflow-hidden rounded bg-slate-200">
            <div className="h-full rounded bg-slate-400/80" style={{ width }} />
        </div>
        <p className="text-sm font-medium text-slate-900">{formatKES(value)}</p>
    </div>
);

const OverviewTable = ({ title, rows, total, totalLabel, emptyLabel }) => (
    <div>
        <h3 className="mb-3 text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">{title}</h3>
        <div className="overflow-x-auto border border-slate-300 bg-white">
            <table className="min-w-[520px] w-full text-left text-sm">
                <thead>
                    <tr className="bg-[#315d85] text-white">
                        <th className="border-r border-slate-200 px-4 py-3 font-semibold">{title === 'Assets' ? 'Asset Name' : 'Liability Name'}</th>
                        <th className="px-4 py-3 text-right font-semibold">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className="border-t border-slate-200 px-4 py-3 text-slate-700" colSpan={2}>{emptyLabel}</td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr key={row.id}>
                                <td className="border-t border-slate-200 px-4 py-3 text-slate-900">{row.name}</td>
                                <td className="border-t border-slate-200 px-4 py-3 text-right font-medium text-slate-900">{formatKES(row.value)}</td>
                            </tr>
                        ))
                    )}
                    <tr className="bg-slate-50">
                        <td className="border-t border-slate-300 px-4 py-3 font-semibold text-slate-900">{totalLabel}</td>
                        <td className="border-t border-slate-300 px-4 py-3 text-right font-bold text-slate-900">{formatKES(total)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const Input = ({ label, value, onChange, ...props }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
            {...props}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
    </label>
);

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-primary-700" />
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <X size={18} />
                </button>
            </div>
            <div className="px-5 py-5">{children}</div>
        </div>
    </div>
);

export default NetWorthDashboard;
