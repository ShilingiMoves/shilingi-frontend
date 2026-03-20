import React from 'react';
import { ArrowUpCircle, Scale, TrendingUp } from 'lucide-react';

const CashflowAnalysisCard = ({ analysis }) => {
    const status = analysis?.status || 'balanced';
    const incomeBreakdown = Array.isArray(analysis?.income_breakdown) ? analysis.income_breakdown : [];

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Flow analysis</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">{analysis?.period || 'Current month'}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
                Your current cash flow status is <span className="font-semibold text-slate-900">{status}</span>. Use this section to understand the strength of your income pattern and whether it is giving you the consistency you need month to month.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <BreakdownList
                    title="Income breakdown"
                    icon={ArrowUpCircle}
                    items={incomeBreakdown}
                    emptyText="Income categories will appear here as soon as your income history grows."
                    accent="text-emerald-600"
                />
                <HighlightsCard analysis={analysis} />
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                    <Scale size={18} />
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Current net position</p>
                </div>
                <p className="mt-3 text-3xl font-extrabold">{Number(analysis?.net_cashflow || 0).toLocaleString()}</p>
            </div>
        </div>
    );
};

const BreakdownList = ({ title, icon: Icon, items, emptyText, accent }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
        <div className={`inline-flex rounded-2xl bg-white p-3 shadow-sm ${accent}`}>
            <Icon size={18} />
        </div>
        <h4 className="mt-4 text-lg font-bold text-slate-900">{title}</h4>
        {items.length ? (
            <div className="mt-4 space-y-3">
                {items.map((item, index) => (
                    <div key={`${item.category || item.name || 'item'}-${index}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                        <span className="text-sm font-medium text-slate-700">{item.category || item.name || 'Category'}</span>
                        <span className="text-sm font-bold text-slate-900">{Number(item.amount || item.total || 0).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">{emptyText}</p>
        )}
    </div>
);

const HighlightsCard = ({ analysis }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="inline-flex rounded-2xl bg-white p-3 text-primary-700 shadow-sm">
            <TrendingUp size={18} />
        </div>
        <h4 className="mt-4 text-lg font-bold text-slate-900">Income highlights</h4>
        <div className="mt-4 space-y-3">
            <HighlightRow
                label="Total income"
                value={Number(analysis?.total_income || 0).toLocaleString()}
            />
            <HighlightRow
                label="Savings rate"
                value={`${Number(analysis?.savings_rate || 0).toFixed(1)}%`}
            />
            <HighlightRow
                label="Monthly status"
                value={analysis?.status || 'balanced'}
            />
        </div>
    </div>
);

const HighlightRow = ({ label, value }) => (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
);

export default CashflowAnalysisCard;
