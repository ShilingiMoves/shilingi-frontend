import React from 'react';

const IncomeVsExpenseChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const totalIncome = parseFloat(data.total_income || 0);
    const totalExpenses = parseFloat(data.total_expenses || 0);
    const maxValue = Math.max(totalIncome, totalExpenses);
    
    const incomePercentage = maxValue > 0 ? (totalIncome / maxValue) * 100 : 0;
    const expensePercentage = maxValue > 0 ? (totalExpenses / maxValue) * 100 : 0;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Income vs Expenses</h3>
                <span className="text-sm font-medium text-gray-500">{data.period}</span>
            </div>

            {/* Comparison Bars */}
            <div className="space-y-6 mb-6">
                {/* Income Bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Income</span>
                        <span className="text-lg font-bold text-green-600">
                            {data.currency} {formatCurrency(totalIncome)}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                            style={{ width: `${incomePercentage}%` }}
                        >
                            {incomePercentage > 15 && (
                                <span className="text-xs font-bold text-white">
                                    {incomePercentage.toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expense Bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Expenses</span>
                        <span className="text-lg font-bold text-red-600">
                            {data.currency} {formatCurrency(totalExpenses)}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                            style={{ width: `${expensePercentage}%` }}
                        >
                            {expensePercentage > 15 && (
                                <span className="text-xs font-bold text-white">
                                    {expensePercentage.toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Cash Flow */}
            <div className={`rounded-xl p-4 ${
                data.status === 'surplus' 
                    ? 'bg-green-50 border border-green-200' 
                    : data.status === 'deficit' 
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
            }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm font-medium ${
                            data.status === 'surplus' ? 'text-green-700' : 
                            data.status === 'deficit' ? 'text-red-700' : 
                            'text-gray-700'
                        }`}>
                            Net Cash Flow
                        </p>
                        <p className={`text-2xl font-bold ${
                            data.status === 'surplus' ? 'text-green-900' : 
                            data.status === 'deficit' ? 'text-red-900' : 
                            'text-gray-900'
                        }`}>
                            {data.currency} {formatCurrency(Math.abs(data.net_cashflow || 0))}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${
                        data.status === 'surplus' ? 'bg-green-200' : 
                        data.status === 'deficit' ? 'bg-red-200' : 
                        'bg-gray-200'
                    }`}>
                        <p className={`text-sm font-bold ${
                            data.status === 'surplus' ? 'text-green-900' : 
                            data.status === 'deficit' ? 'text-red-900' : 
                            'text-gray-900'
                        }`}>
                            {data.savings_rate}%
                        </p>
                        <p className={`text-xs ${
                            data.status === 'surplus' ? 'text-green-700' : 
                            data.status === 'deficit' ? 'text-red-700' : 
                            'text-gray-700'
                        }`}>
                            Savings
                        </p>
                    </div>
                </div>
            </div>

            {/* Breakdown Sections */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                {/* Income Breakdown */}
                {data.income_breakdown && data.income_breakdown.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Income Sources</h4>
                        <div className="space-y-2">
                            {data.income_breakdown.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span 
                                            className="w-3 h-3 rounded-full shrink-0" 
                                            style={{ backgroundColor: item.color }}
                                        ></span>
                                        <span className="truncate text-gray-600">{item.category}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 ml-2">
                                        {item.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Expense Breakdown */}
                {data.expense_breakdown && data.expense_breakdown.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Expenses</h4>
                        <div className="space-y-2">
                            {data.expense_breakdown.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span 
                                            className="w-3 h-3 rounded-full shrink-0" 
                                            style={{ backgroundColor: item.color }}
                                        ></span>
                                        <span className="truncate text-gray-600">{item.category}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 ml-2">
                                        {item.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomeVsExpenseChart;