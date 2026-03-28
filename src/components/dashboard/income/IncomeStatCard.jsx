import React from 'react';

const IncomeStatCard = ({ 
    title, 
    value, 
    currency = 'KES', 
    change, 
    trend = 'neutral',
    icon,
    subtitle,
    loading = false 
}) => {
    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    const getTrendBg = () => {
        if (trend === 'up') return 'bg-green-50';
        if (trend === 'down') return 'bg-red-50';
        return 'bg-gray-50';
    };

    const formatValue = (val) => {
        if (loading) return '---';
        
        // If value is already a string (like "25.5%"), return as is
        if (typeof val === 'string') {
            return val;
        }
        
        // If value is a number, format it
        if (typeof val === 'number') {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(val);
        }
        
        return val;
    };

    const displayValue = formatValue(value);
    const showCurrency = typeof value === 'number'; // Only show currency for numeric values

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {showCurrency && `${currency} `}{displayValue}
                        </h3>
                    </div>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className={`p-3 rounded-lg ${getTrendBg()}`}>
                        <div className={`text-xl ${getTrendColor()}`}>{icon}</div>
                    </div>
                )}
            </div>
            
            {change !== undefined && change !== null && (
                <div className="mt-4 flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getTrendColor()}`}>
                        {change > 0 ? '+' : ''}{parseFloat(change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default IncomeStatCard;