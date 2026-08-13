import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Landmark, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import {
    calculatePlan,
    deletePlan,
    getLatestPlan,
    getTaxRules,
    savePlan,
} from '../../../services/plannerApi';
import PlannerSyncStatus from '../common/PlannerSyncStatus';

const currentYear = new Date().getFullYear();
const defaultForm = {
    name: 'My PAYE estimate',
    tax_year: String(currentYear),
    period: 'MONTHLY',
    is_resident: true,
    gross_income: '',
    nssf_contribution: '0',
    pension_contribution: '0',
    mortgage_interest: '0',
    affordable_housing_levy: '0',
    shif_contribution: '0',
    post_retirement_medical_contribution: '0',
    insurance_premium: '0',
    other_allowable_deductions: '0',
    other_tax_reliefs: '0',
};

const moneyFields = [
    ['gross_income', 'Gross income'],
    ['nssf_contribution', 'NSSF contribution'],
    ['pension_contribution', 'Other pension contribution'],
    ['mortgage_interest', 'Mortgage interest'],
    ['affordable_housing_levy', 'Affordable Housing Levy'],
    ['shif_contribution', 'SHIF contribution'],
    ['post_retirement_medical_contribution', 'Post-retirement medical contribution'],
    ['insurance_premium', 'Eligible insurance premium'],
    ['other_allowable_deductions', 'Other allowable deductions'],
    ['other_tax_reliefs', 'Other tax reliefs'],
];

const formatKES = (value) => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const buildPayload = (form) => ({
    ...form,
    tax_year: Number(form.tax_year),
    gross_income: String(Math.max(Number(form.gross_income || 0), 0)),
    ...Object.fromEntries(moneyFields.slice(1).map(([field]) => [
        field,
        String(Math.max(Number(form[field] || 0), 0)),
    ])),
});

const TaxPlanner = () => {
    const [form, setForm] = useState(defaultForm);
    const [savedPlan, setSavedPlan] = useState(null);
    const [preview, setPreview] = useState(null);
    const [rules, setRules] = useState(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let mounted = true;
        Promise.all([getLatestPlan('tax'), getTaxRules()])
            .then(([plan, taxRules]) => {
                if (!mounted) return;
                setSavedPlan(plan);
                setRules(taxRules);
                if (plan) {
                    setForm((current) => Object.fromEntries(
                        Object.keys(current).map((key) => [
                            key,
                            key === 'is_resident'
                                ? Boolean(plan[key])
                                : String(plan[key] ?? current[key]),
                        ]),
                    ));
                    setPreview(plan.calculation_result || null);
                }
            })
            .catch((err) => setError(err.message || 'Unable to load your tax planner.'))
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const result = preview || savedPlan?.calculation_result || null;
    const warnings = useMemo(() => result?.warnings || [], [result]);

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setSuccess('');
    };

    const validate = () => {
        if (Number(form.gross_income) <= 0) {
            setError('Enter a gross income greater than zero.');
            return false;
        }
        return true;
    };

    const handlePreview = async () => {
        if (!validate()) return;
        setWorking(true);
        setError('');
        setSuccess('');
        try {
            setPreview(await calculatePlan('tax', buildPayload(form)));
            setSuccess('Your estimate was calculated using the live Shilingi tax rules.');
        } catch (err) {
            setError(err.message || 'The tax estimate could not be calculated.');
        } finally {
            setWorking(false);
        }
    };

    const handleSave = async () => {
        if (!validate()) return;
        setWorking(true);
        setError('');
        setSuccess('');
        try {
            const plan = await savePlan('tax', buildPayload(form), savedPlan);
            setSavedPlan(plan);
            setPreview(plan.calculation_result || null);
            setSuccess('Your tax estimate was saved to your Shilingi account.');
        } catch (err) {
            setError(err.message || 'The tax estimate could not be saved.');
        } finally {
            setWorking(false);
        }
    };

    const handleDelete = async () => {
        if (!savedPlan?.uuid || !window.confirm('Delete your saved tax estimate?')) return;
        setWorking(true);
        setError('');
        try {
            await deletePlan('tax', savedPlan.uuid);
            setSavedPlan(null);
            setPreview(null);
            setForm(defaultForm);
            setSuccess('Your saved tax estimate was deleted.');
        } catch (err) {
            setError(err.message || 'The saved estimate could not be deleted.');
        } finally {
            setWorking(false);
        }
    };

    if (loading) {
        return <div className="rounded-[1rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Loading Tax Planner...</div>;
    }

    return (
        <div className="space-y-4 pb-20">
            <section className="rounded-[1rem] bg-[linear-gradient(135deg,_#145f57_0%,_#1f9c72_100%)] px-5 py-5 text-white shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[0.9rem] bg-white/15"><Landmark size={22} /></span>
                        <div>
                            <h2 className="text-xl font-bold">Tax Planner</h2>
                            <p className="mt-1 text-sm text-white/75">Estimate Kenyan PAYE using the live Shilingi backend rules.</p>
                        </div>
                    </div>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">Available on every plan</span>
                </div>
            </section>

            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}
            <PlannerSyncStatus plan={savedPlan} />

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-[1rem] border border-[#d0ddd9] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2"><Calculator size={18} className="text-primary-700" /><h3 className="text-lg font-bold text-slate-950">Your PAYE details</h3></div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-slate-700">Estimate name
                            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500" />
                        </label>
                        <label className="text-sm font-semibold text-slate-700">Tax year
                            <select value={form.tax_year} onChange={(event) => updateField('tax_year', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500">
                                {Array.from({ length: Math.max(currentYear - 2023, 1) }, (_, index) => currentYear - index).map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-slate-700">Period
                            <select value={form.period} onChange={(event) => updateField('period', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500">
                                <option value="MONTHLY">Monthly</option><option value="ANNUAL">Annual</option>
                            </select>
                        </label>
                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 sm:self-end">
                            <input type="checkbox" checked={form.is_resident} onChange={(event) => updateField('is_resident', event.target.checked)} className="h-4 w-4 accent-primary-600" /> Kenyan resident
                        </label>
                        {moneyFields.map(([field, label]) => (
                            <label key={field} className="text-sm font-semibold text-slate-700">{label} (KES)
                                <input type="number" min="0" step="0.01" value={form[field]} onChange={(event) => updateField(field, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500" />
                            </label>
                        ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button type="button" disabled={working} onClick={handlePreview} className="inline-flex items-center gap-2 rounded-xl border border-primary-600 px-4 py-2.5 text-sm font-semibold text-primary-700 disabled:opacity-50"><RefreshCw size={15} /> Calculate estimate</button>
                        <button type="button" disabled={working} onClick={handleSave} className="rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save estimate</button>
                        {savedPlan?.uuid && <button type="button" disabled={working} onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-50"><Trash2 size={15} /> Delete</button>}
                    </div>
                </section>

                <div className="space-y-4">
                    <section className="rounded-[1rem] border border-[#d0ddd9] bg-white p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-950">Your estimate</h3>
                        {result ? (
                            <div className="mt-4 space-y-3">
                                <Metric label="Gross income" value={formatKES(result.gross_income)} />
                                <Metric label="Allowable deductions" value={formatKES(result.total_allowable_deductions)} />
                                <Metric label="Taxable income" value={formatKES(result.taxable_income)} />
                                <Metric label="Estimated PAYE" value={formatKES(result.estimated_paye)} emphasis />
                                <Metric label="Income after PAYE" value={formatKES(result.income_after_paye)} />
                                <Metric label="Effective tax rate" value={`${result.effective_tax_rate_percent || '0'}%`} />
                            </div>
                        ) : <p className="mt-4 text-sm leading-6 text-slate-500">Enter your income and select Calculate estimate. Nothing is saved until you choose Save estimate.</p>}
                    </section>

                    <section className="rounded-[1rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
                        <div className="flex items-center gap-2 font-bold"><ShieldCheck size={17} /> Important tax note</div>
                        <p className="mt-2 leading-6">{result?.disclaimer || rules?.disclaimer || 'This is an educational estimate and not a KRA filing or professional tax advice.'}</p>
                        {warnings.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
                        {(result?.rules_version || rules?.rules_version) && <p className="mt-3 text-xs font-semibold">Rules version: {result?.rules_version || rules?.rules_version}</p>}
                    </section>
                </div>
            </div>
        </div>
    );
};

const Metric = ({ label, value, emphasis = false }) => (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${emphasis ? 'bg-primary-700 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <span className="text-sm font-medium">{label}</span><span className="font-bold">{value}</span>
    </div>
);

export default TaxPlanner;
