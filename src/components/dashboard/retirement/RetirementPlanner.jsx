import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, PiggyBank, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { createAsset, createAssetCategory, deleteAsset, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

const RETIREMENT_CATEGORY_NAME = 'Retirement Account';

const ACCOUNT_OPTIONS = [
    'NSSF - National Social Security Fund',
    'Sanlam Umbrella Pension',
    'Individual Pension Plan',
    'Employer Pension Scheme',
    'Retirement Savings Account',
];

const PENSION_PRODUCTS = [
    { name: 'Old Mutual Pension', type: 'Managed Fund', rate: '13.2%', tone: 'text-emerald-700' },
    { name: 'Britam Pension Plan', type: 'Personal Pension', rate: '12.8%', tone: 'text-blue-700' },
    { name: 'NSSF Tier II', type: 'Government Scheme', rate: 'Fixed', tone: 'text-amber-600' },
];

const defaultAccountForm = {
    accountName: ACCOUNT_OPTIONS[0],
    provider: '',
    currentBalance: '',
    monthlyContribution: '',
    expectedReturn: '10',
    notes: '',
};

const defaultCalculator = {
    currentAge: '36',
    targetAge: '60',
    currentSavings: '178500',
    monthlyContribution: '18000',
    expectedReturn: '12',
    monthlyExpensesAtRetirement: '80000',
};

const normalize = (value) => String(value || '').trim().toLowerCase();
const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
const formatKES = (value) => `KES ${Math.round(toNumber(value)).toLocaleString('en-KE')}`;

const getCategoryIdentifier = (category) => {
    if (!category) return null;
    const candidates = [
        category.categoryId,
        category.id,
        category.uuid,
        category.raw?.id,
        category.raw?.pk,
        category.raw?.category_id,
        category.raw?.uuid,
    ];
    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
        if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
    return null;
};

const monthlyFutureValue = ({ currentSavings, monthlyContribution, expectedReturn, years }) => {
    const rate = toNumber(expectedReturn) / 100 / 12;
    const n = Math.max(Math.round(toNumber(years) * 12), 0);
    const principal = toNumber(currentSavings);
    const monthly = toNumber(monthlyContribution);

    if (n === 0) return principal;
    if (rate === 0) return principal + monthly * n;
    return principal * (1 + rate) ** n + monthly * (((1 + rate) ** n - 1) / rate);
};

const findRetirementCategoryId = (categories) => {
    const matched = categories.find((item) => {
        const name = normalize(item.name);
        return name.includes('retirement') || name.includes('pension') || name.includes('nssf');
    });
    if (!matched) return null;
    return getCategoryIdentifier(matched);
};

const RetirementPlanner = ({ onSelectSection }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deletingAccountId, setDeletingAccountId] = useState('');
    const [accountForm, setAccountForm] = useState(defaultAccountForm);
    const [calculator, setCalculator] = useState(defaultCalculator);
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [assetRows, categoryRows] = await Promise.all([getAssets(), getAssetCategories()]);
            setAssets(assetRows);
            setCategories(categoryRows);
        } catch (err) {
            setError(err.message || 'Unable to load retirement planner data right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const retirementAssets = useMemo(() => {
        return assets.filter((item) => {
            const category = normalize(item.categoryName);
            const name = normalize(item.name);
            return (
                category.includes('retirement') ||
                category.includes('pension') ||
                name.includes('pension') ||
                name.includes('nssf') ||
                name.includes('retirement')
            );
        });
    }, [assets]);

    const totalRetirementBalance = useMemo(
        () => retirementAssets.reduce((sum, item) => sum + toNumber(item.currentValue), 0),
        [retirementAssets]
    );

    const totalMonthlyContribution = useMemo(
        () => retirementAssets.reduce((sum, item) => sum + toNumber(item.purchaseValue), 0),
        [retirementAssets]
    );

    const yearsRemaining = Math.max(toNumber(calculator.targetAge) - toNumber(calculator.currentAge), 0);
    const projectedPot = monthlyFutureValue({
        currentSavings: calculator.currentSavings,
        monthlyContribution: calculator.monthlyContribution,
        expectedReturn: calculator.expectedReturn,
        years: yearsRemaining,
    });
    const fireNumber = toNumber(calculator.monthlyExpensesAtRetirement) * 12 * 25;
    const fireProgress = fireNumber > 0 ? Math.min((projectedPot / fireNumber) * 100, 100) : 0;

    const handleCalcChange = (key, value) => {
        setCalculator((current) => ({ ...current, [key]: value }));
    };

    const handleFormChange = (key, value) => {
        setAccountForm((current) => ({ ...current, [key]: value }));
    };

    const ensureCategoryId = async () => {
        let resolved = categories;
        let categoryId = findRetirementCategoryId(resolved);
        if (categoryId) return categoryId;

        try {
            await createAssetCategory({
                name: RETIREMENT_CATEGORY_NAME,
                color: '#166b5a',
                is_liquid: false,
            });
        } catch (err) {
            const message = String(err?.message || '').toLowerCase();
            const isDuplicate = message.includes('unique constraint') || message.includes('already exists') || message.includes('duplicate');
            if (!isDuplicate) throw err;
        }
        resolved = await getAssetCategories();
        setCategories(resolved);
        categoryId = findRetirementCategoryId(resolved);

        if (!categoryId) throw new Error('Could not resolve retirement category id.');
        return categoryId;
    };

    const addRetirementAccount = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const categoryId = await ensureCategoryId();
            await createAsset({
                name: accountForm.accountName,
                category: categoryId,
                current_value: String(toNumber(accountForm.currentBalance)),
                purchase_value: String(toNumber(accountForm.monthlyContribution)),
                currency: 'KES',
                purchase_date: new Date().toISOString().split('T')[0],
                interest_rate: String(toNumber(accountForm.expectedReturn)),
                institution: accountForm.provider || '',
                account_number: '',
                is_liquid: false,
                include_in_net_worth: true,
                last_valued_date: new Date().toISOString().split('T')[0],
                notes: accountForm.notes || '',
            });
            markDashboardDataExists();
            setSuccess('Retirement account added and included in net worth.');
            setShowAddModal(false);
            setAccountForm(defaultAccountForm);
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to add retirement account.');
        } finally {
            setSaving(false);
        }
    };

    const removeRetirementAccount = async (asset) => {
        if (!asset?.uuid) return;
        const confirmed = window.confirm(`Delete account "${asset.name}"?`);
        if (!confirmed) return;

        try {
            setDeletingAccountId(asset.uuid);
            setError('');
            setSuccess('');
            await deleteAsset(asset.uuid);
            await loadData();
            setSuccess('Retirement account deleted successfully.');
        } catch (err) {
            setError(err.message || 'Failed to delete retirement account.');
        } finally {
            setDeletingAccountId('');
        }
    };

    return (
        <div className="space-y-4">
            <section className="rounded-2xl bg-[linear-gradient(90deg,_#0f5f4f_0%,_#177261_55%,_#24836f_100%)] px-5 py-4 text-white shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="inline-flex items-center gap-2 text-[1.7rem] font-extrabold leading-none">
                            <PiggyBank size={22} className="text-yellow-300" />
                            Retirement Planner
                        </p>
                        <p className="mt-2 text-sm text-emerald-50/90">Plan your financial freedom and calculate your FIRE number.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onSelectSection?.('comparehub')}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-100/70 bg-white/95 px-4 text-sm font-semibold text-primary-700"
                    >
                        Compare Pension Products
                    </button>
                </div>
            </section>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                <div className="space-y-4">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold text-slate-950">Retirement Calculator</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700"
                            >
                                <Plus size={14} />
                                Add Account
                            </button>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <CalcInput label="Current Age" value={calculator.currentAge} onChange={(value) => handleCalcChange('currentAge', value)} />
                            <CalcInput label="Retirement Age" value={calculator.targetAge} onChange={(value) => handleCalcChange('targetAge', value)} />
                            <CalcInput label="Current Savings (KES)" value={calculator.currentSavings} onChange={(value) => handleCalcChange('currentSavings', value)} />
                            <CalcInput label="Monthly Contribution (KES)" value={calculator.monthlyContribution} onChange={(value) => handleCalcChange('monthlyContribution', value)} />
                            <CalcInput label="Expected Return (% p.a.)" value={calculator.expectedReturn} onChange={(value) => handleCalcChange('expectedReturn', value)} />
                            <CalcInput label="Monthly Expenses at Retirement" value={calculator.monthlyExpensesAtRetirement} onChange={(value) => handleCalcChange('monthlyExpensesAtRetirement', value)} />
                        </div>
                        <div className="mt-4 rounded-xl border border-amber-200 bg-[#f7f3e5] px-4 py-4">
                            <p className="text-center text-4xl font-extrabold text-primary-800">{formatKES(projectedPot)}</p>
                            <p className="mt-2 text-center text-sm text-slate-600">
                                Projected at {calculator.targetAge}. FIRE number: {formatKES(fireNumber)}. You are {Math.round(fireProgress)}% on track.
                            </p>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-950">Retirement Accounts</h3>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700"
                            >
                                <Plus size={14} />
                                Add Account
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                            Accounts: <span className="font-semibold text-slate-900">{retirementAssets.length}</span> | Balance: <span className="font-semibold text-primary-700">{formatKES(totalRetirementBalance)}</span> | Monthly: <span className="font-semibold text-primary-700">{formatKES(totalMonthlyContribution)}</span>
                        </p>

                        {loading ? (
                            <div className="flex items-center gap-2 py-10 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading retirement accounts...</div>
                        ) : retirementAssets.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
                                Add your first retirement account (e.g. NSSF or pension) to start projection and net worth tracking.
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {retirementAssets.map((asset) => (
                                    <article key={asset.uuid} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-slate-900">{asset.name}</p>
                                                <p className="text-sm text-slate-600">
                                                    {formatKES(asset.currentValue)} | {formatKES(asset.purchaseValue)}/mo
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeRetirementAccount(asset)}
                                                disabled={deletingAccountId === asset.uuid}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                                aria-label={`Delete ${asset.name}`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="mt-3 w-full rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-primary-700"
                        >
                            + Link Another Account
                        </button>
                    </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Sparkles size={17} className="text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-950">Explore Pension Products</h3>
                        <button type="button" className="ml-auto text-sm font-semibold text-primary-700">Compare</button>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {PENSION_PRODUCTS.map((product) => (
                            <article key={product.name} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-slate-900">{product.name}</p>
                                        <p className="text-sm text-slate-500">{product.type}</p>
                                    </div>
                                    <p className={`text-sm font-bold ${product.tone}`}>{product.rate}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <div className="flex items-start gap-2">
                            <Sparkles size={16} className="mt-0.5" />
                            <p>
                                Adding KES 7,000/mo extra moves your retirement date earlier and raises your projected pot.
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Timeline</p>
                        <p className="mt-1 text-sm text-slate-700">Target retirement in {yearsRemaining} years with current contribution pattern.</p>
                    </div>
                </section>
            </section>

            {showAddModal && (
                <Modal title="Add Retirement Account" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={addRetirementAccount} className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                            Account type
                            <select
                                value={accountForm.accountName}
                                onChange={(event) => handleFormChange('accountName', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            >
                                {ACCOUNT_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <Input label="Provider / Institution" value={accountForm.provider} onChange={(value) => handleFormChange('provider', value)} placeholder="e.g. NSSF, Sanlam, CIC" />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input label="Current balance (KES)" type="number" value={accountForm.currentBalance} onChange={(value) => handleFormChange('currentBalance', value)} />
                            <Input label="Monthly contribution (KES)" type="number" value={accountForm.monthlyContribution} onChange={(value) => handleFormChange('monthlyContribution', value)} />
                        </div>
                        <Input label="Expected return (% p.a.)" type="number" value={accountForm.expectedReturn} onChange={(value) => handleFormChange('expectedReturn', value)} />
                        <label className="block text-sm font-medium text-slate-700">
                            Notes (optional)
                            <textarea
                                value={accountForm.notes}
                                onChange={(event) => handleFormChange('notes', event.target.value)}
                                rows={3}
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            />
                        </label>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving || !accountForm.currentBalance || !accountForm.monthlyContribution}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                            >
                                {saving && <Loader2 size={15} className="animate-spin" />}
                                Save Account
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

const CalcInput = ({ label, value, onChange }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
            type="number"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
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

export default RetirementPlanner;
