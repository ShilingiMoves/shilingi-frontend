import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Calculator,
    CalendarDays,
    CircleDot,
    Coins,
    Loader2,
    X,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingDown,
    WalletCards,
} from 'lucide-react';
import DebtEntryModal from './DebtEntryModal';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';
import incomeService from '../../../services/incomeService';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const currency = (value) => `KES ${Math.round(Number(value || 0)).toLocaleString('en-KE')}`;
const PERFORMANCE_SNAPSHOT_KEY = 'shilingi_debt_performance_snapshot_v1';
const DEBT_PAYMENTS_LOG_KEY = 'shilingi_debt_payments_log_v1';

const toneByType = {
    MORTGAGE: { bar: 'bg-[#19725f]', pill: 'bg-rose-100 text-rose-600', label: 'High Priority' },
    CAR_LOAN: { bar: 'bg-amber-400', pill: 'bg-amber-100 text-amber-700', label: 'Medium Priority' },
    MOBILE_LOAN: { bar: 'bg-sky-500', pill: 'bg-emerald-100 text-emerald-700', label: 'Low Priority' },
    CREDIT_CARD: { bar: 'bg-rose-500', pill: 'bg-rose-100 text-rose-600', label: 'High Priority' },
    default: { bar: 'bg-primary-600', pill: 'bg-slate-100 text-slate-700', label: 'Active' },
};

const DebtManagerPanel = ({ requestAddDebtSignal = 0, onSelectSection }) => {
    const { triggerHealthRefresh } = useHealthRefresh();
    const [debts, setDebts] = useState([]);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCompareRatesModal, setShowCompareRatesModal] = useState(false);
    const [strategy, setStrategy] = useState('avalanche');
    const [activeView, setActiveView] = useState('portfolio');
    const [debtPaymentsLog, setDebtPaymentsLog] = useState({});
    const [paymentInputs, setPaymentInputs] = useState({});
    const [simulatorExtraPayment, setSimulatorExtraPayment] = useState(5000);

    const summary = useMemo(() => calculateDebtSummary(debts), [debts]);
    const monthKey = new Date().toISOString().slice(0, 7);
    const monthPayments = debtPaymentsLog[monthKey] || [];
    const totalDebtWithLiabilities = Number(summary.totalBalance || 0);
    const activeDebtInstallmentsTotal = useMemo(
        () => debts.filter((debt) => String(debt.status || '').toUpperCase() !== 'PAID_OFF').reduce((sum, debt) => sum + Number(debt.minimumPayment || 0), 0),
        [debts]
    );
    const paidThisMonthTotal = useMemo(() => monthPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0), [monthPayments]);
    const installmentDueThisMonth = Math.max(activeDebtInstallmentsTotal - paidThisMonthTotal, 0);

    const debtFreeDate = useMemo(() => {
        const monthly = Number(summary.totalMinimumPayment || 0);
        const total = Number(totalDebtWithLiabilities || 0);
        if (!monthly || !total) return 'N/A';
        const months = Math.max(Math.ceil(total / monthly), 1);
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }, [summary.totalMinimumPayment, totalDebtWithLiabilities]);

    const orderedDebts = useMemo(() => {
        const items = [...debts];
        if (strategy === 'avalanche') return items.sort((a, b) => Number(b.interestRate || 0) - Number(a.interestRate || 0));
        return items.sort((a, b) => Number(a.balance || 0) - Number(b.balance || 0));
    }, [debts, strategy]);

    const recommendedDebt = orderedDebts[0];
    const quickRateComparisons = useMemo(() => {
        if (!recommendedDebt) return [];

        const currentMonthly = Math.max(Number(recommendedDebt.minimumPayment || 0), 1);
        const principal = Math.max(Number(recommendedDebt.balance || 0), 0);
        const currentRate = Number(recommendedDebt.interestRate || 13);

        return [
            {
                lender: 'KCB Refinance',
                rate: '12.5%',
                monthly: Math.max(currentMonthly - 2800, 0),
                savings: 2800,
                featured: true,
            },
            {
                lender: 'HFC Group',
                rate: '12.9%',
                monthly: Math.max(currentMonthly - 1900, 0),
                savings: 1900,
            },
            {
                lender: 'Current (No change)',
                rate: `~${currentRate.toFixed(0)}%`,
                monthly: currentMonthly,
                savings: 0,
            },
            {
                lender: 'Absa Home Loan',
                rate: '13.6%',
                monthly: currentMonthly + 1200,
                savings: -1200,
            },
        ].map((item) => ({
            ...item,
            balance: principal,
        }));
    }, [recommendedDebt]);
    const estimatedInterestSaved = useMemo(() => {
        if (!recommendedDebt) return 0;
        const extraMonthly = simulatorExtraPayment || Number(summary.totalMinimumPayment || 0) * 0.18;
        const baseRate = Number(recommendedDebt.interestRate || 0) / 100;
        return Math.max(Math.round(extraMonthly * 12 * (1 + baseRate * 2)), 0);
    }, [recommendedDebt, simulatorExtraPayment, summary.totalMinimumPayment]);

    const performance = useMemo(() => {
        const currentTotal = Number(totalDebtWithLiabilities || 0);
        const totalLoggedPayments = Object.values(debtPaymentsLog || {}).reduce(
            (sum, monthEntries) => sum + (Array.isArray(monthEntries) ? monthEntries.reduce((m, entry) => m + Number(entry?.amount || 0), 0) : 0),
            0
        );
        const fallback = { baselineTotal: currentTotal + totalLoggedPayments, repaidAmount: totalLoggedPayments, progressPercent: 0, monthlyPaydown: 0, projectedDebtFreeByPace: null };

        try {
            const rawSnapshot = localStorage.getItem(PERFORMANCE_SNAPSHOT_KEY);
            const now = Date.now();
            const snapshot = rawSnapshot ? JSON.parse(rawSnapshot) : null;
            const startingBaseline = Math.max(Number(snapshot?.baselineTotal || 0), Number(snapshot?.startingTotal || 0), currentTotal + totalLoggedPayments);
            const repaidByBalanceDrop = Math.max(0, startingBaseline - currentTotal);
            const repaidAmount = Math.max(repaidByBalanceDrop, totalLoggedPayments);
            const baselineTotal = Math.max(startingBaseline, currentTotal + repaidAmount);
            const progressPercent = baselineTotal > 0 ? (repaidAmount / baselineTotal) * 100 : 0;
            const daysElapsed = Math.max((now - Number(snapshot?.timestamp || now)) / (1000 * 60 * 60 * 24), 1);
            const monthlyPaydown = Math.max(0, repaidAmount / (daysElapsed / 30));
            const projectedMonths = monthlyPaydown > 0 ? currentTotal / monthlyPaydown : null;
            const projectedDate = projectedMonths ? new Date(new Date().setMonth(new Date().getMonth() + Math.ceil(projectedMonths))).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null;

            localStorage.setItem(PERFORMANCE_SNAPSHOT_KEY, JSON.stringify({ baselineTotal, startingTotal: currentTotal, lastTotal: currentTotal, timestamp: snapshot?.timestamp || now, lastUpdatedAt: now }));
            return { baselineTotal, repaidAmount, progressPercent, monthlyPaydown, projectedDebtFreeByPace: projectedDate };
        } catch {
            return fallback;
        }
    }, [debtPaymentsLog, totalDebtWithLiabilities]);

    const loanReadiness = useMemo(() => {
        const paymentToIncomeRatio = monthlyIncome > 0 ? Number(summary.totalMinimumPayment || 0) / monthlyIncome : 1;
        const totalDebtToIncome = monthlyIncome > 0 ? totalDebtWithLiabilities / monthlyIncome : 0;
        const hasRiskStatus = debts.some((item) => ['DEFAULTED', 'OVERDUE'].includes(String(item.status || '').toUpperCase()));
        const progressGood = totalDebtWithLiabilities === 0 || performance.progressPercent >= 10;
        let score = 0;
        if (paymentToIncomeRatio <= 0.35) score += 1;
        if (!hasRiskStatus) score += 1;
        if (progressGood) score += 1;
        const level = score === 3 ? 'Strong' : score === 2 ? 'Fair' : 'Needs work';
        const tone = score === 3 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score === 2 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200';
        return {
            level,
            tone,
            paymentToIncomeRatio,
            totalDebtToIncome,
            recommendation: score === 3 ? 'You are in a healthy debt-payment range. Keep paying on time.' : score === 2 ? 'You are close. Improve consistency and reduce monthly debt pressure.' : 'Reduce debt pressure and avoid missed payments before taking new credit.',
        };
    }, [debts, monthlyIncome, performance.progressPercent, summary.totalMinimumPayment, totalDebtWithLiabilities]);

    const incomeAfterInstallments = Math.max(monthlyIncome - activeDebtInstallmentsTotal, 0);
    const incomeAfterPaidThisMonth = Math.max(monthlyIncome - paidThisMonthTotal, 0);
    const monthlyPaymentRatio = monthlyIncome > 0 ? (Number(summary.totalMinimumPayment || 0) / monthlyIncome) * 100 : 0;
    const readinessAction = loanReadiness.level === 'Strong' ? 'Compare now' : 'Improve consistency';

    const simulatorProjection = useMemo(() => {
        const baselinePayment = Number(summary.totalMinimumPayment || 0);
        const totalMonthly = baselinePayment + Number(simulatorExtraPayment || 0);
        if (!totalDebtWithLiabilities || !totalMonthly) return { debtFreeDate: 'N/A', freedMonths: 0, extraSavings: 0 };
        const currentMonths = Math.max(Math.ceil(totalDebtWithLiabilities / Math.max(baselinePayment, 1)), 1);
        const improvedMonths = Math.max(Math.ceil(totalDebtWithLiabilities / totalMonthly), 1);
        const freedMonths = Math.max(currentMonths - improvedMonths, 0);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + improvedMonths);
        return { debtFreeDate: endDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), freedMonths, extraSavings: estimatedInterestSaved };
    }, [estimatedInterestSaved, simulatorExtraPayment, summary.totalMinimumPayment, totalDebtWithLiabilities]);

    const debtBreakdown = useMemo(() => {
        const total = Math.max(totalDebtWithLiabilities, 1);
        const grouped = debts.reduce((acc, debt) => {
            const key = debt.debtType || 'OTHER';
            if (!acc[key]) acc[key] = { label: formatDebtType(key), amount: 0 };
            acc[key].amount += Number(debt.balance || 0);
            return acc;
        }, {});

        return Object.values(grouped)
            .map((item, index) => ({ ...item, percent: (item.amount / total) * 100, color: index === 0 ? 'bg-[#19725f]' : index === 1 ? 'bg-amber-400' : 'bg-sky-500' }))
            .sort((a, b) => b.amount - a.amount);
    }, [debts, totalDebtWithLiabilities]);

    const interestBearingTotal = useMemo(() => debts.filter((debt) => Number(debt.interestRate || 0) > 0).reduce((sum, debt) => sum + Number(debt.balance || 0), 0), [debts]);
    const zeroInterestTotal = Math.max(totalDebtWithLiabilities - interestBearingTotal, 0);

    const repaymentTimeline = useMemo(
        () =>
            orderedDebts.map((debt, index) => {
                const payoutMonths = Math.max(Math.ceil(Number(debt.balance || 0) / Math.max(Number(debt.minimumPayment || 0) + (index === 0 ? simulatorExtraPayment : 0), 1)), 1);
                const dt = new Date();
                dt.setMonth(dt.getMonth() + payoutMonths);
                return { id: debt.id, title: `${debt.name} - Debt-Free`, date: dt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), helper: `${currency(debt.minimumPayment)} /mo freed up`, active: index === 0 };
            }),
        [orderedDebts, simulatorExtraPayment]
    );
    const ecosystemLinks = [
        { title: 'Budget Planner', subtitle: 'Debt payments auto-sync to your monthly budget', action: 'Open ->', icon: CalendarDays, onClick: () => onSelectSection?.('budget') },
        { title: 'Comparison Hub', subtitle: 'Find better rates to refinance your debts', action: 'Compare ->', icon: Sparkles, onClick: () => onSelectSection?.('comparehub') },
        { title: 'Net Worth Calculator', subtitle: 'Debts are subtracted from your net worth automatically', action: 'View ->', icon: Coins, onClick: () => onSelectSection?.('networth') },
        { title: 'Shilingi Buddy AI', subtitle: 'Get personalised debt reduction advice', action: 'Chat ->', icon: Target, onClick: () => onSelectSection?.('buddy') },
    ];

    const getDebtPaidThisMonth = (debtId) => monthPayments.filter((entry) => String(entry.debtId) === String(debtId)).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    const persistPaymentLog = (nextLog) => {
        setDebtPaymentsLog(nextLog);
        try {
            localStorage.setItem(DEBT_PAYMENTS_LOG_KEY, JSON.stringify(nextLog));
        } catch {
            // no-op
        }
    };

    const loadDebts = async () => {
        try {
            setLoading(true);
            setError('');
            const [debtsResult, incomeSummaryResult] = await Promise.allSettled([getDebts(), incomeService.getSummary()]);
            if (debtsResult.status === 'fulfilled') {
                setDebts(debtsResult.value || []);
            } else {
                throw new Error(debtsResult.reason?.message || 'Could not load debt records.');
            }
            if (incomeSummaryResult.status === 'fulfilled') {
                const income = Number(incomeSummaryResult.value?.total_income ?? incomeSummaryResult.value?.monthly_income ?? incomeSummaryResult.value?.current_month?.total_income ?? 0);
                setMonthlyIncome(income);
            } else {
                setMonthlyIncome(0);
            }
        } catch (err) {
            setError(err.message || 'We could not load your debt data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(DEBT_PAYMENTS_LOG_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') setDebtPaymentsLog(parsed);
            }
        } catch {
            // no-op
        }
        loadDebts();
    }, []);

    useEffect(() => {
        if (!requestAddDebtSignal) return;
        setEditingDebt(null);
        setSubmitError('');
        setIsModalOpen(true);
    }, [requestAddDebtSignal]);

    const handleSubmit = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            if (editingDebt) {
                const updated = await updateDebt(editingDebt.id, formValues);
                setDebts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                triggerHealthRefresh('debt:update');
            } else {
                const created = await createDebt(formValues);
                setDebts((current) => [created, ...current]);
                markDashboardDataExists();
                triggerHealthRefresh('debt:create');
            }
            setEditingDebt(null);
            setIsModalOpen(false);
        } catch (err) {
            setSubmitError(err.message || 'We could not save this debt right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const recordDebtPayment = async (debt) => {
        const inputValue = paymentInputs[debt.id];
        const paymentAmount = Number(inputValue || debt.minimumPayment || 0);
        if (!paymentAmount || paymentAmount <= 0) {
            setPaymentError('Enter a valid payment amount in KES.');
            return;
        }

        setPaymentError('');
        try {
            const nextBalance = Math.max(Number(debt.balance || 0) - paymentAmount, 0);
            const updated = await updateDebt(debt.id, { ...debt, balance: nextBalance, status: nextBalance <= 0 ? 'PAID_OFF' : debt.status || 'ACTIVE' });
            setDebts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            setPaymentInputs((current) => ({ ...current, [debt.id]: '' }));
            const nextMonthEntries = [...(debtPaymentsLog[monthKey] || []), { debtId: debt.id, debtName: debt.name, amount: paymentAmount, paidAt: new Date().toISOString() }];
            persistPaymentLog({ ...debtPaymentsLog, [monthKey]: nextMonthEntries });
            triggerHealthRefresh('debt:payment');
        } catch (err) {
            setPaymentError(err.message || 'Could not record payment right now.');
        }
    };

    const handleDelete = async (debtId) => {
        try {
            setSubmitError('');
            await deleteDebt(debtId);
            setDebts((current) => current.filter((item) => item.id !== debtId));
            triggerHealthRefresh('debt:delete');
        } catch (err) {
            setSubmitError(err.message || 'Could not remove this debt.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading debt manager...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <DebtEntryModal isOpen={isModalOpen} initialValues={editingDebt} onSubmit={handleSubmit} onClose={() => { if (isSubmitting) return; setEditingDebt(null); setIsModalOpen(false); }} isSubmitting={isSubmitting} />
            {showCompareRatesModal && (
                <QuickRateComparisonModal
                    debt={recommendedDebt}
                    comparisons={quickRateComparisons}
                    onClose={() => setShowCompareRatesModal(false)}
                    onOpenFullHub={() => {
                        setShowCompareRatesModal(false);
                        if (onSelectSection) {
                            onSelectSection('comparehub');
                        }
                    }}
                />
            )}
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle size={15} className="mr-2 inline" />{error}</div>}
            {submitError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{submitError}</div>}

            <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#0f5d50] via-[#1d7a67] to-[#36947a] px-4 py-4 text-white shadow-sm sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-3 dashboard-display-title text-[1.38rem] font-extrabold leading-none sm:text-[1.55rem]"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#f4c95d] text-slate-950"><WalletCards size={16} /></span>Debt Manager</p>
                        <p className="mt-2 max-w-[31rem] text-[0.85rem] leading-5 text-white/80 sm:text-[0.9rem]">Track, manage, and create a payoff plan for all your debts. Compare refinancing options and simulate savings.</p>
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-3 sm:flex-nowrap">
                        <button
                            type="button"
                            onClick={() => setShowCompareRatesModal(true)}
                            className="inline-flex h-10 min-w-[170px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/22 bg-white/10 px-4 text-[0.84rem] font-semibold text-white backdrop-blur-sm"
                        >
                            <Sparkles size={15} />
                            Compare Loan Rates
                        </button>
                        <button
                            type="button"
                            onClick={() => { setEditingDebt(null); setIsModalOpen(true); }}
                            className="inline-flex h-10 min-w-[138px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-4 text-[0.84rem] font-semibold text-[#0f5d50]"
                        >
                            + Add Debt
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Debt" value={currency(totalDebtWithLiabilities)} valueClass="text-rose-500" subtitle={paidThisMonthTotal > 0 ? `KES ${Math.round(paidThisMonthTotal).toLocaleString('en-KE')} repaid this month` : 'Add your first debt to start tracking'} />
                <StatCard title="Monthly Payments" value={currency(summary.totalMinimumPayment)} valueClass="text-amber-700" subtitle={`${monthlyPaymentRatio.toFixed(1)}% of monthly income`} />
                <StatCard title="Debt-Free Date" value={debtFreeDate} valueClass="text-[#13584d]" subtitle="At current pace" />
                <StatCard title="Loan Readiness" value={loanReadiness.level} valueClass="text-[#2167d8]" subtitle={readinessAction} />
            </section>

            <section className="rounded-[1.1rem] border border-emerald-100 bg-white p-1 shadow-sm"><div className="flex flex-wrap gap-2"><TabButton active={activeView === 'portfolio'} onClick={() => setActiveView('portfolio')}>My Debt Portfolio</TabButton><TabButton active={activeView === 'solutions'} onClick={() => setActiveView('solutions')}>Explore Loan Solutions</TabButton><TabButton active={activeView === 'simulator'} onClick={() => setActiveView('simulator')}>Simulator</TabButton></div></section>

            {activeView === 'portfolio' && (
                <div className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.88fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Target} title="Debt Performance" />
                            <p className="mt-5 text-xs uppercase tracking-[0.22em] text-[#9bb8af]">Amount Repaid Since Tracking Started</p>
                            <p className="mt-1 text-[2.3rem] font-extrabold leading-none text-[#175f54]">{currency(performance.repaidAmount)}</p>
                            <div className="mt-4 h-2 rounded-full bg-[#e6f2ee]"><div className="h-2 rounded-full bg-[#19725f]" style={{ width: `${Math.min(Math.max(performance.progressPercent, 0), 100)}%` }} /></div>
                            <p className="mt-2 text-sm text-[#9bb8af]">{performance.progressPercent.toFixed(1)}% payoff progress overall</p>
                            <div className="mt-5 rounded-[1rem] border border-emerald-200 bg-[#eef8f3] p-4">
                                <p className="text-base font-semibold text-slate-900">Monthly Installment Tracker</p>
                                <p className="mt-1 text-sm text-[#175f54]">{installmentDueThisMonth > 0 ? `You still need to cover ${currency(installmentDueThisMonth)} this month.` : "This month's installments are covered."}</p>
                                <p className="mt-2 text-sm text-slate-700">Paid this month: <span className="font-semibold">{currency(paidThisMonthTotal)}</span> | Scheduled: <span className="font-semibold">{currency(activeDebtInstallmentsTotal)}</span></p>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <InfoMiniCard label="Monthly Paydown Pace" value={currency(performance.monthlyPaydown)} helper="Projected pace (annualised)" valueClass="text-rose-500" />
                                <InfoMiniCard label="Projected Debt-Free" value={performance.projectedDebtFreeByPace || 'Keep paying'} helper="At current extra payments" valueClass="text-[#175f54]" />
                            </div>
                            <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-700">
                                <p>Income after scheduled installments: <span className="font-semibold text-slate-900">{currency(incomeAfterInstallments)}</span></p>
                                <p>Income after payments made this month: <span className="font-semibold text-slate-900">{currency(incomeAfterPaidThisMonth)}</span></p>
                            </div>
                        </article>

                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Sparkles} title="Loan Readiness" />
                            <div className={`mt-4 rounded-[1rem] border p-4 ${loanReadiness.tone}`}>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Readiness Status</p>
                                <p className="mt-2 text-2xl font-extrabold">{loanReadiness.level}</p>
                                <p className="mt-1 text-sm">{loanReadiness.recommendation}</p>
                            </div>
                            <div className="mt-5 space-y-3 text-sm text-slate-700">
                                <MetricRow label="Payment-to-income ratio" value={`${(loanReadiness.paymentToIncomeRatio * 100).toFixed(1)}%`} valueClass="text-[#175f54]" />
                                <MetricRow label="Total Debt-to-Income" value={`${(loanReadiness.totalDebtToIncome * 100).toFixed(0)}%`} valueClass="text-amber-600" />
                                <MetricRow label="Ideal DTI threshold" value="Below 35%" valueClass="text-[#9bb8af]" />
                                <MetricRow label="Credit score estimate" value={loanReadiness.level === 'Strong' ? 'Good (680)' : loanReadiness.level === 'Fair' ? 'Good (620)' : 'Improving'} valueClass="text-[#2167d8]" />
                            </div>
                            <div className="mt-4 rounded-[1rem] border border-[#b8d0ff] bg-[#eef4ff] p-4 text-sm text-[#1f55c7]">Income used for debt should stay below 35% for stronger loan eligibility. Use Debt type = Other to add non-loan liabilities.</div>
                            <button type="button" onClick={() => setActiveView('solutions')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-[#eef8f3] px-4 py-3 text-sm font-semibold text-[#175f54]">Explore Refinancing Options<ArrowRight size={14} /></button>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between"><PanelHeading icon={WalletCards} title="Active Debts" noMargin /><button type="button" onClick={() => { setEditingDebt(null); setIsModalOpen(true); }} className="text-sm font-semibold text-[#175f54]">+ Add Debt</button></div>
                            <div className="space-y-4">
                                {orderedDebts.length === 0 ? (
                                    <p className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">No debts added yet. Use + Add Debt to begin.</p>
                                ) : (
                                    orderedDebts.map((debt) => {
                                        const paidThisDebtMonth = getDebtPaidThisMonth(debt.id);
                                        const dueForDebt = Math.max(Number(debt.minimumPayment || 0) - paidThisDebtMonth, 0);
                                        const totalEverPaid = Object.values(debtPaymentsLog).reduce((sum, monthEntries) => {
                                            if (!Array.isArray(monthEntries)) return sum;
                                            return sum + monthEntries.filter((entry) => String(entry.debtId) === String(debt.id)).reduce((acc, entry) => acc + Number(entry.amount || 0), 0);
                                        }, 0);
                                        const initialBalanceEstimate = Number(debt.balance || 0) + totalEverPaid;
                                        const progressPercent = initialBalanceEstimate > 0 ? (totalEverPaid / initialBalanceEstimate) * 100 : 0;
                                        const tone = toneByType[debt.debtType] || toneByType.default;
                                        const estFreeDate = new Date();
                                        estFreeDate.setMonth(estFreeDate.getMonth() + Math.max(Math.ceil(Number(debt.balance || 0) / Math.max(Number(debt.minimumPayment || 0), 1)), 1));
                                        return (
                                            <div key={debt.id} className="rounded-[1.1rem] border border-emerald-200 bg-white p-4 shadow-sm">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="text-[1.1rem] font-bold text-slate-900">{debt.name}</p>
                                                        <p className="mt-1 text-sm text-slate-500">{debt.interestRate ? `${debt.interestRate}% interest` : '0% interest'} � {currency(debt.minimumPayment)}/mo<span className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone.pill}`}>{debt.isPriority ? 'Priority Debt' : tone.label}</span></p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-[2rem] font-extrabold leading-none text-rose-500">{currency(debt.balance)}</p>
                                                        <p className="mt-1 text-sm text-[#9bb8af]">Est. debt-free: {estFreeDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">Payoff Progress</span><span className="font-semibold text-[#175f54]">{progressPercent.toFixed(1)}% paid off</span></div><div className="h-2.5 rounded-full bg-[#edf5f2]"><div className={`h-2.5 rounded-full ${tone.bar}`} style={{ width: `${Math.min(progressPercent, 100)}%` }} /></div></div>
                                                <div className="mt-4 rounded-[0.95rem] bg-[#f4faf7] px-4 py-3 text-sm text-slate-700">Paid this month: <span className="font-semibold text-[#175f54]">{currency(paidThisDebtMonth)}</span><span className="ml-2 text-[#175f54]">{dueForDebt > 0 ? `Still due: ${currency(dueForDebt)}` : 'Installment complete for this month'}</span></div>
                                                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                    <input type="number" min="0" step="0.01" value={paymentInputs[debt.id] ?? ''} onChange={(e) => setPaymentInputs((current) => ({ ...current, [debt.id]: e.target.value }))} placeholder={`Pay ${currency(debt.minimumPayment)}`} className="w-full rounded-[0.95rem] border border-slate-300 px-3 py-2 text-sm" />
                                                    <button type="button" onClick={() => recordDebtPayment(debt)} className="rounded-[0.95rem] bg-[#1c6c5d] px-4 py-2 text-sm font-semibold text-white">Record Payment</button>
                                                    <button type="button" onClick={() => { setEditingDebt(debt); setIsModalOpen(true); }} className="rounded-[0.95rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Edit</button>
                                                    <button type="button" onClick={() => handleDelete(debt.id)} className="rounded-[0.95rem] border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600">Delete</button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            {paymentError && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{paymentError}</div>}
                        </article>

                        <div className="space-y-4">
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                                <PanelHeading icon={Calculator} title="Payoff Strategy" />
                                <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setStrategy('avalanche')} className={`rounded-[0.95rem] border px-4 py-2.5 text-sm font-semibold ${strategy === 'avalanche' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700'}`}>Avalanche</button><button type="button" onClick={() => setStrategy('snowball')} className={`rounded-[0.95rem] border px-4 py-2.5 text-sm font-semibold ${strategy === 'snowball' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700'}`}>Snowball</button></div>
                                <div className="mt-4 rounded-[1rem] border border-emerald-100 bg-[#eef8f3] p-4 text-sm text-slate-700"><p className="font-semibold text-slate-900">{strategy === 'avalanche' ? 'Avalanche Recommendation' : 'Snowball Recommendation'}</p>{recommendedDebt ? <p className="mt-1">Focus <span className="font-semibold">{recommendedDebt.name}</span> first {strategy === 'avalanche' ? '(highest interest)' : '(smallest balance)'} then roll payments to the next debt.</p> : <p className="mt-1">Add debts to get a payoff recommendation.</p>}</div>
                                <div className="mt-4 rounded-[1rem] border border-amber-200 bg-[linear-gradient(180deg,_#f7fbf8_0%,_#fff4df_100%)] p-5 text-center"><p className="text-xs uppercase tracking-[0.2em] text-[#9bb8af]">Est. Interest Saved With Extra Monthly Effort</p><p className="mt-2 text-[2.2rem] font-extrabold leading-none text-[#175f54]">{currency(estimatedInterestSaved)}</p><p className="mt-2 text-sm text-[#9bb8af]">Add {currency(simulatorExtraPayment)} extra to unlock this</p><button type="button" onClick={() => setActiveView('solutions')} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#175f54]">View compare options<ArrowRight size={14} /></button></div>
                                <div className="mt-4 rounded-[1rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><p className="inline-flex items-center gap-2 font-semibold"><ShieldAlert size={15} />Debt Guidance</p><p className="mt-1">Keep monthly payments automatic and prioritise high-cost debt first where possible. Consistent payments improve your readiness score.</p></div>
                            </article>
                            <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                                <PanelHeading icon={CalendarDays} title="Repayment Timeline" />
                                <div className="mt-4 space-y-4">
                                    {repaymentTimeline.length === 0 ? <p className="text-sm text-slate-500">Add debts to generate a repayment timeline.</p> : repaymentTimeline.map((item) => (<div key={item.id} className="relative pl-6 last:[&>span.line]:hidden"><span className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 ${item.active ? 'border-[#19725f] bg-white' : 'border-[#c9e2d8] bg-white'}`} /><span className="line absolute left-[6px] top-5 h-[calc(100%+0.6rem)] w-px bg-[#dceae4]" /><p className="text-sm font-semibold text-[#9bb8af]">{item.date}</p><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="text-sm text-[#9bb8af]">{item.helper}</p></div>))}
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4"><PanelHeading icon={Target} title="Debt Breakdown by Category" noMargin /><button type="button" onClick={() => setActiveView('simulator')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#175f54]">Run Simulator<ArrowRight size={14} /></button></div>
                        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                            <div className="space-y-3">
                                {debtBreakdown.length === 0 ? <p className="text-sm text-slate-500">Add debts to see your debt breakdown.</p> : debtBreakdown.map((item) => (<div key={item.label} className="grid grid-cols-[84px_1fr_48px] items-center gap-3 text-sm"><span className="truncate text-slate-700">{item.label}</span><div className="h-2.5 rounded-full bg-[#eef5f2]"><div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${Math.max(item.percent, 1)}%` }} /></div><span className="text-right font-semibold text-slate-700">{item.percent.toFixed(1)}%</span></div>))}
                            </div>
                            <div className="space-y-3"><MetricPanel label="Interest-bearing debts" value={currency(interestBearingTotal)} valueClass="text-rose-500" /><MetricPanel label="Zero-interest debts" value={currency(zeroInterestTotal)} valueClass="text-[#175f54]" /><MetricPanel label="Total Liabilities" value={currency(totalDebtWithLiabilities)} valueClass="text-rose-500" strong /></div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[1.45rem] bg-gradient-to-r from-[#165747] via-[#1f6d5d] to-[#2f7f6a] p-5 text-white shadow-sm">
                        <p className="text-[1.3rem] font-extrabold">Connected to Your Shilingi Moves Ecosystem</p>
                        <p className="mt-2 text-sm text-white/80">Your debt profile powers personalised recommendations across all planning tools.</p>
                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {ecosystemLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button key={item.title} type="button" onClick={item.onClick} className="rounded-[1rem] border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#f4c95d]"><Icon size={18} /></span>
                                        <p className="mt-4 font-semibold text-white">{item.title}</p>
                                        <p className="mt-2 text-sm text-white/70">{item.subtitle}</p>
                                        <p className="mt-3 text-sm font-semibold text-[#f4c95d]">{item.action}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}

            {activeView === 'solutions' && (
                <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Sparkles} title="Explore Loan Solutions" />
                        <div className="mt-4 grid gap-3">
                            {orderedDebts.length === 0 ? <p className="rounded-[1rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">Add debts first so we can suggest refinancing and restructuring options.</p> : orderedDebts.slice(0, 3).map((debt) => (<div key={`${debt.id}-solution`} className="rounded-[1rem] border border-slate-200 bg-[#f7fbf9] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-base font-semibold text-slate-900">{debt.name}</p><p className="mt-1 text-sm text-slate-500">{debt.interestRate ? `${debt.interestRate}% interest` : 'No interest rate set'} � Current balance {currency(debt.balance)}</p></div><span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{Number(debt.interestRate || 0) >= 15 ? 'High refinance potential' : 'Worth comparing'}</span></div><p className="mt-3 text-sm text-slate-700">{Number(debt.interestRate || 0) >= 15 ? 'This debt has a relatively high cost. Compare lower-rate options and consolidation offers first.' : 'Review repayment flexibility, total cost, and whether combining this debt improves monthly cash flow.'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setActiveView('simulator')} className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">Simulate savings</button><button type="button" className="rounded-full border border-emerald-200 bg-[#eef8f3] px-4 py-2 text-xs font-semibold text-[#175f54]">Compare options</button></div></div>))}
                        </div>
                    </article>

                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Coins} title="What to Compare" />
                        <div className="mt-4 space-y-3"><ChecklistRow text="Lower interest rate than your current debt" /><ChecklistRow text="Reduced monthly installment pressure" /><ChecklistRow text="Lower total repayment cost over time" /><ChecklistRow text="Penalty-free early repayment if possible" /><ChecklistRow text="Products that support consolidation for multiple debts" /></div>
                        <div className="mt-5 rounded-[1rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Compare loan rates only after checking the total cost, fees, and flexibility. The cheapest monthly installment is not always the best long-term option.</div>
                    </article>
                </section>
            )}

            {activeView === 'simulator' && (
                <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Calculator} title="Debt Payoff Simulator" />
                        <p className="mt-3 text-sm text-slate-600">Test how much faster you could become debt-free by adding a little more each month.</p>
                        <div className="mt-5 rounded-[1rem] border border-emerald-100 bg-[#eef8f3] p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[#9bb8af]">Extra Monthly Payment</p><p className="mt-1 text-[2rem] font-extrabold text-[#175f54]">{currency(simulatorExtraPayment)}</p></div><p className="text-sm text-slate-600">Added on top of scheduled debt payments</p></div><input type="range" min="0" max="50000" step="1000" value={simulatorExtraPayment} onChange={(event) => setSimulatorExtraPayment(Number(event.target.value))} className="mt-4 w-full accent-[#19725f]" /></div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3"><InfoMiniCard label="Projected Debt-Free" value={simulatorProjection.debtFreeDate} helper="With extra payment" valueClass="text-[#175f54]" /><InfoMiniCard label="Months Saved" value={`${simulatorProjection.freedMonths}`} helper="Compared to current pace" valueClass="text-[#2167d8]" /><InfoMiniCard label="Est. Interest Saved" value={currency(simulatorProjection.extraSavings)} helper="Approximate savings" valueClass="text-amber-700" /></div>
                    </article>

                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={TrendingDown} title="Recommended Next Move" />
                        <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">{recommendedDebt ? `Direct the extra ${currency(simulatorExtraPayment)} to ${recommendedDebt.name}` : 'Add debts to get a recommendation'}</p><p className="mt-2 text-sm text-slate-600">{recommendedDebt ? `Because you are using the ${strategy} method, this debt gives the strongest payoff impact right now.` : 'Once debts are added, the simulator will tell you where extra payments work best.'}</p></div>
                        <button type="button" onClick={() => setActiveView('portfolio')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white">Back to My Debt Portfolio</button>
                    </article>
                </section>
            )}
        </div>
    );
};

const StatCard = ({ title, subtitle, value, valueClass }) => (<article className="rounded-[1.2rem] border border-emerald-100 bg-white px-4 py-4 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#9bb8af]">{title}</p><p className={`dashboard-metric-value mt-2 text-[1.42rem] font-extrabold leading-none sm:text-[1.58rem] ${valueClass}`}>{value}</p><p className="mt-2 text-[0.82rem] text-slate-500">{subtitle}</p></article>);
const TabButton = ({ active, onClick, children }) => (<button type="button" onClick={onClick} className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-[#0f5d50] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>);
const PanelHeading = ({ icon: Icon, title, noMargin = false }) => (<div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-1'}`}><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f3] text-[#175f54]"><Icon size={18} /></span><h3 className="dashboard-display-title text-[1.05rem] font-bold text-slate-950">{title}</h3></div>);
const InfoMiniCard = ({ label, value, helper, valueClass }) => (<div className="rounded-[1rem] border border-slate-200 bg-[#f8fcfa] p-4"><p className="text-[11px] uppercase tracking-[0.16em] text-[#9bb8af]">{label}</p><p className={`dashboard-metric-value mt-2 text-[1.38rem] font-extrabold leading-none sm:text-[1.5rem] ${valueClass}`}>{value}</p><p className="mt-2 text-[0.82rem] text-slate-500">{helper}</p></div>);
const MetricRow = ({ label, value, valueClass }) => (<div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0"><span className="text-sm text-slate-700">{label}</span><span className={`dashboard-metric-value font-semibold ${valueClass}`}>{value}</span></div>);
const MetricPanel = ({ label, value, valueClass, strong = false }) => (<div className={`rounded-[1rem] border ${strong ? 'border-emerald-200 bg-[#eef8f3]' : 'border-slate-100 bg-[#f7fbf9]'} px-4 py-3`}><div className="flex items-center justify-between gap-4"><span className={`text-sm ${strong ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{label}</span><span className={`dashboard-metric-value text-[1.08rem] font-extrabold ${valueClass}`}>{value}</span></div></div>);
const ChecklistRow = ({ text }) => (<div className="flex items-start gap-3 rounded-[0.95rem] border border-slate-100 bg-[#f8fcfa] px-4 py-3 text-sm text-slate-700"><CircleDot size={16} className="mt-0.5 text-[#175f54]" /><span>{text}</span></div>);
const formatDebtType = (value) => String(value || 'OTHER').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());

const QuickRateComparisonModal = ({ debt, comparisons, onClose, onOpenFullHub }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-[540px] rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="inline-flex items-center gap-2 text-[1.55rem] font-extrabold text-slate-950">
                        <Sparkles size={18} className="text-[#0f5d50]" />
                        Quick Rate Comparison
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                        {debt
                            ? `Based on your current ${debt.name.toLowerCase()} (${currency(debt.balance)}), here's how refinancing could help.`
                            : 'Add a debt first to preview refinance comparisons.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f8fcfa] text-slate-500"
                    aria-label="Close quick rate comparison"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1rem] border border-emerald-100">
                <div className="grid grid-cols-[1.5fr_0.8fr_1fr_1fr] bg-[#f2faf7] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9bb8af]">
                    <span>Lender</span>
                    <span>Rate</span>
                    <span>Monthly</span>
                    <span className="text-right">Savings</span>
                </div>
                <div className="divide-y divide-emerald-100">
                    {comparisons.length > 0 ? (
                        comparisons.map((item) => (
                            <div
                                key={item.lender}
                                className={`grid grid-cols-[1.5fr_0.8fr_1fr_1fr] items-center px-4 py-3 text-sm ${item.featured ? 'bg-amber-50/45' : 'bg-white'}`}
                            >
                                <span className="font-medium text-slate-900">{item.lender}</span>
                                <span className={item.savings > 0 ? 'font-semibold text-[#175f54]' : item.savings < 0 ? 'font-semibold text-rose-500' : 'font-semibold text-slate-700'}>
                                    {item.rate}
                                </span>
                                <span className="text-slate-900">{currency(item.monthly)}</span>
                                <span className={`text-right font-semibold ${item.savings > 0 ? 'text-[#175f54]' : item.savings < 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                                    {item.savings > 0 ? `+${currency(item.savings)}/mo` : item.savings < 0 ? `-${currency(Math.abs(item.savings))}/mo` : 'Current'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-sm text-slate-500">No debt selected yet for a quick refinance preview.</div>
                    )}
                </div>
            </div>

            <div className="mt-5 flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-[0.95rem] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onOpenFullHub}
                    className="flex-1 rounded-[0.95rem] bg-[#1c6c5d] px-5 py-3 text-sm font-semibold text-white"
                >
                    Open Full Hub
                    <span className="ml-1">→</span>
                </button>
            </div>
        </div>
    </div>
);

export default DebtManagerPanel;
