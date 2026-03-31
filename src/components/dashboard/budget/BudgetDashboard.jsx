import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
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
import { calculateBudgetHealth } from '../../../utils/budgetHelpers';
import { markDashboardDataExists } from '../../../pages/DashboardPage';

const BudgetDashboard = ({ activeTab: controlledActiveTab, onTabChange }) => {
    // State management
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [expenseCount, setExpenseCount] = useState(0);
    const [goals, setGoals] = useState([]);
    const [goalSummary, setGoalSummary] = useState(null);
    
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
    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [budgetsData, summaryData, expensesData, goalsData, goalSummaryData] = await Promise.all([
                getBudgets({ current: 'true' }),
                getBudgetSummary(),
                getExpenses({ limit: 10 }),
                getGoals({ status: 'ACTIVE' }),
                getGoalSummary(),
            ]);
            
            setBudgets(budgetsData);
            setSummary(summaryData);
            setExpenses(expensesData.expenses || []);
            setExpenseTotal(expensesData.total || 0);
            setExpenseCount(expensesData.count || 0);
            setGoals(goalsData);
            setGoalSummary(goalSummaryData);
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
        } catch (err) {
            setSubmitError(err.message || 'Could not remove this budget right now.');
        } finally {
            setDeletingId(null);
        }
    };

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

            {/* Navigation Tabs */}
            <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'goals', label: `Goals`, count: goals.length },
                    { id: 'budgets', label: `Budgets`, count: budgets.length },
                    { id: 'expenses', label: `Expenses`, count: expenseCount },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                                activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && summary && (
                <BudgetOverview
                    summary={summary}
                    budgets={budgets}
                    expenses={expenses}
                    expenseTotal={expenseTotal}
                    goals={goals}
                    goalSummary={goalSummary}
                    budgetHealth={budgetHealth}
                    onNavigate={setActiveTab}
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
                <GoalTracker goals={goals} goalSummary={goalSummary} onUpdate={loadData} />
            )}
        </div>
    );
};

export default BudgetDashboard;
