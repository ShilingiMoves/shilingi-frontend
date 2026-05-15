import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit2, MoreVertical, PiggyBank, ShoppingBasket, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';
import { deriveBudgetCategoryType } from '../../../utils/budgetSetup';

const laneConfig = {
    Needs: {
        icon: Wallet,
        label: 'Needs',
        shell: 'border-emerald-200 bg-[#f4fbf8]',
        accent: 'bg-primary-600',
        chip: 'bg-emerald-100 text-emerald-800',
        text: 'text-primary-700',
        bar: 'bg-primary-600',
    },
    Wants: {
        icon: ShoppingBasket,
        label: 'Wants',
        shell: 'border-amber-200 bg-[#fff8ea]',
        accent: 'bg-amber-500',
        chip: 'bg-amber-100 text-amber-800',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
    },
    Savings: {
        icon: PiggyBank,
        label: 'Savings',
        shell: 'border-blue-200 bg-[#f3f7ff]',
        accent: 'bg-blue-600',
        chip: 'bg-blue-100 text-blue-800',
        text: 'text-blue-700',
        bar: 'bg-blue-600',
    },
};

const BudgetList = ({ budgets, onEdit, onDelete, deletingId, compact = false }) => {
    const [activeMenu, setActiveMenu] = useState(null);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ON_TRACK':
                return {
                    icon: CheckCircle2,
                    label: 'On Track',
                    textClass: 'text-primary-700',
                    badgeClass: 'bg-emerald-100 text-emerald-800',
                };
            case 'WARNING':
                return {
                    icon: AlertTriangle,
                    label: 'Warning',
                    textClass: 'text-amber-700',
                    badgeClass: 'bg-amber-100 text-amber-800',
                };
            case 'OVER_BUDGET':
                return {
                    icon: AlertTriangle,
                    label: 'Over Budget',
                    textClass: 'text-rose-700',
                    badgeClass: 'bg-rose-100 text-rose-800',
                };
            default:
                return {
                    icon: CheckCircle2,
                    label: 'Active',
                    textClass: 'text-slate-700',
                    badgeClass: 'bg-slate-100 text-slate-700',
                };
        }
    };

    if (!budgets || budgets.length === 0) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <TrendingUp className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Budgets Yet</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Create your first budget to start tracking your spending
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {budgets.map((budget) => {
                const statusConfig = getStatusConfig(budget.status);
                const StatusIcon = statusConfig.icon;
                const lane = laneConfig[deriveBudgetCategoryType(budget.category_name)] || laneConfig.Needs;
                const LaneIcon = lane.icon;
                const isDeleting = deletingId === budget.uuid;
                const spentPercent = Number(budget.spent_percentage || 0);

                return (
                    <div
                        key={budget.uuid}
                        className={`group relative overflow-hidden rounded-[1.2rem] border ${lane.shell} p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                            isDeleting ? 'opacity-50' : ''
                        } ${compact ? 'p-4' : ''}`}
                    >
                        <div className={`absolute inset-y-0 left-0 w-1.5 ${lane.accent}`} />
                        <div className="mb-5 flex items-start justify-between gap-3 pl-2">
                            <div className="flex min-w-0 items-start gap-3">
                                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] ${lane.chip}`}>
                                    <LaneIcon size={18} />
                                </span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-lg font-extrabold text-slate-950">{budget.category_name}</h4>
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${lane.chip}`}>{lane.label}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">{budget.period_display || 'Monthly'}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setActiveMenu(activeMenu === budget.uuid ? null : budget.uuid)}
                                    disabled={isDeleting}
                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === budget.uuid && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setActiveMenu(null)}
                                        />
                                        <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                            <button
                                                onClick={() => {
                                                    onEdit(budget);
                                                    setActiveMenu(null);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                            >
                                                <Edit2 size={16} />
                                                Edit Item
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Delete budget for ${budget.category_name}?`)) {
                                                        onDelete(budget.uuid);
                                                    }
                                                    setActiveMenu(null);
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                                            >
                                                <Trash2 size={16} />
                                                Delete Item
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-5 grid gap-2 sm:grid-cols-3">
                            <div className="rounded-[0.9rem] bg-white/75 px-3 py-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Budgeted</span>
                                <p className="mt-1 text-base font-extrabold text-slate-950">
                                    {formatCurrency(budget.amount, budget.currency)}
                                </p>
                            </div>
                            <div className="rounded-[0.9rem] bg-white/75 px-3 py-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Spent</span>
                                <p className={`mt-1 text-base font-extrabold ${statusConfig.textClass}`}>
                                    {formatCurrency(budget.total_spent, budget.currency)}
                                </p>
                            </div>
                            <div className="rounded-[0.9rem] bg-white/75 px-3 py-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Remaining</span>
                                <p className={`mt-1 text-base font-extrabold ${lane.text}`}>
                                    {formatCurrency(budget.remaining, budget.currency)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-3 pl-2">
                            <div className="mb-2 flex items-center justify-between">
                                <div className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${statusConfig.badgeClass}`}>
                                    <StatusIcon size={16} className={statusConfig.textClass} />
                                    {statusConfig.label}
                                </div>
                                <span className="text-sm font-bold text-slate-900">
                                    {spentPercent.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-white shadow-inner">
                                <div
                                    className={`h-full rounded-full ${budget.status === 'OVER_BUDGET' ? 'bg-rose-600' : budget.status === 'WARNING' ? 'bg-amber-500' : lane.bar} transition-all duration-500`}
                                    style={{ width: `${Math.min(spentPercent, 100)}%` }}
                                />
                            </div>
                        </div>

                        {budget.expense_count > 0 && (
                            <div className="ml-2 flex items-center gap-2 border-t border-white/70 pt-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-slate-700">{budget.expense_count}</span>
                                    <span>expense{budget.expense_count !== 1 ? 's' : ''} recorded</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BudgetList;
