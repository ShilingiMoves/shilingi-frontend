import React, { useState, useEffect } from 'react';
import { DollarSign, Tag, Calendar, FileText, CreditCard, Building2, X } from 'lucide-react';
import { getCategories, createExpense, updateExpense } from '../../../services/budgetApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

const ExpenseForm = ({ initialValues, onSuccess, onCancel }) => {
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [submitError, setSubmitError] = useState('');
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

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialValues) {
            setFormData({
                category: initialValues.category ? String(initialValues.category) : '',
                amount: initialValues.amount || '',
                description: initialValues.description || '',
                expense_date: initialValues.expense_date || new Date().toISOString().split('T')[0],
                payment_method: initialValues.payment_method || 'CASH',
                merchant: initialValues.merchant || '',
                notes: initialValues.notes || '',
                currency: initialValues.currency || 'KES',
            });
        }
    }, [initialValues]);

    const loadCategories = async () => {
        try {
            setLoadError('');
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setLoadError('We could not load budget categories right now. Try again in a moment.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubmitError('');
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!isEditing && !formData.category) {
            setSubmitError('Choose a budget category before recording the expense.');
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setSubmitError('Enter a valid expense amount greater than zero.');
            return;
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
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            {isEditing && onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                    <X size={20} />
                </button>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                    {isEditing ? 'Edit Expense' : 'Record Expense'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                    {isEditing ? 'Update expense details' : 'Track spending against one of your budget categories'}
                </p>
            </div>

            {!isEditing && categories.length === 0 && !loadError && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Create a budget category first, then you can record spending against it here.
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
                {/* Category */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Tag size={16} className="text-slate-500" />
                        Category
                    </label>
                    {isEditing ? (
                        // Show category as read-only text when editing
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            {initialValues.category_name}
                        </div>
                    ) : (
                        // Show dropdown when creating
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={categories.length === 0}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat.uuid || cat.id} value={cat.value}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
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
                        Amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
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
                        Description
                    </label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="What did you spend on?"
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
                            <option value="MOBILE_MONEY">Mobile Money</option>
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
                        {isSubmitting ? (isEditing ? 'Updating...' : 'Recording...') : (isEditing ? 'Update Expense' : 'Record Expense')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;

