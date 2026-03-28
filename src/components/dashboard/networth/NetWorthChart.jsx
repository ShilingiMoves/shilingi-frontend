import React from 'react';

const NetWorthChart = ({ history, loading }) => {
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

    const data = [...history.history].reverse();
    const values = data.map(d => parseFloat(d.net_worth));
    const maxValue = Math.max(...values.map(Math.abs));
    const minValue = Math.min(...values);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(amount));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Net Worth Trend</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {history.trend_direction === 'up' ? '📈' : history.trend_direction === 'down' ? '📉' : '➡️'} 
                        {' '}{Math.abs(history.trend_percentage).toFixed(1)}% 
                        {' '}{history.trend_direction === 'up' ? 'increase' : history.trend_direction === 'down' ? 'decrease' : 'stable'}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-600">Net Worth</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-gray-500 pr-2 text-right">
                    <span>{formatCurrency(maxValue)}</span>
                    <span>{formatCurrency(maxValue * 0.75)}</span>
                    <span>{formatCurrency(maxValue * 0.5)}</span>
                    <span>{formatCurrency(maxValue * 0.25)}</span>
                    <span>0</span>
                    {minValue < 0 && <span className="text-red-600">-{formatCurrency(Math.abs(minValue))}</span>}
                </div>

                {/* Chart area */}
                <div className="ml-20 h-full flex items-end justify-between gap-1">
                    {data.map((month, index) => {
                        const value = parseFloat(month.net_worth);
                        const isNegative = value < 0;
                        const height = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                {/* Bar */}
                                <div className="w-full flex flex-col items-center h-56 justify-end">
                                    {!isNegative ? (
                                        <div className="w-full relative">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                                                style={{ height: `${height}%` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    {history.currency} {formatCurrency(value)}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full relative flex flex-col-reverse">
                                            <div
                                                className="w-full bg-gradient-to-b from-red-500 to-red-400 rounded-b transition-all duration-500 hover:from-red-600 hover:to-red-500"
                                                style={{ height: `${height}%` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    -{history.currency} {formatCurrency(Math.abs(value))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Month label */}
                                <div className="text-xs text-gray-600 font-medium text-center">
                                    {month.month.split(' ')[0]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Zero line if there are negative values */}
            {minValue < 0 && (
                <div className="ml-20 border-t-2 border-gray-300 border-dashed mt-2"></div>
            )}
        </div>
    );
};

export default NetWorthChart;