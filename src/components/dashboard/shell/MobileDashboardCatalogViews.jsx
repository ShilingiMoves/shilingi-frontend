import React from 'react';
import { ArrowLeft, ChevronRight, LockKeyhole } from 'lucide-react';

const planners = [
    { id: 'budget', name: 'Budget Planner', emoji: '📊', description: 'Plan and track monthly spending', minimumTier: 'BASIC' },
    { id: 'tax', name: 'Tax Planner', emoji: '🧾', description: 'Estimate PAYE and understand your payslip', minimumTier: 'BASIC' },
    { id: 'debt', name: 'Debt Manager', emoji: '💳', description: 'Track loans and build a payoff plan', minimumTier: 'PLUS' },
    { id: 'protection', name: 'Protection Planner', emoji: '🛡️', description: 'Right-size your insurance cover', minimumTier: 'PLUS' },
    { id: 'networth', name: 'Net Worth Tracker', emoji: '📈', description: 'Track assets minus liabilities over time', minimumTier: 'PLUS' },
    { id: 'investments', name: 'Investment Planner', emoji: '💹', description: 'Build and track your portfolio', minimumTier: 'PRO' },
    { id: 'retirement', name: 'Retirement Planner', emoji: '🏖️', description: 'Project and plan your retirement pot', minimumTier: 'PRO' },
    { id: 'marketwatch', name: 'Market Watch', emoji: '📉', description: 'Follow market data and trends', minimumTier: 'PRO' },
];

const hubs = [
    {
        id: 'learninghub',
        emoji: '🎓',
        name: 'Learning Hub',
        description: 'Beginner lessons on budgeting and tax',
        tags: ['Articles', 'Videos', 'Quizzes', 'Games', 'Learning paths'],
        accent: 'border-t-[#0c6060]',
        iconTone: 'bg-[#e4f0ee]',
        tagTone: 'bg-[#e4f0ee] text-[#0c6060]',
        buttonTone: 'bg-[#0c6060] text-white',
    },
    {
        id: 'comparehub',
        emoji: '⚖️',
        name: 'Comparison Hub',
        description: 'Compare financial products side by side',
        tags: ['Chama', 'Sacco', 'Bank', 'Microfinance', 'MMFs', 'Money transfer'],
        accent: 'border-t-[#eabb3a]',
        iconTone: 'bg-[#fbf1de]',
        tagTone: 'bg-[#fbf1de] text-[#c8891c]',
        buttonTone: 'bg-[#eabb3a] text-[#2a1f04]',
    },
    {
        id: 'resourceshub',
        emoji: '🧰',
        name: 'Resources & Tools',
        description: 'Calculators and beginner reading',
        tags: ['Savings calculator', 'Emergency fund', 'PAYE calculator', 'Beginner books'],
        accent: 'border-t-[#7c8e4d]',
        iconTone: 'bg-[#eef1e2]',
        tagTone: 'bg-[#eef1e2] text-[#617039]',
        buttonTone: 'bg-[#7c8e4d] text-white',
    },
];

const tierPrice = { PLUS: 'KES 499/mo', PRO: 'KES 699/mo' };

export const MobilePlannersView = ({ accessBySection = {}, currentTier = 'BASIC', onBack, onSelectSection }) => {
    const isAllowed = (planner) => accessBySection?.[planner.id]?.allowed !== false;
    const activePlanners = planners.filter(isAllowed);
    const lockedPlus = planners.filter((planner) => !isAllowed(planner) && planner.minimumTier === 'PLUS');
    const lockedPro = planners.filter((planner) => !isAllowed(planner) && planner.minimumTier === 'PRO');

    return (
        <MobileCatalogShell
            emoji="📊"
            title="Planners"
            description="Eight planners that grow with you — from your first budget to long-term wealth."
            onBack={onBack}
        >
            <PlannerGroup
                title={`Active on ${String(currentTier || 'BASIC').toUpperCase()}`}
                planners={activePlanners}
                onSelectSection={onSelectSection}
            />
            <PlannerGroup
                title="Unlock with Shilingi Plus"
                badge={tierPrice.PLUS}
                planners={lockedPlus}
                onSelectSection={onSelectSection}
                locked
            />
            <PlannerGroup
                title="Unlock with Shilingi Pro"
                badge={tierPrice.PRO}
                planners={lockedPro}
                onSelectSection={onSelectSection}
                locked
            />
        </MobileCatalogShell>
    );
};

export const MobileHubsView = ({ onBack, onSelectSection }) => (
    <MobileCatalogShell
        emoji="🧭"
        title="Hubs"
        description="Learn, compare and get the right tools — all in one place."
        onBack={onBack}
    >
        <div className="space-y-3 px-4 py-4">
            {hubs.map((hub) => (
                <article key={hub.id} className={`rounded-[20px] border border-t-[3px] border-[#e7ebe9] bg-white p-4 shadow-[0_8px_20px_-16px_rgba(15,40,35,0.28)] ${hub.accent}`}>
                    <div className="flex items-center gap-3">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${hub.iconTone}`} aria-hidden="true">{hub.emoji}</span>
                        <div className="min-w-0">
                            <h2 className="text-[14px] font-bold text-[#16302b]">{hub.name}</h2>
                            <p className="mt-0.5 text-[11px] text-[#4d5a56]">{hub.description}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {hub.tags.map((tag) => <span key={tag} className={`rounded-full border border-[#e7ebe9] px-2.5 py-1.5 text-[10px] font-semibold ${hub.tagTone}`}>{tag}</span>)}
                    </div>
                    <button type="button" onClick={() => onSelectSection(hub.id)} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[12px] font-bold ${hub.buttonTone}`}>
                        Open {hub.name}<ChevronRight size={15} />
                    </button>
                </article>
            ))}
        </div>
    </MobileCatalogShell>
);

const MobileCatalogShell = ({ emoji, title, description, onBack, children }) => (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f4f6f5] pb-24 text-[#16302b] sm:hidden">
        <header className="bg-[linear-gradient(120deg,_#073f3f,_#0c6060_58%,_#7c8e4d)] px-[22px] pb-6 pt-5 text-white">
            <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-[11px] font-semibold hover:bg-white/25">
                <ArrowLeft size={14} />Back to Home
            </button>
            <h1 className="mt-4 text-[22px] font-extrabold"><span aria-hidden="true">{emoji}</span> {title}</h1>
            <p className="mt-1 text-[12px] leading-5 text-[#dcece8]">{description}</p>
        </header>
        {children}
    </div>
);

const PlannerGroup = ({ title, badge, planners: groupPlanners, locked = false, onSelectSection }) => {
    if (!groupPlanners.length) return null;

    return (
        <section className="px-4 pt-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-[13px] font-bold">{locked ? '🔓 ' : '✅ '}{title}</h2>
                {badge && <span className="rounded-full bg-[#fbf1de] px-2.5 py-1 text-[10px] font-bold text-[#c8891c]">{badge}</span>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
                {groupPlanners.map((planner) => (
                    <button
                        key={planner.id}
                        type="button"
                        onClick={() => onSelectSection(planner.id)}
                        className={`relative min-h-[132px] rounded-[14px] border p-3 text-left shadow-[0_8px_20px_-16px_rgba(15,40,35,0.28)] ${locked ? 'border-dashed border-[#c9d2ce] bg-[#f7f8f7]' : 'border-[#e7ebe9] bg-white'}`}
                    >
                        {locked && <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#e7ebe9] bg-white text-[#8a9490]"><LockKeyhole size={12} /></span>}
                        <span className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-base ${locked ? 'bg-[#e6e9e7] grayscale' : 'bg-[#e4f0ee]'}`} aria-hidden="true">{planner.emoji}</span>
                        <span className={`mt-2 block text-[12px] font-bold ${locked ? 'text-[#4d5a56]' : 'text-[#16302b]'}`}>{planner.name}</span>
                        <span className="mt-1 block text-[10px] leading-4 text-[#6e7e76]">{planner.description}</span>
                        <span className={`mt-2 block text-[10px] font-bold ${locked ? 'text-[#c8891c]' : 'text-[#2f9e6b]'}`}>{locked ? `${planner.minimumTier} required` : 'Open planner'}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};
