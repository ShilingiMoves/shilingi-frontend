import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import DebtForm from './DebtForm';
import DebtList from './DebtList';
import DebtSummaryCards from './DebtSummaryCards';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';

const DebtManagerPanel = () => {
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
            setError(err.message || 'We could not load your debt plan right now.');
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
            } else {
                const createdDebt = await createDebt(formValues);
                setDebts((current) => [createdDebt, ...current]);
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

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
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
                                <h3 className="font-bold text-emerald-900">Calmer repayment decisions</h3>
                                <p className="mt-2 text-sm leading-6 text-emerald-800">Keep lenders, balances, minimum payments, and due dates visible so you can reduce stress and stay one step ahead.</p>
                            </div>
                        </div>
                    </div>

                    {submitError && <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">{submitError}</div>}
                </div>

                <DebtList
                    debts={debts}
                    onEdit={(debt) => {
                        setEditingDebt(debt);
                        setSubmitError('');
                    }}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </div>
        </div>
    );
};

export default DebtManagerPanel;

