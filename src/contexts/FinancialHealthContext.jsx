import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    getHealthScore,
    getHealthScoreHistory,
    getHealthScoreBreakdown,
    getHealthInsights
} from '../services/financialHealthApi';

const FinancialHealthContext = createContext(null);

export const useFinancialHealth = () => {
    const context = useContext(FinancialHealthContext);
    if (!context) {
        throw new Error('useFinancialHealth must be used within FinancialHealthProvider');
    }
    return context;
};

export const FinancialHealthProvider = ({ children }) => {
    const [healthScore, setHealthScore] = useState(null);
    const [scoreHistory, setScoreHistory] = useState(null);
    const [scoreBreakdown, setScoreBreakdown] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchHealthScore = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHealthScore(forceRefresh);
            setHealthScore(data);
            setLastRefresh(Date.now());
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchScoreHistory = useCallback(async (months = 6) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHealthScoreHistory(months);
            setScoreHistory(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchScoreBreakdown = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHealthScoreBreakdown();
            setScoreBreakdown(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHealthInsights();
            setInsights(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshAll = useCallback(async (forceRefresh = true) => {
        setLoading(true);
        setError(null);
        try {
            const [nextHealthScore, nextScoreHistory, nextScoreBreakdown, nextInsights] = await Promise.all([
                fetchHealthScore(forceRefresh),
                fetchScoreHistory(),
                fetchScoreBreakdown(),
                fetchInsights()
            ]);
            setLastRefresh(Date.now());

            return {
                healthScore: nextHealthScore,
                scoreHistory: nextScoreHistory,
                scoreBreakdown: nextScoreBreakdown,
                insights: nextInsights,
            };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchHealthScore, fetchScoreHistory, fetchScoreBreakdown, fetchInsights]);

    const value = {
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
    };

    return (
        <FinancialHealthContext.Provider value={value}>
            {children}
        </FinancialHealthContext.Provider>
    );
};
