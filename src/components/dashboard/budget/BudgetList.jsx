import React, { useState } from 'react';
import { Trash2, Edit2, MoreVertical, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';

const BudgetList = ({ budgets, onEdit, onDelete, deletingId, compact = false }) => {
    const [activeMenu, setActiveMenu] = useState(null);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ON_TRACK':
                return {
                    color: 'primary',
                    icon: CheckCircle2,
                    label: 'On Track',
                    bgClass: 'bg-primary-50',
                    borderClass: 'border-primary-200',
                    textClass: 'text-primary-700',
                };
            case 'WARNING':
                return {
                    color: 'amber',
                    icon: AlertTriangle,
                    label: 'Warning',
                    bgClass: 'bg-amber-50',
                    borderClass: 'border-amber-200',
                    textClass: 'text-amber-700',
                };
            case 'OVER_BUDGET':
                return {
                    color: 'rose',
                    icon: AlertTriangle,
                    label: 'Over Budget',
                    bgClass: 'bg-rose-50',
                    borderClass: 'border-rose-200',
                    textClass: 'text-rose-700',
                };
            default:
                return {
                    color: 'slate',
                    icon: CheckCircle2,
                    label: 'Active',
                    bgClass: 'bg-slate-50',
                    borderClass: 'border-slate-200',
                    textClass: 'text-slate-700',
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
                const isDeleting = deletingId === budget.uuid;

                return (
                    <div
                        key={budget.uuid}
                        className={`group relative overflow-hidden rounded-[1.75rem] border ${statusConfig.borderClass} ${statusConfig.bgClass} p-6 shadow-sm transition-all hover:shadow-md ${
                            isDeleting ? 'opacity-50' : ''
                        } ${compact ? 'p-4' : ''}`}
                    >
                        {/* Header - NO ICON */}
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-slate-900">{budget.category_name}</h4>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">{budget.period_display}</p>
                            </div>

                            {/* Actions Menu */}
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
                                                Edit Budget
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
                                                Delete Budget
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Amounts */}
                        <div className="mb-4 space-y-2">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-medium text-slate-600">Budgeted</span>
                                <span className="text-lg font-bold text-slate-900">
                                    {formatCurrency(budget.amount, budget.currency)}
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-medium text-slate-600">Spent</span>
                                <span className={`text-lg font-bold ${statusConfig.textClass}`}>
                                    {formatCurrency(budget.total_spent, budget.currency)}
                                </span>
                            </div>
                            <div className={`flex items-baseline justify-between rounded-lg ${statusConfig.bgClass} px-3 py-2`}>
                                <span className={`text-sm font-bold ${statusConfig.textClass}`}>Remaining</span>
                                <span className={`text-lg font-bold ${statusConfig.textClass}`}>
                                    {formatCurrency(budget.remaining, budget.currency)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StatusIcon size={16} className={statusConfig.textClass} />
                                    <span className={`text-xs font-bold ${statusConfig.textClass}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">
                                    {budget.spent_percentage.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-white shadow-inner">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r from-${statusConfig.color}-400 to-${statusConfig.color}-600 transition-all duration-500`}
                                    style={{ width: `${Math.min(budget.spent_percentage, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        {budget.expense_count > 0 && (
                            <div className="flex items-center gap-2 pt-3 text-xs text-slate-500 border-t border-white/50">
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
