import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeDollarSign,
    BookOpen,
    Briefcase,
    CalendarDays,
    Calculator,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    FileText,
    GraduationCap,
    Landmark,
    Lightbulb,
    LockKeyhole,
    PiggyBank,
    Play,
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
    calculateSalary,
} from '../../../services/plannerApi';
import PlannerSyncStatus from '../common/PlannerSyncStatus';

const currentYear = new Date().getFullYear();
export const TAX_ONBOARDING_STORAGE_PREFIX = 'shilingi_tax_planner_onboarding_v1';

const personaOptions = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'first-job', label: 'First job', icon: Sparkles },
    { id: 'professional', label: 'Young professional', icon: Briefcase },
    { id: 'freelancer', label: 'Freelancer or consultant', icon: Users },
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

const salariedExperience = {
    statusRows: [
        ['PAYE Status', 'Deducted monthly'],
        ['Annual Return Status', 'Not yet filed'],
        ['Estimated Take-Home Pay', null],
    ],
    learning: ['Understanding PAYE', 'Reading Your Payslip', 'Filing Your Annual Return'],
    resources: ['Tax Calculator', 'Payslip Explainer', 'Tax Calendar'],
    panels: {
        status: ['Created Tax Profile', 'How PAYE Works', 'Example Payslip', 'How Taxes Support Public Services'],
        learning: ['Understanding Taxes', 'Getting Your KRA PIN', 'Understanding PAYE'],
        solutions: ['KRA Registration', 'Understanding Employment Taxes'],
        tools: ['Beginner Tax Calculator', 'KRA Guide'],
    },
    nextLearning: 'Filing Your Annual Return',
};

const freelancerExperience = {
    statusRows: [
        ['KRA Registration', 'Registered'],
        ['Income Records', 'In progress'],
        ['Annual Return Status', 'Not yet filed'],
    ],
    learning: ['Taxes for Consultants', 'Keeping Income Records', 'Filing Your First Tax Return'],
    resources: ['Tax Calculator', 'Income Tracker', 'Tax Calendar'],
    panels: {
        status: ['Income Overview', 'Estimated Tax Position', 'Income Record Status', 'Tax Filing Readiness', 'Simple Record-Keeping Tips'],
        learning: ['Tax Basics for Freelancers', 'Managing Variable Income', 'Income Record Keeping'],
        solutions: ['Income Tracking', 'Tax Calendar', 'Record-Keeping Templates'],
        tools: ['Tax Calculator', 'Income Tracker', 'Tax Calendar'],
    },
    nextLearning: 'Keeping Income Records',
};

const TaxPlanner = ({ onUpgrade = () => {}, user = {} }) => {
    const [form, setForm] = useState(defaultForm);
    const [savedPlan, setSavedPlan] = useState(null);
    const [preview, setPreview] = useState(null);
    const [payrollResult, setPayrollResult] = useState(null);
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
    const [activeSnapshotTab, setActiveSnapshotTab] = useState('status');
    const [incomeEstimate, setIncomeEstimate] = useState('');
    const [salaryBasis, setSalaryBasis] = useState('GROSS');
    const [nssfRate, setNssfRate] = useState('TIER_1_2');
    const [incomeDeductions, setIncomeDeductions] = useState({ shif: true, housing: true });
    const onboardingStorageKey = useMemo(() => {
        const identifier = user?.uuid || user?.id || user?.email || 'guest';
        return `${TAX_ONBOARDING_STORAGE_PREFIX}_${identifier}`;
    }, [user?.email, user?.id, user?.uuid]);
    const profileStorageKey = `${onboardingStorageKey}_profile`;

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
                if (completedOnboarding) {
                    try {
                        const storedProfile = JSON.parse(window.localStorage.getItem(profileStorageKey) || '{}');
                        if (storedProfile.persona) setPersona(storedProfile.persona);
                        if (storedProfile.answers) setAnswers(storedProfile.answers);
                    } catch {
                        // A damaged local preference should never block the live planner.
                    }
                }
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
    }, [onboardingStorageKey, profileStorageKey]);

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

    const handleRestartJourney = async () => {
        const confirmed = window.confirm(
            'Restart your Tax Planner journey? This will delete your saved tax estimate and setup answers. Your account and other planners will not be changed.',
        );
        if (!confirmed) return;

        setWorking(true);
        setError('');
        setSuccess('');
        try {
            if (savedPlan?.uuid) {
                await deletePlan('tax', savedPlan.uuid);
            }
            window.localStorage.removeItem(onboardingStorageKey);
            window.localStorage.removeItem(profileStorageKey);
            setSavedPlan(null);
            setPreview(null);
            setPayrollResult(null);
            setPersona('');
            setAnswers({});
            setQuestionIndex(0);
            setForm({ ...defaultForm });
            setIncomeEstimate('');
            setSalaryBasis('GROSS');
            setNssfRate('TIER_1_2');
            setIncomeDeductions({ shif: true, housing: true });
            setCalculatorOpen(false);
            setJourneyStep('persona');
        } catch (err) {
            setError(err.message || 'The Tax Planner journey could not be restarted.');
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
            window.localStorage.setItem(profileStorageKey, JSON.stringify({ persona, answers }));
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

    const applyIncomeCalculator = async () => {
        const estimate = Number(incomeEstimate || 0);
        if (estimate <= 0) {
            setError('Enter an estimated monthly income greater than zero.');
            return;
        }

        setWorking(true);
        setError('');
        setSuccess('');
        try {
            if (persona === 'freelancer') {
                const taxEstimate = await calculatePlan('tax', buildPayload({
                    ...form,
                    gross_income: String(estimate),
                    nssf_contribution: '0',
                    affordable_housing_levy: '0',
                    shif_contribution: '0',
                }));
                setForm((current) => ({
                    ...current,
                    gross_income: String(estimate),
                    nssf_contribution: '0',
                    affordable_housing_levy: '0',
                    shif_contribution: '0',
                }));
                setPayrollResult(null);
                setPreview(taxEstimate);
                setActiveSnapshotTab('status');
                setCalculatorOpen(false);
                setSuccess('Your estimated tax position is ready using the live Shilingi tax rules.');
                return;
            }

            const today = new Date();
            const payPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
            const salary = await calculateSalary({
                pay_period: payPeriod,
                gross_income: String(estimate),
                is_resident: form.is_resident,
                apply_nssf: nssfRate !== 'NONE',
                apply_shif: incomeDeductions.shif,
                apply_affordable_housing_levy: incomeDeductions.housing,
            });
            const statutory = salary?.statutory_deductions || {};
            setForm((current) => ({
                ...current,
                gross_income: String(estimate),
                nssf_contribution: String(statutory.nssf_employee || 0),
                shif_contribution: String(statutory.shif || 0),
                affordable_housing_levy: String(statutory.affordable_housing_levy || 0),
            }));
            setPayrollResult(salary);
            setPreview(salary?.paye_breakdown || null);
            setActiveSnapshotTab('status');
            setCalculatorOpen(false);
            setSuccess('Your salary breakdown is ready using the live Shilingi tax rules.');
        } catch (err) {
            setError(err.message || 'The salary breakdown could not be calculated.');
        } finally {
            setWorking(false);
        }
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

    const isFreelancer = persona === 'freelancer';
    const experience = isFreelancer ? freelancerExperience : salariedExperience;
    const grossIncome = payrollResult?.gross_income || result?.gross_income || form.gross_income;
    const estimatedPaye = payrollResult?.estimated_paye || result?.estimated_paye;
    const takeHomePay = payrollResult?.estimated_take_home_pay || result?.income_after_paye;
    const hasCalculation = Boolean(payrollResult || result);
    const hasKraPin = Boolean(answers?.accounts?.includes?.('kra'));
    const snapshotStatusRows = experience.statusRows.map(([label, value]) => {
        if (label === 'PAYE Status' && !hasCalculation) return [label, 'Not calculated'];
        if (label === 'KRA Registration') return [label, hasKraPin ? 'Registered' : 'Not confirmed'];
        if (label === 'Income Records') return [label, hasCalculation ? 'In progress' : 'Not started'];
        return [label, value === null ? (takeHomePay ? formatKES(takeHomePay) : 'Not calculated') : value];
    });
    const milestones = [
        ['Created Tax Profile', true],
        ['Obtained KRA PIN', hasKraPin],
        ['Understand PAYE', hasCalculation],
        ['Complete Tax Basics', false],
        ['File First Tax Return', false],
    ];
    const openSnapshotTab = (tab) => {
        setActiveSnapshotTab(tab);
        window.requestAnimationFrame(() => document.getElementById('tax-snapshot-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };

    return (
        <div className="mx-auto max-w-[1180px] space-y-3 pb-24 text-[#182727] sm:space-y-4">
            <header className="pt-1 sm:pt-2">
                <h2 className="text-lg font-extrabold tracking-tight text-[#086b67] sm:text-2xl">Tax Planner</h2>
                <p className="mt-1 max-w-xl text-xs leading-4 text-slate-600 sm:text-sm sm:leading-5">Understand your taxes, estimate your deductions, and build healthy financial habits.</p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-md sm:gap-3">
                    <button type="button" onClick={() => { setIncomeEstimate(form.gross_income || ''); setCalculatorOpen(true); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:border-[#0c6664]/40 hover:bg-[#f7fbf9]">
                        <Calculator size={18} className="text-[#9f2f25]" /> Tax Calculator
                    </button>
                    <button type="button" onClick={() => openSnapshotTab('tools')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#ead7a0] bg-[#fffaf0] px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-[#fff6df]">
                        <CalendarDays size={18} className="text-[#b27d00]" /> Tax Calendar
                    </button>
                </div>
            </header>

            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}
            <TaxConfidenceCard
                grossIncome={grossIncome}
                hasCalculation={hasCalculation}
                isFreelancer={isFreelancer}
                onNext={() => { setIncomeEstimate(form.gross_income || ''); setCalculatorOpen(true); }}
                paye={estimatedPaye}
                takeHome={takeHomePay}
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <TaxInfoCard icon={Briefcase} title="My Tax Status">
                    <div className="space-y-2.5">
                        {snapshotStatusRows.map(([label, value]) => <TaxStatusRow key={label} label={label} value={value} />)}
                    </div>
                </TaxInfoCard>
                <TaxInfoCard icon={Landmark} title="My Tax Milestones">
                    <div className="space-y-2.5">
                        {milestones.map(([label, complete]) => (
                            <div key={label} className="flex items-center gap-3 text-xs text-slate-700">
                                {complete ? <CheckCircle2 size={17} className="shrink-0 text-emerald-500" fill="currentColor" stroke="white" /> : <Circle size={16} className="shrink-0 text-slate-300" />}
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </TaxInfoCard>
                <TaxInfoCard icon={GraduationCap} title="My Learning Hub">
                    <TaxBulletList items={experience.learning} />
                </TaxInfoCard>
                <TaxInfoCard icon={Briefcase} title="My Tax Resources" className="md:col-span-2 xl:col-span-3">
                    <TaxBulletList items={experience.resources} columns />
                </TaxInfoCard>
            </div>

            <TaxSnapshotWorkspace
                activeTab={activeSnapshotTab}
                experience={experience}
                isFreelancer={isFreelancer}
                onTabChange={setActiveSnapshotTab}
                payrollResult={payrollResult}
                result={result}
            />

            <div className="space-y-3 lg:grid lg:grid-cols-[1fr_1fr_1.15fr] lg:gap-3 lg:space-y-0">
                <section>
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#0b6a66]">Today&apos;s tax tip</p>
                    <button type="button" onClick={() => openSnapshotTab('learning')} className="flex min-h-[78px] w-full items-center gap-3 rounded-xl border border-[#edc768] bg-[#fff9eb] px-4 py-3 text-left shadow-sm">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#d4a321]"><Lightbulb size={16} /></span>
                        <span className="flex-1 text-xs leading-5 text-[#8c6715]">A KRA PIN is required for many employment and financial transactions in Kenya.</span>
                        <ChevronRight size={16} className="text-[#d4a321]" />
                    </button>
                </section>
                <section>
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#0b6a66]">Continue learning</p>
                    <button type="button" onClick={() => openSnapshotTab('learning')} className="flex min-h-[78px] w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef8f4] text-[#0c6664]"><Play size={14} fill="currentColor" /></span>
                        <span className="flex-1"><span className="block text-[10px] font-semibold uppercase text-slate-500">Next recommended</span><span className="mt-0.5 block text-xs font-bold text-slate-900">{experience.nextLearning}</span></span>
                        <ChevronRight size={16} className="text-[#d4a321]" />
                    </button>
                </section>
                <TaxUpgradeCard onUpgrade={onUpgrade} />
            </div>

            <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-bold text-[#0c6664]">
                    <span className="inline-flex items-center gap-2"><Calculator size={17} /> Advanced tax details and saved estimate</span>
                    <ChevronDown size={17} className="transition group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 p-4 sm:p-5">
                    <PlannerSyncStatus plan={savedPlan} />
                    <AdvancedTaxDetails
                        form={form}
                        handleDelete={handleDelete}
                        handlePreview={handlePreview}
                        handleRestartJourney={handleRestartJourney}
                        handleSave={handleSave}
                        result={result}
                        rules={rules}
                        savedPlan={savedPlan}
                        updateField={updateField}
                        warnings={warnings}
                        working={working}
                    />
                </div>
            </details>

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

const TaxConfidenceCard = ({ grossIncome, hasCalculation, isFreelancer, onNext, paye, takeHome }) => {
    const dateLabel = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'long', weekday: 'long', year: 'numeric',
    }).format(new Date()).toUpperCase();
    const summaryRows = hasCalculation
        ? isFreelancer
            ? [['Estimated Monthly Income', formatKES(grossIncome)], ['Estimated Tax Position', formatKES(paye)]]
            : [['Monthly Salary', formatKES(grossIncome)], ['Estimated PAYE', formatKES(paye)], ['Estimated Take-Home Pay', formatKES(takeHome)]]
        : [['KRA PIN', 'Available'], ['Tax Readiness', 'Learning']];

    return (
        <section className="relative overflow-hidden rounded-[18px] bg-[#14594b] px-5 pb-5 pt-4 text-white shadow-[0_12px_28px_rgba(15,77,65,0.18)] sm:px-6 sm:py-6">
            <span className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/[0.07]" aria-hidden="true" />
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[9px] font-semibold tracking-[0.18em] text-white/75">{dateLabel}</span>
            <div className="relative mt-3 flex items-center gap-3">
                <span className="relative inline-flex h-12 w-12 shrink-0 rounded-full bg-[conic-gradient(#e9b938_0_28%,#0a6b5b_28%_100%)]">
                    <span className="absolute inset-[7px] rounded-full bg-[#14594b]" />
                </span>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/65">Tax Confidence™</p>
                    <p className="mt-0.5 text-xl font-extrabold leading-none">{hasCalculation ? 'Learning' : 'Getting Started'}</p>
                </div>
            </div>
            <div className="relative mt-4 rounded-lg bg-black/10 px-3 py-2.5">
                {summaryRows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 py-1.5 last:border-0">
                        <span className="text-[10px] text-white/80">{label}</span>
                        <span className="text-[10px] font-bold text-white">{value}</span>
                    </div>
                ))}
                <button type="button" onClick={onNext} className="mt-2 flex min-h-10 w-full items-center justify-between rounded-md bg-white/10 px-3 text-left transition hover:bg-white/15">
                    <span><span className="block text-[8px] font-semibold uppercase text-white/55">Next step</span><span className="block text-[10px] font-bold">{hasCalculation ? 'Review or update your estimate' : 'Learn About PAYE'}</span></span>
                    <ChevronRight size={16} />
                </button>
            </div>
        </section>
    );
};

const TaxInfoCard = ({ children, className = '', icon: Icon, title }) => (
    <section className={`rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(23,43,31,0.04)] ${className}`}>
        <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f2] text-[#14594b]"><Icon size={16} /></span>
            <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
        </div>
        {children}
    </section>
);

const TaxStatusRow = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="rounded-full bg-[#edf8f5] px-2 py-0.5 text-right font-bold text-[#0b6a66]">{value}</span>
    </div>
);

const TaxBulletList = ({ columns = false, items }) => (
    <ul className={columns ? 'grid gap-2 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-2'}>
        {items.map((item) => <li key={item} className="flex items-start gap-2 text-xs leading-5 text-slate-700"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0b7b72]" />{item}</li>)}
    </ul>
);

const snapshotTabs = [
    ['status', 'My Tax Status'],
    ['learning', 'My Learning'],
    ['solutions', 'Explore Tax Solutions'],
    ['tools', 'Tax Tools'],
];

const TaxSnapshotWorkspace = ({ activeTab, experience, isFreelancer, onTabChange, payrollResult, result }) => (
    <section id="tax-snapshot-tabs" className="scroll-mt-24 space-y-3">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm lg:hidden">
            {snapshotTabs.map(([id, label]) => (
                <button key={id} type="button" onClick={() => onTabChange(id)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-semibold transition ${activeTab === id ? 'bg-[#0c5e53] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>
            ))}
        </div>

        <div className="lg:hidden">
            <TaxSnapshotPanel
                id={activeTab}
                isFreelancer={isFreelancer}
                items={experience.panels[activeTab]}
                payrollResult={payrollResult}
                result={result}
            />
        </div>

        <div className="hidden gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-4">
            {snapshotTabs.map(([id]) => (
                <TaxSnapshotPanel key={id} id={id} isFreelancer={isFreelancer} items={experience.panels[id]} payrollResult={payrollResult} result={result} />
            ))}
        </div>
    </section>
);

const TaxSnapshotPanel = ({ id, isFreelancer, items, payrollResult, result }) => {
    const tab = snapshotTabs.find(([tabId]) => tabId === id);
    const showBreakdown = id === 'status' && Boolean(payrollResult || result);
    const statutory = payrollResult?.statutory_deductions || {};
    const breakdown = payrollResult
        ? [
            ['PAYE', payrollResult.estimated_paye],
            ['Housing Levy', statutory.affordable_housing_levy],
            ['NSSF', statutory.nssf_employee],
            ['SHA', statutory.shif],
            ['Estimated Take-Home Pay', payrollResult.estimated_take_home_pay],
        ]
        : isFreelancer
            ? [['Gross Income', result?.gross_income], ['Estimated Tax Position', result?.estimated_paye], ['Income After Tax', result?.income_after_paye]]
            : [['PAYE', result?.estimated_paye], ['Income After PAYE', result?.income_after_paye]];

    return (
        <TaxInfoCard icon={id === 'status' ? LockKeyhole : id === 'learning' ? GraduationCap : id === 'solutions' ? ShieldCheck : Briefcase} title={showBreakdown ? 'Salary Breakdown' : tab?.[1] || 'Tax information'}>
            {showBreakdown ? (
                <div className="space-y-1">
                    {breakdown.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-[11px] last:border-0">
                            <span className="font-semibold text-[#0b6a66]">{label}</span>
                            <span className="inline-flex items-center gap-2 font-extrabold text-[#0b6a66]">{formatKES(value)} <ChevronDown size={12} /></span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <div key={item} className="flex min-h-10 items-center gap-2 py-2 text-xs text-slate-700">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#edf7f2] text-[#0b6a66]"><FileText size={12} /></span>
                            <span className="flex-1 font-semibold">{item}</span>
                            {id !== 'status' && <ChevronRight size={14} className="text-slate-500" />}
                        </div>
                    ))}
                </div>
            )}
        </TaxInfoCard>
    );
};

const TaxUpgradeCard = ({ onUpgrade }) => (
    <section>
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#0b6a66]">Upgrade</p>
        <div className="rounded-[16px] bg-[#5a3d0a] p-4 text-white shadow-sm">
            <h3 className="text-base font-extrabold text-[#f3c84b]">Unlock More with Shilingi Plus</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-white/90">
                {['Tax Health Score', 'Tax Relief Tracker', 'Tax Optimizer', 'Monthly Tax Reports'].map((item) => <li key={item} className="flex items-center gap-2"><Check size={14} className="text-[#f3c84b]" />{item}</li>)}
            </ul>
            <button type="button" onClick={onUpgrade} className="mt-4 min-h-11 w-full rounded-lg bg-[#f1c443] px-4 text-sm font-extrabold text-[#4b350d] transition hover:bg-[#f7d267]">Upgrade</button>
        </div>
    </section>
);

const AdvancedTaxDetails = ({ form, handleDelete, handlePreview, handleRestartJourney, handleSave, result, rules, savedPlan, updateField, warnings, working }) => (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Estimate name
                    <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Tax year
                    <select value={form.tax_year} onChange={(event) => updateField('tax_year', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500">
                        {Array.from({ length: Math.max(currentYear - 2023, 1) }, (_, index) => currentYear - index).map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">Period
                    <select value={form.period} onChange={(event) => updateField('period', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500"><option value="MONTHLY">Monthly</option><option value="ANNUAL">Annual</option></select>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 sm:self-end">
                    <input type="checkbox" checked={form.is_resident} onChange={(event) => updateField('is_resident', event.target.checked)} className="h-4 w-4 accent-primary-600" /> Kenyan resident
                </label>
                {moneyFields.map(([field, label]) => (
                    <label key={field} className="text-sm font-semibold text-slate-700">{label} (KES)
                        <input aria-label={`${label} (KES)`} type="number" min="0" step="0.01" value={form[field]} onChange={(event) => updateField(field, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary-500" />
                    </label>
                ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" disabled={working} onClick={handlePreview} className="inline-flex items-center gap-2 rounded-xl border border-primary-600 px-4 py-2.5 text-sm font-semibold text-primary-700 disabled:opacity-50"><RefreshCw size={15} /> Calculate estimate</button>
                <button type="button" disabled={working} onClick={handleSave} className="rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save estimate</button>
                {savedPlan?.uuid && <button type="button" disabled={working} onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 disabled:opacity-50"><Trash2 size={15} /> Delete</button>}
                <button type="button" disabled={working} onClick={handleRestartJourney} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 disabled:opacity-50"><RefreshCw size={15} /> Restart Tax Planner</button>
            </div>
        </section>
        <div className="space-y-4">
            <section className="rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-950">Your estimate</h3>
                {result ? <div className="mt-3 space-y-2"><Metric label="Gross income" value={formatKES(result.gross_income)} /><Metric label="Estimated PAYE" value={formatKES(result.estimated_paye)} emphasis /><Metric label="Income after PAYE" value={formatKES(result.income_after_paye)} /></div> : <p className="mt-3 text-xs leading-5 text-slate-500">Enter your income and calculate an estimate. Nothing is saved until you choose Save estimate.</p>}
            </section>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold"><ShieldCheck size={16} /> Important tax note</div>
                <p className="mt-2 leading-5">{result?.disclaimer || rules?.disclaimer || 'This is an educational estimate and not a KRA filing or professional tax advice.'}</p>
                {warnings.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
            </section>
        </div>
    </div>
);

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
