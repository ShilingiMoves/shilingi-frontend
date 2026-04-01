import React, { useEffect, useState, useCallback } from 'react';
import { useFinancialHealth } from '../../../contexts/FinancialHealthContext';
import HealthScoreCard from './HealthScoreCard';
import ComponentBreakdown from './ComponentBreakdown';
import ScoreHistoryChart from './ScoreHistoryChart';
import InsightsPanel from './InsightsPanel';
import ComponentDetailModal from './ComponentDetailModal';

const FinancialHealthDashboard = () => {
    const {
        healthScore,
        scoreHistory,
        scoreBreakdown,
        insights,
        loading,
        error,
        lastRefresh,
        fetchHealthScore,
        fetchScoreHistory,
        fetchScoreBreakdown,
        fetchInsights,
        refreshAll
    } = useFinancialHealth();

    const [refreshing, setRefreshing] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [lastTriggerTimestamp, setLastTriggerTimestamp] = useState(null);

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    fetchHealthScore(),
                    fetchScoreHistory(6),
                    fetchScoreBreakdown(),
                    fetchInsights()
                ]);
            } catch (err) {
                console.error('Failed to load financial health data:', err);
            }
        };

        loadInitialData();
    }, [fetchHealthScore, fetchScoreHistory, fetchScoreBreakdown, fetchInsights]);

    // Listen for refresh triggers from other components
    useEffect(() => {
        const handleRefreshRequest = () => {
            console.log('Health refresh requested from external component');
            refreshAll(true);
        };

        const handleStorageChange = (e) => {
            if (e.key === 'healthRefreshTrigger') {
                let triggerPayload = null;
                try {
                    triggerPayload = JSON.parse(e.newValue || '{}');
                } catch {
                    triggerPayload = { timestamp: Number(e.newValue) || Date.now() };
                }

                const nextTimestamp = Number(triggerPayload?.timestamp) || Date.now();
                if (nextTimestamp !== lastTriggerTimestamp) {
                    setLastTriggerTimestamp(nextTimestamp);
                    handleRefreshRequest();
                }
            }
        };

        // Listen for custom event
        window.addEventListener('healthRefreshRequested', handleRefreshRequest);
        
        // Listen for localStorage changes (works across tabs)
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('healthRefreshRequested', handleRefreshRequest);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [lastTriggerTimestamp, refreshAll]);

    // Auto-refresh every 5 minutes if on the page
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                console.log('Auto-refreshing health score (5 min interval)');
                refreshAll(true);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(intervalId);
    }, [refreshAll]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshAll(true);
        } catch (err) {
            console.error('Failed to refresh:', err);
        } finally {
            setRefreshing(false);
        }
    };

    if (loading && !healthScore) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)]">
                <div className="flex flex-col items-center gap-4">
                    <svg className="h-12 w-12 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-600">Calculating your financial health...</p>
                </div>
            </div>
        );
    }

    if (error && !healthScore) {
        return (
            <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)]">
                <div className="px-4 py-8">
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                            <div className="flex items-start gap-4">
                                <svg className="h-6 w-6 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-900">Unable to load financial health data</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                    <button
                                        onClick={() => fetchHealthScore()}
                                        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)]">
            <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header Section */}
                    <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">
                                    Financial Health
                                </p>
                                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                    Your complete financial wellness snapshot
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                    Track your financial health score across key metrics including savings rate, debt burden, emergency fund, budget adherence, and net worth trend.
                                </p>
                                {lastRefresh && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-50 sm:px-5 sm:py-3"
                            >
                                <svg
                                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </section>

                    {/* Main Score Card */}
                    {healthScore && (
                        <HealthScoreCard
                            score={healthScore.overall_score}
                            status={healthScore.status}
                            statusDisplay={healthScore.status_display}
                            change={healthScore.change_from_previous}
                            scoreDate={healthScore.score_date}
                        />
                    )}

                    {/* Components Breakdown Grid */}
                    {scoreBreakdown && (
                        <ComponentBreakdown
                            components={scoreBreakdown.components}
                            overallScore={scoreBreakdown.overall.score}
                            onComponentClick={setSelectedComponent}
                        />
                    )}

                    {/* History Chart and Insights Side by Side */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {scoreHistory && (
                            <ScoreHistoryChart
                                history={scoreHistory.history}
                                trend={scoreHistory.trend}
                                stats={scoreHistory.stats}
                            />
                        )}

                        {insights && (
                            <InsightsPanel
                                insights={insights.insights}
                                priorityActions={insights.priority_actions}
                                summary={insights.summary}
                                score={insights.score}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Component Detail Modal */}
            {selectedComponent && (
                <ComponentDetailModal
                    component={selectedComponent}
                    onClose={() => setSelectedComponent(null)}
                />
            )}
        </div>
    );
};

export default FinancialHealthDashboard;
