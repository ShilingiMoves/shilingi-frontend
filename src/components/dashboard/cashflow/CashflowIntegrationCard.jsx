import React from 'react';

const flowSteps = [
    {
        title: 'Income gives the month its foundation',
        description: 'Salary, business income, rent, gifts, and one-time payments help define the financial room you have to work with each month.',
    },
    {
        title: 'Spending reveals where your money is going',
        description: 'Your expenses flow in from the Budget module so this view always reflects how your money is being used in real life.',
    },
    {
        title: 'Your monthly position becomes clear',
        description: 'Shilingi Moves turns income and spending into net cash flow, savings rate, and trend signals that help you act early.',
    },
    {
        title: 'Strong cash flow supports bigger goals',
        description: 'A healthier monthly balance gives you more room to save, reduce debt steadily, and build long-term financial strength.',
    },
];

const integrationPoints = [
    'Expenses are reflected here from your Budget activity.',
    'A monthly surplus can strengthen savings goals and debt progress.',
    'Over time, this picture will support net worth and financial health insights.',
];

const CashflowIntegrationCard = () => {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Money flow guidance</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">A clearer view of how your money behaves each month</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                This workspace brings together what you earn and what you spend so you can quickly see whether your month is giving you
                breathing room, asking for adjustments, or creating opportunities to move faster toward your goals.
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
