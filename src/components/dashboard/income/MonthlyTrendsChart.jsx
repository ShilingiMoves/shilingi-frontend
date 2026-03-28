import React from 'react';

const MonthlyTrendsChart = ({ history, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!history || !history.history || history.history.length === 0) {
        return null;
    }

    const data = [...history.history].reverse(); // Show oldest to newest
    const maxIncome = Math.max(...data.map(d => parseFloat(d.income) || 0));
    const maxExpense = Math.max(...data.map(d => parseFloat(d.expenses) || 0));
    const maxValue = Math.max(maxIncome, maxExpense);

    const formatCurrency = (amount) => {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">6-Month Trend</h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-gray-600">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-gray-600">Expenses</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>{formatCurrency(maxValue)}</span>
                    <span>{formatCurrency(maxValue * 0.75)}</span>
                    <span>{formatCurrency(maxValue * 0.5)}</span>
                    <span>{formatCurrency(maxValue * 0.25)}</span>
                    <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-16 h-full flex items-end justify-between gap-1">
                    {data.map((month, index) => {
                        const income = parseFloat(month.income) || 0;
                        const expenses = parseFloat(month.expenses) || 0;
                        const incomeHeight = maxValue > 0 ? (income / maxValue) * 100 : 0;
                        const expenseHeight = maxValue > 0 ? (expenses / maxValue) * 100 : 0;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                {/* Bars */}
                                <div className="w-full flex gap-1 items-end h-48">
                                    {/* Income bar */}
                                    <div className="flex-1 relative">
                                        <div
                                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all duration-500 hover:from-green-600 hover:to-green-500"
                                            style={{ height: `${incomeHeight}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {history.currency} {formatCurrency(income)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expense bar */}
                                    <div className="flex-1 relative">
                                        <div
                                            className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all duration-500 hover:from-red-600 hover:to-red-500"
                                            style={{ height: `${expenseHeight}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {history.currency} {formatCurrency(expenses)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Month label */}
                                <div className="text-xs text-gray-600 font-medium text-center">
                                    {month.month.substring(0, 3)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Averages */}
            {history.averages && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Avg Income</p>
                            <p className="text-lg font-bold text-green-600">
                                {history.currency} {formatCurrency(history.averages.income)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Avg Expenses</p>
                            <p className="text-lg font-bold text-red-600">
                                {history.currency} {formatCurrency(history.averages.expenses)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Avg Savings</p>
                            <p className="text-lg font-bold text-blue-600">
                                {parseFloat(history.averages.savings_rate || 0).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyTrendsChart;