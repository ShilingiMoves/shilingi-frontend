import React, { useState } from 'react';
import { Edit2, MoreVertical, PiggyBank, ShoppingBag, ShoppingBasket, Trash2, Wallet } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../../utils/budgetHelpers';
import { deleteExpense } from '../../../services/budgetApi';
import { deriveBudgetCategoryType } from '../../../utils/budgetSetup';
import ExpenseForm from './ExpenseForm';

const laneConfig = {
    Needs: { icon: Wallet, shell: 'border-emerald-200 bg-[#f4fbf8]', chip: 'bg-emerald-100 text-emerald-800', amount: 'text-primary-700' },
    Wants: { icon: ShoppingBasket, shell: 'border-amber-200 bg-[#fff8ea]', chip: 'bg-amber-100 text-amber-800', amount: 'text-amber-700' },
    Savings: { icon: PiggyBank, shell: 'border-blue-200 bg-[#f3f7ff]', chip: 'bg-blue-100 text-blue-800', amount: 'text-blue-700' },
};

const ExpenseList = ({ expenses, onUpdate, compact = false, budgets = [] }) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);

    const handleDelete = async (uuid) => {
        if (!window.confirm('Delete this expense?')) return;

        setDeletingId(uuid);
        try {
            await deleteExpense(uuid);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to delete expense:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const getPaymentMethodBadge = (method) => {
        const badges = {
            CASH: { label: 'Cash', className: 'bg-emerald-100 text-emerald-800' },
            CARD: { label: 'Card', className: 'bg-indigo-100 text-indigo-800' },
            MPESA: { label: 'M-Pesa', className: 'bg-emerald-100 text-emerald-800' },
            MOBILE_MONEY: { label: 'M-Pesa', className: 'bg-emerald-100 text-emerald-800' },
            BANK_TRANSFER: { label: 'Bank', className: 'bg-blue-100 text-blue-800' },
            OTHER: { label: 'Other', className: 'bg-slate-100 text-slate-700' },
        };
        return badges[method] || badges.OTHER;
    };

    if (!expenses || expenses.length === 0) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.25rem] border border-emerald-100 bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                        <ShoppingBag className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Expenses Yet</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Add an expense against a budget item to track your spending.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-emerald-100 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-bold text-slate-900">Expense Tracker</h3>
                        <p className="mt-1 text-sm text-slate-600">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} linked to budget items</p>
                    </div>

                    <div className="space-y-3 p-4">
                        {expenses.map((expense) => {
                            const isDeleting = deletingId === expense.uuid;
                            const paymentBadge = getPaymentMethodBadge(expense.payment_method);
                            const laneName = deriveBudgetCategoryType(expense.category_name);
                            const lane = laneConfig[laneName] || laneConfig.Needs;
                            const LaneIcon = lane.icon;

                            return (
                                <div
                                    key={expense.uuid}
                                    className={`group rounded-[1rem] border px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${lane.shell} ${
                                        isDeleting ? 'opacity-50' : ''
                                    } ${compact ? 'px-3 py-3' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] ${lane.chip}`}>
                                                <LaneIcon size={18} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate font-semibold text-slate-900">
                                                            {expense.description}
                                                        </h4>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {expense.category_name}{expense.merchant ? ` - ${expense.merchant}` : ''}
                                                        </p>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className={`text-lg font-extrabold ${lane.amount}`}>
                                                            {formatCurrency(expense.amount, expense.currency)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-xs text-slate-500">
                                                        {formatDateShort(expense.expense_date)}
                                                    </span>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${lane.chip}`}>
                                                        {laneName}
                                                    </span>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paymentBadge.className}`}>
                                                        {paymentBadge.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setActiveMenu(activeMenu === expense.uuid ? null : expense.uuid)}
                                                disabled={isDeleting}
                                                className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-white hover:text-slate-600"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === expense.uuid && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setActiveMenu(null)}
                                                    />
                                                    <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingExpense(expense);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                                        >
                                                            <Edit2 size={16} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleDelete(expense.uuid);
                                                                setActiveMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {editingExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl">
                        <ExpenseForm
                            initialValues={editingExpense}
                            onSuccess={() => {
                                setEditingExpense(null);
                                if (onUpdate) onUpdate();
                            }}
                            onCancel={() => setEditingExpense(null)}
                            budgets={budgets}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ExpenseList;
