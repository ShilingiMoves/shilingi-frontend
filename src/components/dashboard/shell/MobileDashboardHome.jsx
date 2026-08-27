import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import QuickExpenseModal from '../budget/QuickExpenseModal';
import DailyMoneyActionModal from './DailyMoneyActionModal';
import { getMoneyCalendar, getTodayMoney } from '../../../services/dailyMoneyApi';

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatKes = (value) => `KES ${Math.round(toNumber(value)).toLocaleString('en-KE')}`;

const parseEventDate = (event) => {
    const value = event?.due_at || event?.date || event?.event_date || event?.starts_at;
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getCalendarEventTitle = (event) => event?.title || event?.name || event?.label || 'Money event';

const getCalendarEventEmoji = (event) => {
    const label = `${getCalendarEventTitle(event)} ${event?.type || ''} ${event?.event_type || ''}`.toLowerCase();
    if (label.includes('rent')) return '🏠';
    if (label.includes('payday') || label.includes('salary') || label.includes('income')) return '💰';
    if (label.includes('netflix') || label.includes('subscription') || label.includes('renew')) return '🔁';
    if (label.includes('tax') || label.includes('paye') || label.includes('kra')) return '🧾';
    if (label.includes('loan') || label.includes('debt')) return '💳';
    return event?.icon || '📅';
};

const formatEventTiming = (date) => {
    if (!date) return '';
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.round((target.getTime() - start.getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days > 1 && days < 31) return `In ${days} days`;
    if (days < 0) return 'Overdue';
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
};

const normalizeCalendarEvents = (calendar, today) => {
    const calendarEvents = Array.isArray(calendar) ? calendar : calendar?.events || calendar?.results || [];
    const reminders = today?.reminders || [];
    return [...calendarEvents, ...reminders]
        .map((event, index) => ({
            ...event,
            _key: event?.uuid || event?.id || `${getCalendarEventTitle(event)}-${index}`,
            _date: parseEventDate(event),
        }))
        .filter((event) => event._date)
        .sort((left, right) => left._date.getTime() - right._date.getTime())
        .filter((event, index, list) => index === list.findIndex((candidate) => (
            getCalendarEventTitle(candidate) === getCalendarEventTitle(event)
            && candidate._date.toDateString() === event._date.toDateString()
        )));
};

const MobileDashboardHome = ({
    aiInsights = [],
    ctaButtons = [],
    currentScore = 0,
    displayName = 'Member',
    hasData = false,
    healthAccess,
    live = {},
    onSelectSection,
    onUpgradePlan,
    palette,
    streakDays = 0,
    sync,
}) => {
    const [profileBannerVisible, setProfileBannerVisible] = useState(true);
    const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
    const [dailyAction, setDailyAction] = useState(null);
    const [todayMoney, setTodayMoney] = useState(null);
    const [moneyCalendar, setMoneyCalendar] = useState(null);
    const [todayError, setTodayError] = useState('');

    const refreshToday = useCallback(async () => {
        try {
            setTodayError('');
            const [today, calendar] = await Promise.all([
                getTodayMoney(),
                getMoneyCalendar().catch(() => null),
            ]);
            setTodayMoney(today);
            setMoneyCalendar(calendar);
        } catch (error) {
            console.error('Failed to load daily money dashboard:', error);
            setTodayError('Your daily tools could not refresh. Existing dashboard information is still shown.');
        }
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([getTodayMoney(), getMoneyCalendar().catch(() => null)])
            .then(([today, calendar]) => {
                if (!active) return;
                setTodayMoney(today);
                setMoneyCalendar(calendar);
            })
            .catch((error) => {
                console.error('Failed to load daily money dashboard:', error);
                if (active) setTodayError('Your daily tools could not refresh. Existing dashboard information is still shown.');
            });
        return () => { active = false; };
    }, []);

    const totalSpent = Math.max(0, toNumber(todayMoney?.spent_today ?? live.spent));
    const totalBudget = (live.raw?.budgets || []).reduce(
        (sum, budget) => sum + toNumber(
            budget?.budgeted_amount || budget?.allocated_amount || budget?.amount || budget?.target_amount
        ),
        0
    );
    const backendTarget = todayMoney?.daily_target;
    const spendTarget = backendTarget !== null && backendTarget !== undefined
        ? Math.max(toNumber(backendTarget), totalSpent)
        : Math.max(totalBudget || toNumber(live.income), totalSpent);
    const availableToSpend = todayMoney?.remaining_today !== null && todayMoney?.remaining_today !== undefined
        ? Math.max(toNumber(todayMoney.remaining_today), 0)
        : Math.max(spendTarget - totalSpent, 0);
    const spentPercent = spendTarget > 0 ? clamp(Math.round((totalSpent / spendTarget) * 100), 0, 100) : 0;
    const profileCompletion = clamp(Number(live.completion || 0), 0, 100);
    const spendState = totalSpent > spendTarget && spendTarget > 0
        ? { label: 'Over target', dot: 'bg-rose-500', shell: 'bg-rose-50 text-rose-700' }
        : spentPercent > 80
            ? { label: 'Watch it', dot: 'bg-amber-400', shell: 'bg-amber-50 text-amber-700' }
            : { label: 'On track', dot: 'bg-green-500', shell: 'bg-[#e2f5ec] text-[#2f9e6b]' };
    const insight = aiInsights[0];
    const canViewFinancialHealth = healthAccess?.allowed !== false;
    const effectiveStreak = toNumber(todayMoney?.streak?.current_streak ?? streakDays);
    const calendarEvents = normalizeCalendarEvents(moneyCalendar, todayMoney).slice(0, 4);
    const calendarMonth = (calendarEvents[0]?._date || new Date()).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

    const handleExpenseSaved = () => {
        setQuickExpenseOpen(false);
        sync?.refreshNow?.();
        refreshToday();
        window.dispatchEvent(new CustomEvent('healthRefreshRequested', {
            detail: { source: 'dashboard:quick-expense' },
        }));
    };

    const handleDailyActionSaved = () => {
        setDailyAction(null);
        refreshToday();
        sync?.refreshNow?.();
    };

    return (
        <div className="sm:hidden">
            <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f4f6f5] px-[22px] pb-28 pt-5 text-[#16302b]">
                <section>
                    <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.035em]">
                        {palette?.label || 'Welcome'} <span aria-hidden="true">👋</span>, {displayName}
                    </h1>
                    <p className="mt-0.5 text-[12px] text-[#4d5a56]">
                        Welcome — see how your money is working for you! <span aria-hidden="true">🚀</span>
                    </p>
                </section>

                {profileBannerVisible && profileCompletion < 100 && (
                    <section className="relative mt-8 overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,_#073f3f_0%,_#0c6060_48%,_#7c8e4d_100%)] px-4 pb-[14px] pt-4 text-white shadow-[0_8px_20px_-12px_rgba(15,40,35,0.35)]">
                        <button
                            type="button"
                            onClick={() => setProfileBannerVisible(false)}
                            className="absolute right-2.5 top-2.5 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                            aria-label="Dismiss profile reminder"
                        >
                            <X size={13} />
                        </button>
                        <p className="pr-7 text-[13px] font-medium leading-[1.5]">
                            Your profile is {profileCompletion}% complete. Finish it and set up your planners to unlock insights tailored to your life.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {ctaButtons.map((button) => (
                                <button
                                    key={button.id}
                                    type="button"
                                    onClick={() => onSelectSection(button.target)}
                                    className={button.primary
                                        ? 'rounded-full bg-[#eabb3a] px-[14px] py-[9px] text-[12px] font-bold text-[#2a1f04]'
                                        : 'rounded-full border border-white/40 bg-white/10 px-[14px] py-[9px] text-[12px] font-semibold text-white'}
                                >
                                    {button.label}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                <section className="mt-4 rounded-[20px] border border-[#e2e7e4] bg-white p-4 shadow-[0_8px_20px_-12px_rgba(15,40,35,0.22)]">
                    <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#4d5a56]">Financial Health</p>
                    <div className="mt-2 flex items-center gap-4">
                        <HealthRing score={canViewFinancialHealth ? currentScore : 0} />
                        <div className="min-w-0 flex-1">
                            <span className="inline-flex rounded-full bg-[#e2f5ec] px-2 py-1 text-[11px] font-semibold text-[#2f9e6b]">
                                {canViewFinancialHealth ? (hasData ? 'Score updated this month' : 'Add data to get scored') : 'Available on Plus & Pro'}
                            </span>
                            <p className="mt-3 text-[12px] leading-[1.45] text-[#4d5a56]">
                                {!canViewFinancialHealth
                                    ? 'Upgrade to unlock your live score, trends and personalized financial health guidance.'
                                    : hasData
                                    ? "You're building solid habits. Keep logging spend to lift your score."
                                    : 'Complete your profile and first planner to unlock a live financial health score.'}
                            </p>
                            {!canViewFinancialHealth && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button type="button" onClick={() => onUpgradePlan?.('plus')} className="rounded-full bg-[#eabb3a] px-3 py-2 text-[10px] font-bold text-[#2a1f04]">Upgrade to Plus</button>
                                    <button type="button" onClick={() => onUpgradePlan?.('pro')} className="rounded-full border border-[#0c6060] px-3 py-2 text-[10px] font-bold text-[#0c6060]">Upgrade to Pro</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <HealthChip color="bg-[#2f9e6b]" label="Spending" />
                        <HealthChip color="bg-[#eabb3a]" label="Savings" />
                        <HealthChip color="bg-[#7c8e4d]" label="Tax" />
                    </div>
                </section>

                <section className="mt-6">
                    <h2 className="text-[15px] font-bold">What would you like to do today?</h2>
                    <p className="mt-2 text-[12px] leading-relaxed text-[#4d5a56]">Powered by your Budget Planner, Tax Planner &amp; Shilingi Buddy.</p>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                        <QuickAction emoji="🗓️" label="Plan Your Day" onClick={() => setDailyAction('plan')} tone="bg-[#edf1df]" />
                        <QuickAction emoji="🧾" label="Track" onClick={() => setQuickExpenseOpen(true)} tone="bg-[#e4f0ee]" />
                        <QuickAction emoji="🛒" label="Shop" onClick={() => setDailyAction('shop')} tone="bg-[#dff2ea]" />
                        <QuickAction emoji="🔔" label="Remind" onClick={() => setDailyAction('remind')} tone="bg-[#fff1bc]" />
                        <QuickAction emoji="🤔" label="Can I Afford?" onClick={() => setDailyAction('afford')} tone="bg-[#f1e5f8]" />
                    </div>
                </section>

                {todayError && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">{todayError}</p>}

                <section className="mt-3 rounded-[20px] border border-[#e2e7e4] bg-white p-4 shadow-[0_8px_20px_-12px_rgba(15,40,35,0.22)]">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#4d5a56]">💰 Money Today</p>
                        <button type="button" onClick={() => setQuickExpenseOpen(true)} className="text-[12px] font-bold text-[#0c6060]">+ Log spend</button>
                    </div>
                    <p className="mt-1 text-[28px] font-extrabold leading-tight tracking-[-0.04em] text-[#0c6060]">{formatKes(availableToSpend)}</p>
                    <p className="mt-1 text-[12px] text-[#4d5a56]">
                        available to spend · Spent {formatKes(totalSpent)} of {formatKes(spendTarget)}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f4f6f5]">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,_#0c6060,_#2f9e6b)] transition-[width]" style={{ width: `${spentPercent}%` }} />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${spendState.shell}`}>
                            <span className={`h-2.5 w-2.5 rounded-full ${spendState.dot}`} />{spendState.label}
                        </span>
                        <span className="text-[10px] text-[#8a9490]">Updates with every expense</span>
                    </div>
                </section>

                <section className="mt-4 rounded-[20px] bg-[linear-gradient(135deg,_#0f4a4a,_#0c6060)] p-4 text-white">
                    <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#bfe3dd]">💡 Shilingi Insight</p>
                    <div className="mt-2 flex items-start gap-2.5">
                        <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#eabb3a] text-sm">🤖</span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[12px] leading-[1.5] text-[#eaf4f1]">
                                {insight?.description || 'Complete your first planner and Shilingi Buddy will surface a personalized next move here.'}
                            </p>
                            <button type="button" onClick={() => onSelectSection('budget')} className="mt-3 rounded-full bg-[#eabb3a] px-4 py-2 text-[12px] font-bold text-[#2a1f04]">Take action</button>
                        </div>
                    </div>
                </section>

                <section className="mt-3 rounded-[20px] border border-[#e2e7e4] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] font-bold">🔥 7-Day Money Streak</p>
                        <p className="text-[11px] font-semibold text-[#4d5a56]">{Math.min(effectiveStreak, 7)} of 7 days</p>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                        {Array.from({ length: 7 }, (_, index) => (
                            <span key={index} className={`flex h-7 flex-1 items-center justify-center rounded-lg border text-[11px] ${index < Math.min(effectiveStreak, 7) ? 'border-[#d6a521] bg-[#eabb3a] text-[#3a2c05]' : 'border-[#e7ebe9] bg-[#f4f6f5] text-[#8a9490]'}`}>
                                {index < Math.min(effectiveStreak, 7) ? '✓' : index + 1}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="mt-6">
                    <div className="flex items-end justify-between gap-3">
                        <div><h2 className="text-[15px] font-bold">Your Planners</h2><p className="mt-1 text-[11px] text-[#4d5a56]">Build your plan one move at a time.</p></div>
                        <button type="button" onClick={() => onSelectSection('budget')} className="text-[11px] font-bold text-[#0c6060]">View planners</button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <HubButton emoji="📊" label="Budget Planner" onClick={() => onSelectSection('budget')} />
                        <HubButton emoji="🧾" label="Tax Planner" onClick={() => onSelectSection('tax')} />
                    </div>
                </section>

                {!canViewFinancialHealth && (
                    <button
                        type="button"
                        onClick={() => onUpgradePlan?.('plus')}
                        className="mt-3 flex w-full items-center gap-3 rounded-[14px] border border-[#eabb3a] bg-[linear-gradient(120deg,_#fff8e6,_#fdeec4)] px-3.5 py-3 text-left"
                    >
                        <span className="flex shrink-0 -space-x-2" aria-hidden="true">
                            {['💳', '🛡️', '📈'].map((icon) => <span key={icon} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#fdeec4] bg-white text-xs">{icon}</span>)}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-bold text-[#5c4108]">More planners with Plus &amp; Pro</span>
                            <span className="mt-0.5 block text-[9px] leading-tight text-[#8a6d1c]">Debt, Protection, Net Worth, Investing, Retirement &amp; Market Watch</span>
                        </span>
                        <span className="rounded-full bg-[#eabb3a] px-3 py-2 text-[10px] font-extrabold text-[#2a1f04]">Explore ›</span>
                    </button>
                )}

                <section className="mt-6">
                    <h2 className="text-[15px] font-bold">Explore Your Hubs</h2>
                    <p className="mt-1 text-[11px] text-[#4d5a56]">Learn, compare and get the right tools.</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <HubButton emoji="🎓" label="Learning" onClick={() => onSelectSection('learninghub')} iconTone="bg-[#e4f0ee]" accent="border-b-[#0c6060]" />
                        <HubButton emoji="⚖️" label="Comparison" onClick={() => onSelectSection('comparehub')} iconTone="bg-[#fbf1de]" accent="border-b-[#eabb3a]" />
                        <HubButton emoji="🧰" label="Resources" onClick={() => onSelectSection('resourceshub')} iconTone="bg-[#eef1e2]" accent="border-b-[#7c8e4d]" />
                    </div>
                </section>

                <button
                    type="button"
                    onClick={() => onSelectSection('learninghub')}
                    className="mt-3 flex w-full items-center gap-3 rounded-[14px] border border-[#eabb3a] bg-[linear-gradient(120deg,_#fff8e6,_#fdeec4)] px-3.5 py-3 text-left shadow-[0_6px_18px_-10px_rgba(214,165,33,0.45)]"
                >
                    <span className="flex shrink-0 -space-x-2" aria-hidden="true">
                        {['📚', '🧮', '📊'].map((icon) => <span key={icon} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#fdeec4] bg-white text-xs">{icon}</span>)}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold text-[#5c4108]">See what&apos;s inside each hub</span>
                        <span className="mt-0.5 block text-[10px] leading-tight text-[#8a6d1c]">Articles, comparisons, calculators &amp; more</span>
                    </span>
                    <span className="rounded-full bg-[#eabb3a] px-3 py-2 text-[11px] font-extrabold text-[#2a1f04]">Explore ›</span>
                </button>

                <section className="mt-6">
                    <h2 className="text-[15px] font-bold">Community</h2>
                    <p className="mt-1 text-[12px] text-[#4d5a56]">You&apos;re not doing this alone.</p>
                    <button
                        type="button"
                        onClick={() => onSelectSection('communityhub')}
                        className="mt-3 flex w-full items-center gap-3 rounded-[14px] bg-[linear-gradient(120deg,_#073f3f,_#0c6060)] px-4 py-3.5 text-left text-white shadow-[0_8px_20px_-12px_rgba(15,40,35,0.35)]"
                    >
                        <span className="flex shrink-0 -space-x-2" aria-hidden="true">
                            {['A', 'M', 'W'].map((letter, index) => <span key={letter} className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#073f3f] text-[11px] font-bold ${['bg-[#eabb3a]', 'bg-[#0c6060]', 'bg-[#7c8e4d]'][index]}`}>{letter}</span>)}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-bold leading-tight">Members building better money habits</span>
                            <span className="mt-1 block text-[10px] leading-tight text-[#cfe4e0]">Monthly challenges · Success stories · Community support</span>
                        </span>
                        <span className="text-[#cfe4e0]" aria-hidden="true">›</span>
                    </button>
                </section>

                <section className="mt-6 pb-4">
                    <div className="flex items-end justify-between gap-3">
                        <div><h2 className="text-[15px] font-bold">Money Calendar</h2><p className="mt-1 text-[11px] text-[#4d5a56]">Nothing catches you off guard.</p></div>
                        <button type="button" onClick={() => setDailyAction('remind')} className="rounded-full bg-[#eabb3a] px-3.5 py-2 text-[11px] font-bold text-[#2a1f04]">+ Add event</button>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-[20px] border border-[#e2e7e4] bg-white px-4 pb-3 pt-4 shadow-[0_8px_20px_-12px_rgba(15,40,35,0.22)]">
                        <div className="flex items-center justify-between border-b border-[#e7ebe9] pb-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f6f5] text-[#68736f]" aria-hidden="true">‹</span>
                            <p className="text-[12px] font-bold">{calendarMonth}</p>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f6f5] text-[#68736f]" aria-hidden="true">›</span>
                        </div>
                        <div className="divide-y divide-[#edf0ee]">
                            {calendarEvents.map((event) => (
                                <CalendarRow
                                    key={event._key}
                                    emoji={getCalendarEventEmoji(event)}
                                    title={getCalendarEventTitle(event)}
                                    timing={formatEventTiming(event._date)}
                                    amount={event.amount ?? event.expected_amount ?? event.value}
                                />
                            ))}
                            {!calendarEvents.length && (
                                <button type="button" onClick={() => setDailyAction('remind')} className="w-full py-5 text-left text-[11px] leading-5 text-[#68736f]">
                                    No upcoming money events yet. Add rent, payday, subscriptions or tax deadlines and they will appear here.
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {quickExpenseOpen && (
                    <QuickExpenseModal onClose={() => setQuickExpenseOpen(false)} onSuccess={handleExpenseSaved} />
                )}
                {dailyAction && <DailyMoneyActionModal action={dailyAction} today={todayMoney} onClose={() => setDailyAction(null)} onSaved={handleDailyActionSaved} />}
            </div>
        </div>
    );
};

const QuickAction = ({ emoji, label, onClick, tone = 'bg-[#e4f0ee]' }) => (
    <button type="button" onClick={onClick} className="min-w-0 rounded-[14px] border border-[#e1e6e3] bg-white px-0.5 py-3 text-center shadow-[0_8px_20px_-16px_rgba(15,40,35,0.28)] transition active:scale-[0.98]">
        <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-[10px] text-base ${tone}`} aria-hidden="true">{emoji}</span>
        <span className="mt-2 block text-[9px] font-semibold leading-tight">{label}</span>
    </button>
);

const CalendarRow = ({ emoji, title, timing, amount }) => (
    <div className="flex min-h-[44px] items-center gap-2 py-2.5">
        <span className="w-5 shrink-0 text-sm" aria-hidden="true">{emoji}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{title}</span>
        <span className="shrink-0 text-[10px] text-[#4d5a56]">{timing}</span>
        {toNumber(amount) > 0 && <span className="min-w-[72px] shrink-0 text-right text-[10px] font-bold text-[#0c6060]">{formatKes(amount)}</span>}
    </div>
);

const HubButton = ({ emoji, label, onClick, iconTone = 'bg-[#e4f0ee]', accent = 'border-b-[#0c6060]' }) => (
    <button type="button" onClick={onClick} className={`rounded-[14px] border border-b-[3px] border-[#e7ebe9] bg-white px-2 py-3 text-center ${accent}`}>
        <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${iconTone}`} aria-hidden="true">{emoji}</span>
        <span className="mt-2 block text-[11px] font-semibold">{label}</span>
    </button>
);

const HealthChip = ({ color, label }) => (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#f4f6f5] px-2 py-2 text-[10px] font-semibold text-[#16302b]">
        <span className={`h-2 w-2 rounded-full ${color}`} />{label}
    </span>
);

const HealthRing = ({ score }) => {
    const safeScore = clamp(Number(score || 0), 0, 100);
    const radius = 38;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative h-[92px] w-[92px] shrink-0">
            <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
                <circle cx="46" cy="46" r={radius} fill="none" stroke="#eaeeec" strokeWidth="9" />
                <circle cx="46" cy="46" r={radius} fill="none" stroke="#16856c" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (safeScore / 100) * circumference} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-extrabold leading-none">{Math.round(safeScore)}</span>
                <span className="mt-1 text-[10px] text-[#8a9490]">/ 100</span>
            </div>
        </div>
    );
};

export default MobileDashboardHome;
