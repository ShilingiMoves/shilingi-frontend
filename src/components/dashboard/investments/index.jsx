import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    Landmark,
    LineChart,
    Loader2,
    Plus,
    ShieldCheck,
    X
} from 'lucide-react';
import {
    createAsset,
    createAssetCategory,
    getAssetCategories,
    getAssets,
} from '../../../services/investmentTrackerApi';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';
import { markDashboardDataExists } from '../../../pages/DashboardPage';

const INVESTMENT_TYPES = [
    {
        id: 'fixed-income',
        label: 'Fixed Income Investment',
        categoryName: 'Fixed Income Investment',
        keywords: ['fixed income', 'bond', 'treasury', 'money market', 'mmf'],
        color: '#1e40af',
        isLiquid: true,
        icon: Landmark,
    },
    {
        id: 'real-estate',
        label: 'Real Estate Investment',
        categoryName: 'Real Estate Investment',
        keywords: ['real estate', 'property', 'land', 'reit'],
        color: '#0f766e',
        isLiquid: false,
        icon: Building2,
    },
    {
        id: 'stocks',
        label: 'Stocks Investment',
        categoryName: 'Stocks Investment',
        keywords: ['stock', 'equity', 'shares', 'nse'],
        color: '#7c3aed',
        isLiquid: true,
        icon: LineChart,
    },
    {
        id: 'insurance',
        label: 'Insurance Policy',
        categoryName: 'Insurance Policy',
        keywords: ['insurance', 'policy', 'cover'],
        color: '#0e7490',
        isLiquid: false,
        icon: ShieldCheck,
    },
    {
        id: 'other',
        label: 'Other Investment',
        categoryName: 'Other Investment',
        keywords: ['investment'],
        color: '#475569',
        isLiquid: false,
        icon: Plus,
    },
];

const defaultFormData = {
    name: '',
    current_value: '',
    purchase_value: '',
    purchase_date: '',
    interest_rate: '',
    institution: '',
    account_number: '',
    notes: '',
};

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function formatAmount(amount) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
}

function formatDate(dateValue) {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isInvestmentCategory(categoryName) {
    const value = normalize(categoryName);
    return INVESTMENT_TYPES.some((type) => type.keywords.some((keyword) => value.includes(keyword)));
}

function getCategoryIdentifier(category) {
    if (!category) return null;
    const candidates = [
        category.categoryId,
        category.id,
        category.raw?.id,
        category.raw?.pk,
        category.raw?.category_id,
    ];

    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined || candidate === '') {
            continue;
        }
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

const InvestmentTracker = () => {
    const { triggerHealthRefresh } = useHealthRefresh();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);

    const refreshData = async () => {
        setLoading(true);
        setError('');
        try {
            const [categoryList, assetList] = await Promise.all([
                getAssetCategories(),
                getAssets(),
            ]);
            setCategories(categoryList);
            setAssets(assetList);
        } catch (err) {
            setError(err.message || 'Failed to load investments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const investmentCategoryIds = useMemo(() => {
        return new Set(
            categories
                .filter((category) => isInvestmentCategory(category.name))
                .map((category) => String(category.id))
        );
    }, [categories]);

    const investmentAssets = useMemo(() => {
        return assets.filter((asset) => {
            const categoryId = String(asset.category ?? '');
            return investmentCategoryIds.has(categoryId) || isInvestmentCategory(asset.categoryName);
        });
    }, [assets, investmentCategoryIds]);

    const totals = useMemo(() => {
        const totalValue = investmentAssets.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
        const totalGainLoss = investmentAssets.reduce((sum, item) => sum + Number(item.gainLoss || 0), 0);
        return {
            totalValue,
            totalGainLoss,
            count: investmentAssets.length,
        };
    }, [investmentAssets]);

    const findCategoryForType = (type) => {
        return categories.find((category) => {
            const name = normalize(category.name);
            if (name === normalize(type.categoryName)) return true;
            return type.keywords.some((keyword) => name.includes(keyword));
        }) || null;
    };

    const handleSelectType = async (type) => {
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            let category = findCategoryForType(type);
            if (!category) {
                await createAssetCategory({
                    name: type.categoryName,
                    color: type.color,
                    is_liquid: type.isLiquid,
                });
                const updatedCategories = await getAssetCategories();
                setCategories(updatedCategories);
                category = updatedCategories.find((item) => normalize(item.name) === normalize(type.categoryName)) || null;
            }

            if (!getCategoryIdentifier(category)) {
                throw new Error(`Unable to resolve a category id for ${type.label}.`);
            }

            setSelectedType(type);
            setSelectedCategory(category);
            setFormData(defaultFormData);
            setShowTypeModal(false);
            setShowFormModal(true);
        } catch (err) {
            setError(err.message || 'Failed to prepare selected investment type');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        setSelectedType(null);
        setSelectedCategory(null);
        setFormData(defaultFormData);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedCategory) return;

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const categoryIdentifier = getCategoryIdentifier(selectedCategory);
            if (!categoryIdentifier) {
                throw new Error('Could not map this investment category to a valid id. Please refresh and try again.');
            }
            const payload = {
                name: formData.name,
                category: categoryIdentifier,
                current_value: Number(formData.current_value).toString(),
                purchase_value: formData.purchase_value ? Number(formData.purchase_value).toString() : null,
                currency: 'KES',
                purchase_date: formData.purchase_date || null,
                interest_rate: formData.interest_rate ? Number(formData.interest_rate).toString() : null,
                institution: formData.institution || '',
                account_number: formData.account_number || '',
                is_liquid: selectedType?.isLiquid || false,
                include_in_net_worth: true,
                last_valued_date: new Date().toISOString().split('T')[0],
                notes: formData.notes || '',
            };

            await createAsset(payload);
            await refreshData();
            setSuccess('Investment added successfully.');
            markDashboardDataExists();
            triggerHealthRefresh('investment:create');
            closeFormModal();
        } catch (err) {
            setError(err.message || 'Failed to add investment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">
                                Investments
                            </p>
                            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
                                Investment Planner
                            </h1>
                            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                                Add and monitor your fixed income, property, stocks, insurance, and other investments.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowTypeModal(true)}
                            className="inline-flex items-center gap-2 self-start rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
                        >
                            <Plus size={16} />
                            Add Investment
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total investments</p>
                        <p className="mt-3 text-2xl font-extrabold text-slate-900">KES {formatAmount(totals.totalValue)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Holdings</p>
                        <p className="mt-3 text-2xl font-extrabold text-slate-900">{totals.count}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Net gain/loss</p>
                        <p className={`mt-3 flex items-center gap-1 text-2xl font-extrabold ${totals.totalGainLoss >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {totals.totalGainLoss >= 0 ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                            KES {formatAmount(Math.abs(totals.totalGainLoss))}
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Your investments</h2>
                    <p className="mt-1 text-sm text-slate-500">Every record here is created through the Assets endpoint using investment-focused categories.</p>

                    {loading ? (
                        <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
                            <Loader2 className="animate-spin" size={16} />
                            Loading investments...
                        </div>
                    ) : investmentAssets.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                            <p className="text-slate-700">No investments yet.</p>
                            <p className="mt-2 text-sm text-slate-500">Click “Add Investment” to start tracking.</p>
                        </div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {investmentAssets.map((asset) => (
                                <article key={asset.uuid} className="rounded-xl border border-slate-200 bg-white px-4 py-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-base font-bold text-slate-900">{asset.name}</p>
                                            <p className="text-sm text-slate-600">{asset.categoryName || 'Investment'}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {asset.institution || 'Institution not set'} • Last valued {formatDate(asset.lastValuedDate)}
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            <p className="text-lg font-extrabold text-slate-900">KES {formatAmount(asset.currentValue)}</p>
                                            <p className={`text-xs font-semibold ${asset.gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {asset.gainLoss >= 0 ? '+' : '-'}KES {formatAmount(Math.abs(asset.gainLoss))}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {showTypeModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between rounded-t-2xl bg-primary-700 px-5 py-4 text-white">
                            <h3 className="text-xl font-bold">Select Investment Type</h3>
                            <button
                                type="button"
                                onClick={() => setShowTypeModal(false)}
                                className="rounded-lg p-1 text-white/90 transition-colors hover:bg-white/10"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <div className="space-y-3 p-5">
                            {INVESTMENT_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleSelectType(type)}
                                    className="flex w-full items-center justify-start gap-3 rounded-xl bg-primary-600 px-4 py-3 text-left text-base font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <type.icon size={18} />
                                    {`Add ${type.label}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Add {selectedType?.label}</h3>
                                <p className="text-sm text-slate-500">Category: {selectedCategory?.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeFormModal}
                                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Investment name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(event) => handleChange('name', event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                    placeholder="e.g. NSE Bluechip Portfolio"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Current value (KES)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formData.current_value}
                                        onChange={(event) => handleChange('current_value', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Purchase value (KES)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.purchase_value}
                                        onChange={(event) => handleChange('purchase_value', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Purchase date</label>
                                    <input
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(event) => handleChange('purchase_date', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Interest/Growth rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.interest_rate}
                                        onChange={(event) => handleChange('interest_rate', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Institution</label>
                                    <input
                                        type="text"
                                        value={formData.institution}
                                        onChange={(event) => handleChange('institution', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                        placeholder="e.g. KCB, CIC, ICEA"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Account/Reference number</label>
                                    <input
                                        type="text"
                                        value={formData.account_number}
                                        onChange={(event) => handleChange('account_number', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(event) => handleChange('notes', event.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                                    placeholder="Optional details about this investment..."
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    Save Investment
                                </button>
                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestmentTracker;
