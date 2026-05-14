import React, { useState, useEffect } from 'react';
import { useNetWorth } from '../../../contexts/NetWorthContext';
import { X } from 'lucide-react';
import NumericInput from '../../common/NumericInput';

const LiabilityForm = ({ liability, onClose, onSuccess }) => {
    const { createLiability, updateLiability, liabilityCategories, fetchLiabilities, fetchSummary } = useNetWorth();
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        amount: '',
        currency: 'KES',
        due_date: '',
        creditor: '',
        status: 'ACTIVE',
        include_in_net_worth: true,
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const statusOptions = [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PAID', label: 'Paid' },
    ];

    useEffect(() => {
        if (liability) {
            setFormData({
                name: liability.name || '',
                category: liability.category || '',
                amount: liability.amount || '',
                currency: liability.currency || 'KES',
                due_date: liability.due_date || '',
                creditor: liability.creditor || '',
                status: liability.status || 'ACTIVE',
                include_in_net_worth: liability.include_in_net_worth !== undefined ? liability.include_in_net_worth : true,
                notes: liability.notes || ''
            });
        }
    }, [liability]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const submitData = { ...formData };
            
            // Remove empty optional fields
            if (!submitData.due_date) delete submitData.due_date;
            if (!submitData.creditor) delete submitData.creditor;
            if (!submitData.notes) delete submitData.notes;

            if (liability) {
                await updateLiability(liability.uuid, submitData);
            } else {
                await createLiability(submitData);
            }
            
            setSuccess(liability ? 'Liability updated successfully!' : 'Liability added successfully!');
            
            // Refresh data
            await Promise.all([fetchLiabilities(), fetchSummary()]);
            
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.message || 'Failed to save liability');
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
                            {liability ? 'Edit Liability' : 'Add New Liability'}
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
                    {/* Alerts */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {/* Liability Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Liability Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Credit Card Bill, Loan Payment"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select a category...</option>
                            {liabilityCategories.map((cat) => (
                                <option key={cat.uuid} value={cat.uuid}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount and Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    KES
                                </span>
                                <NumericInput
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
                                Due Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => handleChange('due_date', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Creditor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Creditor (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.creditor}
                            onChange={(e) => handleChange('creditor', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Bank name, Company"
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

                    {/* Include in Net Worth */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.include_in_net_worth}
                                onChange={(e) => handleChange('include_in_net_worth', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Include in Net Worth</span>
                                <span className="block text-xs text-gray-500">Count this liability in net worth calculations</span>
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
                            disabled={submitting || !formData.name || !formData.category || !formData.amount}
                            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            {submitting ? 'Saving...' : liability ? 'Update Liability' : 'Add Liability'}
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

export default LiabilityForm;