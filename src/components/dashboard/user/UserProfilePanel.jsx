import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertCircle,
    Bell,
    Briefcase,
    KeyRound,
    Link as LinkIcon,
    Loader2,
    Pencil,
    ShieldCheck,
    Target,
    UserRound,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { getUserAccount, updateUserPreferences } from '../../../services/userApi';
import { useIncome } from '../../../contexts/IncomeContext';
import IncomeForm from '../income/IncomeForm';
import IncomeList from '../income/IncomeList';
import QuickIncomeModal from '../income/QuickIncomeModal';
import { USER_PROFILE_WORKSPACE_KEY } from './UserGoalsFamilyForm';

const GOAL_META = {
    short: { key: 'shortTermGoal', detailKey: 'shortTermGoalDetails', label: 'Short-Term', helper: 'Under 12 months', color: 'bg-[#37c837]' },
    medium: { key: 'mediumTermGoal', detailKey: 'mediumTermGoalDetails', label: 'Medium-Term', helper: '1 - 5 years', color: 'bg-[#f6da1a]' },
    long: { key: 'longTermGoal', detailKey: 'longTermGoalDetails', label: 'Long-Term', helper: '5+ years', color: 'bg-[#8a63df]' },
};

const defaults = {
    shortTermGoal: '',
    mediumTermGoal: '',
    longTermGoal: '',
    dependentsCount: '',
    familyNotes: '',
    shortTermGoalDetails: { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' },
    mediumTermGoalDetails: { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' },
    longTermGoalDetails: { name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' },
    riskAppetite: 'Moderate',
    investmentHorizon: '5-10 Years',
    preferredProducts: 'T-Bills, MMFs, NSE Equities',
    financialMotivation: '',
};

const tabs = [
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'income', label: 'Income Manager', icon: Briefcase },
    { id: 'dependents', label: 'Dependants', icon: Users },
    { id: 'security', label: 'Security & Prefs', icon: ShieldCheck },
];

const readWorkspace = () => {
    if (typeof window === 'undefined') return defaults;
    try {
        return { ...defaults, ...JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}') };
    } catch {
        return defaults;
    }
};

const writeWorkspace = (next) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(next));
    }
};

const fmtKES = (v) => Number(v || 0) > 0 ? `KES ${Number(v).toLocaleString('en-KE')}` : 'Not added yet';
const goalLabel = (v) => v ? String(v).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : 'Not added yet';
const tierLabel = (u) => (u?.tier || u?.subscription_tier || 'Basic').toString().replace(/_/g, ' ');
const resolvedIncome = (s, p) => Number(s?.total_income ?? s?.monthly_income ?? s?.current_month?.total_income ?? 0) || Number(p || 0);

const Input = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <input {...props} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500" />
    </label>
);

const Select = ({ label, children, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <select {...props} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500">
            {children}
        </select>
    </label>
);

const TextArea = ({ label, rows = 3, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <textarea {...props} rows={rows} className="rounded-2xl border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500" />
    </label>
);

const CheckRow = ({ label, ...props }) => (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
        <input {...props} type="checkbox" className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
        {label}
    </label>
);

const PrimaryButton = ({ className = '', ...props }) => <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-[1rem] bg-[#0f5f4f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0b4e41] disabled:cursor-not-allowed disabled:opacity-60 ${className}`} />;
const SecondaryButton = ({ className = '', ...props }) => <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-[1rem] border border-emerald-100 bg-[#f6fbf8] px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#eef8f4] ${className}`} />;
const Datum = ({ label, value }) => <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-1.5 text-base font-semibold text-slate-950">{value}</p></div>;
const SummaryCard = ({ label, value, subtitle, accent = '', dark = false, compact = false, onClick }) => { const Component = onClick ? 'button' : 'div'; return <Component type={onClick ? 'button' : undefined} onClick={onClick} className={`w-full rounded-[1.15rem] border border-emerald-100 bg-white px-4 ${compact ? 'py-4' : 'py-5'} text-left shadow-sm transition-all ${onClick ? 'hover:-translate-y-0.5 hover:shadow-md' : ''} ${accent}`}><p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? 'text-white/70' : 'text-slate-400'}`}>{label}</p><p className={`mt-2 ${compact ? 'text-2xl' : 'text-3xl'} font-extrabold ${dark ? 'text-white' : 'text-slate-950'}`}>{value}</p><p className={`mt-1.5 text-sm ${dark ? 'text-white/75' : 'text-slate-500'}`}>{subtitle}</p></Component>; };
const GoalActionCard = ({ label, helper, color, active, onClick }) => <button type="button" onClick={onClick} className={`w-full rounded-[1rem] border px-4 py-4 text-left transition-all ${active ? 'border-primary-300 bg-[#eef8f4] shadow-sm' : 'border-emerald-200 border-dashed bg-[#f8fcfa] hover:border-primary-300 hover:bg-[#f1faf6] hover:shadow-sm'}`}><div className="flex items-start justify-between gap-3"><div className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${active ? 'bg-white shadow-sm ring-1 ring-emerald-100' : 'bg-white/95 ring-1 ring-emerald-100'}`}><span className={`inline-flex h-3.5 w-3.5 rounded-full ${color}`} /></div><span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold ${active ? 'bg-primary-100 text-primary-700' : 'bg-white text-primary-700 ring-1 ring-emerald-100'}`}>+</span></div><p className="mt-4 text-sm font-semibold text-slate-900">{label}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></button>;
const SecurityCard = ({ icon: Icon, title, subtitle }) => <div className="rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fbfdfc_0%,_#f4f8f6_100%)] px-4 py-5 text-center shadow-sm"><div className="mx-auto inline-flex rounded-2xl bg-white p-3 text-primary-700 shadow-sm ring-1 ring-slate-200"><Icon size={20} /></div><p className="mt-4 text-base font-bold text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>;
const ModalShell = ({ title, icon: Icon, onClose, children }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/38 p-3 backdrop-blur-[3px] sm:p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.35rem] border border-emerald-100 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:rounded-[1.5rem]"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-100 bg-white/96 px-4 py-3 backdrop-blur sm:px-5 sm:py-4"><div className="flex items-center gap-2.5 sm:gap-3"><div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef8f4] text-primary-700 sm:h-10 sm:w-10"><Icon size={17} /></div><h3 className="text-[1.2rem] font-extrabold tracking-tight text-slate-950 sm:text-[1.45rem]">{title}</h3></div><button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-[#f6fbf8] text-slate-500 transition-colors hover:text-slate-900"><X size={17} /></button></div><div className="p-4 sm:p-5">{children}</div></div></div>;
const GoalTypeCard = ({ active, label, helper, color, onClick }) => <button type="button" onClick={onClick} className={`rounded-[1rem] border px-3 py-4 text-center transition-all sm:px-4 sm:py-4 ${active ? 'border-primary-500 bg-[#eef8f4] shadow-sm' : 'border-emerald-100 bg-white hover:border-primary-300 hover:bg-[#f9fcfa]'}`}><span className={`mx-auto inline-flex h-7 w-7 rounded-full border-2 border-slate-950/70 ${color}`} /><p className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">{label}</p><p className="mt-1 text-xs text-slate-500 sm:text-sm">{helper}</p></button>;

const UserProfilePanel = ({ initialTab }) => {
    const { categories, incomes, summary, loading: incomeLoading, error: incomeError, fetchIncomes, fetchSummary, deleteIncome, createCategory, addQuickIncome } = useIncome();
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(readWorkspace);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab || 'goals');
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [showIncomeForm, setShowIncomeForm] = useState(false);
    const [showQuickIncome, setShowQuickIncome] = useState(false);
    const [editingBaseline, setEditingBaseline] = useState(false);
    const [editingDependents, setEditingDependents] = useState(false);
    const [editingPrefs, setEditingPrefs] = useState(false);
    const [goalModalOpen, setGoalModalOpen] = useState(false);
    const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
    const [baselineForm, setBaselineForm] = useState({ monthly_income: '' });
    const [dependentsForm, setDependentsForm] = useState({ dependentsCount: '', familyNotes: '' });
    const [prefsForm, setPrefsForm] = useState({ receive_notifications: true, receive_weekly_summary: true });
    const [goalForm, setGoalForm] = useState({ primary_financial_goal: '', selectedType: 'short', name: '', targetAmount: '', currentSavings: '', targetDate: '', monthlyContribution: '', linkedProduct: '' });
    const [preferencesForm, setPreferencesForm] = useState({ primary_financial_goal: '', riskAppetite: 'Moderate', investmentHorizon: '5-10 Years', preferredProducts: 'T-Bills, MMFs, NSE Equities', financialMotivation: '' });
    const [submitting, setSubmitting] = useState({ baseline: false, goal: false, dependents: false, prefs: false, preferencesModal: false });
    const autoPickedRef = useRef(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const acct = await getUserAccount();
                const ws = readWorkspace();
                setUser(acct);
                setWorkspace(ws);
                setBaselineForm({ monthly_income: acct?.profile?.monthly_income || '' });
                setDependentsForm({ dependentsCount: ws.dependentsCount || '', familyNotes: ws.familyNotes || '' });
                setPrefsForm({ receive_notifications: acct?.profile?.receive_notifications ?? true, receive_weekly_summary: acct?.profile?.receive_weekly_summary ?? true });
                setPreferencesForm({
                    primary_financial_goal: acct?.profile?.primary_financial_goal || '',
                    riskAppetite: ws.riskAppetite || defaults.riskAppetite,
                    investmentHorizon: ws.investmentHorizon || defaults.investmentHorizon,
                    preferredProducts: ws.preferredProducts || defaults.preferredProducts,
                    financialMotivation: ws.financialMotivation || defaults.financialMotivation,
                });
            } catch (err) {
                setError(err.message || 'We could not load your account workspace right now.');
            } finally {
                setLoading(false);
            }
        };
        load();
        fetchIncomes({ current_month: 'true' });
        fetchSummary();
    }, [fetchIncomes, fetchSummary]);

    const incomeValue = useMemo(() => resolvedIncome(summary, user?.profile?.monthly_income), [summary, user?.profile?.monthly_income]);
    const currentMonth = summary?.current_month || {};
    const goalCount = [workspace.shortTermGoal, workspace.mediumTermGoal, workspace.longTermGoal].filter(Boolean).length;
    const sections = useMemo(() => ([
        { id: 'income', label: 'Income', complete: Boolean(incomeValue) || incomes.length > 0 },
        { id: 'goals', label: 'Goals', complete: Boolean(user?.profile?.primary_financial_goal) && goalCount > 0 },
        { id: 'dependents', label: 'Dependants', complete: Boolean(workspace.dependentsCount || workspace.familyNotes) },
        { id: 'security', label: 'Security', complete: Boolean(user?.email) && typeof user?.profile?.receive_notifications === 'boolean' && typeof user?.profile?.receive_weekly_summary === 'boolean' },
    ]), [goalCount, incomeValue, incomes.length, user, workspace.dependentsCount, workspace.familyNotes]);
    const recommendedTab = sections.find((s) => !s.complete)?.id || 'goals';
    const completionChecks = [user?.first_name, incomeValue, user?.profile?.primary_financial_goal, workspace.shortTermGoal, workspace.mediumTermGoal, workspace.longTermGoal, workspace.dependentsCount || workspace.familyNotes, ...sections.map((s) => s.complete)];
    const completion = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);
    const remaining = sections.filter((s) => !s.complete).length;
    const fullName = `${user?.first_name || 'Member'} ${user?.last_name || ''}`.trim();

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
            return;
        }
        if (!loading && !autoPickedRef.current) {
            setActiveTab(recommendedTab);
            autoPickedRef.current = true;
        }
    }, [initialTab, loading, recommendedTab]);

    const patchUserProfile = (updated) => setUser((current) => ({ ...current, profile: { ...current?.profile, ...updated } }));
    const syncIncome = async () => { await Promise.all([fetchSummary(), fetchIncomes({ current_month: 'true' })]); };

    const openGoalModal = (type = 'short') => {
        const meta = GOAL_META[type];
        const details = workspace[meta.detailKey] || defaults[meta.detailKey];
        setGoalForm({
            primary_financial_goal: user?.profile?.primary_financial_goal || preferencesForm.primary_financial_goal || '',
            selectedType: type,
            name: details.name || workspace[meta.key] || '',
            targetAmount: details.targetAmount || '',
            currentSavings: details.currentSavings || '',
            targetDate: details.targetDate || '',
            monthlyContribution: details.monthlyContribution || '',
            linkedProduct: details.linkedProduct || '',
        });
        setGoalModalOpen(true);
    };

    const saveBaseline = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, baseline: true }));
            setError('');
            setSuccess('');
            const updated = await updateUserPreferences({ monthly_income: baselineForm.monthly_income || null, receive_notifications: user?.profile?.receive_notifications ?? true, receive_weekly_summary: user?.profile?.receive_weekly_summary ?? true, primary_financial_goal: user?.profile?.primary_financial_goal || null });
            const incoming = Number(baselineForm.monthly_income || 0);
            const managerIncome = Number(summary?.total_income ?? summary?.monthly_income ?? summary?.current_month?.total_income ?? 0);
            if (incoming > 0 && managerIncome <= 0) {
                let cat = categories?.[0];
                if (!cat) cat = await createCategory({ name: 'Salary' }).catch(() => null);
                const category = cat?.uuid || cat?.id || cat?.data?.uuid || cat?.data?.id;
                if (category) {
                    await addQuickIncome({ category, amount: incoming, description: 'Monthly income baseline', source: 'Profile setup', income_date: new Date().toISOString().split('T')[0], frequency: 'MONTHLY', is_recurring: true, status: 'RECEIVED', is_taxable: false, notes: 'Created from profile income setup' });
                }
            }
            await syncIncome();
            patchUserProfile(updated);
            setEditingBaseline(false);
            setSuccess('Income baseline updated.');
        } catch (err) {
            setError(err.message || 'We could not save your income baseline right now.');
        } finally {
            setSubmitting((s) => ({ ...s, baseline: false }));
        }
    };

    const saveGoalModal = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, goal: true }));
            setError('');
            setSuccess('');
            const meta = GOAL_META[goalForm.selectedType];
            const next = {
                ...workspace,
                [meta.key]: goalForm.name,
                [meta.detailKey]: {
                    name: goalForm.name,
                    targetAmount: goalForm.targetAmount,
                    currentSavings: goalForm.currentSavings,
                    targetDate: goalForm.targetDate,
                    monthlyContribution: goalForm.monthlyContribution,
                    linkedProduct: goalForm.linkedProduct,
                },
            };
            writeWorkspace(next);
            setWorkspace(next);
            if (goalForm.primary_financial_goal !== (user?.profile?.primary_financial_goal || '')) {
                const updated = await updateUserPreferences({ monthly_income: user?.profile?.monthly_income || null, receive_notifications: user?.profile?.receive_notifications ?? true, receive_weekly_summary: user?.profile?.receive_weekly_summary ?? true, primary_financial_goal: goalForm.primary_financial_goal || null });
                patchUserProfile(updated);
            }
            setGoalModalOpen(false);
            setSuccess(`${meta.label} goal saved.`);
        } catch (err) {
            setError(err.message || 'We could not save your goal right now.');
        } finally {
            setSubmitting((s) => ({ ...s, goal: false }));
        }
    };

    const saveDependents = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, dependents: true }));
            setError('');
            setSuccess('');
            const next = { ...workspace, dependentsCount: dependentsForm.dependentsCount, familyNotes: dependentsForm.familyNotes };
            writeWorkspace(next);
            setWorkspace(next);
            setEditingDependents(false);
            setSuccess('Dependants and household notes updated.');
        } catch (err) {
            setError(err.message || 'We could not save your dependants details right now.');
        } finally {
            setSubmitting((s) => ({ ...s, dependents: false }));
        }
    };

    const savePrefs = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, prefs: true }));
            setError('');
            setSuccess('');
            const updated = await updateUserPreferences({ monthly_income: user?.profile?.monthly_income || null, primary_financial_goal: user?.profile?.primary_financial_goal || null, receive_notifications: prefsForm.receive_notifications, receive_weekly_summary: prefsForm.receive_weekly_summary });
            patchUserProfile(updated);
            setEditingPrefs(false);
            setSuccess('Security preferences updated.');
        } catch (err) {
            setError(err.message || 'We could not save your preferences right now.');
        } finally {
            setSubmitting((s) => ({ ...s, prefs: false }));
        }
    };

    const savePreferencesModal = async (e) => {
        e.preventDefault();
        try {
            setSubmitting((s) => ({ ...s, preferencesModal: true }));
            setError('');
            setSuccess('');
            const updated = await updateUserPreferences({ monthly_income: user?.profile?.monthly_income || null, receive_notifications: user?.profile?.receive_notifications ?? true, receive_weekly_summary: user?.profile?.receive_weekly_summary ?? true, primary_financial_goal: preferencesForm.primary_financial_goal || null });
            const next = {
                ...workspace,
                riskAppetite: preferencesForm.riskAppetite,
                investmentHorizon: preferencesForm.investmentHorizon,
                preferredProducts: preferencesForm.preferredProducts,
                financialMotivation: preferencesForm.financialMotivation,
            };
            writeWorkspace(next);
            setWorkspace(next);
            patchUserProfile(updated);
            setPreferencesModalOpen(false);
            setSuccess('Primary goal and preferences updated.');
        } catch (err) {
            setError(err.message || 'We could not save your preferences right now.');
        } finally {
            setSubmitting((s) => ({ ...s, preferencesModal: false }));
        }
    };

    if (loading) {
        return <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"><div className="text-center"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" /><p className="mt-4 text-sm font-medium text-slate-600">Loading your profile workspace...</p></div></div>;
    }

    return (
        <div className="space-y-6">
            {(error || incomeError) && <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm"><div className="flex items-start gap-3"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">We could not finish that update.</p><p className="mt-1">{error || incomeError}</p></div></div></div>}
            {success && <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 shadow-sm">{success}</div>}

            <section className="relative overflow-hidden rounded-[1.65rem] bg-[#0f5f4f] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f4f43] via-[#156854] to-[#1f7761]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(240,201,77,0.14),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_30%)]" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#d89f2f_0%,_#f0c94d_100%)] text-3xl font-extrabold text-slate-950 ring-2 ring-white/20 shadow-lg shadow-slate-950/20">{(user?.first_name?.charAt(0) || 'M').toUpperCase()}{(user?.last_name?.charAt(0) || '').toUpperCase()}</div>
                        <div>
                            <h2 className="text-[2rem] font-extrabold tracking-tight text-white">{fullName}</h2>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-200/45 bg-slate-950/20 px-4 py-1.5 text-sm font-semibold text-amber-100 backdrop-blur-sm"><ShieldCheck size={15} />{tierLabel(user)} Member</div>
                        </div>
                    </div>
                    <div className="min-w-[220px] rounded-[1.2rem] border border-white/15 bg-slate-950/20 px-5 py-3.5 backdrop-blur-sm"><p className="text-right text-[2.25rem] font-extrabold text-[#F0C94D]">{completion}%</p><p className="text-right text-sm font-medium text-white/90">Profile Complete</p><div className="mt-2.5 h-2 rounded-full bg-white/18"><div className="h-2 rounded-full bg-[#F0C94D] transition-all" style={{ width: `${completion}%` }} /></div><p className="mt-2 text-right text-xs text-white/75">{remaining > 0 ? `${remaining} sections remaining` : 'Profile setup looks strong'}</p></div>
                </div>
            </section>

            <section className="rounded-[1.35rem] border border-emerald-100 bg-white p-2 shadow-sm"><div className="flex flex-wrap gap-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all ${activeTab === id ? 'bg-[#0f5f4f] text-white shadow-md shadow-primary-900/20' : 'text-slate-600 hover:bg-[#f4faf7] hover:text-slate-950'}`}><Icon size={16} />{label}</button>)}</div></section>

            {activeTab === 'goals' && <section className="space-y-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Active Goals" value={String(goalCount)} subtitle="Across all horizons" accent="bg-[#0f5f4f]" dark compact onClick={() => openGoalModal(goalForm.selectedType || 'short')} /><GoalActionCard label={workspace.shortTermGoal ? workspace.shortTermGoal : 'Add Short-Term Goal'} helper={workspace.shortTermGoalDetails?.name || 'Under 12 months'} color="bg-[#37c837]" active={Boolean(workspace.shortTermGoal)} onClick={() => openGoalModal('short')} /><GoalActionCard label={workspace.mediumTermGoal ? workspace.mediumTermGoal : 'Add Medium-Term Goal'} helper={workspace.mediumTermGoalDetails?.name || '1 - 5 years'} color="bg-[#f6da1a]" active={Boolean(workspace.mediumTermGoal)} onClick={() => openGoalModal('medium')} /><GoalActionCard label={workspace.longTermGoal ? workspace.longTermGoal : 'Add Long-Term Goal'} helper={workspace.longTermGoalDetails?.name || '5+ years'} color="bg-[#8a63df]" active={Boolean(workspace.longTermGoal)} onClick={() => openGoalModal('long')} /></div><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-950"><Target size={16} className="text-primary-700" /><p className="text-lg font-bold">Primary Financial Goal & Preferences</p></div><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4"><Datum label="Primary financial goal" value={goalLabel(user?.profile?.primary_financial_goal)} /><Datum label="Risk appetite" value={workspace.riskAppetite || defaults.riskAppetite} /><Datum label="Investment horizon" value={workspace.investmentHorizon || defaults.investmentHorizon} /><Datum label="Preferred products" value={workspace.preferredProducts || defaults.preferredProducts} /></div><div className="mt-5 grid gap-5 md:grid-cols-2"><Datum label="Financial motivation" value={workspace.financialMotivation || 'Add your motivation to personalize guidance'} /><Datum label="Goal coverage" value={`${goalCount} horizons active`} /></div><button type="button" onClick={() => setPreferencesModalOpen(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] border border-amber-200 bg-[#fff6e7] px-4 py-3 text-sm font-semibold text-[#9a6200] transition-colors hover:bg-[#fff0d8]"><Pencil size={15} />Edit Primary Goal & Preferences</button></article></section>}

            {activeTab === 'income' && <section className="space-y-5"><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-lg font-bold text-slate-950">Income Manager inside your profile</p><p className="mt-1 text-sm text-slate-600">Capture your income baseline, manage current sources, and keep your planning inputs fresh.</p></div><div className="flex flex-wrap gap-3"><SecondaryButton type="button" onClick={() => setShowQuickIncome(true)}>Quick Add</SecondaryButton><PrimaryButton type="button" onClick={() => { setSelectedIncome(null); setShowIncomeForm(true); }}>Add Income</PrimaryButton></div></div>{editingBaseline ? <form onSubmit={saveBaseline} className="mt-5 grid gap-4 rounded-[1.2rem] border border-emerald-100 bg-[#f7fcfa] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><Input label="Monthly income baseline" name="monthly_income" type="number" value={baselineForm.monthly_income} onChange={(e) => setBaselineForm({ monthly_income: e.target.value })} placeholder="120000" /><div className="flex flex-wrap gap-3"><PrimaryButton type="submit" disabled={submitting.baseline}>{submitting.baseline ? 'Saving...' : 'Save Baseline'}</PrimaryButton><SecondaryButton type="button" onClick={() => setEditingBaseline(false)}>Cancel</SecondaryButton></div></form> : <div className="mt-5 rounded-[1.2rem] border border-emerald-100 bg-[#f7fcfa] p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Household Income Baseline</p><p className="mt-1 text-2xl font-extrabold text-slate-950">{fmtKES(user?.profile?.monthly_income)}</p><p className="mt-1 text-sm text-slate-600">Used when you are still setting up or before full income records are added.</p></div><SecondaryButton type="button" onClick={() => setEditingBaseline(true)}><Pencil size={15} />Edit Baseline</SecondaryButton></div></div>}</article><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Current Income" value={fmtKES(currentMonth.total_income || incomeValue)} subtitle={currentMonth.period_display || 'Current period'} /><SummaryCard label="Recurring Income" value={fmtKES(summary?.monthly_recurring_income)} subtitle="Reliable monthly earnings" /><SummaryCard label="Income Sources" value={String(summary?.income_sources_count || incomes.length || 0)} subtitle="Tracked categories" /><SummaryCard label="Savings Rate" value={`${Math.round(Number(currentMonth.savings_rate || 0))}%`} subtitle={currentMonth.is_surplus ? 'Healthy surplus month' : 'Track against spending'} /></div><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div><p className="text-lg font-bold text-slate-950">Recent income activity</p><p className="mt-1 text-sm text-slate-600">Returning users can adjust, tidy, or add new income without leaving the profile workspace.</p></div><div className="mt-5"><IncomeList incomes={incomes.slice(0, 6)} loading={incomeLoading} onEdit={(income) => { setSelectedIncome(income); setShowIncomeForm(true); }} onDelete={deleteIncome} currency={summary?.currency || 'KES'} /></div></article></section>}

            {activeTab === 'dependents' && <section className="space-y-5"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><SummaryCard label="Dependants" value={dependentsForm.dependentsCount || workspace.dependentsCount || '0'} subtitle="Household members you support" /><SummaryCard label="Household Context" value={workspace.familyNotes ? 'Added' : 'Optional'} subtitle={workspace.familyNotes ? 'Notes available for planning' : 'Add notes for more tailored guidance'} /><SummaryCard label="Profile Impact" value={sections.find((s) => s.id === 'dependents')?.complete ? 'Ready' : 'Pending'} subtitle="Used across recommendations" /></div><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-950"><Users size={16} className="text-primary-700" /><p className="text-lg font-bold">Dependants & Household Notes</p></div>{editingDependents ? <form onSubmit={saveDependents} className="mt-5 space-y-4"><Input label="Number of dependants" name="dependentsCount" type="number" value={dependentsForm.dependentsCount} onChange={(e) => setDependentsForm((c) => ({ ...c, dependentsCount: e.target.value }))} placeholder="0" /><TextArea label="Family notes" name="familyNotes" value={dependentsForm.familyNotes} onChange={(e) => setDependentsForm((c) => ({ ...c, familyNotes: e.target.value }))} rows={5} /><div className="flex flex-wrap gap-3"><PrimaryButton type="submit" disabled={submitting.dependents}>{submitting.dependents ? 'Saving...' : 'Save Dependants'}</PrimaryButton><SecondaryButton type="button" onClick={() => setEditingDependents(false)}>Cancel</SecondaryButton></div></form> : <><div className="mt-5 grid gap-5 md:grid-cols-2"><Datum label="Dependants count" value={workspace.dependentsCount || 'Not added yet'} /><Datum label="Household notes" value={workspace.familyNotes || 'Add household context to personalize recommendations'} /></div><button type="button" onClick={() => setEditingDependents(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] border border-emerald-200 bg-[#eef8f4] px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#e6f4ee]"><Pencil size={15} className="text-amber-600" />Edit Dependants & Notes</button></>}</article></section>}

            {activeTab === 'security' && <section className="space-y-5"><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-950"><UserRound size={16} className="text-primary-700" /><p className="text-lg font-bold">Account Security & Preferences</p></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><SecurityCard icon={KeyRound} title="Change Password" subtitle="Update your sign-in password" /><SecurityCard icon={ShieldCheck} title="Two-Factor Auth" subtitle="Recommended for stronger security" /><SecurityCard icon={Bell} title="Notifications" subtitle={prefsForm.receive_notifications ? 'Enabled' : 'Disabled'} /><SecurityCard icon={LinkIcon} title="Linked Accounts" subtitle="M-Pesa, bank, and future connections" /></div></article><article className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-950"><Bell size={16} className="text-primary-700" /><p className="text-lg font-bold">Notification Preferences</p></div>{editingPrefs ? <form onSubmit={savePrefs} className="mt-5 space-y-4"><CheckRow label="Receive dashboard reminders" name="receive_notifications" checked={prefsForm.receive_notifications} onChange={(e) => setPrefsForm((c) => ({ ...c, receive_notifications: e.target.checked }))} /><CheckRow label="Receive weekly money summary" name="receive_weekly_summary" checked={prefsForm.receive_weekly_summary} onChange={(e) => setPrefsForm((c) => ({ ...c, receive_weekly_summary: e.target.checked }))} /><div className="flex flex-wrap gap-3"><PrimaryButton type="submit" disabled={submitting.prefs}>{submitting.prefs ? 'Saving...' : 'Save Preferences'}</PrimaryButton><SecondaryButton type="button" onClick={() => setEditingPrefs(false)}>Cancel</SecondaryButton></div></form> : <><div className="mt-5 grid gap-5 md:grid-cols-2"><Datum label="Dashboard reminders" value={prefsForm.receive_notifications ? 'Enabled' : 'Disabled'} /><Datum label="Weekly summary emails" value={prefsForm.receive_weekly_summary ? 'Enabled' : 'Disabled'} /></div><button type="button" onClick={() => setEditingPrefs(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] border border-amber-200 bg-[#fff6e7] px-4 py-3 text-sm font-semibold text-[#9a6200] transition-colors hover:bg-[#fff0d8]"><Pencil size={15} />Edit Security & Preferences</button></>}</article></section>}

            {goalModalOpen && <ModalShell title="Add New Goal" icon={Target} onClose={() => setGoalModalOpen(false)}><form onSubmit={saveGoalModal} className="space-y-4 sm:space-y-5"><div><p className="text-sm font-medium text-slate-700">Goal Horizon</p><div className="mt-3 grid gap-2 sm:gap-3 md:grid-cols-3">{Object.entries(GOAL_META).map(([type, meta]) => <GoalTypeCard key={type} active={goalForm.selectedType === type} label={meta.label} helper={meta.helper} color={meta.color} onClick={() => setGoalForm((current) => ({ ...current, selectedType: type }))} />)}</div></div><div className="grid gap-3 sm:gap-4 md:grid-cols-2"><Select label="Primary Financial Goal" value={goalForm.primary_financial_goal} onChange={(e) => setGoalForm((current) => ({ ...current, primary_financial_goal: e.target.value }))}><option value="">Select a goal</option><option value="SAVE_EMERGENCY">Save & Invest</option><option value="PAY_DEBT">Pay Off Debt</option><option value="SAVE_INVEST">Save and Invest</option><option value="BUDGET_BETTER">Budget Better</option><option value="RETIREMENT">Retirement</option><option value="OTHER">Other</option></Select><Input label="Goal Name" value={goalForm.name} onChange={(e) => setGoalForm((current) => ({ ...current, name: e.target.value }))} placeholder="e.g. Emergency Fund, Holiday, Retirement..." /><Input label="Target Amount (KES)" value={goalForm.targetAmount} onChange={(e) => setGoalForm((current) => ({ ...current, targetAmount: e.target.value }))} placeholder="e.g. 100,000" /><Input label="Current Savings (KES)" value={goalForm.currentSavings} onChange={(e) => setGoalForm((current) => ({ ...current, currentSavings: e.target.value }))} placeholder="e.g. 25,000" /><Input label="Target Date" type="date" value={goalForm.targetDate} onChange={(e) => setGoalForm((current) => ({ ...current, targetDate: e.target.value }))} /><Input label="Monthly Contribution (KES)" value={goalForm.monthlyContribution} onChange={(e) => setGoalForm((current) => ({ ...current, monthlyContribution: e.target.value }))} placeholder="e.g. 5,000" /></div><Select label="Link to Product (Optional)" value={goalForm.linkedProduct} onChange={(e) => setGoalForm((current) => ({ ...current, linkedProduct: e.target.value }))}><option value="">-- Select a savings vehicle --</option><option value="MMF">Money Market Fund</option><option value="SACCO">SACCO</option><option value="Savings Account">Savings Account</option><option value="Fixed Deposit">Fixed Deposit</option></Select><div className="flex flex-col gap-3 pt-1 sm:flex-row sm:pt-2"><SecondaryButton type="button" className="sm:min-w-[112px]" onClick={() => setGoalModalOpen(false)}>Cancel</SecondaryButton><PrimaryButton type="submit" className="flex-1" disabled={submitting.goal}>{submitting.goal ? 'Saving...' : 'Save Goal'}</PrimaryButton></div></form></ModalShell>}

            {preferencesModalOpen && <ModalShell title="Primary Goal & Preferences" icon={Wallet} onClose={() => setPreferencesModalOpen(false)}><form onSubmit={savePreferencesModal} className="space-y-4 sm:space-y-5"><Select label="Primary Financial Goal" value={preferencesForm.primary_financial_goal} onChange={(e) => setPreferencesForm((current) => ({ ...current, primary_financial_goal: e.target.value }))}><option value="">Select a goal</option><option value="SAVE_EMERGENCY">Save & Invest</option><option value="PAY_DEBT">Pay Off Debt</option><option value="SAVE_INVEST">Save and Invest</option><option value="BUDGET_BETTER">Budget Better</option><option value="RETIREMENT">Retirement</option><option value="OTHER">Other</option></Select><div className="grid gap-3 sm:gap-4 md:grid-cols-2"><Select label="Risk Appetite" value={preferencesForm.riskAppetite} onChange={(e) => setPreferencesForm((current) => ({ ...current, riskAppetite: e.target.value }))}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></Select><Select label="Investment Horizon" value={preferencesForm.investmentHorizon} onChange={(e) => setPreferencesForm((current) => ({ ...current, investmentHorizon: e.target.value }))}><option>Under 12 months</option><option>1-5 Years</option><option>5-10 Years</option><option>10+ Years</option></Select></div><Input label="Preferred Products" value={preferencesForm.preferredProducts} onChange={(e) => setPreferencesForm((current) => ({ ...current, preferredProducts: e.target.value }))} /><TextArea label="Financial Motivation (Optional)" rows={4} value={preferencesForm.financialMotivation} onChange={(e) => setPreferencesForm((current) => ({ ...current, financialMotivation: e.target.value }))} /><div className="flex flex-col gap-3 pt-1 sm:flex-row sm:pt-2"><SecondaryButton type="button" className="sm:min-w-[112px]" onClick={() => setPreferencesModalOpen(false)}>Cancel</SecondaryButton><PrimaryButton type="submit" className="flex-1" disabled={submitting.preferencesModal}>{submitting.preferencesModal ? 'Saving...' : 'Save Changes'}</PrimaryButton></div></form></ModalShell>}

            {showIncomeForm && <IncomeForm income={selectedIncome} onClose={() => { setSelectedIncome(null); setShowIncomeForm(false); }} onSuccess={async () => { await syncIncome(); setSuccess('Income manager updated.'); }} />}
            <QuickIncomeModal isOpen={showQuickIncome} onClose={() => setShowQuickIncome(false)} />
        </div>
    );
};

export default UserProfilePanel;
