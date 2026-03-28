import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Calendar } from 'lucide-react';
import IncomeStatCard from './IncomeStatCard';

const IncomeSummary = ({ summary, loading }) => {
    if (!summary && !loading) {
        return null;
    }

    const currentMonth = summary?.current_month || {};
    const currency = summary?.currency || 'KES';
    const incomeChange = summary?.income_change_percentage || 0;
    const expenseChange = summary?.expense_change_percentage || 0;

    const getStatusColor = (status) => {
        switch(status) {
            case 'surplus': return 'text-green-600';
            case 'deficit': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusBg = (status) => {
        switch(status) {
            case 'surplus': return 'bg-green-50';
            case 'deficit': return 'bg-red-50';
            default: return 'bg-gray-50';
        }
    };

    // Helper function to safely format numbers
    const formatNumber = (value) => {
        const num = parseFloat(value) || 0;
        return num.toFixed(1);
    };

    const formatCurrency = (value) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <IncomeStatCard
                    title="Total Income"
                    value={currentMonth.total_income || 0}
                    currency={currency}
                    change={incomeChange}
                    trend={incomeChange > 0 ? 'up' : incomeChange < 0 ? 'down' : 'neutral'}
                    icon={<TrendingUp />}
                    subtitle={currentMonth.period_display}
                    loading={loading}
                />

                <IncomeStatCard
                    title="Total Expenses"
                    value={currentMonth.total_expenses || 0}
                    currency={currency}
                    change={expenseChange}
                    trend={expenseChange > 0 ? 'down' : expenseChange < 0 ? 'up' : 'neutral'}
                    icon={<TrendingDown />}
                    subtitle={currentMonth.period_display}
                    loading={loading}
                />

                <IncomeStatCard
                    title="Net Cash Flow"
                    value={currentMonth.net_cashflow || 0}
                    currency={currency}
                    trend={currentMonth.net_cashflow > 0 ? 'up' : currentMonth.net_cashflow < 0 ? 'down' : 'neutral'}
                    icon={<DollarSign />}
                    subtitle={`${currentMonth.is_surplus ? 'Surplus' : currentMonth.is_deficit ? 'Deficit' : 'Balanced'}`}
                    loading={loading}
                />

                <IncomeStatCard
                    title="Savings Rate"
                    value={`${formatNumber(currentMonth.savings_rate)}%`}
                    trend={parseFloat(currentMonth.savings_rate) > 20 ? 'up' : parseFloat(currentMonth.savings_rate) < 10 ? 'down' : 'neutral'}
                    icon={<RefreshCw />}
                    subtitle="Of total income"
                    loading={loading}
                />
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recurring Income */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <RefreshCw className="text-white" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                            Monthly
                        </span>
                    </div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Recurring Income</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {currency} {formatCurrency(summary?.monthly_recurring_income)}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">Reliable monthly earnings</p>
                </div>

                {/* Income Sources */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <Calendar className="text-white" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                            Active
                        </span>
                    </div>
                    <p className="text-sm font-medium text-purple-900 mb-1">Income Sources</p>
                    <p className="text-2xl font-bold text-purple-900">
                        {summary?.income_sources_count || 0}
                    </p>
                    <p className="text-xs text-purple-700 mt-2">Different income categories</p>
                </div>

                {/* Status Card */}
                <div className={`bg-gradient-to-br ${
                    currentMonth.is_surplus 
                        ? 'from-green-50 to-green-100 border-green-200' 
                        : currentMonth.is_deficit 
                        ? 'from-red-50 to-red-100 border-red-200'
                        : 'from-gray-50 to-gray-100 border-gray-200'
                } rounded-xl p-5 border`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 ${
                            currentMonth.is_surplus ? 'bg-green-500' : currentMonth.is_deficit ? 'bg-red-500' : 'bg-gray-500'
                        } rounded-lg`}>
                            {currentMonth.is_surplus ? (
                                <TrendingUp className="text-white" size={20} />
                            ) : currentMonth.is_deficit ? (
                                <TrendingDown className="text-white" size={20} />
                            ) : (
                                <DollarSign className="text-white" size={20} />
                            )}
                        </div>
                        <span className={`text-xs font-semibold ${
                            currentMonth.is_surplus ? 'text-green-700 bg-green-200' : 
                            currentMonth.is_deficit ? 'text-red-700 bg-red-200' : 
                            'text-gray-700 bg-gray-200'
                        } px-2 py-1 rounded-full`}>
                            {currentMonth.period_display || 'Current Month'}
                        </span>
                    </div>
                    <p className={`text-sm font-medium ${getStatusColor(
                        currentMonth.is_surplus ? 'surplus' : currentMonth.is_deficit ? 'deficit' : 'balanced'
                    )} mb-1`}>
                        Financial Status
                    </p>
                    <p className={`text-2xl font-bold ${getStatusColor(
                        currentMonth.is_surplus ? 'surplus' : currentMonth.is_deficit ? 'deficit' : 'balanced'
                    )}`}>
                        {currentMonth.is_surplus ? 'Surplus' : currentMonth.is_deficit ? 'Deficit' : 'Balanced'}
                    </p>
                    <p className={`text-xs ${getStatusColor(
                        currentMonth.is_surplus ? 'surplus' : currentMonth.is_deficit ? 'deficit' : 'balanced'
                    )} mt-2`}>
                        {currentMonth.is_surplus 
                            ? 'You\'re earning more than spending' 
                            : currentMonth.is_deficit 
                            ? 'Expenses exceed income'
                            : 'Income equals expenses'}
                    </p>
                </div>
            </div>

            {/* Top Income Sources */}
            {summary?.top_income_sources && summary.top_income_sources.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Income Sources</h3>
                    <div className="space-y-3">
                        {summary.top_income_sources.map((source, index) => {
                            const total = parseFloat(source.total || 0);
                            const maxAmount = parseFloat(summary.top_income_sources[0].total || 1);
                            const percentage = (total / maxAmount) * 100;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-900">{source.category}</span>
                                        <span className="font-bold text-gray-900">
                                            {currency} {formatCurrency(total)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomeSummary;