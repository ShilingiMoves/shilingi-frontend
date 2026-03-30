import React from 'react';

const CategoryPieChart = ({ data, title, type = 'income' }) => {
    if (!data || data.length === 0) return null;

    const createPieSlice = (percentage, startAngle, color) => {
        const angle = (percentage / 100) * 360;
        const endAngle = startAngle + angle;
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const startX = 50 + 45 * Math.cos((Math.PI * startAngle) / 180);
        const startY = 50 + 45 * Math.sin((Math.PI * startAngle) / 180);
        const endX = 50 + 45 * Math.cos((Math.PI * endAngle) / 180);
        const endY = 50 + 45 * Math.sin((Math.PI * endAngle) / 180);
        
        return `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
            
            {/* Pie Chart */}
            <div className="flex justify-center mb-6">
                <svg width="200" height="200" viewBox="0 0 100 100" className="drop-shadow-md">
                    {data.map((item, index) => {
                        let startAngle = -90;
                        for (let i = 0; i < index; i++) {
                            startAngle += (data[i].percentage / 100) * 360;
                        }
                        const path = createPieSlice(item.percentage, startAngle, item.color);
                        return (
                            <g key={index}>
                                <path
                                    d={path}
                                    fill={item.color}
                                    stroke="white"
                                    strokeWidth="1"
                                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend with Bars */}
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span 
                                    className="w-3 h-3 rounded-sm shrink-0" 
                                    style={{ backgroundColor: item.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.category}</p>
                                    <p className="text-xs text-gray-500">{item.count} {item.count === 1 ? 'transaction' : 'transactions'}</p>
                                </div>
                            </div>
                            <div className="text-right ml-2">
                                <p className="text-sm font-bold text-gray-900">
                                    {formatCurrency(item.amount)}
                                </p>
                                <p className={`text-xs font-semibold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.percentage}%
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${item.percentage}%`,
                                    backgroundColor: item.color 
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryPieChart;