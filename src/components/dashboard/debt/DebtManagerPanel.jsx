import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import DebtEntryModal from './DebtEntryModal';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const currency = (value) => `KES ${Math.round(Number(value || 0)).toLocaleString('en-KE')}`;

const DebtManagerPanel = ({ requestAddDebtSignal = 0 }) => {
    const { triggerHealthRefresh } = useHealthRefresh();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [strategy, setStrategy] = useState('avalanche');

    const summary = useMemo(() => calculateDebtSummary(debts), [debts]);

    const debtFreeDate = useMemo(() => {
        const monthly = Number(summary.totalMinimumPayment || 0);
        const total = Number(summary.totalBalance || 0);
        if (!monthly || !total) return 'N/A';
        const months = Math.max(Math.ceil(total / monthly), 1);
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    }, [summary.totalBalance, summary.totalMinimumPayment]);

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

    const loadDebts = async () => {
        try {
            setLoading(true);
            setError('');
            setDebts(await getDebts());
        } catch (err) {
            setError(err.message || 'We could not load your debt data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
                <StatCard title="Total debt" value={currency(summary.totalBalance)} valueClass="text-rose-600" />
                <StatCard title="Monthly payments" value={currency(summary.totalMinimumPayment)} valueClass="text-amber-600" />
                <StatCard title="Debt-free date" value={debtFreeDate} valueClass="text-primary-700" />
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

const StatCard = ({ title, value, valueClass }) => (
    <article className="rounded-[1.1rem] border border-emerald-100 bg-white px-4 py-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
        <p className={`mt-2 text-2xl font-extrabold sm:text-3xl ${valueClass}`}>{value}</p>
    </article>
);

export default DebtManagerPanel;
