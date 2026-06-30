import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, BadgeDollarSign, Bell, BookOpen, Check, Headphones, Home, Loader2, Mail, MoreHorizontal, PiggyBank, Plus, Receipt, Search, Wallet, X } from 'lucide-react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
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
    createExpense,
    getGoals,
    getGoalSummary,
} from '../../../services/budgetApi';
import incomeService from '../../../services/incomeService';
import { getStoredUserProfile } from '../../../services/authApi';
import { calculateBudgetHealth, formatCurrency } from '../../../utils/budgetHelpers';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';
import NumericInput from '../../common/NumericInput';
import budgetPlannerHero from '../../../assets/budget-planner-hero.png';
import animatedLogo from '../../../assets/shilingi-logo-animated.gif';
import { getDashboardDisplayName, getMemberInitials } from '../../../utils/memberIdentity';

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
const getBudgetCategoryValue = (budget) => String(
    budget?.category || budget?.category_id || budget?.category_uuid || budget?.categoryId || budget?.category_name || ''
);
const getBudgetCategoryIdentifier = (budget) => String(
    budget?.category || budget?.category_id || budget?.category_uuid || budget?.categoryId || ''
);

const getExpenseCategoryName = (expense, budgetRows = []) => {
    if (expense?.category_name) return expense.category_name;
    const expenseCategory = String(expense?.category || expense?.category_id || expense?.category_uuid || '');
    return budgetRows.find((budget) => getBudgetCategoryValue(budget) === expenseCategory)?.category_name || '';
};

const getExpenseLane = (expense, budgetRows = []) => deriveBudgetCategoryType(getExpenseCategoryName(expense, budgetRows));

const getNextMobileBudgetLane = (budgetRows = []) => (
    mobileBudgetLaneOrder.find((lane) => (
        !budgetRows.some((item) => deriveBudgetCategoryType(item?.category_name) === lane)
    )) || null
);

const BudgetDashboard = ({ activeTab: controlledActiveTab, onTabChange, onSelectSection, user }) => {
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
    const [desktopIncomeModalOpen, setDesktopIncomeModalOpen] = useState(false);
    const [desktopTransactionModalOpen, setDesktopTransactionModalOpen] = useState(false);
    
    const [internalActiveTab, setInternalActiveTab] = useState('overview');
    const [, setOverviewReturnView] = useState('compare');

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

    const handleDesktopIncomeSaved = async () => {
        await handleMobileIncomeSaved();
        setDesktopIncomeModalOpen(false);
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

    const handleChangeBudgetPlan = async (plan) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            const setup = { id: plan.id, label: plan.label, split: plan.split };
            saveBudgetSetup(setup);
            setMobileBudgetSetup(setup);
            setMobileBudgetLane(getNextMobileBudgetLane(budgets) || 'Needs');
            setMobileBudgetStage(budgets.length > 0 ? 'expenses' : 'items');
            markDashboardDataExists();
            return setup;
        } catch (err) {
            const errorMessage = err.response?.data?.errors || err.response?.data || err.message;
            setSubmitError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
            return null;
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
                <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden sm:flex-row sm:items-center">
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
            {summary && (
                <div className="hidden lg:block">
                    <DesktopBudgetPlannerFlow
                        activeTab={activeTab}
                        budgetHealth={budgetHealth}
                        budgets={budgets}
                        deletingId={deletingId}
                        desktopIncomeModalOpen={desktopIncomeModalOpen}
                        desktopTransactionModalOpen={desktopTransactionModalOpen}
                        editingBudget={editingBudget}
                        expenseCount={expenseCount}
                        expenseTotal={expenseTotal}
                        expenses={expenses}
                        goalSummary={goalSummary}
                        goals={goals}
                        handleDeleteBudget={handleDeleteBudget}
                        handleDesktopIncomeSaved={handleDesktopIncomeSaved}
                        handleChangeBudgetPlan={handleChangeBudgetPlan}
                        handleSelectMobilePlan={handleSelectMobilePlan}
                        handleSubmitBudget={handleSubmitBudget}
                        isSubmitting={isSubmitting}
                        loadData={loadData}
                        mobileBudgetSetup={mobileBudgetSetup}
                        navigateBudgetTab={navigateBudgetTab}
                        onSelectSection={onSelectSection}
                        refreshExpenses={refreshExpenses}
                        setActiveTab={setActiveTab}
                        setDesktopIncomeModalOpen={setDesktopIncomeModalOpen}
                        setDesktopTransactionModalOpen={setDesktopTransactionModalOpen}
                        setEditingBudget={setEditingBudget}
                        setIsSubmitting={setIsSubmitting}
                        setMobileBudgetStage={setMobileBudgetStage}
                        setSubmitError={setSubmitError}
                        submitError={submitError}
                        summary={summary}
                        totalIncome={totalIncome}
                        user={user}
                    />
                </div>
            )}

            {activeTab === 'overview' && summary && (
                <>
                    <div className="lg:hidden">
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
                                onComparePlans={() => {
                                    setSubmitError('');
                                    setMobileBudgetStage('plans');
                                }}
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
                </>
            )}

            {activeTab === 'budgets' && (
                <div className="grid gap-6 lg:hidden xl:grid-cols-[0.95fr_1.35fr]">
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
                <div className="grid gap-6 lg:hidden xl:grid-cols-[0.95fr_1.35fr]">
                    <ExpenseForm onSuccess={refreshExpenses} budgets={budgets} />
                    <ExpenseList expenses={expenses} onUpdate={refreshExpenses} budgets={budgets} />
                </div>
            )}

            {activeTab === 'goals' && (
                <div className="lg:hidden">
                    <GoalTracker
                        goals={goals}
                        goalSummary={goalSummary}
                        onUpdate={loadData}
                    />
                </div>
            )}
        </div>
    );
};

const desktopNavItems = [
    { id: 'overview', label: 'Budget Planner', icon: Search, section: 'budget' },
    { id: 'debt', label: 'Debt Manager', icon: Bell, section: 'debt' },
    { id: 'investments', label: 'Investment Planner', icon: Mail, section: 'investments' },
    { id: 'protection', label: 'Protection Planner', icon: Mail, section: 'protection' },
    { id: 'retirement', label: 'Retirement Planner', icon: BookOpen, section: 'retirement' },
    { id: 'networth', label: 'Net Worth Tracker', icon: Wallet, section: 'networth' },
];

const DesktopBudgetPlannerFlow = ({
    activeTab,
    budgetHealth,
    budgets,
    deletingId,
    desktopIncomeModalOpen,
    desktopTransactionModalOpen,
    editingBudget,
    expenseCount,
    expenseTotal,
    expenses,
    goalSummary,
    goals,
    handleDeleteBudget,
    handleChangeBudgetPlan,
    handleDesktopIncomeSaved,
    handleSelectMobilePlan,
    handleSubmitBudget,
    isSubmitting,
    loadData,
    mobileBudgetSetup,
    navigateBudgetTab,
    onSelectSection,
    refreshExpenses,
    setActiveTab,
    setDesktopIncomeModalOpen,
    setDesktopTransactionModalOpen,
    setEditingBudget,
    setIsSubmitting,
    setMobileBudgetStage,
    setSubmitError,
    submitError,
    summary,
    totalIncome,
    user,
}) => {
    const [desktopPlanChangeOpen, setDesktopPlanChangeOpen] = useState(false);
    const displayName = getDashboardDisplayName(user);
    const initials = getMemberInitials(user);
    const hasIncome = totalIncome > 0;
    const hasPlan = Boolean(mobileBudgetSetup?.split);
    const hasBudgets = budgets.length > 0;
    const hasTransactions = expenses.length > 0;
    const totalBudget = toNumber(summary?.total_budget);
    const totalSpent = toNumber(summary?.total_spent || expenseTotal);
    const remaining = Math.max(toNumber(summary?.total_remaining || totalBudget - totalSpent), 0);
    const spendingPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
    const healthScore = Math.max(0, Math.min(100, Math.round(budgetHealth?.score || (hasIncome ? 72 : 0))));
    const budgetRows = buildDesktopBudgetRows(budgets, totalIncome);
    const canContinue = hasIncome && hasPlan && hasBudgets;

    const showBudgetItems = activeTab === 'budgets' || (hasIncome && hasPlan && !hasBudgets);
    const showExpenses = activeTab === 'expenses' || (hasIncome && hasPlan && hasBudgets);

    const handlePlanSelect = async (plan) => {
        await handleSelectMobilePlan(plan);
        setDesktopPlanChangeOpen(false);
        setMobileBudgetStage('expenses');
    };

    const handlePlanChange = async (plan) => {
        const updated = await handleChangeBudgetPlan(plan);
        if (updated) {
            setDesktopPlanChangeOpen(false);
            setActiveTab('overview');
        }
    };

    const handleTransactionSaved = async () => {
        await refreshExpenses();
        setDesktopTransactionModalOpen(false);
    };

    const renderCenterContent = () => {
        if (activeTab === 'goals') {
            return <GoalTracker goals={goals} goalSummary={goalSummary} onUpdate={loadData} />;
        }

        if (!hasIncome) {
            return (
                <DesktopEmptyCard
                    title="Add Source of Income"
                    text="Add your income for your budget to see the magic and turn your allocated savings into action with simple next moves."
                    action="Add Income"
                    disabledLabel="Continue"
                    onAction={() => setDesktopIncomeModalOpen(true)}
                />
            );
        }

        if (showBudgetItems && hasIncome && hasPlan && !hasBudgets) {
            return (
                <div className="mx-auto max-w-[28rem]">
                    <DesktopStepNote title="Build your budget items" text="Your income and plan are ready. Add the first budget item so transactions can be tracked against real limits." />
                    <BudgetForm
                        key={`desktop-budget-${editingBudget?.uuid || 'new'}`}
                        initialValues={editingBudget}
                        onSubmit={handleSubmitBudget}
                        onCancel={() => {
                            setEditingBudget(null);
                            setSubmitError('');
                        }}
                        isSubmitting={isSubmitting}
                        existingBudgets={budgets}
                        totalIncome={totalIncome}
                        initialLane={getNextMobileBudgetLane(budgets) || 'Needs'}
                    />
                    {submitError && <DesktopError text={submitError} />}
                </div>
            );
        }

        if (activeTab === 'budgets') {
            return (
                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.1fr]">
                    <div>
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
                        {submitError && <DesktopError text={submitError} />}
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
            );
        }

        if (activeTab === 'expenses' && hasTransactions) {
            return (
                <div className="grid gap-5 xl:grid-cols-[0.95fr_1.1fr]">
                    <ExpenseForm onSuccess={refreshExpenses} budgets={budgets} />
                    <ExpenseList expenses={expenses} onUpdate={refreshExpenses} budgets={budgets} />
                </div>
            );
        }

        if (!hasPlan) {
            return (
                <div>
                    <div className="mb-5 text-center">
                        <p className="text-[14px] font-semibold text-[#232e3d]">Pick a budget plan</p>
                        <p className="mt-1 text-[13px] text-[#8e97ab]">Choose how your income should be split before transactions start.</p>
                    </div>
                    <DesktopPlanGrid onSelect={handlePlanSelect} disabled={isSubmitting} />
                    {submitError && <DesktopError text={submitError} />}
                </div>
            );
        }

        if (desktopPlanChangeOpen) {
            return (
                <div>
                    <DesktopCurrentPlanNotice
                        setup={mobileBudgetSetup}
                        onCancel={() => setDesktopPlanChangeOpen(false)}
                    />
                    <DesktopPlanGrid
                        activePlanId={mobileBudgetSetup?.id}
                        disabled={isSubmitting}
                        onSelect={handlePlanChange}
                    />
                    {submitError && <DesktopError text={submitError} />}
                </div>
            );
        }

        if (showExpenses && !hasTransactions) {
            return (
                <DesktopEmptyCard
                    title="No recurring transactions"
                    text="Add your transactions for your budget to see the magic and turn your allocated savings into action with simple next moves."
                    action={hasBudgets ? 'Add Transactions' : 'Add Budget Items'}
                    secondaryAction={hasBudgets ? 'Manage Items' : null}
                    onAction={() => (hasBudgets ? setDesktopTransactionModalOpen(true) : navigateBudgetTab('budgets'))}
                    onSecondary={() => navigateBudgetTab('budgets')}
                />
            );
        }

        return (
            <DesktopBudgetSummary
                budgetRows={budgetRows}
                budgets={budgets}
                expenseCount={expenseCount}
                expenses={expenses}
                remaining={remaining}
                spendingPercent={spendingPercent}
                totalBudget={totalBudget}
                totalIncome={totalIncome}
                totalSpent={totalSpent}
                onAddTransaction={() => setDesktopTransactionModalOpen(true)}
                onChangePlan={() => setDesktopPlanChangeOpen(true)}
                onManageBudget={() => navigateBudgetTab('budgets')}
                setup={mobileBudgetSetup}
            />
        );
    };

    return (
        <section className="grid min-h-[calc(100vh-2rem)] grid-cols-[16rem_minmax(27rem,1fr)_19rem] overflow-hidden rounded-[2.5rem] bg-[#f8f8f8] text-[#232e3d] shadow-[0_24px_80px_rgba(15,23,42,0.08)] xl:grid-cols-[18.5rem_minmax(34rem,1fr)_21.5rem]">
            <aside className="flex min-h-[49rem] flex-col bg-white px-8 py-8">
                <button type="button" onClick={() => onSelectSection?.('overview')} className="h-[61px] w-[102px] overflow-hidden text-left" aria-label="Shilingi Moves home">
                    <img src={animatedLogo} alt="Shilingi Moves" className="h-full w-full object-contain object-left" />
                </button>

                <nav className="mt-12 space-y-1">
                    <DesktopNavButton icon={Home} label="Home" onClick={() => onSelectSection?.('overview')} />
                    <p className="px-1 pb-3 pt-5 text-[14px] text-[#acacac]">Planning Tools</p>
                    {desktopNavItems.map((item) => (
                        <DesktopNavButton
                            key={item.id}
                            active={item.id === 'overview'}
                            icon={item.icon}
                            label={item.label}
                            onClick={() => (item.section === 'budget' ? setActiveTab('overview') : onSelectSection?.(item.section))}
                        />
                    ))}
                    <p className="px-1 pb-3 pt-5 text-[14px] text-[#acacac]">Support</p>
                    <DesktopNavButton icon={BookOpen} label="Help Center" onClick={() => onSelectSection?.('resourceshub')} />
                    <DesktopNavButton icon={BookOpen} label="Go to website" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/'; }} />
                </nav>

                <p className="mt-auto max-w-[14rem] text-[10px] leading-[15px] text-[#8e97ab]">
                    <span className="block font-bold text-[#232e3d]">©Kaizen Publishers Limited All rights reserved.</span>
                    Shilingi Moves is a financial wellness platform and does not provide regulated financial advice. All content is for educational and informational purposes only.
                </p>
            </aside>

            <main className="min-w-0 px-8 py-8">
                <header className="border-b border-[#e3e3e5] pb-5">
                    <p className="text-[16px] text-[#111827]">Good morning,</p>
                    <h1 className="mt-1 text-[32px] font-extrabold leading-tight text-[#0c6060]">{displayName} <span aria-hidden>👋</span></h1>
                    <p className="text-[16px] text-[#111827]">Your Financial Health score is {healthScore}/100</p>
                </header>

                <section className="border-b border-[#e3e3e5] py-6">
                    <div className="flex items-center justify-between gap-8">
                        <div className="min-w-0">
                            <p className="text-[14px] text-[#111827]">Welcome to your</p>
                            <h2 className="mt-1 text-[24px] font-extrabold leading-tight text-[#0c6060]">Budget Planner 🧮</h2>
                            <p className="mt-1 text-[14px] text-[#111827]">Let's take your budgeting to the next level</p>
                        </div>
                        <img src={budgetPlannerHero} alt="" className="h-[8.6rem] w-[8.6rem] shrink-0 object-contain" />
                    </div>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-[14px] font-semibold text-[#232e3d]">{activeTab === 'expenses' ? 'My Transactions' : 'Sources of Income'}</p>
                            <p className="mt-1 text-[14px] text-[#111827]">
                                {activeTab === 'expenses' ? 'Here is your transactions breakdown summary' : 'Here is your income breakdown summary'}
                            </p>
                        </div>
                        <DesktopFlowTabs
                            activeTab={activeTab}
                            onSelect={(id) => navigateBudgetTab(id)}
                            canContinue={canContinue}
                            onChangePlan={() => setDesktopPlanChangeOpen(true)}
                            setup={mobileBudgetSetup}
                        />
                    </div>
                </section>

                <section className="py-7">{renderCenterContent()}</section>
            </main>

            <aside className="bg-white px-4 py-8">
                <div className="flex items-center justify-between gap-3">
                    <Bell size={22} className="text-[#232e3d]" />
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2d0b7] text-[13px] font-bold text-[#7e421f]">{initials}</div>
                        <div className="min-w-0">
                            <p className="truncate text-[15px] font-bold text-[#232e3d]">{displayName}</p>
                            <p className="text-[15px] text-[#8b98a5]">Basic</p>
                        </div>
                    </div>
                    <MoreHorizontal size={20} className="text-[#232e3d]" />
                </div>

                <div className="mt-8 flex h-11 items-center gap-4 rounded-full bg-[#e6e6e6] px-3 text-[15px] text-[#8b98a5]">
                    <Search size={20} />
                    <span>Search</span>
                </div>

                <DesktopRailCard title="Financial Health Score" action="View More" onAction={() => onSelectSection?.('health')}>
                    <DesktopNotice>🥳 You are doing great, {displayName.split(' ')[0]}! Keep Up 👍🏻</DesktopNotice>
                    <div className="mt-4 flex items-center gap-4">
                        <DesktopGauge score={healthScore} amount={formatCurrency(remaining || totalIncome || 187000)} />
                        <div className="min-w-0 flex-1 space-y-2">
                            <DesktopLegend label="Savings Rate" value="28%" color="bg-[#0c6060]" />
                            <DesktopLegend label="Debt Ratio" value="14%" color="bg-[#eabb3a]" valueClassName="text-[#eabb3a]" />
                            <DesktopLegend label="Budget" value={`${spendingPercent || 50}%`} color="bg-[#eb7e00]" valueClassName="text-[#eb7e00]" />
                            <DesktopLegend label="Investments" value="8%" color="bg-[#246bfd]" valueClassName="text-[#246bfd]" />
                        </div>
                    </div>
                </DesktopRailCard>

                <DesktopRailCard title={activeTab === 'expenses' ? 'Spending Breakdown' : 'Investment Portfolio'} action="View More" onAction={() => navigateBudgetTab('expenses')}>
                    <DesktopNotice>{hasTransactions ? 'Your month is moving well.' : 'Add transactions to unlock spending insights.'}</DesktopNotice>
                    <div className="mt-4 flex items-center gap-4">
                        <DesktopPie rows={budgetRows} />
                        <div className="min-w-0 flex-1 space-y-2">
                            {budgetRows.map((row) => (
                                <DesktopLegend key={row.label} label={row.label} value={`${row.percent.toFixed(0)}%`} color={row.color} />
                            ))}
                        </div>
                    </div>
                </DesktopRailCard>

                <section className="mt-6 px-4">
                    <h3 className="text-[16px] font-bold text-[#232e3d]">Insights</h3>
                    <p className="mt-1 text-[12px] text-[#8e97ab]">Analytic breakdown of where your money goes</p>
                    <div className="mt-3 space-y-3">
                        <DesktopInsight tone="amber" title={spendingPercent > 80 ? 'Shopping alert' : 'Budget setup'} text={spendingPercent > 80 ? `You've spent ${spendingPercent}% of your budget this month` : 'Add income, pick a plan, then track transactions.'} />
                        <DesktopInsight tone="green" title="Great job!" text={expenseCount > 0 ? `${expenseCount} transaction${expenseCount === 1 ? '' : 's'} tracked this month` : 'Your planner is ready for the next move.'} />
                    </div>
                </section>
            </aside>

            {desktopIncomeModalOpen && (
                <DesktopModal title="Add Income" onClose={() => setDesktopIncomeModalOpen(false)}>
                    <MobileIncomeStep onSaved={handleDesktopIncomeSaved} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} />
                </DesktopModal>
            )}

            {desktopTransactionModalOpen && (
                <DesktopModal title="Add Transaction" onClose={() => setDesktopTransactionModalOpen(false)}>
                    <MobileTransactionSheet
                        budgets={budgets}
                        defaultLane="Needs"
                        setup={mobileBudgetSetup}
                        onClose={() => setDesktopTransactionModalOpen(false)}
                        onSaved={handleTransactionSaved}
                    />
                </DesktopModal>
            )}
        </section>
    );
};

const DesktopFlowTabs = ({ activeTab, canContinue, onChangePlan, onSelect, setup }) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
        {setup?.label && (
            <button
                type="button"
                onClick={onChangePlan}
                className="rounded-full border border-[#eabb3a] bg-white px-3 py-2 text-[12px] font-semibold text-[#9b6c00] transition hover:bg-[#fff8e6]"
            >
                Change Plan
            </button>
        )}
        <div className="flex rounded-full bg-white p-1 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
            {[
                ['overview', 'Overview'],
                ['budgets', 'Budgets'],
                ['expenses', 'Transactions'],
                ['goals', 'Savings'],
            ].map(([id, label]) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    className={`rounded-full px-3 py-2 text-[12px] font-semibold transition-colors ${
                        activeTab === id ? 'bg-[#0c6060] text-white' : 'text-[#5e5f60] hover:bg-[#eef8f3]'
                    }`}
                >
                    {label}
                </button>
            ))}
            <span className={`ml-1 rounded-full px-3 py-2 text-[12px] font-semibold ${canContinue ? 'bg-[#e7f6f1] text-[#0c6060]' : 'bg-[#f1f1f1] text-[#a0a0a0]'}`}>Continue</span>
        </div>
    </div>
);

const DesktopEmptyCard = ({ action, disabledLabel = null, onAction, onSecondary, secondaryAction, text, title }) => (
    <div className="mx-auto flex w-full max-w-[21.5rem] flex-col items-center rounded-2xl bg-white p-6 text-center shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#dde1ea] bg-[#eff1f5] text-[36px]">📭</div>
        <h3 className="mt-6 text-[18px] font-bold text-[#141c2b]">{title}</h3>
        <p className="mt-2 text-[13px] leading-5 text-[#8e97ab]">{text}</p>
        <button type="button" onClick={onAction} className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#eabb3a] px-7 py-3 text-[14px] font-semibold text-[#eabb3a]">
            <Plus size={18} />
            {action}
        </button>
        {secondaryAction && (
            <button type="button" onClick={onSecondary} className="mt-3 text-[12px] font-semibold text-[#0c6060]">{secondaryAction}</button>
        )}
        {disabledLabel && <button type="button" disabled className="mt-12 w-full rounded-full bg-[#d7d7d7] px-6 py-4 text-[16px] font-bold text-white">{disabledLabel}</button>}
    </div>
);

const DesktopPlanGrid = ({ activePlanId, disabled, onSelect }) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mobileBudgetPlans.map((plan) => (
            <button
                key={plan.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(plan)}
                className={`min-h-[12rem] rounded-[18px] border bg-white p-4 text-left shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#eabb3a] disabled:cursor-not-allowed disabled:opacity-60 ${
                    activePlanId === plan.id ? 'border-[#0c6060] ring-2 ring-[#0c6060]/10' : 'border-[#eef0f3]'
                }`}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${plan.group === 'Recommended' ? 'bg-[#fff7e0] text-[#9b6c00]' : 'bg-[#eaf5ff] text-[#1265a8]'}`}>{plan.group}</span>
                    {activePlanId === plan.id && <span className="rounded-full bg-[#e7f6f1] px-2 py-1 text-[10px] font-bold text-[#0c6060]">Current</span>}
                </div>
                <h3 className="mt-4 text-[15px] font-extrabold text-[#232e3d]">{plan.label}</h3>
                <p className="mt-2 text-[12px] leading-5 text-[#707974]">{plan.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <span className="rounded-full bg-[#fff2e4] py-1 text-[#eb7e00]">{plan.split.needs}%</span>
                    <span className="rounded-full bg-[#e9f7ff] py-1 text-[#007eb6]">{plan.split.wants}%</span>
                    <span className="rounded-full bg-[#eaf8ef] py-1 text-[#0c6060]">{plan.split.savings}%</span>
                </div>
            </button>
        ))}
    </div>
);

const DesktopCurrentPlanNotice = ({ onCancel, setup }) => (
    <article className="mb-5 rounded-[18px] border border-[#eabb3a]/40 bg-[#fffaf0] px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-[13px] font-bold text-[#232e3d]">Current plan: {setup?.label || 'Budget plan'}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#8e6f1d]">
                    Changing your plan updates future guidance only. Existing budget items and transactions will stay unchanged.
                </p>
            </div>
            <button type="button" onClick={onCancel} className="rounded-full border border-[#e3d7b4] bg-white px-4 py-2 text-[12px] font-bold text-[#6b5a23]">
                Keep Current
            </button>
        </div>
    </article>
);

const DesktopBudgetSummary = ({ budgetRows, budgets, expenseCount, expenses, onAddTransaction, onChangePlan, onManageBudget, remaining, setup, spendingPercent, totalBudget, totalIncome, totalSpent }) => {
    const recent = expenses.slice(0, 4);
    return (
        <div className="space-y-5">
            {setup?.label && (
                <article className="rounded-[18px] border border-[#e3e3e5] bg-white px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8e97ab]">Selected budget model</p>
                            <p className="mt-1 text-[16px] font-extrabold text-[#0c6060]">{setup.label}</p>
                            <p className="mt-1 text-[12px] text-[#707974]">
                                Needs {setup.split?.needs || 0}% · Wants {setup.split?.wants || 0}% · Savings {setup.split?.savings || 0}%
                            </p>
                        </div>
                        <button type="button" onClick={onChangePlan} className="rounded-full border border-[#eabb3a] bg-white px-5 py-2.5 text-[13px] font-bold text-[#9b6c00] hover:bg-[#fff8e6]">
                            Change Plan
                        </button>
                    </div>
                </article>
            )}

            <div className="text-center">
                <p className="text-[13px] text-[#67677a]">Your remaining budget balance</p>
                <p className="mt-1 text-[36px] font-bold text-[#303048]">{formatCurrency(remaining)}</p>
                <div className="mx-auto mt-3 flex min-h-[34px] max-w-[311px] items-center justify-center rounded-full px-4 text-[12px] text-[#232e3d]" style={{ backgroundImage: 'linear-gradient(124deg, rgba(234,187,58,0.44) 0%, rgba(234,187,58,0) 92%)' }}>
                    😎 Congrats! your month is moving well
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <DesktopMetric label="Net Income" value={formatCurrency(totalIncome)} />
                <DesktopMetric label="Spent so far" value={formatCurrency(totalSpent)} />
                <DesktopMetric label="Budget allocated" value={formatCurrency(totalBudget)} />
            </div>

            <article className="rounded-[23px] border border-[#e3e3e5] bg-white px-5 py-5 shadow-[0_32px_51px_-13px_rgba(34,24,63,0.06)]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[14px] font-bold text-[#232e3d]">Spending Progress</p>
                        <p className="mt-1 text-[12px] text-[#8e97ab]">{expenseCount} transaction{expenseCount === 1 ? '' : 's'} tracked</p>
                    </div>
                    <span className="rounded-full bg-[#eabb3a] px-3 py-1 text-[12px] font-bold text-white">{spendingPercent}%</span>
                </div>
                <div className="mt-4 grid h-2 w-full grid-cols-[50fr_30fr_20fr] overflow-hidden rounded-full bg-[#e3e3e5]">
                    <span className="bg-[#f46040]" />
                    <span className="bg-[#56bada]" />
                    <span className="bg-[#6347eb]" />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {budgetRows.slice(0, 3).map((row) => (
                        <div key={row.label} className="rounded-2xl bg-[#f8f8f8] px-4 py-3">
                            <p className="text-[12px] text-[#707974]">{row.label}</p>
                            <p className="mt-1 text-[16px] font-bold text-[#303048]">{row.percent.toFixed(0)}%</p>
                        </div>
                    ))}
                </div>
            </article>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <article className="rounded-[18px] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-bold text-[#232e3d]">Recent Transactions</h3>
                        <button type="button" onClick={onAddTransaction} className="rounded-full bg-[#0c6060] px-4 py-2 text-[12px] font-bold text-white">Add Transaction</button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {recent.map((expense) => (
                            <div key={expense.uuid || expense.id || `${expense.amount}-${expense.created_at}`} className="flex items-center justify-between rounded-2xl bg-[#f8f8f8] px-4 py-3">
                                <div>
                                    <p className="text-[13px] font-bold text-[#232e3d]">{expense.category_name || expense.description || 'Transaction'}</p>
                                    <p className="text-[11px] text-[#8e97ab]">{expense.expense_date || expense.created_at || 'This month'}</p>
                                </div>
                                <p className="text-[13px] font-bold text-[#0c6060]">{formatCurrency(toNumber(expense.amount))}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[18px] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <h3 className="text-[15px] font-bold text-[#232e3d]">Next Best Actions</h3>
                    <div className="mt-4 space-y-3">
                        <DesktopAction title="Update budget items" text={`${budgets.length} budget item${budgets.length === 1 ? '' : 's'} active`} onClick={onManageBudget} />
                        <DesktopAction title="Keep expenses current" text="Log recent spending for sharper alerts" onClick={onAddTransaction} />
                    </div>
                </article>
            </div>
        </div>
    );
};

const DesktopModal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-[2px]">
        <section className="max-h-[88vh] w-full max-w-[24rem] overflow-y-auto rounded-[18px] bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.32)]">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-[#141c2b]">{title}</h3>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dde1ea] text-[#707974]" aria-label={`Close ${title}`}>
                    <X size={15} />
                </button>
            </div>
            {children}
        </section>
    </div>
);

const DesktopNavButton = ({ active = false, icon: Icon, label, onClick }) => (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-5 rounded-full px-1 py-3 text-left text-[14px] ${active ? 'font-bold text-[#0c6060]' : 'text-[#5e5f60] hover:text-[#0c6060]'}`}>
        <Icon size={22} />
        <span>{label}</span>
    </button>
);

const DesktopStepNote = ({ text, title }) => (
    <div className="mb-4 rounded-2xl border border-[#e3e3e5] bg-white px-5 py-4">
        <p className="text-[15px] font-bold text-[#232e3d]">{title}</p>
        <p className="mt-1 text-[12px] leading-5 text-[#8e97ab]">{text}</p>
    </div>
);

const DesktopError = ({ text }) => (
    <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-700">{text}</div>
);

const DesktopMetric = ({ label, value }) => (
    <article className="rounded-2xl bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
        <p className="text-[11px] font-semibold uppercase text-[#8e97ab]">{label}</p>
        <p className="mt-2 break-words text-[20px] font-extrabold text-[#0c6060]">{value}</p>
    </article>
);

const DesktopAction = ({ onClick, text, title }) => (
    <button type="button" onClick={onClick} className="w-full rounded-2xl bg-[#f8f8f8] px-4 py-3 text-left hover:bg-[#eef8f4]">
        <span className="block text-[13px] font-bold text-[#232e3d]">{title}</span>
        <span className="mt-1 block text-[11px] text-[#8e97ab]">{text}</span>
    </button>
);

const DesktopRailCard = ({ action, children, onAction, title }) => (
    <article className="mt-6 rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-[#232e3d]">{title}</h3>
            <button type="button" onClick={onAction} className="text-[12px] font-semibold text-[#0c6060]">{action}</button>
        </div>
        {children}
    </article>
);

const DesktopNotice = ({ children }) => (
    <div className="mt-4 rounded-full bg-[linear-gradient(122deg,_rgba(234,187,58,0.44)_0%,_rgba(234,187,58,0)_93%)] px-4 py-2 text-[12px] text-[#232e3d]">{children}</div>
);

const DesktopLegend = ({ color, label, value, valueClassName = 'text-[#0c6060]' }) => (
    <div className="flex items-center gap-2 text-[12px]">
        <span className={`h-[5px] w-[5px] shrink-0 rounded-full ${color}`} />
        <span className="min-w-0 flex-1 truncate text-[#232e3d]">{label}</span>
        <span className={`shrink-0 ${valueClassName}`}>{value}</span>
    </div>
);

const DesktopGauge = ({ amount, score }) => {
    const safeScore = Math.max(0, Math.min(100, Number(score || 0)));
    return (
        <div className="relative h-[6.6rem] w-[8.8rem] shrink-0">
            <svg viewBox="0 0 150 112" className="h-full w-full">
                <path d="M16 86 A58 58 0 0 1 134 86" fill="none" stroke="#edf1ff" strokeWidth="12" strokeLinecap="round" />
                <path d="M16 86 A58 58 0 0 1 134 86" fill="none" stroke="#eabb3a" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${safeScore * 1.82} 220`} />
            </svg>
            <div className="absolute inset-x-0 top-[3.1rem] text-center">
                <p className="text-[24px] font-bold leading-none text-[#232e3d]">{safeScore}%</p>
                <p className="mt-1 text-[12px] text-[#232e3d]">{amount}</p>
            </div>
        </div>
    );
};

const DesktopPie = ({ rows }) => {
    const colors = ['#0c6060', '#eabb3a', '#eb7e00', '#246bfd'];
    const normalized = rows.length ? rows.slice(0, 4) : [{ percent: 39 }, { percent: 28 }, { percent: 23 }, { percent: 10 }];
    const segments = normalized.reduce((accumulator, row, index) => {
        const start = accumulator.cursor;
        const end = start + Math.max(Number(row.percent || 0), 5);
        return { cursor: end, stops: [...accumulator.stops, `${colors[index % colors.length]} ${start}% ${end}%`] };
    }, { cursor: 0, stops: [] });

    return <div className="h-28 w-28 shrink-0 rounded-full p-5" style={{ background: `conic-gradient(${segments.stops.join(', ')}, #eef1f5 ${segments.cursor}% 100%)` }}><div className="h-full w-full rounded-full bg-white" /></div>;
};

const DesktopInsight = ({ text, title, tone }) => {
    const isGreen = tone === 'green';
    return (
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-4 ${isGreen ? 'bg-[#f0fdf4]' : 'bg-[#fff7ed]'}`}>
            <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isGreen ? 'bg-[#dcfce7] text-[#0d542b]' : 'bg-[#ffedd4] text-[#7e2a0c]'}`}>
                {isGreen ? <Check size={18} /> : <Receipt size={18} />}
            </span>
            <span className="min-w-0">
                <span className={`block text-[14px] font-semibold ${isGreen ? 'text-[#0d542b]' : 'text-[#7e2a0c]'}`}>{title}</span>
                <span className="mt-1 block text-[12px] leading-4 text-[#4a5565]">{text}</span>
            </span>
        </div>
    );
};

const buildDesktopBudgetRows = (budgets = [], totalIncome = 0) => {
    const colors = ['bg-[#0c6060]', 'bg-[#eabb3a]', 'bg-[#eb7e00]', 'bg-[#246bfd]'];
    const totalBudget = budgets.reduce((sum, item) => sum + toNumber(item?.amount), 0);
    if (budgets.length > 0 && totalBudget > 0) {
        return budgets.slice(0, 4).map((budget, index) => ({
            label: budget?.category_name || `Budget ${index + 1}`,
            percent: (toNumber(budget?.amount) / totalBudget) * 100,
            color: colors[index % colors.length],
        }));
    }

    const base = totalIncome > 0
        ? [{ label: 'Needs', percent: 50 }, { label: 'Wants', percent: 30 }, { label: 'Savings', percent: 20 }]
        : [{ label: 'Money Market', percent: 39 }, { label: 'Special Fund', percent: 28 }, { label: 'Treasury Bond', percent: 23 }, { label: 'Whole Life Policy', percent: 5 }];

    return base.map((row, index) => ({ ...row, color: colors[index % colors.length] }));
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
        <img
            src={budgetPlannerHero}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            aria-hidden="true"
        />
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

const MobileExpenseStage = ({ budgets = [], expenses = [], setup, onExpenseSaved, onAddBudgetItem, onComparePlans }) => {
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const hasBudgetLimits = budgets.length > 0;
    // Use the shared category classifier so mobile filters match desktop tracking rules.
    const filteredExpenses = useMemo(
        () => (
            activeFilter === 'All'
                ? expenses
                : expenses.filter((expense) => getExpenseLane(expense, budgets) === activeFilter)
        ),
        [activeFilter, budgets, expenses]
    );
    const visibleExpenses = filteredExpenses.slice(0, 3);
    const filteredBudgets = activeFilter === 'All'
        ? budgets
        : budgets.filter((budget) => deriveBudgetCategoryType(budget?.category_name) === activeFilter);
    const totalAllocated = filteredBudgets.reduce((sum, item) => sum + toNumber(item?.amount), 0);
    const totalSpent = filteredBudgets.reduce((sum, item) => sum + toNumber(item?.total_spent), 0);
    const remainingBudget = Math.max(totalAllocated - totalSpent, 0);
    const spendingPercent = totalAllocated > 0 ? Math.min(Math.round((totalSpent / totalAllocated) * 100), 100) : 0;
    const laneRows = mobileBudgetLaneOrder.map((lane) => {
        const laneBudgets = budgets.filter((budget) => deriveBudgetCategoryType(budget?.category_name) === lane);
        const laneExpenses = expenses.filter((expense) => getExpenseLane(expense, budgets) === lane);
        const laneLimit = laneBudgets.reduce((sum, item) => sum + toNumber(item?.amount), 0);
        const laneSpent = laneBudgets.reduce((sum, item) => sum + toNumber(item?.total_spent), 0);
        const ratio = laneLimit > 0 ? laneSpent / laneLimit : 0;
        const status = ratio > 1 ? 'Over Budget' : ratio >= 0.75 ? 'Watch' : 'OnTrack';
        return { lane, itemCount: laneExpenses.length, laneLimit, status };
    });
    const monthBuckets = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 6 }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
            const month = date.toLocaleString('en-US', { month: 'short' });
            const amount = expenses
                .filter((expense) => {
                    const expenseDate = new Date(expense?.expense_date || expense?.created_at || '');
                    return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, expense) => sum + toNumber(expense?.amount), 0);
            return { month, amount };
        });
    }, [expenses]);
    const maxMonthlySpend = Math.max(...monthBuckets.map((item) => item.amount), 1);
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

            {visibleExpenses.length === 0 ? (
                <>
                    <div className="mt-8 rounded-[20px] bg-white px-5 py-7 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                        <div className="mx-auto flex h-[80px] w-[80px] items-center justify-center rounded-full border border-[#dde1ea] bg-[#eff1f5] text-[36px]">
                            📭
                        </div>
                        <h2 className="mt-5 text-[18px] font-bold text-[#141c2b]">{emptyTitle}</h2>
                        <p className="mx-auto mt-2 max-w-[285px] text-[13px] leading-5 text-[#8e97ab]">
                            {activeFilter === 'All'
                                ? 'Add your transactions for your budget to see the magic and turn your allocated savings into action with simple next moves.'
                                : `You have not added any ${activeFilter.toLowerCase()} transactions yet.`}
                        </p>
                        <MobileExpenseActions
                            hasBudgetLimits={hasBudgetLimits}
                            onAddBudgetItem={onAddBudgetItem}
                            onAddTransaction={() => setShowExpenseModal(true)}
                        />
                    </div>

                    <div className="mt-5">
                        <p className="text-[16px] font-bold tracking-[-0.02em] text-[#232e3d]">Use Your Savings Limit Wisely</p>
                        <p className="mt-1 text-[12px] leading-4 text-[#8e97ab]">
                            Choose a budget type and add income so we can suggest how to put your savings allocation to work.
                        </p>
                        <div className="mt-3 space-y-3">
                            <MobileSavingsSuggestion tone="amber" title="Emergency Buffer in MMF" body="Keep 3-6 months of essentials liquid in a money market fund for fast access and steadier returns than a normal account." />
                            <MobileSavingsSuggestion tone="green" title="Short-Term Goals" body="Use MMFs or a high-yield savings lane for goals coming up in under 12 months." />
                            <MobileSavingsSuggestion tone="purple" title="Treasury Bills" body="Put part of your savings into T-Bills when you want low-risk parking for planned cash." />
                            <MobileSavingsSuggestion tone="rose" title="Long-Term Wealth" body="Channel the final slice into retirement, long-term investments, or disciplined debt reduction." />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-4 space-y-4">
                        <section className="px-2 py-4 text-center">
                            <p className="text-[12px] leading-5 text-[#67677a]">
                                {activeFilter === 'All' ? 'Your remaining budget balance' : `${activeFilter} remaining budget balance`}
                            </p>
                            <p className="mt-1 text-[36px] font-bold leading-tight text-[#303048]">
                                {formatCurrency(remainingBudget)}
                            </p>
                            <div className="mx-auto mt-3 flex min-h-[34px] max-w-[311px] items-center rounded-full px-4 text-left text-[12px] text-[#232e3d]" style={{ backgroundImage: 'linear-gradient(124deg, rgba(234,187,58,0.44) 0%, rgba(234,187,58,0) 92%)' }}>
                                😎 Congrats! your month is moving well
                            </div>
                        </section>

                        <section className="rounded-[23px] border border-[#e3e3e5] bg-white px-4 py-[18px] shadow-[0_32px_51px_-13px_rgba(34,24,63,0.06)]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] text-[#67677a]">Spent so far</p>
                                    <p className="mt-0.5 text-[16px] font-bold text-[#303048]">{formatCurrency(totalSpent)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-[#67677a]">Budget Allocated</p>
                                    <p className="mt-0.5 text-[16px] font-bold text-[#303048]">{formatCurrency(totalAllocated)}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <p className="text-[10px] text-[#8e97ab]">Spending Progress</p>
                                <span className="rounded-full bg-[#eabb3a] px-2 text-[10px] text-[#eff1f5]">{spendingPercent}%</span>
                            </div>
                            <div className="mt-2 grid h-1 w-full grid-cols-[50fr_30fr_20fr] overflow-hidden rounded-full bg-[#e3e3e5]">
                                <span className="bg-[#f46040]" />
                                <span className="bg-[#56bada]" />
                                <span className="bg-[#6347eb]" />
                            </div>
                            <div className="mt-2 flex gap-4 text-[10px] font-medium">
                                <span className="text-[#f46040]">• Needs</span>
                                <span className="text-[#56bada]">• Wants</span>
                                <span className="text-[#6347eb]">• Savings</span>
                            </div>
                        </section>

                        <section className="rounded-[23px] border border-[#e3e3e5] bg-white px-[26px] py-4 shadow-[0_32px_51px_-13px_rgba(0,0,0,0.06)]">
                            {laneRows.map((row) => (
                                <MobileBudgetLaneRow key={row.lane} row={row} />
                            ))}
                        </section>

                        <section className="rounded-[16px] border border-[#e3e3e5] bg-white py-4 shadow-[0_32px_26px_rgba(0,0,0,0.05)]">
                            <div className="grid grid-cols-4 gap-2 px-5">
                                {['3M', '6M', '1Y', 'All'].map((range) => (
                                    <span key={range} className={`rounded-[12px] border px-2 py-2 text-center text-[12px] ${range === '6M' ? 'border-[#0c6060] bg-[#0c6060] text-white' : 'border-[#dde1ea] text-[#8e97ab]'}`}>
                                        {range}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 px-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[13px] font-semibold text-[#141c2b]">March spending</p>
                                        <p className="text-[24px] font-bold text-[#0c6060]">{formatCurrency(monthBuckets[5]?.amount || totalSpent)}</p>
                                    </div>
                                    <span className="rounded-[6px] border border-[#ecedf0] bg-[#fafafa] px-3 py-2 text-[10px] font-semibold text-[#555e67]">
                                        This month
                                    </span>
                                </div>
                                <div className="mt-4 flex h-[88px] items-end justify-center gap-2">
                                    {monthBuckets.map((bucket, index) => (
                                        <div key={bucket.month} className="flex flex-1 flex-col items-center gap-2">
                                            <span
                                                className={`w-full rounded-t-[4px] ${index === monthBuckets.length - 1 ? 'bg-[#eabb3a]' : 'bg-[rgba(234,187,58,0.28)]'}`}
                                                style={{ height: `${Math.max((bucket.amount / maxMonthlySpend) * 88, 18)}px` }}
                                            />
                                            <span className="text-[10px] text-[#8e97ab]">{bucket.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-5">
                        <p className="text-[16px] font-bold tracking-[-0.02em] text-[#232e3d]">Next Best Actions</p>
                        <p className="mt-1 text-[12px] leading-4 text-[#8e97ab]">The most useful next steps from this budget.</p>
                        <div className="mt-3 space-y-3">
                            <MobileActionCard tone="amber" title="Update budget items" body="Adjust your budget items if your real spending pattern has changed this month." cta="Manage Items" onClick={onAddBudgetItem} />
                            <MobileActionCard tone="green" title="Keep expenses current" body="Log recent spending so the budget health stays accurate and your dashboard stays useful." cta="Add Expenses" onClick={() => setShowExpenseModal(true)} />
                            <MobileActionCard tone="purple" title="Compare budget models" body="See how switching to another split would change your monthly allocations." cta="Compare Types" onClick={onComparePlans} />
                        </div>
                    </div>
                </>
            )}

            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-3 pb-3 pt-16 sm:hidden">
                    <MobileTransactionSheet
                        budgets={budgets}
                        defaultLane={activeFilter === 'All' ? 'Needs' : activeFilter}
                        setup={setup}
                        onClose={() => setShowExpenseModal(false)}
                        onSaved={handleSaved}
                    />
                </div>
            )}
        </section>
    );
};

const MobileExpenseActions = ({ hasBudgetLimits, onAddBudgetItem, onAddTransaction }) => (
    <div className="mt-6 space-y-3">
        <button
            type="button"
            onClick={onAddTransaction}
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
);

const MobileBudgetLaneRow = ({ row }) => {
    const styles = {
        Needs: { dot: 'bg-[#f46040]', badge: row.status === 'Over Budget' ? 'bg-[#fde0e0] text-[#ef4444]' : 'bg-[#ffd19c] text-[#eb7e00]' },
        Wants: { dot: 'bg-[#00a63e]', badge: 'bg-[#dbfce7] text-[#00a63e]' },
        Savings: { dot: 'bg-[#eb7e00]', badge: 'bg-[#ffd19c] text-[#eb7e00]' },
    }[row.lane];

    return (
        <div className="flex items-start gap-3 py-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${styles.dot}`}>
                <Home size={15} />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between">
                <div className="min-w-0">
                    <p className="text-[14px] text-[#67677a]">{row.lane}</p>
                    <p className="text-[12px] font-medium text-[#39444d]">{row.itemCount} Item{row.itemCount === 1 ? '' : 's'}</p>
                </div>
                <div className="text-right">
                    <p className="text-[14px] font-bold text-[#303048]">Limit: {formatCurrency(row.laneLimit)}</p>
                    <span className={`mt-1 inline-flex rounded-[10px] px-2 py-[3px] text-[9px] ${styles.badge}`}>
                        {row.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

const MobileActionCard = ({ tone, title, body, cta, onClick }) => {
    const toneClasses = {
        amber: { shell: 'bg-[#fff7ed]', icon: 'bg-[#ffedd4] text-[#f54900]', text: 'text-[#7e2a0c]', button: 'border-[#f65e1b] text-[#f54900]' },
        green: { shell: 'bg-[#f0fdf4]', icon: 'bg-[#dcfce7] text-[#00a63e]', text: 'text-[#00a63e]', button: 'border-[#00a63e] text-[#00a63e]' },
        purple: { shell: 'bg-[#f3f0fd]', icon: 'bg-[#e7dfff] text-[#4b1d8f]', text: 'text-[#4b1d8f]', button: 'border-[#4b1d8f] text-[#4b1d8f]' },
    }[tone];

    return (
        <article className={`flex gap-[26px] rounded-[10px] p-4 ${toneClasses.shell}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses.icon}`}>
                <Plus size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className={`text-[14px] font-semibold leading-5 tracking-[-0.01em] ${toneClasses.text}`}>{title}</h3>
                <p className="mt-2 text-[12px] leading-4 text-[#4a5565]">{body}</p>
                <button
                    type="button"
                    onClick={onClick}
                    className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] ${toneClasses.button}`}
                >
                    <Check size={10} />
                    {cta}
                </button>
            </div>
        </article>
    );
};

const MobileTransactionSheet = ({ budgets = [], defaultLane = 'Needs', setup, onClose, onSaved }) => {
    const [selectedLane, setSelectedLane] = useState(defaultLane);
    const [status, setStatus] = useState('Received');
    const [budgetCategories, setBudgetCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        expense_date: todayDate(),
        period: 'Monthly',
        alert_threshold: 80,
        is_recurring: true,
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const categoryOptions = useMemo(
        () => {
            const categoriesByName = new Map(
                budgetCategories.map((category) => [normalizeLabel(category.name), category])
            );

            return budgets
                .filter((budget) => deriveBudgetCategoryType(budget?.category_name) === selectedLane)
                .map((budget) => {
                    const matchedCategory = categoriesByName.get(normalizeLabel(budget?.category_name));
                    return {
                        value: matchedCategory?.value || getBudgetCategoryIdentifier(budget),
                        name: matchedCategory?.name || budget?.category_name || selectedLane,
                        remaining: Math.max(toNumber(budget?.amount) - toNumber(budget?.total_spent), 0),
                    };
                })
                .filter((item) => item.name && item.value);
        },
        [budgetCategories, budgets, selectedLane]
    );
    const selectedCategory = categoryOptions.find((item) => String(item.value) === String(formData.category));

    useEffect(() => {
        setSelectedLane(defaultLane);
        setFormData((current) => ({ ...current, category: '' }));
    }, [defaultLane]);

    useEffect(() => {
        let cancelled = false;

        const loadBudgetCategories = async () => {
            try {
                setCategoriesLoading(true);
                const rows = await getBudgetCategories();
                if (!cancelled) {
                    setBudgetCategories((Array.isArray(rows) ? rows : []).map(normalizeCategoryOption));
                }
            } catch (err) {
                if (!cancelled) setError(err.message || 'We could not load budget categories right now.');
            } finally {
                if (!cancelled) setCategoriesLoading(false);
            }
        };

        loadBudgetCategories();
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
            setError(`Choose a ${selectedLane.toLowerCase()} item before adding a transaction.`);
            return;
        }
        if (!formData.amount || Number(formData.amount) <= 0) {
            setError('Enter a valid transaction amount greater than zero.');
            return;
        }

        const expenseAmount = Number(formData.amount || 0);
        if (selectedCategory && expenseAmount > selectedCategory.remaining) {
            setError(`This transaction exceeds the remaining ${selectedLane.toLowerCase()} limit for ${selectedCategory.name}. Remaining available is ${formatCurrency(selectedCategory.remaining)}.`);
            return;
        }

        try {
            setSubmitting(true);
            // The sheet keeps the Figma status controls for planning context, while
            // the actual save uses the existing expense endpoint and budget category id.
            await createExpense({
                category: formData.category,
                amount: formData.amount,
                description: selectedCategory?.name || `${selectedLane} transaction`,
                expense_date: formData.expense_date,
                payment_method: 'CASH',
                currency: 'KES',
                notes: `${status}; ${formData.period}; ${formData.is_recurring ? 'recurring' : 'one-off'}`,
            });
            markDashboardDataExists();
            await onSaved();
        } catch (err) {
            const errorMessage = err.response?.data?.errors || err.response?.data || err.message;
            setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-h-[86vh] w-full overflow-y-auto rounded-t-[24px] bg-white pt-3 shadow-[0_-8px_20px_rgba(10,16,24,0.2)]">
            <div className="mx-auto h-1 w-[38px] rounded-full bg-[#dde1ea]" />
            <div className="relative px-5 pb-2 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-[18px] top-[14px] flex h-7 w-7 items-center justify-center rounded-[14px] border border-[#dde1ea] bg-[#eff1f5] text-[#5e6a80]"
                    aria-label="Close add transaction"
                >
                    <X size={14} />
                </button>
                <p className="text-[11px] text-[#8e97ab]">{setup?.label || 'Budget plan'}</p>
                <h3 className="mt-1 text-[18px] font-bold text-[#0a1018]">Add Item</h3>
            </div>

            {error && (
                <div className="mx-5 mb-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-7">
                <p className="text-[12px] leading-none text-[#707070]">Start by choosing where do you want your money to be</p>
                <div className="grid grid-cols-3 gap-2">
                    {['Received', 'Expected', 'Cancelled'].map((option) => {
                        const active = status === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setStatus(option)}
                                className={`flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-white px-2 text-[12px] shadow-[0_0_1px_rgba(0,0,0,0.25)] ${active ? 'text-[#eabb3a]' : 'text-[#717182]'}`}
                            >
                                <span className={`h-5 w-5 rounded-[10px] border-2 ${active ? 'border-[#eabb3a] bg-[#eabb3a]/20' : 'border-[#8e8e93]'}`} />
                                {option}
                            </button>
                        );
                    })}
                </div>

                <div>
                    <MobileFieldLabel label={`${selectedLane} Item`} />
                    <select
                        value={formData.category}
                        onChange={(event) => updateField('category', event.target.value)}
                        disabled={categoriesLoading}
                        className="mt-2 h-[42px] w-full rounded-[12px] border border-[#dde1ea] bg-[#f7f8fa] px-[14px] text-[14px] font-medium text-[#757575] outline-none focus:border-[#0c6060]"
                    >
                        <option value="">
                            {categoriesLoading ? 'Loading items...' : categoryOptions.length ? `Eg. ${categoryOptions[0].name}` : `No ${selectedLane.toLowerCase()} items`}
                        </option>
                        {categoryOptions.map((item) => (
                            <option key={item.value} value={item.value}>{item.name}</option>
                        ))}
                    </select>
                    {selectedCategory && (
                        <p className="mt-1 text-[11px] font-semibold text-[#0c6060]">
                            Remaining: {formatCurrency(selectedCategory.remaining)}
                        </p>
                    )}
                </div>

                <div>
                    <MobileFieldLabel label="Amount" />
                    <NumericInput
                        value={formData.amount}
                        onChange={(event) => updateField('amount', event.target.value)}
                        placeholder="Eg. KES 30,000"
                        className="mt-2 h-[42px] w-full rounded-[12px] border border-[#dde1ea] bg-[#f7f8fa] px-[14px] text-[14px] font-medium text-[#757575] outline-none focus:border-[#0c6060]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <MobileFieldLabel label="Period" />
                        <select
                            value={formData.period}
                            onChange={(event) => updateField('period', event.target.value)}
                            className="mt-2 h-[42px] w-full rounded-[12px] border border-[#dde1ea] bg-[#f7f8fa] px-[14px] text-[14px] font-medium text-[#757575] outline-none focus:border-[#0c6060]"
                        >
                            <option>Monthly</option>
                            <option>Weekly</option>
                            <option>One-off</option>
                        </select>
                    </div>
                    <div>
                        <MobileFieldLabel label="Date" />
                        <input
                            type="date"
                            value={formData.expense_date}
                            onChange={(event) => updateField('expense_date', event.target.value)}
                            className="mt-2 h-[42px] w-full rounded-[12px] border border-[#dde1ea] bg-[#f7f8fa] px-[14px] text-[14px] font-medium text-[#757575] outline-none focus:border-[#0c6060]"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <MobileFieldLabel label="Alert Threshold" />
                        <span className="rounded-full bg-[#eabb3a] px-2 text-[10px] text-[#eff1f5]">{formData.alert_threshold}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.alert_threshold}
                        onChange={(event) => updateField('alert_threshold', event.target.value)}
                        className="mt-3 h-2 w-full accent-[#eabb3a]"
                    />
                </div>

                <label className="flex items-center gap-2 py-2 text-[14px] font-semibold tracking-[0.2px] text-[#6b7280]">
                    <input
                        type="checkbox"
                        checked={formData.is_recurring}
                        onChange={(event) => updateField('is_recurring', event.target.checked)}
                        className="h-5 w-5 accent-[#0c6060]"
                    />
                    Is this a recurring transaction?
                </label>

                <button
                    type="submit"
                    disabled={submitting || categoriesLoading || categoryOptions.length === 0}
                    className="flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#0c6060] p-4 text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#c7cdd4]"
                >
                    <Plus size={20} />
                    {submitting ? 'Adding...' : 'Add Transaction'}
                </button>
            </form>
        </div>
    );
};

const MobileSavingsSuggestion = ({ tone, title, body }) => {
    const toneClasses = {
        amber: 'bg-[#fff4e8] text-[#e28a17]',
        green: 'bg-[#eaf8ef] text-[#26a96c]',
        purple: 'bg-[#f3ecff] text-[#7c4dff]',
        rose: 'bg-[#fdf0f0] text-[#d45757]',
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
                {mobileBudgetLaneOrder.map((lane) => {
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

