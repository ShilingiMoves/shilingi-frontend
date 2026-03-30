import React, { useState } from 'react';
import { Pencil, Trash2, Calendar, TrendingUp, RefreshCw } from 'lucide-react';

const IncomeList = ({ incomes, onEdit, onDelete, loading, currency = 'KES' }) => {
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'RECEIVED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Received' },
            'EXPECTED': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Expected' },
            'CANCELLED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig['EXPECTED'];

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const handleDelete = async (uuid) => {
        try {
            await onDelete(uuid);
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!incomes || incomes.length === 0) {
        return (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <TrendingUp className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No income recorded yet</h3>
                <p className="text-sm text-gray-500 mb-6">Start tracking your income to see your financial progress</p>
                <button 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => onEdit(null)}
                >
                    Add Your First Income
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {incomes.map((income) => (
                <div 
                    key={income.uuid} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            {/* Left Section - Color Indicator & Details */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2"
                                    style={{ 
                                        borderColor: income.category_color,
                                        backgroundColor: income.category_color + '10' 
                                    }}
                                >
                                    <div 
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: income.category_color }}
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 truncate">
                                            {income.description}
                                        </h4>
                                        {income.is_recurring && (
                                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                                <RefreshCw size={10} />
                                                {income.frequency_display}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <span className="font-medium text-gray-700">{income.category_name}</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(income.income_date)}
                                        </span>
                                        {income.source && (
                                            <span className="truncate">from {income.source}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Amount & Actions */}
                            <div className="flex items-start gap-3 shrink-0">
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        {currency} {formatAmount(income.amount)}
                                    </p>
                                    <div className="mt-1">
                                        {getStatusBadge(income.status)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(income)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                        title="Edit income"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(income.uuid)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        title="Delete income"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Equivalent for Recurring Income */}
                        {income.is_recurring && income.monthly_equivalent && income.monthly_equivalent !== income.amount && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Monthly equivalent: <span className="font-semibold text-gray-700">{currency} {formatAmount(income.monthly_equivalent)}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === income.uuid && (
                        <div className="bg-red-50 border-t border-red-100 px-4 py-3">
                            <p className="text-sm text-red-800 mb-3 font-medium">Are you sure you want to delete this income?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(income.uuid)}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default IncomeList;