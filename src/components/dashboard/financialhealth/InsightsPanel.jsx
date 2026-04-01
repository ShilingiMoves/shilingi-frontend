import React, { useState, useMemo } from 'react';

const InsightsPanel = ({ insights, priorityActions, summary, score }) => {
    const [activeTab, setActiveTab] = useState('all');

    const getInsightIcon = (type) => {
        switch (type) {
            case 'POSITIVE':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'WARNING':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'CRITICAL':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'TIP':
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getInsightColors = (type) => {
        switch (type) {
            case 'POSITIVE':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-700',
                    icon: 'text-green-600',
                    hover: 'hover:bg-green-100'
                };
            case 'WARNING':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-700',
                    icon: 'text-yellow-600',
                    hover: 'hover:bg-yellow-100'
                };
            case 'CRITICAL':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-700',
                    icon: 'text-red-600',
                    hover: 'hover:bg-red-100'
                };
            case 'TIP':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-700',
                    icon: 'text-blue-600',
                    hover: 'hover:bg-blue-100'
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    border: 'border-slate-200',
                    text: 'text-slate-700',
                    icon: 'text-slate-600',
                    hover: 'hover:bg-slate-100'
                };
        }
    };

    const filteredInsights = useMemo(() => {
        if (!insights) return { positive: [], warnings: [], critical: [], tips: [] };

        if (activeTab === 'all') {
            return insights;
        }

        return {
            positive: activeTab === 'positive' ? insights.positive : [],
            warnings: activeTab === 'warnings' ? insights.warnings : [],
            critical: activeTab === 'critical' ? insights.critical : [],
            tips: activeTab === 'tips' ? insights.tips : []
        };
    }, [insights, activeTab]);

    const allInsights = useMemo(() => {
        if (!filteredInsights) return [];
        
        return [
            ...filteredInsights.critical || [],
            ...filteredInsights.warnings || [],
            ...filteredInsights.positive || [],
            ...filteredInsights.tips || []
        ];
    }, [filteredInsights]);

    const tabs = [
        { id: 'all', label: 'All', count: summary?.positive_count + summary?.warnings_count + summary?.critical_count + summary?.tips_count || 0 },
        { id: 'critical', label: 'Critical', count: summary?.critical_count || 0 },
        { id: 'warnings', label: 'Warnings', count: summary?.warnings_count || 0 },
        { id: 'positive', label: 'Positive', count: summary?.positive_count || 0 },
        { id: 'tips', label: 'Tips', count: summary?.tips_count || 0 }
    ];

    if (!insights) {
        return (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">Insights & Recommendations</h3>
                <div className="mt-6 flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="mt-4 text-sm font-medium text-slate-600">No insights available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-950">Insights & Recommendations</h3>
                <p className="mt-1 text-sm text-slate-600">Personalized tips to improve your score</p>
            </div>

            {/* Priority Actions Banner */}
            {priorityActions && priorityActions.length > 0 && (
                <div className="mb-6 rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-orange-900">Priority Actions</h4>
                            <p className="mt-1 text-xs text-orange-700">
                                {priorityActions.length} critical {priorityActions.length === 1 ? 'item' : 'items'} need your attention
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 text-slate-700'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Insights List */}
            <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                {allInsights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="mt-3 text-sm font-medium text-slate-600">No insights in this category</p>
                    </div>
                ) : (
                    allInsights.map((insight, index) => {
                        const colors = getInsightColors(insight.type);
                        return (
                            <div
                                key={index}
                                className={`rounded-xl border-2 p-4 transition-all ${colors.bg} ${colors.border} ${colors.hover}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 ${colors.icon}`}>
                                        {getInsightIcon(insight.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {insight.title && (
                                            <h5 className={`text-sm font-bold ${colors.text}`}>
                                                {insight.title}
                                            </h5>
                                        )}
                                        <p className={`text-sm ${colors.text} ${insight.title ? 'mt-1' : ''}`}>
                                            {insight.message}
                                        </p>
                                        {insight.component && (
                                            <span className="mt-2 inline-block rounded-full bg-white/50 px-2 py-0.5 text-xs font-medium text-slate-700">
                                                {insight.component}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Summary */}
            {summary && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
                        <div>
                            <p className="text-lg font-bold text-green-600">{summary.positive_count}</p>
                            <p className="text-xs text-slate-600">Positive</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-yellow-600">{summary.warnings_count}</p>
                            <p className="text-xs text-slate-600">Warnings</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-red-600">{summary.critical_count}</p>
                            <p className="text-xs text-slate-600">Critical</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-blue-600">{summary.tips_count}</p>
                            <p className="text-xs text-slate-600">Tips</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightsPanel;