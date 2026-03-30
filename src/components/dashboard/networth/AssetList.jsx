import React, { useState } from 'react';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const AssetList = ({ assets, onEdit, onDelete, loading, currency = 'KES' }) => {
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

    if (!assets || assets.length === 0) {
        return (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <TrendingUp className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets added yet</h3>
                <p className="text-sm text-gray-500 mb-6">Start building your wealth by adding your first asset</p>
                <button 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => onEdit(null)}
                >
                    Add Your First Asset
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {assets.map((asset) => {
                const gainLoss = parseFloat(asset.gain_loss || 0);
                const isGain = gainLoss >= 0;

                return (
                    <div 
                        key={asset.uuid} 
                        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                {/* Left Section */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2"
                                        style={{ 
                                            borderColor: asset.category_color,
                                            backgroundColor: asset.category_color + '10' 
                                        }}
                                    >
                                        <div 
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: asset.category_color }}
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {asset.name}
                                            </h4>
                                            {asset.is_liquid && (
                                                <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                                    Liquid
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            <span className="font-medium text-gray-700">{asset.category_name}</span>
                                            {asset.institution && <span>{asset.institution}</span>}
                                            {asset.last_valued_date && (
                                                <span>Valued: {formatDate(asset.last_valued_date)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="flex items-start gap-3 shrink-0">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">
                                            {currency} {formatAmount(asset.current_value)}
                                        </p>
                                        {gainLoss !== 0 && (
                                            <div className={`flex items-center gap-1 text-xs font-medium ${isGain ? 'text-green-600' : 'text-red-600'}`}>
                                                {isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {isGain ? '+' : ''}{formatAmount(gainLoss)}
                                                {asset.gain_loss_percentage && (
                                                    <span>({asset.gain_loss_percentage.toFixed(1)}%)</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onEdit(asset)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            title="Edit asset"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(asset.uuid)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            title="Delete asset"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Info */}
                            {asset.purchase_value && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Purchase Value: {currency} {formatAmount(asset.purchase_value)}</span>
                                        {asset.purchase_date && (
                                            <span>Purchased: {formatDate(asset.purchase_date)}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Delete Confirmation */}
                        {deleteConfirm === asset.uuid && (
                            <div className="bg-red-50 border-t border-red-100 px-4 py-3">
                                <p className="text-sm text-red-800 mb-3 font-medium">Delete this asset?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelete(asset.uuid)}
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
                );
            })}
        </div>
    );
};

export default AssetList;