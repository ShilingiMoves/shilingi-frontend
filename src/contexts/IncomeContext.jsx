import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import incomeService from '../services/incomeService';
import { markDashboardDataExists } from '../utils/dashboardDataState';
import { useHealthRefresh } from '../hooks/useHealthRefresh';

const IncomeContext = createContext();

const normalizeCategory = (category = {}) => {
    const value = category.uuid ?? category.id ?? category.pk ?? category.category_id ?? category.value ?? '';
    return {
        ...category,
        uuid: String(value),
        value: String(value),
        name: category.name || category.label || 'Income category',
    };
};

const normalizeCategories = (data) => {
    const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
            ? data.categories
            : Array.isArray(data?.results)
                ? data.results
                : [];

    return rows.map(normalizeCategory).filter((category) => category.value);
};

export const useIncome = () => {
    const context = useContext(IncomeContext);
    if (!context) {
        throw new Error('useIncome must be used within IncomeProvider');
    }
    return context;
};

export const IncomeProvider = ({ children }) => {
    const { triggerHealthRefresh } = useHealthRefresh();
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
            const normalized = normalizeCategories(data);
            setCategories(normalized);
            setError(null);
            return normalized;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching income categories:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (categoryData) => {
        try {
            setLoading(true);
            const newCategory = await incomeService.createCategory(categoryData);
            const normalized = normalizeCategory(newCategory?.category || newCategory?.data || newCategory);
            setCategories(prev => {
                if (!normalized.value) return prev;
                const next = prev.some((category) => String(category.value) === String(normalized.value))
                    ? prev
                    : [...prev, normalized];
                return next.filter((category) => category.value);
            });
            setError(null);
            return normalized;
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
            triggerHealthRefresh('income:create');
            setError(null);
            return newIncome;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchIncomes, fetchSummary, triggerHealthRefresh]);

    const updateIncome = useCallback(async (uuid, incomeData) => {
        try {
            setLoading(true);
            const updated = await incomeService.updateIncome(uuid, incomeData);
            await fetchIncomes();
            await fetchSummary();
            triggerHealthRefresh('income:update');
            setError(null);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchIncomes, fetchSummary, triggerHealthRefresh]);

    const deleteIncome = useCallback(async (uuid) => {
        try {
            setLoading(true);
            await incomeService.deleteIncome(uuid);
            setIncomes(prev => prev.filter(inc => inc.uuid !== uuid));
            await fetchSummary();
            triggerHealthRefresh('income:delete');
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchSummary, triggerHealthRefresh]);

    const addQuickIncome = useCallback(async (quickData) => {
        try {
            setLoading(true);
            const newIncome = await incomeService.quickIncome(quickData);
            await fetchIncomes();
            await fetchSummary();
            markDashboardDataExists();
            triggerHealthRefresh('income:quick');
            setError(null);
            return newIncome;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchIncomes, fetchSummary, triggerHealthRefresh]);

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

