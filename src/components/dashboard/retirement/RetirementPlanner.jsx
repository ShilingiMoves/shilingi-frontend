import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, PiggyBank, Plus, Sparkles, Timer, X } from 'lucide-react';
import { createAsset, createAssetCategory, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';

const RETIREMENT_CATEGORY_NAME = 'Retirement Account';

const ACCOUNT_OPTIONS = [
    'NSSF - National Social Security Fund',
    'Sanlam Umbrella Pension',
    'Individual Pension Plan',
    'Employer Pension Scheme',
    'Retirement Savings Account',
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
    const parsed = Number(matched.categoryId ?? matched.id);
    return Number.isFinite(parsed) ? parsed : null;
};

const RetirementPlanner = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
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

        await createAssetCategory({
            name: RETIREMENT_CATEGORY_NAME,
            color: '#166b5a',
            is_liquid: false,
        });
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

    return (
        <div className="space-y-5">
            <section className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#165f4f_0%,_#1e735f_70%,_#155246_100%)] px-6 py-6 text-white shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">Retirement Planner</p>
                        <h2 className="mt-2 text-3xl font-extrabold">Plan your financial freedom with confidence.</h2>
                        <p className="mt-2 text-sm text-emerald-50/90">Track retirement accounts and project your future retirement pot.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-700"
                    >
                        <Plus size={16} />
                        Add Account
                    </button>
                </div>
            </section>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <section className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Retirement accounts" value={String(retirementAssets.length)} />
                <MetricCard label="Current retirement balance" value={formatKES(totalRetirementBalance)} />
                <MetricCard label="Monthly contribution" value={formatKES(totalMonthlyContribution)} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <PiggyBank size={18} className="text-primary-700" />
                        <h3 className="text-lg font-bold text-slate-950">Retirement Calculator</h3>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <CalcInput label="Current age" value={calculator.currentAge} onChange={(value) => handleCalcChange('currentAge', value)} />
                        <CalcInput label="Target retirement age" value={calculator.targetAge} onChange={(value) => handleCalcChange('targetAge', value)} />
                        <CalcInput label="Current savings (KES)" value={calculator.currentSavings} onChange={(value) => handleCalcChange('currentSavings', value)} />
                        <CalcInput label="Monthly contribution (KES)" value={calculator.monthlyContribution} onChange={(value) => handleCalcChange('monthlyContribution', value)} />
                        <CalcInput label="Expected return (% p.a.)" value={calculator.expectedReturn} onChange={(value) => handleCalcChange('expectedReturn', value)} />
                        <CalcInput label="Monthly expenses at retirement" value={calculator.monthlyExpensesAtRetirement} onChange={(value) => handleCalcChange('monthlyExpensesAtRetirement', value)} />
                    </div>
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Projected retirement pot</p>
                        <p className="mt-2 text-4xl font-extrabold text-primary-800">{formatKES(projectedPot)}</p>
                        <p className="mt-2 text-sm text-slate-600">
                            FIRE number target: {formatKES(fireNumber)} ({Math.round(fireProgress)}% secured)
                        </p>
                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-primary-600" style={{ width: `${fireProgress}%` }} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-950">Retirement Accounts</h3>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700"
                        >
                            <Plus size={14} />
                            Add
                        </button>
                    </div>
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
                                    <p className="font-semibold text-slate-900">{asset.name}</p>
                                    <p className="text-sm text-slate-600">
                                        Balance: {formatKES(asset.currentValue)} • Monthly: {formatKES(asset.purchaseValue)}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <div className="flex items-start gap-2">
                            <Sparkles size={16} className="mt-0.5" />
                            <p>
                                Increasing monthly contributions has the biggest impact on your retirement timeline.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        <Timer size={13} />
                        Target in {yearsRemaining} years
                    </div>
                </div>
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

const MetricCard = ({ label, value }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-extrabold text-primary-700">{value}</p>
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
