const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (value) => String(value || '').toLowerCase();

const sumBy = (items = [], getter) => items.reduce((sum, item) => sum + toNumber(getter(item)), 0);

const formatKES = (value) => `KES ${Math.round(toNumber(value)).toLocaleString('en-KE')}`;

const tones = {
    emerald: 'border-emerald-200 bg-[#eef8f3] text-[#0d6648]',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    blue: 'border-[#b8d0ff] bg-[#eef4ff] text-[#1f55c7]',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    primary: 'border-primary-200 bg-primary-50 text-primary-700',
};

const isProtectionAsset = (asset) => {
    const source = normalize(`${asset?.name} ${asset?.categoryName} ${asset?.category_name}`);
    return ['insurance', 'cover', 'policy', 'medical', 'life', 'protection'].some((word) => source.includes(word));
};

const isRetirementAsset = (asset) => {
    const source = normalize(`${asset?.name} ${asset?.categoryName} ${asset?.category_name}`);
    return ['retirement', 'pension', 'nssf'].some((word) => source.includes(word));
};

const isInvestmentAsset = (asset) => !isProtectionAsset(asset) && !isRetirementAsset(asset);

export const buildFinancialSnapshot = ({ profile = {}, live = {}, healthScore = 0 }) => {
    const raw = live.raw || {};
    const budgets = raw.budgets || [];
    const expenses = raw.expenses || [];
    const goals = raw.goals || [];
    const debts = raw.debts || [];
    const assets = raw.investments || [];
    const protectionAssets = assets.filter(isProtectionAsset);
    const retirementAssets = assets.filter(isRetirementAsset);
    const investmentAssets = assets.filter(isInvestmentAsset);
    const income = toNumber(live.income || profile.monthly_income);
    const spent = toNumber(live.spent);
    const savings = toNumber(live.savings);
    const totalDebt = sumBy(debts, (debt) => debt.balance);
    const debtPayments = sumBy(debts, (debt) => debt.minimumPayment);
    const investmentValue = sumBy(investmentAssets, (asset) => asset.currentValue);
    const protectionCover = sumBy(protectionAssets, (asset) => asset.currentValue);
    const monthlyPremiums = sumBy(protectionAssets, (asset) => asset.purchaseValue);
    const retirementValue = sumBy(retirementAssets, (asset) => asset.currentValue);
    const retirementMonthly = sumBy(retirementAssets, (asset) => asset.purchaseValue);
    const budgeted = sumBy(budgets, (budget) => budget.budgeted_amount || budget.allocated_amount || budget.amount || budget.target_amount);
    const budgetSpent = sumBy(budgets, (budget) => budget.spent_amount || budget.actual_spent || budget.total_spent || budget.spent);
    const expenseTotal = spent || sumBy(expenses, (expense) => Math.abs(toNumber(expense.amount)));
    const monthlySurplus = income - expenseTotal - debtPayments - retirementMonthly - monthlyPremiums;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const debtPressure = income > 0 ? (debtPayments / income) * 100 : 0;
    const budgetUsage = budgeted > 0 ? (budgetSpent / budgeted) * 100 : 0;
    const dependantCount = toNumber(profile.dependants || profile.dependents || profile.children);

    return {
        profile,
        healthScore: toNumber(healthScore),
        budget: {
            count: budgets.length,
            spent: expenseTotal,
            budgeted,
            budgetUsage,
            surplus: monthlySurplus,
        },
        debt: {
            count: debts.length,
            total: totalDebt,
            monthlyPayments: debtPayments,
            pressure: debtPressure,
            highInterestCount: debts.filter((debt) => toNumber(debt.interestRate) >= 15).length,
        },
        investments: {
            count: investmentAssets.length,
            total: investmentValue,
        },
        protection: {
            count: protectionAssets.length,
            cover: protectionCover,
            monthlyPremiums,
            hasMedical: protectionAssets.some((asset) => normalize(asset.name).includes('medical') || normalize(asset.categoryName).includes('medical')),
            hasLife: protectionAssets.some((asset) => normalize(asset.name).includes('life') || normalize(asset.categoryName).includes('life')),
        },
        retirement: {
            count: retirementAssets.length,
            total: retirementValue,
            monthlyContribution: retirementMonthly,
        },
        netWorth: {
            total: toNumber(live.netWorth),
            savingsRate,
        },
        goals: {
            count: goals.length,
        },
        dependants: dependantCount,
    };
};

export const buildAdvisorActions = (snapshot) => {
    const actions = [];
    const addAction = (action) => actions.push(action);

    if (!snapshot.profile?.monthly_income && snapshot.budget.count === 0 && snapshot.debt.count === 0 && snapshot.investments.count === 0) {
        addAction({
            title: 'Start with your money profile',
            description: 'Complete your income, goals, dependants, and risk profile so every planner can give personal guidance.',
            badge: 'First step',
            target: 'user',
            priority: 100,
            tone: 'emerald',
        });
    }

    if (snapshot.budget.count === 0) {
        addAction({
            title: 'Create a monthly budget',
            description: 'Budget data tells Shilingi how much is safe for debt payments, investments, protection, and retirement.',
            badge: 'Foundation',
            target: 'budget',
            priority: 92,
            tone: 'blue',
        });
    } else if (snapshot.budget.budgetUsage >= 100 || snapshot.budget.surplus < 0) {
        addAction({
            title: 'Stabilise spending first',
            description: `Your tracked monthly surplus is ${snapshot.budget.surplus < 0 ? 'negative' : 'tight'}. Adjust budget categories before increasing long-term commitments.`,
            badge: 'Action needed',
            target: 'budget',
            priority: 96,
            tone: 'rose',
        });
    }

    if (snapshot.debt.total > 0 && (snapshot.debt.pressure >= 30 || snapshot.debt.highInterestCount > 0)) {
        addAction({
            title: 'Reduce debt pressure',
            description: `Debt payments are using ${Math.round(snapshot.debt.pressure)}% of monthly income. Prioritise high-cost debt before adding more risky investments.`,
            badge: 'Priority',
            target: 'debt',
            priority: 98,
            tone: 'rose',
        });
    }

    if ((snapshot.dependants > 0 || snapshot.debt.total > 0) && (!snapshot.protection.hasMedical || !snapshot.protection.hasLife)) {
        addAction({
            title: 'Close protection gaps',
            description: `You have ${snapshot.dependants || 'tracked'} dependants/debt exposure. Review medical, life, and disability protection before optional covers.`,
            badge: 'Risk gap',
            target: 'protection',
            priority: 90,
            tone: 'amber',
        });
    }

    if (snapshot.budget.surplus > 0 && snapshot.investments.count === 0) {
        addAction({
            title: 'Start an investment plan',
            description: `You appear to have room to invest. Use the investment planner to choose products that match your risk profile.`,
            badge: 'Opportunity',
            target: 'investments',
            priority: 78,
            tone: 'emerald',
        });
    }

    if (snapshot.retirement.count === 0 || snapshot.retirement.monthlyContribution <= 0) {
        addAction({
            title: 'Set your retirement baseline',
            description: 'Add NSSF, pension, or retirement savings so Shilingi can show whether your future income target is on track.',
            badge: 'Long-term',
            target: 'retirement',
            priority: 70,
            tone: 'violet',
        });
    }

    if (actions.length === 0) {
        addAction({
            title: 'Review your next best move',
            description: 'Your core planners have data. Review the dashboard monthly to rebalance budget, debt, investments, cover, and retirement.',
            badge: 'On track',
            target: 'overview',
            priority: 60,
            tone: 'emerald',
        });
    }

    return actions.sort((a, b) => b.priority - a.priority).slice(0, 4);
};

export const buildInvestmentInsights = (snapshot, options = {}) => {
    const {
        allocation = [],
        targetAmount = 0,
        riskAppetite = 'Moderate',
        horizon = '',
        preferredProducts = '',
    } = options;
    const insights = [];
    const dominant = allocation[0];

    if (snapshot.debt.total > 0 && (snapshot.debt.pressure >= 30 || snapshot.debt.highInterestCount > 0)) {
        insights.push({
            title: 'Debt First Before More Risk',
            text: `Debt repayments are using ${Math.round(snapshot.debt.pressure)}% of monthly income. Keep investing steady, but prioritise expensive debt before increasing risky products.`,
            tone: tones.rose,
        });
    }

    if ((snapshot.dependants > 0 || snapshot.debt.total > 0) && (!snapshot.protection.hasMedical || !snapshot.protection.hasLife)) {
        insights.push({
            title: 'Protect The Plan',
            text: 'Before increasing long-term investments, review medical, life, and disability cover so emergencies do not force you to liquidate assets.',
            tone: tones.amber,
        });
    }

    if (dominant && dominant.percent >= 45) {
        insights.push({
            title: 'Rebalancing Opportunity',
            text: `${dominant.label} is at ${dominant.percent.toFixed(0)}% of your portfolio. Diversify toward underweight products that still match your ${riskAppetite} profile.`,
            tone: tones.primary,
        });
    }

    if (snapshot.budget.count > 0 && snapshot.budget.surplus <= 0) {
        insights.push({
            title: 'Create Budget Room First',
            text: 'Your tracked surplus is tight. Free up cash in the budget before setting a bigger investment top-up.',
            tone: tones.amber,
        });
    }

    if (targetAmount > snapshot.investments.total) {
        insights.push({
            title: 'Goal Pace Check',
            text: `You are working toward ${formatKES(targetAmount)}. Use products aligned to a ${horizon || 'clear'} horizon and review top-ups monthly.`,
            tone: tones.blue,
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Portfolio Review',
            text: `Your investment base is active. Compare ${preferredProducts || 'fixed income, funds, and equities'} against your risk profile before the next top-up.`,
            tone: tones.emerald,
        });
    }

    return insights.slice(0, 4);
};

export const buildProtectionInsights = (snapshot, options = {}) => {
    const {
        missingPolicies = [],
        coverageTotal = 0,
        recommendedCover = 0,
        dependantCount = snapshot.dependants,
        totalDebt = snapshot.debt.total,
        hasCarPolicy = false,
    } = options;
    const insights = [];
    const coverRatio = recommendedCover > 0 ? (coverageTotal / recommendedCover) * 100 : 0;

    if (missingPolicies.includes('Medical Cover')) {
        insights.push({
            title: 'Medical Cover Comes First',
            text: 'Medical cover protects the budget from hospital bills and should be treated as a core policy, not an optional add-on.',
            tone: tones.rose,
        });
    }

    if ((dependantCount > 0 || totalDebt > 0) && missingPolicies.includes('Life Insurance')) {
        insights.push({
            title: 'Life Cover Gap',
            text: `You have ${dependantCount || 'family'} dependants or debt exposure. Life cover should be sized against dependants, loans, and household expenses.`,
            tone: tones.amber,
        });
    }

    if (missingPolicies.includes('Disability Cover')) {
        insights.push({
            title: 'Income Protection Gap',
            text: 'Disability or income protection keeps essential bills paid if income stops unexpectedly.',
            tone: tones.rose,
        });
    }

    if (recommendedCover > 0 && coverRatio < 70) {
        insights.push({
            title: 'Recommended Cover Shortfall',
            text: `Current cover is about ${Math.round(coverRatio)}% of the recommended value. Increase core cover before adding niche policies.`,
            tone: tones.primary,
        });
    }

    if (snapshot.budget.count > 0 && snapshot.budget.surplus <= 0 && snapshot.protection.monthlyPremiums > 0) {
        insights.push({
            title: 'Premium Affordability Check',
            text: 'Your budget surplus is tight. Compare annual payments, family bundles, or adjusted excesses before increasing premiums.',
            tone: tones.amber,
        });
    }

    if (hasCarPolicy) {
        insights.push({
            title: 'Compare Before Renewal',
            text: 'Review motor insurance before renewal so you can compare premium, excess, claims support, and benefits.',
            tone: tones.blue,
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Protection Review',
            text: 'Your protection plan has a base. Review dependants, debt, medical needs, and premium affordability every quarter.',
            tone: tones.emerald,
        });
    }

    return insights.slice(0, 4);
};

export const buildRetirementInsights = (snapshot, options = {}) => {
    const {
        projectedPot = 0,
        fireNumber = 0,
        targetYear = '',
        monthlyContribution = snapshot.retirement.monthlyContribution,
        earlyRetirementAge = 0,
    } = options;
    const insights = [];
    const retirementGap = Math.max(toNumber(fireNumber) - toNumber(projectedPot), 0);

    if (monthlyContribution <= 0) {
        insights.push({
            title: 'Set A Monthly Baseline',
            text: 'Add NSSF, pension, or personal retirement savings so the planner can calculate a realistic retirement path.',
            tone: tones.rose,
        });
    }

    if (snapshot.debt.total > 0 && snapshot.debt.pressure >= 30) {
        insights.push({
            title: 'Balance Debt And Retirement',
            text: `Debt repayments are using ${Math.round(snapshot.debt.pressure)}% of income. Keep a retirement baseline, then attack costly debt before increasing contributions.`,
            tone: tones.amber,
        });
    }

    if (retirementGap > 0) {
        insights.push({
            title: 'Retirement Gap To Close',
            text: `Projected retirement value is short by about ${formatKES(retirementGap)}. Increase contributions, extend the target date, or improve return assumptions carefully.`,
            tone: tones.primary,
        });
    }

    if (snapshot.budget.count > 0 && snapshot.budget.surplus <= 0) {
        insights.push({
            title: 'Budget Room Needed',
            text: 'Your budget has limited room for a higher retirement contribution. Start by adjusting flexible spending categories.',
            tone: tones.amber,
        });
    }

    if ((snapshot.dependants > 0 || snapshot.debt.total > 0) && (!snapshot.protection.hasMedical || !snapshot.protection.hasLife)) {
        insights.push({
            title: 'Protect Retirement Progress',
            text: 'Close key protection gaps so emergencies do not interrupt retirement contributions or force early withdrawals.',
            tone: tones.blue,
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Retirement Review',
            text: `Your retirement plan is active for ${targetYear || 'the selected target year'}. Review contribution growth, investment mix, and tax relief each year.`,
            tone: tones.emerald,
        });
    }

    if (earlyRetirementAge > 0 && monthlyContribution > 0) {
        insights.push({
            title: 'FIRE Pace Check',
            text: `At the current pace, early independence may be possible around age ${earlyRetirementAge}. Validate this against debt, dependants, and protection cover.`,
            tone: tones.blue,
        });
    }

    return insights.slice(0, 4);
};

const gradeForScore = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 45) return 'D';
    return 'E';
};

const statusForScore = (score) => {
    if (score >= 80) return { status: 'EXCELLENT', status_display: 'Excellent' };
    if (score >= 65) return { status: 'GOOD', status_display: 'Good' };
    if (score >= 45) return { status: 'FAIR', status_display: 'Fair' };
    return { status: 'NEEDS_ATTENTION', status_display: 'Needs Attention' };
};

const clampScore = (value) => Math.min(100, Math.max(0, Math.round(toNumber(value))));

const component = ({ key, name, description, score, weight, data = {} }) => ({
    key,
    name,
    description,
    score: clampScore(score),
    weight,
    grade: gradeForScore(score),
    data,
});

export const buildDerivedFinancialHealth = ({ profile = {}, live = {}, healthScore = 0 } = {}) => {
    const snapshot = buildFinancialSnapshot({ profile, live, healthScore });
    const hasPlannerData = Boolean(
        snapshot.profile?.monthly_income ||
        snapshot.budget.count ||
        snapshot.debt.count ||
        snapshot.investments.count ||
        snapshot.protection.count ||
        snapshot.retirement.count ||
        snapshot.netWorth.total ||
        snapshot.goals.count
    );

    const budgetUsage = snapshot.budget.budgetUsage;
    const budgetScore = snapshot.budget.count
        ? clampScore(100 - Math.max(0, budgetUsage - 85) * 1.6 + (snapshot.budget.surplus > 0 ? 8 : -10))
        : 35;
    const savingsScore = snapshot.netWorth.savingsRate > 0
        ? clampScore(snapshot.netWorth.savingsRate >= 20 ? 90 : 45 + snapshot.netWorth.savingsRate * 2)
        : (snapshot.goals.count ? 55 : 30);
    const debtScore = snapshot.debt.total <= 0
        ? 88
        : clampScore(100 - snapshot.debt.pressure * 1.8 - snapshot.debt.highInterestCount * 12);
    const investmentScore = snapshot.investments.count
        ? clampScore(58 + Math.min(snapshot.investments.count * 8, 24) + (snapshot.investments.total > 0 ? 10 : 0))
        : 32;
    const protectionScore = snapshot.protection.count
        ? clampScore(45 + (snapshot.protection.hasMedical ? 22 : 0) + (snapshot.protection.hasLife ? 18 : 0) + Math.min(snapshot.protection.count * 4, 15))
        : ((snapshot.dependants > 0 || snapshot.debt.total > 0) ? 28 : 50);
    const retirementScore = snapshot.retirement.monthlyContribution > 0
        ? clampScore(55 + Math.min(snapshot.retirement.monthlyContribution / Math.max(snapshot.profile?.monthly_income || 1, 1) * 180, 35))
        : 32;

    const components = [
        component({
            key: 'budget',
            name: 'Budget & Spending',
            description: 'How well your planned budget matches actual spending.',
            score: budgetScore,
            weight: 22,
            data: {
                categories: snapshot.budget.count,
                usage_percent: Math.round(snapshot.budget.budgetUsage),
            },
        }),
        component({
            key: 'savings',
            name: 'Savings Rate',
            description: 'Whether income is creating room for goals and emergencies.',
            score: savingsScore,
            weight: 18,
            data: {
                savings_rate: `${Math.round(snapshot.netWorth.savingsRate)}%`,
                goals: snapshot.goals.count,
            },
        }),
        component({
            key: 'debt',
            name: 'Debt Pressure',
            description: 'How much debt repayments are pressing against income.',
            score: debtScore,
            weight: 18,
            data: {
                debt_balance: formatKES(snapshot.debt.total),
                income_pressure: `${Math.round(snapshot.debt.pressure)}%`,
            },
        }),
        component({
            key: 'investments',
            name: 'Investments & Net Worth',
            description: 'Your progress toward building long-term assets.',
            score: investmentScore,
            weight: 16,
            data: {
                assets: snapshot.investments.count,
                value: formatKES(snapshot.investments.total),
            },
        }),
        component({
            key: 'protection',
            name: 'Protection',
            description: 'Whether key risks are covered before they interrupt the plan.',
            score: protectionScore,
            weight: 13,
            data: {
                policies: snapshot.protection.count,
                cover: formatKES(snapshot.protection.cover),
            },
        }),
        component({
            key: 'retirement',
            name: 'Retirement Readiness',
            description: 'Whether retirement savings are active and consistent.',
            score: retirementScore,
            weight: 13,
            data: {
                monthly_contribution: formatKES(snapshot.retirement.monthlyContribution),
                retirement_assets: snapshot.retirement.count,
            },
        }),
    ];

    const overallScore = hasPlannerData
        ? clampScore(components.reduce((sum, item) => sum + item.score * (item.weight / 100), 0))
        : 0;
    const status = statusForScore(overallScore);
    const advisorActions = buildAdvisorActions(snapshot);
    const insightGroups = advisorActions.reduce((groups, action) => {
        const type = action.tone === 'rose' ? 'CRITICAL' : action.tone === 'amber' ? 'WARNING' : action.tone === 'emerald' ? 'POSITIVE' : 'TIP';
        const key = type === 'CRITICAL' ? 'critical' : type === 'WARNING' ? 'warnings' : type === 'POSITIVE' ? 'positive' : 'tips';
        groups[key].push({
            type,
            title: action.title,
            message: action.description,
            component: action.badge,
            target: action.target,
        });
        return groups;
    }, { positive: [], warnings: [], critical: [], tips: [] });

    if (!hasPlannerData) {
        insightGroups.tips.push({
            type: 'TIP',
            title: 'Start with your first planner',
            message: 'Add income, budget, debt, investments, protection, or retirement details so Shilingi can calculate your score clearly.',
            component: 'First step',
            target: 'user',
        });
    }

    return {
        score: {
            overall_score: overallScore,
            change_from_previous: 0,
            score_date: new Date().toISOString(),
            ...status,
        },
        breakdown: {
            overall: {
                score: overallScore,
                status: status.status,
                status_display: status.status_display,
            },
            components,
        },
        insights: {
            score: overallScore,
            insights: insightGroups,
            priority_actions: advisorActions.slice(0, 3).map((action) => ({
                title: action.title,
                message: action.description,
                target: action.target,
                badge: action.badge,
            })),
            summary: {
                positive_count: insightGroups.positive.length,
                warnings_count: insightGroups.warnings.length,
                critical_count: insightGroups.critical.length,
                tips_count: insightGroups.tips.length,
            },
        },
        snapshot,
    };
};
