import React, { useState } from 'react';
import { Pencil, Trash2, AlertCircle, Calendar } from 'lucide-react';

const LiabilityList = ({ liabilities, onEdit, onDelete, loading, currency = 'KES' }) => {
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'ACTIVE': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Active' },
            'PAID': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
            'OVERDUE': { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' }
        };

        const config = statusConfig[status] || statusConfig['ACTIVE'];

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

    if (!liabilities || liabilities.length === 0) {
        return (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No liabilities recorded</h3>
                <p className="text-sm text-gray-500 mb-6">Track what you owe for accurate net worth</p>
                <button 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => onEdit(null)}
                >
                    Add Liability
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {liabilities.map((liability) => (
                <div 
                    key={liability.uuid} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            {/* Left Section */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2"
                                    style={{ 
                                        borderColor: liability.category_color,
                                        backgroundColor: liability.category_color + '10' 
                                    }}
                                >
                                    <div 
                                        className="w-6 h-6 rounded-full"
                                        style={{ backgroundColor: liability.category_color }}
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 truncate">
                                            {liability.name}
                                        </h4>
                                        {liability.is_overdue && (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
                                                <AlertCircle size={10} />
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                        <span className="font-medium text-gray-700">{liability.category_name}</span>
                                        {liability.creditor && <span>{liability.creditor}</span>}
                                        {liability.due_date && (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={12} />
                                                Due: {formatDate(liability.due_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Section */}
                            <div className="flex items-start gap-3 shrink-0">
                                <div className="text-right">
                                    <p className="text-lg font-bold text-red-600">
                                        {currency} {formatAmount(liability.amount)}
                                    </p>
                                    <div className="mt-1">
                                        {getStatusBadge(liability.status)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(liability)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                        title="Edit liability"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(liability.uuid)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        title="Delete liability"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === liability.uuid && (
                        <div className="bg-red-50 border-t border-red-100 px-4 py-3">
                            <p className="text-sm text-red-800 mb-3 font-medium">Delete this liability?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(liability.uuid)}
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

export default LiabilityList;