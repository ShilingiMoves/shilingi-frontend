import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Tag, TrendingUp, Bell } from 'lucide-react';
import { getCategories } from '../../../services/budgetApi';

const BudgetForm = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        currency: 'KES',
        period: 'MONTHLY',
        start_date: new Date().toISOString().split('T')[0],
        is_recurring: true,
        alert_threshold: 80,
        notes: '',
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialValues) {
            setFormData({
                category: initialValues.category || '',
                amount: initialValues.amount || '',
                currency: initialValues.currency || 'KES', 
                period: initialValues.period || 'MONTHLY',
                start_date: initialValues.start_date || new Date().toISOString().split('T')[0],
                is_recurring: initialValues.is_recurring ?? true,
                alert_threshold: initialValues.alert_threshold || 80,
                notes: initialValues.notes || '',
            });
        }
    }, [initialValues]);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Ensure category is a valid UUID string
        const submitData = {
            ...formData,
            category: formData.category, // This should be the UUID string
        };
        
        console.log('Submitting budget data:', submitData); // Debug log
        onSubmit(submitData);
    };

    const handleReset = () => {
        setFormData({
            category: '',
            amount: '',
            period: 'MONTHLY',
            start_date: new Date().toISOString().split('T')[0],
            is_recurring: true,
            alert_threshold: 80,
            notes: '',
        });
        if (onCancel) onCancel();
    };

    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                    {initialValues ? 'Edit Budget' : 'Create New Budget'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                    Set spending limits and track your expenses
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Tag size={16} className="text-slate-500" />
                        Category
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        disabled={!!initialValues}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.uuid} value={cat.uuid}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <DollarSign size={16} className="text-slate-500" />
                        Budget Amount
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

                {/* Period & Start Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <TrendingUp size={16} className="text-slate-500" />
                            Period
                        </label>
                        <select
                            name="period"
                            value={formData.period}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Calendar size={16} className="text-slate-500" />
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                </div>

                {/* Alert Threshold */}
                <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                        <span className="flex items-center gap-2">
                            <Bell size={16} className="text-slate-500" />
                            Alert Threshold
                        </span>
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            {formData.alert_threshold}%
                        </span>
                    </label>
                    <input
                        type="range"
                        name="alert_threshold"
                        value={formData.alert_threshold}
                        onChange={handleChange}
                        min="50"
                        max="100"
                        step="5"
                        className="w-full accent-amber-500"
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                        Get notified when spending reaches this percentage
                    </p>
                </div>

                {/* Recurring Checkbox */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            name="is_recurring"
                            checked={formData.is_recurring}
                            onChange={handleChange}
                            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                        />
                        <div>
                            <span className="text-sm font-semibold text-slate-900">Recurring Budget</span>
                            <p className="mt-0.5 text-xs text-slate-600">
                                Automatically renew this budget for the next period
                            </p>
                        </div>
                    </label>
                </div>

                {/* Notes */}
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Notes (Optional)
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Add any additional notes about this budget..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Saving...' : initialValues ? 'Update Budget' : 'Create Budget'}
                    </button>
                    {(initialValues || onCancel) && (
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default BudgetForm;