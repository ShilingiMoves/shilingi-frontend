import React from 'react';
import { CalendarDays, CreditCard } from 'lucide-react';

const currency = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const CashflowExpenseList = ({ expenses }) => {
    if (!expenses.length) {
        return (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">No expenses recorded yet</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Your expense API is connected through the budget service. Once backend category mapping is confirmed for create or update, this section can support full expense actions.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {expenses.map((expense) => (
                <article key={expense.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{expense.categoryName}</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{expense.paymentMethodDisplay}</span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900">{expense.description}</h3>
                                <p className="mt-1 text-sm text-gray-500">{expense.merchant}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays size={15} />
                                    {expense.expenseDate || 'No expense date'}
                                </span>
                                {expense.reference && (
                                    <span className="inline-flex items-center gap-2">
                                        <CreditCard size={15} />
                                        {expense.reference}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl bg-rose-50 px-5 py-4 text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Amount</p>
                            <p className="mt-2 text-2xl font-extrabold text-rose-900">{currency.format(expense.amount)}</p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default CashflowExpenseList;
