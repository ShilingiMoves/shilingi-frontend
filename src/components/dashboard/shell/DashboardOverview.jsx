import React, { useMemo } from 'react';
import {
    ArrowRight,
    CalendarDays,
    Compass,
    FileText,
    GraduationCap,
    LayoutDashboard,
    Users,
} from 'lucide-react';
import { DASHBOARD_DATA_KEY } from '../../../utils/dashboardDataState';
import { USER_PROFILE_WORKSPACE_KEY } from '../user/UserGoalsFamilyForm';

const toneMap = {
    morning: {
        label: 'Good morning',
        shell: 'from-[#176a57] via-[#187661] to-[#12384a]',
    },
    afternoon: {
        label: 'Good afternoon',
        shell: 'from-[#176b5a] via-[#1b7c67] to-[#145362]',
    },
    evening: {
        label: 'Good evening',
        shell: 'from-[#143748] via-[#165261] to-[#0f6758]',
    },
};

const compactCards = [
    {
        icon: LayoutDashboard,
        title: 'Profile and planners',
        text: 'Complete your profile, budget, debt, retirement, and protection planners.',
        target: 'user',
    },
    {
        icon: Compass,
        title: 'Compare Hub',
        text: 'Review loans, savings, MMFs, insurance, and banking options side by side.',
        target: 'comparehub',
    },
    {
        icon: GraduationCap,
        title: 'Learning Hub',
        text: 'Follow learning paths, expert articles, short videos, and assessments.',
        target: 'learninghub',
    },
    {
        icon: Users,
        title: 'Community',
        text: 'Stay accountable with circles, member conversations, and guided challenges.',
        target: 'communityhub',
    },
];

const calendarEvents = [
    { label: 'Rent review', date: '09 Apr', text: 'Check your cash position before the month\'s biggest outflow.' },
    { label: 'Debt payment', date: '12 Apr', text: 'Confirm your next scheduled repayment clears on time.' },
    { label: 'Savings top-up', date: '18 Apr', text: 'Make your SACCO or savings contribution and compare options.' },
];

const getMoment = (date) => {
    const hours = date.getHours();
    if (hours < 12) return 'morning';
    if (hours < 17) return 'afternoon';
    return 'evening';
};

const getStoredWorkspace = () => {
    if (typeof window === 'undefined') {
        return {};
    }

    try {
        return JSON.parse(window.localStorage.getItem(USER_PROFILE_WORKSPACE_KEY) || '{}');
    } catch {
        return {};
    }
};

const isNewDashboardUser = (user) => {
    const workspace = getStoredWorkspace();
    const profile = user?.profile || {};
    const hasDashboardData = typeof window !== 'undefined' && window.localStorage.getItem(DASHBOARD_DATA_KEY) === 'true';

    const hasPlannerInputs = Boolean(
        profile.monthly_income ||
        profile.primary_financial_goal ||
        workspace.shortTermGoal ||
        workspace.mediumTermGoal ||
        workspace.longTermGoal ||
        workspace.dependentsCount ||
        workspace.familyNotes ||
        hasDashboardData
    );

    return !hasPlannerInputs;
};

const DashboardOverview = ({ user, onSelectSection }) => {
    const firstName = user?.first_name || 'there';
    const currentMoment = useMemo(() => getMoment(new Date()), []);
    const palette = toneMap[currentMoment];
    const newUser = isNewDashboardUser(user);
    const dateLabel = useMemo(
        () =>
            new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
        []
    );

    return (
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <section className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${palette.shell} p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] sm:p-7`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(240,201,77,0.10),_transparent_24%)]" />
                    <div className="relative">
                        <div>
                            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/90">
                                {newUser ? `${dateLabel} • ${palette.label}` : palette.label}
                            </div>

                            {newUser ? (
                                <>
                                    <h1 className="mt-5 max-w-4xl text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-[3.15rem]">
                                        Welcome {firstName}, your financial health score is 0/100.
                                    </h1>
                                    <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
                                        Please complete your profile and planners to unlock personalized insights tailored to your life.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1 className="mt-5 max-w-4xl text-3xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-[3.35rem]">
                                        {firstName}, your Shilingi Moves dashboard is ready for today.
                                    </h1>
                                    <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
                                        Move from awareness to action with one connected workspace for planning, comparing, learning, tools, and community support.
                                    </p>
                                </>
                            )}

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => onSelectSection(newUser ? 'user' : 'budget')}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#F0C94D] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-300/20"
                                >
                                    Continue planning
                                    <ArrowRight size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSelectSection('comparehub')}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                                >
                                    Explore Compare Hub
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.7rem] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Dashboard shortcuts</p>
                                <h2 className="mt-2 text-xl font-extrabold text-slate-950">Everything important, without the long scroll.</h2>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {compactCards.map(({ icon: Icon, title, text, target }) => (
                                <button
                                    key={title}
                                    type="button"
                                    onClick={() => onSelectSection(target)}
                                    className="group rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(180deg,_#fbfdfc_0%,_#f6faf8_100%)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-sm"
                                >
                                    <div className="inline-flex rounded-xl bg-primary-50 p-2.5 text-primary-700">
                                        <Icon size={17} />
                                    </div>
                                    <h3 className="mt-3 text-base font-bold text-slate-950">{title}</h3>
                                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-[1.7rem] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={16} className="text-primary-700" />
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Financial calendar</p>
                            </div>

                            <div className="mt-4 space-y-3">
                                {calendarEvents.map((event) => (
                                    <div key={event.label} className="rounded-[1.15rem] border border-slate-200 bg-[linear-gradient(180deg,_#fafcfb_0%,_#f4f8f6_100%)] px-4 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-bold text-slate-950">{event.label}</p>
                                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700 ring-1 ring-slate-200">
                                                {event.date}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-sm leading-6 text-slate-600">{event.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.7rem] border border-emerald-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                            <div className="flex items-start gap-3">
                                <div className="inline-flex rounded-xl bg-amber-50 p-2.5 text-amber-700">
                                    <FileText size={17} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Shilingi ecosystem</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Dashboard, Compare, Resources, Learning Hub, and Community are designed to work together so users can act faster with less friction.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardOverview;
