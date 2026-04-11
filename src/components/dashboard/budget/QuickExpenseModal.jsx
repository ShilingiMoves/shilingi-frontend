import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { getCategories, quickExpense } from '../../../services/budgetApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

const QuickExpenseModal = ({ onClose, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoadError('');
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            setLoadError('We could not load budget categories right now.');
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

        if (!formData.category) {
            setSubmitError('Choose a category before adding the expense.');
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setSubmitError('Enter a valid amount greater than zero.');
            return;
        }

        setIsSubmitting(true);

        try {
            await quickExpense({
                ...formData,
                category: formData.category || '',
            });
            if (onSuccess) onSuccess();
            markDashboardDataExists();
            setIsSubmitting(false);
        } catch (error) {
            console.error('Failed to add expense:', error);
            const errorMessage =
                error?.response?.data?.errors ||
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.response?.data ||
                error?.message ||
                'We could not add this expense right now.';
            setSubmitError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                                <Zap className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Quick Expense</h3>
                                <p className="text-xs text-slate-600">Record an expense in seconds</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {categories.length === 0 && !loadError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Create a budget category first, then add an expense here.
                        </div>
                    )}

                    {loadError && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {loadError}
                        </div>
                    )}

                    {submitError && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {submitError}
                        </div>
                    )}

                    {/* Category */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={categories.length === 0}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.uuid || cat.id} value={cat.value}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
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
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
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

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || categories.length === 0}
                            className="flex-1 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickExpenseModal;

