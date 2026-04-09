import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import DebtEntryModal from './DebtEntryModal';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';
import incomeService from '../../../services/incomeService';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const currency = (value) => `KSh ${Math.round(Number(value || 0)).toLocaleString('en-KE')}`;
const PERFORMANCE_SNAPSHOT_KEY = 'shilingi_debt_performance_snapshot_v1';
const DEBT_PAYMENTS_LOG_KEY = 'shilingi_debt_payments_log_v1';

const DebtManagerPanel = ({ requestAddDebtSignal = 0 }) => {
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
    const [strategy, setStrategy] = useState('avalanche');
    const [debtPaymentsLog, setDebtPaymentsLog] = useState({});
    const [paymentInputs, setPaymentInputs] = useState({});

    const summary = useMemo(() => calculateDebtSummary(debts), [debts]);
    const monthKey = new Date().toISOString().slice(0, 7);
    const monthPayments = debtPaymentsLog[monthKey] || [];
    const totalDebtWithLiabilities = Number(summary.totalBalance || 0);
    const activeDebtInstallmentsTotal = useMemo(
        () =>
            debts
                .filter((debt) => String(debt.status || '').toUpperCase() !== 'PAID_OFF')
                .reduce((sum, debt) => sum + Number(debt.minimumPayment || 0), 0),
        [debts]
    );
    const paidThisMonthTotal = useMemo(
        () => monthPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [monthPayments]
    );
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
        if (strategy === 'avalanche') {
            return items.sort((a, b) => Number(b.interestRate || 0) - Number(a.interestRate || 0));
        }
        return items.sort((a, b) => Number(a.balance || 0) - Number(b.balance || 0));
    }, [debts, strategy]);

    const recommendedDebt = orderedDebts[0];
    const estimatedInterestSaved = useMemo(() => {
        if (!recommendedDebt) return 0;
        const extraMonthly = Number(summary.totalMinimumPayment || 0) * 0.18;
        const baseRate = Number(recommendedDebt.interestRate || 0) / 100;
        return Math.max(Math.round(extraMonthly * 12 * (1 + baseRate * 2)), 0);
    }, [recommendedDebt, summary.totalMinimumPayment]);

    const performance = useMemo(() => {
        const currentTotal = Number(totalDebtWithLiabilities || 0);
        const totalLoggedPayments = Object.values(debtPaymentsLog || {}).reduce(
            (sum, monthEntries) =>
                sum +
                (Array.isArray(monthEntries)
                    ? monthEntries.reduce((m, entry) => m + Number(entry?.amount || 0), 0)
                    : 0),
            0
        );
        const fallback = {
            baselineTotal: currentTotal + totalLoggedPayments,
            repaidAmount: totalLoggedPayments,
            progressPercent: 0,
            monthlyPaydown: 0,
            projectedDebtFreeByPace: null,
        };

        try {
            const rawSnapshot = localStorage.getItem(PERFORMANCE_SNAPSHOT_KEY);
            const now = Date.now();
            const snapshot = rawSnapshot ? JSON.parse(rawSnapshot) : null;
            const startingBaseline = Math.max(
                Number(snapshot?.baselineTotal || 0),
                Number(snapshot?.startingTotal || 0),
                currentTotal + totalLoggedPayments
            );
            const repaidByBalanceDrop = Math.max(0, startingBaseline - currentTotal);
            const repaidAmount = Math.max(repaidByBalanceDrop, totalLoggedPayments);
            const baselineTotal = Math.max(startingBaseline, currentTotal + repaidAmount);
            const progressPercent = baselineTotal > 0 ? (repaidAmount / baselineTotal) * 100 : 0;
            const daysElapsed = Math.max((now - Number(snapshot?.timestamp || now)) / (1000 * 60 * 60 * 24), 1);
            const monthlyPaydown = Math.max(0, repaidAmount / (daysElapsed / 30));
            const projectedMonths = monthlyPaydown > 0 ? currentTotal / monthlyPaydown : null;
            const projectedDate = projectedMonths
                ? new Date(new Date().setMonth(new Date().getMonth() + Math.ceil(projectedMonths))).toLocaleDateString(
                      'en-GB',
                      { month: 'short', year: 'numeric' }
                  )
                : null;

            localStorage.setItem(
                PERFORMANCE_SNAPSHOT_KEY,
                JSON.stringify({
                    baselineTotal,
                    startingTotal: currentTotal,
                    lastTotal: currentTotal,
                    timestamp: snapshot?.timestamp || now,
                    lastUpdatedAt: now,
                })
            );

            return {
                baselineTotal,
                repaidAmount,
                progressPercent,
                monthlyPaydown,
                projectedDebtFreeByPace: projectedDate,
            };
        } catch {
            return fallback;
        }
    }, [debtPaymentsLog, totalDebtWithLiabilities]);

    const loanReadiness = useMemo(() => {
        const paymentToIncomeRatio = monthlyIncome > 0 ? Number(summary.totalMinimumPayment || 0) / monthlyIncome : 1;
        const hasRiskStatus = debts.some((item) =>
            ['DEFAULTED', 'OVERDUE'].includes(String(item.status || '').toUpperCase())
        );
        const progressGood = totalDebtWithLiabilities === 0 || performance.progressPercent >= 10;

        let score = 0;
        if (paymentToIncomeRatio <= 0.35) score += 1;
        if (!hasRiskStatus) score += 1;
        if (progressGood) score += 1;

        const level = score === 3 ? 'Strong' : score === 2 ? 'Fair' : 'Needs work';
        const tone =
            score === 3
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : score === 2
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-rose-700 bg-rose-50 border-rose-200';

        return {
            level,
            tone,
            paymentToIncomeRatio,
                recommendation:
                score === 3
                    ? 'You are in a healthy debt-payment range. Keep paying on time.'
                    : score === 2
                    ? 'You are close. Improve consistency and reduce monthly debt pressure.'
                    : 'Reduce debt pressure and avoid missed payments before taking new credit.',
        };
    }, [debts, monthlyIncome, performance.progressPercent, summary.totalMinimumPayment, totalDebtWithLiabilities]);

    const incomeAfterInstallments = Math.max(monthlyIncome - activeDebtInstallmentsTotal, 0);
    const incomeAfterPaidThisMonth = Math.max(monthlyIncome - paidThisMonthTotal, 0);

    const getDebtPaidThisMonth = (debtId) =>
        monthPayments
            .filter((entry) => String(entry.debtId) === String(debtId))
            .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

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
            const [debtsResult, incomeSummaryResult] = await Promise.allSettled([
                getDebts(),
                incomeService.getSummary(),
            ]);

            if (debtsResult.status === 'fulfilled') {
                setDebts(debtsResult.value || []);
            } else {
                throw new Error(debtsResult.reason?.message || 'Could not load debt records.');
            }

            if (incomeSummaryResult.status === 'fulfilled') {
                const income = Number(
                    incomeSummaryResult.value?.total_income ??
                        incomeSummaryResult.value?.monthly_income ??
                        incomeSummaryResult.value?.current_month?.total_income ??
                        0
                );
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
                if (parsed && typeof parsed === 'object') {
                    setDebtPaymentsLog(parsed);
                }
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
            setPaymentError('Enter a valid payment amount in KSh.');
            return;
        }

        setPaymentError('');
        try {
            const nextBalance = Math.max(Number(debt.balance || 0) - paymentAmount, 0);
            const updated = await updateDebt(debt.id, {
                ...debt,
                balance: nextBalance,
                status: nextBalance <= 0 ? 'PAID_OFF' : debt.status || 'ACTIVE',
            });

            setDebts((current) => current.map((item) => (item.id === updated.id ? updated : item)));
            setPaymentInputs((current) => ({ ...current, [debt.id]: '' }));

            const nextMonthEntries = [
                ...(debtPaymentsLog[monthKey] || []),
                {
                    debtId: debt.id,
                    debtName: debt.name,
                    amount: paymentAmount,
                    paidAt: new Date().toISOString(),
                },
            ];
            persistPaymentLog({
                ...debtPaymentsLog,
                [monthKey]: nextMonthEntries,
            });
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
            <DebtEntryModal
                isOpen={isModalOpen}
                initialValues={editingDebt}
                onSubmit={handleSubmit}
                onClose={() => {
                    if (isSubmitting) return;
                    setEditingDebt(null);
                    setIsModalOpen(false);
                }}
                isSubmitting={isSubmitting}
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle size={15} className="mr-2 inline" />
                    {error}
                </div>
            )}
            {submitError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{submitError}</div>}

            <section className="flex flex-col gap-3 rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="inline-flex items-center gap-2 text-xl font-extrabold">Debt Manager</p>
                    <p className="mt-1 text-sm text-white/85">Track, manage, and create a payoff plan for all your debts.</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setEditingDebt(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#0f6b5b]"
                >
                    + Add Debt
                </button>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                <StatCard
                    title="Total debt"
                    value={currency(totalDebtWithLiabilities)}
                    valueClass="text-rose-600"
                />
                <StatCard title="Monthly payments" value={currency(summary.totalMinimumPayment)} valueClass="text-amber-600" />
                <StatCard title="Debt-free date" value={debtFreeDate} valueClass="text-primary-700" />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-base font-bold text-slate-950">Debt Performance</h3>
                    <div className="rounded-xl border border-emerald-100 bg-[#f4faf7] p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Amount repaid since tracking started</p>
                        <p className="mt-1 text-2xl font-extrabold text-emerald-700">{currency(performance.repaidAmount)}</p>
                        <div className="mt-3 h-2 rounded-full bg-emerald-100">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-[#0f6b5b] to-[#2b8f78]"
                                style={{ width: `${Math.min(Math.max(performance.progressPercent, 0), 100)}%` }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{performance.progressPercent.toFixed(1)}% payoff progress</p>
                    </div>

                    <div className={`mt-3 rounded-xl border p-3 ${installmentDueThisMonth > 0 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                        <p className="text-sm font-semibold text-slate-900">Monthly installment tracker</p>
                        {installmentDueThisMonth > 0 ? (
                            <p className="mt-1 text-sm text-amber-800">
                                Reminder: You still need to pay {currency(installmentDueThisMonth)} this month.
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-emerald-800">Great work. This month&apos;s installments are covered.</p>
                        )}
                        <p className="mt-1 text-xs text-slate-600">
                            Paid this month: {currency(paidThisMonthTotal)} | Scheduled: {currency(activeDebtInstallmentsTotal)}
                        </p>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Monthly paydown pace</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-lg font-bold text-slate-900">
                                <TrendingDown size={16} className="text-emerald-600" />
                                {currency(performance.monthlyPaydown)}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Projected debt-free (at current pace)</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-lg font-bold text-slate-900">
                                <TrendingUp size={16} className="text-primary-700" />
                                {performance.projectedDebtFreeByPace || 'Keep making payments'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <p>Income after scheduled debt installments: <span className="font-bold text-slate-900">{currency(incomeAfterInstallments)}</span></p>
                        <p className="mt-1">Income after payments made this month: <span className="font-bold text-slate-900">{currency(incomeAfterPaidThisMonth)}</span></p>
                    </div>
                </article>

                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-base font-bold text-slate-950">Loan Readiness</h3>
                    <div className={`rounded-xl border p-3 ${loanReadiness.tone}`}>
                        <p className="text-xs uppercase tracking-[0.18em]">Readiness status</p>
                        <p className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold">
                            <CheckCircle2 size={18} />
                            {loanReadiness.level}
                        </p>
                        <p className="mt-1 text-sm">{loanReadiness.recommendation}</p>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <p>Payment-to-income ratio: {(loanReadiness.paymentToIncomeRatio * 100).toFixed(1)}%</p>
                        <p>Income used for debt should ideally stay below 35% for stronger eligibility.</p>
                        <p>Use Debt type = `Other` to add non-loan liabilities and track them in total debt.</p>
                    </div>
                </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-base font-bold text-slate-950">Active Debts</h3>
                    <div className="space-y-3">
                        {orderedDebts.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                                No debts added yet. Use + Add Debt to begin.
                            </p>
                        ) : (
                            orderedDebts.map((debt) => {
                                const spentPct = Math.min(Math.max((Number(debt.minimumPayment || 0) / Math.max(Number(debt.balance || 1), 1)) * 100 * 12, 4), 100);
                                const paidThisDebtMonth = getDebtPaidThisMonth(debt.id);
                                const dueForDebt = Math.max(Number(debt.minimumPayment || 0) - paidThisDebtMonth, 0);
                                return (
                                    <div key={debt.id} className="rounded-xl border border-slate-200 bg-[#f7fbf9] px-3 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{debt.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {debt.interestRate ? `${debt.interestRate}% p.a.` : 'Rate not set'} - {currency(debt.minimumPayment)}/mo
                                                </p>
                                            </div>
                                            <p className="text-lg font-extrabold text-slate-900">{currency(debt.balance)}</p>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-slate-200">
                                            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${spentPct}%` }} />
                                        </div>
                                        <div className="mt-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700">
                                            <p>Paid this month: <span className="font-semibold">{currency(paidThisDebtMonth)}</span></p>
                                            <p className={dueForDebt > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                                                {dueForDebt > 0 ? `Still due this month: ${currency(dueForDebt)}` : 'Installment complete for this month'}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={paymentInputs[debt.id] ?? ''}
                                                onChange={(e) => setPaymentInputs((current) => ({ ...current, [debt.id]: e.target.value }))}
                                                placeholder={`Pay ${currency(debt.minimumPayment)}`}
                                                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => recordDebtPayment(debt)}
                                                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                            >
                                                Record payment
                                            </button>
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingDebt(debt);
                                                    setIsModalOpen(true);
                                                }}
                                                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(debt.id)}
                                                className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {paymentError && (
                        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            {paymentError}
                        </div>
                    )}
                </article>

                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-base font-bold text-slate-950">Payoff Strategy</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setStrategy('avalanche')}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${strategy === 'avalanche' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            Avalanche
                        </button>
                        <button
                            type="button"
                            onClick={() => setStrategy('snowball')}
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${strategy === 'snowball' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'}`}
                        >
                            Snowball
                        </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-emerald-100 bg-[#f4faf7] p-3 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">
                            {strategy === 'avalanche' ? 'Avalanche recommendation' : 'Snowball recommendation'}
                        </p>
                        {recommendedDebt ? (
                            <p className="mt-1">
                                Focus {recommendedDebt.name} first {strategy === 'avalanche' ? '(highest interest)' : '(smallest balance)'} then roll payments to the next debt.
                            </p>
                        ) : (
                            <p className="mt-1">Add debts to get a payoff recommendation.</p>
                        )}
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estimated interest saved with extra monthly effort</p>
                        <p className="mt-1 text-3xl font-extrabold text-primary-700">{currency(estimatedInterestSaved)}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary-700">
                            View compare options
                            <ArrowRight size={12} />
                        </p>
                    </div>

                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <p className="inline-flex items-center gap-2 font-semibold"><ShieldAlert size={15} />Debt guidance</p>
                        <p className="mt-1">Keep monthly payments automatic and prioritize high-cost debt first where possible.</p>
                    </div>
                </article>
            </section>
        </div>
    );
};

const StatCard = ({ title, subtitle, value, valueClass }) => (
    <article className="rounded-[1.1rem] border border-emerald-100 bg-white px-4 py-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <p className={`mt-2 text-2xl font-extrabold sm:text-3xl ${valueClass}`}>{value}</p>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </article>
);

export default DebtManagerPanel;
