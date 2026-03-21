import React from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, History } from 'lucide-react';

const formatCurrency = (value, currency = 'KES') => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(value || 0);

const trendConfig = {
    up: {
        label: 'Improving',
        icon: ArrowUpRight,
        className: 'bg-emerald-50 text-emerald-700',
    },
    down: {
        label: 'Declining',
        icon: ArrowDownRight,
        className: 'bg-rose-50 text-rose-700',
    },
    stable: {
        label: 'Stable',
        icon: ArrowRight,
        className: 'bg-slate-100 text-slate-700',
    },
};

const NetWorthHistoryCard = ({ history }) => {
    const trend = trendConfig[history?.trendDirection] || trendConfig.stable;
    const TrendIcon = trend.icon;

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">History</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Net worth trend over time</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Use the monthly snapshots to see whether your balance sheet is building momentum or drifting.
                    </p>
                </div>
                <div className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold ${trend.className}`}>
                    <TrendIcon size={16} />
                    {trend.label}
                    <span className="text-xs font-medium opacity-80">{history?.trendPercentage?.toFixed(1) || '0.0'}%</span>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {history?.history?.length ? history.history.map((entry) => (
                    <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-white p-3 text-primary-700 shadow-sm">
                                    <History size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{entry.month}</p>
                                    <p className="text-xs text-slate-500">{entry.date}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-4">
                                <Metric label="Net worth" value={formatCurrency(entry.netWorth, history.currency)} />
                                <Metric label="Assets" value={formatCurrency(entry.assets, history.currency)} />
                                <Metric label="Liabilities" value={formatCurrency(entry.liabilities, history.currency)} />
                                <Metric label="Change" value={formatCurrency(entry.change, history.currency)} />
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                        No history points are available yet. As you add assets and liabilities, monthly trend data should start becoming more useful.
                    </div>
                )}
            </div>
        </section>
    );
};

const Metric = ({ label, value }) => (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
);

export default NetWorthHistoryCard;
