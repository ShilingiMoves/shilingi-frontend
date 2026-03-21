import React from 'react';
import { CalendarDays, CircleDollarSign, Droplets, Edit3, ShieldAlert, Trash2 } from 'lucide-react';

const formatCurrency = (value, currency = 'KES') => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(value || 0);

const NetWorthItemsList = ({ kind, items, onEdit, onDelete, deletingId }) => {
    if (!items.length) {
        return (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">No {kind === 'asset' ? 'assets' : 'liabilities'} yet</h3>
                <p className="mt-2 text-sm text-gray-600">
                    {kind === 'asset'
                        ? 'Add your first asset and this workspace will start reflecting how it contributes to your net worth.'
                        : 'Add your first liability and this workspace will start reflecting what is pulling your net worth down.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => {
                const amount = kind === 'asset' ? item.currentValue : item.amount;

                return (
                    <article key={item.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span
                                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                                            style={{
                                                backgroundColor: `${item.categoryColor || '#e2e8f0'}20`,
                                                color: item.categoryColor || '#334155',
                                            }}
                                        >
                                            {item.categoryName}
                                        </span>
                                        {kind === 'asset' && item.isLiquid && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                                                <Droplets size={14} /> Liquid
                                            </span>
                                        )}
                                        {kind === 'liability' && (
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                                                item.status === 'PAID'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : item.status === 'DISPUTED'
                                                        ? 'bg-amber-50 text-amber-700'
                                                        : 'bg-rose-50 text-rose-700'
                                            }`}>
                                                {item.statusDisplay || item.status}
                                            </span>
                                        )}
                                        {kind === 'liability' && item.dueDate && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                                <CalendarDays size={14} /> Due {item.dueDate}
                                            </span>
                                        )}
                                        {!item.includeInNetWorth && (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                Excluded from net worth
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-gray-900">{item.name}</h3>
                                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500">
                                        {kind === 'asset' ? <CircleDollarSign size={16} /> : <ShieldAlert size={16} />}
                                        {kind === 'asset'
                                            ? item.institution || 'No institution added'
                                            : item.creditor || 'No creditor added'}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Metric label={kind === 'asset' ? 'Current value' : 'Amount owed'} value={formatCurrency(amount, item.currency)} />
                                    <Metric
                                        label={kind === 'asset' ? 'Currency' : 'Status'}
                                        value={kind === 'asset' ? item.currency : (item.statusDisplay || item.status)}
                                    />
                                    <Metric
                                        label={kind === 'asset' ? 'Last valued' : 'Category ID'}
                                        value={kind === 'asset' ? (item.lastValuedDate || 'Not set') : item.category}
                                    />
                                </div>

                                {item.notes && (
                                    <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">{item.notes}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                                <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                                >
                                    <Edit3 size={16} /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Trash2 size={16} />
                                    {deletingId === item.id ? 'Removing...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

const Metric = ({ label, value }) => (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
        <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
    </div>
);

export default NetWorthItemsList;
