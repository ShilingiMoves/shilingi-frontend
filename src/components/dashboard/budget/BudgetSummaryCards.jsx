import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';

const BudgetSummaryCards = ({ summary, budgetHealth }) => {
    const spentPercentage = summary.total_budget > 0 
        ? (summary.total_spent / summary.total_budget) * 100 
        : 0;

    const getSpentColor = () => {
        if (spentPercentage >= 100) return 'rose';
        if (spentPercentage >= 80) return 'amber';
        return 'emerald';
    };

    const spentColor = getSpentColor();

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Budget Card */}
            <div className="group relative overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl transition-all group-hover:scale-150" />
                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-indigo-600">Total Budget</p>
                            <h3 className="mt-2 text-3xl font-bold text-slate-900">
                                {formatCurrency(summary.total_budget, summary.currency)}
                            </h3>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="rounded-full bg-indigo-100 px-3 py-1">
                                    <p className="text-xs font-bold text-indigo-700">
                                        {summary.active_budgets_count} Active
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-indigo-100 p-3 transition-all group-hover:bg-indigo-200">
                            <DollarSign className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Spent Card */}
            <div className={`group relative overflow-hidden rounded-[1.75rem] border border-${spentColor}-100 bg-gradient-to-br from-${spentColor}-50 to-white p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]`}>
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-${spentColor}-100/50 blur-2xl transition-all group-hover:scale-150`} />
                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className={`text-sm font-semibold text-${spentColor}-600`}>Total Spent</p>
                            <h3 className={`mt-2 text-3xl font-bold text-${spentColor}-900`}>
                                {formatCurrency(summary.total_spent, summary.currency)}
                            </h3>
                            <div className="mt-3">
                                <div className="relative h-2 overflow-hidden rounded-full bg-white/80">
                                    <div
                                        className={`h-full bg-gradient-to-r from-${spentColor}-400 to-${spentColor}-600 transition-all duration-500`}
                                        style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                    />
                                </div>
                                <p className={`mt-1.5 text-xs font-bold text-${spentColor}-700`}>
                                    {spentPercentage.toFixed(1)}% of budget used
                                </p>
                            </div>
                        </div>
                        <div className={`rounded-2xl bg-${spentColor}-100 p-3 transition-all group-hover:bg-${spentColor}-200`}>
                            <TrendingUp className={`h-6 w-6 text-${spentColor}-600`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Remaining Card */}
            <div className={`group relative overflow-hidden rounded-[1.75rem] border ${summary.total_remaining >= 0 ? 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white' : 'border-rose-100 bg-gradient-to-br from-rose-50 to-white'} p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]`}>
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${summary.total_remaining >= 0 ? 'bg-emerald-100/50' : 'bg-rose-100/50'} blur-2xl transition-all group-hover:scale-150`} />
                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${summary.total_remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {summary.total_remaining >= 0 ? 'Remaining' : 'Over Budget'}
                            </p>
                            <h3 className={`mt-2 text-3xl font-bold ${summary.total_remaining >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                                {formatCurrency(Math.abs(summary.total_remaining), summary.currency)}
                            </h3>
                            <div className="mt-3">
                                {summary.total_remaining >= 0 ? (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                        <CheckCircle2 size={14} />
                                        Available to spend
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                                        <AlertTriangle size={14} />
                                        Exceeded limit
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`rounded-2xl ${summary.total_remaining >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} p-3 transition-all ${summary.total_remaining >= 0 ? 'group-hover:bg-emerald-200' : 'group-hover:bg-rose-200'}`}>
                            {summary.total_remaining >= 0 ? (
                                <TrendingDown className="h-6 w-6 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 text-rose-600" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Health Card */}
            <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-slate-100/50 blur-2xl transition-all group-hover:scale-150" />
                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-600">Budget Health</p>
                            <div className="mt-3 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                                        <span className="text-xs font-medium text-slate-700">On Track</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{budgetHealth.healthy}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-200" />
                                        <span className="text-xs font-medium text-slate-700">Warning</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{budgetHealth.warning}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-200" />
                                        <span className="text-xs font-medium text-slate-700">Over Budget</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{budgetHealth.over}</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-slate-100 p-3 transition-all group-hover:bg-slate-200">
                            <Target className="h-6 w-6 text-slate-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummaryCards;