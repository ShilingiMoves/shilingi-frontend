import React, { useState } from 'react';

const comparisonTabs = ['Savings & MMFs', 'T-Bills & Bonds', 'SACCOs', 'Loans', 'Insurance'];

const tableRows = [
    { product: 'Money Market Fund', provider: 'CIC Asset Managers', rate: '14.8%', min: 'KES 1,000', risk: 'Very Low', action: 'Invest' },
    { product: '91-Day T-Bill', provider: 'Central Bank of Kenya', rate: '16.2%', min: 'KES 100,000', risk: 'Zero Risk', action: 'Best Rate' },
    { product: 'KCB Savings Account', provider: 'KCB Bank', rate: '4.5%', min: 'KES 0', risk: 'Very Low', action: 'View' },
    { product: 'Stima DT SACCO', provider: 'Stima Sacco Society', rate: '12.5%', min: 'KES 500', risk: 'Low', action: 'View' },
    { product: 'Britam Bond Fund', provider: 'Britam Asset Managers', rate: '13.1%', min: 'KES 5,000', risk: 'Low-Med', action: 'View' },
];

const ComparisonHubPanel = () => {
    const [activeTab, setActiveTab] = useState(comparisonTabs[0]);

    return (
        <div className="space-y-4">
            <section className="rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white shadow-sm">
                <h2 className="text-3xl font-extrabold tracking-tight">Comparison Hub</h2>
                <p className="mt-1 text-sm text-white/85">Compare savings, investment and loan products across Kenya.</p>
            </section>

            <div className="inline-flex flex-wrap rounded-xl border border-emerald-100 bg-white p-1">
                {comparisonTabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <section className="rounded-[1.25rem] border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-950">Best {activeTab} Rates</h3>
                    <p className="text-xs text-slate-500">Updated: 8 Mar 2026</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-[0.15em] text-slate-500">
                                <th className="py-2 pr-3">Product</th>
                                <th className="py-2 pr-3">Provider</th>
                                <th className="py-2 pr-3">Rate (p.a.)</th>
                                <th className="py-2 pr-3">Min. Amt</th>
                                <th className="py-2 pr-3">Risk</th>
                                <th className="py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, index) => (
                                <tr key={`${row.product}-${index}`} className={`border-b border-slate-100 ${index === 1 ? 'bg-amber-50/60' : ''}`}>
                                    <td className="py-2.5 pr-3 font-medium text-slate-900">{row.product}</td>
                                    <td className="py-2.5 pr-3 text-slate-700">{row.provider}</td>
                                    <td className="py-2.5 pr-3 font-extrabold text-primary-700">{row.rate}</td>
                                    <td className="py-2.5 pr-3 text-slate-700">{row.min}</td>
                                    <td className="py-2.5 pr-3">
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{row.risk}</span>
                                    </td>
                                    <td className="py-2.5">
                                        <button type="button" className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${row.action === 'Best Rate' ? 'bg-amber-400 text-slate-950' : 'border border-slate-200 bg-white text-slate-700'}`}>
                                            {row.action}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default ComparisonHubPanel;
