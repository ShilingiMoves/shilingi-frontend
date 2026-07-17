import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    Bell,
    BookOpen,
    Briefcase,
    Calculator,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Coins,
    FileText,
    Flame,
    Home,
    Heart,
    Landmark,
    Lightbulb,
    LogOut,
    MoreHorizontal,
    PiggyBank,
    Search,
    Shield,
    Target,
    TrendingUp,
    Trophy,
    Wallet,
} from 'lucide-react';
import animatedLogo from '../../../assets/shilingi-logo-animated.gif';
import incomeService from '../../../services/incomeService';
import { getBudgetSummary, getBudgets, getExpenses, getGoals } from '../../../services/budgetApi';
import { getAssets as getInvestmentAssets } from '../../../services/investmentTrackerApi';
import { getDebts } from '../../../services/debtApi';
import { getNetWorthSummary } from '../../../services/networthApi';
import { getHealthScore, getHealthScoreBreakdown } from '../../../services/financialHealthApi';
import { DASHBOARD_DATA_KEY, markDashboardDataExists } from '../../../utils/dashboardDataState';
import { USER_PROFILE_WORKSPACE_KEY } from '../user/UserGoalsFamilyForm';
import {
    getDashboardDisplayName,
    PREFERRED_NAME_KEY,
    PREFERRED_NAME_UPDATED_EVENT,
} from '../../../utils/memberIdentity';
import { buildDerivedFinancialHealth } from '../../../utils/financialIntelligence';
import { useAdaptivePolling } from '../../../hooks/useAdaptivePolling';

const toneMap = {
    morning: { label: 'Good morning', shell: 'from-[#14986b] via-[#117f5a] to-[#0a4d37]' },
    afternoon: { label: 'Good afternoon', shell: 'from-[#14986b] via-[#118561] to-[#0d6648]' },
    evening: { label: 'Good evening', shell: 'from-[#0a4d37] via-[#117f5a] to-[#14986b]' },
};
const calendarTypeStyles = {
    all: { shell: 'bg-[#0f3f39] text-white border-[#0f3f39]' },
    income: {
        filterShell: 'bg-white text-emerald-700 border-emerald-300',
        cellTone: 'bg-emerald-100 text-emerald-700',
        listTone: 'bg-emerald-50 text-emerald-700',
        label: 'Income',
    },
    debt: {
        filterShell: 'bg-white text-rose-600 border-rose-300',
        cellTone: 'bg-rose-100 text-rose-600',
        listTone: 'bg-rose-50 text-rose-600',
        label: 'Loan Payments',
    },
    goal: {
        filterShell: 'bg-white text-[#b56900] border-[#f4bd63]',
        cellTone: 'bg-amber-100 text-amber-700',
        listTone: 'bg-amber-50 text-amber-700',
        label: 'Goals',
    },
    savings: {
        filterShell: 'bg-white text-blue-600 border-blue-300',
        cellTone: 'bg-blue-100 text-blue-700',
        listTone: 'bg-blue-50 text-blue-700',
        label: 'Savings',
    },
    investment: {
        filterShell: 'bg-white text-violet-600 border-violet-300',
        cellTone: 'bg-violet-100 text-violet-600',
        listTone: 'bg-violet-50 text-violet-600',
        label: 'Investments',
    },
    protection: {
        filterShell: 'bg-white text-[#175f54] border-emerald-300',
        cellTone: 'bg-emerald-100 text-[#175f54]',
        listTone: 'bg-emerald-50 text-[#175f54]',
        label: 'Premiums',
    },
};
const FINANCIAL_CALENDAR_EVENTS_KEY = 'shilingi_financial_calendar_events';
const DASHBOARD_STREAK_KEY_PREFIX = 'shilingi_dashboard_streak';
const COMPARED_PRODUCTS_COUNT = 70;
const OVERVIEW_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const OVERVIEW_MAX_REFRESH_INTERVAL_MS = 20 * 60 * 1000;
const overviewCompareModules = [
    {
        id: 'loans',
        segments: [
            {
                rows: [
                    ['Equity Bank', 'Salary Advance', 'Up to 3M', '14.0 - 16.0%'],
                    ['NCBA Bank', 'Loop Personal', 'Up to 4M', '14.5 - 16.5%'],
                    ['Stanbic Bank', 'Commercial Bank', '100K - 7M', '11.8 - 13.5%'],
                    ['Standard Chartered', 'Commercial Bank', '50K - 5M', '12.7 - 14.0%'],
                    ['KCB Bank', 'Commercial Bank', 'Up to 5M', '13.8 - 15.5%'],
                    ['Stima DT SACCO', 'Development Loan', 'Up to 10M+', '10.5 - 12.5%'],
                    ['Mwalimu National', 'Wezesha / Normal', 'Up to 5M', '11.5 - 13.5%'],
                ],
            },
        ],
    },
    {
        id: 'savings',
        segments: [
            {
                id: 'mmf',
                rows: [
                    ['Nabo Africa MMF', '~12.9%'],
                    ['Gulfcap MMF', '10.8 - 11.4%'],
                    ['Etica MMF', '10.9 - 11.3%'],
                    ['Lofty-Corban MMF', '10.5 - 11.1%'],
                ],
            },
        ],
    },
    {
        id: 'banking',
        segments: [
            {
                id: 'saccos',
                rows: [
                    ['Stima DT SACCO', 'Ordinary / Alpha Savings', 'KES 0', 'Up to 10-12%'],
                    ['Mwalimu National', 'Teachers Savings', 'Low (0-100)', '10-13%'],
                ],
            },
        ],
    },
];
const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmtKES = (v) => `KES ${Math.round(toNum(v)).toLocaleString('en-KE')}`;
const fmtSigned = (v) => `${toNum(v) >= 0 ? '+' : '-'}KES ${Math.round(Math.abs(toNum(v))).toLocaleString('en-KE')}`;
const getMoment = (d) => (d.getHours() < 12 ? 'morning' : d.getHours() < 17 ? 'afternoon' : 'evening');
const findHealthComponentScore = (components, keywords, fallback = 0) => {
    const list = Array.isArray(components) ? components : [];
    const match = list.find((component) => {
        const name = String(component?.name || component?.title || component?.label || '').toLowerCase();
        return keywords.some((keyword) => name.includes(keyword));
    });
    const score = Number(match?.score ?? match?.value ?? fallback);
    return Number.isFinite(score) ? score : fallback;
};
const getDate = (i) => i?.date || i?.created_at || i?.updated_at || '';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatStreakDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const getStreakStorageKey = (user = {}) => {
    const identifier = user?.uuid || user?.id || user?.email || user?.profile?.user_id || 'guest';
    return `${DASHBOARD_STREAK_KEY_PREFIX}_${identifier}`;
};
const readDashboardStreak = (user = {}) => {
    if (typeof window === 'undefined') return { count: 0, lastActiveDate: '' };
    try {
        const parsed = JSON.parse(window.localStorage.getItem(getStreakStorageKey(user)) || '{}');
        return {
            count: clamp(Number(parsed.count || 0), 0, 3650),
            lastActiveDate: parsed.lastActiveDate || '',
        };
    } catch {
        return { count: 0, lastActiveDate: '' };
    }
};
const updateDashboardStreak = (user = {}, referenceDate = new Date()) => {
    if (typeof window === 'undefined') return { count: 0, lastActiveDate: '' };
    const today = formatStreakDate(referenceDate);
    const previous = readDashboardStreak(user);
    if (previous.lastActiveDate === today) return previous;

    const yesterday = new Date(referenceDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const next = {
        count: previous.lastActiveDate === formatStreakDate(yesterday) ? previous.count + 1 : 1,
        lastActiveDate: today,
    };

    try {
        window.localStorage.setItem(getStreakStorageKey(user), JSON.stringify(next));
    } catch (error) {
        console.warn('Could not persist dashboard streak:', error);
    }
    return next;
};
const parseDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
const startOfDay = (value) => {
    const date = parseDateValue(value);
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
const diffDaysFromToday = (value, reference = new Date()) => {
    const date = startOfDay(value);
    if (!date) return Number.POSITIVE_INFINITY;
    const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
    return Math.round((date.getTime() - today.getTime()) / 86400000);
};
const isSameMonth = (value, reference = new Date()) => {
    const date = parseDateValue(value);
    return Boolean(date) && date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
};
const formatMonthLabel = (date) => date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const formatShortMonthDay = (date) => date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
const getGoalProgress = (goal) => {
    const targetAmount = toNum(goal?.target_amount || goal?.target || goal?.goal_amount);
    const currentAmount = toNum(goal?.current_amount || goal?.saved_amount || goal?.total_saved || goal?.amount_saved);
    if (targetAmount > 0) {
        return clamp(Math.round((currentAmount / targetAmount) * 100), 0, 100);
    }
    return clamp(Math.round(toNum(goal?.progress_percentage || goal?.progress || goal?.completion)), 0, 100);
};
const buildInsightCard = ({ title, description, badge, icon, iconShell, badgeShell }) => ({
    title,
    description,
    badge,
    icon,
    iconShell,
    badgeShell,
});
const buildAiInsightCards = ({ budgets, goals, debts, investments, income, savings, score }) => {
    const cards = [];
    const overspentBudget = (budgets || [])
        .map((budget) => {
            const target = toNum(budget?.budgeted_amount || budget?.allocated_amount || budget?.amount || budget?.target_amount);
            const spent = toNum(budget?.spent_amount || budget?.actual_spent || budget?.total_spent || budget?.spent);
            return {
                label: budget?.category_name || budget?.name || 'Budget',
                target,
                spent,
                overspend: spent - target,
                overspendPct: target > 0 ? Math.round((spent / target) * 100) : 0,
            };
        })
        .filter((budget) => budget.target > 0 && budget.spent > budget.target)
        .sort((a, b) => b.overspend - a.overspend)[0];

    if (overspentBudget) {
        cards.push(buildInsightCard({
            title: `${overspentBudget.label} is over budget`,
            description: `${fmtKES(overspentBudget.overspend)} above target this month. A small trim gets you back on track fast.`,
            badge: 'Action Needed',
            icon: AlertTriangle,
            iconShell: 'bg-amber-100 text-amber-700',
            badgeShell: 'bg-rose-100 text-rose-600',
        }));
    }

    const dueDebt = (debts || [])
        .map((debt) => ({ ...debt, daysAway: diffDaysFromToday(debt?.dueDate) }))
        .filter((debt) => Number.isFinite(debt.daysAway) && debt.daysAway >= 0 && debt.daysAway <= 10 && toNum(debt.balance) > 0)
        .sort((a, b) => a.daysAway - b.daysAway)[0];

    if (dueDebt) {
        cards.push(buildInsightCard({
            title: `${dueDebt.name} payment is due soon`,
            description: `Minimum payment of ${fmtKES(dueDebt.minimumPayment || dueDebt.balance)} is due in ${dueDebt.daysAway === 0 ? 'today' : `${dueDebt.daysAway} day${dueDebt.daysAway === 1 ? '' : 's'}`}.`,
            badge: 'Due Soon',
            icon: Flame,
            iconShell: 'bg-rose-100 text-rose-600',
            badgeShell: 'bg-rose-100 text-rose-600',
        }));
    }

    const nearGoal = (goals || [])
        .map((goal) => ({
            ...goal,
            progress: getGoalProgress(goal),
            targetAmount: toNum(goal?.target_amount || goal?.target || goal?.goal_amount),
            currentAmount: toNum(goal?.current_amount || goal?.saved_amount || goal?.total_saved || goal?.amount_saved),
        }))
        .filter((goal) => goal.progress >= 70 && goal.progress < 100)
        .sort((a, b) => b.progress - a.progress)[0];

    if (nearGoal) {
        cards.push(buildInsightCard({
            title: `${nearGoal.name || nearGoal.title || 'Your goal'} is nearly complete`,
            description: `${nearGoal.progress}% funded. You are ${fmtKES(Math.max(nearGoal.targetAmount - nearGoal.currentAmount, 0))} away from the finish line.`,
            badge: 'Milestone',
            icon: Trophy,
            iconShell: 'bg-[#f9e7b0] text-[#9a6800]',
            badgeShell: 'bg-[#fff0ba] text-[#9a6800]',
        }));
    }

    const positiveInvestment = (investments || [])
        .filter((asset) => toNum(asset?.gainLossPercentage) > 0)
        .sort((a, b) => toNum(b?.gainLossPercentage) - toNum(a?.gainLossPercentage))[0];

    if (positiveInvestment) {
        cards.push(buildInsightCard({
            title: `${positiveInvestment.name} is performing well`,
            description: `Up ${Math.round(toNum(positiveInvestment.gainLossPercentage) * 10) / 10}% so far. Review whether you want to keep adding consistently.`,
            badge: 'Opportunity',
            icon: Lightbulb,
            iconShell: 'bg-[#fff1c2] text-[#946200]',
            badgeShell: 'bg-emerald-100 text-emerald-700',
        }));
    }

    if (cards.length < 3 && income > 0) {
        const savingsRate = Math.round((toNum(savings) / Math.max(toNum(income), 1)) * 100);
        cards.push(buildInsightCard({
            title: savingsRate >= 20 ? 'Your savings rate is looking strong' : 'There is room to improve your savings rate',
            description: `You are currently saving about ${clamp(savingsRate, 0, 999)}% of tracked income this cycle.`,
            badge: savingsRate >= 20 ? 'Healthy' : 'Watchlist',
            icon: savingsRate >= 20 ? Trophy : Heart,
            iconShell: savingsRate >= 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700',
            badgeShell: savingsRate >= 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700',
        }));
    }

    if (cards.length < 3 && score > 0) {
        cards.push(buildInsightCard({
            title: `Your financial health score is ${score}/100`,
            description: score >= 70 ? 'You are in a strong position. Keep your habits consistent to hold the momentum.' : 'Focus on budgets, debt, and savings this month to raise your score.',
            badge: score >= 70 ? 'On Track' : 'Improve',
            icon: score >= 70 ? Trophy : AlertTriangle,
            iconShell: score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            badgeShell: score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600',
        }));
    }

    return cards.slice(0, 3);
};
const buildCalendarEvents = ({ referenceDate, incomes, debts, goals, investments }) => {
    const events = [];
    const pushEvent = (event) => {
        const date = parseDateValue(event.date);
        if (!date || !isSameMonth(date, referenceDate)) return;
        const style = calendarTypeStyles[event.type] || calendarTypeStyles.goal;
        events.push({
            ...event,
            date,
            day: date.getDate(),
            label: style.label,
            cellTone: style.cellTone,
            listTone: style.listTone,
            filterShell: style.filterShell,
        });
    };

    (debts || []).forEach((debt) => {
        if (!debt?.dueDate) return;
        pushEvent({
            type: 'debt',
            date: debt.dueDate,
            name: `${debt.name || debt.creditor || 'Debt'} payment`,
            priority: 1,
        });
    });

    (goals || []).forEach((goal) => {
        const targetDate = goal?.target_date || goal?.targetDate;
        if (!targetDate) return;
        pushEvent({
            type: 'goal',
            date: targetDate,
            name: `${goal.name || goal.title || 'Goal'} target`,
            priority: 2,
        });
    });

    (incomes || []).forEach((income) => {
        const incomeDate = income?.income_date || income?.date || income?.created_at;
        const recurringDate = parseDateValue(incomeDate);
        const isRecurring = Boolean(income?.is_recurring) || !['', 'ONE_TIME', undefined, null].includes(income?.frequency);
        if (isRecurring && recurringDate) {
            const projectedDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), Math.min(recurringDate.getDate(), 28));
            pushEvent({
                type: 'income',
                date: projectedDate,
                name: `${income?.description || income?.source || income?.name || 'Income'} expected`,
                priority: 3,
            });
            return;
        }
        if (incomeDate) {
            pushEvent({
                type: 'income',
                date: incomeDate,
                name: `${income?.description || income?.source || income?.name || 'Income'} received`,
                priority: 4,
            });
        }
    });

    (investments || []).forEach((asset) => {
        const reviewDate = asset?.lastValuedDate || asset?.updated_at || asset?.purchaseDate;
        if (!reviewDate) return;
        pushEvent({
            type: 'investment',
            date: reviewDate,
            name: `${asset.name || 'Investment'} review`,
            priority: 5,
        });
    });

    return events
        .sort((a, b) => a.date.getTime() - b.date.getTime() || a.priority - b.priority)
        .filter((event, index, list) => index === list.findIndex((item) => item.type === event.type && item.name === event.name && item.day === event.day));
};
const buildCalendarFilters = (events) => {
    const uniqueTypes = Array.from(new Set((events || []).map((event) => event.type)));
    return [{ key: 'all', label: 'All', shell: calendarTypeStyles.all.shell }, ...uniqueTypes.map((type) => ({
        key: type,
        label: calendarTypeStyles[type]?.label || type,
        shell: calendarTypeStyles[type]?.filterShell || calendarTypeStyles.goal.filterShell,
    }))];
};
const buildCalendarGrid = (referenceDate, events) => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingWeekday = firstDay.getDay();
    const eventsByDay = (events || []).reduce((acc, event) => {
        if (!acc[event.day]) acc[event.day] = [];
        acc[event.day].push(event);
        return acc;
    }, {});

    const cells = [];
    for (let i = 0; i < startingWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push({ day, events: eventsByDay[day] || [] });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) {
        weeks.push(cells.slice(index, index + 7));
    }
    return weeks;
};
const formatCompactSigned = (value) => `${toNum(value) >= 0 ? '+' : '-'}${Math.round(Math.abs(toNum(value))).toLocaleString('en-KE')}`;
const buildCashflowForecast = ({ referenceDate, incomes, debts, goals, investments, expenses }) => {
    const recurringIncome = (incomes || []).reduce((sum, income) => {
        const amount = toNum(income?.amount || income?.monthly_amount || income?.net_amount);
        const frequency = String(income?.frequency || '').toUpperCase();
        const isRecurring = Boolean(income?.is_recurring) || (frequency && frequency !== 'ONE_TIME');
        const incomeDate = income?.income_date || income?.date || income?.created_at;
        if (!amount) return sum;
        if (isRecurring) return sum + amount;
        if (income?.status === 'EXPECTED' && isSameMonth(incomeDate, referenceDate)) return sum + amount;
        return sum;
    }, 0);

    const debtPayments = (debts || []).reduce((sum, debt) => {
        if (!isSameMonth(debt?.dueDate, referenceDate)) return sum;
        return sum + toNum(debt?.minimumPayment || debt?.balance);
    }, 0);

    const goalContributions = (goals || []).reduce((sum, goal) => {
        const contribution = toNum(goal?.monthly_contribution || goal?.monthlyContribution);
        return sum + contribution;
    }, 0);

    const investmentIncome = (investments || []).reduce((sum, asset) => {
        const gain = toNum(asset?.gainLoss);
        const category = String(asset?.categoryName || asset?.name || '').toLowerCase();
        if (gain <= 0) return sum;
        if (category.includes('dividend') || category.includes('money market') || category.includes('mmf') || category.includes('treasury') || category.includes('bond') || category.includes('bill')) {
            return sum + gain;
        }
        return sum;
    }, 0);

    const taxObligation = (expenses || []).reduce((sum, expense) => {
        const label = `${expense?.category_name || ''} ${expense?.category || ''} ${expense?.description || ''}`.toLowerCase();
        if (!isSameMonth(expense?.date || expense?.expense_date || expense?.created_at, referenceDate)) return sum;
        if (!label.includes('tax') && !label.includes('paye') && !label.includes('kra') && !label.includes('nhif') && !label.includes('nssf')) return sum;
        return sum + Math.abs(toNum(expense?.amount));
    }, 0);

    const insurancePremium = (expenses || []).reduce((sum, expense) => {
        const label = `${expense?.category_name || ''} ${expense?.category || ''} ${expense?.description || ''}`.toLowerCase();
        if (!isSameMonth(expense?.date || expense?.expense_date || expense?.created_at, referenceDate)) return sum;
        if (!label.includes('insurance') && !label.includes('premium') && !label.includes('cover')) return sum;
        return sum + Math.abs(toNum(expense?.amount));
    }, 0);

    const forecastItems = [
        { label: 'Recurring Income', rawValue: recurringIncome, tone: 'text-emerald-300', dot: 'bg-[#51d1ba]' },
        { label: 'Investment Income', rawValue: investmentIncome, tone: 'text-blue-300', dot: 'bg-[#4b8fff]' },
        { label: 'Debt Payments', rawValue: -debtPayments, tone: 'text-rose-300', dot: 'bg-[#ff6d6d]' },
        { label: 'Goal Contributions', rawValue: -goalContributions, tone: 'text-sky-300', dot: 'bg-[#5ab4ff]' },
        { label: 'Tax Obligation', rawValue: -taxObligation, tone: 'text-amber-300', dot: 'bg-[#f7bf4a]' },
        { label: 'Insurance Premium', rawValue: -insurancePremium, tone: 'text-violet-300', dot: 'bg-[#9d7cff]' },
    ].filter((item) => Math.abs(item.rawValue) > 0);

    return {
        items: forecastItems.map((item) => ({ ...item, value: formatCompactSigned(item.rawValue) })),
        net: forecastItems.reduce((sum, item) => sum + item.rawValue, 0),
    };
};
const dashboardToolTiles = [
    { label: 'Loan Calc', icon: Calculator, target: 'resourceshub' },
    { label: 'Compound', icon: TrendingUp, target: 'resourceshub' },
    { label: 'FX Rates', icon: Landmark, target: 'comparehub' },
    { label: 'Tax Calc', icon: Briefcase, target: 'resourceshub' },
    { label: 'FIRE Calc', icon: Target, target: 'resourceshub' },
    { label: 'Debt Payoff', icon: Wallet, target: 'debt' },
];
const buildLearningSnapshot = ({ hasData, healthScore, budgetScore, savingsRateScore, debtRatioScore, investmentScore, live }) => {
    if (!hasData) {
        return {
            hero: { subtitle: 'Start learning', title: 'Complete your first planner', progress: 12, meta: 'Add data to unlock tailored lessons' },
            items: [
                { title: 'Budgeting Basics', meta: '6 min', tag: 'Beginner', tagShell: 'bg-[#fff0ba] text-[#9a6800]' },
                { title: 'How Goal Saving Works', meta: '8 min', tag: 'Beginner', tagShell: 'bg-[#fff0ba] text-[#9a6800]' },
            ],
            stats: [
                { value: '0', label: 'XP Earned', tone: 'text-amber-500' },
                { value: '0', label: 'Lessons', tone: 'text-emerald-700' },
                { value: '0', label: 'Badges', tone: 'text-blue-600' },
            ],
        };
    }

    const tracks = [
        { key: 'budget', score: budgetScore, title: 'Master Your Monthly Budget', meta: '8 min', tag: 'Beginner', tagShell: 'bg-[#fff0ba] text-[#9a6800]' },
        { key: 'savings', score: savingsRateScore, title: 'Build a Stronger Savings Rate', meta: '10 min', tag: 'Intermediate', tagShell: 'bg-violet-100 text-violet-700' },
        { key: 'debt', score: debtRatioScore, title: 'Reduce Debt the Smart Way', meta: '9 min', tag: 'Action', tagShell: 'bg-rose-100 text-rose-700' },
        { key: 'invest', score: investmentScore, title: 'Grow Wealth with T-Bills & MMFs', meta: '8 min', tag: 'Intermediate', tagShell: 'bg-violet-100 text-violet-700' },
    ].sort((a, b) => a.score - b.score);

    const primaryTrack = tracks[0];
    const lessonsCompleted = (live.tx?.length || 0) + (live.goals?.length || 0) + (live.inv?.length || 0);
    const xpEarned = Math.round((Number(healthScore || 0) * 3) + (lessonsCompleted * 10));
    const badges = [budgetScore >= 70, savingsRateScore >= 70, investmentScore >= 70].filter(Boolean).length;
    const progress = clamp(Math.round(primaryTrack.score), 10, 95);

    return {
        hero: {
            subtitle: 'Continue learning',
            title: primaryTrack.title,
            progress,
            meta: `${progress}% ready - ~${Math.max(6, Math.round((100 - progress) / 6))} mins remaining`,
        },
        items: tracks.slice(1, 3).map((track) => ({
            title: track.title,
            meta: track.meta,
            tag: track.tag,
            tagShell: track.tagShell,
        })),
        stats: [
            { value: String(xpEarned), label: 'XP Earned', tone: 'text-amber-500' },
            { value: String(lessonsCompleted), label: 'Lessons', tone: 'text-emerald-700' },
            { value: String(badges), label: 'Badges', tone: 'text-blue-600' },
        ],
    };
};
const buildBestRatesSnapshot = () => {
    const savingsModule = overviewCompareModules.find((module) => module.id === 'savings');
    const loanModule = overviewCompareModules.find((module) => module.id === 'loans');
    const bankingModule = overviewCompareModules.find((module) => module.id === 'banking');

    const mmfRows = savingsModule?.segments?.find((segment) => segment.id === 'mmf')?.rows || [];
    const saccoRows = bankingModule?.segments?.find((segment) => segment.id === 'saccos')?.rows || [];
    const loanRows = loanModule?.segments?.flatMap((segment) => segment.rows || []) || [];

    const extractPercent = (text) => {
        const matches = String(text || '').match(/(\d+(\.\d+)?)/g) || [];
        return matches.length ? Number(matches[0]) : 0;
    };

    const bestMmf = mmfRows.reduce((best, row) => (extractPercent(row[1]) > extractPercent(best?.[1]) ? row : best), mmfRows[0]);
    const bestSacco = saccoRows.reduce((best, row) => (extractPercent(row[3]) > extractPercent(best?.[3]) ? row : best), saccoRows[0]);
    const bestLoan = loanRows.reduce((best, row) => (extractPercent(row[3]) < extractPercent(best?.[3]) ? row : best), loanRows[0]);

    return {
        comparedCount: COMPARED_PRODUCTS_COUNT,
        rates: [
            { value: bestLoan?.[3] || '--', label: 'Best Loan APR', helper: bestLoan?.[0] || 'Lowest tracked rate', shell: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { value: bestMmf?.[1] || '--', label: 'Best MMF Yield', helper: bestMmf?.[0] || 'Highest tracked yield', shell: 'bg-amber-50 text-[#9a6200] border-amber-100' },
            { value: bestSacco?.[3] || '--', label: 'Best SACCO Dividend', helper: bestSacco?.[0] || 'Top dividend range', shell: 'bg-blue-50 text-blue-700 border-blue-100' },
        ],
    };
};
const relDate = (v) => {
    if (!v) return 'Recent';
    const d = new Date(v); if (Number.isNaN(d.getTime())) return 'Recent';
    const diff = Math.round((Date.now() - d.getTime()) / 86400000);
    if (diff <= 0) return 'Today'; if (diff === 1) return 'Yesterday'; if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const settleWithConcurrency = async (tasks, concurrency = 4) => {
    const results = new Array(tasks.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < tasks.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;

            try {
                results[currentIndex] = { status: 'fulfilled', value: await tasks[currentIndex]() };
            } catch (reason) {
                results[currentIndex] = { status: 'rejected', reason };
            }
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
    return results;
};
const readCustomCalendarEvents = () => {
    if (typeof window === 'undefined') return [];
    try {
        const parsed = JSON.parse(window.localStorage.getItem(FINANCIAL_CALENDAR_EVENTS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};
const isNewUser = (user) => {
    const profile = user?.profile || {};
    let ws = {};
    try {
        ws = JSON.parse(localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}');
    } catch {
        ws = {};
    }
    const hasData = localStorage.getItem(DASHBOARD_DATA_KEY) === 'true';
    return !(profile.monthly_income || profile.primary_financial_goal || ws.shortTermGoal || ws.mediumTermGoal || ws.longTermGoal || hasData);
};

const DashboardOverview = ({ user, hasIncomeData = false, onSelectSection, onSignOut }) => {
    const [displayName, setDisplayName] = useState(() => getDashboardDisplayName(user));
    const moment = useMemo(() => getMoment(new Date()), []);
    const palette = toneMap[moment];
    const newUser = isNewUser(user);
    const dateLabel = useMemo(() => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);
    const [live, setLive] = useState({
        loading: true,
        hasAnyData: false,
        netWorth: 0,
        income: 0,
        spent: 0,
        savings: 0,
        completion: 0,
        budget: [],
        spending: [],
        tx: [],
        inv: [],
        goals: [],
        breakdown: { cash: 0, investments: 0, property: 0, liabilities: 0 },
        raw: { incomes: [], budgets: [], expenses: [], goals: [], investments: [], debts: [] },
    });
    const [healthSnapshot, setHealthSnapshot] = useState({ score: 0, statusDisplay: 'Data pending', components: [] });
    const [dashboardStreak, setDashboardStreak] = useState(() => readDashboardStreak(user));
    const [selectedCalendarFilter, setSelectedCalendarFilter] = useState('all');
    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [customCalendarEvents, setCustomCalendarEvents] = useState(readCustomCalendarEvents);
    const [calendarForm, setCalendarForm] = useState({ name: '', date: '', type: 'goal' });
    const currentMonth = useMemo(() => new Date(), []);

    const loadOverviewData = useCallback(async ({ isActive = () => true } = {}) => {
        const monthParams = { year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 };
        const settled = await settleWithConcurrency([
            () => incomeService.getSummary(),
            () => incomeService.getIncomes({ limit: 100 }),
            () => getBudgetSummary(),
            () => getBudgets({ current: 'true', ...monthParams }),
            () => getExpenses({ limit: 100, ...monthParams }),
            () => getGoals({ status: 'ACTIVE' }),
            () => getInvestmentAssets(),
            () => getDebts(),
            () => getNetWorthSummary(),
            () => getHealthScore(),
            () => getHealthScoreBreakdown(),
        ]);
        const pick = (i, f) => (settled[i]?.status === 'fulfilled' ? settled[i].value : f);
        const incomeSummary = pick(0, {}), incomesPayload = pick(1, {}), budgetSummary = pick(2, {}), budgets = pick(3, []), expensesPayload = pick(4, {}), goals = pick(5, []), inv = pick(6, []), debts = pick(7, []), nw = pick(8, {}), healthScore = pick(9, {}), healthBreakdown = pick(10, {});
        const incomes = incomesPayload?.incomes || incomesPayload?.results || incomesPayload?.data || [];
        const expenses = expensesPayload?.expenses || expensesPayload?.results || expensesPayload?.data || [];
        const currentMonthExpenses = expenses.filter((expense) => isSameMonth(expense?.date || expense?.expense_date || expense?.created_at, currentMonth));
        const derivedIncome = (incomes || []).reduce((sum, item) => sum + toNum(item.amount || item.monthly_amount || item.net_amount), 0);
        const income = toNum(
            incomeSummary?.total_income ||
            incomeSummary?.monthly_income ||
            incomeSummary?.current_month?.total_income ||
            incomeSummary?.currentMonth?.total_income ||
            incomeSummary?.summary?.total_income ||
            incomeSummary?.summary?.monthly_income ||
            derivedIncome ||
            user?.profile?.monthly_income
        );
        const currentMonthExpenseTotal = currentMonthExpenses.reduce((sum, expense) => sum + Math.abs(toNum(expense.amount)), 0);
        const spent = toNum(
            budgetSummary?.current_month?.total_spent ||
            budgetSummary?.currentMonth?.total_spent ||
            budgetSummary?.monthly_spent ||
            currentMonthExpenseTotal
        );
        const debtTotal = (debts || []).reduce((s, d) => s + toNum(d.balance), 0);
        const invTotal = (inv || []).reduce((s, a) => s + toNum(a.currentValue), 0);
        const netWorth = toNum(nw?.netWorth || invTotal - debtTotal);
        const savings = toNum(
            nw?.savingsFromGoals ||
            nw?.savings ||
            budgetSummary?.goal_saved_total ||
            budgetSummary?.total_goal_saved ||
            goals.reduce((sum, goal) => sum + toNum(goal.current_amount || goal.saved_amount || goal.total_saved || goal.amount_saved), 0)
        );
        const breakdown = (inv || []).reduce((acc, asset) => {
            const category = String(asset.categoryName || '').toLowerCase();
            const value = toNum(asset.currentValue);
            if (category.includes('cash') || category.includes('bank') || category.includes('mobile money') || category.includes('savings')) acc.cash += value;
            else if (category.includes('real estate') || category.includes('property') || category.includes('land') || category.includes('vehicle')) acc.property += value;
            else acc.investments += value;
            return acc;
        }, { cash: 0, investments: 0, property: 0, liabilities: debtTotal });
        const budget = (budgets || []).slice(0, 5).map((b, i) => {
            const target = toNum(b.budgeted_amount || b.allocated_amount || b.amount || b.target_amount);
            const used = toNum(b.spent_amount || b.actual_spent || b.total_spent || b.spent);
            const pct = target > 0 ? Math.round((used / target) * 100) : 0;
            const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-500', 'bg-violet-600', 'bg-rose-500'];
            return {
                label: b.category_name || b.name || `Category ${i + 1}`,
                percent: pct,
                amount: fmtKES(used || 0),
                rawAmount: used,
                color: colors[i % colors.length],
            };
        });
        const groupedSpending = Object.values(currentMonthExpenses.reduce((acc, expense) => {
            const label = expense.description || expense.name || expense.category_name || expense.category || 'Other';
            const amount = Math.abs(toNum(expense.amount));
            if (!acc[label]) acc[label] = { label, amount: 0 };
            acc[label].amount += amount;
            return acc;
        }, {})).sort((a, b) => b.amount - a.amount);
        const spendingTotal = groupedSpending.reduce((sum, item) => sum + item.amount, 0);
        const spending = groupedSpending.slice(0, 5).map((item, index) => {
            const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-500', 'bg-violet-600', 'bg-rose-500'];
            return {
                label: item.label,
                amount: fmtKES(item.amount),
                rawAmount: item.amount,
                percent: spendingTotal > 0 ? Math.round((item.amount / spendingTotal) * 100) : 0,
                color: colors[index % colors.length],
            };
        });
        const tx = [
            ...currentMonthExpenses.map((e) => ({ date: getDate(e), name: e.description || e.name || e.category_name || 'Expense', category: e.category_name || 'Expense', amount: -Math.abs(toNum(e.amount)) })),
            ...incomes.map((x) => ({ date: getDate(x), name: x.source_name || x.name || 'Income', category: x.category_name || 'Income', amount: Math.abs(toNum(x.amount || x.monthly_amount)) })),
        ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 5).map((r) => ({ name: r.name, category: r.category, amount: fmtSigned(r.amount), when: relDate(r.date), tone: r.amount >= 0 ? 'text-emerald-700' : 'text-rose-600' }));
        const invRows = (inv || []).slice(0, 4).map((a) => ({ name: a.name || 'Investment', type: a.categoryName || 'Investment', value: fmtKES(a.currentValue), change: `${toNum(a.gainLossPercentage) >= 0 ? '+' : ''}${Math.round(toNum(a.gainLossPercentage) * 10) / 10}%`, tone: toNum(a.gainLossPercentage) >= 0 ? 'text-emerald-700' : 'text-rose-600' }));
        const goalRows = (goals || []).slice(0, 3).map((g) => {
            const targetAmount = toNum(g.target_amount || g.target || g.goal_amount);
            const currentAmount = toNum(g.current_amount || g.saved_amount || g.total_saved || g.amount_saved);
            const progress = targetAmount > 0
                ? Math.round((currentAmount / targetAmount) * 100)
                : Math.round(toNum(g.progress_percentage || g.progress || g.completion));
            return {
                label: g.name || g.title || 'Goal',
                horizon: g.time_horizon || g.goal_type || 'Goal',
                progress: Math.max(0, Math.min(100, progress)),
            };
        });
        const stepFlags = [income > 0, budget.length > 0, spending.length > 0, tx.length > 0, invRows.length > 0, goalRows.length > 0, Math.abs(netWorth) > 0];
        const hasLiveData = stepFlags.some(Boolean);
        const completion = Math.round((stepFlags.filter(Boolean).length / stepFlags.length) * 100);
        const derivedHealth = buildDerivedFinancialHealth({
            profile: user?.profile || user || {},
            live: {
                income,
                spent,
                savings,
                netWorth,
                raw: {
                    incomes,
                    budgets,
                    expenses: currentMonthExpenses,
                    goals,
                    investments: inv,
                    debts,
                },
            },
        });
        const apiHealthScore = Number(healthScore?.overall_score ?? 0);
        const apiHealthComponents = Array.isArray(healthBreakdown?.components) ? healthBreakdown.components : [];
        const nextHealthSnapshot = {
            score: hasLiveData ? (apiHealthScore || derivedHealth.score.overall_score) : 0,
            statusDisplay: hasLiveData ? (healthScore?.status_display || derivedHealth.score.status_display || 'Score ready') : 'No data yet',
            components: hasLiveData && apiHealthComponents.length ? apiHealthComponents : derivedHealth.breakdown.components,
        };

        if (isActive()) {
            if (hasLiveData) {
                markDashboardDataExists();
                setDashboardStreak(updateDashboardStreak(user, new Date()));
            }
            setLive({
                loading: false,
                hasAnyData: hasLiveData,
                netWorth,
                income,
                spent,
                savings,
                completion,
                budget,
                spending,
                tx,
                inv: invRows,
                goals: goalRows,
                breakdown,
                raw: {
                    incomes,
                    budgets,
                    expenses: currentMonthExpenses,
                    goals,
                    investments: inv,
                    debts,
                },
            });
            setHealthSnapshot(nextHealthSnapshot);
        }

        return {
            netWorth,
            income,
            spent,
            savings,
            completion,
            healthScore: nextHealthSnapshot.score,
            budgetCount: budget.length,
            spendingCount: spending.length,
            transactionCount: tx.length,
            investmentCount: invRows.length,
            goalCount: goalRows.length,
            debtCount: debts.length,
        };
    }, [currentMonth, user]);

    useEffect(() => {
        let mounted = true;
        loadOverviewData({ isActive: () => mounted });
        return () => { mounted = false; };
    }, [loadOverviewData]);

    useEffect(() => {
        let mounted = true;
        const refreshFromPlannerChange = () => {
            loadOverviewData({ isActive: () => mounted });
        };

        window.addEventListener('healthRefreshRequested', refreshFromPlannerChange);
        window.addEventListener('focus', refreshFromPlannerChange);

        return () => {
            mounted = false;
            window.removeEventListener('healthRefreshRequested', refreshFromPlannerChange);
            window.removeEventListener('focus', refreshFromPlannerChange);
        };
    }, [loadOverviewData]);

    const overviewSync = useAdaptivePolling({
        enabled: true,
        poll: loadOverviewData,
        minIntervalMs: OVERVIEW_REFRESH_INTERVAL_MS,
        maxIntervalMs: OVERVIEW_MAX_REFRESH_INTERVAL_MS,
    });

    const hasData = live.hasAnyData;
    const shouldShowNewUserHero = newUser && !hasData && !hasIncomeData;
    const healthComponents = hasData ? healthSnapshot.components : [];
    const currentScore = hasData ? clamp(Number(healthSnapshot.score || 0), 0, 100) : 0;
    const streakDays = hasData ? clamp(Number(dashboardStreak.count || 0), 0, 3650) : 0;
    const savingsRateScore = hasData ? findHealthComponentScore(healthComponents, ['saving', 'savings'], Math.min(100, Math.max(0, Math.round((live.savings / Math.max(live.income || 1, 1)) * 100)))) : 0;
    const debtRatioScore = hasData ? findHealthComponentScore(healthComponents, ['debt', 'liabilit'], Math.min(100, Math.max(0, Math.round((Math.abs(live.breakdown.liabilities) / Math.max(live.netWorth || 1, 1)) * 100)))) : 0;
    const budgetScore = hasData ? findHealthComponentScore(healthComponents, ['budget', 'spending'], Math.min(100, live.completion)) : 0;
    const investmentScore = hasData ? findHealthComponentScore(healthComponents, ['invest', 'net worth', 'wealth'], Math.min(100, Math.round((live.breakdown.investments / Math.max(live.netWorth || 1, 1)) * 100))) : 0;
    const ctaButtons = useMemo(() => {
        if (shouldShowNewUserHero) return [{ id: 'profile', label: 'Complete profile', target: 'user', primary: true }, { id: 'plan', label: 'Continue planning', target: 'budget', primary: false }];
        return [{ id: 'profile', label: 'Complete profile', target: 'user', primary: true }, { id: 'plan', label: 'Continue planning', target: 'budget', primary: false }];
    }, [shouldShowNewUserHero]);

    const stats = [
        { icon: Coins, label: 'Total Net Worth', value: hasData ? fmtKES(live.netWorth) : 'KES 0', meta: hasData ? 'From connected planners' : 'Add data to see this', tone: 'text-emerald-700' },
        { icon: PiggyBank, label: 'Monthly Income', value: hasData ? fmtKES(live.income) : 'KES 0', meta: hasData ? 'Income Manager' : 'No income yet', tone: 'text-slate-900' },
        { icon: Wallet, label: 'Spent - Current', value: hasData ? fmtKES(live.spent) : 'KES 0', meta: hasData ? 'Budget + expenses' : 'No spending data', tone: 'text-rose-600' },
        { icon: TrendingUp, label: 'Total Savings', value: hasData ? fmtKES(live.savings) : 'KES 0', meta: hasData ? 'Goals progress' : 'No savings progress', tone: 'text-emerald-700' },
    ];
    const spendingRows = live.budget.length ? live.budget : live.spending;
    const aiInsights = useMemo(() => {
        if (!hasData) return [];
        return buildAiInsightCards({
            budgets: live.raw.budgets,
            goals: live.raw.goals,
            debts: live.raw.debts,
            investments: live.raw.investments,
            income: live.income,
            savings: live.savings,
            score: currentScore,
        });
    }, [hasData, live.raw, live.income, live.savings, currentScore]);
    const calendarEvents = useMemo(() => {
        const liveEvents = hasData ? buildCalendarEvents({
            referenceDate: currentMonth,
            incomes: live.raw.incomes,
            debts: live.raw.debts,
            goals: live.raw.goals,
            investments: live.raw.investments,
        }) : [];
        const manualEvents = customCalendarEvents
            .filter((event) => isSameMonth(event.date, currentMonth))
            .map((event) => {
                const style = calendarTypeStyles[event.type] || calendarTypeStyles.goal;
                const date = parseDateValue(event.date);
                return {
                    ...event,
                    date,
                    day: date?.getDate(),
                    label: style.label,
                    cellTone: style.cellTone,
                    listTone: style.listTone,
                    filterShell: style.filterShell,
                    priority: 0,
                };
            })
            .filter((event) => event.date);
        return [...manualEvents, ...liveEvents].sort((a, b) => a.date.getTime() - b.date.getTime() || a.priority - b.priority);
    }, [hasData, currentMonth, live.raw, customCalendarEvents]);
    const calendarFilters = useMemo(() => buildCalendarFilters(calendarEvents), [calendarEvents]);
    const filteredCalendarEvents = useMemo(() => {
        if (selectedCalendarFilter === 'all') return calendarEvents;
        return calendarEvents.filter((event) => event.type === selectedCalendarFilter);
    }, [calendarEvents, selectedCalendarFilter]);
    const calendarDays = useMemo(() => buildCalendarGrid(currentMonth, filteredCalendarEvents), [currentMonth, filteredCalendarEvents]);
    const upcomingEvents = useMemo(() => filteredCalendarEvents.slice(0, 4).map((event) => ({
        date: formatShortMonthDay(event.date),
        name: event.name,
        tone: event.listTone,
    })), [filteredCalendarEvents]);
    const calendarMonthLabel = useMemo(() => formatMonthLabel(currentMonth), [currentMonth]);
    const cashflowForecast = useMemo(() => {
        if (!hasData) return { items: [], net: 0 };
        return buildCashflowForecast({
            referenceDate: currentMonth,
            incomes: live.raw.incomes,
            debts: live.raw.debts,
            goals: live.raw.goals,
            investments: live.raw.investments,
            expenses: live.raw.expenses,
        });
    }, [hasData, currentMonth, live.raw]);
    const learningSnapshot = useMemo(() => buildLearningSnapshot({
        hasData,
        healthScore: currentScore,
        budgetScore,
        savingsRateScore,
        debtRatioScore,
        investmentScore,
        live,
    }), [hasData, currentScore, budgetScore, savingsRateScore, debtRatioScore, investmentScore, live]);
    const bestRatesSnapshot = useMemo(() => buildBestRatesSnapshot(), []);
    const mobileActions = [
        { label: 'Compare Hub', icon: TrendingUp, target: 'comparehub' },
        { label: 'Resources', icon: Calculator, target: 'resourceshub' },
        { label: 'Learning Hub', icon: BookOpen, target: 'learninghub' },
        { label: 'Community', icon: Heart, target: 'communityhub' },
    ];
    const mobileInvestmentRows = live.inv.length ? live.inv.slice(0, 4) : [];
    const mobileInsights = aiInsights.length ? aiInsights.slice(0, 2) : [
        {
            title: 'Shopping alert',
            description: hasData ? 'Review your highest spending category before the month closes.' : 'You have not added budget data yet.',
            icon: AlertTriangle,
            shell: 'bg-[#fff7ed]',
            iconShell: 'bg-[#ffedd4] text-[#b45309]',
            titleTone: 'text-[#7e2a0c]',
        },
        {
            title: 'Great job',
            description: hasData ? 'Keep your profile updated so Shilingi can spot better moves.' : 'Complete setup to unlock stronger money insights.',
            icon: Trophy,
            shell: 'bg-[#f0fdf4]',
            iconShell: 'bg-[#dcfce7] text-[#15803d]',
            titleTone: 'text-[#0d542b]',
        },
    ];

    useEffect(() => {
        if (!calendarFilters.some((filter) => filter.key === selectedCalendarFilter)) {
            setSelectedCalendarFilter('all');
        }
    }, [calendarFilters, selectedCalendarFilter]);

    useEffect(() => {
        try {
            localStorage.setItem(FINANCIAL_CALENDAR_EVENTS_KEY, JSON.stringify(customCalendarEvents));
        } catch (error) {
            console.warn('Could not persist financial calendar events:', error);
        }
    }, [customCalendarEvents]);

    useEffect(() => {
        const refreshCalendarEvents = () => setCustomCalendarEvents(readCustomCalendarEvents());
        window.addEventListener('storage', refreshCalendarEvents);
        window.addEventListener('shilingi:calendar-events-updated', refreshCalendarEvents);
        return () => {
            window.removeEventListener('storage', refreshCalendarEvents);
            window.removeEventListener('shilingi:calendar-events-updated', refreshCalendarEvents);
        };
    }, []);

    useEffect(() => {
        const syncDisplayName = () => setDisplayName(getDashboardDisplayName(user));
        syncDisplayName();

        const handleStorage = (event) => {
            if (event.key === PREFERRED_NAME_KEY) {
                syncDisplayName();
            }
        };

        window.addEventListener(PREFERRED_NAME_UPDATED_EVENT, syncDisplayName);
        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', syncDisplayName);

        return () => {
            window.removeEventListener(PREFERRED_NAME_UPDATED_EVENT, syncDisplayName);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('focus', syncDisplayName);
        };
    }, [user]);

    useEffect(() => {
        setDashboardStreak(readDashboardStreak(user));
    }, [user]);

    const handleCalendarSubmit = (event) => {
        event.preventDefault();
        if (!calendarForm.name.trim() || !calendarForm.date) return;
        setCustomCalendarEvents((current) => [
            ...current,
            {
                id: `${calendarForm.date}-${calendarForm.type}-${Date.now()}`,
                name: calendarForm.name.trim(),
                date: calendarForm.date,
                type: calendarForm.type,
            },
        ]);
        setCalendarForm({ name: '', date: '', type: 'goal' });
        setSelectedCalendarFilter('all');
        setCalendarModalOpen(false);
    };

    return (
        <>
            <MobileDashboardOverview
                aiInsights={mobileInsights}
                ctaButtons={ctaButtons}
                currentScore={currentScore}
                displayName={displayName}
                hasData={hasData}
                investmentRows={mobileInvestmentRows}
                live={live}
                mobileActions={mobileActions}
                onSelectSection={onSelectSection}
                onSignOut={onSignOut}
                palette={palette}
                savingsRateScore={savingsRateScore}
                sync={overviewSync}
                debtRatioScore={debtRatioScore}
                budgetScore={budgetScore}
                investmentScore={investmentScore}
                spendingRows={spendingRows}
                stats={stats}
            />
            <DesktopDashboardOverview
                aiInsights={mobileInsights}
                budgetScore={budgetScore}
                ctaButtons={ctaButtons}
                currentScore={currentScore}
                debtRatioScore={debtRatioScore}
                displayName={displayName}
                hasData={hasData}
                investmentRows={mobileInvestmentRows}
                investmentScore={investmentScore}
                live={live}
                mobileActions={mobileActions}
                onSelectSection={onSelectSection}
                onSignOut={onSignOut}
                palette={palette}
                savingsRateScore={savingsRateScore}
                sync={overviewSync}
                spendingRows={spendingRows}
                stats={stats}
                user={user}
            />
            <div className="hidden px-4 py-5 sm:block sm:px-6 lg:hidden lg:px-8 lg:py-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <section className={`relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${palette.shell} p-4 text-white shadow-[0_16px_48px_rgba(15,23,42,0.14)] sm:p-5`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(240,201,77,0.10),_transparent_24%)]" />
                    <div className="relative">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                                {shouldShowNewUserHero ? (
                                    <>
                                        <h1 className="max-w-4xl text-[1.55rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[1.95rem]">Welcome {displayName}, your financial health score is {currentScore}/100.</h1>
                                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/80">Please complete your profile and planners to unlock personalized insights tailored to your life.</p>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="max-w-4xl text-[1.5rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[1.8rem]">{palette.label}, {displayName}!</h1>
                                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/80">Great progress today. Your health score is {currentScore}/100{hasData ? ` and you have ${fmtKES(live.savings)} in tracked savings.` : '.'}</p>
                                    </>
                                )}
                                <div className="mt-3 flex flex-wrap gap-2.5">{ctaButtons.map((b) => <button key={b.id} type="button" onClick={() => onSelectSection(b.target)} className={b.primary ? 'inline-flex items-center gap-2 rounded-full bg-[#F0C94D] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-300/20' : 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15'}>{b.label}<ArrowRight size={14} /></button>)}</div>
                            </div>
                            <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                                <div className="inline-flex self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm lg:self-end">
                                    {dateLabel}
                                </div>
                                {!shouldShowNewUserHero && (
                                    <div className="grid w-full grid-cols-2 gap-2.5 sm:max-w-[230px]">
                                        <HeroBadge label="Day Streak" value={String(streakDays)} />
                                        <HeroBadge label="Health Score" value={String(currentScore)} suffix="/100" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ icon: Icon, label, value, meta, tone }) => <article key={label} className="rounded-[0.9rem] border border-emerald-100 bg-white px-3.5 py-2.5 shadow-sm"><span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-primary-700"><Icon size={13} /></span><p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p><p className={`mt-1 text-[1.45rem] leading-none font-extrabold sm:text-[1.55rem] ${tone}`}>{live.loading ? '...' : value}</p><p className="mt-1 text-[10px] text-slate-500">{meta}</p></article>)}</section>

                <section className="grid gap-4 xl:grid-cols-[1.2fr_0.72fr]">
                    <div className="grid gap-4">
                        <article className="relative overflow-hidden rounded-[1rem] border border-emerald-100 bg-gradient-to-br from-[#14986b] via-[#117f5a] to-[#0a4d37] p-2.5 text-white shadow-sm">
                        <div className="absolute inset-y-0 right-0 w-40 rounded-full bg-white/5 blur-0" />
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-100">Net Worth Overview</p>
                        <p className="mt-1 text-[1.55rem] font-extrabold leading-none">{hasData ? fmtKES(live.netWorth) : 'KES 0'}</p>
                        <p className="mt-1 text-[10px] text-emerald-100">{hasData ? 'Updated now - +12.3% YTD' : 'Updated from your connected planners'}</p>
                        <div className="mt-2 h-[46px] rounded-[0.8rem] bg-white/5 p-1.5">
                            <div className="relative h-full overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,rgba(98,255,215,0.16)_0%,rgba(98,255,215,0.04)_100%)]">
                                <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                                    <defs>
                                        <linearGradient id="networthLineFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(120,255,224,0.35)" />
                                            <stop offset="100%" stopColor="rgba(120,255,224,0.02)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,26 L10,24 L20,25 L30,20 L40,21 L50,17 L60,18 L70,13 L80,14 L90,11 L100,10 L100,36 L0,36 Z" fill="url(#networthLineFill)" />
                                    <path d="M0,26 L10,24 L20,25 L30,20 L40,21 L50,17 L60,18 L70,13 L80,14 L90,11 L100,10" fill="none" stroke="#65e3c2" strokeWidth="1.2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm sm:grid-cols-4">
                            <BreakdownItem label="Cash" value={live.breakdown.cash} tone="text-emerald-200" />
                            <BreakdownItem label="Investments" value={live.breakdown.investments} tone="text-amber-300" />
                            <BreakdownItem label="Property" value={live.breakdown.property} tone="text-sky-200" />
                            <BreakdownItem label="Liabilities" value={-Math.abs(live.breakdown.liabilities)} tone="text-rose-300" />
                        </div>
                        </article>

                        <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-900">Spending Breakdown - {currentMonth.toLocaleDateString('en-GB', { month: 'long' })}</h3>
                                <button type="button" onClick={() => onSelectSection('budget')} className="text-xs font-semibold text-primary-700">Full Report -</button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
                                <div className="flex justify-center">
                                    <SpendingDonut rows={spendingRows} />
                                </div>
                                <div className="space-y-2">
                                    {spendingRows.length ? (
                                        spendingRows.slice(0, 5).map((row) => (
                                            <div key={row.label} className="grid grid-cols-[12px_1fr_auto] items-center gap-3">
                                                <span className={`h-3 w-3 rounded-full ${row.color}`} />
                                                <p className="text-sm text-slate-700">{row.label}</p>
                                                <p className={`text-sm font-semibold ${getBudgetTone(row.percent)}`}>{Math.min(row.percent, 999)}%</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900">No {currentMonth.toLocaleDateString('en-GB', { month: 'long' })} spending yet</p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">Add a budget or expense in the Budget Planner to see this breakdown.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="grid gap-4">
                        <article className="rounded-[1.4rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="inline-flex items-center gap-2 text-base font-bold text-slate-900"><Heart size={15} className="fill-emerald-500 text-emerald-500" />Financial Health Score</p>
                                <button type="button" onClick={() => onSelectSection('health')} className="text-xs font-semibold text-primary-700">Details -</button>
                            </div>
                            <div className="mt-3 flex flex-col items-center">
                                <CircularHealth score={currentScore} />
                                <p className="mt-3 text-lg font-bold text-primary-800">{healthSnapshot.statusDisplay || getHealthLabel(currentScore)}</p>
                                <p className="text-xs text-slate-400">Synced with your full health score view</p>
                            </div>
                            <div className="mt-4 space-y-2.5">
                                <HealthBar label="Savings Rate" value={savingsRateScore} color="bg-emerald-600" textColor="text-emerald-700" />
                                <HealthBar label="Debt Ratio" value={debtRatioScore} color="bg-amber-500" textColor="text-amber-600" inverse />
                                <HealthBar label="Budget" value={budgetScore} color="bg-blue-600" textColor="text-blue-600" />
                                <HealthBar label="Investments" value={investmentScore} color="bg-violet-600" textColor="text-violet-600" />
                            </div>
                        </article>
                        <Panel title="Financial Goals" action="+ New Goal" onAction={() => onSelectSection('user')}>
                            {live.goals.length ? (
                                live.goals.map((g) => (
                                    <div key={g.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-sm">
                                            <p className="font-semibold text-slate-800">{g.label}</p>
                                            <span className="text-slate-500">{g.progress}%</span>
                                        </div>
                                        <div className="mb-1 h-2 rounded-full bg-slate-200">
                                            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${g.progress}%` }} />
                                        </div>
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{g.horizon}</p>
                                    </div>
                                ))
                            ) : (
                                <DashboardEmptyState title="No goals yet" description="Add goals from your profile to track progress here." />
                            )}
                        </Panel>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <Panel title="Recent Transactions" action="View In Profile -" onAction={() => onSelectSection('user')}>
                        {live.tx.length ? (
                            live.tx.map((r, i) => (
                                <div key={`${r.name}-${i}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fbfa] px-3 py-2">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                                        <p className="text-xs text-slate-500">{r.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${r.tone}`}>{r.amount}</p>
                                        <p className="text-xs text-slate-400">{r.when}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <DashboardEmptyState title="No recent transactions" description="Add income or expenses to see recent movement here." />
                        )}
                    </Panel>
                    <Panel title="Investment Portfolio" action="Full View -" onAction={() => onSelectSection('investments')}>
                        {live.inv.length ? (
                            live.inv.map((r) => (
                                <div key={r.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fbfa] px-3 py-2">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                                        <p className="text-xs text-slate-500">{r.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900">{r.value}</p>
                                        <p className={`text-xs font-semibold ${r.tone}`}>{r.change}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <DashboardEmptyState title="No investments yet" description="Add investments to see your portfolio summary here." />
                        )}
                    </Panel>
                </section>

                <section className="rounded-[1.65rem] border border-emerald-100 bg-[linear-gradient(180deg,_#f8fffc_0%,_#f3fbf8_100%)] p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-700">Smart Guidance</p>
                            <h3 className="mt-1 text-xl font-bold text-slate-900">AI Insights</h3>
                        </div>
                        <button type="button" onClick={() => onSelectSection('health')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">All <ArrowRight size={14} /></button>
                    </div>
                    <div className="grid gap-3">
                        {(hasData ? aiInsights : []).length ? aiInsights.map(({ title, description, badge, icon: Icon, iconShell, badgeShell }) => (
                            <article key={title} className="rounded-[1.2rem] border border-emerald-100 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(18,56,74,0.06)]">
                                <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconShell}`}>
                                        <Icon size={19} />
                                    </span>
                                    <div>
                                        <p className="text-base font-bold text-slate-900">{title}</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeShell}`}>{badge}</span>
                                    </div>
                                </div>
                            </article>
                        )) : (
                            <article className="rounded-[1.2rem] border border-dashed border-emerald-200 bg-white px-4 py-5 text-sm text-slate-600">
                                Add budgets, goals, debts, or investments to unlock personalized AI insights here.
                            </article>
                        )}
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.85fr_0.95fr]">
                    <article className="rounded-[1.65rem] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                    <CalendarDays size={18} />
                                </span>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Financial Calendar</h3>
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Plan upcoming money moves</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[1.4rem] border border-emerald-100 bg-[#fbfefd] p-4">
                            <div className="flex items-center justify-between">
                                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-500">
                                    <ChevronLeft size={16} />
                                </button>
                                <p className="text-2xl font-extrabold text-[#21413c]">{calendarMonthLabel}</p>
                                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-500">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {calendarFilters.map((filter) => (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        onClick={() => setSelectedCalendarFilter(filter.key)}
                                        className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${selectedCalendarFilter === filter.key ? filter.shell : 'border-emerald-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-primary-700'}`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => <span key={label}>{label}</span>)}
                            </div>

                            <div className="mt-3 grid gap-2">
                                {calendarDays.map((week, weekIndex) => (
                                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                                        {week.map((entry, dayIndex) => (
                                            <div key={`${weekIndex}-${dayIndex}`} className="min-h-[88px] rounded-xl border border-emerald-100 bg-white p-2">
                                                 {entry ? (
                                                     <>
                                                         <p className="text-sm font-semibold text-slate-900">{entry.day}</p>
                                                         {entry.events?.length ? (
                                                             <div className="mt-2 space-y-1">
                                                                 {entry.events.slice(0, 2).map((event) => (
                                                                     <span key={`${event.type}-${event.name}`} className={`block rounded-md px-2 py-1 text-left text-[11px] font-medium ${event.cellTone}`}>
                                                                         {event.name}
                                                                     </span>
                                                                 ))}
                                                                 {entry.events.length > 2 ? <p className="text-[10px] font-semibold text-slate-400">+{entry.events.length - 2} more</p> : null}
                                                             </div>
                                                         ) : (
                                                             <div className="mt-6 h-1 rounded-full bg-slate-100" />
                                                         )}
                                                     </>
                                                 ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>

                    <div className="grid gap-4">
                        <article className="rounded-[1.65rem] border border-emerald-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Upcoming This Month</h3>
                                <button
                                    type="button"
                                    onClick={() => setCalendarModalOpen(true)}
                                    className="inline-flex rounded-full bg-[#0f3f39] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                                >
                                    Add event
                                </button>
                            </div>
                            <div className="mt-4 space-y-2">
                                {upcomingEvents.length ? upcomingEvents.map((event) => (
                                    <div key={`${event.date}-${event.name}`} className={`grid grid-cols-[52px_1fr] items-center rounded-xl px-3 py-2 text-sm ${event.tone}`}>
                                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{event.date}</span>
                                        <span className="font-medium">{event.name}</span>
                                    </div>
                                )) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                                        No money events are scheduled for this month yet.
                                    </div>
                                )}
                            </div>
                        </article>

                        <article className="rounded-[1.65rem] bg-[#0d342f] p-5 text-white shadow-[0_18px_40px_rgba(9,31,28,0.18)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100/75">{calendarMonthLabel} Cash Flow Forecast</p>
                            <div className="mt-4 space-y-3">
                                {cashflowForecast.items.length ? cashflowForecast.items.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                                            <span className="text-white/85">{item.label}</span>
                                        </div>
                                        <span className={`font-bold ${item.tone}`}>{item.value}</span>
                                    </div>
                                )) : (
                                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-white/75">
                                        Add recurring income, debt due dates, goal contributions, or tagged tax and insurance expenses to populate this forecast.
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-sm text-white/70">Net this month</p>
                                    <p className="text-xs text-emerald-100/70">Expected outcome after planned moves</p>
                                </div>
                                <p className={`text-3xl font-extrabold ${cashflowForecast.net >= 0 ? 'text-[#ffd975]' : 'text-rose-300'}`}>{formatCompactSigned(cashflowForecast.net)}</p>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                    <article className="rounded-[1.65rem] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={17} className="text-primary-700" />
                                <h3 className="text-xl font-bold text-slate-900">Compare Hub</h3>
                            </div>
                            <button type="button" onClick={() => onSelectSection('comparehub')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">Compare All <ArrowRight size={14} /></button>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-emerald-100 bg-[linear-gradient(180deg,_#f8fffc_0%,_#eff8f4_100%)]">
                            <div className="border-b border-emerald-100 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-700">Comparison Hub</p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-3xl font-extrabold tracking-tight text-slate-950">{bestRatesSnapshot.comparedCount}+</p>
                                        <p className="text-sm font-medium text-slate-500">products tracked</p>
                                    </div>
                                    <span className="rounded-full bg-[#0f3f39] px-3 py-1.5 text-xs font-semibold text-white">Live rates</span>
                                </div>
                            </div>

                            <div className="space-y-2 px-3 py-3">
                                {bestRatesSnapshot.rates.map((item) => (
                                    <div key={item.label} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[1rem] border px-3 py-3 ${item.shell}`}>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-900">{item.label}</p>
                                            <p className="mt-0.5 truncate text-xs font-medium opacity-80">{item.helper}</p>
                                        </div>
                                        <p className="text-right text-xl font-extrabold tracking-tight">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-600">Compare loans, savings, SACCOs, and investment products before choosing the next move.</p>
                    </article>

                    <article className="rounded-[1.65rem] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calculator size={17} className="text-primary-700" />
                                <h3 className="text-xl font-bold text-slate-900">Resources & Tools</h3>
                            </div>
                            <button type="button" onClick={() => onSelectSection('resourceshub')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">Open <ArrowRight size={14} /></button>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            {dashboardToolTiles.map(({ label, icon: Icon, target }) => (
                                <button key={label} type="button" onClick={() => onSelectSection(target)} className="rounded-[1.1rem] border border-emerald-100 bg-[#f8fbfa] px-3 py-4 text-left transition-colors hover:bg-[#eff8f4]">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm">
                                        <Icon size={18} />
                                    </span>
                                    <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
                                </button>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-[1.65rem] border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen size={17} className="text-primary-700" />
                                <h3 className="text-xl font-bold text-slate-900">Learning Hub</h3>
                            </div>
                            <button type="button" onClick={() => onSelectSection('learninghub')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">Explore <ArrowRight size={14} /></button>
                        </div>

                        <div className="mt-4 rounded-[1.2rem] border border-emerald-200 bg-[linear-gradient(135deg,_#eefaf4_0%,_#e4f5f0_100%)] p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-700">{learningSnapshot.hero.subtitle}</p>
                            <p className="mt-2 text-xl font-bold text-slate-900">{learningSnapshot.hero.title}</p>
                            <div className="mt-3 h-2 rounded-full bg-white/70">
                                <div className="h-2 rounded-full bg-emerald-500 transition-[width]" style={{ width: `${learningSnapshot.hero.progress}%` }} />
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{learningSnapshot.hero.meta}</p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {learningSnapshot.items.map((item) => (
                                <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                            <span>{item.meta}</span>
                                            <span className={`rounded-full px-2 py-0.5 font-semibold ${item.tagShell}`}>{item.tag}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {learningSnapshot.stats.map((item) => (
                                <div key={item.label} className="rounded-xl border border-emerald-100 bg-[#f8fbfa] px-3 py-4 text-center">
                                    <p className={`text-2xl font-extrabold ${item.tone}`}>{item.value}</p>
                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                {calendarModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <form onSubmit={handleCalendarSubmit} className="w-full max-w-md rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-700">Financial calendar</p>
                                    <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Add money event</h3>
                                </div>
                                <button type="button" onClick={() => setCalendarModalOpen(false)} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500">
                                    Close
                                </button>
                            </div>
                            <div className="mt-5 space-y-4">
                                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                    Event name
                                    <input
                                        value={calendarForm.name}
                                        onChange={(event) => setCalendarForm((current) => ({ ...current, name: event.target.value }))}
                                        placeholder="e.g. SACCO deposit, rent, insurance renewal"
                                        required
                                        className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                                    />
                                </label>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                        Date
                                        <input
                                            type="date"
                                            value={calendarForm.date}
                                            onChange={(event) => setCalendarForm((current) => ({ ...current, date: event.target.value }))}
                                            required
                                            className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                        Type
                                        <select
                                            value={calendarForm.type}
                                            onChange={(event) => setCalendarForm((current) => ({ ...current, type: event.target.value }))}
                                            className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                                        >
                                            <option value="goal">Goal</option>
                                            <option value="income">Income</option>
                                            <option value="debt">Loan Payment</option>
                                            <option value="savings">Savings</option>
                                            <option value="investment">Investment</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center rounded-[1rem] bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                                Add event
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

const DesktopDashboardOverview = ({
    aiInsights,
    budgetScore,
    ctaButtons,
    currentScore,
    debtRatioScore,
    displayName,
    hasData,
    investmentRows,
    investmentScore,
    live,
    mobileActions,
    onSelectSection,
    onSignOut,
    palette,
    savingsRateScore,
    sync,
    spendingRows,
    stats,
    user,
}) => {
    const initials = String(displayName || 'SM')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'SM';
    const actionItems = [
        ...mobileActions,
        { label: 'Market Watch', icon: Landmark, target: 'marketwatch' },
    ];
    const weeklyBars = hasData && spendingRows.length
        ? spendingRows.slice(0, 7).map((row) => clamp(Number(row.percent || 0), 20, 88))
        : [0, 0, 0, 0, 0, 0, 0];
    const avgPerDay = live.spent > 0 ? Math.round(toNum(live.spent) / 30) : 0;
    const desktopNav = [
        { type: 'item', label: 'Home', icon: Home, target: 'overview', active: true },
        { type: 'label', label: 'Planning Tools' },
        { type: 'item', label: 'Budget Planner', icon: Search, target: 'budget' },
        { type: 'item', label: 'Debt Manager', icon: Bell, target: 'debt' },
        { type: 'item', label: 'Protection Planner', icon: Shield, target: 'protection' },
        { type: 'item', label: 'Retirement Planner', icon: FileText, target: 'retirement' },
        { type: 'item', label: 'Net Worth Tracker', icon: BookOpen, target: 'networth' },
        { type: 'label', label: 'Support' },
        { type: 'item', label: 'Help Center', icon: BookOpen, target: 'resourceshub' },
    ];
    const healthNotice = hasData
        ? `${palette.label}, ${displayName}. Keep up the progress.`
        : 'Complete setup to unlock your personalized health score.';
    const tierLabel = user?.tier || user?.subscription_tier || user?.plan || 'Basic';
    return (
        <div className="hidden min-h-screen bg-[#f8f8f8] lg:block">
            <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-[296px_minmax(0,1fr)_343px] overflow-hidden rounded-[40px] bg-[#f8f8f8]">
                <aside className="flex min-h-screen flex-col bg-white px-8 py-8">
                    <button type="button" onClick={() => onSelectSection('overview')} className="h-[61px] w-[102px]" aria-label="Dashboard home">
                        <img src={animatedLogo} alt="Shilingi Moves" className="h-full w-full object-contain" />
                    </button>

                    <nav className="mt-10 flex flex-1 flex-col gap-1">
                        {desktopNav.map((item, index) => {
                            if (item.type === 'label') {
                                return <p key={`${item.label}-${index}`} className="px-1 py-3 text-sm font-medium tracking-[-0.01em] text-[#acacac]">{item.label}</p>;
                            }

                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    onClick={() => onSelectSection(item.target)}
                                    className={`flex items-center gap-5 rounded-full p-3 text-left text-sm ${
                                        item.active ? 'font-bold text-[#0c6060]' : 'font-normal text-[#5e5f60] hover:bg-[#f8f8f8]'
                                    }`}
                                >
                                    <Icon size={22} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => { if (typeof window !== 'undefined') window.location.href = '/'; }}
                            className="flex items-center gap-5 rounded-full p-3 text-left text-sm font-normal text-[#5e5f60] hover:bg-[#f8f8f8]"
                        >
                            <BookOpen size={22} />
                            <span>Go to website</span>
                        </button>
                        {onSignOut && (
                            <button
                                type="button"
                                onClick={onSignOut}
                                className="flex items-center gap-5 rounded-full p-3 text-left text-sm font-normal text-[#b91c1c] hover:bg-[#fff5f5]"
                            >
                                <LogOut size={22} />
                                <span>Log Out</span>
                            </button>
                        )}
                    </nav>

                    <div className="mt-auto max-w-[232px]">
                        <p className="text-xs font-bold leading-5 tracking-[-0.02em] text-[#232e3d]">©Kaizen Publishers Limited All rights reserved.</p>
                        <p className="mt-1 text-[10px] leading-4 text-[#8e97ab]">
                            Shilingi Moves is a financial wellness platform and does not provide regulated financial advice.
                        </p>
                    </div>
                </aside>

                <main className="px-8 py-8">
                    <section>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-base text-[#111827]">{palette.label},</p>
                                <h1 className="mt-1 text-[32px] font-extrabold leading-none text-[#0c6060]">{displayName}</h1>
                                <p className="mt-2 text-base text-[#111827]">Your Financial Health score is {currentScore}/100</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-4 overflow-hidden rounded-[10px] bg-[linear-gradient(107deg,_#0c6060_0%,_#eabb3a_163%)] p-6 text-white">
                        <div className="flex items-start gap-4">
                            <p className="min-w-0 flex-1 text-base leading-6">Please complete your profile and planners to unlock personalized insights tailored to your life.</p>
                            <span className="text-xl leading-none text-white/85">x</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            {ctaButtons.map((button) => (
                                <button
                                    key={button.id}
                                    type="button"
                                    onClick={() => onSelectSection(button.target)}
                                    className={button.primary
                                        ? 'rounded-full bg-[#eabb3a] px-3 py-2 text-sm font-semibold text-[#111827]'
                                        : 'rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white'}
                                >
                                    {button.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="mt-3 grid grid-cols-4 gap-[5px]">
                        {stats.map(({ icon: Icon, label, value }) => (
                            <article key={label} className="min-w-0 rounded-[10px] bg-white px-2 py-3 shadow-[0_0_1px_rgba(0,0,0,0.07)]">
                                <Icon size={16} className="text-[#eabb3a]" />
                                <p className="mt-2 text-xs text-[#232e3d]">{label.replace('Total ', '').replace('Monthly ', '').replace('Spent - Current', 'Expenditure')}</p>
                                <p className="mt-2 truncate text-base font-semibold text-[#0c6060]">{value}</p>
                            </article>
                        ))}
                    </section>

                    <section className="mt-4">
                        <h2 className="text-sm font-semibold text-[#0c6060]">What would you like to do today?</h2>
                        <div className="mt-4 flex items-center justify-between rounded-[10px] p-2">
                            {actionItems.map(({ label, icon: Icon, target }) => (
                                <button key={label} type="button" onClick={() => onSelectSection(target)} className="flex w-[76px] flex-col items-center gap-2 text-center">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e9eeee] text-[#0c6060]">
                                        <Icon size={18} />
                                    </span>
                                    <span className="text-xs font-medium leading-tight tracking-[-0.01em] text-[#262626]">{label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="mt-7">
                        <DesktopSectionHeader title="Spending Breakdown" action="View More" onAction={() => onSelectSection('budget')} />
                        <div className="mt-2 rounded-[10px] bg-white pt-4">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#0c6060]">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-[#6a7282]"><ChevronLeft size={16} /></span>
                                <span className="rounded-[14px] bg-[#fbffff] px-2 py-1.5">This Week</span>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-[#6a7282]"><ChevronRight size={16} /></span>
                            </div>
                            <div className="mt-5 flex h-40 items-end justify-between px-3">
                                {weeklyBars.map((height, index) => (
                                    <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                                        <span
                                            className={`w-[58px] rounded-t-[10px] ${index === 5 ? 'bg-[#eabb3a]' : 'bg-[#ffecb8]'}`}
                                            style={{ height: `${height}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 px-3 text-center text-xs font-medium text-[#6a7282]">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
                            </div>
                            <div className="mt-4 flex items-end justify-between border-t border-[#f3f4f6] px-4 py-3">
                                <div>
                                    <p className="text-xs text-[#6a7282]">Average per day</p>
                                    <p className="text-lg font-extrabold text-[#232e3d]">{fmtKES(avgPerDay)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#6a7282]">vs last week</p>
                                    <p className="text-lg font-extrabold text-[#232e3d]">0%</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <aside className="min-h-screen bg-white px-4 py-8">
                    <div className="flex items-center justify-end gap-2">
                        <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#232e3d]" aria-label="Notifications">
                            <Bell size={20} />
                            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#ea3434]" />
                        </button>
                        <button type="button" onClick={() => onSelectSection('user')} className="flex w-60 items-center gap-3 py-4 text-left">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eabb3a] text-sm font-bold text-[#0c6060]">{initials}</span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px] font-bold leading-5 text-[#232e3d]">{displayName}</span>
                                <span className="block truncate text-[15px] leading-5 text-[#8b98a5]">{tierLabel}</span>
                            </span>
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <label className="mt-2 flex h-11 items-center gap-3 rounded-full bg-[#e5e5e5] px-4 text-[#8b98a5]">
                        <Search size={17} />
                        <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8b98a5]" placeholder="Search" />
                    </label>

                    <DesktopRailCard title="Financial Health Score" action="View More" onAction={() => onSelectSection('health')}>
                        <DesktopNotice>{healthNotice}</DesktopNotice>
                        <div className="mt-3 flex items-center gap-3">
                            <MobileGauge score={currentScore} amount={fmtKES(live.savings || live.netWorth)} />
                            <div className="min-w-0 flex-1 space-y-2">
                                <LegendRow label="Savings Rate" value={Math.round(savingsRateScore)} color="bg-[#0c6060]" />
                                <LegendRow label="Debt Ratio" value={Math.round(debtRatioScore)} color="bg-[#eabb3a]" />
                                <LegendRow label="Budget" value={Math.round(budgetScore)} color="bg-[#f97316]" />
                                <LegendRow label="Investments" value={Math.round(investmentScore)} color="bg-[#2563eb]" />
                            </div>
                        </div>
                    </DesktopRailCard>

                    <DesktopRailCard title="Investment Portfolio" action="View More" onAction={() => onSelectSection('investments')}>
                        <DesktopNotice>{hasData ? 'Your portfolio mix is ready for review.' : 'Complete investment setup to track your portfolio.'}</DesktopNotice>
                        <div className="mt-4 flex items-center gap-3">
                            <MobilePie />
                            <div className="min-w-0 flex-1 space-y-2">
                                {investmentRows.length ? investmentRows.map((row, index) => (
                                    <LegendRow
                                        key={`${row.name}-${index}`}
                                        label={row.name}
                                        value={row.change || row.value}
                                        color={['bg-[#0c6060]', 'bg-[#f97316]', 'bg-[#eabb3a]', 'bg-[#2563eb]'][index % 4]}
                                        valueClassName={row.tone}
                                    />
                                )) : (
                                    <p className="text-xs leading-5 text-[#6a7282]">No investment data yet.</p>
                                )}
                            </div>
                        </div>
                    </DesktopRailCard>

                    <section className="mt-5 px-4">
                        <h2 className="text-base font-bold text-[#232e3d]">Insights</h2>
                        <p className="mt-1 text-xs text-[#8e97ab]">Analytic breakdown of where your money goes</p>
                        <div className="mt-3 space-y-3">
                            {aiInsights.map(({ title, description, icon: Icon, shell, iconShell, titleTone }) => (
                                <button key={title} type="button" onClick={() => onSelectSection('budget')} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left ${shell}`}>
                                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconShell}`}>
                                        <Icon size={17} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className={`block text-sm font-semibold ${titleTone}`}>{title}</span>
                                        <span className="mt-1 block text-xs leading-4 text-[#4a5565]">{description}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

const DesktopSectionHeader = ({ title, action, onAction }) => (
    <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#232e3d]">{title}</h2>
        <button type="button" onClick={onAction} className="text-base font-semibold text-[#0c6060]">{action}</button>
    </div>
);

const DesktopRailCard = ({ title, action, onAction, children }) => (
    <section className="mt-5 rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[#232e3d]">{title}</h2>
            <button type="button" onClick={onAction} className="text-xs font-semibold text-[#0c6060]">{action}</button>
        </div>
        {children}
    </section>
);

const DesktopNotice = ({ children }) => (
    <div className="mt-4 rounded-full bg-[linear-gradient(124deg,_rgba(234,187,58,0.44)_0%,_rgba(234,187,58,0)_93%)] px-4 py-2 text-xs text-[#232e3d]">
        {children}
    </div>
);

const MobileDashboardOverview = ({
    aiInsights,
    ctaButtons,
    currentScore,
    displayName,
    hasData,
    investmentRows,
    live,
    mobileActions,
    onSelectSection,
    onSignOut,
    palette,
    savingsRateScore,
    debtRatioScore,
    budgetScore,
    investmentScore,
    sync,
    spendingRows,
    stats,
}) => {
    const totalSpent = toNum(live.spent);
    const weeklyBars = hasData && spendingRows.length
        ? spendingRows.slice(0, 7).map((row) => clamp(Number(row.percent || 0), 18, 88))
        : [0, 0, 0, 0, 0, 0, 0];
    const avgPerDay = totalSpent > 0 ? Math.round(totalSpent / 30) : 0;
    const healthMessage = hasData
        ? `${palette.label}, ${displayName}. Keep building your money picture.`
        : 'Complete setup to unlock your personalized health score.';
    const transaction = live.tx[0] || null;
    return (
        <div className="sm:hidden">
            <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f8f8f8] px-4 pb-28 pt-4">
                <section className="mt-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-[#111827]">{palette.label},</p>
                            <h1 className="mt-0.5 truncate text-lg font-extrabold leading-tight text-[#0c6060]">{displayName}</h1>
                            <p className="mt-0.5 text-xs text-[#111827]">Your Financial Health score is {currentScore}/100</p>
                        </div>
                    </div>
                </section>

                <section className="mt-4 overflow-hidden rounded-[10px] bg-[linear-gradient(104deg,_#0c6060_0%,_#eabb3a_163%)] p-4 text-white">
                    <div className="flex items-start gap-2">
                        <p className="min-w-0 flex-1 text-xs leading-5">Please complete your profile and planners to unlock personalized insights tailored to your life.</p>
                        <span className="text-base leading-none text-white/80">x</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {ctaButtons.map((button) => (
                            <button
                                key={button.id}
                                type="button"
                                onClick={() => onSelectSection(button.target)}
                                className={button.primary
                                    ? 'rounded-full bg-[#eabb3a] px-3 py-2 text-[10px] font-semibold text-[#111827]'
                                    : 'rounded-full bg-white/20 px-3 py-2 text-[10px] font-semibold text-white'}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mt-4 grid grid-cols-4 gap-[5px]">
                    {stats.map(({ icon: Icon, label, value }) => (
                        <article key={label} className="min-w-0 rounded-[10px] bg-white p-2 shadow-[0_0_1px_rgba(0,0,0,0.07)]">
                            <Icon size={9} className="text-[#eabb3a]" />
                            <p className="mt-1 text-[8px] leading-tight text-[#232e3d]">{label.replace('Total ', '').replace('Monthly ', '').replace('Spent - Current', 'Expenditure')}</p>
                            <p className="mt-1 truncate text-[10px] font-semibold leading-tight text-[#0c6060]">{value}</p>
                        </article>
                    ))}
                </section>

                <h2 className="mt-4 text-sm font-semibold text-[#0c6060]">What would you like to do today?</h2>
                <section className="mt-3 grid grid-cols-4 gap-2 rounded-[10px] p-2">
                    {mobileActions.map(({ label, icon: Icon, target }) => (
                        <button key={label} type="button" onClick={() => onSelectSection(target)} className="flex min-w-0 flex-col items-center gap-2 text-center">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0c6060] text-white">
                                <Icon size={16} />
                            </span>
                            <span className="text-[11px] font-medium leading-tight text-[#262626]">{label}</span>
                        </button>
                    ))}
                </section>

                <MobileCard title="Financial Health Score" action="View More" onAction={() => onSelectSection('health')}>
                    <MobileNotice>{healthMessage}</MobileNotice>
                    <div className="mt-4 flex items-center gap-4">
                        <MobileGauge score={currentScore} amount={fmtKES(live.savings || live.netWorth)} />
                        <div className="min-w-0 flex-1 space-y-2">
                            <LegendRow label="Savings Rate" value={Math.round(savingsRateScore)} color="bg-[#0c6060]" />
                            <LegendRow label="Debt Ratio" value={Math.round(debtRatioScore)} color="bg-[#eabb3a]" />
                            <LegendRow label="Budget" value={Math.round(budgetScore)} color="bg-[#f97316]" />
                            <LegendRow label="Investments" value={Math.round(investmentScore)} color="bg-[#2563eb]" />
                        </div>
                    </div>
                </MobileCard>

                <MobileSectionHeader title="Spending Breakdown" action="View More" onAction={() => onSelectSection('budget')} />
                <section className="mt-2 rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-center gap-5 text-xs font-semibold text-[#0c6060]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-[#6a7282]"><ChevronLeft size={14} /></span>
                        <span>This Week</span>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f4f6] text-[#6a7282]"><ChevronRight size={14} /></span>
                    </div>
                    <div className="mt-4 flex h-24 items-end gap-2">
                        {weeklyBars.map((height, index) => (
                            <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                                <span
                                    className={`w-full rounded-t-md ${index === 5 ? 'bg-[#eabb3a]' : 'bg-[#fde7aa]'}`}
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 grid grid-cols-7 text-center text-[9px] text-[#6a7282]">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <p className="text-[11px] text-[#6a7282]">Average per day</p>
                            <p className="text-lg font-extrabold text-[#232e3d]">{fmtKES(avgPerDay)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-[#6a7282]">vs last week</p>
                            <p className="text-lg font-extrabold text-[#232e3d]">0%</p>
                        </div>
                    </div>
                </section>

                <MobileSectionHeader title="Recent Transactions" action="View More" onAction={() => onSelectSection('user')} />
                <section className="mt-2 rounded-[20px] bg-white p-4">
                    <MobileNotice>Let's remember to live within our means.</MobileNotice>
                    {transaction ? (
                        <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#eabb3a] text-[#0c6060]">
                                    <Wallet size={16} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-[#232e3d]">{transaction.category}</p>
                                    <p className="truncate text-sm font-semibold text-[#0c6060]">{transaction.name}</p>
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className={`text-sm font-semibold ${transaction.tone}`}>{transaction.amount}</p>
                                <p className="text-xs text-[#232e3d]">{transaction.when}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 rounded-[10px] bg-[#f8f8f8] px-3 py-3 text-xs leading-5 text-[#6a7282]">
                            No transactions yet. Add income or expenses to see recent activity.
                        </p>
                    )}
                </section>

                <MobileCard title="Investment Portfolio" action="View More" onAction={() => onSelectSection('investments')}>
                    <MobileNotice>{hasData ? 'Your portfolio mix is ready for review.' : 'Complete investment setup to track your portfolio.'}</MobileNotice>
                    <div className="mt-4 flex items-center gap-3">
                        <MobilePie />
                        <div className="min-w-0 flex-1 space-y-2">
                            {investmentRows.length ? investmentRows.map((row, index) => (
                                <LegendRow
                                    key={`${row.name}-${index}`}
                                    label={row.name}
                                    value={row.change || row.value}
                                    color={['bg-[#0c6060]', 'bg-[#f97316]', 'bg-[#eabb3a]', 'bg-[#2563eb]'][index % 4]}
                                    valueClassName={row.tone}
                                />
                            )) : (
                                <p className="text-xs leading-5 text-[#6a7282]">No investment data yet.</p>
                            )}
                        </div>
                    </div>
                </MobileCard>

                <section className="mt-5">
                    <h2 className="text-base font-bold text-[#232e3d]">Insights</h2>
                    <p className="mt-1 text-xs text-[#8e97ab]">Analytic breakdown of where your money goes</p>
                    <div className="mt-3 space-y-3">
                        {aiInsights.map(({ title, description, icon: Icon, shell, iconShell, titleTone }) => (
                            <button key={title} type="button" onClick={() => onSelectSection('budget')} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left ${shell}`}>
                                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconShell}`}>
                                    <Icon size={17} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={`block text-sm font-semibold ${titleTone}`}>{title}</span>
                                    <span className="mt-1 block text-xs leading-4 text-[#4a5565]">{description}</span>
                                </span>
                                <ChevronRight size={16} className="shrink-0 text-[#8e97ab]" />
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const MobileSectionHeader = ({ title, action, onAction }) => (
    <div className="mt-5 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-[#232e3d]">{title}</h2>
        <button type="button" onClick={onAction} className="text-xs font-semibold text-[#0c6060]">{action}</button>
    </div>
);

const MobileCard = ({ title, action, onAction, children }) => (
    <section className="mt-4 rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[#232e3d]">{title}</h2>
            <button type="button" onClick={onAction} className="text-xs font-semibold text-[#0c6060]">{action}</button>
        </div>
        {children}
    </section>
);

const MobileNotice = ({ children }) => (
    <div className="mt-4 rounded-full bg-[linear-gradient(124deg,_rgba(234,187,58,0.44)_0%,_rgba(234,187,58,0)_93%)] px-4 py-2 text-xs text-[#232e3d]">
        {children}
    </div>
);

const LegendRow = ({ label, value, color, valueClassName = 'text-[#0c6060]' }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
        <span className="min-w-0 flex-1 truncate text-[#232e3d]">{label}</span>
        <span className={`shrink-0 ${valueClassName}`}>{value}{typeof value === 'number' ? '%' : ''}</span>
    </div>
);

const MobileGauge = ({ score, amount }) => {
    const safeScore = clamp(Number(score || 0), 0, 100);
    const radius = 42;
    const circumference = Math.PI * radius;
    const dashOffset = circumference - (safeScore / 100) * circumference;

    return (
        <div className="relative h-[112px] w-[132px] shrink-0">
            <svg viewBox="0 0 132 112" className="h-full w-full">
                <path d="M24 82 A42 42 0 0 1 108 82" fill="none" stroke="#f3f4f6" strokeWidth="10" strokeLinecap="round" />
                <path
                    d="M24 82 A42 42 0 0 1 108 82"
                    fill="none"
                    stroke="#eabb3a"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <div className="absolute inset-x-0 top-9 text-center">
                <p className="text-2xl font-bold text-[#232e3d]">{safeScore}%</p>
                <p className="mt-1 text-xs text-[#232e3d]">{amount}</p>
            </div>
        </div>
    );
};

const MobilePie = () => (
    <div className="h-28 w-28 shrink-0 rounded-full bg-[conic-gradient(#0c6060_0_39%,_#f97316_39%_67%,_#eabb3a_67%_90%,_#2563eb_90%_100%)] p-5">
        <div className="h-full w-full rounded-full bg-white" />
    </div>
);

const Panel = ({ title, action, onAction, children }) => (
    <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <button type="button" onClick={onAction} className="text-xs font-semibold text-primary-700">{action}</button>
        </div>
        <div className="space-y-2.5">{children}</div>
    </article>
);

const DashboardEmptyState = ({ title, description }) => (
    <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
);

const HeroBadge = ({ label, value, suffix = '' }) => (
    <div className="rounded-[1rem] border border-white/18 bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
        <p className="text-xl font-extrabold leading-none text-white">{value}{suffix}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/78">{label}</p>
    </div>
);

const BreakdownItem = ({ label, value, tone }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">{label}</p>
        <p className={`mt-1 text-[1.05rem] font-extrabold ${tone}`}>{value < 0 ? `-${fmtKES(Math.abs(value)).replace('KES ', 'KES ')}` : fmtKES(value)}</p>
    </div>
);

const getHealthLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
};

const CircularHealth = ({ score }) => {
    const safeScore = Math.max(0, Math.min(100, score));
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;

    return (
        <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#e6f3ee" strokeWidth="8" fill="none" />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#38a38b"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-[1.7rem] font-extrabold text-primary-800">{safeScore}</p>
                <p className="text-xs text-slate-400">/100</p>
            </div>
        </div>
    );
};

const HealthBar = ({ label, value, color, textColor, inverse = false }) => {
    const safeValue = Math.max(0, Math.min(100, inverse ? 100 - value : value));
    return (
        <div className="grid grid-cols-[92px_1fr_28px] items-center gap-3 text-sm">
            <p className="text-slate-600">{label}</p>
            <div className="h-1.5 rounded-full bg-slate-200">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${safeValue}%` }} />
            </div>
            <p className={`text-right text-xs font-semibold ${textColor}`}>{Math.round(safeValue)}</p>
        </div>
    );
};

const SpendingDonut = ({ rows }) => {
    const normalizedRows = (rows || []).slice(0, 5).map((row, index) => ({
        ...row,
        percent: Math.max(0, Math.min(100, Number(row.percent || 0))),
        key: `${row.label}-${index}`,
    }));
    const total = normalizedRows.reduce((sum, row) => sum + row.percent, 0) || 1;
    const totalAmount = (rows || []).reduce((sum, row) => sum + toNum(row.rawAmount ?? String(row.amount || '').replace(/[^\d.-]/g, '')), 0);
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const colors = {
        'bg-emerald-600': '#14986b',
        'bg-blue-600': '#2d73d5',
        'bg-amber-500': '#f5a623',
        'bg-rose-500': '#ef4444',
        'bg-violet-600': '#7c3aed',
    };

    return (
        <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#eef4f1" strokeWidth="14" fill="none" />
                {normalizedRows.map((row, index) => {
                    const segment = (row.percent / total) * circumference;
                    const currentOffset = normalizedRows
                        .slice(0, index)
                        .reduce((sum, previousRow) => sum + ((previousRow.percent / total) * circumference), 0);
                    return (
                        <circle
                            key={row.key}
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke={colors[row.color] || '#177261'}
                            strokeWidth="14"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${segment} ${circumference}`}
                            strokeDashoffset={-currentOffset}
                        />
                    );
                })}
            </svg>
            <div className="absolute text-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">KES</p>
                <p className="text-lg font-extrabold text-primary-800">{(totalAmount / 1000).toFixed(1)}K</p>
            </div>
        </div>
    );
};

const getBudgetTone = (percent) => {
    if (percent >= 100) return 'text-rose-500';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 30) return 'text-amber-500';
    return 'text-emerald-600';
};

export default DashboardOverview;

