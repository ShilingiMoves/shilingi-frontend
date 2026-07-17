import apiClient from './apiClient';
import incomeService from './incomeService';
import { getBudgetSummary, getBudgets, getExpenses, getGoals } from './budgetApi';
import { getDebts } from './debtApi';
import { getAssets as getInvestmentAssets } from './investmentTrackerApi';
import { getNetWorthSummary } from './networthApi';
import { getStoredUserProfile } from './authApi';
import { buildDerivedFinancialHealth } from '../utils/financialIntelligence';

const asArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.budgets)) return payload.budgets;
    if (Array.isArray(payload?.expenses)) return payload.expenses;
    if (Array.isArray(payload?.goals)) return payload.goals;
    if (Array.isArray(payload?.debts)) return payload.debts;
    if (Array.isArray(payload?.incomes)) return payload.incomes;
    return [];
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const pickSettled = (result, fallback) => (result?.status === 'fulfilled' ? result.value : fallback);

let localHealthFallbackPromise = null;

const getLocalFinancialHealthFallback = async () => {
    if (localHealthFallbackPromise) return localHealthFallbackPromise;

    localHealthFallbackPromise = (async () => {
        const now = new Date();
        const monthParams = { year: now.getFullYear(), month: now.getMonth() + 1 };
        const [
            incomeSummaryResult,
            incomesResult,
            budgetSummaryResult,
            budgetsResult,
            expensesResult,
            goalsResult,
            debtsResult,
            investmentsResult,
            netWorthResult,
        ] = await Promise.allSettled([
            incomeService.getSummary(),
            incomeService.getIncomes({ limit: 100 }),
            getBudgetSummary(),
            getBudgets({ current: 'true', ...monthParams }),
            getExpenses({ limit: 100, ...monthParams }),
            getGoals({ status: 'ACTIVE' }),
            getDebts(),
            getInvestmentAssets(),
            getNetWorthSummary(),
        ]);

        const incomeSummary = pickSettled(incomeSummaryResult, {});
        const incomes = asArray(pickSettled(incomesResult, []));
        const budgetSummary = pickSettled(budgetSummaryResult, {});
        const budgets = asArray(pickSettled(budgetsResult, []));
        const expenses = asArray(pickSettled(expensesResult, []));
        const goals = asArray(pickSettled(goalsResult, []));
        const debts = asArray(pickSettled(debtsResult, []));
        const investments = asArray(pickSettled(investmentsResult, []));
        const netWorthSummary = pickSettled(netWorthResult, {});
        const profile = getStoredUserProfile()?.profile || getStoredUserProfile() || {};
        const derivedIncome = incomes.reduce((sum, item) => sum + toNumber(item.amount || item.monthly_amount || item.net_amount), 0);
        const income = toNumber(
            incomeSummary?.total_income ||
            incomeSummary?.monthly_income ||
            incomeSummary?.current_month?.total_income ||
            incomeSummary?.currentMonth?.total_income ||
            incomeSummary?.summary?.total_income ||
            incomeSummary?.summary?.monthly_income ||
            derivedIncome ||
            profile?.monthly_income
        );
        const spent = toNumber(
            budgetSummary?.current_month?.total_spent ||
            budgetSummary?.currentMonth?.total_spent ||
            budgetSummary?.monthly_spent ||
            expenses.reduce((sum, expense) => sum + Math.abs(toNumber(expense.amount)), 0)
        );
        const savings = toNumber(
            netWorthSummary?.savingsFromGoals ||
            netWorthSummary?.savings ||
            budgetSummary?.goal_saved_total ||
            budgetSummary?.total_goal_saved ||
            goals.reduce((sum, goal) => sum + toNumber(goal.current_amount || goal.saved_amount || goal.total_saved || goal.amount_saved), 0)
        );

        return buildDerivedFinancialHealth({
            profile,
            live: {
                income,
                spent,
                savings,
                netWorth: toNumber(netWorthSummary?.netWorth),
                raw: {
                    incomes,
                    budgets,
                    expenses,
                    goals,
                    debts,
                    investments,
                },
            },
        });
    })();

    try {
        return await localHealthFallbackPromise;
    } finally {
        localHealthFallbackPromise = null;
    }
};


export const getHealthScore = async (forceRefresh = false) => {
    try {
        const params = forceRefresh ? { refresh: 'true' } : {};
        const response = await apiClient.get('/api/v1/health/score/', params);
        return response.data || response;
    } catch (error) {
        console.warn('Using local financial health score fallback:', error);
        const fallback = await getLocalFinancialHealthFallback();
        return fallback.score;
    }
};

export const getHealthScoreHistory = async (months = 6) => {
    try {
        const response = await apiClient.get('/api/v1/health/history/', { months });
        return response.data || response;
    } catch (error) {
        console.warn('Using local financial health history fallback:', error);
        const fallback = await getLocalFinancialHealthFallback();
        return {
            history: [{
                date: fallback.score.score_date,
                score: fallback.score.overall_score,
                status: fallback.score.status,
            }],
            trend: 'stable',
            stats: {
                current: fallback.score.overall_score,
                average: fallback.score.overall_score,
                best: fallback.score.overall_score,
                months,
            },
        };
    }
};

export const getHealthScoreBreakdown = async () => {
    try {
        const response = await apiClient.get('/api/v1/health/breakdown/');
        return response.data || response;
    } catch (error) {
        console.warn('Using local financial health breakdown fallback:', error);
        const fallback = await getLocalFinancialHealthFallback();
        return fallback.breakdown;
    }
};

export const getHealthInsights = async () => {
    try {
        const response = await apiClient.get('/api/v1/health/insights/');
        return response.data || response;
    } catch (error) {
        console.warn('Using local financial health insight fallback:', error);
        const fallback = await getLocalFinancialHealthFallback();
        return fallback.insights;
    }
};
