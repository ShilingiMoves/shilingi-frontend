import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import Button from '../../Button';
import { getUserAccount, updateUserPreferences } from '../../../services/userApi';
import incomeService from '../../../services/incomeService';
import { USER_PROFILE_WORKSPACE_KEY } from './UserGoalsFamilyForm';

const readWorkspace = () => {
    if (typeof window === 'undefined') {
        return {
            shortTermGoal: '',
            mediumTermGoal: '',
            longTermGoal: '',
            dependentsCount: '',
            familyNotes: '',
        };
    }

    try {
        return {
            shortTermGoal: '',
            mediumTermGoal: '',
            longTermGoal: '',
            dependentsCount: '',
            familyNotes: '',
            ...JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}'),
        };
    } catch {
        return {
            shortTermGoal: '',
            mediumTermGoal: '',
            longTermGoal: '',
            dependentsCount: '',
            familyNotes: '',
        };
    }
};

const formatCurrency = (value) => {
    if (!value && value !== 0) return 'Not added yet';
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return value;
    return `KES ${numericValue.toLocaleString()}`;
};

const getTierLabel = (user) => (user?.tier || user?.subscription_tier || 'Basic').toString().replace(/_/g, ' ');

const resolveIncomeValue = (incomeSummary, profileIncome) => {
    const managerIncome = Number(
        incomeSummary?.total_income ??
            incomeSummary?.monthly_income ??
            incomeSummary?.current_month?.total_income ??
            0
    );
    if (managerIncome > 0) return managerIncome;
    return Number(profileIncome || 0);
};

const calculateProfileCompletion = (user, workspace, resolvedIncome) => {
    const profile = user?.profile || {};
    const checks = [
        Boolean(user?.first_name),
        Boolean(user?.email),
        Boolean(resolvedIncome),
        Boolean(profile.primary_financial_goal),
        Boolean(workspace.shortTermGoal),
        Boolean(workspace.mediumTermGoal),
        Boolean(workspace.longTermGoal),
        Boolean(workspace.dependentsCount || workspace.familyNotes),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const GOAL_OPTIONS = [
    { value: '', label: 'Select a goal' },
    { value: 'SAVE_EMERGENCY', label: 'Build Emergency Fund' },
    { value: 'PAY_DEBT', label: 'Pay Off Debt' },
    { value: 'SAVE_INVEST', label: 'Save and Invest' },
    { value: 'BUDGET_BETTER', label: 'Budget Better' },
    { value: 'RETIREMENT', label: 'Plan for Retirement' },
    { value: 'OTHER', label: 'Other' },
];

const UserProfilePanel = () => {
    const [user, setUser] = useState(null);
    const [workspace, setWorkspace] = useState(readWorkspace);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [incomeSummary, setIncomeSummary] = useState(null);
    const [editingIncome, setEditingIncome] = useState(false);
    const [editingGoals, setEditingGoals] = useState(false);
    const [incomeSubmitting, setIncomeSubmitting] = useState(false);
    const [goalsSubmitting, setGoalsSubmitting] = useState(false);
    const [incomeForm, setIncomeForm] = useState({
        monthly_income: '',
        receive_notifications: true,
        receive_weekly_summary: true,
    });
    const [goalsForm, setGoalsForm] = useState({
        primary_financial_goal: '',
        shortTermGoal: '',
        mediumTermGoal: '',
        longTermGoal: '',
        dependentsCount: '',
        familyNotes: '',
    });

    useEffect(() => {
        const loadUserWorkspace = async () => {
            try {
                setLoading(true);
                setError('');
                const [userResponse, incomeSummaryResponse] = await Promise.all([
                    getUserAccount(),
                    incomeService.getSummary().catch(() => null),
                ]);
                const storedWorkspace = readWorkspace();
                const resolvedIncome = resolveIncomeValue(incomeSummaryResponse, userResponse?.profile?.monthly_income);
                setUser(userResponse);
                setIncomeSummary(incomeSummaryResponse);
                setWorkspace(storedWorkspace);
                setIncomeForm({
                    monthly_income: resolvedIncome || '',
                    receive_notifications: userResponse?.profile?.receive_notifications ?? true,
                    receive_weekly_summary: userResponse?.profile?.receive_weekly_summary ?? true,
                });
                setGoalsForm({
                    primary_financial_goal: userResponse?.profile?.primary_financial_goal || '',
                    shortTermGoal: storedWorkspace.shortTermGoal || '',
                    mediumTermGoal: storedWorkspace.mediumTermGoal || '',
                    longTermGoal: storedWorkspace.longTermGoal || '',
                    dependentsCount: storedWorkspace.dependentsCount || '',
                    familyNotes: storedWorkspace.familyNotes || '',
                });
            } catch (err) {
                setError(err.message || 'We could not load your account workspace right now.');
            } finally {
                setLoading(false);
            }
        };

        loadUserWorkspace();
    }, []);

    const fullName = useMemo(() => `${user?.first_name || 'Member'} ${user?.last_name || ''}`.trim(), [user]);
    const tierLabel = useMemo(() => getTierLabel(user), [user]);
    const resolvedIncome = useMemo(
        () => resolveIncomeValue(incomeSummary, user?.profile?.monthly_income),
        [incomeSummary, user?.profile?.monthly_income]
    );
    const profileCompletion = useMemo(
        () => calculateProfileCompletion(user, workspace, resolvedIncome),
        [resolvedIncome, user, workspace]
    );
    const primaryGoal = user?.profile?.primary_financial_goal
        ? String(user.profile.primary_financial_goal).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase())
        : 'Not added yet';

    const handleIncomeChange = (event) => {
        const { name, value, type, checked } = event.target;
        setIncomeForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleGoalsChange = (event) => {
        const { name, value } = event.target;
        setGoalsForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const saveIncome = async (event) => {
        event.preventDefault();
        try {
            setIncomeSubmitting(true);
            setError('');
            setSuccess('');
            const updatedProfile = await updateUserPreferences({
                ...incomeForm,
                primary_financial_goal: user?.profile?.primary_financial_goal || null,
            });

            const incomingIncome = Number(incomeForm.monthly_income || 0);
            const currentManagerIncome = Number(
                incomeSummary?.total_income ??
                    incomeSummary?.monthly_income ??
                    incomeSummary?.current_month?.total_income ??
                    0
            );

            if (incomingIncome > 0 && currentManagerIncome <= 0) {
                const categoriesResponse = await incomeService.getCategories().catch(() => null);
                const categories = categoriesResponse?.categories || categoriesResponse || [];
                let selectedCategory = categories?.[0];

                if (!selectedCategory) {
                    selectedCategory = await incomeService.createCategory({ name: 'Salary' }).catch(() => null);
                }

                const categoryUuid =
                    selectedCategory?.uuid ||
                    selectedCategory?.id ||
                    selectedCategory?.data?.uuid ||
                    selectedCategory?.data?.id;

                if (categoryUuid) {
                    await incomeService.quickIncome({
                        category: categoryUuid,
                        amount: incomingIncome,
                        description: 'Monthly income baseline (Profile setup)',
                        source: 'Profile setup',
                        income_date: new Date().toISOString().split('T')[0],
                        frequency: 'MONTHLY',
                        is_recurring: true,
                        status: 'RECEIVED',
                        is_taxable: false,
                        notes: 'Created from profile income setup',
                    });
                }
            }

            const latestIncomeSummary = await incomeService.getSummary().catch(() => null);
            setIncomeSummary(latestIncomeSummary);

            setUser((current) => ({
                ...current,
                profile: {
                    ...current?.profile,
                    ...updatedProfile,
                },
            }));
            setEditingIncome(false);
            setSuccess('Income details updated.');
        } catch (err) {
            setError(err.message || 'We could not save your income details right now.');
        } finally {
            setIncomeSubmitting(false);
        }
    };

    const saveGoals = async (event) => {
        event.preventDefault();
        try {
            setGoalsSubmitting(true);
            setError('');
            setSuccess('');

            const updatedProfile = await updateUserPreferences({
                monthly_income: user?.profile?.monthly_income || null,
                receive_notifications: user?.profile?.receive_notifications ?? true,
                receive_weekly_summary: user?.profile?.receive_weekly_summary ?? true,
                primary_financial_goal: goalsForm.primary_financial_goal || null,
            });

            const newWorkspace = {
                shortTermGoal: goalsForm.shortTermGoal,
                mediumTermGoal: goalsForm.mediumTermGoal,
                longTermGoal: goalsForm.longTermGoal,
                dependentsCount: goalsForm.dependentsCount,
                familyNotes: goalsForm.familyNotes,
            };

            window.localStorage.setItem(USER_PROFILE_WORKSPACE_KEY, JSON.stringify(newWorkspace));
            setWorkspace(newWorkspace);
            setUser((current) => ({
                ...current,
                profile: {
                    ...current?.profile,
                    ...updatedProfile,
                },
            }));
            setEditingGoals(false);
            setSuccess('Goals and dependents updated.');
        } catch (err) {
            setError(err.message || 'We could not save your goals right now.');
        } finally {
            setGoalsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your account workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">We could not finish that account update.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 shadow-sm">
                    {success}
                </div>
            )}

            <section className="relative overflow-hidden rounded-[1.6rem] bg-[#0f5f4f] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f4f43] via-[#156854] to-[#1f7761]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(240,201,77,0.14),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.06),_transparent_30%)]" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#7ea44a_0%,_#f0c94d_100%)] text-3xl font-extrabold text-white ring-2 ring-white/20 shadow-lg shadow-slate-950/20">
                            {(user?.first_name?.charAt(0) || 'M').toUpperCase()}
                            {(user?.last_name?.charAt(0) || '').toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-[2rem] font-extrabold tracking-tight text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.22)]">{fullName}</h2>
                            <p className="mt-0.5 text-sm font-medium text-white/90">
                                {user?.email || 'Signed in'} {user?.phone_number ? `• ${user.phone_number}` : ''}
                            </p>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-200/45 bg-slate-950/20 px-4 py-1.5 text-sm font-semibold text-amber-100 backdrop-blur-sm">
                                <ShieldCheck size={15} />
                                {tierLabel} Member
                            </div>
                        </div>
                    </div>

                    <div className="min-w-[220px] rounded-[1.2rem] border border-white/15 bg-slate-950/20 px-5 py-3.5 backdrop-blur-sm">
                        <p className="text-right text-[2.25rem] font-extrabold text-[#F0C94D] [text-shadow:0_1px_10px_rgba(0,0,0,0.18)]">{profileCompletion}%</p>
                        <p className="text-right text-sm font-medium text-white/90">Profile Complete</p>
                        <div className="mt-2.5 h-2 rounded-full bg-white/18">
                            <div className="h-2 rounded-full bg-[#F0C94D] transition-all" style={{ width: `${profileCompletion}%` }} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-950">
                        <Briefcase size={16} className="text-primary-700" />
                        <p className="text-lg font-bold">Employment & Income</p>
                    </div>

                    {editingIncome ? (
                        <form onSubmit={saveIncome} className="mt-5 space-y-4">
                            <InlineField
                                label="Monthly income"
                                name="monthly_income"
                                type="number"
                                value={incomeForm.monthly_income}
                                onChange={handleIncomeChange}
                                placeholder="120000"
                            />
                            <InlineCheckbox
                                label="Receive dashboard reminders"
                                name="receive_notifications"
                                checked={incomeForm.receive_notifications}
                                onChange={handleIncomeChange}
                            />
                            <InlineCheckbox
                                label="Receive weekly money summary"
                                name="receive_weekly_summary"
                                checked={incomeForm.receive_weekly_summary}
                                onChange={handleIncomeChange}
                            />
                            <div className="flex gap-3">
                                <Button type="submit" variant="primary" disabled={incomeSubmitting}>
                                    {incomeSubmitting ? 'Saving...' : 'Save income details'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditingIncome(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <ProfileDatum label="Employment status" value="Employed / Active income" />
                                <ProfileDatum label="Monthly income" value={formatCurrency(resolvedIncome)} />
                                <ProfileDatum label="Default currency" value={user?.default_currency || 'KES'} />
                                <ProfileDatum label="Weekly summary" value={user?.profile?.receive_weekly_summary ? 'Enabled' : 'Disabled'} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingIncome(true)}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.85rem] border border-emerald-200 bg-[#eef8f4] px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#e6f4ee]"
                            >
                                <Pencil size={15} className="text-amber-600" />
                                Edit Income Details
                            </button>
                        </>
                    )}
                </article>

                <article className="rounded-[1.35rem] border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-950">
                        <Target size={16} className="text-primary-700" />
                        <p className="text-lg font-bold">Goals & Dependents</p>
                    </div>

                    {editingGoals ? (
                        <form onSubmit={saveGoals} className="mt-5 space-y-4">
                            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                                Primary financial goal
                                <select
                                    name="primary_financial_goal"
                                    value={goalsForm.primary_financial_goal}
                                    onChange={handleGoalsChange}
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                                >
                                    {GOAL_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <InlineTextArea label="Short-term goal" name="shortTermGoal" value={goalsForm.shortTermGoal} onChange={handleGoalsChange} />
                            <InlineTextArea label="Medium-term goal" name="mediumTermGoal" value={goalsForm.mediumTermGoal} onChange={handleGoalsChange} />
                            <InlineTextArea label="Long-term goal" name="longTermGoal" value={goalsForm.longTermGoal} onChange={handleGoalsChange} />
                            <InlineField label="Dependents" name="dependentsCount" type="number" value={goalsForm.dependentsCount} onChange={handleGoalsChange} placeholder="0" />
                            <InlineTextArea label="Family notes" name="familyNotes" value={goalsForm.familyNotes} onChange={handleGoalsChange} rows={4} />
                            <div className="flex gap-3">
                                <Button type="submit" variant="primary" disabled={goalsSubmitting}>
                                    {goalsSubmitting ? 'Saving...' : 'Save goals'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setEditingGoals(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <ProfileDatum label="Primary financial goal" value={primaryGoal} />
                                <ProfileDatum label="Short-term goal" value={workspace.shortTermGoal || 'Not added yet'} />
                                <ProfileDatum label="Medium-term goal" value={workspace.mediumTermGoal || 'Not added yet'} />
                                <ProfileDatum label="Long-term goal" value={workspace.longTermGoal || 'Not added yet'} />
                                <ProfileDatum label="Dependents" value={workspace.dependentsCount || 'Optional'} />
                                <ProfileDatum label="Member tier" value={tierLabel} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingGoals(true)}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[0.85rem] border border-emerald-200 bg-[#eef8f4] px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#e6f4ee]"
                            >
                                <Pencil size={15} className="text-amber-600" />
                                Edit Goals
                            </button>
                        </>
                    )}
                </article>
            </section>

            <section className="rounded-[1.7rem] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-950">
                    <UserRound size={16} className="text-primary-700" />
                    <p className="text-lg font-bold">Account Security & Preferences</p>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SecurityCard icon={KeyRound} title="Change Password" subtitle="Update your sign-in password" />
                    <SecurityCard icon={ShieldCheck} title="Two-Factor Auth" subtitle="Recommended for stronger security" />
                    <SecurityCard icon={Bell} title="Notifications" subtitle={user?.profile?.receive_notifications ? 'Enabled' : 'Disabled'} />
                    <SecurityCard icon={LinkIcon} title="Linked Accounts" subtitle="M-Pesa, bank, and future connections" />
                </div>
            </section>
        </div>
    );
};

const ProfileDatum = ({ label, value }) => (
    <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="mt-1.5 text-base font-semibold text-slate-950">{value}</p>
    </div>
);

const SecurityCard = ({ icon: Icon, title, subtitle }) => (
    <div className="rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fbfdfc_0%,_#f4f8f6_100%)] px-4 py-5 text-center shadow-sm">
        <div className="mx-auto inline-flex rounded-2xl bg-white p-3 text-primary-700 shadow-sm ring-1 ring-slate-200">
            <Icon size={20} />
        </div>
        <p className="mt-4 text-base font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
);

const InlineField = ({ label, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <input
            {...props}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

const InlineTextArea = ({ label, rows = 3, ...props }) => (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {label}
        <textarea
            {...props}
            rows={rows}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
        />
    </label>
);

const InlineCheckbox = ({ label, ...props }) => (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
        <input
            {...props}
            type="checkbox"
            className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
        />
        {label}
    </label>
);

export default UserProfilePanel;
