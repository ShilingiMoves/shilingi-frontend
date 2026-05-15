import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Calendar, CheckCircle2, CreditCard, DollarSign, FileText, PiggyBank, ShoppingBasket, Tag, Wallet, X } from 'lucide-react';
import { getCategories, createExpense, updateExpense } from '../../../services/budgetApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { deriveBudgetCategoryType } from '../../../utils/budgetSetup';
import NumericInput from '../../common/NumericInput';

const expenseLanes = [
    { type: 'Needs', icon: Wallet, helper: 'Essential spending' },
    { type: 'Wants', icon: ShoppingBasket, helper: 'Lifestyle spending' },
    { type: 'Savings', icon: PiggyBank, helper: 'Savings movement' },
];

const laneStyles = {
    Needs: {
        shell: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        active: 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-600/20',
    },
    Wants: {
        shell: 'border-amber-200 bg-amber-50 text-amber-800',
        active: 'border-amber-500 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20',
    },
    Savings: {
        shell: 'border-blue-200 bg-blue-50 text-blue-800',
        active: 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20',
    },
};

const normalise = (value = '') => String(value).trim().toLowerCase();

const ExpenseForm = ({ initialValues, onSuccess, onCancel, budgets = [] }) => {
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [selectedLane, setSelectedLane] = useState('Needs');
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'CASH',
        merchant: '',
        notes: '',
        currency: 'KES',
    });

    const isEditing = !!initialValues;

    async function loadCategories() {
        try {
            setLoadError('');
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setLoadError('We could not load budget categories right now. Try again in a moment.');
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialValues) {
            setSelectedLane(deriveBudgetCategoryType(initialValues.category_name));
            setFormData({
                category: initialValues.category ? String(initialValues.category) : '',
                amount: initialValues.amount || '',
                description: initialValues.description || '',
                expense_date: initialValues.expense_date || new Date().toISOString().split('T')[0],
                payment_method: initialValues.payment_method === 'MOBILE_MONEY' ? 'MPESA' : (initialValues.payment_method || 'CASH'),
                merchant: initialValues.merchant || '',
                notes: initialValues.notes || '',
                currency: initialValues.currency || 'KES',
            });
        }
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubmitError('');
        if (name === 'category') {
            const categoryName = categories.find((item) => String(item.value) === String(value))?.name;
            if (categoryName) setSelectedLane(deriveBudgetCategoryType(categoryName));
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLaneSelect = (lane) => {
        setSelectedLane(lane);
        setSubmitError('');
        if (!isEditing) {
            setFormData((current) => ({ ...current, category: '' }));
        }
    };

    const categoryOptions = useMemo(() => {
        const categoriesByName = new Map(categories.map((item) => [normalise(item.name), item]));
        const budgetBackedOptions = budgets
            .filter((budget) => deriveBudgetCategoryType(budget.category_name) === selectedLane)
            .map((budget) => {
                const category = categoriesByName.get(normalise(budget.category_name));
                const categoryValue = category?.value || budget.category || budget.category_id || budget.category_uuid || budget.categoryId || budget.category_name;
                return {
                    id: category?.id || budget.category || budget.uuid || budget.category_name,
                    uuid: category?.uuid || budget.uuid || budget.category_name,
                    value: String(categoryValue),
                    name: category?.name || budget.category_name,
                    remaining: Number(budget.amount || 0) - Number(budget.total_spent || 0),
                };
            })
            .filter((item) => item.name && item.value);

        if (budgetBackedOptions.length) return budgetBackedOptions;
        return categories.filter((item) => deriveBudgetCategoryType(item.name) === selectedLane);
    }, [budgets, categories, selectedLane]);

    const selectedCategoryOption = categoryOptions.find((item) => String(item.value) === String(formData.category));
    const selectedCategoryName = isEditing
        ? initialValues?.category_name
        : selectedCategoryOption?.name;
    const selectedBudget = budgets.find((item) => normalise(item.category_name) === normalise(selectedCategoryName));
    const selectedRemaining = selectedBudget
        ? Math.max(Number(selectedBudget.amount || 0) - Number(selectedBudget.total_spent || 0) + (isEditing ? Number(initialValues?.amount || 0) : 0), 0)
        : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!isEditing && !formData.category) {
            setSubmitError('Choose a budget category before tracking the expense.');
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setSubmitError('Enter a valid expense amount greater than zero.');
            return;
        }

        const expenseAmount = Number(formData.amount || 0);
        if (selectedBudget) {
            if (expenseAmount > selectedRemaining) {
                setSubmitError(`This expense exceeds the remaining ${selectedLane.toLowerCase()} limit for ${selectedCategoryName}. Remaining available is KES ${selectedRemaining.toLocaleString('en-KE')}. Please review the amount or adjust the budget item.`);
                return;
            }
        }

        setIsSubmitting(true);

        try {
            let submitData;

            if (isEditing) {
                // When editing, EXCLUDE the category field entirely
                const { category, ...dataWithoutCategory } = formData;
                submitData = dataWithoutCategory;
                
                console.log('Updating expense (without category):', submitData);
                await updateExpense(initialValues.uuid, submitData);
            } else {
                // When creating, include category
                submitData = {
                    ...formData,
                    category: formData.category || '',
                };
                
                console.log('Creating expense:', submitData);
                await createExpense(submitData);
                
                // Reset form only for new expenses
                setFormData({
                    category: '',
                    amount: '',
                    description: '',
                    expense_date: new Date().toISOString().split('T')[0],
                    payment_method: 'CASH',
                    merchant: '',
                    notes: '',
                    currency: 'KES',
                });
            }

            if (onSuccess) onSuccess();
            markDashboardDataExists();
            setIsSubmitting(false);
        } catch (error) {
            console.error('Failed to save expense:', error);
            const errorMessage =
                error?.response?.data?.errors ||
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                'We could not save this expense right now.';
            setSubmitError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-[1.25rem] border border-emerald-100 bg-white shadow-sm">
            {isEditing && onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                    <X size={20} />
                </button>
            )}

            <div className="bg-gradient-to-br from-[#0f7a55] via-[#11814f] to-[#35a86e] px-5 py-5 text-white">
                <h3 className="text-xl font-extrabold">
                    {isEditing ? 'Edit Expense' : 'Track Expense'}
                </h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-white/75">
                    Pick the lane, choose the budget item, then track what was spent.
                </p>
            </div>

            <div className="p-5">
            {!isEditing && categories.length === 0 && !loadError && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Create a budget category first, then you can track spending against it here.
                </div>
            )}

            {loadError && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {loadError}
                </div>
            )}

            {submitError && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <p className="mb-2 text-sm font-bold text-slate-900">Start by choosing where this expense belongs</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                        {expenseLanes.map((lane) => {
                            const Icon = lane.icon;
                            const active = selectedLane === lane.type;
                            const styles = laneStyles[lane.type];
                            return (
                                <button
                                    key={lane.type}
                                    type="button"
                                    onClick={() => handleLaneSelect(lane.type)}
                                    disabled={isEditing}
                                    className={`rounded-[0.95rem] border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-80 ${active ? styles.active : styles.shell}`}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <Icon size={16} />
                                        {active && <CheckCircle2 size={15} />}
                                    </span>
                                    <span className="mt-2 block text-sm font-extrabold">{lane.type}</span>
                                    <span className={`mt-1 block text-[11px] leading-4 ${active ? 'text-inherit opacity-80' : 'opacity-70'}`}>{lane.helper}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Tag size={16} className="text-slate-500" />
                        {selectedLane} Budget Item
                    </label>
                    {isEditing ? (
                        // Show category as read-only text when editing
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            {initialValues.category_name}
                        </div>
                    ) : (
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={categoryOptions.length === 0}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">Select item</option>
                            {categoryOptions.map(cat => (
                                <option key={cat.uuid || cat.id} value={cat.value}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {!isEditing && categoryOptions.length === 0 && (
                        <p className="mt-1 text-xs text-amber-700">
                            Add a {selectedLane.toLowerCase()} item under My Budget Limits first.
                        </p>
                    )}
                    {selectedRemaining !== null && (
                        <p className="mt-1 text-xs font-semibold text-primary-700">
                            Remaining for this item: KES {selectedRemaining.toLocaleString('en-KE')}
                        </p>
                    )}
                    {isEditing && (
                        <p className="mt-1 text-xs text-slate-500">
                            Category cannot be changed after creation
                        </p>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <DollarSign size={16} className="text-slate-500" />
                        Amount Spent
                    </label>
                    <div className="relative">
                        <NumericInput
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                            KES
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FileText size={16} className="text-slate-500" />
                        What did you spend on?
                    </label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="e.g. supermarket, fare, subscription"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                {/* Date & Payment Method */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar size={16} className="text-slate-500" />
                            Date
                        </label>
                        <input
                            type="date"
                            name="expense_date"
                            value={formData.expense_date}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <CreditCard size={16} className="text-slate-500" />
                            Payment Method
                        </label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="MPESA">Mobile Money</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                </div>

                {/* Merchant (Optional) */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Building2 size={16} className="text-slate-500" />
                        Merchant (Optional)
                    </label>
                    <input
                        type="text"
                        name="merchant"
                        value={formData.merchant}
                        onChange={handleChange}
                        placeholder="Store or service name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                {/* Notes (Optional) */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Additional details..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    {isEditing && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || (!isEditing && categories.length === 0)}
                        className="flex-1 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? (isEditing ? 'Updating...' : 'Tracking...') : (isEditing ? 'Update Expense' : 'Track Expense')}
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
};

export default ExpenseForm;

