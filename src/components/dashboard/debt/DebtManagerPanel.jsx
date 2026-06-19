import React, { useEffect, useMemo, useState } from 'react';
import NumericInput from '../../common/NumericInput';
import {
    AlertCircle,
    ArrowRight,
    Calculator,
    CalendarDays,
    CheckCircle2,
    CircleDot,
    Coins,
    FileWarning,
    Landmark,
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
import debtManagerHero from '../../../assets/debt-manager-hero.png';

const currency = (value) => `KES ${Math.round(Number(value || 0)).toLocaleString('en-KE')}`;
const PERFORMANCE_SNAPSHOT_KEY = 'shilingi_debt_performance_snapshot_v1';
const DEBT_PAYMENTS_LOG_KEY = 'shilingi_debt_payments_log_v1';
const DEBT_ONBOARDING_SEEN_KEY = 'shilingi_debt_onboarding_seen_v1';

const toneByType = {
    MORTGAGE: { bar: 'bg-primary-600', pill: 'bg-rose-100 text-rose-600', label: 'High Priority' },
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
    const [activeView, setActiveView] = useState('crb');
    const [debtPaymentsLog, setDebtPaymentsLog] = useState({});
    const [paymentInputs, setPaymentInputs] = useState({});
    const [simulatorExtraPayment, setSimulatorExtraPayment] = useState(5000);
    const [showDebtAddedModal, setShowDebtAddedModal] = useState(false);
    const [hasSeenDebtOnboarding, setHasSeenDebtOnboarding] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(DEBT_ONBOARDING_SEEN_KEY) === 'true';
    });
    const [selectedCalculatorDebtId, setSelectedCalculatorDebtId] = useState('');
    const [loanCalculator, setLoanCalculator] = useState({ type: 'PERSONAL_LOAN', amount: '', monthlyPayment: '', months: '' });
    const [superCalculator, setSuperCalculator] = useState({ type: 'BANK_LOAN', amount: '', monthlyPayment: '', months: '' });

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
    const crbStatus = useMemo(() => {
        const hasRiskStatus = debts.some((item) => ['DEFAULTED', 'OVERDUE'].includes(String(item.status || '').toUpperCase()));
        if (hasRiskStatus) return { label: 'At Risk', helper: 'Review overdue or defaulted debt first.', tone: 'text-rose-500' };
        if (debts.length === 0) return { label: 'Not Started', helper: 'Add debt to start CRB tracking.', tone: 'text-slate-500' };
        if (performance.progressPercent >= 10 || paidThisMonthTotal > 0) return { label: 'Improving', helper: 'Recent payments support a stronger profile.', tone: 'text-[#11814f]' };
        return { label: 'Clear', helper: 'No risky status recorded in your debts.', tone: 'text-[#2167d8]' };
    }, [debts, paidThisMonthTotal, performance.progressPercent]);
    const loanCalculatorRate = useMemo(() => {
        const principal = Number(loanCalculator.amount || 0);
        const payment = Number(loanCalculator.monthlyPayment || 0);
        const months = Math.max(Number(loanCalculator.months || 0), 1);
        if (!principal || !payment) return 0;
        const totalInterest = Math.max(payment * months - principal, 0);
        return principal ? (totalInterest / principal) * (12 / months) * 100 : 0;
    }, [loanCalculator]);
    const superCalculatorRate = useMemo(() => {
        const principal = Number(superCalculator.amount || 0);
        const payment = Number(superCalculator.monthlyPayment || 0);
        const months = Math.max(Number(superCalculator.months || 0), 1);
        if (!principal || !payment) return 0;
        const totalInterest = Math.max(payment * months - principal, 0);
        return principal ? (totalInterest / principal) * (12 / months) * 100 : 0;
    }, [superCalculator]);

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
            .map((item, index) => ({ ...item, percent: (item.amount / total) * 100, color: index === 0 ? 'bg-primary-600' : index === 1 ? 'bg-amber-400' : 'bg-sky-500' }))
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
        { title: 'Net Worth Tracker', subtitle: 'Debts are subtracted from your net worth automatically', action: 'View ->', icon: Coins, onClick: () => onSelectSection?.('networth') },
        { title: 'Market Watch', subtitle: 'Track rates that affect repayments', action: 'Open ->', icon: Target, onClick: () => onSelectSection?.('marketwatch') },
    ];
    const crbReportProviders = [
        { name: 'Metropol', helper: 'Request your credit report or clearance certificate through Metropol channels.', steps: ['Have your national ID ready', 'Request report or clearance certificate', 'Review loan accounts and repayment status'] },
        { name: 'TransUnion', helper: 'Check your credit listing, payment history, and disputes through TransUnion.', steps: ['Confirm identity details', 'Download or request your report', 'Raise a dispute for incorrect listings'] },
        { name: 'Creditinfo', helper: 'Use Creditinfo to review bureau records and follow up on lender-reported accounts.', steps: ['Verify your personal details', 'Request credit report access', 'Check closed, active, and disputed facilities'] },
    ];

    const getDebtPaidThisMonth = (debtId) => monthPayments.filter((entry) => String(entry.debtId) === String(debtId)).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    const handleCalculatorDebtSelect = (debtId) => {
        setSelectedCalculatorDebtId(debtId);
        const selectedDebt = debts.find((debt) => String(debt.id) === String(debtId));
        if (!selectedDebt) {
            setLoanCalculator({ type: 'PERSONAL_LOAN', amount: '', monthlyPayment: '', months: '' });
            setSuperCalculator({ type: 'BANK_LOAN', amount: '', monthlyPayment: '', months: '' });
            return;
        }

        const estimatedMonths = selectedDebt.minimumPayment > 0
            ? Math.max(Math.ceil(Number(selectedDebt.balance || 0) / Number(selectedDebt.minimumPayment || 1)), 1)
            : '';
        setLoanCalculator({
            type: selectedDebt.debtType || 'PERSONAL_LOAN',
            amount: selectedDebt.balance || '',
            monthlyPayment: selectedDebt.minimumPayment || '',
            months: estimatedMonths,
        });
        setSuperCalculator({
            type: selectedDebt.debtType || 'BANK_LOAN',
            amount: selectedDebt.balance || '',
            monthlyPayment: selectedDebt.minimumPayment || '',
            months: estimatedMonths,
        });
    };

    const persistPaymentLog = (nextLog) => {
        setDebtPaymentsLog(nextLog);
        try {
            localStorage.setItem(DEBT_PAYMENTS_LOG_KEY, JSON.stringify(nextLog));
        } catch {
            // no-op
        }
    };

    const markDebtOnboardingSeen = () => {
        setHasSeenDebtOnboarding(true);
        try {
            localStorage.setItem(DEBT_ONBOARDING_SEEN_KEY, 'true');
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
                setActiveView('crb');
                setShowDebtAddedModal(true);
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
            {showDebtAddedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
                    <div className="w-full max-w-[27rem] rounded-[1.25rem] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5f0] text-[#11814f]">
                            <CircleDot size={22} />
                        </div>
                        <p className="mt-4 text-[1.35rem] font-extrabold text-slate-950">Debt added successfully</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">You can now record repayments, choose a payoff strategy, and check how this debt affects your CRB profile.</p>
                        <div className="mt-5 grid gap-2">
                            <button type="button" onClick={() => { setShowDebtAddedModal(false); setActiveView('crb'); }} className="inline-flex items-center justify-center rounded-[0.95rem] bg-[#11814f] px-4 py-3 text-sm font-semibold text-white">
                                Continue to CRB status
                            </button>
                            <button type="button" onClick={() => { setShowDebtAddedModal(false); setActiveView('portfolio'); }} className="inline-flex items-center justify-center rounded-[0.95rem] border border-[#bfe2d6] bg-[#f8fcfa] px-4 py-3 text-sm font-semibold text-[#11814f]">
                                Review payoff strategy
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

            <MobileDebtManager
                activeView={activeView}
                crbReportProviders={crbReportProviders}
                crbStatus={crbStatus}
                debtBreakdown={debtBreakdown}
                debtFreeDate={debtFreeDate}
                debts={debts}
                getDebtPaidThisMonth={getDebtPaidThisMonth}
                handleCalculatorDebtSelect={handleCalculatorDebtSelect}
                handleDelete={handleDelete}
                loanCalculator={loanCalculator}
                loanCalculatorRate={loanCalculatorRate}
                orderedDebts={orderedDebts}
                paymentError={paymentError}
                paymentInputs={paymentInputs}
                performance={performance}
                quickRateComparisons={quickRateComparisons}
                recordDebtPayment={recordDebtPayment}
                recommendedDebt={recommendedDebt}
                selectedCalculatorDebtId={selectedCalculatorDebtId}
                setActiveView={setActiveView}
                setEditingDebt={setEditingDebt}
                hasSeenDebtOnboarding={hasSeenDebtOnboarding}
                markDebtOnboardingSeen={markDebtOnboardingSeen}
                setIsModalOpen={setIsModalOpen}
                setLoanCalculator={setLoanCalculator}
                setPaymentInputs={setPaymentInputs}
                setSimulatorExtraPayment={setSimulatorExtraPayment}
                setStrategy={setStrategy}
                setSuperCalculator={setSuperCalculator}
                simulatorExtraPayment={simulatorExtraPayment}
                simulatorProjection={simulatorProjection}
                strategy={strategy}
                summary={summary}
                superCalculator={superCalculator}
                superCalculatorRate={superCalculatorRate}
                totalDebtWithLiabilities={totalDebtWithLiabilities}
            />

            <div className="hidden space-y-4 md:block">
            <section className="overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] px-4 py-4 text-white shadow-sm sm:px-5">
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
                <StatCard title="Monthly Repayments" value={currency(summary.totalMinimumPayment)} valueClass="text-amber-700" subtitle={`${monthlyPaymentRatio.toFixed(1)}% of monthly income`} />
                <StatCard title="CRB Status" value={crbStatus.label} valueClass={crbStatus.tone} subtitle={crbStatus.helper} />
                <StatCard title="Debt-Free Date" value={debtFreeDate} valueClass="text-[#13584d]" subtitle="At current pace" />
            </section>

            <section className="rounded-[1.1rem] border border-emerald-100 bg-white p-1 shadow-sm"><div className="flex flex-wrap gap-2"><TabButton active={activeView === 'crb'} onClick={() => setActiveView('crb')}>My CRB Status</TabButton><TabButton active={activeView === 'portfolio'} onClick={() => setActiveView('portfolio')}>My Loans</TabButton><TabButton active={activeView === 'solutions'} onClick={() => setActiveView('solutions')}>Explore My Loan Solutions</TabButton><TabButton active={activeView === 'simulator'} onClick={() => setActiveView('simulator')}>Loan Calculators</TabButton></div></section>

            {activeView === 'portfolio' && (
                <div className="space-y-4">
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
                                                    <NumericInput value={paymentInputs[debt.id] ?? ''} onChange={(e) => setPaymentInputs((current) => ({ ...current, [debt.id]: e.target.value }))} placeholder={`Pay ${currency(debt.minimumPayment)}`} className="w-full rounded-[0.95rem] border border-slate-300 px-3 py-2 text-sm" />
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
                        <PanelHeading icon={Target} title="Loan Performance" />
                        <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1.1fr]">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-[#9bb8af]">Amount Repaid Since Tracking Started</p>
                                <p className="mt-1 text-[2.3rem] font-extrabold leading-none text-[#175f54]">{currency(performance.repaidAmount)}</p>
                                <div className="mt-4 h-2 rounded-full bg-[#e6f2ee]"><div className="h-2 rounded-full bg-[#19725f]" style={{ width: `${Math.min(Math.max(performance.progressPercent, 0), 100)}%` }} /></div>
                                <p className="mt-2 text-sm text-[#9bb8af]">{performance.progressPercent.toFixed(1)}% payoff progress overall</p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoMiniCard label="Monthly Paydown Pace" value={currency(performance.monthlyPaydown)} helper="Projected pace (annualised)" valueClass="text-rose-500" />
                                <InfoMiniCard label="Projected Debt-Free" value={performance.projectedDebtFreeByPace || 'Keep paying'} helper="At current extra payments" valueClass="text-[#175f54]" />
                                <InfoMiniCard label="Income After Installments" value={currency(incomeAfterInstallments)} helper="After scheduled monthly repayments" valueClass="text-[#2167d8]" />
                                <InfoMiniCard label="Income After Paid This Month" value={currency(incomeAfterPaidThisMonth)} helper="After payments already logged" valueClass="text-amber-700" />
                            </div>
                        </div>
                        <div className="mt-5 rounded-[1rem] border border-emerald-200 bg-[#eef8f3] p-4">
                            <p className="text-base font-semibold text-slate-900">Monthly Installment Tracker</p>
                            <p className="mt-1 text-sm text-[#175f54]">{installmentDueThisMonth > 0 ? `You still need to cover ${currency(installmentDueThisMonth)} this month.` : "This month's installments are covered."}</p>
                            <p className="mt-2 text-sm text-slate-700">Paid this month: <span className="font-semibold">{currency(paidThisMonthTotal)}</span> | Scheduled: <span className="font-semibold">{currency(activeDebtInstallmentsTotal)}</span></p>
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

                    <section className="overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,_#18765e_0%,_#1b8a64_48%,_#38a96b_100%)] p-5 text-white shadow-sm">
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

            {activeView === 'crb' && (
                <section className="space-y-4">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <PanelHeading icon={ShieldAlert} title="My CRB Status" />
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Use this section to understand where to request your CRB report, what to check, and what to do after reviewing your listing.</p>
                            </div>
                            <div className={`rounded-[1rem] border px-4 py-3 ${crbStatus.label === 'At Risk' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#bfe2d6] bg-[#edf8f3] text-[#11814f]'}`}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Current CRB Status</p>
                                <p className="mt-1 text-2xl font-extrabold">{crbStatus.label}</p>
                                <p className="mt-1 text-sm">{crbStatus.helper}</p>
                            </div>
                        </div>
                    </article>

                    <section className="grid gap-4 xl:grid-cols-3">
                        {crbReportProviders.map((provider) => (
                            <article key={provider.name} className="rounded-[1.2rem] border border-emerald-100 bg-white p-5 shadow-sm">
                                <p className="text-[1.2rem] font-extrabold text-slate-950">{provider.name}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{provider.helper}</p>
                                <div className="mt-4 space-y-2">
                                    {provider.steps.map((step) => (
                                        <div key={step} className="flex items-start gap-2 rounded-[0.9rem] bg-[#f8fcfa] px-3 py-2 text-sm text-slate-700">
                                            <CircleDot size={14} className="mt-0.5 shrink-0 text-[#11814f]" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="mt-4 inline-flex w-full items-center justify-center rounded-[0.9rem] border border-[#bfe2d6] bg-[#edf8f3] px-4 py-2.5 text-sm font-semibold text-[#11814f]">
                                    Prepare request
                                </button>
                            </article>
                        ))}
                    </section>

                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Target} title="What to Check in Your CRB Report" />
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <ChecklistRow text="All active loans match debts you recognise" />
                            <ChecklistRow text="Closed accounts are marked as closed or paid off" />
                            <ChecklistRow text="There are no unknown lenders or duplicate facilities" />
                            <ChecklistRow text="Repayment history reflects recent payments" />
                            <ChecklistRow text="Default or overdue listings have a clear lender to follow up with" />
                            <ChecklistRow text="Personal details match your ID and phone details" />
                        </div>
                    </article>
                </section>
            )}

            {activeView === 'solutions' && (
                <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                        <PanelHeading icon={Sparkles} title="Explore My Loan Solutions" />
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
                <section className="space-y-4">
                    <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Calculator} title="Debt Payoff Calculator" />
                            <p className="mt-3 text-sm text-slate-600">Test how much faster you could become debt-free by adding a little more each month.</p>
                            <div className="mt-5 rounded-[1rem] border border-emerald-100 bg-[#eef8f3] p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[#9bb8af]">Extra Monthly Payment</p><p className="mt-1 text-[2rem] font-extrabold text-[#175f54]">{currency(simulatorExtraPayment)}</p></div><p className="text-sm text-slate-600">Added on top of scheduled debt payments</p></div><input type="range" min="0" max="50000" step="1000" value={simulatorExtraPayment} onChange={(event) => setSimulatorExtraPayment(Number(event.target.value))} className="mt-4 w-full accent-[#19725f]" /></div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3"><InfoMiniCard label="Projected Debt-Free" value={simulatorProjection.debtFreeDate} helper="With extra payment" valueClass="text-[#175f54]" /><InfoMiniCard label="Months Saved" value={`${simulatorProjection.freedMonths}`} helper="Compared to current pace" valueClass="text-[#2167d8]" /><InfoMiniCard label="Est. Interest Saved" value={currency(simulatorProjection.extraSavings)} helper="Approximate savings" valueClass="text-amber-700" /></div>
                        </article>

                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={TrendingDown} title="Recommended Next Move" />
                            <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">{recommendedDebt ? `Direct the extra ${currency(simulatorExtraPayment)} to ${recommendedDebt.name}` : 'Add debts to get a recommendation'}</p><p className="mt-2 text-sm text-slate-600">{recommendedDebt ? `Because you are using the ${strategy} method, this debt gives the strongest payoff impact right now.` : 'Once debts are added, the simulator will tell you where extra payments work best.'}</p></div>
                            <button type="button" onClick={() => setActiveView('portfolio')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#11814f] px-4 py-3 text-sm font-semibold text-white">Back to My Loans</button>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-2">
                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Coins} title="Normal Loan Calculator" />
                            <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-700">Prefill from saved debt<select value={selectedCalculatorDebtId} onChange={(event) => handleCalculatorDebtSelect(event.target.value)} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]"><option value="">Choose saved debt</option>{debts.map((debt) => <option key={`loan-${debt.id}`} value={debt.id}>{debt.name}</option>)}</select></label>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Loan type<select value={loanCalculator.type} onChange={(event) => setLoanCalculator((current) => ({ ...current, type: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]"><option value="PERSONAL_LOAN">Personal Loan</option><option value="MOBILE_LOAN">Mobile Loan</option><option value="SACCO_LOAN">SACCO Loan</option><option value="BANK_LOAN">Bank Loan</option><option value="MORTGAGE">Mortgage</option><option value="CAR_LOAN">Car Loan</option><option value="BUSINESS_LOAN">Business Loan</option></select></label>
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Loan amount<NumericInput value={loanCalculator.amount} onChange={(event) => setLoanCalculator((current) => ({ ...current, amount: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]" /></label>
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Monthly repayment<NumericInput value={loanCalculator.monthlyPayment} onChange={(event) => setLoanCalculator((current) => ({ ...current, monthlyPayment: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]" /></label>
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Duration (months)<input type="number" min="1" value={loanCalculator.months} onChange={(event) => setLoanCalculator((current) => ({ ...current, months: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]" /></label>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <InfoMiniCard label="Estimated Interest Rate" value={`${loanCalculatorRate.toFixed(2)}%`} helper="Approximate annualized rate" valueClass="text-[#11814f]" />
                                <InfoMiniCard label="Total Repayment" value={currency(Number(loanCalculator.monthlyPayment || 0) * Number(loanCalculator.months || 0))} helper="Based on monthly repayment" valueClass="text-amber-700" />
                            </div>
                        </article>

                        <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                            <PanelHeading icon={Sparkles} title="Super Loan Calculator" />
                            <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-700">Prefill from saved debt<select value={selectedCalculatorDebtId} onChange={(event) => handleCalculatorDebtSelect(event.target.value)} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]"><option value="">Choose saved debt</option>{debts.map((debt) => <option key={`super-${debt.id}`} value={debt.id}>{debt.name}</option>)}</select></label>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Loan type<select value={superCalculator.type} onChange={(event) => setSuperCalculator((current) => ({ ...current, type: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]"><option value="PERSONAL_LOAN">Personal Loan</option><option value="MOBILE_LOAN">Mobile Loan</option><option value="SACCO_LOAN">SACCO Loan</option><option value="BANK_LOAN">Bank Loan</option><option value="MORTGAGE">Mortgage</option><option value="CAR_LOAN">Car Loan</option><option value="BUSINESS_LOAN">Business Loan</option></select></label>
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Loan amount<NumericInput value={superCalculator.amount} onChange={(event) => setSuperCalculator((current) => ({ ...current, amount: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]" /></label>
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Monthly repayment<NumericInput value={superCalculator.monthlyPayment} onChange={(event) => setSuperCalculator((current) => ({ ...current, monthlyPayment: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]" /></label>
                                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Duration (months)<input type="number" min="1" value={superCalculator.months} onChange={(event) => setSuperCalculator((current) => ({ ...current, months: event.target.value }))} className="rounded-[0.9rem] border border-[#d8ece3] px-3 py-2.5 text-sm outline-none focus:border-[#11814f]" /></label>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <InfoMiniCard label="Estimated Interest Rate" value={`${superCalculatorRate.toFixed(2)}%`} helper="Approximate annualized rate" valueClass="text-[#11814f]" />
                                <InfoMiniCard label="Total Repayment" value={currency(Number(superCalculator.monthlyPayment || 0) * Number(superCalculator.months || 0))} helper="Based on monthly repayment" valueClass="text-amber-700" />
                            </div>
                        </article>
                    </section>
                </section>
            )}
            </div>
        </div>
    );
};

const MobileDebtManager = ({
    activeView,
    crbReportProviders,
    crbStatus,
    debtBreakdown,
    debtFreeDate,
    debts,
    getDebtPaidThisMonth,
    handleCalculatorDebtSelect,
    handleDelete,
    loanCalculator,
    loanCalculatorRate,
    orderedDebts,
    paymentError,
    paymentInputs,
    performance,
    quickRateComparisons,
    recordDebtPayment,
    recommendedDebt,
    selectedCalculatorDebtId,
    setActiveView,
    setEditingDebt,
    hasSeenDebtOnboarding,
    markDebtOnboardingSeen,
    setIsModalOpen,
    setLoanCalculator,
    setPaymentInputs,
    setSimulatorExtraPayment,
    setStrategy,
    setSuperCalculator,
    simulatorExtraPayment,
    simulatorProjection,
    strategy,
    summary,
    superCalculator,
    superCalculatorRate,
    totalDebtWithLiabilities,
}) => {
    const activeDebts = orderedDebts.filter((debt) => String(debt.status || '').toUpperCase() !== 'PAID_OFF');
    const hasCrbScore = false;
    const shouldShowOnboarding = !hasSeenDebtOnboarding && debts.length === 0;
    const mobileTabs = [
        { id: 'crb', label: 'All' },
        { id: 'portfolio', label: 'My Loans' },
        { id: 'solutions', label: 'Solutions' },
        { id: 'simulator', label: 'Calculator' },
    ];

    return (
        <section className="md:hidden">
            <div className="mx-auto min-h-[calc(100vh-9rem)] max-w-[390px] bg-[#f8f8f8] px-3 pb-24 pt-1">
                <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 pb-2">
                        <p className="text-[12px] leading-4 text-[#111827]">Welcome to your</p>
                        <h1 className="text-[18px] font-extrabold leading-6 text-[#0c6060]">Debt Manager</h1>
                        <p className="mt-0.5 text-[12px] leading-4 text-[#111827]">Let&apos;s take your debt management seriously</p>
                    </div>
                    <img src={debtManagerHero} alt="" className="h-24 w-[143px] shrink-0 object-contain object-bottom" />
                </div>

                {shouldShowOnboarding ? (
                    <MobileDebtOnboarding
                        onGetStarted={() => {
                            markDebtOnboardingSeen();
                            setEditingDebt(null);
                            setIsModalOpen(true);
                        }}
                        onSkip={() => {
                            markDebtOnboardingSeen();
                            setActiveView('crb');
                        }}
                    />
                ) : (
                    <>
                <div className="mt-6 flex gap-1.5 overflow-x-auto pb-3">
                    {mobileTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveView(tab.id)}
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium ${activeView === tab.id ? 'border-[#eabb3a] bg-[#eabb3a] text-white' : 'border-[#dde1ea] bg-white text-[#5e6a80]'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeView === 'crb' && (
                    <div className="space-y-4">
                        <MobileDebtStats
                            crbStatus={crbStatus}
                            debtFreeDate={debtFreeDate}
                            summary={summary}
                            totalDebtWithLiabilities={totalDebtWithLiabilities}
                        />
                        <MobileCrbStatusCard crbStatus={crbStatus} hasCrbScore={hasCrbScore} onPrepare={() => setActiveView('crb')} />
                        <MobileProviderCards providers={crbReportProviders} />
                        <MobileCrbChecklist />
                    </div>
                )}

                {activeView === 'portfolio' && (
                    <div className="space-y-3">
                        <MobileLoansOverviewPanel
                            debts={activeDebts}
                            debtBreakdown={debtBreakdown}
                            getDebtPaidThisMonth={getDebtPaidThisMonth}
                            handleDelete={handleDelete}
                            paymentError={paymentError}
                            paymentInputs={paymentInputs}
                            performance={performance}
                            recordDebtPayment={recordDebtPayment}
                            setEditingDebt={setEditingDebt}
                            setIsModalOpen={setIsModalOpen}
                            setPaymentInputs={setPaymentInputs}
                            totalDebtWithLiabilities={totalDebtWithLiabilities}
                        />
                    </div>
                )}

                {activeView === 'solutions' && (
                    <MobileSolutionsOverviewPanel orderedDebts={orderedDebts} quickRateComparisons={quickRateComparisons} recommendedDebt={recommendedDebt} setActiveView={setActiveView} />
                )}

                {activeView === 'simulator' && (
                    <MobileCalculatorsOverviewPanel
                        debts={debts}
                        handleCalculatorDebtSelect={handleCalculatorDebtSelect}
                        loanCalculator={loanCalculator}
                        loanCalculatorRate={loanCalculatorRate}
                        selectedCalculatorDebtId={selectedCalculatorDebtId}
                        setLoanCalculator={setLoanCalculator}
                        setSimulatorExtraPayment={setSimulatorExtraPayment}
                        setStrategy={setStrategy}
                        setSuperCalculator={setSuperCalculator}
                        simulatorExtraPayment={simulatorExtraPayment}
                        simulatorProjection={simulatorProjection}
                        strategy={strategy}
                        superCalculator={superCalculator}
                        superCalculatorRate={superCalculatorRate}
                    />
                )}
                    </>
                )}
            </div>
        </section>
    );
};

const MobileDebtOnboarding = ({ onGetStarted, onSkip }) => {
    const steps = [
        {
            title: 'Add your debts',
            helper: 'Start with the loan type, balance, monthly payment, and due date.',
        },
        {
            title: 'Check your CRB path',
            helper: 'Know where to request a report and what details to review.',
        },
        {
            title: 'Choose a payoff strategy',
            helper: 'Use avalanche or snowball guidance to decide what to clear first.',
        },
    ];

    return (
        <article className="mt-5 pb-2">
            <div className="rounded-[18px] bg-white px-4 py-5 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-[176px] w-full items-center justify-center">
                        <div className="absolute inset-x-8 top-4 h-[132px] rounded-[16px] bg-[#f6fbff]" />
                        <img src={debtManagerHero} alt="" className="relative h-[154px] w-[230px] object-contain object-bottom" />
                    </div>

                    <h2 className="mt-1 text-[16px] font-extrabold leading-6 text-[#232e3d]">Welcome,</h2>
                    <div className="mt-3 rounded-full bg-[linear-gradient(124deg,rgba(234,187,58,0.44)_0%,rgba(234,187,58,0)_93%)] px-4 py-2 text-[12px] leading-4 text-[#232e3d]">
                        Let&apos;s get you started
                    </div>
                    <p className="mt-4 max-w-[19rem] text-[12px] leading-5 text-[#707974]">
                        Let&apos;s set your debt manager to get you ready for the next steps to manage your debts.
                    </p>
                </div>

                <div className="mt-6 space-y-0">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        return (
                            <div key={step.title} className="grid grid-cols-[32px_1fr] gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#11814f] text-white">
                                        {isLast ? <CheckCircle2 size={14} /> : <CircleDot size={14} />}
                                    </span>
                                    {!isLast && <span className="h-8 w-px bg-[#b7dfd0]" />}
                                </div>
                                <div className={isLast ? 'pb-0' : 'pb-4'}>
                                    <h3 className="text-[13px] font-bold leading-4 text-[#232e3d]">{step.title}</h3>
                                    <p className="mt-1 text-[11px] leading-4 text-[#707974]">{step.helper}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                type="button"
                onClick={onGetStarted}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#0c6060] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(12,96,96,0.22)]"
            >
                Get Started
            </button>
            <button
                type="button"
                onClick={onSkip}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#0c6060] bg-white px-5 py-3 text-[13px] font-semibold text-[#0c6060]"
            >
                Skip
            </button>
        </article>
    );
};

const MobileDebtStats = ({ crbStatus, debtFreeDate, summary, totalDebtWithLiabilities }) => {
    const items = [
        { label: 'Total Debt', value: currency(totalDebtWithLiabilities), helper: totalDebtWithLiabilities > 0 ? 'Add more if you have more' : 'No debt added yet', icon: WalletCards },
        { label: 'Monthly Repayments', value: currency(summary.totalMinimumPayment), helper: 'Monthly repayments', icon: CalendarDays },
        { label: 'CRB Status', value: crbStatus.label, helper: crbStatus.helper, icon: ShieldAlert },
        { label: 'Debt-free date', value: debtFreeDate, helper: 'At current pace', icon: Target, wide: true },
    ];

    return (
        <div className="grid grid-cols-3 gap-[5px]">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <article key={item.label} className={`rounded-[10px] bg-white p-2 shadow-[0_0_1px_rgba(0,0,0,0.12)] ${item.wide ? 'col-span-3' : ''}`}>
                        <Icon size={16} className="text-[#eabb3a]" />
                        <p className="mt-1 text-[8px] leading-3 text-[#232e3d]">{item.label}</p>
                        <p className="mt-0.5 break-words text-[12px] font-semibold leading-4 text-[#0c6060]">{item.value}</p>
                        <p className="mt-0.5 line-clamp-2 text-[8px] leading-3 text-[#232e3d]">{item.helper}</p>
                    </article>
                );
            })}
        </div>
    );
};

const MobileCrbStatusCard = ({ crbStatus, hasCrbScore, onPrepare }) => (
    <article className="rounded-2xl border border-[#e3e3e5] bg-white p-4 shadow-[0_32px_25.5px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#dde1ea] pb-2">
            <h2 className="text-[16px] font-semibold leading-6 text-[#0c6060]">CRB Status</h2>
            <p className="text-[12px] leading-[18px] text-[#707974]">Use this section to understand where to request your CRB report, what to check, and what to do after reviewing your listing.</p>
        </div>
        {hasCrbScore ? (
            <div className="py-5 text-center">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-[#eabb3a] bg-white">
                    <div>
                        <p className="text-[14px] font-semibold text-[#707974]">Good</p>
                        <p className="text-[44px] font-extrabold leading-none text-[#141c2b]">660</p>
                        <p className="text-[12px] text-[#eabb3a]">+6pts</p>
                    </div>
                </div>
                <p className="mt-2 text-[12px] text-[#707974]">Last update from your CRB data</p>
            </div>
        ) : (
            <div className="py-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#dde1ea] bg-[#eff1f5]">
                    <FileWarning size={34} className="text-[#0c6060]" />
                </div>
                <h3 className="mt-5 text-[18px] font-bold leading-6 text-[#141c2b]">No CRB Status</h3>
                <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-5 text-[#8e97ab]">Prepare your CRB Status to get your most recent Credit score on your debts</p>
                <button type="button" onClick={onPrepare} className="mt-3 rounded-full bg-[#0c6060] px-7 py-3 text-[14px] font-semibold text-white">Prepare Request</button>
            </div>
        )}
        <div className="rounded-full bg-[linear-gradient(124deg,rgba(234,187,58,0.44)_0%,rgba(234,187,58,0)_93%)] px-4 py-2 text-[12px] text-[#232e3d]">
            {hasCrbScore ? 'Congrats! you are managing your debts well' : crbStatus.helper || 'Kindly request your CRB Status!'}
        </div>
    </article>
);

const MobileProviderCards = ({ providers }) => (
    <div className="space-y-3">
        {providers.map((provider) => (
            <article key={provider.name} className="flex min-h-[180px] items-center justify-between gap-2 rounded-lg bg-[linear-gradient(180deg,rgba(243,240,208,0.4)_0%,#f9fbf8_100%)] px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
                <div className="max-w-[218px] text-[#aa5d04]">
                    <h3 className="text-[14px] font-semibold leading-4 tracking-[0.5px]">{provider.name}</h3>
                    <p className="mt-2 text-[12px] font-light leading-4 tracking-[0.4px]">{provider.helper}</p>
                    <button type="button" className="mt-6 rounded-full border border-[#aa5d04] bg-white/50 px-4 py-1.5 text-[12px] text-[#aa5d04]">Prepare Request</button>
                </div>
                <div className="shrink-0 text-right text-[10px] font-bold uppercase tracking-wide text-[#0c6060]">{provider.name}</div>
            </article>
        ))}
    </div>
);

const MobileCrbChecklist = () => {
    const checks = [
        'All active loans match debts you recognise',
        'There are no unknown lenders or duplicate facilities',
        'Default or overdue listings have a clear lender to follow up with',
        'Closed accounts are marked as closed or paid off',
        'Repayment history reflects recent payments',
        'Personal details match your ID and phone details',
    ];

    return (
        <article className="overflow-hidden rounded-2xl">
            <div className="flex items-start justify-between bg-[#eabb3a] p-4 text-white">
                <div>
                    <h2 className="text-[14px] font-bold capitalize leading-5">What to Check in Your CRB Report</h2>
                    <p className="mt-1 text-[12px] leading-5">what to check, and what to do after reviewing your listing.</p>
                </div>
                <CheckCircle2 size={16} />
            </div>
            <div className="bg-[#f4f5f5] p-2">
                <div className="overflow-hidden rounded-2xl border border-[#ededed]">
                    {checks.map((check) => (
                        <div key={check} className="flex items-start gap-4 border-b border-[#ededed] bg-white px-6 py-4 last:border-b-0">
                            <p className="flex-1 text-[12px] leading-5 text-[#171717]">{check}</p>
                            <CheckCircle2 size={16} className="shrink-0 text-[#eabb3a]" />
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
};

const MobileLoansOverviewPanel = ({
    debtBreakdown,
    debts,
    getDebtPaidThisMonth,
    handleDelete,
    paymentError,
    paymentInputs,
    performance,
    recordDebtPayment,
    setEditingDebt,
    setIsModalOpen,
    setPaymentInputs,
    totalDebtWithLiabilities,
}) => {
    const progress = Math.max(0, Math.min(100, Number(performance?.progressPercent || 0)));
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="space-y-3">
            <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
                <div className="flex items-start justify-between gap-3 border-b border-[#edf0f3] pb-2">
                    <div>
                        <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Active Debts</h2>
                        <p className="mt-1 text-[10px] leading-4 text-[#707974]">Track all your active debts and manage them to be able to pay them off swiftly</p>
                    </div>
                    <button type="button" onClick={() => { setEditingDebt(null); setIsModalOpen(true); }} className="shrink-0 text-[10px] font-semibold text-[#eabb3a]">+ Add Debt</button>
                </div>

                {debts.length === 0 ? (
                    <div className="py-5 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#dde1ea] bg-[#eff1f5]">
                            <Landmark size={34} className="text-[#0c6060]" />
                        </div>
                        <h3 className="mt-5 text-[18px] font-bold leading-6 text-[#141c2b]">No Active Debts</h3>
                        <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-5 text-[#8e97ab]">Add your debts to manage them and pay them off swiftly to be safe</p>
                        <button type="button" onClick={() => { setEditingDebt(null); setIsModalOpen(true); }} className="mt-3 rounded-full bg-[#0c6060] px-7 py-3 text-[14px] font-semibold text-white">Add Debt</button>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {debts.map((debt) => {
                            const paidThisMonth = getDebtPaidThisMonth(debt.id);
                            const remaining = Math.max(Number(debt.minimumPayment || 0) - paidThisMonth, 0);
                            return (
                                <article key={debt.id} className="rounded-[10px] border border-[#edf0f3] bg-[#fbfdfc] p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-semibold text-rose-600">{formatDebtType(debt.debtType)}</p>
                                            <h3 className="mt-2 truncate text-[13px] font-bold text-[#141c2b]">{debt.name}</h3>
                                            <p className="mt-1 text-[10px] text-[#707974]">Interest rate: {debt.interestRate || 0}%</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-[10px] text-[#707974]">Current Balance</p>
                                            <p className="text-[13px] font-extrabold text-[#0c6060]">{currency(debt.balance)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 rounded-lg bg-white px-3 py-2 text-[10px] text-[#5e6a80]">
                                        Monthly repayment: <span className="font-semibold text-[#0c6060]">{currency(debt.minimumPayment)}</span>
                                        <br />
                                        Remaining this month: <span className="font-semibold text-[#aa5d04]">{currency(remaining)}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <NumericInput value={paymentInputs[debt.id] ?? ''} onChange={(event) => setPaymentInputs((current) => ({ ...current, [debt.id]: event.target.value }))} placeholder={`Pay ${currency(debt.minimumPayment)}`} className="min-w-0 flex-1 rounded-full border border-[#dde1ea] px-3 py-2 text-[11px]" />
                                        <button type="button" onClick={() => recordDebtPayment(debt)} className="rounded-full bg-[#0c6060] px-4 py-2 text-[11px] font-semibold text-white">Pay</button>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <button type="button" onClick={() => { setEditingDebt(debt); setIsModalOpen(true); }} className="flex-1 rounded-full border border-[#dde1ea] bg-white px-3 py-2 text-[11px] font-semibold text-[#0c6060]">Edit</button>
                                        <button type="button" onClick={() => handleDelete(debt.id)} className="flex-1 rounded-full border border-rose-200 bg-white px-3 py-2 text-[11px] font-semibold text-rose-600">Delete</button>
                                    </div>
                                </article>
                            );
                        })}
                        {paymentError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{paymentError}</div>}
                    </div>
                )}
            </article>

            <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
                <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Loan Performance</h2>
                <p className="mt-1 text-[10px] leading-4 text-[#707974]">Here is your overall loan performance after you started tracking your loans.</p>
                <div className="mt-4 flex items-center justify-center">
                    <div className="relative h-[132px] w-[132px]">
                        <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
                            <circle cx="56" cy="56" r="42" fill="none" stroke="#d9eeee" strokeWidth="12" />
                            <circle cx="56" cy="56" r="42" fill="none" stroke="#0c6060" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] text-[#707974]">Amount Repaid</span>
                            <span className="mt-1 text-[14px] font-extrabold text-[#232e3d]">{currency(performance?.repaidAmount || 0)}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-3 rounded-[10px] bg-[#e9fff1] px-3 py-2">
                    <p className="text-[11px] font-semibold text-[#11814f]">Monthly Installment Tracker</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#707974]">
                        {progress > 0 ? `You have repaid ${progress.toFixed(1)}% from your starting balance.` : `Track payments against ${currency(totalDebtWithLiabilities)} in active balances.`}
                    </p>
                </div>
            </article>

            <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
                <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Debt Breakdown by Category</h2>
                <p className="mt-1 text-[10px] leading-4 text-[#707974]">Here is your overall debt breakdown by category</p>
                <div className="mt-4 space-y-2">
                    {debtBreakdown.length === 0 ? (
                        <p className="rounded-[10px] border border-dashed border-[#dde1ea] bg-[#f8f8f8] p-3 text-[11px] text-[#707974]">Add debts to see category breakdown.</p>
                    ) : debtBreakdown.map((item, index) => (
                        <div key={item.label} className="rounded-[10px] border border-[#edf0f3] bg-[#fbfdfc] p-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold text-[#232e3d]">{index + 1}. {item.label}</span>
                                <span className="rounded-full bg-[#f3efff] px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">{item.percent.toFixed(0)}%</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-[#edf0f3]">
                                <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${Math.max(item.percent, 2)}%` }} />
                            </div>
                            <p className="mt-2 text-[10px] text-[#707974]">{currency(item.amount)}</p>
                        </div>
                    ))}
                </div>
            </article>
        </div>
    );
};

const MobileSolutionsOverviewPanel = ({ orderedDebts, quickRateComparisons, recommendedDebt, setActiveView }) => (
    <div className="space-y-3">
        <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
            <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Explore Solutions</h2>
            <p className="mt-1 text-[10px] leading-4 text-[#707974]">Manage your loans by applying one of the strategies to clear your debt early.</p>
            {orderedDebts.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-[#dde1ea] bg-[#f8f8f8] p-4 text-[12px] text-[#707974]">Add debts first so we can suggest refinancing and restructuring options.</p>
            ) : (
                <div className="mt-4 space-y-3">
                    {orderedDebts.slice(0, 2).map((debt) => (
                        <div key={`${debt.id}-mobile-solution-overview`} className="rounded-[10px] border border-[#edf0f3] bg-[#fbfdfc] p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-bold text-[#141c2b]">{debt.name}</p>
                                    <p className="mt-1 text-[10px] text-[#707974]">{formatDebtType(debt.debtType)} - {debt.interestRate || 0}% interest</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-[10px] text-[#707974]">Current Balance</p>
                                    <p className="text-[12px] font-bold text-[#0c6060]">{currency(debt.balance)}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button type="button" onClick={() => setActiveView('simulator')} className="rounded-full bg-[#0c6060] px-4 py-2 text-[11px] font-semibold text-white">Simulate Savings</button>
                                <button type="button" className="rounded-full border border-[#dde1ea] bg-white px-4 py-2 text-[11px] font-semibold text-[#707974]">Compare Options</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </article>
        <article className="rounded-[10px] bg-[#fff7e8] p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
            <h3 className="text-[13px] font-bold text-[#aa5d04]">What to Compare</h3>
            <p className="mt-1 text-[10px] leading-4 text-[#aa5d04]">What to check, and what to do after reviewing your debts.</p>
            <div className="mt-3 space-y-2">
                {[
                    'Lower interest rate than your current debt',
                    'Reduced monthly installment pressure',
                    'Lower total repayment cost over time',
                    'Penalty-free early repayment if possible',
                    'Products that support consolidation for multiple debts',
                ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[8px] bg-white px-3 py-2">
                        <p className="flex-1 text-[11px] leading-4 text-[#232e3d]">{item}</p>
                        <CheckCircle2 size={14} className="shrink-0 text-[#eabb3a]" />
                    </div>
                ))}
            </div>
        </article>
        <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
            <h3 className="text-[13px] font-bold text-[#141c2b]">Quick Rate Snapshot</h3>
            <div className="mt-3 space-y-2">
                {(quickRateComparisons || []).slice(0, 3).map((item) => (
                    <div key={item.lender} className="flex items-center justify-between rounded-[8px] border border-[#edf0f3] px-3 py-2">
                        <span className="text-[11px] font-semibold text-[#232e3d]">{item.lender}</span>
                        <span className="text-[11px] font-bold text-[#0c6060]">{item.rate}</span>
                    </div>
                ))}
            </div>
            <p className="mt-3 text-[11px] leading-4 text-[#707974]">{recommendedDebt ? `Start with ${recommendedDebt.name}, then compare cost before switching lenders.` : 'Once debts are added, Shilingi Moves will show the strongest payoff move.'}</p>
        </article>
    </div>
);

const MobileLoansPanel = ({ debts, getDebtPaidThisMonth, handleDelete, paymentError, paymentInputs, recordDebtPayment, setEditingDebt, setIsModalOpen, setPaymentInputs }) => (
    <article className="rounded-2xl border border-[#e3e3e5] bg-white p-4 shadow-[0_32px_25.5px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#dde1ea] pb-2">
            <h2 className="text-[16px] font-semibold leading-6 text-[#0c6060]">Active Debts</h2>
            <p className="text-[12px] leading-[18px] text-[#707974]">Track all your active debts and manage them to be able to pay them off swiftly</p>
        </div>
        {debts.length === 0 ? (
            <div className="py-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#dde1ea] bg-[#eff1f5]">
                    <Landmark size={34} className="text-[#0c6060]" />
                </div>
                <h3 className="mt-5 text-[18px] font-bold leading-6 text-[#141c2b]">No Active Debts</h3>
                <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-5 text-[#8e97ab]">Add your debts to manage them and pay them off swiftly to be safe</p>
                <button type="button" onClick={() => { setEditingDebt(null); setIsModalOpen(true); }} className="mt-3 rounded-full bg-[#0c6060] px-7 py-3 text-[14px] font-semibold text-white">Add Debt</button>
                <div className="mt-4 rounded-full bg-[linear-gradient(124deg,rgba(234,187,58,0.44)_0%,rgba(234,187,58,0)_93%)] px-4 py-2 text-left text-[12px] text-[#232e3d]">Kindly add your debts to track them easily!</div>
            </div>
        ) : (
            <div className="mt-4 space-y-3">
                {debts.map((debt) => {
                    const paidThisMonth = getDebtPaidThisMonth(debt.id);
                    const remaining = Math.max(Number(debt.minimumPayment || 0) - paidThisMonth, 0);
                    return (
                        <article key={debt.id} className="rounded-xl border border-[#dde1ea] bg-[#fbfdfc] p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate text-[14px] font-bold text-[#141c2b]">{debt.name}</h3>
                                    <p className="mt-1 text-[11px] text-[#707974]">{formatDebtType(debt.debtType)} • {debt.interestRate || 0}% interest</p>
                                </div>
                                <p className="shrink-0 text-right text-[14px] font-extrabold text-[#0c6060]">{currency(debt.balance)}</p>
                            </div>
                            <div className="mt-3 rounded-lg bg-white px-3 py-2 text-[11px] text-[#5e6a80]">
                                Monthly repayment: <span className="font-semibold text-[#0c6060]">{currency(debt.minimumPayment)}</span>
                                <br />
                                Remaining this month: <span className="font-semibold text-[#aa5d04]">{currency(remaining)}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <NumericInput value={paymentInputs[debt.id] ?? ''} onChange={(event) => setPaymentInputs((current) => ({ ...current, [debt.id]: event.target.value }))} placeholder={`Pay ${currency(debt.minimumPayment)}`} className="min-w-0 flex-1 rounded-xl border border-[#dde1ea] px-3 py-2 text-[12px]" />
                                <button type="button" onClick={() => recordDebtPayment(debt)} className="rounded-xl bg-[#0c6060] px-3 py-2 text-[12px] font-semibold text-white">Pay</button>
                            </div>
                            <div className="mt-2 flex gap-2">
                                <button type="button" onClick={() => { setEditingDebt(debt); setIsModalOpen(true); }} className="flex-1 rounded-xl border border-[#dde1ea] bg-white px-3 py-2 text-[12px] font-semibold text-[#0c6060]">Edit</button>
                                <button type="button" onClick={() => handleDelete(debt.id)} className="flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-[12px] font-semibold text-rose-600">Delete</button>
                            </div>
                        </article>
                    );
                })}
                {paymentError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{paymentError}</div>}
            </div>
        )}
    </article>
);

const MobileSolutionsPanel = ({ orderedDebts, recommendedDebt, setActiveView }) => (
    <div className="space-y-3">
        <article className="rounded-2xl border border-[#e3e3e5] bg-white p-4">
            <h2 className="text-[16px] font-semibold leading-6 text-[#0c6060]">Explore My Loan Solutions</h2>
            <p className="mt-1 text-[12px] leading-[18px] text-[#707974]">Compare safer repayment moves using the debts you have added.</p>
            {orderedDebts.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-[#dde1ea] bg-[#f8f8f8] p-4 text-[13px] text-[#707974]">Add debts first so we can suggest refinancing and restructuring options.</p>
            ) : (
                <div className="mt-4 space-y-3">
                    {orderedDebts.slice(0, 3).map((debt) => (
                        <div key={`${debt.id}-mobile-solution`} className="rounded-xl border border-[#dde1ea] bg-[#fbfdfc] p-3">
                            <p className="text-[14px] font-bold text-[#141c2b]">{debt.name}</p>
                            <p className="mt-1 text-[12px] text-[#707974]">{currency(debt.balance)} balance • {debt.interestRate || 0}% interest</p>
                            <button type="button" onClick={() => setActiveView('simulator')} className="mt-3 rounded-full border border-[#0c6060] px-4 py-2 text-[12px] font-semibold text-[#0c6060]">Simulate savings</button>
                        </div>
                    ))}
                </div>
            )}
        </article>
        <article className="rounded-2xl border border-[#e3e3e5] bg-white p-4">
            <h3 className="text-[14px] font-bold text-[#141c2b]">Recommended next move</h3>
            <p className="mt-2 text-[12px] leading-5 text-[#707974]">{recommendedDebt ? `Focus on ${recommendedDebt.name} first, then roll freed payments into the next debt.` : 'Once debts are added, Shilingi Moves will show the strongest payoff move.'}</p>
        </article>
    </div>
);

const MobileCalculatorsOverviewPanel = ({
    debts,
    handleCalculatorDebtSelect,
    loanCalculator,
    loanCalculatorRate,
    selectedCalculatorDebtId,
    setLoanCalculator,
    setSimulatorExtraPayment,
    setStrategy,
    setSuperCalculator,
    simulatorExtraPayment,
    simulatorProjection,
    strategy,
    superCalculator,
    superCalculatorRate,
}) => {
    const calculatorOptions = [
        {
            title: 'Normal Loan Calculator',
            description: 'Use this when your lender gives you the principal, duration, and monthly repayment.',
            active: true,
        },
        {
            title: 'Super Loan Calculator',
            description: 'Use this when you want to compare a new offer against your saved debt.',
            active: false,
        },
        {
            title: 'Payoff Strategy',
            description: 'Choose avalanche or snowball, then test how extra payments change your debt-free date.',
            active: false,
        },
    ];

    return (
        <div className="space-y-3">
            <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
                <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Debt Payoff Calculator</h2>
                <p className="mt-1 text-[10px] leading-4 text-[#707974]">Test how much faster you could become debt-free by adding a little more each month.</p>
                <div className="mt-4 rounded-[10px] bg-[#f8f8f8] p-4">
                    <label className="block text-[10px] font-semibold text-[#707974]">
                        Extra Monthly Payment
                        <div className="mt-2 rounded-[10px] bg-white px-4 py-3 text-center">
                            <span className="text-[18px] font-extrabold text-[#0c6060]">{currency(simulatorExtraPayment)}</span>
                        </div>
                    </label>
                    <input type="range" min="0" max="50000" step="1000" value={simulatorExtraPayment} onChange={(event) => setSimulatorExtraPayment(Number(event.target.value))} className="mt-4 w-full accent-[#eabb3a]" />
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <MobileMiniMetric label="Debt-free" value={simulatorProjection.debtFreeDate} />
                        <MobileMiniMetric label="Months" value={simulatorProjection.freedMonths} />
                        <MobileMiniMetric label="Saved" value={currency(simulatorProjection.extraSavings)} />
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {['avalanche', 'snowball'].map((option) => (
                        <button key={option} type="button" onClick={() => setStrategy(option)} className={`rounded-full border px-3 py-2 text-[11px] font-semibold capitalize ${strategy === option ? 'border-[#eabb3a] bg-[#eabb3a] text-white' : 'border-[#dde1ea] bg-white text-[#5e6a80]'}`}>{option}</button>
                    ))}
                </div>
            </article>

            <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
                <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Recommendations</h2>
                <p className="mt-1 text-[10px] leading-4 text-[#707974]">Apply these recommendations to clear your debt faster.</p>
                <div className="mt-4 rounded-[10px] bg-[#fff7e8] p-3">
                    <p className="text-[12px] font-bold text-[#aa5d04]">Extra Payment</p>
                    <p className="mt-1 text-[11px] leading-4 text-[#232e3d]">
                        Add {currency(simulatorExtraPayment)} to your selected loan and roll freed payments into the next debt after payoff.
                    </p>
                </div>
            </article>

            <article className="rounded-[10px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.12)]">
                <h2 className="text-[14px] font-semibold leading-5 text-[#0c6060]">Select Calculator</h2>
                <p className="mt-1 text-[10px] leading-4 text-[#707974]">Kindly select calculator to start with.</p>
                <div className="mt-4 space-y-2">
                    {calculatorOptions.map((option, index) => (
                        <button key={option.title} type="button" className={`flex w-full items-start gap-3 rounded-[10px] border px-3 py-3 text-left ${option.active ? 'border-[#0c6060] bg-[#f2fbf8]' : 'border-[#edf0f3] bg-white'}`}>
                            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${option.active ? 'bg-[#0c6060] text-white' : 'bg-[#f8f8f8] text-[#707974]'}`}>{index + 1}</span>
                            <span className="min-w-0">
                                <span className="block text-[12px] font-bold text-[#232e3d]">{option.title}</span>
                                <span className="mt-1 block text-[10px] leading-4 text-[#707974]">{option.description}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </article>

            <MobileLoanCalculatorCard
                debts={debts}
                handleCalculatorDebtSelect={handleCalculatorDebtSelect}
                loanCalculator={loanCalculator}
                rate={loanCalculatorRate}
                selectedCalculatorDebtId={selectedCalculatorDebtId}
                setLoanCalculator={setLoanCalculator}
                title="Normal Loan Calculator"
            />
            <MobileLoanCalculatorCard
                debts={debts}
                handleCalculatorDebtSelect={handleCalculatorDebtSelect}
                loanCalculator={superCalculator}
                rate={superCalculatorRate}
                selectedCalculatorDebtId={selectedCalculatorDebtId}
                setLoanCalculator={setSuperCalculator}
                title="Super Loan Calculator"
            />
        </div>
    );
};

const MobileCalculatorsPanel = ({
    debts,
    handleCalculatorDebtSelect,
    loanCalculator,
    loanCalculatorRate,
    selectedCalculatorDebtId,
    setLoanCalculator,
    setSimulatorExtraPayment,
    setStrategy,
    setSuperCalculator,
    simulatorExtraPayment,
    simulatorProjection,
    strategy,
    superCalculator,
    superCalculatorRate,
}) => (
    <div className="space-y-3">
        <article className="rounded-2xl border border-[#e3e3e5] bg-white p-4">
            <h2 className="text-[16px] font-semibold leading-6 text-[#0c6060]">Debt Payoff Calculator</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {['avalanche', 'snowball'].map((option) => (
                    <button key={option} type="button" onClick={() => setStrategy(option)} className={`rounded-full border px-3 py-2 text-[12px] font-semibold capitalize ${strategy === option ? 'border-[#eabb3a] bg-[#eabb3a] text-white' : 'border-[#dde1ea] bg-white text-[#5e6a80]'}`}>{option}</button>
                ))}
            </div>
            <div className="mt-4 rounded-xl bg-[#f8fcfa] p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#707974]">Extra Monthly Payment</p>
                <p className="mt-1 text-[24px] font-extrabold text-[#0c6060]">{currency(simulatorExtraPayment)}</p>
                <input type="range" min="0" max="50000" step="1000" value={simulatorExtraPayment} onChange={(event) => setSimulatorExtraPayment(Number(event.target.value))} className="mt-3 w-full accent-[#0c6060]" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <MobileMiniMetric label="Debt-free" value={simulatorProjection.debtFreeDate} />
                <MobileMiniMetric label="Months saved" value={simulatorProjection.freedMonths} />
                <MobileMiniMetric label="Saved" value={currency(simulatorProjection.extraSavings)} />
            </div>
        </article>
        <MobileLoanCalculatorCard
            debts={debts}
            handleCalculatorDebtSelect={handleCalculatorDebtSelect}
            loanCalculator={loanCalculator}
            rate={loanCalculatorRate}
            selectedCalculatorDebtId={selectedCalculatorDebtId}
            setLoanCalculator={setLoanCalculator}
            title="Normal Loan Calculator"
        />
        <MobileLoanCalculatorCard
            debts={debts}
            handleCalculatorDebtSelect={handleCalculatorDebtSelect}
            loanCalculator={superCalculator}
            rate={superCalculatorRate}
            selectedCalculatorDebtId={selectedCalculatorDebtId}
            setLoanCalculator={setSuperCalculator}
            title="Super Loan Calculator"
        />
    </div>
);

const MobileLoanCalculatorCard = ({ debts, handleCalculatorDebtSelect, loanCalculator, rate, selectedCalculatorDebtId, setLoanCalculator, title }) => (
    <article className="rounded-2xl border border-[#e3e3e5] bg-white p-4">
        <h3 className="text-[14px] font-bold text-[#141c2b]">{title}</h3>
        <label className="mt-3 block text-[12px] font-semibold text-[#707974]">
            Prefill from saved debt
            <select value={selectedCalculatorDebtId} onChange={(event) => handleCalculatorDebtSelect(event.target.value)} className="mt-1 w-full rounded-xl border border-[#dde1ea] bg-white px-3 py-2 text-[12px] text-[#141c2b]">
                <option value="">Choose saved debt</option>
                {debts.map((debt) => <option key={`${title}-${debt.id}`} value={debt.id}>{debt.name}</option>)}
            </select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
            <NumericInput value={loanCalculator.amount} onChange={(event) => setLoanCalculator((current) => ({ ...current, amount: event.target.value }))} placeholder="Loan amount" className="rounded-xl border border-[#dde1ea] px-3 py-2 text-[12px]" />
            <NumericInput value={loanCalculator.monthlyPayment} onChange={(event) => setLoanCalculator((current) => ({ ...current, monthlyPayment: event.target.value }))} placeholder="Monthly repayment" className="rounded-xl border border-[#dde1ea] px-3 py-2 text-[12px]" />
            <input type="number" min="1" value={loanCalculator.months} onChange={(event) => setLoanCalculator((current) => ({ ...current, months: event.target.value }))} placeholder="Months" className="rounded-xl border border-[#dde1ea] px-3 py-2 text-[12px]" />
            <div className="rounded-xl bg-[#f8fcfa] px-3 py-2 text-[12px]">
                <p className="text-[#707974]">Est. rate</p>
                <p className="font-bold text-[#0c6060]">{rate.toFixed(2)}%</p>
            </div>
        </div>
    </article>
);

const MobileMiniMetric = ({ label, value }) => (
    <div className="rounded-xl border border-[#dde1ea] bg-white px-2 py-3">
        <p className="text-[10px] leading-3 text-[#707974]">{label}</p>
        <p className="mt-1 break-words text-[11px] font-bold text-[#0c6060]">{value}</p>
    </div>
);

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
