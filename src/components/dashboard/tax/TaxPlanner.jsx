import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeDollarSign,
    BookOpen,
    Briefcase,
    Calculator,
    Check,
    CheckCircle2,
    FileText,
    GraduationCap,
    Landmark,
    PiggyBank,
    Receipt,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Sprout,
    UserCheck,
    Users,
    WalletCards,
    Trash2,
    X,
} from 'lucide-react';
import {
    calculatePlan,
    deletePlan,
    getLatestPlan,
    getTaxRules,
    savePlan,
} from '../../../services/plannerApi';
import PlannerSyncStatus from '../common/PlannerSyncStatus';

const currentYear = new Date().getFullYear();
export const TAX_ONBOARDING_STORAGE_PREFIX = 'shilingi_tax_planner_onboarding_v1';

const personaOptions = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'first-job', label: 'First job', icon: Sparkles },
    { id: 'professional', label: 'Young professional', icon: Briefcase },
    { id: 'new-taxpayer', label: 'New taxpayer', icon: Receipt },
];

const taxQuestions = [
    {
        id: 'payslip',
        title: 'Do you usually receive a payslip?',
        help: 'This helps us explain how your salary and deductions work.',
        options: [['yes', 'Yes'], ['no', 'No'], ['unsure', "I'm not sure"]],
    },
    {
        id: 'resident',
        title: 'Are you a Kenyan tax resident?',
        help: 'Residence affects the tax bands and reliefs applied to your estimate.',
        options: [['yes', 'Yes'], ['no', 'No'], ['unsure', "I'm not sure"]],
    },
    {
        id: 'accounts',
        title: 'Which of these do you currently have?',
        help: 'Select all that apply.',
        multiple: true,
        options: [
            ['kra', 'KRA', Landmark],
            ['sha', 'SHA Registration', ShieldCheck],
            ['nssf', 'NSSF', PiggyBank],
            ['pension', 'Pension Account', WalletCards],
            ['insurance', 'Insurance Policy', Receipt],
            ['none', 'None of the above', X],
        ],
    },
    {
        id: 'paye',
        title: 'Do you know if your employer deducts PAYE before paying your salary?',
        help: '',
        options: [['yes', 'Yes'], ['no', 'No'], ['unsure', "I'm not sure"]],
    },
    {
        id: 'goals',
        title: 'What would you like help with today?',
        help: 'Select all that apply.',
        multiple: true,
        options: [
            ['deductions', 'Understanding why tax is deducted', BadgeDollarSign],
            ['payslip', 'Reading my payslip', FileText],
            ['return', 'Filing my tax return', Receipt],
            ['take-home', 'Estimating my take-home pay', Calculator],
            ['learning', 'Learning how taxes work', BookOpen],
            ['exploring', "I'm just exploring", Sprout],
        ],
    },
];
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

const TaxPlanner = ({ user = {} }) => {
    const [form, setForm] = useState(defaultForm);
    const [savedPlan, setSavedPlan] = useState(null);
    const [preview, setPreview] = useState(null);
    const [rules, setRules] = useState(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [journeyStep, setJourneyStep] = useState('loading');
    const [persona, setPersona] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    const [incomeEstimate, setIncomeEstimate] = useState('');
    const [salaryBasis, setSalaryBasis] = useState('GROSS');
    const [nssfRate, setNssfRate] = useState('TIER_1_2');
    const [incomeDeductions, setIncomeDeductions] = useState({ shif: false, housing: false });
    const onboardingStorageKey = useMemo(() => {
        const identifier = user?.uuid || user?.id || user?.email || 'guest';
        return `${TAX_ONBOARDING_STORAGE_PREFIX}_${identifier}`;
    }, [user?.email, user?.id, user?.uuid]);

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
                const completedOnboarding = typeof window !== 'undefined'
                    && window.localStorage.getItem(onboardingStorageKey) === 'true';
                setJourneyStep(plan || completedOnboarding ? 'planner' : 'persona');
            })
            .catch((err) => {
                setError(err.message || 'Unable to load your tax planner.');
                const completedOnboarding = typeof window !== 'undefined'
                    && window.localStorage.getItem(onboardingStorageKey) === 'true';
                setJourneyStep(completedOnboarding ? 'planner' : 'persona');
            })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [onboardingStorageKey]);

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

    const handleAnswer = (questionId, value) => {
        const question = taxQuestions.find((item) => item.id === questionId);
        setAnswers((current) => {
            if (!question?.multiple) return { ...current, [questionId]: value };

            const selected = Array.isArray(current[questionId]) ? current[questionId] : [];
            if (value === 'none') {
                return { ...current, [questionId]: selected.includes('none') ? [] : ['none'] };
            }
            const withoutNone = selected.filter((item) => item !== 'none');
            return {
                ...current,
                [questionId]: withoutNone.includes(value)
                    ? withoutNone.filter((item) => item !== value)
                    : [...withoutNone, value],
            };
        });
        if (questionId === 'resident' && value !== 'unsure') {
            updateField('is_resident', value === 'yes');
        }
    };

    const finishOnboarding = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(onboardingStorageKey, 'true');
        }
        setJourneyStep('planner');
    };

    const continueQuestionnaire = () => {
        if (questionIndex === taxQuestions.length - 1) {
            setJourneyStep('preparing');
            return;
        }
        setQuestionIndex((current) => current + 1);
    };

    const applyIncomeCalculator = () => {
        const estimate = Number(incomeEstimate || 0);
        if (estimate > 0) updateField('gross_income', String(estimate));
        if (!incomeDeductions.housing) updateField('affordable_housing_levy', '0');
        if (!incomeDeductions.shif) updateField('shif_contribution', '0');
        setCalculatorOpen(false);
    };

    if (loading) {
        return <div className="rounded-[1rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Loading Tax Planner...</div>;
    }

    if (journeyStep !== 'planner') {
        return (
            <TaxPlannerJourney
                answers={answers}
                currentQuestion={taxQuestions[questionIndex]}
                displayName={user?.preferred_name || user?.first_name || user?.name || 'there'}
                form={form}
                journeyStep={journeyStep}
                onAnswer={handleAnswer}
                onBack={() => {
                    if (journeyStep === 'welcome') setJourneyStep('persona');
                    if (journeyStep === 'known') setJourneyStep('welcome');
                    if (journeyStep === 'questions') {
                        if (questionIndex === 0) setJourneyStep('known');
                        else setQuestionIndex((current) => current - 1);
                    }
                    if (journeyStep === 'preparing') {
                        setQuestionIndex(taxQuestions.length - 1);
                        setJourneyStep('questions');
                    }
                }}
                onContinue={() => {
                    if (journeyStep === 'persona') setJourneyStep('welcome');
                    if (journeyStep === 'welcome') setJourneyStep('known');
                    if (journeyStep === 'known') setJourneyStep('questions');
                    if (journeyStep === 'questions') continueQuestionnaire();
                    if (journeyStep === 'preparing') finishOnboarding();
                }}
                persona={persona}
                questionIndex={questionIndex}
                selectPersona={setPersona}
                user={user}
            />
        );
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
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2"><Calculator size={18} className="text-primary-700" /><h3 className="text-lg font-bold text-slate-950">Your PAYE details</h3></div>
                        <button
                            type="button"
                            onClick={() => {
                                setIncomeEstimate(form.gross_income || '');
                                setCalculatorOpen(true);
                            }}
                            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0c6664] px-4 text-xs font-bold text-white sm:hidden"
                        >
                            <Calculator size={15} /> Calculate income
                        </button>
                    </div>
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

            {calculatorOpen && (
                <IncomeCalculatorSheet
                    deductions={incomeDeductions}
                    income={incomeEstimate}
                    nssfRate={nssfRate}
                    onClose={() => setCalculatorOpen(false)}
                    onContinue={applyIncomeCalculator}
                    onDeductionsChange={setIncomeDeductions}
                    onIncomeChange={setIncomeEstimate}
                    onNssfRateChange={setNssfRate}
                    onSalaryBasisChange={setSalaryBasis}
                    salaryBasis={salaryBasis}
                />
            )}
        </div>
    );
};

const Metric = ({ label, value, emphasis = false }) => (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${emphasis ? 'bg-primary-700 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <span className="text-sm font-medium">{label}</span><span className="font-bold">{value}</span>
    </div>
);

const IncomeCalculatorSheet = ({
    deductions,
    income,
    nssfRate,
    onClose,
    onContinue,
    onDeductionsChange,
    onIncomeChange,
    onNssfRateChange,
    onSalaryBasisChange,
    salaryBasis,
}) => (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-6" role="presentation">
        <section
            aria-labelledby="income-calculator-title"
            aria-modal="true"
            className="w-full max-w-[360px] rounded-t-[22px] bg-white px-5 pb-[max(22px,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:rounded-[22px]"
            role="dialog"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 id="income-calculator-title" className="text-[15px] font-extrabold text-[#0c6664]">Calculate Income</h2>
                    <p className="mt-1 text-[10px] text-slate-500">Kindly provide the following to add your fund</p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close income calculator" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <X size={14} />
                </button>
            </div>

            <div className="mt-4 space-y-3.5">
                <label className="block text-[10px] font-semibold text-slate-500">Estimated Monthly Income
                    <input
                        inputMode="decimal"
                        min="0"
                        onChange={(event) => onIncomeChange(event.target.value)}
                        placeholder="Eg. 50,000"
                        type="number"
                        value={income}
                        className="mt-1.5 h-10 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none focus:border-[#0c6664] focus:ring-2 focus:ring-[#0c6664]/10"
                    />
                </label>
                <label className="block text-[10px] font-semibold text-slate-500">Select Treat Salary As
                    <select value={salaryBasis} onChange={(event) => onSalaryBasisChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-[#0c6664]">
                        <option value="GROSS">Gross Pay</option>
                        <option value="NET">Net Pay</option>
                    </select>
                </label>
                <label className="block text-[10px] font-semibold text-slate-500">Select NSSF Rates
                    <select value={nssfRate} onChange={(event) => onNssfRateChange(event.target.value)} className="mt-1.5 h-10 w-full rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-[#0c6664]">
                        <option value="TIER_1_2">NSSF Tier 1 &amp; 2</option>
                        <option value="TIER_1">NSSF Tier 1</option>
                        <option value="NONE">No NSSF deduction</option>
                    </select>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                    <input type="checkbox" checked={deductions.shif} onChange={(event) => onDeductionsChange((current) => ({ ...current, shif: event.target.checked }))} className="h-4 w-4 rounded accent-[#0c6664]" />
                    Deduct SHIF/SHA
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                    <input type="checkbox" checked={deductions.housing} onChange={(event) => onDeductionsChange((current) => ({ ...current, housing: event.target.checked }))} className="h-4 w-4 rounded accent-[#0c6664]" />
                    Deduct Housing Levy
                </label>
            </div>

            <button type="button" onClick={onContinue} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0c6664] text-sm font-bold text-white shadow-sm transition hover:bg-[#095856]">
                Continue
            </button>
        </section>
    </div>
);

export default TaxPlanner;

const TaxPlannerJourney = ({
    answers,
    currentQuestion,
    displayName,
    form,
    journeyStep,
    onAnswer,
    onBack,
    onContinue,
    persona,
    questionIndex,
    selectPersona,
    user,
}) => {
    const selectedPersona = personaOptions.find((option) => option.id === persona);
    const monthlyIncome = Number(user?.monthly_income || user?.profile?.monthly_income || form.gross_income || 0);
    const incomeLabel = monthlyIncome > 0
        ? `KES ${monthlyIncome.toLocaleString('en-KE')}`
        : 'We will confirm this next';
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
    const hasCurrentAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : Boolean(currentAnswer);
    const questionIntro = [
        "Let's start with how your salary works.",
        'A little more about your tax status.',
        'Great, thanks. One more about your filing history.',
        "Let's start with how your salary works.",
        "Let's start with how your salary works.",
    ][questionIndex];

    return (
        <div className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-[420px] rounded-[18px] bg-[#f8fafc] px-4 pb-24 pt-2 text-[#111827] sm:px-5">
            <header className="mb-4 flex items-center gap-1.5 text-[#0c6664]">
                <h1 className="text-[15px] font-extrabold">Tax Planner</h1>
                <Calculator size={13} strokeWidth={2.5} />
            </header>

            {journeyStep === 'persona' && (
                <section>
                    <p className="text-xs text-slate-500">Let&apos;s set up your financial profile to understand your current state.</p>
                    <h2 className="mt-2 text-[28px] font-extrabold leading-tight text-[#111827]">Understand Your Taxes</h2>
                    <p className="mt-5 text-sm text-slate-600">What best describes you?</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {personaOptions.map(({ id, label, icon: Icon }) => {
                            const selected = persona === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => selectPersona(id)}
                                    className={`flex min-h-[128px] flex-col items-center justify-center gap-3 rounded-[14px] border p-4 transition-colors ${selected ? 'border-[#eabb3a] bg-[#fffaf0] text-[#0c6060]' : 'border-[#e7e9e4] bg-white text-slate-600 hover:border-[#b9cec5]'}`}
                                >
                                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${selected ? 'bg-[#fff0bd]' : 'bg-slate-100'}`}><Icon size={22} /></span>
                                    <span className="text-xs font-medium">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <JourneyPrimaryButton disabled={!persona} onClick={onContinue}>Continue</JourneyPrimaryButton>
                </section>
            )}

            {journeyStep === 'welcome' && (
                <section className="text-center">
                    <div className="mx-auto mt-5 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#f0faf7] text-[#0c6060]">
                        <Calculator size={42} />
                    </div>
                    <h2 className="mt-5 text-xl font-extrabold">Welcome {displayName},</h2>
                    <p className="mt-2 text-sm text-slate-500">Let&apos;s set up your Tax Planner so you are ready for the next steps in understanding your taxes.</p>
                    <div className="mt-6 space-y-2 rounded-[14px] bg-white p-4 text-left shadow-[0_0_1px_rgba(0,0,0,0.08)]">
                        {[
                            ['Confirm your profile', 'We will quickly confirm what we already know about you.'],
                            ['Answer 5 quick questions', 'Only tax-specific details—nothing you have already told us.'],
                            ['Get your Tax Snapshot', 'See your estimated PAYE and take-home pay instantly.'],
                        ].map(([title, body]) => (
                            <div key={title} className="flex gap-3 rounded-xl px-2 py-3">
                                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                                <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-slate-500">{body}</p></div>
                            </div>
                        ))}
                    </div>
                    <JourneyPrimaryButton onClick={onContinue}>Get Started</JourneyPrimaryButton>
                    <JourneyBackButton onClick={onBack} />
                </section>
            )}

            {journeyStep === 'known' && (
                <section>
                    <div className="text-center">
                        <div className="mx-auto mt-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#f0faf7] text-[#0c6060]"><UserCheck size={42} /></div>
                        <h2 className="mt-5 text-xl font-extrabold">We already know:</h2>
                        <p className="mt-1 text-xs text-slate-400">From your Shilingi Moves profile and Budget Planner</p>
                    </div>
                    <div className="mt-5 space-y-3 rounded-[14px] bg-white p-4 shadow-[0_0_1px_rgba(0,0,0,0.08)]">
                        <KnownRow icon={Briefcase} label="Profile type" value={selectedPersona?.label || 'To be confirmed'} />
                        <KnownRow icon={WalletCards} label="Monthly income" value={incomeLabel} />
                        <KnownRow icon={Receipt} label="Main income source" value={user?.occupation || user?.employment_status || 'To be confirmed'} />
                        <KnownRow icon={Users} label="Household profile" value={user?.marital_status || 'From your profile'} />
                        <p className="rounded-full bg-[#fff6d9] px-4 py-2 text-center text-xs text-[#6e5a1a]">Is this information still correct?</p>
                    </div>
                    <JourneyPrimaryButton onClick={onContinue}><Check size={16} /> Yes, Continue</JourneyPrimaryButton>
                    <JourneyBackButton onClick={onBack} />
                </section>
            )}

            {journeyStep === 'questions' && (
                <section>
                    <h2 className="max-w-[320px] text-[17px] font-extrabold leading-[1.25]">{questionIntro}</h2>
                    <div className="mt-4 flex items-center justify-between text-xs font-bold">
                        <span className="inline-flex items-center gap-2"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={14} /></span> Question {questionIndex + 1} of {taxQuestions.length}</span>
                        <span className="text-[10px] text-slate-400">{questionIndex + 1} / {taxQuestions.length}</span>
                    </div>
                    <QuestionProgress currentIndex={questionIndex} />
                    <TaxGuideIllustration />
                    <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <h3 className="text-sm font-extrabold">{currentQuestion.title}</h3>
                        {currentQuestion.help && <p className="mt-2 text-[10px] leading-5 text-slate-400">{currentQuestion.help}</p>}
                        <div className="mt-3 space-y-1.5">
                            {currentQuestion.options.map(([value, label, Icon]) => {
                                const selected = currentQuestion.multiple
                                    ? Array.isArray(currentAnswer) && currentAnswer.includes(value)
                                    : currentAnswer === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => onAnswer(currentQuestion.id, value)}
                                        aria-pressed={selected}
                                        className={`flex min-h-10 w-full items-center justify-between rounded-[10px] border px-3 py-2 text-left text-[11px] font-medium transition-colors ${selected ? 'border-[#eabb3a] bg-[#fffdf5]' : 'border-slate-200 bg-white hover:border-[#b9cec5]'}`}
                                    >
                                        <span className="inline-flex items-center gap-2.5">
                                            {Icon && <Icon size={14} className={selected ? 'text-[#0c6664]' : 'text-[#b68a12]'} />}
                                            {label}
                                        </span>
                                        <span className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border ${currentQuestion.multiple ? 'rounded-[3px]' : 'rounded-full'} ${selected ? 'border-[#0c6664] bg-[#0c6664] text-white' : 'border-slate-300 bg-white'}`}>
                                            {selected && currentQuestion.multiple && <Check size={10} strokeWidth={3} />}
                                            {selected && !currentQuestion.multiple && <span className="h-2 w-2 rounded-full bg-[#eabb3a]" />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
                        <button type="button" onClick={onBack} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0c6664] px-5 text-xs font-semibold text-[#0c6664]"><ArrowLeft size={15} /> Back</button>
                        <button type="button" disabled={!hasCurrentAnswer} onClick={onContinue} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0c6664] px-5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{questionIndex === taxQuestions.length - 1 ? 'Prepare my snapshot' : 'Continue'} <ArrowRight size={15} /></button>
                    </div>
                </section>
            )}

            {journeyStep === 'preparing' && (
                <section>
                    <div className="pt-5 text-center">
                        <TaxGuideIllustration compact />
                        <h2 className="mt-1 text-[20px] font-extrabold text-[#0c6664]">Preparing your Tax Planner...</h2>
                    </div>
                    <div className="mt-6 space-y-4 rounded-[14px] bg-[#eaf1f4] px-5 py-5">
                        {[
                            'Reviewing your profile',
                            'Estimating your salary deductions',
                            'Personalizing your learning journey',
                            'Preparing your Tax Snapshot',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-[11px] font-semibold text-slate-700">
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={12} strokeWidth={3} /></span>
                                {item}
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 rounded-[12px] border-l-[3px] border-[#eabb3a] bg-[#fffaf0] px-4 py-3 text-[10px] leading-5 text-[#887126]">
                        <span className="font-extrabold">Next up (not in this pass):</span> the Tax Snapshot dashboard reveal — Tax Snapshot card, Tax Health, Today&apos;s Tip, recommended learning and the Tax Calculator.
                    </div>
                    <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
                        <button type="button" onClick={onBack} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0c6664] px-5 text-xs font-semibold text-[#0c6664]"><ArrowLeft size={15} /> Back</button>
                        <button type="button" onClick={onContinue} className="inline-flex h-12 items-center justify-center rounded-full bg-[#0c6664] px-5 text-xs font-semibold text-white">Prepare my snapshot</button>
                    </div>
                </section>
            )}
        </div>
    );
};

const QuestionProgress = ({ currentIndex }) => (
    <div className="mt-3 flex items-center" aria-label={`Question ${currentIndex + 1} of ${taxQuestions.length}`}>
        {taxQuestions.map((question, index) => (
            <React.Fragment key={question.id}>
                <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${index <= currentIndex ? 'bg-[#eabb3a] text-white' : 'border border-slate-200 bg-white text-slate-400'}`}>
                    {index + 1}
                </span>
                {index < taxQuestions.length - 1 && <span className={`h-px flex-1 ${index < currentIndex ? 'bg-[#eabb3a]' : 'bg-slate-200'}`} />}
            </React.Fragment>
        ))}
    </div>
);

const TaxGuideIllustration = ({ compact = false }) => (
    <div className={`mx-auto flex items-center justify-center rounded-full bg-[#f0faf7] ${compact ? 'my-2 h-28 w-28' : 'my-5 h-28 w-28'}`} aria-hidden="true">
        <div className="relative inline-flex h-12 w-14 items-center justify-center rounded-[12px] bg-[#047b77] text-white shadow-sm">
            <span className="absolute -left-4 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-100 bg-white text-emerald-500"><Check size={15} strokeWidth={3} /></span>
            <span className="absolute -right-3 -top-3 h-3 w-3 rounded-full bg-[#eabb3a]" />
            <Calculator size={24} strokeWidth={2.4} />
        </div>
    </div>
);

const JourneyPrimaryButton = ({ children, disabled = false, onClick }) => (
    <button type="button" disabled={disabled} onClick={onClick} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0c6060] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
        {children}
    </button>
);

const JourneyBackButton = ({ onClick }) => (
    <button type="button" onClick={onClick} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#0c6060]"><ArrowLeft size={14} /> Back</button>
);

const KnownRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 rounded-[10px] border border-slate-200 px-4 py-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef8f4] text-[#0c6060]"><Icon size={17} /></span>
        <div className="min-w-0"><p className="text-xs font-bold">{label}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{value}</p></div>
    </div>
);
