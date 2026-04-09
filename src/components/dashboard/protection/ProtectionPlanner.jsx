import React, { useEffect, useMemo, useState } from 'react';
import { HeartPulse, Loader2, Plus, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react';
import { createAsset, createAssetCategory, deleteAsset, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { getDebts } from '../../../services/debtApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

const PROTECTION_CATEGORY_NAME = 'Protection Policy';

const POLICY_OPTIONS = [
    'Life Insurance',
    'Medical Cover',
    'Disability Cover',
    'Critical Illness Cover',
    'Funeral Cover',
    'General Protection',
];

const defaultPolicyForm = {
    policyType: 'Life Insurance',
    provider: '',
    coverageAmount: '',
    monthlyPremium: '',
    status: 'ACTIVE',
    notes: '',
};

const defaultCalculator = {
    annualIncome: '1140000',
    dependents: '2',
    yearsToCover: '10',
    outstandingDebts: '0',
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const asNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatKES = (value) => `KES ${Math.round(asNumber(value)).toLocaleString('en-KE')}`;

const parseProtectionMeta = (asset) => {
    const status = normalize(asset.notes).includes('status:inactive') ? 'INACTIVE' : 'ACTIVE';
    return { status };
};

const findCategoryId = (categories) => {
    const matched = categories.find((item) => normalize(item.name).includes('protection') || normalize(item.name).includes('insurance'));
    if (!matched) return null;
    const parsed = Number(matched.categoryId ?? matched.id);
    return Number.isFinite(parsed) ? parsed : null;
};

const ProtectionPlanner = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deletingPolicyId, setDeletingPolicyId] = useState('');
    const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
    const [calculator, setCalculator] = useState(defaultCalculator);
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalDebt, setTotalDebt] = useState(0);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [assetRows, categoryRows, debts] = await Promise.all([
                getAssets(),
                getAssetCategories(),
                getDebts().catch(() => []),
            ]);
            setAssets(assetRows);
            setCategories(categoryRows);
            const debtTotal = Array.isArray(debts) ? debts.reduce((sum, item) => sum + asNumber(item.balance), 0) : 0;
            setTotalDebt(debtTotal);
            setCalculator((current) => ({ ...current, outstandingDebts: String(Math.round(debtTotal)) }));
        } catch (err) {
            setError(err.message || 'Unable to load protection planner data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const protectionAssets = useMemo(() => {
        return assets.filter((item) => {
            const categoryName = normalize(item.categoryName);
            return categoryName.includes('protection') || categoryName.includes('insurance') || categoryName.includes('policy');
        });
    }, [assets]);

    const recommendedCover = useMemo(() => {
        const income = asNumber(calculator.annualIncome);
        const dependents = asNumber(calculator.dependents);
        const years = asNumber(calculator.yearsToCover);
        const debts = asNumber(calculator.outstandingDebts);
        return income * Math.max(years, 1) + debts + dependents * 600000;
    }, [calculator]);

    const coverageTotal = useMemo(
        () => protectionAssets.reduce((sum, item) => sum + asNumber(item.currentValue), 0),
        [protectionAssets]
    );

    const monthlyPremiums = useMemo(
        () => protectionAssets.reduce((sum, item) => sum + asNumber(item.purchaseValue), 0),
        [protectionAssets]
    );

    const coverageGap = Math.max(recommendedCover - coverageTotal, 0);

    const handleCalcChange = (key, value) => {
        setCalculator((current) => ({ ...current, [key]: value }));
    };

    const handleFormChange = (key, value) => {
        setPolicyForm((current) => ({ ...current, [key]: value }));
    };

    const ensureCategory = async () => {
        let resolvedCategories = categories;
        let categoryId = findCategoryId(resolvedCategories);
        if (categoryId) return categoryId;

        await createAssetCategory({
            name: PROTECTION_CATEGORY_NAME,
            color: '#0e7490',
            is_liquid: false,
        });
        resolvedCategories = await getAssetCategories();
        setCategories(resolvedCategories);
        categoryId = findCategoryId(resolvedCategories);

        if (!categoryId) {
            throw new Error('Could not resolve protection category id.');
        }
        return categoryId;
    };

    const addPolicy = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const categoryId = await ensureCategory();
            await createAsset({
                name: `${policyForm.policyType} - ${policyForm.provider || 'Provider'}`,
                category: categoryId,
                current_value: String(asNumber(policyForm.coverageAmount)),
                purchase_value: String(asNumber(policyForm.monthlyPremium)),
                currency: 'KES',
                purchase_date: new Date().toISOString().split('T')[0],
                interest_rate: null,
                institution: policyForm.provider || '',
                account_number: '',
                is_liquid: false,
                include_in_net_worth: false,
                last_valued_date: new Date().toISOString().split('T')[0],
                notes: `status:${policyForm.status.toLowerCase()}${policyForm.notes ? ` | ${policyForm.notes}` : ''}`,
            });
            setShowAddModal(false);
            setPolicyForm(defaultPolicyForm);
            markDashboardDataExists();
            setSuccess('Protection policy added.');
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to add protection policy.');
        } finally {
            setSaving(false);
        }
    };

    const removePolicy = async (asset) => {
        if (!asset?.uuid) return;
        const confirmed = window.confirm(`Delete policy "${asset.name}"?`);
        if (!confirmed) return;

        try {
            setDeletingPolicyId(asset.uuid);
            setError('');
            setSuccess('');
            await deleteAsset(asset.uuid);
            await loadData();
            setSuccess('Policy deleted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to delete protection policy.');
        } finally {
            setDeletingPolicyId('');
        }
    };

    return (
        <div className="space-y-5">
            <section className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#165f4f_0%,_#1e735f_70%,_#155246_100%)] px-6 py-6 text-white shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">Protection Planner</p>
                        <h2 className="mt-2 text-3xl font-extrabold">Protect your income, health, and family.</h2>
                        <p className="mt-2 text-sm text-emerald-50/90">Add policies and calculate whether your current cover is enough.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-700"
                    >
                        <Plus size={16} />
                        Add Policy
                    </button>
                </div>
            </section>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <section className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Active policies" value={String(protectionAssets.length)} tone="text-primary-700" />
                <MetricCard label="Monthly premiums" value={formatKES(monthlyPremiums)} tone="text-amber-700" />
                <MetricCard label="Coverage gap" value={coverageGap > 0 ? formatKES(coverageGap) : 'Covered'} tone={coverageGap > 0 ? 'text-rose-700' : 'text-emerald-700'} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-slate-950">Current Coverage</h3>
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading protection policies...</div>
                    ) : protectionAssets.length === 0 ? (
                        <EmptyState text="No protection policies yet. Add your first policy to start tracking coverage." />
                    ) : (
                        <div className="mt-4 space-y-3">
                            {protectionAssets.map((asset) => {
                                const meta = parseProtectionMeta(asset);
                                return (
                                    <article key={asset.uuid} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">{asset.name}</p>
                                                <p className="text-sm text-slate-600">Cover: {formatKES(asset.currentValue)}</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="text-right">
                                                    <p className="font-semibold text-slate-900">{formatKES(asset.purchaseValue)}/mo</p>
                                                    <p className={`text-xs font-semibold ${meta.status === 'ACTIVE' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                        {meta.status}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePolicy(asset)}
                                                    disabled={deletingPolicyId === asset.uuid}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                                    aria-label={`Delete ${asset.name}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-950">Coverage Calculator</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <CalcInput label="Annual income (KES)" value={calculator.annualIncome} onChange={(value) => handleCalcChange('annualIncome', value)} />
                        <CalcInput label="Dependents" value={calculator.dependents} onChange={(value) => handleCalcChange('dependents', value)} />
                        <CalcInput label="Outstanding debts (KES)" value={calculator.outstandingDebts} onChange={(value) => handleCalcChange('outstandingDebts', value)} />
                        <CalcInput label="Years to cover" value={calculator.yearsToCover} onChange={(value) => handleCalcChange('yearsToCover', value)} />
                    </div>
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Recommended cover</p>
                        <p className="mt-2 text-4xl font-extrabold text-primary-800">{formatKES(recommendedCover)}</p>
                        <p className="mt-2 text-sm text-slate-600">Formula: annual income x years + debts + dependent cushion.</p>
                    </div>
                    {coverageGap > 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700">
                            <ShieldAlert size={15} />
                            You are under-covered by {formatKES(coverageGap)}
                        </div>
                    )}
                    {coverageGap === 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                            <ShieldCheck size={15} />
                            Your current policies meet the recommended cover.
                        </div>
                    )}
                </div>
            </section>

            {showAddModal && (
                <Modal title="Add Protection Policy" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={addPolicy} className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                            Policy type
                            <select
                                value={policyForm.policyType}
                                onChange={(event) => handleFormChange('policyType', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            >
                                {POLICY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <Input label="Provider" value={policyForm.provider} onChange={(value) => handleFormChange('provider', value)} placeholder="e.g. Jubilee, AAR, Britam" />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input label="Coverage amount (KES)" type="number" value={policyForm.coverageAmount} onChange={(value) => handleFormChange('coverageAmount', value)} />
                            <Input label="Monthly premium (KES)" type="number" value={policyForm.monthlyPremium} onChange={(value) => handleFormChange('monthlyPremium', value)} />
                        </div>
                        <label className="block text-sm font-medium text-slate-700">
                            Status
                            <select
                                value={policyForm.status}
                                onChange={(event) => handleFormChange('status', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </label>
                        <label className="block text-sm font-medium text-slate-700">
                            Notes (optional)
                            <textarea
                                value={policyForm.notes}
                                onChange={(event) => handleFormChange('notes', event.target.value)}
                                rows={3}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            />
                        </label>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving || !policyForm.coverageAmount || !policyForm.monthlyPremium}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {saving && <Loader2 size={15} className="animate-spin" />}
                                Save Policy
                            </button>
                            <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const MetricCard = ({ label, value, tone }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <p className={`mt-3 text-3xl font-extrabold ${tone}`}>{value}</p>
    </article>
);

const CalcInput = ({ label, value, onChange }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
            type="number"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
    </label>
);

const Input = ({ label, value, onChange, ...props }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
            {...props}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
    </label>
);

const EmptyState = ({ text }) => (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
        {text}
    </div>
);

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <X size={18} />
                </button>
            </div>
            <div className="px-5 py-5">{children}</div>
        </div>
    </div>
);

export default ProtectionPlanner;
