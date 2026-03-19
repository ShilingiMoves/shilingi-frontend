import React from 'react';
import { Edit3, Trash2, CalendarDays, Landmark } from 'lucide-react';

const currency = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const DebtList = ({ debts, onEdit, onDelete, deletingId }) => {
    if (!debts.length) {
        return (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">No debts yet</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Add your first debt account and this page will start tracking balances, interest, and due dates.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {debts.map((debt) => (
                <article key={debt.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                                        {debt.status}
                                    </span>
                                    {debt.isPriority && (
                                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                                            Priority
                                        </span>
                                    )}
                                    {debt.dueDate && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                            <CalendarDays size={14} /> Due {debt.dueDate}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900">{debt.name}</h3>
                                <p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500">
                                    <Landmark size={16} /> {debt.creditor}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <Metric label="Balance" value={currency.format(debt.balance)} />
                                <Metric label="Interest rate" value={`${debt.interestRate}%`} />
                                <Metric label="Minimum payment" value={currency.format(debt.minimumPayment)} />
                            </div>

                            {debt.notes && (
                                <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">{debt.notes}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                            <button
                                type="button"
                                onClick={() => onEdit(debt)}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                            >
                                <Edit3 size={16} /> Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(debt.id)}
                                disabled={deletingId === debt.id}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={16} />
                                {deletingId === debt.id ? 'Removing...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

const Metric = ({ label, value }) => (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
        <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
    </div>
);

export default DebtList;
