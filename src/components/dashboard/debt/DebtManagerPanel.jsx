import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import DebtEntryModal from './DebtEntryModal';
import DebtList from './DebtList';
import DebtSummaryCards from './DebtSummaryCards';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';

const DebtManagerPanel = ({ requestAddDebtSignal = 0 }) => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const summary = useMemo(() => calculateDebtSummary(debts), [debts]);

    const loadDebts = async () => {
        try {
            setLoading(true);
            setError('');
            const results = await getDebts();
            setDebts(results);
        } catch (err) {
            setError(err.message || 'We could not load your debt plan right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDebts();
    }, []);

    useEffect(() => {
        if (!requestAddDebtSignal) {
            return;
        }

        setEditingDebt(null);
        setSubmitError('');
        setIsModalOpen(true);
    }, [requestAddDebtSignal]);

    const handleSubmit = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            if (editingDebt) {
                const savedDebt = await updateDebt(editingDebt.id, formValues);
                setDebts((current) => current.map((debt) => (debt.id === savedDebt.id ? savedDebt : debt)));
                setEditingDebt(null);
                setIsModalOpen(false);
            } else {
                const createdDebt = await createDebt(formValues);
                setDebts((current) => [createdDebt, ...current]);
                setIsModalOpen(false);
            }
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
        } catch (err) {
            setSubmitError(err.message || 'We could not remove this debt right now.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your debt overview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DebtEntryModal
                isOpen={isModalOpen}
                initialValues={editingDebt}
                onSubmit={handleSubmit}
                onClose={() => {
                    if (isSubmitting) {
                        return;
                    }
                    setIsModalOpen(false);
                    setEditingDebt(null);
                    setSubmitError('');
                }}
                isSubmitting={isSubmitting}
            />

            {error && (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">We could not load your debt plan.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <DebtSummaryCards summary={summary} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Your debts</p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Stay clear on what you owe and how you are progressing.</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                            Keep balances, lenders, repayment amounts, and due dates in one place so your next debt decision feels more deliberate and less stressful.
                        </p>
                    </div>

                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                        <div>
                            <h3 className="font-bold text-slate-900">Repayment focus</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Add each debt clearly, then use this space to follow balances, repayment commitments, and the progress you are making over time.
                            </p>
                        </div>
                    </div>
                </div>

                {submitError && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">{submitError}</div>}

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Active debts</p>
                        <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Accounts you are currently managing</h3>
                    </div>
                    <DebtList
                        debts={debts}
                        onEdit={(debt) => {
                            setEditingDebt(debt);
                            setSubmitError('');
                            setIsModalOpen(true);
                        }}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                    />
                </div>
            </div>
        </div>
    );
};

export default DebtManagerPanel;

