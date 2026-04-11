import React, { useMemo } from 'react';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Lightbulb,
    Plus,
    Wallet,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';

const statusStyles = {
    ON_TRACK: {
        pill: 'bg-emerald-100 text-emerald-700',
        bar: 'from-emerald-400 to-emerald-600',
        text: 'text-emerald-700',
        label: 'On track',
    },
    WARNING: {
        pill: 'bg-amber-100 text-amber-700',
        bar: 'from-amber-400 to-amber-600',
        text: 'text-amber-700',
        label: 'Watch spend',
    },
    OVER_BUDGET: {
        pill: 'bg-rose-100 text-rose-700',
        bar: 'from-rose-400 to-rose-600',
        text: 'text-rose-700',
        label: 'Overspending',
    },
    default: {
        pill: 'bg-slate-100 text-slate-700',
        bar: 'from-slate-400 to-slate-500',
        text: 'text-slate-700',
        label: 'Active',
    },
};

const BudgetOverview = ({ summary, budgets, expenses, expenseTotal, totalIncome, budgetHealth, onNavigate }) => {
    const currency = summary?.currency || 'KES';
    const totalBudgeted = Number(summary?.total_budget || 0);
    const totalSpent = Number(summary?.total_spent || expenseTotal || 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const remainingFromIncome = Number(totalIncome || 0) - totalSpent;
    const expenseRecordsCount = Number(summary?.expense_count ?? expenses?.length ?? 0);
    const totalTracked = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    const sortedBudgets = useMemo(
        () => [...(budgets || [])].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0)),
        [budgets]
    );

    const highlightedBudgets = sortedBudgets.slice(0, 6);
    const topSpendingCategories = [...sortedBudgets]
        .sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0))
        .slice(0, 4);

    const overspendingCount = sortedBudgets.filter((item) => item.status === 'OVER_BUDGET').length;
    const warningCount = sortedBudgets.filter((item) => item.status === 'WARNING').length;
    const healthyCount = budgetHealth?.healthy || 0;

    const spendingSignal = (() => {
        if (overspendingCount > 0 || totalRemaining < 0) {
            return {
                title: 'You are overspending in parts of this budget',
                text: `${overspendingCount || 1} categor${overspendingCount === 1 ? 'y is' : 'ies are'} already over budget. Rebalance the biggest categories first.`,
                tone: 'border-rose-200 bg-rose-50 text-rose-700',
                icon: AlertTriangle,
            };
        }

        if (warningCount > 0 || totalTracked >= 80) {
            return {
                title: 'You are close to your limits',
                text: `${warningCount || 1} categor${warningCount === 1 ? 'y is' : 'ies are'} approaching the budget cap. Review spending before month end.`,
                tone: 'border-amber-200 bg-amber-50 text-amber-700',
                icon: CalendarDays,
            };
        }

        return {
            title: 'Your spending is on track',
            text: `${healthyCount} categor${healthyCount === 1 ? 'y is' : 'ies are'} pacing well against the plan. Keep logging expenses to stay accurate.`,
            tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            icon: CheckCircle2,
        };
    })();

    const SpendingSignalIcon = spendingSignal.icon;

    return (
        <div className="space-y-4">
            <section className="overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#0f5b4f] via-[#176c5d] to-[#2a8671] px-5 py-5 text-white shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="inline-flex items-center gap-2 text-xl font-extrabold">
                            <BarChart3 size={18} />
                            Budget Planner
                        </p>
                        <p className="mt-2 text-sm text-white/85">
                            Track what you allocated, what you have already spent, and where you need to adjust before you go over.
                        </p>
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
                        <button
                            type="button"
                            onClick={() => onNavigate('budgets')}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#0f5b4f] shadow-sm"
                        >
                            <Plus size={15} />
                            Add Category
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate('expenses')}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm"
                        >
                            <Wallet size={15} />
                            Add Expense
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Budget Allocated"
                    value={formatCurrency(totalBudgeted, currency)}
                    helper={`${summary?.active_budgets_count || budgets.length} active categories`}
                    tone="text-[#0f5b4f]"
                />
                <MetricCard
                    title="Spent So Far"
                    value={formatCurrency(totalSpent, currency)}
                    helper={`${totalTracked.toFixed(0)}% of budget used`}
                    tone={totalTracked >= 100 ? 'text-rose-600' : totalTracked >= 80 ? 'text-amber-600' : 'text-[#1e64c8]'}
                />
                <MetricCard
                    title={totalRemaining >= 0 ? 'Left In Budget' : 'Over Budget'}
                    value={formatCurrency(Math.abs(totalRemaining), currency)}
                    helper={totalRemaining >= 0 ? 'Available inside your budget' : 'Needs immediate attention'}
                    tone={totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                />
                <MetricCard
                    title="Cash Left After Spend"
                    value={formatCurrency(remainingFromIncome, currency)}
                    helper="Income minus recorded spend"
                    tone={remainingFromIncome >= 0 ? 'text-slate-900' : 'text-rose-600'}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-[1.3rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-950">Budget vs Spending</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                A quick read on whether your month is under control.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('expenses')}
                            className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                        >
                            Review expenses
                            <ArrowUpRight size={13} />
                        </button>
                    </div>

                    <div className="mt-4 rounded-[1.1rem] border border-slate-100 bg-[#f6fbf8] p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-600">Spending progress</span>
                            <span className="font-bold text-slate-900">{totalTracked.toFixed(0)}%</span>
                        </div>
                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white shadow-inner">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${
                                    totalTracked >= 100
                                        ? 'from-rose-400 to-rose-600'
                                        : totalTracked >= 80
                                        ? 'from-amber-400 to-amber-500'
                                        : 'from-emerald-400 to-emerald-600'
                                }`}
                                style={{ width: `${Math.min(totalTracked, 100)}%` }}
                            />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <MiniStatusCard label="On track" value={healthyCount} tone="emerald" />
                            <MiniStatusCard label="Watch" value={warningCount} tone="amber" />
                            <MiniStatusCard label="Over budget" value={overspendingCount} tone="rose" />
                        </div>
                    </div>

                    <div className={`mt-4 rounded-[1.1rem] border px-4 py-3 ${spendingSignal.tone}`}>
                        <div className="flex items-start gap-3">
                            <SpendingSignalIcon size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold">{spendingSignal.title}</p>
                                <p className="mt-1 text-sm">{spendingSignal.text}</p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="rounded-[1.3rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="text-base font-bold text-slate-950">Spending Breakdown</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Where most of your budget is currently going.
                    </p>

                    <div className="mt-4 space-y-3">
                        {topSpendingCategories.length > 0 ? (
                            topSpendingCategories.map((item) => {
                                const amount = Number(item.amount || 0);
                                const spent = Number(item.total_spent || 0);
                                const progress = amount > 0 ? (spent / amount) * 100 : 0;
                                const status = statusStyles[item.status] || statusStyles.default;

                                return (
                                    <div key={`${item.uuid}-breakdown`} className="rounded-[1rem] border border-slate-100 bg-slate-50 px-4 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.category_name}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatCurrency(spent, item.currency || currency)} of {formatCurrency(amount, item.currency || currency)}
                                                </p>
                                            </div>
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.pill}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${status.bar}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState
                                title="No spending breakdown yet"
                                text="Add a budget category and record expenses to see your spending mix."
                            />
                        )}
                    </div>
                </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-950">Budget Categories</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                See what you allocated, spent, and still have left in each category.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('budgets')}
                            className="text-xs font-semibold text-primary-700 hover:underline"
                        >
                            Manage categories
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-[0.15em] text-slate-500">
                                    <th className="py-2 pr-3 font-semibold">Category</th>
                                    <th className="py-2 pr-3 font-semibold">Allocated</th>
                                    <th className="py-2 pr-3 font-semibold">Spent</th>
                                    <th className="py-2 pr-3 font-semibold">Left</th>
                                    <th className="py-2 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highlightedBudgets.length > 0 ? (
                                    highlightedBudgets.map((item) => {
                                        const leftAmount = Number(item.remaining || 0);
                                        const statusClass = statusStyles[item.status] || statusStyles.default;
                                        return (
                                            <tr key={item.uuid} className="border-b border-slate-100 last:border-b-0">
                                                <td className="py-3 pr-3 font-medium text-slate-900">{item.category_name}</td>
                                                <td className="py-3 pr-3 text-slate-700">{formatCurrency(item.amount, item.currency || currency)}</td>
                                                <td className={`py-3 pr-3 ${item.status === 'OVER_BUDGET' ? 'text-rose-600' : 'text-slate-700'}`}>
                                                    {formatCurrency(item.total_spent, item.currency || currency)}
                                                </td>
                                                <td className={`py-3 pr-3 ${leftAmount < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                    {formatCurrency(Math.abs(leftAmount), item.currency || currency)}
                                                    <span className="ml-1 text-xs text-slate-400">{leftAmount < 0 ? 'over' : 'left'}</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass.pill}`}>
                                                        {statusClass.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                                            No categories yet. Add your first budget category to start tracking spend.
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
                            Budget Insight
                        </h3>
                        <div className="mt-3 rounded-xl border border-emerald-100 bg-[#f4faf7] p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">What this means this month</p>
                            <p className="mt-1">
                                You have recorded {expenseRecordsCount} expense{expenseRecordsCount === 1 ? '' : 's'} across {summary?.active_budgets_count || budgets.length} budget categor{(summary?.active_budgets_count || budgets.length) === 1 ? 'y' : 'ies'}.
                            </p>
                            <p className="mt-2">
                                {totalRemaining >= 0
                                    ? `You still have ${formatCurrency(totalRemaining, currency)} available inside your planned budget.`
                                    : `You have exceeded the planned budget by ${formatCurrency(Math.abs(totalRemaining), currency)}.`}
                            </p>
                        </div>
                    </article>

                    <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                        <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
                            <CalendarDays size={15} className="text-primary-700" />
                            Next Best Actions
                        </h3>
                        <div className="mt-3 space-y-3">
                            <ActionRow
                                title="Update categories"
                                text="Adjust category limits if your real spending pattern has changed."
                                cta="Manage budgets"
                                onClick={() => onNavigate('budgets')}
                            />
                            <ActionRow
                                title="Keep expenses current"
                                text="Log recent spending so the budget health stays accurate."
                                cta="Add expense"
                                onClick={() => onNavigate('expenses')}
                            />
                        </div>
                    </article>
                </div>
            </section>
        </div>
    );
};

const MetricCard = ({ title, value, helper, tone }) => (
    <article className="rounded-[1.1rem] border border-emerald-100 bg-white px-4 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <p className={`mt-2 text-3xl font-extrabold ${tone}`}>{value}</p>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </article>
);

const MiniStatusCard = ({ label, value, tone }) => {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        rose: 'bg-rose-50 text-rose-700',
    };

    return (
        <div className={`rounded-[1rem] px-3 py-3 ${tones[tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em]">{label}</p>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
        </div>
    );
};

const EmptyState = ({ title, text }) => (
    <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
);

const ActionRow = ({ title, text, cta, onClick }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
        <button
            type="button"
            onClick={onClick}
            className="mt-3 inline-flex rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700"
        >
            {cta}
        </button>
    </div>
);

export default BudgetOverview;
