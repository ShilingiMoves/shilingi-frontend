import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Coins, Heart, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import incomeService from '../../../services/incomeService';
import { getBudgetSummary, getBudgets, getExpenses, getGoals } from '../../../services/budgetApi';
import { getAssets as getInvestmentAssets } from '../../../services/investmentTrackerApi';
import { getDebts } from '../../../services/debtApi';
import { getNetWorthSummary } from '../../../services/networthApi';
import { DASHBOARD_DATA_KEY } from '../../../utils/dashboardDataState';
import { USER_PROFILE_WORKSPACE_KEY } from '../user/UserGoalsFamilyForm';

const toneMap = {
    morning: { label: 'Good morning', shell: 'from-[#176a57] via-[#187661] to-[#12384a]' },
    afternoon: { label: 'Good afternoon', shell: 'from-[#176b5a] via-[#1b7c67] to-[#145362]' },
    evening: { label: 'Good evening', shell: 'from-[#143748] via-[#165261] to-[#0f6758]' },
};
const previewBudget = [{ label: 'Housing & Rent', percent: 100, amount: 'KES 25,000', color: 'bg-emerald-600' }, { label: 'Food & Groceries', percent: 83, amount: 'KES 8,300', color: 'bg-blue-600' }, { label: 'Transport', percent: 60, amount: 'KES 3,600', color: 'bg-amber-500' }];
const previewTx = [{ name: 'Naivas Supermarket', category: 'Food', amount: '-KES 2,450', when: 'Today', tone: 'text-rose-600' }, { name: 'Salary - Safaricom PLC', category: 'Income', amount: '+KES 95,000', when: 'Yesterday', tone: 'text-emerald-700' }];
const previewInv = [{ name: 'Safaricom PLC', type: 'NSE Equities', value: 'KES 82,400', change: '+3.2%', tone: 'text-emerald-700' }, { name: 'CIC Money Market', type: 'Unit Trust', value: 'KES 65,000', change: '+12.4% p.a.', tone: 'text-emerald-700' }];
const previewGoals = [{ label: 'Emergency Fund', horizon: 'Short', progress: 74 }, { label: 'Zanzibar Holiday', horizon: 'Medium', progress: 42 }];

const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const fmtKES = (v) => `KES ${Math.round(toNum(v)).toLocaleString('en-KE')}`;
const fmtSigned = (v) => `${toNum(v) >= 0 ? '+' : '-'}KES ${Math.round(Math.abs(toNum(v))).toLocaleString('en-KE')}`;
const getMoment = (d) => (d.getHours() < 12 ? 'morning' : d.getHours() < 17 ? 'afternoon' : 'evening');
const getDate = (i) => i?.date || i?.created_at || i?.updated_at || '';
const relDate = (v) => {
    if (!v) return 'Recent';
    const d = new Date(v); if (Number.isNaN(d.getTime())) return 'Recent';
    const diff = Math.round((Date.now() - d.getTime()) / 86400000);
    if (diff <= 0) return 'Today'; if (diff === 1) return 'Yesterday'; if (diff < 7) return `${diff}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const isNewUser = (user) => {
    const profile = user?.profile || {};
    let ws = {};
    try { ws = JSON.parse(localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}'); } catch {}
    const hasData = localStorage.getItem(DASHBOARD_DATA_KEY) === 'true';
    return !(profile.monthly_income || profile.primary_financial_goal || ws.shortTermGoal || ws.mediumTermGoal || ws.longTermGoal || hasData);
};

const DashboardOverview = ({ user, hasIncomeData = false, onSelectSection }) => {
    const firstName = user?.first_name || 'there';
    const moment = useMemo(() => getMoment(new Date()), []);
    const palette = toneMap[moment];
    const newUser = isNewUser(user);
    const dateLabel = useMemo(() => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);
    const [live, setLive] = useState({ loading: true, hasAnyData: false, netWorth: 0, income: 0, spent: 0, savings: 0, completion: 0, budget: [], spending: [], tx: [], inv: [], goals: [], breakdown: { cash: 0, investments: 0, property: 0, liabilities: 0 } });

    useEffect(() => {
        let mounted = true;
        (async () => {
            const settled = await Promise.allSettled([incomeService.getSummary(), incomeService.getIncomes({ limit: 100 }), getBudgetSummary(), getBudgets({ current: 'true' }), getExpenses({ limit: 100 }), getGoals({ status: 'ACTIVE' }), getInvestmentAssets(), getDebts(), getNetWorthSummary()]);
            const pick = (i, f) => (settled[i]?.status === 'fulfilled' ? settled[i].value : f);
            const incomeSummary = pick(0, {}), incomesPayload = pick(1, {}), budgetSummary = pick(2, {}), budgets = pick(3, []), expensesPayload = pick(4, {}), goals = pick(5, []), inv = pick(6, []), debts = pick(7, []), nw = pick(8, {});
            const incomes = incomesPayload?.incomes || incomesPayload?.results || incomesPayload?.data || [];
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
            const spent = toNum(budgetSummary?.total_spent || expensesPayload?.total);
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
            const groupedSpending = Object.values((expensesPayload?.expenses || []).reduce((acc, expense) => {
                const label = expense.category_name || expense.category || expense.description || 'Other';
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
                ...(expensesPayload?.expenses || []).map((e) => ({ date: getDate(e), name: e.description || e.name || e.category_name || 'Expense', category: e.category_name || 'Expense', amount: -Math.abs(toNum(e.amount)) })),
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
            const completion = Math.round((stepFlags.filter(Boolean).length / stepFlags.length) * 100);
            if (!mounted) return;
            setLive({ loading: false, hasAnyData: stepFlags.some(Boolean), netWorth, income, spent, savings, completion, budget, spending, tx, inv: invRows, goals: goalRows, breakdown });
        })();
        return () => { mounted = false; };
    }, [user]);

    const hasData = live.hasAnyData;
    const shouldShowNewUserHero = newUser && !hasData && !hasIncomeData;
    const currentScore = hasData ? live.completion : 0;
    const streakDays = hasData ? Math.max(1, Math.min(30, (live.tx?.length || 0) + (live.goals?.length || 0) + (live.inv?.length || 0))) : 0;
    const ctaButtons = useMemo(() => {
        if (shouldShowNewUserHero) return [{ id: 'profile', label: 'Complete profile', target: 'user', primary: true }, { id: 'income', label: 'Add Income', target: 'user', primary: false }, { id: 'plan', label: 'Start planning', target: 'budget', primary: false }];
        if (!hasIncomeData) return [{ id: 'income', label: 'Add Income', target: 'user', primary: true }, { id: 'plan', label: 'Continue Planning', target: 'budget', primary: false }];
        return [{ id: 'plan', label: 'Continue Planning', target: 'budget', primary: true }];
    }, [shouldShowNewUserHero, hasIncomeData]);

    const stats = [
        { icon: Coins, label: 'Total Net Worth', value: hasData ? fmtKES(live.netWorth) : 'KES 0', meta: hasData ? 'From connected planners' : 'Add data to see this', tone: 'text-emerald-700' },
        { icon: PiggyBank, label: 'Monthly Income', value: hasData ? fmtKES(live.income) : 'KES 0', meta: hasData ? 'Income Manager' : 'No income yet', tone: 'text-slate-900' },
        { icon: Wallet, label: 'Spent - Current', value: hasData ? fmtKES(live.spent) : 'KES 0', meta: hasData ? 'Budget + expenses' : 'No spending data', tone: 'text-rose-600' },
        { icon: TrendingUp, label: 'Total Savings', value: hasData ? fmtKES(live.savings) : 'KES 0', meta: hasData ? 'Goals progress' : 'No savings progress', tone: 'text-emerald-700' },
    ];
    const spendingRows = hasData ? (live.budget.length ? live.budget : live.spending) : previewBudget;

    return (
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <section className={`relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br ${palette.shell} p-4 text-white shadow-[0_16px_48px_rgba(15,23,42,0.14)] sm:p-5`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(240,201,77,0.10),_transparent_24%)]" />
                    <div className="relative">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90">{`${dateLabel} - ${palette.label}`}</div>
                        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                {shouldShowNewUserHero ? (
                                    <>
                                        <h1 className="max-w-4xl text-[1.9rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[2.5rem]">Welcome {firstName}, your financial health score is 0/100.</h1>
                                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/80">Please complete your profile and planners to unlock personalized insights tailored to your life.</p>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="max-w-4xl text-[1.85rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[2.25rem]">{palette.label}, {firstName}!</h1>
                                        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/80">Great progress today. Your health score is {currentScore}/100{hasData ? ` and you have ${fmtKES(live.savings)} in tracked savings.` : '.'}</p>
                                    </>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2.5">{ctaButtons.map((b) => <button key={b.id} type="button" onClick={() => onSelectSection(b.target)} className={b.primary ? 'inline-flex items-center gap-2 rounded-full bg-[#F0C94D] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-amber-300/20' : 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15'}>{b.label}<ArrowRight size={14} /></button>)}</div>
                            </div>
                            {!shouldShowNewUserHero && (
                                <div className="grid w-full grid-cols-2 gap-2.5 sm:max-w-[250px]">
                                    <HeroBadge label="Day Streak" value={String(streakDays)} />
                                    <HeroBadge label="Health Score" value={String(currentScore)} suffix="/100" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {!hasData && <section className="rounded-[1.25rem] border border-emerald-100 bg-white px-4 py-4 shadow-sm"><p className="text-sm font-semibold text-primary-700">Preview mode</p><p className="mt-1 text-sm text-slate-600">This is how your dashboard will look once you add income, budgets, investments, and goals.</p></section>}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ icon: Icon, label, value, meta, tone }) => <article key={label} className="rounded-[1.25rem] border border-emerald-100 bg-white px-4 py-4 shadow-sm"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-primary-700"><Icon size={15} /></span><p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-1 text-3xl font-extrabold ${tone}`}>{live.loading ? '...' : value}</p><p className="mt-1 text-xs text-slate-500">{meta}</p></article>)}</section>

                <section className="grid gap-4 xl:grid-cols-[1.2fr_0.72fr]">
                    <div className="grid gap-4">
                        <article className="relative overflow-hidden rounded-[1.3rem] border border-emerald-100 bg-gradient-to-br from-[#166a59] via-[#0f5f53] to-[#104f49] p-3.5 text-white shadow-sm">
                        <div className="absolute inset-y-0 right-0 w-40 rounded-full bg-white/5 blur-0" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100">Net Worth Overview</p>
                        <p className="mt-1.5 text-[2.2rem] font-extrabold leading-none">{hasData ? fmtKES(live.netWorth) : 'KES 0'}</p>
                        <p className="mt-1.5 text-xs text-emerald-100">{hasData ? 'Updated now - +12.3% YTD' : 'Updated from your connected planners'}</p>
                        <div className="mt-3 h-[58px] rounded-[1rem] bg-white/5 p-2">
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
                                <h3 className="text-base font-bold text-slate-900">Spending Breakdown - March</h3>
                                <button type="button" onClick={() => onSelectSection('budget')} className="text-xs font-semibold text-primary-700">Full Report -</button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
                                <div className="flex justify-center">
                                    <SpendingDonut rows={spendingRows} />
                                </div>
                                <div className="space-y-2">
                                    {spendingRows.slice(0, 5).map((row) => (
                                        <div key={row.label} className="grid grid-cols-[12px_1fr_auto] items-center gap-3">
                                            <span className={`h-3 w-3 rounded-full ${row.color}`} />
                                            <p className="text-sm text-slate-700">{row.label}</p>
                                            <p className={`text-sm font-semibold ${getBudgetTone(row.percent)}`}>{Math.min(row.percent, 999)}%</p>
                                        </div>
                                    ))}
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
                                <CircularHealth score={hasData ? live.completion : 0} />
                                <p className="mt-3 text-lg font-bold text-primary-800">{getHealthLabel(hasData ? live.completion : 0)} - Top 34%</p>
                                <p className="text-xs text-slate-400">Among Shilingi Moves users</p>
                            </div>
                            <div className="mt-4 space-y-2.5">
                                <HealthBar label="Savings Rate" value={Math.min(100, Math.max(0, Math.round((live.savings / Math.max(live.income || 1, 1)) * 100)))} color="bg-emerald-600" textColor="text-emerald-700" />
                                <HealthBar label="Debt Ratio" value={Math.min(100, Math.max(0, Math.round((Math.abs(live.breakdown.liabilities) / Math.max(live.netWorth || 1, 1)) * 100)))} color="bg-amber-500" textColor="text-amber-600" inverse />
                                <HealthBar label="Budget" value={Math.min(100, hasData ? live.completion : 0)} color="bg-blue-600" textColor="text-blue-600" />
                                <HealthBar label="Investments" value={Math.min(100, Math.round((live.breakdown.investments / Math.max(live.netWorth || 1, 1)) * 100))} color="bg-violet-600" textColor="text-violet-600" />
                            </div>
                        </article>
                        <Panel title="Financial Goals" action="+ New Goal" onAction={() => onSelectSection('user')}>{(hasData ? live.goals : previewGoals).map((g) => <div key={g.label}><div className="mb-1.5 flex items-center justify-between text-sm"><p className="font-semibold text-slate-800">{g.label}</p><span className="text-slate-500">{g.progress}%</span></div><div className="mb-1 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-primary-600" style={{ width: `${g.progress}%` }} /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-400">{g.horizon}</p></div>)}</Panel>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <Panel title="Recent Transactions" action="View In Profile -" onAction={() => onSelectSection('user')}>{(hasData ? live.tx : previewTx).map((r, i) => <div key={`${r.name}-${i}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fbfa] px-3 py-2"><div><p className="text-sm font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.category}</p></div><div className="text-right"><p className={`text-sm font-bold ${r.tone}`}>{r.amount}</p><p className="text-xs text-slate-400">{r.when}</p></div></div>)}</Panel>
                    <Panel title="Investment Portfolio" action="Full View -" onAction={() => onSelectSection('investments')}>{(hasData ? live.inv : previewInv).map((r) => <div key={r.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fbfa] px-3 py-2"><div><p className="text-sm font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.type}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-900">{r.value}</p><p className={`text-xs font-semibold ${r.tone}`}>{r.change}</p></div></div>)}</Panel>
                </section>
            </div>
        </div>
    );
};

const Panel = ({ title, action, onAction, children }) => (
    <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <button type="button" onClick={onAction} className="text-xs font-semibold text-primary-700">{action}</button>
        </div>
        <div className="space-y-2.5">{children}</div>
    </article>
);

const HeroBadge = ({ label, value, suffix = '' }) => (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
        <p className="text-2xl font-extrabold text-white">{value}{suffix}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/80">{label}</p>
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
    let offset = 0;
    const colors = {
        'bg-emerald-600': '#177261',
        'bg-blue-600': '#2d73d5',
        'bg-amber-500': '#f5a623',
        'bg-rose-500': '#ef4444',
        'bg-violet-600': '#7c3aed',
    };

    return (
        <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#eef4f1" strokeWidth="14" fill="none" />
                {normalizedRows.map((row) => {
                    const segment = (row.percent / total) * circumference;
                    const currentOffset = offset;
                    offset += segment;
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
