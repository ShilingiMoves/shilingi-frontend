import React from 'react';

const ScoreGauge = ({ 
    score, 
    max = 100, 
    height = 'h-2', 
    showLabel = false,
    animated = true,
    variant = 'bar' // 'bar' or 'circular'
}) => {
    const getColorClass = (value) => {
        const percentage = (value / max) * 100;
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const percentage = Math.min((score / max) * 100, 100);

    if (variant === 'circular') {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative inline-flex items-center justify-center">
                <svg className="h-24 w-24 -rotate-90 transform">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`${getColorClass(score)} ${animated ? 'transition-all duration-1000' : ''}`}
                    />
                </svg>
                {showLabel && (
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-bold text-slate-950">{score}</span>
                        <span className="text-xs text-slate-500">/{max}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className={`overflow-hidden rounded-full bg-slate-200 ${height}`}>
                <div
                    className={`${height} rounded-full ${getColorClass(score)} ${
                        animated ? 'transition-all duration-500 ease-out' : ''
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="mt-1 flex justify-between text-xs text-slate-600">
                    <span>0</span>
                    <span className="font-semibold">{score}</span>
                    <span>{max}</span>
                </div>
            )}
        </div>
    );
};

export default ScoreGauge;