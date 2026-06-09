import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, BadgeDollarSign, Check, Headphones, Home, Loader2, PiggyBank, Plus, Receipt, Wallet, X } from 'lucide-react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import BudgetOverview from './BudgetOverview';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import GoalTracker from './GoalTracker';
import { deriveBudgetCategoryType, readBudgetSetup, saveBudgetSetup } from '../../../utils/budgetSetup';
import {
    getBudgets,
    getBudgetSummary,
    createBudget,
    getCategories as getBudgetCategories,
    createCategory as createBudgetCategory,
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
import NumericInput from '../../common/NumericInput';

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

const mobileBudgetPlans = [
    {
        id: 'classic',
        label: '50/30/20 Classic Budget',
        description: 'Most popular all-purpose budget 50% Needs, 30% Wants and savings 20%',
        split: { needs: 50, wants: 30, savings: 20 },
        group: 'Recommended',
        tone: 'warm',
        illustration: 'planner',
    },
    {
        id: 'custom',
        label: 'Custom Split',
        description: 'Set your own needs, wants, and savings percentages eg. Need 45%, wants 25% and savings 30%',
        split: { needs: 45, wants: 25, savings: 30 },
        group: 'Recommended',
        tone: 'warm',
        illustration: 'wallet',
    },
    {
        id: 'aggressive',
        label: '30/20/50 Aggressive Saver',
        description: 'FIRE path with maximum wealth building here needs 30%, wants 20% and savings 50%',
        split: { needs: 30, wants: 20, savings: 50 },
        group: 'Recommended',
        tone: 'warm',
        illustration: 'saver',
    },
    {
        id: 'debt',
        label: '50/20/30 Debt Destroyer',
        description: 'Aggressively eliminate debt fast needs 50%, wants 20% and debt 30%',
        split: { needs: 50, wants: 20, savings: 30 },
        group: 'Advanced',
        tone: 'blue',
        illustration: 'debt',
    },
    {
        id: 'city',
        label: '60/20/20 High-Cost Living',
        description: 'Good for higher rent cities and family costs needs 60%, wants 20% and savings 20%',
        split: { needs: 60, wants: 20, savings: 20 },
        group: 'Advanced',
        tone: 'blue',
        illustration: 'city',
    },
    {
        id: 'balanced',
        label: '40/40/20 Balanced',
        description: 'Equal room for needs and wants Needs 40%, wants 40% save 20%',
        split: { needs: 40, wants: 40, savings: 20 },
        group: 'Advanced',
        tone: 'blue',
        illustration: 'balanced',
    },
];

const mobileBudgetLaneOrder = ['Needs', 'Wants', 'Savings'];
const defaultIncomeCategories = ['Salary', 'Business', 'Freelance', 'Investment Income', 'Other Income'];
const mobilePlanStarterBudgets = [
    { lane: 'Needs', splitKey: 'needs', categoryName: 'Food' },
    { lane: 'Wants', splitKey: 'wants', categoryName: 'Lifestyle' },
    { lane: 'Savings', splitKey: 'savings', categoryName: 'Goal Savings' },
];

const unwrapCategoryPayload = (category) => category?.category || category?.data || category;
const normalizeCategoryOption = (category) => {
    const payload = unwrapCategoryPayload(category);
    return {
        ...payload,
        value: String(payload?.value ?? payload?.id ?? payload?.pk ?? payload?.uuid ?? payload?.category_id ?? ''),
        name: payload?.name || payload?.label || 'Category',
    };
};

const normalizeLabel = (value = '') => String(value).trim().toLowerCase();
const todayDate = () => new Date().toISOString().split('T')[0];
const monthStartDate = () => `${todayDate().slice(0, 7)}-01`;

const getNextMobileBudgetLane = (budgetRows = []) => (
    mobileBudgetLaneOrder.find((lane) => (
        !budgetRows.some((item) => deriveBudgetCategoryType(item?.category_name) === lane)
    )) || null
);

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
    const [mobileBudgetSetup, setMobileBudgetSetup] = useState(() => readBudgetSetup());
    const [mobileBudgetLane, setMobileBudgetLane] = useState('Needs');
    const [mobileBudgetStage, setMobileBudgetStage] = useState(() => (readBudgetSetup()?.split ? 'expenses' : 'income'));
    
    const [internalActiveTab, setInternalActiveTab] = useState('overview');
    const [overviewReturnView, setOverviewReturnView] = useState('compare');

    const activeTab = controlledActiveTab ?? internalActiveTab;
    const setActiveTab = onTabChange ?? setInternalActiveTab;
    const navigateBudgetTab = (tab, returnView) => {
        if (returnView) setOverviewReturnView(returnView);
        setActiveTab(tab);
    };

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

            const normalizedBudgets = Array.isArray(budgetsData) ? budgetsData : [];
            setBudgets(normalizedBudgets);
            setSummary(deriveSummaryFromBudgets(normalizedBudgets, summaryData, expensesData));
            setExpenses(expensesData.expenses || []);
            setExpenseTotal(expensesData.total || 0);
            setExpenseCount(expensesData.count || 0);
            setGoals(Array.isArray(goalsData) ? goalsData : []);
            setGoalSummary(goalSummaryData);

            const storedProfile = getStoredUserProfile();
            const incomeFromManager = getIncomeFromSummary(incomeSummaryData);
            const incomeFromProfile = Number(storedProfile?.profile?.monthly_income || 0);
            const resolvedIncome = incomeFromManager > 0 ? incomeFromManager : incomeFromProfile;
            setTotalIncome(resolvedIncome);

            const failedRequests = [budgetsResult, summaryResult, expensesResult].filter(
                (result) => result.status === 'rejected'
            );
            if (failedRequests.length > 0) {
                setError('Some dashboard sections could not fully sync. Showing available data.');
            }

            // Mobile mirrors the saved data contract: income unlocks the model,
            // the model creates starter limits, and expenses only track against real rows.
            const setup = readBudgetSetup();
            const nextLane = getNextMobileBudgetLane(normalizedBudgets);
            if (resolvedIncome <= 0) {
                setMobileBudgetStage('income');
            } else if (setup?.split) {
                setMobileBudgetSetup(setup);
                setMobileBudgetLane(nextLane || 'Needs');
                setMobileBudgetStage(normalizedBudgets.length > 0 ? 'expenses' : 'items');
            } else {
                setMobileBudgetStage('plans');
            }
        } catch (err) {
            setError(err.message || 'Could not load your budget data right now.');
        } finally {
            setLoading(false);
        }
    };

    const refreshIncomeTotal = async () => {
        const incomeSummaryData = await incomeService.getSummary().catch(() => null);
        const storedProfile = getStoredUserProfile();
        const incomeFromManager = getIncomeFromSummary(incomeSummaryData);
        const incomeFromProfile = Number(storedProfile?.profile?.monthly_income || 0);
        const resolvedIncome = incomeFromManager > 0 ? incomeFromManager : incomeFromProfile;
        setTotalIncome(resolvedIncome);
        return resolvedIncome;
    };

    const ensureMobilePlanStarterBudgets = async (setup, incomeAmount = totalIncome) => {
        const income = toNumber(incomeAmount);
        if (!setup?.split || income <= 0) return budgets;

        const [categoryRows, budgetRows] = await Promise.all([
            getBudgetCategories(),
            getBudgets({ current: 'true' }),
        ]);
        const normalizedCategories = (Array.isArray(categoryRows) ? categoryRows : []).map(normalizeCategoryOption);
        const normalizedBudgets = Array.isArray(budgetRows) ? budgetRows : [];
        const existingLaneNames = new Set(
            normalizedBudgets.map((item) => deriveBudgetCategoryType(item?.category_name))
        );

        for (const starter of mobilePlanStarterBudgets) {
            if (existingLaneNames.has(starter.lane)) continue;

            const matchingCategory = normalizedCategories.find(
                (category) => normalizeLabel(category.name) === normalizeLabel(starter.categoryName)
            );
            const createdCategory = matchingCategory || normalizeCategoryOption(await createBudgetCategory({ name: starter.categoryName }));
            const categoryValue = createdCategory.value || createdCategory.id || createdCategory.uuid;
            const amount = Math.round((income * toNumber(setup.split[starter.splitKey])) / 100);

            // The mobile Figma flow selects a plan before expenses, so we persist
            // starter limits that let the existing expense API validate transactions.
            await createBudget({
                category: categoryValue,
                amount,
                currency: 'KES',
                period: 'MONTHLY',
                start_date: monthStartDate(),
                is_recurring: true,
                alert_threshold: 80,
                notes: `Created from ${setup.label} mobile setup`,
                categoryName: starter.categoryName,
                categoryType: starter.lane,
            });
            existingLaneNames.add(starter.lane);
            normalizedCategories.push(createdCategory);
        }

        const [updatedBudgets, updatedSummary] = await Promise.all([
            getBudgets({ current: 'true' }),
            getBudgetSummary(),
        ]);
        const nextBudgets = Array.isArray(updatedBudgets) ? updatedBudgets : [];
        setBudgets(nextBudgets);
        setSummary(updatedSummary);
        markDashboardDataExists();
        triggerHealthRefresh('budget:create');
        return nextBudgets;
    };

    const handleMobileIncomeSaved = async () => {
        const resolvedIncome = await refreshIncomeTotal();
        if (resolvedIncome > 0) {
            setMobileBudgetStage(mobileBudgetSetup?.split ? 'expenses' : 'plans');
        }
    };

    const handleSelectMobilePlan = async (plan) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            const setup = { id: plan.id, label: plan.label, split: plan.split };
            saveBudgetSetup(setup);
            setMobileBudgetSetup(setup);
            const updatedBudgets = await ensureMobilePlanStarterBudgets(setup);
            setMobileBudgetLane(getNextMobileBudgetLane(updatedBudgets) || 'Needs');
            setMobileBudgetStage('expenses');
        } catch (err) {
            const errorMessage = err.response?.data?.errors || err.response?.data || err.message;
            setSubmitError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setIsSubmitting(false);
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
            const submittedLane = formValues.categoryType || mobileBudgetLane;
            
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
            
            const [budgetsData, newSummary] = await Promise.all([
                getBudgets({ current: 'true' }),
                getBudgetSummary(),
            ]);
            const normalizedBudgets = Array.isArray(budgetsData) ? budgetsData : [];
            setBudgets(normalizedBudgets);
            setSummary(newSummary);
            markDashboardDataExists();
            triggerHealthRefresh(editingBudget ? 'budget:update' : 'budget:create');
            setOverviewReturnView('categories');
            if (!editingBudget) {
                // Advance mobile from actual saved rows so refreshes, retries, and
                // duplicate lane entries cannot desync the mobile wizard from desktop data.
                const nextLane = getNextMobileBudgetLane(normalizedBudgets);
                setMobileBudgetLane(nextLane || submittedLane || 'Needs');
                setMobileBudgetStage(nextLane ? 'items' : 'complete');
            }
            setActiveTab('overview');
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
            setOverviewReturnView('expenses');
            setActiveTab('overview');
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
                <>
                    <div className="sm:hidden">
                        {mobileBudgetStage === 'income' ? (
                            <MobileIncomeStep
                                onSaved={handleMobileIncomeSaved}
                                isSubmitting={isSubmitting}
                                setIsSubmitting={setIsSubmitting}
                            />
                        ) : !mobileBudgetSetup?.split || mobileBudgetStage === 'plans' ? (
                            <MobileBudgetPlanSelector
                                onSelect={handleSelectMobilePlan}
                                isSubmitting={isSubmitting}
                                submitError={submitError}
                            />
                        ) : mobileBudgetStage === 'expenses' ? (
                            <MobileExpenseStage
                                budgets={budgets}
                                expenses={expenses}
                                setup={mobileBudgetSetup}
                                onExpenseSaved={refreshExpenses}
                                onAddBudgetItem={() => {
                                    setMobileBudgetStage('items');
                                    setMobileBudgetLane(getNextMobileBudgetLane(budgets) || 'Needs');
                                }}
                            />
                        ) : mobileBudgetStage === 'complete' ? (
                            <MobileBudgetCompletion
                                budgets={budgets}
                                setup={mobileBudgetSetup}
                                onAddAnother={() => {
                                    setMobileBudgetStage('items');
                                    setMobileBudgetLane('Needs');
                                }}
                                onTrackExpense={() => navigateBudgetTab('expenses')}
                            />
                        ) : (
                            <>
                                <MobileBudgetStepHeader activeLane={mobileBudgetLane} budgets={budgets} setup={mobileBudgetSetup} />
                                <BudgetForm
                                    key={`mobile-budget-${mobileBudgetLane}-${editingBudget?.uuid || 'new'}`}
                                    initialValues={editingBudget}
                                    onSubmit={handleSubmitBudget}
                                    onCancel={() => {
                                        setEditingBudget(null);
                                        setSubmitError('');
                                    }}
                                    isSubmitting={isSubmitting}
                                    existingBudgets={budgets}
                                    totalIncome={totalIncome}
                                    initialLane={mobileBudgetLane}
                                />
                                {submitError && (
                                    <div className="mt-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                                        {submitError}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <BudgetOverview
                            summary={summary}
                            budgets={budgets}
                            expenses={expenses}
                            goals={goals}
                            goalSummary={goalSummary}
                            expenseTotal={expenseTotal}
                            totalIncome={totalIncome}
                            budgetHealth={budgetHealth}
                            initialView={overviewReturnView}
                            onNavigate={navigateBudgetTab}
                            onSelectSection={onSelectSection}
                            onQuickExpenseAdded={refreshExpenses}
                        />
                    </div>
                </>
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
                            existingBudgets={budgets}
                            totalIncome={totalIncome}
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
                    <ExpenseForm onSuccess={refreshExpenses} budgets={budgets} />
                    <ExpenseList expenses={expenses} onUpdate={refreshExpenses} budgets={budgets} />
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

const MobileIncomeStep = ({ onSaved, isSubmitting, setIsSubmitting }) => {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        income_date: todayDate(),
        source: '',
        status: 'RECEIVED',
        description: '',
        is_recurring: false,
    });

    const categoryOptions = useMemo(
        () => categories.map(normalizeCategoryOption).filter((category) => category.value),
        [categories]
    );

    useEffect(() => {
        let cancelled = false;

        const ensureIncomeCategories = async () => {
            try {
                setCategoriesLoading(true);
                setError('');
                const fetched = await incomeService.getCategories();
                const fetchedRows = Array.isArray(fetched) ? fetched : (fetched?.categories || []);

                if (cancelled) return;
                if (fetchedRows.length > 0) {
                    setCategories(fetchedRows);
                    return;
                }

                const createdRows = [];
                for (const name of defaultIncomeCategories) {
                    try {
                        createdRows.push(await incomeService.createCategory({ name }));
                    } catch {
                        // Keep trying the remaining defaults so a partial backend issue
                        // does not leave the user without any selectable category.
                    }
                }
                if (!cancelled) setCategories(createdRows);
            } catch (err) {
                if (!cancelled) setError(err.message || 'We could not load income categories right now.');
            } finally {
                if (!cancelled) setCategoriesLoading(false);
            }
        };

        ensureIncomeCategories();
        return () => {
            cancelled = true;
        };
    }, []);

    const updateField = (name, value) => {
        setError('');
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!formData.category) {
            setError('Select an income category before continuing.');
            return;
        }
        if (!formData.amount || Number(formData.amount) <= 0) {
            setError('Enter a valid income amount greater than zero.');
            return;
        }
        if (!formData.description.trim()) {
            setError('Add a short description for this income.');
            return;
        }

        try {
            setIsSubmitting(true);
            await incomeService.quickIncome({
                category: formData.category,
                amount: formData.amount,
                description: formData.description.trim(),
                source: formData.source || formData.description.trim(),
                income_date: formData.income_date,
                status: formData.status,
                is_recurring: formData.is_recurring,
                frequency: formData.is_recurring ? 'MONTHLY' : 'ONE_TIME',
            });
            markDashboardDataExists();
            await onSaved();
        } catch (err) {
            const errorMessage = err.response?.data?.errors || err.response?.data || err.message;
            setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="pb-24 pt-5">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0 pb-2">
                    <p className="text-[12px] font-medium leading-4 text-[#111827]">Welcome to your</p>
                    <h1 className="mt-[10px] text-[18px] font-extrabold leading-6 text-[#0c6060]">Budget Planner</h1>
                    <p className="mt-[7px] text-[12px] leading-5 text-[#111827]">Let's take your budgeting to the next level</p>
                </div>
                <MobilePlanHero />
            </div>

            {error && (
                <div className="mt-4 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <MobileFieldLabel label="Income Category" required />
                <select
                    value={formData.category}
                    onChange={(event) => updateField('category', event.target.value)}
                    disabled={categoriesLoading && categoryOptions.length === 0}
                    className="h-[48px] w-full rounded-[10px] border border-[#d9d9d9] bg-[#f8f8f8] px-4 text-[12px] text-[#111827] outline-none focus:border-[#0c6060] focus:ring-2 focus:ring-[#0c6060]/10"
                    required
                >
                    <option value="">{categoriesLoading ? 'Loading categories...' : 'Eg. Salary'}</option>
                    {categoryOptions.map((category) => (
                        <option key={category.value} value={category.value}>{category.name}</option>
                    ))}
                </select>

                <MobileFieldLabel label="Amount" required />
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#707974]">KES</span>
                    <NumericInput
                        value={formData.amount}
                        onChange={(event) => updateField('amount', event.target.value)}
                        placeholder="Eg. KES 20,000"
                        className="h-[48px] w-full rounded-[10px] border border-[#d9d9d9] bg-[#f8f8f8] px-4 pl-14 text-[12px] text-[#111827] outline-none focus:border-[#0c6060] focus:ring-2 focus:ring-[#0c6060]/10"
                        required
                    />
                </div>

                <MobileFieldLabel label="Date" required />
                <input
                    type="date"
                    value={formData.income_date}
                    onChange={(event) => updateField('income_date', event.target.value)}
                    className="h-[48px] w-full rounded-[10px] border border-[#d9d9d9] bg-[#f8f8f8] px-4 text-[12px] text-[#111827] outline-none focus:border-[#0c6060] focus:ring-2 focus:ring-[#0c6060]/10"
                    required
                />

                <MobileFieldLabel label="Source" />
                <input
                    type="text"
                    value={formData.source}
                    onChange={(event) => updateField('source', event.target.value)}
                    placeholder="Eg. Salary"
                    className="h-[48px] w-full rounded-[10px] border border-[#d9d9d9] bg-[#f8f8f8] px-4 text-[12px] text-[#111827] outline-none focus:border-[#0c6060] focus:ring-2 focus:ring-[#0c6060]/10"
                />

                <MobileFieldLabel label="Status" />
                <div className="grid grid-cols-3 gap-2">
                    {['RECEIVED', 'EXPECTED', 'CANCELLED'].map((status) => {
                        const active = formData.status === status;
                        return (
                            <button
                                key={status}
                                type="button"
                                onClick={() => updateField('status', status)}
                                className={`flex h-10 items-center justify-center gap-2 rounded-[10px] border text-[11px] ${
                                    active ? 'border-[#f3c13a] bg-white text-[#e0a800]' : 'border-[#ededed] bg-white text-[#707974]'
                                }`}
                            >
                                <span className={`h-4 w-4 rounded-full border-2 ${active ? 'border-[#f3c13a] bg-[#f3c13a]/20' : 'border-[#9ca3af]'}`} />
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        );
                    })}
                </div>

                <MobileFieldLabel label="Description" required />
                <textarea
                    value={formData.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Type something"
                    rows={3}
                    className="w-full rounded-[10px] border border-[#d9d9d9] bg-[#f8f8f8] px-4 py-4 text-[12px] text-[#111827] outline-none focus:border-[#0c6060] focus:ring-2 focus:ring-[#0c6060]/10"
                    required
                />

                <label className="flex items-center gap-3 text-[13px] font-semibold text-[#707974]">
                    <input
                        type="checkbox"
                        checked={formData.is_recurring}
                        onChange={(event) => updateField('is_recurring', event.target.checked)}
                        className="h-5 w-5 rounded-full accent-[#0c6060]"
                    />
                    Is this a recurring income?
                </label>

                <button
                    type="submit"
                    disabled={isSubmitting || (categoriesLoading && categoryOptions.length === 0)}
                    className="mt-2 flex h-[56px] w-full items-center justify-center rounded-full bg-[#0c6060] text-[16px] font-extrabold text-white disabled:cursor-not-allowed disabled:bg-[#c7cdd4]"
                >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                </button>
            </form>
        </section>
    );
};

const MobileFieldLabel = ({ label, required = false }) => (
    <label className="block text-[12px] font-medium leading-5 text-[#707974]">
        {label} {required && <span className="text-[#ef4444]">*</span>}
    </label>
);

const MobileBudgetPlanSelector = ({ onSelect, isSubmitting = false, submitError = '' }) => {
    const groupedPlans = [
        ['Recommended', mobileBudgetPlans.filter((plan) => plan.group === 'Recommended')],
        ['Advanced', mobileBudgetPlans.filter((plan) => plan.group === 'Advanced')],
    ];

    return (
        <section className="pb-24 pt-5">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0 pb-2">
                    <p className="text-[12px] font-medium leading-4 text-[#111827]">Welcome to your</p>
                    <h1 className="mt-[10px] flex items-center gap-1 text-[18px] font-extrabold leading-6 text-[#0c6060]">
                        Budget Planner
                    </h1>
                    <p className="mt-[7px] text-[12px] leading-5 text-[#111827]">Let's take your budgeting to the next level</p>
                </div>
                <MobilePlanHero />
            </div>

            <div className="mt-6 space-y-4">
                {submitError && (
                    <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">
                        {submitError}
                    </div>
                )}
                {groupedPlans.map(([group, plans]) => (
                    <div key={group} className="space-y-4">
                        <h2 className="text-base font-medium leading-6 text-[#707974]">{group}</h2>
                        <div className="space-y-4">
                            {plans.map((plan) => (
                                <MobilePlanCard key={plan.id} plan={plan} onSelect={() => onSelect(plan)} disabled={isSubmitting} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const MobilePlanCard = ({ plan, onSelect, disabled = false }) => {
    const isWarm = plan.tone === 'warm';
    const textColor = isWarm ? 'text-[#aa5d04]' : 'text-[#0263bd]';

    return (
        <article className="relative min-h-[180px] overflow-hidden rounded-[20px] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="relative z-10 flex h-full min-h-[180px] flex-col justify-between px-6 py-5 pr-[112px]">
                <div className={textColor}>
                    <h3 className="text-[14px] font-semibold leading-4">{plan.label}</h3>
                    <p className="mt-2 max-w-[200px] text-[12px] font-light leading-4">{plan.description}</p>
                </div>
                <button
                    type="button"
                    onClick={onSelect}
                    disabled={disabled}
                    className={`mt-4 inline-flex h-7 w-[84px] items-center justify-center gap-2 rounded-full text-[12px] ${
                        isWarm ? 'bg-[#fff6e2] text-[#aa5d04]' : 'bg-[#e8f5ff] text-[#007eb6]'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    <Check size={10} strokeWidth={3} />
                    Start
                </button>
            </div>
            <MobilePlanIllustration type={plan.illustration} tone={plan.tone} />
        </article>
    );
};

const MobilePlanHero = () => (
    <div className="relative h-[110px] w-[110px] shrink-0">
        <div className="absolute bottom-3 right-1 h-[74px] w-[74px] rounded-full bg-[#f6cf6c]" />
        <div className="absolute bottom-8 right-7 h-11 w-10 rounded-[19px] bg-[#8f4d2e]" />
        <div className="absolute bottom-4 right-5 h-8 w-14 rotate-[12deg] rounded-[18px] bg-[#c95b35]" />
        <div className="absolute bottom-[58px] right-[34px] h-6 w-6 rounded-full bg-[#bd7a4b]" />
        <div className="absolute bottom-[73px] right-[22px] h-5 w-8 rotate-[20deg] rounded-full bg-[#4a2f29]" />
        <div className="absolute left-2 top-9 h-[18px] w-[18px] rotate-[-10deg] rounded border-2 border-[#15a8c8] bg-[#e7fbff]" />
        <div className="absolute right-2 top-7 h-2 w-2 rounded-full bg-[#eabb3a]" />
        <div className="absolute right-7 top-2 h-[9px] w-[9px] rotate-45 border-b-2 border-r-2 border-[#eabb3a]" />
    </div>
);

const MobilePlanIllustration = ({ type, tone }) => {
    const warm = tone === 'warm';
    const Icon = {
        planner: PiggyBank,
        wallet: Wallet,
        saver: Headphones,
        debt: BadgeDollarSign,
        city: Home,
        balanced: Wallet,
    }[type] || Wallet;

    return (
        <div className="absolute bottom-8 right-6 flex h-[92px] w-[102px] items-center justify-center">
            <div className={`absolute inset-x-4 bottom-0 h-12 rounded-full ${warm ? 'bg-[#ffe6ac]' : 'bg-[#cfeaff]'}`} />
            <div className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-[24px] ${warm ? 'bg-[#f9bf45] text-[#aa5d04]' : 'bg-[#d7efff] text-[#007eb6]'}`}>
                <Icon size={36} strokeWidth={1.8} />
            </div>
            <span className={`absolute right-1 top-2 h-2 w-2 rounded-full ${warm ? 'bg-[#f5a623]' : 'bg-[#0290c9]'}`} />
            <span className={`absolute left-1 top-6 h-3 w-3 rotate-45 rounded-[3px] ${warm ? 'bg-[#ffe4a3]' : 'bg-[#e5f6ff]'}`} />
        </div>
    );
};

const MobileExpenseStage = ({ budgets = [], expenses = [], setup, onExpenseSaved, onAddBudgetItem }) => {
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const hasBudgetLimits = budgets.length > 0;
    // Use the shared category classifier so mobile filters match desktop tracking rules.
    const filteredExpenses = useMemo(
        () => (
            activeFilter === 'All'
                ? expenses
                : expenses.filter((expense) => deriveBudgetCategoryType(expense?.category_name) === activeFilter)
        ),
        [activeFilter, expenses]
    );
    const visibleExpenses = filteredExpenses.slice(0, 3);
    const emptyTitle = activeFilter === 'All'
        ? 'No recurring transactions'
        : `No ${activeFilter.toLowerCase()} transactions`;

    const handleSaved = async () => {
        await onExpenseSaved();
        setShowExpenseModal(false);
    };

    return (
        <section className="pb-24 pt-5">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0 pb-2">
                    <p className="text-[12px] font-medium leading-4 text-[#111827]">Welcome to your</p>
                    <h1 className="mt-[10px] text-[18px] font-extrabold leading-6 text-[#0c6060]">Budget Planner</h1>
                    <p className="mt-[7px] text-[12px] leading-5 text-[#111827]">Let's take your budgeting to the next level</p>
                </div>
                <MobilePlanHero />
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {['All', 'Needs', 'Wants', 'Savings'].map((label) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setActiveFilter(label)}
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            activeFilter === label ? 'bg-[#f3c13a] text-white' : 'bg-white text-[#707974]'
                        }`}
                        aria-pressed={activeFilter === label}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="mt-8 rounded-[20px] bg-white px-5 py-7 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f4f8fb] text-[#0c6060]">
                    <Receipt size={30} strokeWidth={1.8} />
                </div>
                <h2 className="mt-5 text-[15px] font-extrabold text-[#111827]">
                    {visibleExpenses.length ? `${activeFilter} transactions` : emptyTitle}
                </h2>
                <p className="mx-auto mt-2 max-w-[250px] text-[12px] leading-5 text-[#9ca3af]">
                    {visibleExpenses.length
                        ? `Showing spending tracked under ${activeFilter === 'All' ? 'your full budget plan' : activeFilter.toLowerCase()}.`
                        : activeFilter === 'All'
                            ? 'Add your transactions for your budget to see the magic and turn your allocated savings into action with simple next moves.'
                            : `You have not added any ${activeFilter.toLowerCase()} transactions yet.`}
                </p>

                {visibleExpenses.length > 0 && (
                    <div className="mt-5 space-y-2 text-left">
                        {visibleExpenses.map((expense) => (
                            <div key={expense.uuid || expense.id} className="flex items-center justify-between rounded-[12px] bg-[#f8fcfa] px-3 py-2">
                                <span className="min-w-0 truncate text-[12px] font-semibold text-[#111827]">
                                    {expense.description || expense.category_name || 'Expense'}
                                </span>
                                <span className="text-[12px] font-bold text-[#0c6060]">
                                    KES {toNumber(expense.amount).toLocaleString('en-KE')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowExpenseModal(true)}
                        disabled={!hasBudgetLimits}
                        className="mx-auto flex h-11 w-full max-w-[230px] items-center justify-center rounded-full bg-[#0c6060] px-4 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c7cdd4]"
                    >
                        Add Transactions
                    </button>
                    {!hasBudgetLimits && (
                        <button
                            type="button"
                            onClick={onAddBudgetItem}
                            className="mx-auto flex h-10 w-full max-w-[230px] items-center justify-center rounded-full border border-[#d9d9d9] bg-white px-4 text-[12px] font-bold text-[#0c6060]"
                        >
                            Add budget limits first
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-5">
                <p className="text-[13px] font-bold text-[#111827]">Use Your Savings Limit Wisely</p>
                <p className="mt-1 text-[11px] leading-4 text-[#9ca3af]">
                    Choose a budget type and we can suggest how to put your savings allocation to work.
                </p>
                <div className="mt-3 space-y-3">
                    <MobileSavingsSuggestion tone="amber" title="Emergency Buffer in MMF" body="Keep 3-6 months of essentials liquid in a money market fund." />
                    <MobileSavingsSuggestion tone="green" title="Short-Term Goals" body="Use MMFs or high-yield savings for goals coming up within 12 months." />
                    <MobileSavingsSuggestion tone="purple" title="Treasury Bills" body="Put part of your savings into T-Bills when you want a low-risk parking option." />
                </div>
            </div>

            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 pb-3 pt-16 sm:hidden">
                    <div className="max-h-[86vh] w-full overflow-y-auto rounded-t-[22px] bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eeeeee] bg-white px-4 py-3">
                            <div>
                                <p className="text-[11px] font-medium text-[#707974]">{setup?.label || 'Budget plan'}</p>
                                <h3 className="text-[15px] font-extrabold text-[#111827]">Add Item</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowExpenseModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f5f7] text-[#9ca3af]"
                                aria-label="Close add transaction"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-3">
                            <ExpenseForm onSuccess={handleSaved} onCancel={() => setShowExpenseModal(false)} budgets={budgets} />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

const MobileSavingsSuggestion = ({ tone, title, body }) => {
    const toneClasses = {
        amber: 'bg-[#fff4e8] text-[#e28a17]',
        green: 'bg-[#eaf8ef] text-[#26a96c]',
        purple: 'bg-[#f3ecff] text-[#7c4dff]',
    };

    return (
        <article className="flex items-start gap-3 rounded-[14px] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClasses[tone] || toneClasses.green}`}>
                <Plus size={16} />
            </div>
            <div className="min-w-0">
                <h3 className="text-[12px] font-extrabold text-[#111827]">{title}</h3>
                <p className="mt-1 text-[10px] leading-4 text-[#707974]">{body}</p>
            </div>
        </article>
    );
};

const MobileBudgetStepHeader = ({ activeLane, budgets = [], setup }) => {
    const activeIndex = Math.max(mobileBudgetLaneOrder.indexOf(activeLane), 0);
    const split = setup?.split || {};

    return (
        <section className="rounded-[18px] bg-white px-4 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#707974]">
                        Step {activeIndex + 1} of {mobileBudgetLaneOrder.length}
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold text-[#0c6060]">Add {activeLane}</h2>
                    <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                        Use the same budget model and validation as desktop.
                    </p>
                </div>
                <span className="rounded-full bg-[#e7f6f1] px-3 py-1 text-xs font-bold text-[#0c6060]">
                    {split[String(activeLane || '').toLowerCase()] || 0}%
                </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                {mobileBudgetLaneOrder.map((lane, index) => {
                    const complete = budgets.some((item) => deriveBudgetCategoryType(item?.category_name) === lane);
                    const active = lane === activeLane;

                    return (
                        <div key={lane} className={`h-2 rounded-full ${complete || active ? 'bg-[#0c6060]' : 'bg-[#d9d9d9]'}`} aria-label={`${lane} ${complete ? 'complete' : active ? 'active' : 'pending'}`} />
                    );
                })}
            </div>
        </section>
    );
};

const MobileBudgetCompletion = ({ budgets = [], setup, onAddAnother, onTrackExpense }) => {
    const totalBudget = budgets.reduce((sum, item) => sum + toNumber(item?.amount), 0);
    const split = setup?.split || { needs: 0, wants: 0, savings: 0 };
    const counts = ['Needs', 'Wants', 'Savings'].map((lane) => ({
        lane,
        count: budgets.filter((item) => deriveBudgetCategoryType(item?.category_name) === lane).length,
    }));

    return (
        <section className="pb-24 pt-5">
            <div className="rounded-[22px] bg-white px-5 py-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f6f1] text-[#0c6060]">
                    <Check size={26} strokeWidth={3} />
                </div>
                <h2 className="mt-4 text-center text-xl font-extrabold text-[#0c6060]">Budget setup complete</h2>
                <p className="mx-auto mt-2 max-w-[270px] text-center text-sm leading-6 text-[#6b7280]">
                    Your Needs, Wants, and Savings setup is ready. You can now track spending against these limits.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2">
                    <MobileCompleteStat label="Needs" value={`${split.needs || 0}%`} count={counts[0].count} />
                    <MobileCompleteStat label="Wants" value={`${split.wants || 0}%`} count={counts[1].count} />
                    <MobileCompleteStat label="Savings" value={`${split.savings || 0}%`} count={counts[2].count} />
                </div>

                <div className="mt-4 rounded-[16px] bg-[#f8fcfa] px-4 py-3 text-center">
                    <p className="text-xs font-medium text-[#707974]">Total budget created</p>
                    <p className="mt-1 text-lg font-extrabold text-[#111827]">KES {totalBudget.toLocaleString('en-KE')}</p>
                </div>

                <div className="mt-5 space-y-3">
                    <button
                        type="button"
                        onClick={onTrackExpense}
                        className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#0c6060] px-4 text-base font-bold text-white"
                    >
                        Track Expenses
                    </button>
                    <button
                        type="button"
                        onClick={onAddAnother}
                        className="flex h-11 w-full items-center justify-center rounded-full border border-[#d1d5db] bg-white px-4 text-sm font-bold text-[#6b7280]"
                    >
                        Add More Budget Items
                    </button>
                </div>
            </div>
        </section>
    );
};

const MobileCompleteStat = ({ label, value, count }) => (
    <div className="rounded-[14px] bg-[#f8fcfa] px-2 py-3 text-center">
        <p className="text-base font-extrabold text-[#0c6060]">{value}</p>
        <p className="mt-1 text-[11px] font-semibold text-[#111827]">{label}</p>
        <p className="mt-1 text-[10px] text-[#707974]">{count} item{count === 1 ? '' : 's'}</p>
    </div>
);

export default BudgetDashboard;

