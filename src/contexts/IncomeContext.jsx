import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import incomeService from '../services/incomeService';
import { markDashboardDataExists } from '../pages/DashboardPage';

const IncomeContext = createContext();

export const useIncome = () => {
    const context = useContext(IncomeContext);
    if (!context) {
        throw new Error('useIncome must be used within IncomeProvider');
    }
    return context;
};

export const IncomeProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState(null);
    const [incomeVsExpense, setIncomeVsExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ========== CATEGORIES ==========
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await incomeService.getCategories();
            setCategories(data.categories || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching income categories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (categoryData) => {
        try {
            setLoading(true);
            const newCategory = await incomeService.createCategory(categoryData);
            setCategories(prev => [...prev, newCategory]);
            setError(null);
            return newCategory;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== INCOMES ==========
    const fetchIncomes = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            const data = await incomeService.getIncomes(filters);
            setIncomes(data.incomes || []);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching incomes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createIncome = useCallback(async (incomeData) => {
        try {
            setLoading(true);
            const newIncome = await incomeService.createIncome(incomeData);
            await fetchIncomes();
            await fetchSummary();
            markDashboardDataExists();
            setError(null);
            return newIncome;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateIncome = useCallback(async (uuid, incomeData) => {
        try {
            setLoading(true);
            const updated = await incomeService.updateIncome(uuid, incomeData);
            await fetchIncomes();
            await fetchSummary();
            setError(null);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteIncome = useCallback(async (uuid) => {
        try {
            setLoading(true);
            await incomeService.deleteIncome(uuid);
            setIncomes(prev => prev.filter(inc => inc.uuid !== uuid));
            await fetchSummary();
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addQuickIncome = useCallback(async (quickData) => {
        try {
            setLoading(true);
            const newIncome = await incomeService.quickIncome(quickData);
            await fetchIncomes();
            await fetchSummary();
            markDashboardDataExists();
            setError(null);
            return newIncome;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== ANALYTICS ==========
    const fetchSummary = useCallback(async () => {
        try {
            const data = await incomeService.getSummary();
            setSummary(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching income summary:', err);
        }
    }, []);

    const fetchHistory = useCallback(async (months = 6) => {
        try {
            const data = await incomeService.getHistory(months);
            setHistory(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching income history:', err);
        }
    }, []);

    const fetchIncomeVsExpense = useCallback(async (year, month) => {
        try {
            const data = await incomeService.getIncomeVsExpense(year, month);
            setIncomeVsExpense(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching income vs expense:', err);
        }
    }, []);

    // Initialize on mount
    useEffect(() => {
        fetchCategories();
        fetchSummary();
    }, [fetchCategories, fetchSummary]);

    const value = {
        // State
        categories,
        incomes,
        summary,
        history,
        incomeVsExpense,
        loading,
        error,

        // Actions
        fetchCategories,
        createCategory,
        fetchIncomes,
        createIncome,
        updateIncome,
        deleteIncome,
        addQuickIncome,
        fetchSummary,
        fetchHistory,
        fetchIncomeVsExpense,
    };

    return (
        <IncomeContext.Provider value={value}>
            {children}
        </IncomeContext.Provider>
    );
};