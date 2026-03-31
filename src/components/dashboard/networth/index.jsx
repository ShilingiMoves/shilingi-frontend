import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { getDebts } from '../../../services/debtApi';
import { getAssets, getLiabilities } from '../../../services/networthApi';

function formatKES(value) {
    return `KES ${Number(value || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

const NetWorthDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assets, setAssets] = useState([]);
    const [liabilities, setLiabilities] = useState([]);
    const [debts, setDebts] = useState([]);

    const loadOverview = async () => {
        setLoading(true);
        setError('');
        try {
            const [assetsData, liabilitiesData, debtsData] = await Promise.all([
                getAssets(),
                getLiabilities(),
                getDebts(),
            ]);
            setAssets(assetsData.assets || []);
            setLiabilities(liabilitiesData.liabilities || []);
            setDebts(debtsData || []);
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

    return (
        <div className="min-h-screen bg-[#f2f4f7] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex justify-end">
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
        <h3 className="mb-3 text-4xl font-semibold text-slate-900">{title}</h3>
        <div className="overflow-hidden border border-slate-300 bg-white">
            <table className="w-full text-left text-sm">
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

export default NetWorthDashboard;
