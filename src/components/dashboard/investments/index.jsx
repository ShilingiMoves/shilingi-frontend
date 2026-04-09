import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Building2, Landmark, LineChart, Loader2, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { createAsset, createAssetCategory, getAssetCategories, getAssets } from '../../../services/investmentTrackerApi';
import { markDashboardDataExists } from '../../../utils/dashboardDataState';
import { useHealthRefresh } from '../../../hooks/useHealthRefresh';

const INVESTMENT_TYPES = [
    { id: 'fixed-income', label: 'Fixed Income Investment', categoryName: 'Fixed Income Investment', keywords: ['fixed income', 'bond', 'treasury', 'money market', 'mmf'], color: '#1e40af', isLiquid: true, icon: Landmark },
    { id: 'real-estate', label: 'Real Estate Investment', categoryName: 'Real Estate Investment', keywords: ['real estate', 'property', 'land', 'reit'], color: '#0f766e', isLiquid: false, icon: Building2 },
    { id: 'stocks', label: 'Stocks Investment', categoryName: 'Stocks Investment', keywords: ['stock', 'equity', 'shares', 'nse'], color: '#7c3aed', isLiquid: true, icon: LineChart },
    { id: 'insurance', label: 'Insurance Policy', categoryName: 'Insurance Policy', keywords: ['insurance', 'policy', 'cover'], color: '#0e7490', isLiquid: false, icon: ShieldCheck },
    { id: 'other', label: 'Other Investment', categoryName: 'Other Investment', keywords: ['investment'], color: '#475569', isLiquid: false, icon: Plus },
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

const formatKES = (amount) => `KES ${Math.round(Number(amount || 0)).toLocaleString('en-KE')}`;
const normalize = (value) => String(value || '').trim().toLowerCase();
const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const isInvestmentCategory = (categoryName) => {
    const value = normalize(categoryName);
    return INVESTMENT_TYPES.some((type) => type.keywords.some((keyword) => value.includes(keyword)));
};

const getCategoryIdentifier = (category) => {
    if (!category) return null;
    const candidates = [category.categoryId, category.id, category.raw?.id, category.raw?.pk, category.raw?.category_id];
    for (const candidate of candidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        const parsed = Number(candidate);
        if (Number.isFinite(parsed)) return parsed;
        if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
    return null;
};

const futureValue = (monthlyContribution, years, expectedReturn) => {
    const pmt = toNumber(monthlyContribution);
    const n = Math.max(toNumber(years) * 12, 0);
    const r = toNumber(expectedReturn) / 100 / 12;
    if (!n) return 0;
    if (!r) return pmt * n;
    return pmt * (((1 + r) ** n - 1) / r);
};

const exploreProducts = [
    { name: 'CBK Treasury Bills', type: 'Government - Very Low Risk', rate: '16.2% p.a.' },
    { name: 'Sanlam Unit Trust', type: 'Unit Trust - Low-Medium Risk', rate: '14.1% p.a.' },
    { name: 'Sima DT SACCO', type: 'SACCO - Low Risk', rate: '12.5% p.a.' },
    { name: 'NSE Equities', type: 'Stock Market - Medium-High Risk', rate: 'Varies' },
];

const InvestmentTracker = () => {
    const { triggerHealthRefresh } = useHealthRefresh();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [assets, setAssets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);

    const [simulator, setSimulator] = useState({
        monthlyContribution: '5000',
        durationYears: '10',
        expectedReturn: '12',
    });

    const refreshData = async () => {
        setLoading(true);
        setError('');
        try {
            const [categoryList, assetList] = await Promise.all([getAssetCategories(), getAssets()]);
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

    const investmentCategoryIds = useMemo(
        () => new Set(categories.filter((category) => isInvestmentCategory(category.name)).map((category) => String(category.id))),
        [categories]
    );

    const investmentAssets = useMemo(
        () =>
            assets.filter((asset) => {
                const categoryId = String(asset.category ?? '');
                return investmentCategoryIds.has(categoryId) || isInvestmentCategory(asset.categoryName);
            }),
        [assets, investmentCategoryIds]
    );

    const totals = useMemo(() => {
        const totalValue = investmentAssets.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
        const totalGainLoss = investmentAssets.reduce((sum, item) => sum + Number(item.gainLoss || 0), 0);
        return { totalValue, totalGainLoss, count: investmentAssets.length };
    }, [investmentAssets]);

    const allocation = useMemo(() => {
        if (!totals.totalValue) return [];
        return investmentAssets.map((item) => ({
            id: item.uuid,
            name: item.name,
            value: Number(item.currentValue || 0),
            percent: (Number(item.currentValue || 0) / totals.totalValue) * 100,
        }));
    }, [investmentAssets, totals.totalValue]);

    const projectedValue = useMemo(
        () => futureValue(simulator.monthlyContribution, simulator.durationYears, simulator.expectedReturn),
        [simulator]
    );

    const findCategoryForType = (type) =>
        categories.find((category) => {
            const name = normalize(category.name);
            if (name === normalize(type.categoryName)) return true;
            return type.keywords.some((keyword) => name.includes(keyword));
        }) || null;

    const handleSelectType = async (type) => {
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            let category = findCategoryForType(type);
            if (!category) {
                await createAssetCategory({ name: type.categoryName, color: type.color, is_liquid: type.isLiquid });
                const updatedCategories = await getAssetCategories();
                setCategories(updatedCategories);
                category = updatedCategories.find((item) => normalize(item.name) === normalize(type.categoryName)) || null;
            }
            if (!getCategoryIdentifier(category)) throw new Error(`Unable to resolve a category id for ${type.label}.`);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedCategory) return;
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const categoryIdentifier = getCategoryIdentifier(selectedCategory);
            if (!categoryIdentifier) throw new Error('Could not map this investment category to a valid id.');

            await createAsset({
                name: formData.name,
                category: categoryIdentifier,
                current_value: String(toNumber(formData.current_value)),
                purchase_value: formData.purchase_value ? String(toNumber(formData.purchase_value)) : null,
                currency: 'KES',
                purchase_date: formData.purchase_date || null,
                interest_rate: formData.interest_rate ? String(toNumber(formData.interest_rate)) : null,
                institution: formData.institution || '',
                account_number: formData.account_number || '',
                is_liquid: selectedType?.isLiquid || false,
                include_in_net_worth: true,
                last_valued_date: new Date().toISOString().split('T')[0],
                notes: formData.notes || '',
            });

            await refreshData();
            setSuccess('Investment added successfully.');
            markDashboardDataExists();
            triggerHealthRefresh('investment:create');
            setShowFormModal(false);
        } catch (err) {
            setError(err.message || 'Failed to add investment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <section className="flex flex-col gap-3 rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="inline-flex items-center gap-2 text-xl font-extrabold">Investment Planner</p>
                    <p className="mt-1 text-sm text-white/85">Grow your wealth with curated Kenyan and global options.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowTypeModal(true)}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#0f6b5b]"
                >
                    + New Investment
                </button>
            </section>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

            <div className="overflow-x-auto">
                <div className="inline-flex min-w-max rounded-xl border border-slate-200 bg-white p-1">
                    <button type="button" onClick={() => setActiveTab('portfolio')} className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>My Portfolio</button>
                    <button type="button" onClick={() => setActiveTab('explore')} className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap ${activeTab === 'explore' ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>Explore Products</button>
                    <button type="button" onClick={() => setActiveTab('simulator')} className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap ${activeTab === 'simulator' ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>Simulator</button>
                </div>
            </div>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-950">Portfolio Overview - {formatKES(totals.totalValue)}</h3>
                        <span className="text-xs font-semibold text-primary-700">Rebalance</span>
                    </div>
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="flex h-2 w-full">
                            {allocation.length > 0 ? (
                                allocation.map((item) => <div key={item.id} style={{ width: `${item.percent}%` }} className="h-2 border-r border-white last:border-r-0 bg-primary-600" />)
                            ) : (
                                <div className="h-2 w-full bg-slate-300" />
                            )}
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Loading portfolio...</div>
                    ) : investmentAssets.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">No investments yet. Click + New Investment to begin.</p>
                    ) : (
                        <div className="space-y-2">
                            {investmentAssets.map((asset) => (
                                <div key={asset.uuid} className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#f7fbf9] px-3 py-2.5">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
                                        <p className="text-xs text-slate-500">{asset.categoryName || 'Investment'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-slate-900">{formatKES(asset.currentValue)}</p>
                                        <p className={`inline-flex items-center gap-1 text-xs font-semibold ${asset.gainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {asset.gainLoss >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {asset.gainLoss >= 0 ? '+' : '-'}{formatKES(Math.abs(asset.gainLoss))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-950">Explore Products</h3>
                        <span className="text-xs font-semibold text-primary-700">Compare All</span>
                    </div>
                    <div className="space-y-2">
                        {exploreProducts.map((item) => (
                            <div key={item.name} className="rounded-xl border border-slate-200 bg-[#f7fbf9] px-3 py-2.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.type}</p>
                                    </div>
                                    <p className="text-sm font-extrabold text-primary-700">{item.rate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-bold text-slate-950">
                    <Sparkles size={15} className="text-primary-700" />
                    Investment Simulator
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                    <Field label="Monthly Contribution" value={simulator.monthlyContribution} onChange={(value) => setSimulator((c) => ({ ...c, monthlyContribution: value }))} />
                    <Field label="Duration (Years)" value={simulator.durationYears} onChange={(value) => setSimulator((c) => ({ ...c, durationYears: value }))} />
                    <Field label="Expected Return (%)" value={simulator.expectedReturn} onChange={(value) => setSimulator((c) => ({ ...c, expectedReturn: value }))} />
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Projected Value</p>
                    <p className="mt-1 text-3xl font-extrabold text-primary-700 sm:text-4xl">{formatKES(projectedValue)}</p>
                </div>
            </section>

            {showTypeModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between rounded-t-2xl bg-primary-700 px-5 py-4 text-white">
                            <h3 className="text-xl font-bold">Select Investment Type</h3>
                            <button type="button" onClick={() => setShowTypeModal(false)} className="rounded-lg p-1 text-white/90 hover:bg-white/10">
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
                                    className="flex w-full items-center gap-3 rounded-xl bg-primary-600 px-4 py-3 text-left text-base font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Add {selectedType?.label}</h3>
                                <p className="text-sm text-slate-500">Category: {selectedCategory?.name}</p>
                            </div>
                            <button type="button" onClick={() => setShowFormModal(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                            <TextField label="Investment name" value={formData.name} onChange={(value) => setFormData((c) => ({ ...c, name: value }))} required />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField type="number" label="Current value (KES)" value={formData.current_value} onChange={(value) => setFormData((c) => ({ ...c, current_value: value }))} required />
                                <TextField type="number" label="Purchase value (KES)" value={formData.purchase_value} onChange={(value) => setFormData((c) => ({ ...c, purchase_value: value }))} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField type="date" label="Purchase date" value={formData.purchase_date} onChange={(value) => setFormData((c) => ({ ...c, purchase_date: value }))} />
                                <TextField type="number" label="Interest / Growth rate (%)" value={formData.interest_rate} onChange={(value) => setFormData((c) => ({ ...c, interest_rate: value }))} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField label="Institution" value={formData.institution} onChange={(value) => setFormData((c) => ({ ...c, institution: value }))} />
                                <TextField label="Account / Reference number" value={formData.account_number} onChange={(value) => setFormData((c) => ({ ...c, account_number: value }))} />
                            </div>
                            <label className="block text-sm font-medium text-slate-700">
                                Notes
                                <textarea rows={3} value={formData.notes} onChange={(event) => setFormData((c) => ({ ...c, notes: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
                            </label>
                            <div className="flex items-center gap-3 pt-2">
                                <button type="submit" disabled={submitting} className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                                    {submitting ? 'Saving...' : 'Save Investment'}
                                </button>
                                <button type="button" onClick={() => setShowFormModal(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
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

const Field = ({ label, value, onChange }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <input type="number" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
    </label>
);

const TextField = ({ label, value, onChange, type = 'text', required = false }) => (
    <label className="block text-sm font-medium text-slate-700">
        {label}
        <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
    </label>
);

export default InvestmentTracker;
