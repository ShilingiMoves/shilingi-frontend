import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import BudgetOverview from './BudgetOverview';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import GoalTracker from './GoalTracker';
import {
    getBudgets,
    getBudgetSummary,
    createBudget,
    updateBudget,
    deleteBudget,
    getExpenses,
    getGoals,
    getGoalSummary,
} from '../../../services/budgetApi';
import incomeService from '../../../services/incomeService';
import { getStoredUserProfile } from '../../../services/authApi';
import { calculateBudgetHealth } from '../../../utils/budgetHelpers';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const resolvePayload = (result, fallback) =>
    result?.status === 'fulfilled' ? result.value : fallback;

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getIncomeFromSummary = (incomeSummaryData) => {
    if (!incomeSummaryData) return 0;

    return toNumber(
        incomeSummaryData?.total_income ??
            incomeSummaryData?.monthly_income ??
            incomeSummaryData?.current_month?.total_income ??
            incomeSummaryData?.currentMonth?.total_income ??
            incomeSummaryData?.summary?.total_income ??
            incomeSummaryData?.summary?.monthly_income ??
            0
    );
};

const deriveSummaryFromBudgets = (budgetsData = [], existingSummary = {}, expensesData = null) => {
    const totalBudget = budgetsData.reduce((sum, item) => sum + toNumber(item?.amount), 0);
    const totalSpent = budgetsData.reduce((sum, item) => sum + toNumber(item?.total_spent), 0);
    const totalRemaining = totalBudget - totalSpent;
    const expenseCount = toNumber(expensesData?.count ?? existingSummary?.expense_count ?? 0);

    return {
        ...existingSummary,
        currency: existingSummary?.currency || budgetsData?.[0]?.currency || 'KES',
        total_budget: toNumber(existingSummary?.total_budget || totalBudget),
        total_spent: toNumber(existingSummary?.total_spent || totalSpent),
        total_remaining: toNumber(existingSummary?.total_remaining || totalRemaining),
        active_budgets_count: toNumber(existingSummary?.active_budgets_count || budgetsData.length),
        expense_count: expenseCount,
    };
};

const BudgetDashboard = ({ activeTab: controlledActiveTab, onTabChange, onSelectSection }) => {
    const { triggerHealthRefresh } = useHealthRefresh();
    // State management
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [expenseCount, setExpenseCount] = useState(0);
    const [goals, setGoals] = useState([]);
    const [goalSummary, setGoalSummary] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingBudget, setEditingBudget] = useState(null);
    
    const [internalActiveTab, setInternalActiveTab] = useState('overview');

    const activeTab = controlledActiveTab ?? internalActiveTab;
    const setActiveTab = onTabChange ?? setInternalActiveTab;

    // Calculate budget health metrics
    const budgetHealth = useMemo(() => calculateBudgetHealth(budgets), [budgets]);

    // Load all data
    // Pull the planner's linked data together in one pass so the overview, expenses,
    // and goals tabs all render from the same fresh snapshot.
    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [budgetsResult, summaryResult, expensesResult, incomeSummaryResult, goalsResult, goalSummaryResult] = await Promise.allSettled([
                getBudgets({ current: 'true' }),
                getBudgetSummary(),
                getExpenses({ limit: 10 }),
                incomeService.getSummary().catch(() => null),
                getGoals({ status: 'ACTIVE' }),
                getGoalSummary(),
            ]);

            const budgetsData = resolvePayload(budgetsResult, []);
            const summaryData = resolvePayload(summaryResult, {});
            const expensesData = resolvePayload(expensesResult, { expenses: [], total: 0, count: 0 });
            const incomeSummaryData = resolvePayload(incomeSummaryResult, null);
            const goalsData = resolvePayload(goalsResult, []);
            const goalSummaryData = resolvePayload(goalSummaryResult, null);

            setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
            setSummary(deriveSummaryFromBudgets(budgetsData, summaryData, expensesData));
            setExpenses(expensesData.expenses || []);
            setExpenseTotal(expensesData.total || 0);
            setExpenseCount(expensesData.count || 0);
            setGoals(Array.isArray(goalsData) ? goalsData : []);
            setGoalSummary(goalSummaryData);

            const storedProfile = getStoredUserProfile();
            const incomeFromManager = getIncomeFromSummary(incomeSummaryData);
            const incomeFromProfile = Number(storedProfile?.profile?.monthly_income || 0);
            setTotalIncome(incomeFromManager > 0 ? incomeFromManager : incomeFromProfile);

            const failedRequests = [budgetsResult, summaryResult, expensesResult].filter(
                (result) => result.status === 'rejected'
            );
            if (failedRequests.length > 0) {
                setError('Some dashboard sections could not fully sync. Showing available data.');
            }
        } catch (err) {
            setError(err.message || 'Could not load your budget data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Budget CRUD operations
    const handleSubmitBudget = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            
            if (editingBudget) {
                const updated = await updateBudget(editingBudget.uuid, formValues);
                setBudgets((current) => 
                    current.map((budget) => (budget.uuid === updated.uuid ? updated : budget))
                );
                setEditingBudget(null);
            } else {
                const created = await createBudget(formValues);
                setBudgets((current) => [created, ...current]);
            }
            
            const newSummary = await getBudgetSummary();
            setSummary(newSummary);
            markDashboardDataExists();
            triggerHealthRefresh(editingBudget ? 'budget:update' : 'budget:create');
        } catch (err) {
            const errorMessage = err.response?.data?.errors || err.response?.data || err.message;
            setSubmitError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBudget = async (uuid) => {
        try {
            setDeletingId(uuid);
            setSubmitError('');
            await deleteBudget(uuid);
            setBudgets((current) => current.filter((budget) => budget.uuid !== uuid));
            
            const newSummary = await getBudgetSummary();
            setSummary(newSummary);
            triggerHealthRefresh('budget:delete');
        } catch (err) {
            setSubmitError(err.message || 'Could not remove this budget right now.');
        } finally {
            setDeletingId(null);
        }
    };

    // Expense changes affect both recent transactions and budget health, so we refresh
    // the expense list together with the budget summary after quick-adds or edits.
    const refreshExpenses = async () => {
        try {
            const expensesData = await getExpenses({ limit: 10 });
            setExpenses(expensesData.expenses || []);
            setExpenseTotal(expensesData.total || 0);
            setExpenseCount(expensesData.count || 0);
            
            const [budgetsData, summaryData] = await Promise.all([
                getBudgets({ current: 'true' }),
                getBudgetSummary(),
            ]);
            setBudgets(budgetsData);
            setSummary(summaryData);
            triggerHealthRefresh('expense:change');
        } catch (err) {
            console.error('Failed to refresh expenses:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your budget dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Error Alert */}
            {error && (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Could not load your budget data.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab !== 'overview' && (
                <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"
                    >
                        <ArrowLeft size={15} />
                        Back to Budget Overview
                    </button>
                    <p className="text-xs font-medium text-slate-500">
                        Budgets: {budgets.length} | Expenses: {expenseCount}
                    </p>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && summary && (
                <BudgetOverview
                    summary={summary}
                    budgets={budgets}
                    expenses={expenses}
                    goals={goals}
                    goalSummary={goalSummary}
                    expenseTotal={expenseTotal}
                    totalIncome={totalIncome}
                    budgetHealth={budgetHealth}
                    onNavigate={setActiveTab}
                    onSelectSection={onSelectSection}
                    onQuickExpenseAdded={refreshExpenses}
                />
            )}

            {activeTab === 'budgets' && (
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
                    <div className="space-y-4">
                        <BudgetForm
                            initialValues={editingBudget}
                            onSubmit={handleSubmitBudget}
                            onCancel={() => {
                                setEditingBudget(null);
                                setSubmitError('');
                            }}
                            isSubmitting={isSubmitting}
                        />

                        {submitError && (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
                                {submitError}
                            </div>
                        )}
                    </div>

                    <BudgetList
                        budgets={budgets}
                        onEdit={(budget) => {
                            setEditingBudget(budget);
                            setSubmitError('');
                        }}
                        onDelete={handleDeleteBudget}
                        deletingId={deletingId}
                    />
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
                    <ExpenseForm onSuccess={refreshExpenses} />
                    <ExpenseList expenses={expenses} onUpdate={refreshExpenses} />
                </div>
            )}

            {activeTab === 'goals' && (
                <GoalTracker
                    goals={goals}
                    goalSummary={goalSummary}
                    onUpdate={loadData}
                />
            )}
        </div>
    );
};

export default BudgetDashboard;

