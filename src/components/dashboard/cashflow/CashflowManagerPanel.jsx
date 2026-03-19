import React from 'react';
import { ArrowRight, Briefcase, CircleDollarSign, ReceiptText, ShieldCheck } from 'lucide-react';
import CashflowSummaryCards from './CashflowSummaryCards';

const emptySummary = {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netCashflow: 0,
    entriesTracked: 0,
};

const readinessSteps = [
    'Add live cash flow endpoints to the Railway Swagger schema.',
    'Confirm the income and expense request fields the frontend should send.',
    'Confirm the response shape for list, create, update, delete, and summary.',
    'Connect this workspace to the real API the same way we did with debt.',
];

const CashflowManagerPanel = () => {
    return (
        <div className="space-y-6">
            <CashflowSummaryCards summary={emptySummary} />

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="rounded-3xl bg-primary-50 p-4 text-primary-700">
                            <CircleDollarSign size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Cash flow workspace</p>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">See what is coming in, what is going out, and what is left to work with.</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                This section is ready on the frontend, but the live cash flow API routes are not yet published in the Railway Swagger schema. As soon as those routes are exposed, we can connect this page and begin tracking income and expenses end to end.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <FeatureCard
                            icon={Briefcase}
                            title="Income tracking"
                            text="Record salary, business income, side hustles, and other inflows in one place so your monthly picture stays clear."
                        />
                        <FeatureCard
                            icon={ReceiptText}
                            title="Expense tracking"
                            text="Capture spending clearly so you can understand your habits, protect priorities, and free up room for savings and debt reduction."
                        />
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                            <div>
                                <h3 className="font-bold text-emerald-900">Good foundation in place</h3>
                                <p className="mt-2 text-sm leading-6 text-emerald-800">
                                    Your auth flow and debt module are already working. That gives us a secure pattern to reuse once the backend team publishes the cash flow endpoints.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Next integration steps</p>
                        <div className="mt-5 space-y-4">
                            {readinessSteps.map((step, index) => (
                                <div key={step} className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                                        {index + 1}
                                    </div>
                                    <p className="pt-1 text-sm leading-6 text-slate-600">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <ArrowRight className="mt-1 h-5 w-5 text-slate-600" />
                            <div>
                                <h3 className="font-bold text-slate-900">What we will plug in next</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Once Swagger exposes the cash flow contract, we will add a `cashflowApi.js` service, connect summary cards to live totals, and wire create, edit, and delete flows into this module.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, text }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="inline-flex rounded-2xl bg-white p-3 text-primary-700 shadow-sm">
            <Icon size={20} />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
);

export default CashflowManagerPanel;
