import React from 'react';
import { ArrowUpCircle, CalendarDays, RefreshCcw } from 'lucide-react';

const currency = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const CashflowIncomeList = ({ incomes }) => {
    if (!incomes.length) {
        return (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">No income recorded yet</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Your live income API is connected. Once category ID mapping is confirmed by backend, this section can support full add and edit actions too.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {incomes.map((income) => (
                <article key={income.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                    {income.statusDisplay}
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {income.categoryName}
                                </span>
                                {income.isRecurring && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                                        <RefreshCcw size={13} /> {income.frequencyDisplay}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900">{income.description}</h3>
                                <p className="mt-1 text-sm text-gray-500">{income.source}</p>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarDays size={15} />
                                <span>{income.incomeDate || 'No income date'}</span>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Amount</p>
                            <p className="mt-2 text-2xl font-extrabold text-emerald-900">{currency.format(income.amount)}</p>
                            <p className="mt-1 text-xs text-emerald-700">Monthly equivalent {currency.format(income.monthlyEquivalent)}</p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default CashflowIncomeList;
