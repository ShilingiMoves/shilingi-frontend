import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import DebtEntryModal from './DebtEntryModal';
import DebtList from './DebtList';
import DebtSummaryCards from './DebtSummaryCards';
import { calculateDebtSummary, createDebt, deleteDebt, getDebts, updateDebt } from '../../../services/debtApi';
import {
    createLiability as createNetworthLiability,
    deleteLiability as deleteNetworthLiability,
    getLiabilities as getNetworthLiabilities,
    getLiabilityCategories,
    updateLiability as updateNetworthLiability
} from '../../../services/networthApi';
import { markDashboardDataExists } from '../../../pages/DashboardPage';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const DebtManagerPanel = ({ requestAddDebtSignal = 0 }) => {
    const { triggerHealthRefresh } = useHealthRefresh();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('debts');
    const [liabilities, setLiabilities] = useState([]);
    const [liabilityCategories, setLiabilityCategories] = useState([]);
    const [editingLiability, setEditingLiability] = useState(null);
    const [isLiabilityModalOpen, setIsLiabilityModalOpen] = useState(false);

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

    const loadLiabilities = async () => {
        try {
            const [liabilityData, categoryData] = await Promise.all([
                getNetworthLiabilities(),
                getLiabilityCategories(),
            ]);
            setLiabilities(liabilityData.liabilities || []);
            setLiabilityCategories(categoryData || []);
        } catch (err) {
            setError(err.message || 'We could not load your liabilities right now.');
        }
    };

    useEffect(() => {
        Promise.all([loadDebts(), loadLiabilities()]);
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
                triggerHealthRefresh('debt:update');
            } else {
                const createdDebt = await createDebt(formValues);
                setDebts((current) => [createdDebt, ...current]);
                setIsModalOpen(false);
                markDashboardDataExists();
                triggerHealthRefresh('debt:create');
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
            triggerHealthRefresh('debt:delete');
        } catch (err) {
            setSubmitError(err.message || 'We could not remove this debt right now.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmitLiability = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');
            if (editingLiability) {
                await updateNetworthLiability(editingLiability.uuid, formValues);
                triggerHealthRefresh('liability:update');
            } else {
                await createNetworthLiability(formValues);
                markDashboardDataExists();
                triggerHealthRefresh('liability:create');
            }
            await loadLiabilities();
            setEditingLiability(null);
            setIsLiabilityModalOpen(false);
        } catch (err) {
            setSubmitError(err.message || 'We could not save this liability right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLiability = async (liabilityId) => {
        try {
            setDeletingId(liabilityId);
            setSubmitError('');
            await deleteNetworthLiability(liabilityId);
            setLiabilities((current) => current.filter((item) => item.uuid !== liabilityId));
            triggerHealthRefresh('liability:delete');
        } catch (err) {
            setSubmitError(err.message || 'We could not remove this liability right now.');
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
            <LiabilityEntryModal
                isOpen={isLiabilityModalOpen}
                initialValues={editingLiability}
                categories={liabilityCategories}
                onSubmit={handleSubmitLiability}
                onClose={() => {
                    if (isSubmitting) return;
                    setIsLiabilityModalOpen(false);
                    setEditingLiability(null);
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
                    <button
                        type="button"
                        onClick={() => {
                            setEditingLiability(null);
                            setIsLiabilityModalOpen(true);
                        }}
                        className="inline-flex h-fit items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                    >
                        Add Liability
                    </button>
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
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('debts')}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'debts' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Debts
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('liabilities')}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'liabilities' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Liabilities
                        </button>
                    </div>
                    {activeTab === 'debts' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Active liabilities</p>
                                <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Other obligations impacting your net worth</h3>
                            </div>
                            <LiabilitySimpleList
                                liabilities={liabilities}
                                onEdit={(liability) => {
                                    setEditingLiability(liability);
                                    setSubmitError('');
                                    setIsLiabilityModalOpen(true);
                                }}
                                onDelete={handleDeleteLiability}
                                deletingId={deletingId}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const LiabilitySimpleList = ({ liabilities, onEdit, onDelete, deletingId }) => {
    if (!liabilities.length) {
        return (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">No liabilities yet</h3>
                <p className="mt-2 text-sm text-gray-600">Add liabilities here so Net Worth gives a complete picture.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {liabilities.map((liability) => (
                <article key={liability.uuid} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">{liability.name}</h4>
                            <p className="text-sm text-slate-500">{liability.categoryName}</p>
                            <p className="mt-1 text-sm text-slate-600">{liability.creditor || 'No creditor set'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-rose-600">KES {Number(liability.amount || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{liability.statusDisplay || liability.status}</p>
                            <div className="mt-2 flex gap-2">
                                <button onClick={() => onEdit(liability)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700">Edit</button>
                                <button
                                    onClick={() => onDelete(liability.uuid)}
                                    disabled={deletingId === liability.uuid}
                                    className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
                                >
                                    {deletingId === liability.uuid ? 'Removing...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

const LiabilityEntryModal = ({ isOpen, initialValues, categories, onSubmit, onClose, isSubmitting }) => {
    const [formValues, setFormValues] = useState({
        name: '',
        categoryId: '',
        amount: '',
        dueDate: '',
        creditor: '',
        status: 'ACTIVE',
        includeInNetWorth: true,
        notes: '',
        currency: 'KES',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (initialValues) {
            setFormValues({
                name: initialValues.name || '',
                categoryId: initialValues.category || '',
                amount: initialValues.amount || '',
                dueDate: initialValues.dueDate || '',
                creditor: initialValues.creditor || '',
                status: initialValues.status || 'ACTIVE',
                includeInNetWorth: initialValues.includeInNetWorth !== false,
                notes: initialValues.notes || '',
                currency: initialValues.currency || 'KES',
            });
            return;
        }
        const firstCategoryId = categories?.[0]?.categoryId || '';
        setFormValues({
            name: '',
            categoryId: firstCategoryId,
            amount: '',
            dueDate: '',
            creditor: '',
            status: 'ACTIVE',
            includeInNetWorth: true,
            notes: '',
            currency: 'KES',
        });
    }, [isOpen, initialValues, categories]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
            <div className="w-full max-w-lg overflow-hidden rounded-[1.15rem] bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-primary-700 px-4 py-3 text-white">
                    <h2 className="text-base font-bold">{initialValues ? 'Update liability' : 'Add new liability'}</h2>
                    <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                        x
                    </button>
                </div>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(formValues);
                    }}
                    className="space-y-3 p-4"
                >
                    <input
                        value={formValues.name}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Liability name"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        required
                    />
                    <select
                        value={formValues.categoryId}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, categoryId: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        required
                    >
                        {categories.map((category) => (
                            <option key={category.uuid || category.id} value={category.categoryId}>{category.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={formValues.amount}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="Amount"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        required
                    />
                    <input
                        type="date"
                        value={formValues.dueDate}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                        value={formValues.creditor}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, creditor: e.target.value }))}
                        placeholder="Creditor"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <textarea
                        value={formValues.notes}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notes"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white">
                            {isSubmitting ? 'Saving...' : initialValues ? 'Update Liability' : 'Add Liability'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DebtManagerPanel;

