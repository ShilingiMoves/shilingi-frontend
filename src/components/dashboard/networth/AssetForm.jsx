import React, { useState, useEffect } from 'react';
import { useNetWorth } from '../../../contexts/NetWorthContext';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import NumericInput from '../../common/NumericInput';

const AssetForm = ({ asset, onClose, onSuccess }) => {
    const { createAsset, updateAsset, assetCategories, fetchAssets, fetchSummary } = useNetWorth();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        current_value: '',
        purchase_value: '',
        currency: 'KES',
        purchase_date: '',
        interest_rate: '',
        institution: '',
        account_number: '',
        is_liquid: false,
        include_in_net_worth: true,
        last_valued_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (asset) {
            const hasAdvancedData = asset.purchase_value || asset.purchase_date || 
                                   asset.institution || asset.account_number || asset.interest_rate;
            setShowAdvanced(hasAdvancedData);
            
            setFormData({
                name: asset.name || '',
                category: asset.category || '',
                current_value: asset.current_value || '',
                purchase_value: asset.purchase_value || '',
                currency: asset.currency || 'KES',
                purchase_date: asset.purchase_date || '',
                interest_rate: asset.interest_rate || '',
                institution: asset.institution || '',
                account_number: asset.account_number || '',
                is_liquid: asset.is_liquid || false,
                include_in_net_worth: asset.include_in_net_worth !== undefined ? asset.include_in_net_worth : true,
                last_valued_date: asset.last_valued_date || new Date().toISOString().split('T')[0],
                notes: asset.notes || ''
            });
        }
    }, [asset]);

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
            if (!submitData.purchase_value) delete submitData.purchase_value;
            if (!submitData.purchase_date) delete submitData.purchase_date;
            if (!submitData.interest_rate) delete submitData.interest_rate;
            if (!submitData.institution) delete submitData.institution;
            if (!submitData.account_number) delete submitData.account_number;
            if (!submitData.notes) delete submitData.notes;

            if (asset) {
                await updateAsset(asset.uuid, submitData);
            } else {
                await createAsset(submitData);
            }
            
            setSuccess(asset ? 'Asset updated successfully!' : 'Asset added successfully!');
            
            // Refresh data
            await Promise.all([fetchAssets(), fetchSummary()]);
            
            setTimeout(() => {
                if (onSuccess) onSuccess();
                onClose();
            }, 1000);
        } catch (err) {
            setError(err.message || 'Failed to save asset');
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
                            {asset ? 'Edit Asset' : 'Add New Asset'}
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

                    {/* Asset Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asset Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Savings Account, Property, Investment"
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
                            {assetCategories.map((cat) => (
                                <option key={cat.uuid} value={cat.uuid}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Current Value and Last Valued Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Value <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                    KES
                                </span>
                                <NumericInput
                                    required
                                    value={formData.current_value}
                                    onChange={(e) => handleChange('current_value', e.target.value)}
                                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Valued Date
                            </label>
                            <input
                                type="date"
                                value={formData.last_valued_date}
                                onChange={(e) => handleChange('last_valued_date', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
                    >
                        <span className="text-sm font-medium text-gray-700">
                            Advanced Options (Optional)
                        </span>
                        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {/* Advanced Options - Collapsible */}
                    {showAdvanced && (
                        <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {/* Purchase Value and Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purchase Value
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                            KES
                                        </span>
                                        <NumericInput
                                            value={formData.purchase_value}
                                            onChange={(e) => handleChange('purchase_value', e.target.value)}
                                            className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => handleChange('purchase_date', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Institution and Account */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Institution
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.institution}
                                        onChange={(e) => handleChange('institution', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="e.g., Bank name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.account_number}
                                        onChange={(e) => handleChange('account_number', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Last 4 digits"
                                    />
                                </div>
                            </div>

                            {/* Interest Rate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interest Rate %
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.interest_rate}
                                    onChange={(e) => handleChange('interest_rate', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="e.g., 5.5"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                    placeholder="Any additional details..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Toggles */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_liquid}
                                onChange={(e) => handleChange('is_liquid', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Liquid Asset</span>
                                <span className="block text-xs text-gray-500">Can be quickly converted to cash</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.include_in_net_worth}
                                onChange={(e) => handleChange('include_in_net_worth', e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Include in Net Worth</span>
                                <span className="block text-xs text-gray-500">Count this asset in net worth calculations</span>
                            </div>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting || !formData.name || !formData.category || !formData.current_value}
                            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            {submitting ? 'Saving...' : asset ? 'Update Asset' : 'Add Asset'}
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

export default AssetForm;