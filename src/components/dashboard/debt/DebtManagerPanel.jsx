import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck, TrendingDown, Sparkles } from 'lucide-react';
import DebtForm from './DebtForm';
import DebtList from './DebtList';
import DebtSummaryCards from './DebtSummaryCards';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';
import { getUserProfile } from '../../../services/authApi';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const DebtManagerPanel = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [tierInfo, setTierInfo] = useState(null);
    const { triggerHealthRefresh } = useHealthRefresh();

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

    const loadTierInfo = async () => {
        try {
            const profile = await getUserProfile();
            const activeDebtsCount = debts.filter(d => d.status === 'ACTIVE').length;
            
            // Get tier limits from settings or default values
            const tierLimits = {
                'FREE': 3,
                'BASIC': 10,
                'PREMIUM': null, // unlimited
            };

            setTierInfo({
                tier: profile.tier || 'FREE',
                current_count: activeDebtsCount,
                max_debts: tierLimits[profile.tier || 'FREE']
            });
        } catch (err) {
            console.error('Failed to load tier info:', err);
        }
    };

    useEffect(() => {
        loadDebts();
    }, []);

    useEffect(() => {
        if (debts.length >= 0) {
            loadTierInfo();
        }
    }, [debts]);

    const handleSubmit = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            
            if (editingDebt) {
                const savedDebt = await updateDebt(editingDebt.uuid, formValues);
                setDebts((current) => current.map((debt) => (debt.uuid === savedDebt.uuid ? savedDebt : debt)));
                setEditingDebt(null);
                
                // Trigger health refresh
                triggerHealthRefresh();
            } else {
                const createdDebt = await createDebt(formValues);
                setDebts((current) => [createdDebt, ...current]);
                
                // Trigger health refresh
                triggerHealthRefresh();
            }
        } catch (err) {
            const errorMessage = err.message || 'We could not save this debt right now.';
            setSubmitError(errorMessage);
            
            // Scroll to error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (debtUuid) => {
        if (!window.confirm('Are you sure you want to delete this debt? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(debtUuid);
            setSubmitError('');
            await deleteDebt(debtUuid);
            setDebts((current) => current.filter((debt) => debt.uuid !== debtUuid));
            
            // Trigger health refresh
            triggerHealthRefresh();
        } catch (err) {
            setSubmitError(err.message || 'We could not remove this debt right now.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your debt overview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Global Error Message */}
            {error && (
                <div className="rounded-[2rem] border-2 border-red-200 bg-red-50 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-900">We could not load your debt plan.</p>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                            <button
                                onClick={loadDebts}
                                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Error Message */}
            {submitError && (
                <div className="rounded-[2rem] border-2 border-amber-200 bg-amber-50 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900">{submitError}</p>
                        </div>
                        <button
                            onClick={() => setSubmitError('')}
                            className="text-amber-600 hover:text-amber-800"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <DebtSummaryCards summary={summary} />

            {/* Progress Indicator */}
            {summary.activeDebts > 0 && (
                <div className="rounded-[2rem] border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-primary-600" />
                                <h3 className="text-lg font-bold text-slate-900">Debt Freedom Progress</h3>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                                {summary.totalPaid > 0 
                                    ? `You've paid off KSh ${summary.totalPaid.toLocaleString()} so far!`
                                    : 'Start making payments to track your progress'
                                }
                            </p>
                            
                            {/* Progress Bar */}
                            {summary.overallProgress > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-700">
                                            {summary.overallProgress.toFixed(1)}% paid off
                                        </span>
                                        <span className="text-slate-600">
                                            KSh {(summary.totalOriginal - summary.totalBalance).toLocaleString()} / {summary.totalOriginal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                            style={{ width: `${Math.min(summary.overallProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {summary.overallProgress >= 50 && (
                            <div className="flex-shrink-0">
                                <div className="rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 p-3 shadow-lg">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Form and List Grid */}
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
                        tierInfo={tierInfo}
                    />

                    {/* Info Card */}
                    <div className="rounded-[2rem] border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-emerald-500 p-2 shadow-lg">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900">Calmer repayment decisions</h3>
                                <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                                    Keep lenders, balances, minimum payments, and due dates visible so you can reduce stress and stay one step ahead.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DebtList
                    debts={debts}
                    onEdit={(debt) => {
                        setEditingDebt(debt);
                        setSubmitError('');
                        // Scroll to form
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                />
            </div>
        </div>
    );
};

export default DebtManagerPanel;