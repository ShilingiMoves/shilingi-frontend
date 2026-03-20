import React from 'react';

const flowSteps = [
    {
        title: 'Income gives the month its foundation',
        description: 'Salary, business income, rent, gifts, and one-time payments help define the financial room you have to work with each month.',
    },
    {
        title: 'Reliable inflow builds confidence',
        description: 'When you can clearly see what is coming in and how often it arrives, it becomes easier to plan, save, and avoid financial surprises.',
    },
    {
        title: 'Your income pattern becomes clearer',
        description: 'Shilingi Moves turns your income history into trends, recurring signals, and monthly totals that help you plan ahead with more confidence.',
    },
    {
        title: 'Strong inflow supports bigger goals',
        description: 'A more stable income picture gives you a stronger base for saving, managing debt, and building long-term financial strength.',
    },
];

const integrationPoints = [
    'Clear income visibility helps you judge whether your month is stable or strained.',
    'Recurring income patterns make planning easier and reduce guesswork.',
    'Over time, this picture will support bigger financial decisions across the platform.',
];

const CashflowIntegrationCard = () => {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Money flow guidance</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">A clearer view of how your money behaves each month</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                This workspace helps you understand the strength, timing, and consistency of your income so you can make smarter monthly decisions
                with more clarity and less guesswork.
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {flowSteps.map((step) => (
                    <div key={step.title} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                        <h4 className="text-base font-bold text-slate-950">{step.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Why this matters</p>
                <div className="mt-4 space-y-3">
                    {integrationPoints.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            <p className="text-sm leading-6 text-slate-100">{point}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CashflowIntegrationCard;
