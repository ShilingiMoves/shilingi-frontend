import React from 'react';

const flowSteps = [
    {
        title: '1. Record income here',
        description: 'Salary, business income, rent, gifts, and one-time money coming in belong in the Cash Flow module.',
    },
    {
        title: '2. Expenses sync from Budget',
        description: 'Spending is tracked in the Budget module, then reflected here so cash flow stays connected to how money is actually used.',
    },
    {
        title: '3. We calculate your position',
        description: 'Shilingi Moves turns income and expenses into net cash flow, savings rate, and monthly trend signals.',
    },
    {
        title: '4. It feeds bigger money decisions',
        description: 'Your cash flow helps power debt planning, future net worth growth, and your overall financial health view.',
    },
];

const integrationPoints = [
    'Expenses are pulled from the Budget module.',
    'Surplus cash can later support savings goals and debt reduction.',
    'Cash flow performance will feed Net Worth and Financial Health scoring.',
];

const CashflowIntegrationCard = () => {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">How cash flow works</p>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Built around the real Shilingi Moves money flow</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                This workspace follows the platform flow your backend team documented: income starts here, expenses come from Budget,
                and the combined picture helps guide savings, debt reduction, and overall financial health.
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
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Integration points</p>
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
