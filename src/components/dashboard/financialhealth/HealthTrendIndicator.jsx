import React from 'react';

const HealthTrendIndicator = ({ change, showLabel = true, size = 'medium' }) => {
    if (change === null || change === undefined) {
        return null;
    }

    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
        large: 'h-6 w-6'
    };

    const textSizeClasses = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base'
    };

    const renderIcon = () => {
        if (change > 0) {
            return (
                <svg
                    className={`${sizeClasses[size]} text-green-600`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                </svg>
            );
        } else if (change < 0) {
            return (
                <svg
                    className={`${sizeClasses[size]} text-red-600`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                </svg>
            );
        } else {
            return (
                <svg
                    className={`${sizeClasses[size]} text-slate-400`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14"
                    />
                </svg>
            );
        }
    };

    const getColorClass = () => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-slate-600';
    };

    const getLabel = () => {
        if (change > 0) return `Up ${change} points`;
        if (change < 0) return `Down ${Math.abs(change)} points`;
        return 'No change';
    };

    return (
        <div className="flex items-center gap-2">
            {renderIcon()}
            {showLabel && (
                <span className={`${textSizeClasses[size]} font-semibold ${getColorClass()}`}>
                    {getLabel()}
                </span>
            )}
        </div>
    );
};

export default HealthTrendIndicator;