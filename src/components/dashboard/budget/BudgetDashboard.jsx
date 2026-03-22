import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Plus, TrendingUp, Zap } from 'lucide-react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import BudgetSummaryCards from './BudgetSummaryCards';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import GoalList from './GoalList';
import QuickExpenseModal from './QuickExpenseModal';
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

const BudgetDashboard = () => {
    // State management
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [goalSummary, setGoalSummary] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingBudget, setEditingBudget] = useState(null);
    
    const [activeTab, setActiveTab] = useState('overview');
    const [showQuickExpense, setShowQuickExpense] = useState(false);

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
            
            console.log('Submitting budget:', formValues); 
            
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
        } catch (err) {
            console.error('Budget submission error:', err); 
            const errorMessage = err.response?.data?.errors || err.response?.data || err.message;
            console.error('Full error details:', errorMessage);
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
            
            // Refresh summary
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
            
            // Also refresh budgets and summary
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Budget Manager</h1>
                    <p className="mt-1 text-sm text-slate-600">Take control of your spending and savings</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowQuickExpense(true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-900 shadow-sm transition-all hover:bg-amber-100 hover:shadow-md"
                    >
                        <Zap size={18} />
                        Quick Expense
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Could not load your budget data.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {summary && <BudgetSummaryCards summary={summary} budgetHealth={budgetHealth} />}

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'budgets', label: `Budgets (${budgets.length})` },
                    { id: 'expenses', label: 'Expenses' },
                    { id: 'goals', label: `Goals (${goals.length})` },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                            activeTab === tab.id
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid gap-6 xl:grid-cols-2">
                    {/* Recent Budgets */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Active Budgets</h3>
                            <button
                                onClick={() => setActiveTab('budgets')}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                            >
                                View All →
                            </button>
                        </div>
                        <BudgetList
                            budgets={budgets.slice(0, 4)}
                            onEdit={(budget) => {
                                setEditingBudget(budget);
                                setActiveTab('budgets');
                            }}
                            onDelete={handleDeleteBudget}
                            deletingId={deletingId}
                            compact
                        />
                    </div>

                    {/* Recent Expenses */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Recent Expenses</h3>
                            <button
                                onClick={() => setActiveTab('expenses')}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                            >
                                View All →
                            </button>
                        </div>
                        <ExpenseList expenses={expenses.slice(0, 5)} compact />
                    </div>

                    {/* Active Goals */}
                    {goals.length > 0 && (
                        <div className="col-span-full space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Financial Goals</h3>
                                <button
                                    onClick={() => setActiveTab('goals')}
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                                >
                                    View All →
                                </button>
                            </div>
                            <GoalList goals={goals.slice(0, 3)} onUpdate={loadData} compact />
                        </div>
                    )}
                </div>
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

                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <TrendingUp className="mt-1 h-5 w-5 text-emerald-600" />
                                <div>
                                    <h3 className="font-bold text-emerald-900">Smart Budget Tracking</h3>
                                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                                        Set spending limits, get alerts when approaching your budget, and make informed financial decisions.
                                    </p>
                                </div>
                            </div>
                        </div>

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
                <GoalList goals={goals} onUpdate={loadData} />
            )}

            {/* Quick Expense Modal */}
            {showQuickExpense && (
                <QuickExpenseModal
                    onClose={() => setShowQuickExpense(false)}
                    onSuccess={() => {
                        setShowQuickExpense(false);
                        refreshExpenses();
                    }}
                />
            )}
        </div>
    );
};

export default BudgetDashboard;