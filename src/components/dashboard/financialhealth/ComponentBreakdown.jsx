import React from 'react';
import ScoreGauge from './ScoreGauge';

const ComponentBreakdown = ({ components, overallScore, onComponentClick = null }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-50 border-green-200 hover:border-green-300 hover:bg-green-100';
        if (score >= 60) return 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:bg-blue-100';
        if (score >= 40) return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-100';
        return 'bg-red-50 border-red-200 hover:border-red-300 hover:bg-red-100';
    };

    const formatDataValue = (value) => {
        if (typeof value === 'number') {
            return value % 1 === 0 ? value : value.toFixed(1);
        }
        return value;
    };

    const formatDataKey = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-950 sm:text-2xl">Score Breakdown</h3>
                <p className="mt-1 text-sm text-slate-600">
                    Detailed view of each component contributing to your overall score
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {components && components.map((component) => (
                    <div
                        key={component.key}
                        onClick={() => onComponentClick && onComponentClick(component)}
                        className={`group rounded-2xl border-2 p-5 transition-all ${
                            onComponentClick ? 'cursor-pointer' : ''
                        } ${getScoreBg(component.score)}`}
                    >
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-950 truncate">
                                    {component.name}
                                </h4>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                    {component.description}
                                </p>
                            </div>
                            <span className={`flex-shrink-0 text-2xl font-extrabold sm:text-3xl ${getScoreColor(component.score)}`}>
                                {component.score}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                            <ScoreGauge score={component.score} height="h-2" animated />
                        </div>

                        {/* Stats */}
                        <div className="mb-3 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-600">
                                Weight: {component.weight}%
                            </span>
                            <span className={`rounded-full px-2 py-0.5 font-bold ${
                                component.score >= 80 ? 'bg-green-100 text-green-700' :
                                component.score >= 60 ? 'bg-blue-100 text-blue-700' :
                                component.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                Grade: {component.grade}
                            </span>
                        </div>

                        {/* Component Specific Data */}
                        {component.data && Object.keys(component.data).length > 0 && (
                            <div className="space-y-1.5 border-t border-slate-200 pt-3">
                                {Object.entries(component.data).slice(0, 2).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-xs">
                                        <span className="text-slate-600 truncate pr-2">
                                            {formatDataKey(key)}:
                                        </span>
                                        <span className="font-semibold text-slate-950 flex-shrink-0">
                                            {formatDataValue(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Click indicator */}
                        {onComponentClick && (
                            <div className="mt-3 flex items-center justify-center text-xs font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                                Click for details
                                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComponentBreakdown;