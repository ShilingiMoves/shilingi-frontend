import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    ChevronDown,
    PartyPopper,
    Plus,
    Target,
    Users,
    X,
} from 'lucide-react';
import onboardingLogo from '../assets/shilingi-logo-animated.gif';
import incomeService from '../services/incomeService';
import { updateUserPreferences } from '../services/userApi';
import { markDashboardDataExists, persistDashboardSection } from '../utils/dashboardDataState';
import { USER_PROFILE_WORKSPACE_KEY } from '../components/dashboard/user/UserGoalsFamilyForm';
import { completeProfileSetup } from '../utils/profileSetupState';

const setupSteps = ['income', 'goals', 'dependents'];
const defaultIncomeForm = {
    source: 'Salary',
    amount: '',
    period: 'MONTHLY',
    income_date: new Date().toISOString().split('T')[0],
    status: 'RECEIVED',
    description: '',
    is_recurring: true,
};
const defaultGoalForm = {
    type: 'Short Term Goal',
    name: 'Emergency Fund',
    targetAmount: '',
    currentSavings: '',
    monthlyContribution: '',
    targetDate: '',
    linkedProduct: 'Money Market Fund',
};
const defaultDependentForm = {
    relationship: 'Father',
    count: '1',
    beneficiaryType: 'Direct Beneficiary',
    supportAmount: '',
    frequency: 'MONTHLY',
};

const ProfileSetupPage = () => {
    const navigate = useNavigate();
    const [stepIndex, setStepIndex] = useState(-1);
    const [incomeItems, setIncomeItems] = useState([]);
    const [goalItems, setGoalItems] = useState([]);
    const [dependentItems, setDependentItems] = useState([]);
    const [sheet, setSheet] = useState(null);
    const [incomeForm, setIncomeForm] = useState(defaultIncomeForm);
    const [goalForm, setGoalForm] = useState(defaultGoalForm);
    const [dependentForm, setDependentForm] = useState(defaultDependentForm);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState('');

    const currentStep = setupSteps[stepIndex] || 'welcome';
    const progressIndex = Math.max(stepIndex, 0);
    const totalIncome = useMemo(
        () => incomeItems.reduce((sum, item) => sum + parseMoney(item.amount), 0),
        [incomeItems]
    );

    const finishSetup = async (section = 'overview') => {
        setIsSaving(true);
        setNotice('');

        try {
            await persistLocalSetup({ incomeItems, goalItems, dependentItems });
            if (totalIncome > 0) {
                await updateUserPreferences({
                    monthly_income: String(totalIncome),
                    primary_financial_goal: goalItems[0]?.name || '',
                    receive_notifications: true,
                    receive_weekly_summary: true,
                }).catch(() => null);
            }
            await syncIncomeToApi(incomeItems).catch(() => null);
            markDashboardDataExists();
            completeProfileSetup();
            persistDashboardSection(section);
            navigate('/dashboard/app', { replace: true, state: { section } });
        } finally {
            setIsSaving(false);
        }
    };

    const addIncome = () => {
        if (!incomeForm.amount) {
            setNotice('Add an income amount before saving.');
            return;
        }
        setIncomeItems((current) => [...current, { ...incomeForm, id: crypto.randomUUID?.() || String(Date.now()) }]);
        setIncomeForm(defaultIncomeForm);
        setNotice('Great! Your income is set up. You can add another or continue.');
        setSheet(null);
    };

    const addGoal = () => {
        if (!goalForm.name || !goalForm.targetAmount) {
            setNotice('Add a goal name and target amount before saving.');
            return;
        }
        setGoalItems((current) => [...current, { ...goalForm, id: crypto.randomUUID?.() || String(Date.now()) }]);
        setGoalForm(defaultGoalForm);
        setNotice('Your goal has been added.');
        setSheet(null);
    };

    const addDependent = () => {
        if (!dependentForm.relationship || !dependentForm.supportAmount) {
            setNotice('Add the relationship and support amount before saving.');
            return;
        }
        setDependentItems((current) => [...current, { ...dependentForm, id: crypto.randomUUID?.() || String(Date.now()) }]);
        setDependentForm(defaultDependentForm);
        setNotice('Your dependant has been added.');
        setSheet(null);
    };

    return (
        <div className="min-h-screen bg-[#111111] font-sans text-[#10231c] sm:flex sm:items-center sm:justify-center sm:px-6 sm:py-8">
            <section className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#f8f8f8] sm:min-h-[812px] sm:rounded-[40px]">
                <header className="flex justify-center px-5 pt-10">
                    <img src={onboardingLogo} alt="Shilingi Moves" className="h-auto w-[92px]" decoding="async" />
                </header>

                {currentStep === 'welcome' ? (
                    <WelcomeSetupScreen onSkip={() => finishSetup()} onStart={() => setStepIndex(0)} />
                ) : (
                    <main className="flex flex-1 flex-col px-4 pb-6 pt-5">
                        <SetupIntro currentStep={progressIndex} />
                        <StepProgress currentStep={progressIndex} />

                        {notice && (
                            <div className="mt-3 rounded-2xl bg-[#fff7df] px-4 py-3 text-xs font-bold text-[#9b7416]">
                                {notice}
                            </div>
                        )}

                        {currentStep === 'income' && (
                            <IncomeStep
                                incomeItems={incomeItems}
                                onAdd={() => setSheet('income')}
                                totalIncome={totalIncome}
                            />
                        )}

                        {currentStep === 'goals' && (
                            <GoalsStep
                                goalItems={goalItems}
                                onAdd={() => setSheet('goal')}
                                onDelete={(id) => setGoalItems((current) => current.filter((item) => item.id !== id))}
                            />
                        )}

                        {currentStep === 'dependents' && (
                            <DependentsStep
                                dependentItems={dependentItems}
                                onAdd={() => setSheet('dependent')}
                            />
                        )}

                        <div className="mt-auto space-y-3 pt-5">
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => {
                                    if (stepIndex >= setupSteps.length - 1) {
                                        finishSetup('overview');
                                        return;
                                    }
                                    setNotice('');
                                    setStepIndex((current) => current + 1);
                                }}
                                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white disabled:bg-[#a8c3bd]"
                            >
                                {isSaving ? 'Saving...' : 'Continue'}
                            </button>
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => finishSetup('overview')}
                                className="inline-flex min-h-[38px] w-full items-center justify-center text-sm font-bold text-[#0c6060] underline underline-offset-2"
                            >
                                Skip for now
                            </button>
                        </div>
                    </main>
                )}

                {sheet === 'income' && (
                    <SetupSheet title="Add Income" onClose={() => setSheet(null)}>
                        <SheetSelect label="Source of income" value={incomeForm.source} onChange={(value) => setIncomeForm((current) => ({ ...current, source: value }))} options={['Salary', 'Business', 'Consultancy', 'Freelance', 'Investment Income']} />
                        <SheetInput label="Amount" value={incomeForm.amount} onChange={(value) => setIncomeForm((current) => ({ ...current, amount: value }))} placeholder="Eg. KES 30,000" />
                        <div className="grid grid-cols-2 gap-3">
                            <SheetSelect label="Period" value={incomeForm.period} onChange={(value) => setIncomeForm((current) => ({ ...current, period: value }))} options={['MONTHLY', 'WEEKLY', 'YEARLY']} />
                            <SheetInput label="Date" type="date" value={incomeForm.income_date} onChange={(value) => setIncomeForm((current) => ({ ...current, income_date: value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['RECEIVED', 'EXPECTED'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setIncomeForm((current) => ({ ...current, status }))}
                                    className={`min-h-[44px] rounded-xl border text-xs font-bold ${incomeForm.status === status ? 'border-[#eabb3a] bg-[#fff7df] text-[#9b7416]' : 'border-[#dde1ea] bg-[#f7f8fa] text-[#707974]'}`}
                                >
                                    {status === 'RECEIVED' ? 'Received' : 'Expected'}
                                </button>
                            ))}
                        </div>
                        <SheetInput label="Description" value={incomeForm.description} onChange={(value) => setIncomeForm((current) => ({ ...current, description: value }))} placeholder="Type something" />
                        <button type="button" onClick={addIncome} className="mt-2 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#0c6060] text-sm font-bold text-white">
                            <Plus size={18} /> Add Income
                        </button>
                    </SetupSheet>
                )}

                {sheet === 'goal' && (
                    <SetupSheet title="Add Financial Goal" onClose={() => setSheet(null)}>
                        <SheetSelect label="Goal type" value={goalForm.type} onChange={(value) => setGoalForm((current) => ({ ...current, type: value }))} options={['Short Term Goal', 'Medium Term Goal', 'Long Term Goal']} />
                        <SheetInput label="Goal name" value={goalForm.name} onChange={(value) => setGoalForm((current) => ({ ...current, name: value }))} placeholder="Eg. Emergency Fund" />
                        <SheetInput label="Target amount" value={goalForm.targetAmount} onChange={(value) => setGoalForm((current) => ({ ...current, targetAmount: value }))} placeholder="Eg. KES 30,000" />
                        <div className="grid grid-cols-2 gap-3">
                            <SheetInput label="Current savings" value={goalForm.currentSavings} onChange={(value) => setGoalForm((current) => ({ ...current, currentSavings: value }))} placeholder="Eg. KES 10,000" />
                            <SheetInput label="Monthly contribution" value={goalForm.monthlyContribution} onChange={(value) => setGoalForm((current) => ({ ...current, monthlyContribution: value }))} placeholder="Eg. KES 1,000" />
                        </div>
                        <SheetInput label="Target date" type="date" value={goalForm.targetDate} onChange={(value) => setGoalForm((current) => ({ ...current, targetDate: value }))} />
                        <SheetSelect label="Link to a product" value={goalForm.linkedProduct} onChange={(value) => setGoalForm((current) => ({ ...current, linkedProduct: value }))} options={['Money Market Fund', 'Savings Account', 'SACCO', 'Treasury Bills']} />
                        <button type="button" onClick={addGoal} className="mt-2 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#0c6060] text-sm font-bold text-white">
                            <Plus size={18} /> Add Goal
                        </button>
                    </SetupSheet>
                )}

                {sheet === 'dependent' && (
                    <SetupSheet title="Add Dependent" onClose={() => setSheet(null)}>
                        <SheetSelect label="Relationship" value={dependentForm.relationship} onChange={(value) => setDependentForm((current) => ({ ...current, relationship: value }))} options={['Father', 'Mother', 'Child', 'Sibling', 'Grandfather', 'Grandmother', 'Other']} />
                        <SheetInput label="Number of dependents" value={dependentForm.count} onChange={(value) => setDependentForm((current) => ({ ...current, count: value }))} placeholder="Eg. 2" />
                        <SheetSelect label="Beneficiary type" value={dependentForm.beneficiaryType} onChange={(value) => setDependentForm((current) => ({ ...current, beneficiaryType: value }))} options={['Direct Beneficiary', 'Indirect Beneficiary']} />
                        <SheetInput label="Support amount" value={dependentForm.supportAmount} onChange={(value) => setDependentForm((current) => ({ ...current, supportAmount: value }))} placeholder="Eg. KES 10,000" />
                        <SheetSelect label="Frequency" value={dependentForm.frequency} onChange={(value) => setDependentForm((current) => ({ ...current, frequency: value }))} options={['MONTHLY', 'QUARTERLY', 'YEARLY']} />
                        <button type="button" onClick={addDependent} className="mt-2 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#0c6060] text-sm font-bold text-white">
                            <Plus size={18} /> Add Dependent
                        </button>
                    </SetupSheet>
                )}
            </section>
        </div>
    );
};

const WelcomeSetupScreen = ({ onSkip, onStart }) => (
    <main className="flex flex-1 flex-col px-4 pb-7 pt-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#eabb3a] bg-[#fff7df] text-[#0c6060]">
            <PartyPopper size={26} />
        </div>
        <h1 className="mt-6 text-center text-[25px] font-extrabold leading-8 text-[#0c6060]">
            Congrats! Your Financial Tool is Ready
        </h1>
        <p className="mx-auto mt-3 max-w-[290px] text-center text-sm leading-6 text-[#5e5f60]">
            We have personalized your dashboard based on your goals and financial journey.
        </p>

        <div className="mt-7 rounded-2xl bg-[#eaf1f0] p-5">
            <p className="font-mono text-[11px] uppercase tracking-[1.98px] text-[#707974]">Your first three steps</p>
            <SetupChecklistItem number="1" text="Add your monthly income" />
            <SetupChecklistItem number="2" text="Create your first financial goal" />
            <SetupChecklistItem number="3" text="Complete your Financial Wellness Profile" />
            <p className="mt-5 text-center text-xs font-semibold text-[#707974]">Estimated time: 5 minutes</p>
        </div>

        <div className="mt-auto space-y-3 pt-6">
            <button type="button" onClick={onStart} className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#0c6060] px-6 text-sm font-bold text-white">
                Complete Profile
            </button>
            <button type="button" onClick={onSkip} className="inline-flex min-h-[38px] w-full items-center justify-center text-sm font-bold text-[#0c6060] underline underline-offset-2">
                Skip for now
            </button>
        </div>
    </main>
);

const SetupIntro = ({ currentStep }) => (
    <div>
        <p className="font-mono text-[11px] uppercase tracking-[1.98px] text-[#eabb3a]">Make it yours</p>
        <h1 className="mt-2 text-[27px] font-extrabold leading-[31px] tracking-normal text-[#10231c]">Complete your profile</h1>
        <p className="mt-2 text-[14.5px] leading-[22px] text-[#5e5f60]">
            Let&apos;s set up your financial profile to understand your current state.
        </p>
    </div>
);

const StepProgress = ({ currentStep }) => (
    <div className="mt-6 rounded-xl bg-white px-4 py-3">
        <div className="flex items-center">
            {[0, 1, 2].map((step) => (
                <React.Fragment key={step}>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${step <= currentStep ? 'bg-[#eabb3a] text-white' : 'border border-[#e7e9e4] bg-white text-[#6e7e76]'}`}>
                        {step + 1}
                    </span>
                    {step < 2 && <span className={`mx-1 h-0.5 flex-1 ${step < currentStep ? 'bg-[#eabb3a]' : 'bg-[#e7e9e4]'}`} />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const IncomeStep = ({ incomeItems, onAdd, totalIncome }) => (
    <SetupCard title="Source of Income" actionLabel="Add Income" onAction={onAdd}>
        {incomeItems.length === 0 ? (
            <EmptyState icon={Briefcase} title="Source of Income" text="Add your income for your financial profile so us better understand your income structure." actionLabel="Add Income" onAction={onAdd} />
        ) : (
            <div className="space-y-3">
                <div className="rounded-2xl bg-white p-4 text-center shadow-[0_0_2px_rgba(0,0,0,0.18)]">
                    <p className="text-xs text-[#707974]">Your total income</p>
                    <p className="mt-1 text-2xl font-extrabold text-[#303048]">{formatKes(totalIncome)}</p>
                </div>
                {incomeItems.map((item) => (
                    <SummaryRow key={item.id} icon={Briefcase} label={item.source} value={formatKes(parseMoney(item.amount))} meta={item.description || 'Recurring income'} />
                ))}
                <button type="button" onClick={onAdd} className="mx-auto mt-2 flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#eabb3a] px-5 text-sm font-bold text-[#eabb3a]">
                    <Plus size={16} /> Add Income
                </button>
            </div>
        )}
    </SetupCard>
);

const GoalsStep = ({ goalItems, onAdd, onDelete }) => (
    <SetupCard title="Financial Goals" actionLabel="Add Goal" onAction={onAdd}>
        {goalItems.length === 0 ? (
            <EmptyState icon={Target} title="No Goals Yet" text="Add your financial goals to help you steer your financial journey in the right direction." />
        ) : (
            <div className="space-y-3">
                {goalItems.map((item) => (
                    <GoalRow key={item.id} goal={item} onDelete={() => onDelete(item.id)} />
                ))}
            </div>
        )}
    </SetupCard>
);

const DependentsStep = ({ dependentItems, onAdd }) => (
    <SetupCard title="My Dependents" actionLabel="Add Dependents" onAction={onAdd}>
        {dependentItems.length === 0 ? (
            <EmptyState icon={Users} title="No Dependents Yet" text="Add your dependents to better track your expenses for your loved ones." />
        ) : (
            <div className="space-y-3">
                {dependentItems.map((item) => (
                    <SummaryRow key={item.id} icon={Users} label={item.relationship} value={formatKes(parseMoney(item.supportAmount))} meta={item.beneficiaryType} />
                ))}
            </div>
        )}
    </SetupCard>
);

const SetupCard = ({ actionLabel, children, onAction, title }) => (
    <div className="mt-5 rounded-2xl border border-[#e3e3e5] bg-white p-4 shadow-[0_32px_25.5px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-start justify-between border-b border-[#dde1ea] pb-2">
            <div>
                <h2 className="text-base font-bold text-[#0c6060]">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#707974]">Here is a summary of your setup.</p>
            </div>
            <button type="button" onClick={onAction} className="inline-flex items-center gap-1 text-xs font-bold text-[#eabb3a]">
                <Plus size={13} /> {actionLabel}
            </button>
        </div>
        {children}
    </div>
);

const EmptyState = ({ actionLabel, icon: Icon, onAction, text, title }) => (
    <div className="rounded-2xl bg-white px-4 py-8 text-center shadow-[0_0_2px_rgba(0,0,0,0.22)]">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2f4] text-[#0c6060]">
            <Icon size={25} />
        </span>
        <h3 className="mt-4 text-base font-extrabold text-[#10231c]">{title}</h3>
        <p className="mx-auto mt-2 max-w-[250px] text-xs leading-5 text-[#8e97ab]">{text}</p>
        {actionLabel && (
            <button type="button" onClick={onAction} className="mx-auto mt-5 flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#eabb3a] px-5 text-sm font-bold text-[#eabb3a]">
                <Plus size={16} /> {actionLabel}
            </button>
        )}
    </div>
);

const GoalRow = ({ goal, onDelete }) => (
    <div className="rounded-[23px] bg-white px-4 py-4 shadow-[0_0_2px_rgba(0,0,0,0.25)]">
        <div className="flex items-start justify-between gap-3">
            <div>
                <span className="rounded-full bg-[#deefe5] px-2 py-1 text-[10px] text-[#00a63e]">{goal.type}</span>
                <p className="mt-2 text-xs text-[#67677a]">{goal.type.includes('Long') ? '10+ Years' : 'Under 1 Year'}</p>
                <p className="text-sm font-extrabold text-[#303048]">{goal.name}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-extrabold text-[#0c6060]">{formatKes(parseMoney(goal.targetAmount))}</p>
                <p className="text-[10px] text-[#8e97ab]">{goal.targetDate ? `Due ${goal.targetDate}` : 'Target date open'}</p>
            </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-dashed border-[#dde1ea] pt-3">
            <button type="button" className="rounded-lg border border-[#dde1ea] px-3 py-2 text-xs font-bold text-[#5e6a80]">Edit</button>
            <button type="button" onClick={onDelete} className="rounded-lg border border-[rgba(232,58,58,0.25)] px-3 py-2 text-xs font-bold text-[#e83a3a]">Delete</button>
        </div>
    </div>
);

const SummaryRow = ({ icon: Icon, label, meta, value }) => (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_0_2px_rgba(0,0,0,0.18)]">
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fef6de] text-[#eabb3a]">
                <Icon size={17} />
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#303048]">{label}</p>
                <p className="truncate text-[11px] text-[#8e97ab]">{meta}</p>
            </div>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-[#303048]">{value}</p>
    </div>
);

const SetupChecklistItem = ({ number, text }) => (
    <div className="mt-4 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eabb3a] text-sm font-extrabold text-white">{number}</span>
        <p className="text-sm font-extrabold text-[#10231c]">{text}</p>
    </div>
);

const SetupSheet = ({ children, onClose, title }) => (
    <div className="absolute inset-0 z-30 flex items-end bg-black/35">
        <div className="max-h-[86vh] w-full overflow-y-auto rounded-t-[24px] bg-white px-5 pb-7 pt-3 shadow-[0_-8px_20px_rgba(10,16,24,0.2)]">
            <div className="mx-auto h-1 w-10 rounded-full bg-[#dde1ea]" />
            <div className="mt-6 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#0a1018]">{title}</h2>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dde1ea] bg-[#eff1f5] text-[#5e6a80]">
                    <X size={16} />
                </button>
            </div>
            <div className="mt-5 space-y-4">{children}</div>
        </div>
    </div>
);

const SheetInput = ({ label, onChange, type = 'text', value, placeholder = '' }) => (
    <label className="block text-xs font-extrabold capitalize text-[#8e97ab]">
        {label}
        <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="mt-2 min-h-[48px] w-full rounded-xl border border-[#dde1ea] bg-[#f7f8fa] px-4 text-sm font-semibold text-[#10231c] outline-none placeholder:text-[#757575] focus:border-[#0c6060]"
        />
    </label>
);

const SheetSelect = ({ label, onChange, options, value }) => (
    <label className="block text-xs font-extrabold capitalize text-[#8e97ab]">
        {label}
        <span className="mt-2 flex min-h-[48px] items-center rounded-xl border border-[#dde1ea] bg-[#f7f8fa] px-4 focus-within:border-[#0c6060]">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="min-w-0 flex-1 appearance-none bg-transparent text-sm font-semibold text-[#10231c] outline-none"
            >
                {options.map((option) => (
                    <option key={option} value={option}>{toTitle(option)}</option>
                ))}
            </select>
            <ChevronDown size={16} className="text-[#0a1018]" />
        </span>
    </label>
);

function toTitle(value) {
    return String(value || '').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseMoney(value) {
    const normalized = String(value || '').replace(/[^\d.]/g, '');
    return Number(normalized) || 0;
}

function formatKes(value) {
    return `KES ${Math.round(Number(value) || 0).toLocaleString('en-KE')}`;
}

async function syncIncomeToApi(incomeItems) {
    if (incomeItems.length === 0) return;

    const categories = await incomeService.getCategories().catch(() => []);
    let category = normalizeCategoryList(categories).find((item) => item.name.toLowerCase().includes('salary'));
    if (!category) {
        category = await incomeService.createCategory({ name: 'Salary' }).catch(() => null);
        category = normalizeCategory(category);
    }

    if (!category?.value) return;

    await Promise.all(incomeItems.map((item) => incomeService.quickIncome({
        category: category.value,
        amount: String(parseMoney(item.amount)),
        description: item.description || item.source || 'Onboarding income',
        income_date: item.income_date || new Date().toISOString().split('T')[0],
    }).catch(() => null)));
}

async function persistLocalSetup({ dependentItems, goalItems }) {
    if (typeof window === 'undefined') return;

    const firstShortGoal = goalItems.find((item) => item.type.includes('Short'))?.name || goalItems[0]?.name || '';
    const firstMediumGoal = goalItems.find((item) => item.type.includes('Medium'))?.name || '';
    const firstLongGoal = goalItems.find((item) => item.type.includes('Long'))?.name || goalItems[1]?.name || '';

    const workspace = {
        shortTermGoal: firstShortGoal,
        mediumTermGoal: firstMediumGoal,
        longTermGoal: firstLongGoal,
        dependentsCount: String(dependentItems.reduce((sum, item) => sum + (Number(item.count) || 1), 0) || ''),
        familyNotes: dependentItems.map((item) => `${item.relationship}: ${formatKes(parseMoney(item.supportAmount))} ${toTitle(item.frequency)}`).join('\n'),
        setupGoals: goalItems,
        setupDependents: dependentItems,
    };

    window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(workspace));
}

function normalizeCategoryList(data) {
    const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
            ? data.categories
            : Array.isArray(data?.results)
                ? data.results
                : [];
    return rows.map(normalizeCategory).filter((item) => item.value);
}

function normalizeCategory(category = {}) {
    const source = category?.data || category?.category || category;
    const value = source?.uuid ?? source?.id ?? source?.pk ?? source?.category_id ?? source?.value ?? '';
    return {
        value: String(value || ''),
        name: source?.name || source?.label || 'Income category',
    };
}

export default ProfileSetupPage;
