import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CircleOff, Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import DebtForm from '../components/DebtForm';
import DebtList from '../components/DebtList';
import DebtSummaryCards from '../components/DebtSummaryCards';
import {
    calculateDebtSummary,
    createDebt,
    deleteDebt,
    getDebts,
    updateDebt,
} from '../services/debtApi';

const DebtManagementPage = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);

    const summary = useMemo(() => calculateDebtSummary(debts), [debts]);

    const loadDebts = async () => {
        try {
            setLoading(true);
            setError('');
            const results = await getDebts();
            setDebts(results);
        } catch (err) {
            setError(err.message || 'We could not load your debts right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDebts();
    }, []);

    const handleSubmit = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');

            if (editingDebt) {
                const savedDebt = await updateDebt(editingDebt.id, formValues);
                setDebts((current) => current.map((debt) => (debt.id === savedDebt.id ? savedDebt : debt)));
                setEditingDebt(null);
                return;
            }

            const createdDebt = await createDebt(formValues);
            setDebts((current) => [createdDebt, ...current]);
        } catch (err) {
            setSubmitError(err.message || 'We could not save this debt right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (debtId) => {
        try {
            setDeletingId(debtId);
            setSubmitError('');
            await deleteDebt(debtId);
            setDebts((current) => current.filter((debt) => debt.id !== debtId));
            if (editingDebt?.id === debtId) {
                setEditingDebt(null);
            }
        } catch (err) {
            setSubmitError(err.message || 'We could not delete this debt right now.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fffdf8_0%,_#f8fafc_48%,_#ffffff_100%)] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <section className="rounded-[2rem] border border-amber-100 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-700">Debt management</p>
                            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                                Connect your Railway debt API to a clean, editable frontend workspace.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                                This page fetches debt accounts from your backend, summarizes the totals, and lets you add,
                                update, or remove records without mixing API code into your UI components.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button variant="outline" className="justify-center" onClick={loadDebts}>
                                <RefreshCcw size={18} /> Refresh debts
                            </Button>
                            <Button variant="primary" to="/dashboard" className="justify-center">
                                Back to dashboard
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    {loading ? (
                        <div className="flex min-h-[260px] items-center justify-center rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                            <div className="text-center">
                                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                                <p className="mt-4 text-sm font-medium text-gray-600">Loading debt accounts from Railway...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-sm">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="mt-1 h-6 w-6 text-rose-600" />
                                <div>
                                    <h2 className="text-xl font-bold text-rose-900">We could not load your debts</h2>
                                    <p className="mt-2 text-sm leading-6 text-rose-700">{error}</p>
                                    <div className="mt-4">
                                        <Button variant="primary" onClick={loadDebts}>Try again</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <DebtSummaryCards summary={summary} />

                            <div className="grid gap-8 xl:grid-cols-[1.05fr_1.4fr]">
                                <div className="space-y-4">
                                    <DebtForm
                                        initialValues={editingDebt}
                                        onSubmit={handleSubmit}
                                        onCancel={() => {
                                            setEditingDebt(null);
                                            setSubmitError('');
                                        }}
                                        isSubmitting={isSubmitting}
                                    />

                                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                                            <div>
                                                <h2 className="font-bold text-emerald-900">Integration note</h2>
                                                <p className="mt-2 text-sm leading-6 text-emerald-800">
                                                    This frontend expects a Railway endpoint at <code className="rounded bg-white px-1.5 py-0.5 text-emerald-900">/api/debts</code>.
                                                    It already tolerates responses shaped like an array, <code className="rounded bg-white px-1.5 py-0.5 text-emerald-900">data</code>,
                                                    <code className="rounded bg-white px-1.5 py-0.5 text-emerald-900">debts</code>, or <code className="rounded bg-white px-1.5 py-0.5 text-emerald-900">results</code>.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {submitError && (
                                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
                                            {submitError}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    {debts.length ? (
                                        <DebtList
                                            debts={debts}
                                            onEdit={(debt) => {
                                                setEditingDebt(debt);
                                                setSubmitError('');
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            onDelete={handleDelete}
                                            deletingId={deletingId}
                                        />
                                    ) : (
                                        <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
                                            <CircleOff className="mx-auto h-12 w-12 text-gray-400" />
                                            <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Your debt list is empty</h2>
                                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                                That usually means the backend returned an empty array. Add a new debt on the left or confirm
                                                the Railway API is returning records for this account.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default DebtManagementPage;
