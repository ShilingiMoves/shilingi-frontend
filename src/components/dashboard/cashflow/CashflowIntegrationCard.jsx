import React from 'react';

const focusPoints = [
    'See which income sources are carrying your month.',
    'Understand whether your inflow feels steady or uneven.',
    'Use that clarity to plan your next financial move with more confidence.',
];

const CashflowIntegrationCard = () => {
    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Income focus</p>
                    <h3 className="mt-3 text-2xl font-extrabold text-slate-950">Know what is supporting your month.</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                        This view helps you stay close to the income patterns shaping your financial stability, so planning ahead feels calmer and more intentional.
                    </p>
                </div>

                <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-emerald-900 lg:max-w-xs">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">What to watch</p>
                    <p className="mt-2 text-sm leading-6">
                        Look for consistency, not just size. Reliable income often gives you more planning power than occasional spikes.
                    </p>
                </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
                {focusPoints.map((point) => (
                    <div key={point} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-700">
                        {point}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CashflowIntegrationCard;
