import React, { useMemo } from 'react';
import { AlertTriangle, BarChart3, CalendarDays, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';

const statusStyles = {
    ON_TRACK: 'bg-emerald-100 text-emerald-700',
    WARNING: 'bg-amber-100 text-amber-700',
    OVER_BUDGET: 'bg-rose-100 text-rose-700',
    default: 'bg-slate-100 text-slate-700',
};

const BudgetOverview = ({ summary, budgets, totalIncome, onNavigate }) => {
    const currency = summary?.currency || 'KES';
    const totalBudgeted = Number(summary?.total_budget || 0);
    const totalSpent = Number(summary?.total_spent || 0);
    const remainingFromIncome = Number(totalIncome || 0) - totalBudgeted;
    const savingsAfterSpend = Number(totalIncome || 0) - totalSpent;

    const sortedBudgets = useMemo(
        () => [...(budgets || [])].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0)),
        [budgets]
    );

    const topRows = sortedBudgets.slice(0, 8);
    const overspendingCount = sortedBudgets.filter((item) => item.status === 'OVER_BUDGET').length;

    const monthlyNeedsTarget = Number(totalIncome || 0) * 0.5;
    const wantsTarget = Number(totalIncome || 0) * 0.3;
    const savingsTarget = Number(totalIncome || 0) * 0.2;
    const needsSpent = sortedBudgets
        .filter((item) =>
            ['housing', 'utilities', 'transport', 'food', 'healthcare', 'education'].some((key) =>
                String(item.category_name || '').toLowerCase().includes(key)
            )
        )
        .reduce((sum, item) => sum + Number(item.total_spent || 0), 0);

    const upcomingBills = sortedBudgets
        .filter((item) => Number(item.remaining || 0) > 0)
        .slice(0, 3);

    return (
        <div className="space-y-4">
            <section className="flex flex-col gap-3 rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="inline-flex items-center gap-2 text-xl font-extrabold">
                        <BarChart3 size={18} />
                        Budget Planner
                    </p>
                    <p className="mt-1 text-sm text-white/85">
                        Set, track, and optimize your monthly spending across all categories.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onNavigate('budgets')}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#0f6b5b] shadow-sm"
                    >
                        + Add Category
                    </button>
                    <button
                        type="button"
                        onClick={() => onNavigate('expenses')}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm"
                    >
                        + Add Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => onNavigate('goals')}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm"
                    >
                        Goals
                    </button>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                <MetricCard title="Total Income" value={formatCurrency(totalIncome, currency)} tone="text-[#0f6b5b]" />
                <MetricCard title="Total Budgeted" value={formatCurrency(totalBudgeted, currency)} tone="text-[#1e64c8]" />
                <MetricCard
                    title="Remaining"
                    value={formatCurrency(remainingFromIncome, currency)}
                    tone={remainingFromIncome >= 0 ? 'text-amber-600' : 'text-rose-600'}
                />
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                <QuickActionCard
                    title="Goals"
                    text={`${summary?.goal_count ?? 0} active goals`}
                    cta="Track Goals"
                    onClick={() => onNavigate('goals')}
                />
                <QuickActionCard
                    title="Budget Categories"
                    text={`${sortedBudgets.length} active categories`}
                    cta="Manage Categories"
                    onClick={() => onNavigate('budgets')}
                />
                <QuickActionCard
                    title="Expenses"
                    text={`${summary?.expense_count ?? 0} expense records`}
                    cta="Add / Manage Expenses"
                    onClick={() => onNavigate('expenses')}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-950">Monthly Budget Categories</h3>
                        <button
                            type="button"
                            onClick={() => onNavigate('budgets')}
                            className="text-xs font-semibold text-primary-700 hover:underline"
                        >
                            Edit All
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-[0.15em] text-slate-500">
                                    <th className="py-2 pr-3 font-semibold">Category</th>
                                    <th className="py-2 pr-3 font-semibold">Budgeted</th>
                                    <th className="py-2 pr-3 font-semibold">Spent</th>
                                    <th className="py-2 pr-3 font-semibold">Left</th>
                                    <th className="py-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topRows.length > 0 ? (
                                    topRows.map((item) => {
                                        const leftAmount = Number(item.remaining || 0);
                                        const statusClass = statusStyles[item.status] || statusStyles.default;
                                        return (
                                            <tr key={item.uuid} className="border-b border-slate-100 last:border-b-0">
                                                <td className="py-2.5 pr-3 font-medium text-slate-900">{item.category_name}</td>
                                                <td className="py-2.5 pr-3 text-slate-700">{formatCurrency(item.amount, item.currency || currency)}</td>
                                                <td className={`py-2.5 pr-3 ${item.status === 'OVER_BUDGET' ? 'text-rose-600' : 'text-slate-700'}`}>
                                                    {formatCurrency(item.total_spent, item.currency || currency)}
                                                </td>
                                                <td className={`py-2.5 pr-3 ${leftAmount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                    {formatCurrency(leftAmount, item.currency || currency)}
                                                </td>
                                                <td className="py-2.5">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>
                                                        {item.status === 'OVER_BUDGET'
                                                            ? 'Over Budget'
                                                            : item.status === 'WARNING'
                                                            ? 'Watch'
                                                            : 'On Track'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                                            No categories yet. Add your first budget category to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>

                <div className="space-y-4">
                    <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
                            <Lightbulb size={15} className="text-amber-500" />
                            Budget Tip
                        </h3>
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-[#f4faf7] p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">50/30/20 Rule Check</p>
                            <p className="mt-1">Needs (50%): {formatCurrency(monthlyNeedsTarget, currency)} - You spend {formatCurrency(needsSpent, currency)}</p>
                            <p>Wants (30%): {formatCurrency(wantsTarget, currency)} - Budgeted {formatCurrency(Math.max(totalBudgeted - needsSpent, 0), currency)}</p>
                            <p>Savings (20%): {formatCurrency(savingsTarget, currency)} - Remaining after spend {formatCurrency(savingsAfterSpend, currency)}</p>
                        </div>
                    </article>

                    <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
                            <CalendarDays size={15} className="text-primary-700" />
                            Upcoming Bills
                        </h3>
                        <div className="mt-3 space-y-3">
                            {upcomingBills.length > 0 ? (
                                upcomingBills.map((item) => (
                                    <div key={`${item.uuid}-bill`} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                                        <p className="text-sm text-slate-800">{item.category_name}</p>
                                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.remaining, item.currency || currency)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No upcoming bills right now.</p>
                            )}
                        </div>
                    </article>

                    {overspendingCount > 0 && (
                        <article className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                                <AlertTriangle size={15} />
                                Overspending alert
                            </p>
                            <p className="mt-1 text-sm text-rose-700">
                                {overspendingCount} categor{overspendingCount === 1 ? 'y is' : 'ies are'} currently over budget.
                                Review these categories to rebalance your plan.
                            </p>
                        </article>
                    )}
                </div>
            </section>
        </div>
    );
};

const MetricCard = ({ title, value, tone }) => (
    <article className="rounded-[1.1rem] border border-emerald-100 bg-white px-4 py-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <p className={`mt-2 text-3xl font-extrabold ${tone}`}>{value}</p>
    </article>
);

const QuickActionCard = ({ title, text, cta, onClick }) => (
    <article className="rounded-[1.1rem] border border-emerald-100 bg-white px-4 py-4 shadow-sm">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
        <button
            type="button"
            onClick={onClick}
            className="mt-3 inline-flex rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700"
        >
            {cta}
        </button>
    </article>
);

export default BudgetOverview;
