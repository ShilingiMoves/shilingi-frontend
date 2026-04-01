import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { useIncome } from '../../../contexts/IncomeContext';
import IncomeSummary from './IncomeSummary';
import IncomeList from './IncomeList';
import IncomeForm from './IncomeForm';
import QuickIncomeModal from './QuickIncomeModal';
import IncomeVsExpenseChart from './IncomeVsExpenseChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import CategoryPieChart from './CategoryPieChart';

const IncomeDashboard = () => {
    const {
        incomes,
        summary,
        history,
        incomeVsExpense,
        loading,
        error,
        fetchIncomes,
        fetchSummary,
        fetchHistory,
        fetchIncomeVsExpense,
        deleteIncome
    } = useIncome();

    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showQuickIncome, setShowQuickIncome] = useState(false);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        recurring: '',
        category: '',
        start_date: '',
        end_date: '',
        current_month: 'true'
    });
    const [activeTab, setActiveTab] = useState('overview');

    // Initial data fetch
    useEffect(() => {
        fetchIncomes(filters);
        fetchHistory(6);
        fetchIncomeVsExpense();
    }, []);

    // Refetch incomes when filters change
    useEffect(() => {
        fetchIncomes(filters);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            // Reset current_month when date filters are applied
            ...(key === 'start_date' || key === 'end_date' ? { current_month: 'false' } : {})
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            recurring: '',
            category: '',
            start_date: '',
            end_date: '',
            current_month: 'true'
        });
    };

    const handleEditIncome = (income) => {
        setSelectedIncome(income);
        setShowIncomeForm(true);
    };

    const handleCloseForm = () => {
        setSelectedIncome(null);
        setShowIncomeForm(false);
    };

    const handleFormSuccess = () => {
        fetchIncomes(filters);
        fetchSummary();
    };

    const handleRefresh = async () => {
        await Promise.all([
            fetchIncomes(filters),
            fetchSummary(),
            fetchHistory(6),
            fetchIncomeVsExpense()
        ]);
    };

    const hasActiveFilters = Object.entries(filters).some(
        ([key, value]) => key !== 'current_month' && value !== ''
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white sm:h-12 sm:w-12">
                                    <TrendingUp size={24} />
                                </span>
                                Income Manager
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Track and manage all your income sources</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            
                            <button
                                onClick={() => setShowQuickIncome(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors duration-200 hover:bg-green-700 hover:shadow-xl"
                            >
                                <Plus size={16} />
                                Quick Add
                            </button>
                            
                            <button
                                onClick={() => {
                                    setSelectedIncome(null);
                                    setShowIncomeForm(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-amber-300/40 transition-colors duration-200 hover:bg-amber-300 hover:shadow-xl"
                            >
                                <Plus size={16} />
                                Add Income
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 overflow-x-auto border-b border-gray-200">
                        <div className="flex min-w-max items-center gap-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                activeTab === 'overview'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                activeTab === 'transactions'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All Income
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                activeTab === 'analytics'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Analytics
                        </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <IncomeSummary summary={summary} loading={loading} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <IncomeVsExpenseChart data={incomeVsExpense} loading={loading} />
                            <MonthlyTrendsChart history={history} loading={loading} />
                        </div>

                        {/* Recent Income */}
                        {summary?.recent_incomes && summary.recent_incomes.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Recent Income</h2>
                                    <button
                                        onClick={() => setActiveTab('transactions')}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        View All
                                    </button>
                                </div>
                                <IncomeList
                                    incomes={summary.recent_incomes.slice(0, 5)}
                                    onEdit={handleEditIncome}
                                    onDelete={deleteIncome}
                                    currency={summary.currency}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Filter size={20} />
                                    Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">All Status</option>
                                        <option value="RECEIVED">Received</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="EXPECTED">Expected</option>
                                    </select>
                                </div>

                                {/* Recurring Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={filters.recurring}
                                        onChange={(e) => handleFilterChange('recurring', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        <option value="">All Types</option>
                                        <option value="true">Recurring Only</option>
                                        <option value="false">One-time Only</option>
                                    </select>
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.start_date}
                                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.end_date}
                                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {Object.entries(filters).map(([key, value]) => {
                                        if (key === 'current_month' || !value) return null;
                                        return (
                                            <span
                                                key={key}
                                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                            >
                                                {key.replace('_', ' ')}: {value}
                                                <button
                                                    onClick={() => handleFilterChange(key, '')}
                                                    className="hover:text-blue-900"
                                                >
                                                    x
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Income List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Income Transactions
                                    {incomes.length > 0 && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({incomes.length} {incomes.length === 1 ? 'entry' : 'entries'})
                                        </span>
                                    )}
                                </h2>
                                <button
                                    disabled={incomes.length === 0}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                            </div>
                            
                            <IncomeList
                                incomes={incomes}
                                onEdit={handleEditIncome}
                                onDelete={deleteIncome}
                                loading={loading}
                                currency={summary?.currency || 'KES'}
                            />
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Top Section - Trends and Comparison */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MonthlyTrendsChart history={history} loading={loading} />
                            <IncomeVsExpenseChart data={incomeVsExpense} loading={loading} />
                        </div>

                        {/* Pie Charts - Only here! */}
                        {incomeVsExpense && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {incomeVsExpense.income_breakdown && incomeVsExpense.income_breakdown.length > 0 && (
                                    <CategoryPieChart
                                        data={incomeVsExpense.income_breakdown}
                                        title="Income by Category"
                                        type="income"
                                    />
                                )}

                                {incomeVsExpense.expense_breakdown && incomeVsExpense.expense_breakdown.length > 0 && (
                                    <CategoryPieChart
                                        data={incomeVsExpense.expense_breakdown}
                                        title="Expenses by Category"
                                        type="expense"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showQuickIncome && (
                <QuickIncomeModal
                    isOpen={showQuickIncome}
                    onClose={() => setShowQuickIncome(false)}
                />
            )}

            {showIncomeForm && (
                <IncomeForm
                    income={selectedIncome}
                    onClose={handleCloseForm}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default IncomeDashboard;

