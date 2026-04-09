import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { createGoal } from '../../../services/budgetApi';

const GoalForm = ({ onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        goal_type: 'OTHER',
        target_amount: '',
        current_amount: '0',
        currency: 'KES',
        target_date: '',
        monthly_contribution: '',
        is_priority: false,
        icon: 'Target',
        color: '#3b82f6',
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createGoal(formData);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Failed to create goal:', error);
            setIsSubmitting(false);
        }
    };

    const goalTypes = [
        { value: 'EMERGENCY_FUND', label: 'Emergency Fund' },
        { value: 'VACATION', label: 'Vacation' },
        { value: 'HOME', label: 'Home Purchase' },
        { value: 'CAR', label: 'Car Purchase' },
        { value: 'EDUCATION', label: 'Education' },
        { value: 'RETIREMENT', label: 'Retirement' },
        { value: 'DEBT_PAYOFF', label: 'Debt Payoff' },
        { value: 'INVESTMENT', label: 'Investment' },
        { value: 'OTHER', label: 'Other' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/55 backdrop-blur-sm p-4">
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[1.75rem] border border-emerald-200 bg-[#f7fbf9] shadow-2xl shadow-emerald-900/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 rounded-t-[1.75rem] border-b border-emerald-400/30 bg-gradient-to-r from-[#0f5f52] via-[#147461] to-[#1e9076] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                                <Target className="h-5 w-5 text-[#ffd24a]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Create Financial Goal</h3>
                                <p className="text-xs text-emerald-50/85">Set a target and track your progress</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-emerald-50/85 transition-colors hover:bg-white/15 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Goal Name */}
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-[#0c4f43]">
                                Goal Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Emergency Fund, Dream Vacation"
                                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-[#1a8a72] focus:outline-none focus:ring-2 focus:ring-[#1a8a72]/20"
                            />
                        </div>

                        {/* Goal Type */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0c4f43]">
                                Goal Type
                            </label>
                            <select
                                name="goal_type"
                                value={formData.goal_type}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-[#1a8a72] focus:outline-none focus:ring-2 focus:ring-[#1a8a72]/20"
                            >
                                {goalTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Target Amount */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0c4f43]">
                                Target Amount
                            </label>
                            <input
                                type="number"
                                name="target_amount"
                                value={formData.target_amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-[#1a8a72] focus:outline-none focus:ring-2 focus:ring-[#1a8a72]/20"
                            />
                        </div>

                        {/* Target Date */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0c4f43]">
                                Target Date (Optional)
                            </label>
                            <input
                                type="date"
                                name="target_date"
                                value={formData.target_date}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-[#1a8a72] focus:outline-none focus:ring-2 focus:ring-[#1a8a72]/20"
                            />
                        </div>

                        {/* Monthly Contribution */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0c4f43]">
                                Monthly Contribution (Optional)
                            </label>
                            <input
                                type="number"
                                name="monthly_contribution"
                                value={formData.monthly_contribution}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-[#1a8a72] focus:outline-none focus:ring-2 focus:ring-[#1a8a72]/20"
                            />
                        </div>

                        {/* Priority */}
                        <div className="sm:col-span-2">
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-[#edf7f3] p-4">
                                <input
                                    type="checkbox"
                                    name="is_priority"
                                    checked={formData.is_priority}
                                    onChange={handleChange}
                                    className="mt-0.5 h-5 w-5 rounded border-emerald-300 text-[#147461] focus:ring-2 focus:ring-[#1a8a72]/20"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-900">Priority Goal</span>
                                    <p className="mt-0.5 text-xs text-slate-700">
                                        Mark this as your main financial priority
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Notes */}
                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-[#0c4f43]">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Add any details about this goal..."
                                className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition-all focus:border-[#1a8a72] focus:outline-none focus:ring-2 focus:ring-[#1a8a72]/20"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-[#0f5f52] transition-all hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-gradient-to-r from-[#0f5f52] to-[#1a8a72] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition-all hover:from-[#0c4d43] hover:to-[#167561] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalForm;
