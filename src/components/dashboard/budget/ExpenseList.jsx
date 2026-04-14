import React, { useState } from 'react';
import { Trash2, Edit2, MoreVertical, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../../utils/budgetHelpers';
import { deleteExpense } from '../../../services/budgetApi';
import ExpenseForm from './ExpenseForm';

const ExpenseList = ({ expenses, onUpdate, compact = false }) => {
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
            CASH: { label: 'Cash', color: 'primary' },
            CARD: { label: 'Card', color: 'indigo' },
            MOBILE_MONEY: { label: 'M-Pesa', color: 'primary' },
            BANK_TRANSFER: { label: 'Bank', color: 'blue' },
            OTHER: { label: 'Other', color: 'slate' },
        };
        return badges[method] || badges.OTHER;
    };

    if (!expenses || expenses.length === 0) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <ShoppingBag className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Expenses Yet</h3>
                    <p className="mt-2 text-sm text-slate-600">
                        Start recording your expenses to track spending
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-4">
                        <h3 className="text-lg font-bold text-slate-900">Recent Expenses</h3>
                        <p className="mt-1 text-sm text-slate-600">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {expenses.map((expense) => {
                            const isDeleting = deletingId === expense.uuid;
                            const paymentBadge = getPaymentMethodBadge(expense.payment_method);

                            return (
                                <div
                                    key={expense.uuid}
                                    className={`group px-6 py-4 transition-all hover:bg-slate-50 ${
                                        isDeleting ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Details (NO ICON) */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-900 truncate">
                                                        {expense.description}
                                                    </h4>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {expense.category_name}
                                                        {expense.merchant && ` • ${expense.merchant}`}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-right shrink-0">
                                                    <p className="text-lg font-bold text-slate-900">
                                                        {formatCurrency(expense.amount, expense.currency)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs text-slate-500">
                                                    {formatDateShort(expense.expense_date)}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className={`rounded-lg bg-${paymentBadge.color}-50 px-2 py-0.5 text-xs font-semibold text-${paymentBadge.color}-700`}>
                                                    {paymentBadge.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="relative shrink-0">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === expense.uuid ? null : expense.uuid)}
                                                disabled={isDeleting}
                                                className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
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

            {/* Edit Expense Modal */}
            {editingExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-2xl">
                        <ExpenseForm
                            initialValues={editingExpense}
                            onSuccess={() => {
                                setEditingExpense(null);
                                if (onUpdate) onUpdate();
                            }}
                            onCancel={() => setEditingExpense(null)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ExpenseList;
