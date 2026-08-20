import React, { useState } from 'react';
import { X } from 'lucide-react';
import QuickExpenseModal from '../budget/QuickExpenseModal';

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatKes = (value) => `KES ${Math.round(toNumber(value)).toLocaleString('en-KE')}`;

const MobileDashboardHome = ({
    aiInsights = [],
    ctaButtons = [],
    currentScore = 0,
    displayName = 'Member',
    hasData = false,
    healthAccess,
    live = {},
    onSelectSection,
    palette,
    streakDays = 0,
    sync,
}) => {
    const [profileBannerVisible, setProfileBannerVisible] = useState(true);
    const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
    const totalSpent = Math.max(0, toNumber(live.spent));
    const totalBudget = (live.raw?.budgets || []).reduce(
        (sum, budget) => sum + toNumber(
            budget?.budgeted_amount || budget?.allocated_amount || budget?.amount || budget?.target_amount
        ),
        0
    );
    const spendTarget = Math.max(totalBudget || toNumber(live.income), totalSpent);
    const availableToSpend = Math.max(spendTarget - totalSpent, 0);
    const spentPercent = spendTarget > 0 ? clamp(Math.round((totalSpent / spendTarget) * 100), 0, 100) : 0;
    const profileCompletion = clamp(Number(live.completion || 0), 0, 100);
    const spendState = totalSpent > spendTarget && spendTarget > 0
        ? { label: 'Over target', dot: 'bg-rose-500', shell: 'bg-rose-50 text-rose-700' }
        : spentPercent > 80
            ? { label: 'Watch it', dot: 'bg-amber-400', shell: 'bg-amber-50 text-amber-700' }
            : { label: 'On track', dot: 'bg-green-500', shell: 'bg-[#e2f5ec] text-[#2f9e6b]' };
    const insight = aiInsights[0];
    const canViewFinancialHealth = healthAccess?.allowed !== false;
    const displayedHealthScore = canViewFinancialHealth ? currentScore : 0;
    const healthPlan = healthAccess?.minimumTier || 'PLUS';

    const handleExpenseSaved = () => {
        setQuickExpenseOpen(false);
        sync?.refreshNow?.();
        window.dispatchEvent(new CustomEvent('healthRefreshRequested', {
            detail: { source: 'dashboard:quick-expense' },
        }));
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

                <section className="mt-3 rounded-[20px] border border-[#e2e7e4] bg-white p-4 shadow-[0_8px_20px_-12px_rgba(15,40,35,0.22)]">
                    <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#4d5a56]">Financial Health</p>
                    <div className="mt-2 flex items-center gap-4">
                        <HealthRing score={displayedHealthScore} />
                        <div className="min-w-0 flex-1">
                            <span className="inline-flex rounded-full bg-[#e2f5ec] px-2 py-1 text-[11px] font-semibold text-[#2f9e6b]">
                                {canViewFinancialHealth
                                    ? (hasData ? 'Score updated this month' : 'Add data to get scored')
                                    : `Available on ${healthPlan}`}
                            </span>
                            <p className="mt-3 text-[12px] leading-[1.45] text-[#4d5a56]">
                                {!canViewFinancialHealth
                                    ? 'Upgrade and complete more planners to unlock your personalized financial health score.'
                                    : hasData
                                    ? "You're building solid habits. Keep logging spend to lift your score."
                                    : 'Complete your profile and first planner to unlock a live financial health score.'}
                            </p>
                            {!canViewFinancialHealth && (
                                <button
                                    type="button"
                                    onClick={() => onSelectSection('health')}
                                    className="mt-3 rounded-full bg-[#eabb3a] px-3 py-2 text-[11px] font-bold text-[#2a1f04]"
                                >
                                    Upgrade to {healthPlan}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

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

                <section className="mt-6">
                    <h2 className="text-[15px] font-bold">What would you like to do today?</h2>
                    <p className="mt-2 text-[12px] text-[#4d5a56]">Small daily moves that build lasting money habits.</p>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        <QuickAction emoji="🧾" label="Log an Expense" onClick={() => setQuickExpenseOpen(true)} />
                        <QuickAction emoji="🛒" label="Shopping List" onClick={() => onSelectSection('budget')} />
                        <QuickAction emoji="🪙" label="Round-Up & Save" onClick={() => onSelectSection('user')} />
                        <QuickAction
                            emoji="🤖"
                            label="Ask Shilingi Buddy"
                            onClick={() => window.dispatchEvent(new CustomEvent('shilingi-buddy-open'))}
                        />
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
                        <p className="text-[11px] font-semibold text-[#4d5a56]">{Math.min(streakDays, 7)} of 7 days</p>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                        {Array.from({ length: 7 }, (_, index) => (
                            <span key={index} className={`flex h-7 flex-1 items-center justify-center rounded-lg border text-[11px] ${index < Math.min(streakDays, 7) ? 'border-[#d6a521] bg-[#eabb3a] text-[#3a2c05]' : 'border-[#e7ebe9] bg-[#f4f6f5] text-[#8a9490]'}`}>
                                {index < Math.min(streakDays, 7) ? '✓' : index + 1}
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

                <section className="mt-6 pb-4">
                    <h2 className="text-[15px] font-bold">Explore Your Hubs</h2>
                    <p className="mt-1 text-[11px] text-[#4d5a56]">Learn, compare and get the right tools.</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <HubButton emoji="🎓" label="Learning" onClick={() => onSelectSection('learninghub')} />
                        <HubButton emoji="⚖️" label="Comparison" onClick={() => onSelectSection('comparehub')} />
                        <HubButton emoji="🧰" label="Resources" onClick={() => onSelectSection('resourceshub')} />
                    </div>
                </section>

                {quickExpenseOpen && (
                    <QuickExpenseModal onClose={() => setQuickExpenseOpen(false)} onSuccess={handleExpenseSaved} />
                )}
            </div>
        </div>
    );
};

const QuickAction = ({ emoji, label, onClick }) => (
    <button type="button" onClick={onClick} className="min-w-0 rounded-[14px] border border-[#e7ebe9] bg-white px-1 py-3 text-center shadow-[0_8px_20px_-16px_rgba(15,40,35,0.28)]">
        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#e4f0ee] text-base" aria-hidden="true">{emoji}</span>
        <span className="mt-2 block text-[9px] font-semibold leading-tight">{label}</span>
    </button>
);

const HubButton = ({ emoji, label, onClick }) => (
    <button type="button" onClick={onClick} className="rounded-[14px] border border-[#e7ebe9] bg-white px-2 py-3 text-center">
        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#e4f0ee]" aria-hidden="true">{emoji}</span>
        <span className="mt-2 block text-[11px] font-semibold">{label}</span>
    </button>
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
