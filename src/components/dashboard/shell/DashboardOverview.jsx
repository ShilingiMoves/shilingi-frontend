import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Coins, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
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
    const [live, setLive] = useState({ loading: true, hasAnyData: false, netWorth: 0, income: 0, spent: 0, savings: 0, completion: 0, budget: [], tx: [], inv: [], goals: [] });

    useEffect(() => {
        let mounted = true;
        (async () => {
            const settled = await Promise.allSettled([incomeService.getSummary(), incomeService.getIncomes({ limit: 8 }), getBudgetSummary(), getBudgets({ current: 'true' }), getExpenses({ limit: 8 }), getGoals({ status: 'ACTIVE' }), getInvestmentAssets(), getDebts(), getNetWorthSummary()]);
            const pick = (i, f) => (settled[i]?.status === 'fulfilled' ? settled[i].value : f);
            const incomeSummary = pick(0, {}), incomesPayload = pick(1, {}), budgetSummary = pick(2, {}), budgets = pick(3, []), expensesPayload = pick(4, {}), goals = pick(5, []), inv = pick(6, []), debts = pick(7, []), nw = pick(8, {});
            const income = toNum(incomeSummary?.total_income || incomeSummary?.monthly_income || user?.profile?.monthly_income);
            const spent = toNum(budgetSummary?.total_spent || expensesPayload?.total);
            const debtTotal = (debts || []).reduce((s, d) => s + toNum(d.balance), 0);
            const invTotal = (inv || []).reduce((s, a) => s + toNum(a.currentValue), 0);
            const netWorth = toNum(nw?.netWorth || invTotal - debtTotal);
            const savings = toNum(nw?.savingsFromGoals || 0);
            const budget = (budgets || []).slice(0, 4).map((b, i) => {
                const target = toNum(b.budgeted_amount || b.allocated_amount || b.amount || b.target_amount);
                const used = toNum(b.spent_amount || b.actual_spent || b.total_spent || b.spent);
                const pct = target > 0 ? Math.round((used / target) * 100) : 0;
                const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-500', 'bg-rose-500'];
                return { label: b.category_name || b.name || `Category ${i + 1}`, percent: pct, amount: fmtKES(used || target), color: colors[i % colors.length] };
            });
            const incomes = incomesPayload?.incomes || incomesPayload?.results || incomesPayload?.data || [];
            const tx = [
                ...(expensesPayload?.expenses || []).map((e) => ({ date: getDate(e), name: e.description || e.name || e.category_name || 'Expense', category: e.category_name || 'Expense', amount: -Math.abs(toNum(e.amount)) })),
                ...incomes.map((x) => ({ date: getDate(x), name: x.source_name || x.name || 'Income', category: x.category_name || 'Income', amount: Math.abs(toNum(x.amount || x.monthly_amount)) })),
            ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 5).map((r) => ({ name: r.name, category: r.category, amount: fmtSigned(r.amount), when: relDate(r.date), tone: r.amount >= 0 ? 'text-emerald-700' : 'text-rose-600' }));
            const invRows = (inv || []).slice(0, 4).map((a) => ({ name: a.name || 'Investment', type: a.categoryName || 'Investment', value: fmtKES(a.currentValue), change: `${toNum(a.gainLossPercentage) >= 0 ? '+' : ''}${Math.round(toNum(a.gainLossPercentage) * 10) / 10}%`, tone: toNum(a.gainLossPercentage) >= 0 ? 'text-emerald-700' : 'text-rose-600' }));
            const goalRows = (goals || []).slice(0, 3).map((g) => ({ label: g.name || g.title || 'Goal', horizon: g.time_horizon || 'Goal', progress: Math.max(0, Math.min(100, Math.round(toNum(g.progress_percentage || g.progress || g.completion)))) }));
            const stepFlags = [income > 0, budget.length > 0, tx.length > 0, invRows.length > 0, goalRows.length > 0, Math.abs(netWorth) > 0];
            const completion = Math.round((stepFlags.filter(Boolean).length / stepFlags.length) * 100);
            if (!mounted) return;
            setLive({ loading: false, hasAnyData: stepFlags.some(Boolean), netWorth, income, spent, savings, completion, budget, tx, inv: invRows, goals: goalRows });
        })();
        return () => { mounted = false; };
    }, [user]);

    const hasData = live.hasAnyData;
    const ctaButtons = useMemo(() => {
        if (newUser) return [{ id: 'profile', label: 'Complete profile', target: 'user', primary: true }, { id: 'income', label: 'Add Income', target: 'cashflow', primary: false }, { id: 'plan', label: 'Start planning', target: 'budget', primary: false }];
        if (!hasIncomeData) return [{ id: 'income', label: 'Add Income', target: 'cashflow', primary: true }, { id: 'plan', label: 'Continue Planning', target: 'budget', primary: false }];
        return [{ id: 'plan', label: 'Continue Planning', target: 'budget', primary: true }];
    }, [newUser, hasIncomeData]);

    const stats = [
        { icon: Coins, label: 'Total Net Worth', value: hasData ? fmtKES(live.netWorth) : 'KES 0', meta: hasData ? 'From connected planners' : 'Add data to see this', tone: 'text-emerald-700' },
        { icon: PiggyBank, label: 'Monthly Income', value: hasData ? fmtKES(live.income) : 'KES 0', meta: hasData ? 'Income Manager' : 'No income yet', tone: 'text-slate-900' },
        { icon: Wallet, label: 'Spent - Current', value: hasData ? fmtKES(live.spent) : 'KES 0', meta: hasData ? 'Budget + expenses' : 'No spending data', tone: 'text-rose-600' },
        { icon: TrendingUp, label: 'Total Savings', value: hasData ? fmtKES(live.savings) : 'KES 0', meta: hasData ? 'Goals progress' : 'No savings progress', tone: 'text-emerald-700' },
    ];

    return (
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <section className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${palette.shell} p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:p-7`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(240,201,77,0.10),_transparent_24%)]" />
                    <div className="relative">
                        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/90">{newUser ? `${dateLabel} - ${palette.label}` : palette.label}</div>
                        {newUser ? <><h1 className="mt-5 max-w-4xl text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[3.15rem]">Welcome {firstName}, your financial health score is 0/100.</h1><p className="mt-4 max-w-3xl text-base leading-8 text-white/80">Please complete your profile and planners to unlock personalized insights tailored to your life.</p></> : <><h1 className="mt-5 max-w-4xl text-[2.1rem] font-extrabold leading-[1.07] tracking-tight text-white sm:text-[3.35rem]">{firstName}, your Shilingi Moves dashboard is ready for today.</h1><p className="mt-4 max-w-3xl text-base leading-8 text-white/80">Move from awareness to action with one connected workspace for planning, comparing, learning, tools, and community support.</p></>}
                        <div className="mt-6 flex flex-wrap gap-3">{ctaButtons.map((b) => <button key={b.id} type="button" onClick={() => onSelectSection(b.target)} className={b.primary ? 'inline-flex items-center gap-2 rounded-full bg-[#F0C94D] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-300/20' : 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15'}>{b.label}<ArrowRight size={15} /></button>)}</div>
                    </div>
                </section>

                {!hasData && <section className="rounded-[1.25rem] border border-emerald-100 bg-white px-4 py-4 shadow-sm"><p className="text-sm font-semibold text-primary-700">Preview mode</p><p className="mt-1 text-sm text-slate-600">This is how your dashboard will look once you add income, budgets, investments, and goals.</p></section>}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ icon: Icon, label, value, meta, tone }) => <article key={label} className="rounded-[1.25rem] border border-emerald-100 bg-white px-4 py-4 shadow-sm"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-primary-700"><Icon size={15} /></span><p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-1 text-3xl font-extrabold ${tone}`}>{live.loading ? '...' : value}</p><p className="mt-1 text-xs text-slate-500">{meta}</p></article>)}</section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <Panel title="Budget Tracker" action="Edit -" onAction={() => onSelectSection('budget')}>{(hasData ? live.budget : previewBudget).map((r) => <div key={r.label}><div className="mb-1 flex items-center justify-between text-sm"><p className="font-medium text-slate-800">{r.label}</p><p className="text-slate-500">{r.amount}</p></div><div className="h-2 rounded-full bg-slate-200"><div className={`${r.color} h-2 rounded-full`} style={{ width: `${Math.min(r.percent, 100)}%` }} /></div></div>)}</Panel>
                    <Panel title="Recent Transactions" action="View All -" onAction={() => onSelectSection('cashflow')}>{(hasData ? live.tx : previewTx).map((r, i) => <div key={`${r.name}-${i}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fbfa] px-3 py-2"><div><p className="text-sm font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.category}</p></div><div className="text-right"><p className={`text-sm font-bold ${r.tone}`}>{r.amount}</p><p className="text-xs text-slate-400">{r.when}</p></div></div>)}</Panel>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
                    <article className="rounded-[1.4rem] border border-emerald-100 bg-gradient-to-br from-[#166a59] via-[#0f5f53] to-[#104f49] p-5 text-white shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">Net Worth Overview</p><p className="mt-2 text-5xl font-extrabold">{hasData ? fmtKES(live.netWorth) : 'KES 0'}</p><p className="mt-1 text-sm text-emerald-100">{hasData ? 'Updated from your connected planners' : 'Add data to activate your trend'}</p><div className="mt-5 h-28 rounded-2xl bg-white/5 p-3"><div className="h-full w-full rounded-xl bg-[linear-gradient(180deg,rgba(110,255,220,0.2)_0%,rgba(110,255,220,0.02)_100%)]" /></div></article>
                    <div className="grid gap-4">
                        <article className="rounded-[1.4rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="inline-flex items-center gap-2 text-base font-bold text-slate-900"><Activity size={15} className="text-primary-700" />Financial Health Score</p><button type="button" onClick={() => onSelectSection('health')} className="text-xs font-semibold text-primary-700">Details -</button></div><div className="mt-4"><p className="text-4xl font-extrabold text-primary-700">{hasData ? live.completion : 0}</p><p className="text-sm text-slate-500">/100</p></div><div className="mt-4 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-primary-600" style={{ width: `${hasData ? live.completion : 0}%` }} /></div></article>
                        <Panel title="Financial Goals" action="+ New Goal" onAction={() => onSelectSection('user')}>{(hasData ? live.goals : previewGoals).map((g) => <div key={g.label}><div className="mb-1.5 flex items-center justify-between text-sm"><p className="font-semibold text-slate-800">{g.label}</p><span className="text-slate-500">{g.progress}%</span></div><div className="mb-1 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-primary-600" style={{ width: `${g.progress}%` }} /></div><p className="text-xs uppercase tracking-[0.16em] text-slate-400">{g.horizon}</p></div>)}</Panel>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <Panel title="Investment Portfolio" action="Full View -" onAction={() => onSelectSection('investments')}>{(hasData ? live.inv : previewInv).map((r) => <div key={r.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fbfa] px-3 py-2"><div><p className="text-sm font-semibold text-slate-900">{r.name}</p><p className="text-xs text-slate-500">{r.type}</p></div><div className="text-right"><p className="text-sm font-bold text-slate-900">{r.value}</p><p className={`text-xs font-semibold ${r.tone}`}>{r.change}</p></div></div>)}</Panel>
                    <Panel title="Financial Calendar & Insights" action="Open -" onAction={() => onSelectSection('learninghub')}><div className={`grid grid-cols-7 gap-1.5 rounded-xl border border-slate-200 bg-[#f8fbfa] p-2 ${hasData ? '' : 'opacity-60'}`}>{Array.from({ length: 14 }).map((_, i) => <div key={i} className="min-h-[50px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600">{i + 1}</div>)}</div></Panel>
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

export default DashboardOverview;
