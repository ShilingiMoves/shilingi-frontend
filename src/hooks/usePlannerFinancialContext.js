import { useEffect, useState } from 'react';
import { getBudgets, getExpenses, getGoals } from '../services/budgetApi';
import { getDebts } from '../services/debtApi';

const asArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.expenses)) return payload.expenses;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    if (Array.isArray(payload?.data?.expenses)) return payload.data.expenses;
    return [];
};

export const usePlannerFinancialContext = () => {
    const [context, setContext] = useState({
        budgets: [],
        expenses: [],
        goals: [],
        debts: [],
        loading: true,
    });

    useEffect(() => {
        let isMounted = true;

        const loadContext = async () => {
            const [budgetsResult, expensesResult, goalsResult, debtsResult] = await Promise.allSettled([
                getBudgets(),
                getExpenses(),
                getGoals(),
                getDebts(),
            ]);

            if (!isMounted) return;

            setContext({
                budgets: budgetsResult.status === 'fulfilled' ? asArray(budgetsResult.value) : [],
                expenses: expensesResult.status === 'fulfilled' ? asArray(expensesResult.value) : [],
                goals: goalsResult.status === 'fulfilled' ? asArray(goalsResult.value) : [],
                debts: debtsResult.status === 'fulfilled' ? asArray(debtsResult.value) : [],
                loading: false,
            });
        };

        loadContext();

        return () => {
            isMounted = false;
        };
    }, []);

    return context;
};
