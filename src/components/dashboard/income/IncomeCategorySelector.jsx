import React, { useState } from 'react';
import { useIncome } from '../../../contexts/IncomeContext';
import { ChevronDown, Plus, Check } from 'lucide-react';

const IncomeCategorySelector = ({ 
    value, 
    onChange, 
    required = true,
    onCreateNew 
}) => {
    const { categories, loading } = useIncome();
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: 'fas fa-money-bill-wave',
        color: '#28a745'
    });

    const availableColors = [
        '#28a745', // Green (default)
        '#007bff', // Blue
        '#6f42c1', // Purple
        '#e83e8c', // Pink
        '#fd7e14', // Orange
        '#dc3545', // Red
        '#17a2b8', // Cyan
        '#20c997', // Teal
        '#ffc107', // Yellow
        '#6c757d', // Gray
    ];

    const selectedCategory = categories.find(cat => cat.uuid === value);

    const handleCreate = async () => {
        if (!newCategory.name.trim()) return;
        
        try {
            const created = await onCreateNew(newCategory);
            onChange(created.uuid);
            setShowCreateForm(false);
            setNewCategory({ name: '', icon: 'fas fa-money-bill-wave', color: '#28a745' });
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Income Category {required && <span className="text-red-500">*</span>}
            </label>

            {!showCreateForm ? (
                <div className="space-y-2">
                    {/* Dropdown Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        >
                            {selectedCategory ? (
                                <div className="flex items-center gap-3">
                                    <span 
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: selectedCategory.color }}
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedCategory.name}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">Select a category...</span>
                            )}
                            <ChevronDown 
                                size={20} 
                                className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <>
                                {/* Backdrop */}
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsOpen(false)}
                                />
                                
                                {/* Menu */}
                                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.uuid}
                                            type="button"
                                            onClick={() => {
                                                onChange(cat.uuid);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                                                value === cat.uuid ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <span 
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <span className="text-sm font-medium text-gray-900 flex-1 text-left">
                                                {cat.name}
                                            </span>
                                            {value === cat.uuid && (
                                                <Check size={18} className="text-blue-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Create New Button */}
                    <button
                        type="button"
                        onClick={() => setShowCreateForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    >
                        <Plus size={16} />
                        Create New Category
                    </button>
                </div>
            ) : (
                /* Create Category Form */
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900">Create Income Category</h4>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setNewCategory({ name: '', icon: 'fas fa-money-bill-wave', color: '#28a745' });
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Category Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Salary, Freelance, Investment Returns"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Color Selector */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Category Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                                    className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                                        newCategory.color === color
                                            ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                                            : 'hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: color }}
                                >
                                    {newCategory.color === color && (
                                        <Check size={16} className="text-white mx-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <div className="flex items-center gap-3">
                            <span 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: newCategory.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">
                                {newCategory.name || 'Category name'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={!newCategory.name.trim()}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Create Category
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setNewCategory({ name: '', icon: 'fas fa-money-bill-wave', color: '#28a745' });
                            }}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomeCategorySelector;