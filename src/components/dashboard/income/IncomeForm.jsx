import React, { useState, useEffect } from 'react';
import { useIncome } from '../../../contexts/IncomeContext';
import { X } from 'lucide-react';

const IncomeForm = ({ income, onClose, onSuccess }) => {
    const { createIncome, updateIncome, categories } = useIncome();
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        source: '',
        income_date: new Date().toISOString().split('T')[0],
        frequency: 'ONE_TIME',
        is_recurring: false,
        recurring_end_date: '',
        status: 'RECEIVED',
        is_taxable: false,
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const frequencyOptions = [
        { value: 'ONE_TIME', label: 'One-time' },
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'BIWEEKLY', label: 'Bi-weekly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'YEARLY', label: 'Yearly' }
    ];

    const statusOptions = [
        { value: 'RECEIVED', label: 'Received', color: 'text-green-700' },
        { value: 'EXPECTED', label: 'Expected', color: 'text-blue-700' },
        { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-700' }
    ];

    useEffect(() => {
        if (income) {
            setFormData({
                category: income.category || '',
                amount: income.amount || '',
                description: income.description || '',
                source: income.source || '',
                income_date: income.income_date || new Date().toISOString().split('T')[0],
                frequency: income.frequency || 'ONE_TIME',
                is_recurring: income.is_recurring || false,
                recurring_end_date: income.recurring_end_date || '',
                status: income.status || 'RECEIVED',
                is_taxable: income.is_taxable || false,
                notes: income.notes || ''
            });
        }
    }, [income]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            
            // If toggling recurring off, reset frequency to ONE_TIME
            if (field === 'is_recurring' && !value) {
                updated.frequency = 'ONE_TIME';
                updated.recurring_end_date = '';
            }
            
            // If toggling recurring on and frequency is ONE_TIME, change to MONTHLY
            if (field === 'is_recurring' && value && prev.frequency === 'ONE_TIME') {
                updated.frequency = 'MONTHLY';
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const submitData = { ...formData };
            
            // Remove empty optional fields
            if (!submitData.source) delete submitData.source;
            if (!submitData.recurring_end_date) delete submitData.recurring_end_date;
            if (!submitData.notes) delete submitData.notes;

            if (income) {
                await updateIncome(income.uuid, submitData);
            } else {
                await createIncome(submitData);
            }
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save income');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            {income ? 'Edit Income' : 'Add New Income'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Category Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Income Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select a category...</option>
                            {categories.map((cat) => (
                                <option key={cat.uuid} value={cat.uuid}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount and Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    KES
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.income_date}
                                onChange={(e) => handleChange('income_date', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Monthly salary, Freelance project"
                        />
                    </div>

                    {/* Source */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Source (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => handleChange('source', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Company name, Client name"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleChange('status', option.value)}
                                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                                        formData.status === option.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recurring Toggle */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_recurring}
                                onChange={(e) => handleChange('is_recurring', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Recurring Income</span>
                                <span className="block text-xs text-gray-500">This income repeats regularly</span>
                            </div>
                        </label>

                        {/* Recurring Options */}
                        {formData.is_recurring && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frequency
                                    </label>
                                    <select
                                        value={formData.frequency}
                                        onChange={(e) => handleChange('frequency', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        {frequencyOptions.filter(opt => opt.value !== 'ONE_TIME').map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.recurring_end_date}
                                        onChange={(e) => handleChange('recurring_end_date', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Taxable Toggle */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_taxable}
                                onChange={(e) => handleChange('is_taxable', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Taxable Income</span>
                                <span className="block text-xs text-gray-500">This income is subject to tax</span>
                            </div>
                        </label>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Any additional details..."
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting || !formData.category || !formData.amount || !formData.description}
                            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            {submitting ? 'Saving...' : income ? 'Update Income' : 'Add Income'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IncomeForm;