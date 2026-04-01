import React, { useState, useMemo } from 'react';

const ScoreHistoryChart = ({ history, trend, stats }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(6);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Filter history based on selected period
    const filteredHistory = useMemo(() => {
        if (!history) return [];
        return history.slice(0, selectedPeriod * 4); // Roughly weekly data
    }, [history, selectedPeriod]);

    // Calculate chart dimensions and scales - FIXED PADDING
    const chartWidth = 100; 
    const chartHeight = 200; 
    const padding = { top: 20, right: 10, bottom: 30, left: 35 }; // Increased left padding for labels

    const points = useMemo(() => {
        if (!filteredHistory || filteredHistory.length === 0) return [];

        const maxScore = 100;
        const minScore = 0;
        const scoreRange = maxScore - minScore;

        return filteredHistory.map((item, index) => {
            const x = (index / (filteredHistory.length - 1)) * (chartWidth - padding.left - padding.right) + padding.left;
            const y = chartHeight - padding.bottom - ((item.overall_score - minScore) / scoreRange) * (chartHeight - padding.top - padding.bottom);
            return { x, y, ...item };
        }).reverse();
    }, [filteredHistory, chartHeight, chartWidth, padding]);

    // Generate SVG path
    const pathData = useMemo(() => {
        if (points.length === 0) return '';
        
        let path = `M ${points[0].x} ${points[0].y}`;
        
        // Create smooth curve using quadratic bezier curves
        for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currentPoint = points[i];
            const midX = (prevPoint.x + currentPoint.x) / 2;
            
            path += ` Q ${prevPoint.x} ${prevPoint.y} ${midX} ${(prevPoint.y + currentPoint.y) / 2}`;
            path += ` Q ${currentPoint.x} ${currentPoint.y} ${currentPoint.x} ${currentPoint.y}`;
        }
        
        return path;
    }, [points]);

    // Generate area path (for gradient fill)
    const areaPath = useMemo(() => {
        if (points.length === 0) return '';
        
        let path = pathData;
        const lastPoint = points[points.length - 1];
        const firstPoint = points[0];
        
        path += ` L ${lastPoint.x} ${chartHeight - padding.bottom}`;
        path += ` L ${firstPoint.x} ${chartHeight - padding.bottom}`;
        path += ' Z';
        
        return path;
    }, [pathData, points, chartHeight, padding]);

    const getTrendColor = () => {
        if (!trend) return 'text-slate-600';
        if (trend.direction === 'up') return 'text-green-600';
        if (trend.direction === 'down') return 'text-red-600';
        return 'text-slate-600';
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        
        if (trend.direction === 'up') {
            return (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        } else if (trend.direction === 'down') {
            return (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            );
        }
        
        return (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
        );
    };

    if (!history || history.length === 0) {
        return (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">Score History</h3>
                <div className="mt-6 flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-4 text-sm font-medium text-slate-600">No historical data yet</p>
                    <p className="mt-1 text-xs text-slate-500">Check back after a few score calculations</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-950">Score History</h3>
                    <p className="mt-1 text-sm text-slate-600">Track your financial health over time</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    {[3, 6, 12, 24].map((months) => (
                        <button
                            key={months}
                            onClick={() => setSelectedPeriod(months)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                selectedPeriod === months
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {months}M
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="relative mb-6" style={{ height: `${chartHeight}px` }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="none"
                    className="overflow-visible"
                >
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal grid lines with FIXED Y-axis labels */}
                    {[0, 25, 50, 75, 100].map((value) => {
                        const y = chartHeight - padding.bottom - (value / 100) * (chartHeight - padding.top - padding.bottom);
                        return (
                            <g key={value}>
                                {/* Grid line */}
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={chartWidth - padding.right}
                                    y2={y}
                                    stroke="#e2e8f0"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                {/* Y-axis label - FIXED POSITION */}
                                <text
                                    x={padding.left - 8}
                                    y={y}
                                    fontSize="10"
                                    fill="#64748b"
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    style={{ userSelect: 'none' }}
                                >
                                    {value}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    {areaPath && (
                        <path
                            d={areaPath}
                            fill="url(#scoreGradient)"
                        />
                    )}

                    {/* Line path */}
                    {pathData && (
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Data points */}
                    {points.map((point, index) => (
                        <g key={index}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="white"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                className="cursor-pointer transition-all hover:r-6"
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {hoveredPoint === point && (
                                <g>
                                    <rect
                                        x={point.x - 35}
                                        y={point.y - 45}
                                        width="70"
                                        height="35"
                                        rx="8"
                                        fill="#1e293b"
                                        opacity="0.95"
                                    />
                                    <text
                                        x={point.x}
                                        y={point.y - 30}
                                        fontSize="11"
                                        fontWeight="bold"
                                        fill="white"
                                        textAnchor="middle"
                                    >
                                        Score: {point.overall_score}
                                    </text>
                                    <text
                                        x={point.x}
                                        y={point.y - 16}
                                        fontSize="9"
                                        fill="#cbd5e1"
                                        textAnchor="middle"
                                    >
                                        {new Date(point.score_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </text>
                                </g>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            {/* Trend Stats */}
            {trend && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-3">
                    <span className={`flex items-center gap-1 font-semibold ${getTrendColor()}`}>
                        {getTrendIcon()}
                        {trend.percentage_change > 0 ? '+' : ''}{trend.percentage_change}%
                    </span>
                    <span className="text-sm text-slate-600">
                        ({trend.points_change > 0 ? '+' : ''}{trend.points_change} points)
                    </span>
                </div>
            )}

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.best_score}</p>
                        <p className="text-xs text-slate-600">Best Score</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-950">{stats.average_score}</p>
                        <p className="text-xs text-slate-600">Average</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.worst_score}</p>
                        <p className="text-xs text-slate-600">Worst Score</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScoreHistoryChart;