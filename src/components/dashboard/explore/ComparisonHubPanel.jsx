import React, { useMemo, useState } from 'react';
import {
    ArrowRight,
    Banknote,
    Building2,
    Landmark,
    PiggyBank,
    Shield,
    WalletCards,
} from 'lucide-react';

const comparisonTabs = [
    { id: 'loans', label: 'Loans', icon: WalletCards },
    { id: 'savings', label: 'Savings & MMFs', icon: PiggyBank },
    { id: 'investments', label: 'Investments', icon: ArrowRight },
    { id: 'banking', label: 'Banking', icon: Building2 },
    { id: 'transfers', label: 'Money Transfers', icon: Banknote },
    { id: 'retirement', label: 'Retirement', icon: Landmark },
    { id: 'mortgage', label: 'Mortgage', icon: Building2 },
    { id: 'insurance', label: 'Insurance', icon: Shield },
];

const comparisonData = {
    loans: {
        title: 'Personal Loans - Best Rates',
        subtitle: '8 providers compared',
        columns: ['Provider', 'Product', 'Rate (p.a.)', 'Max Amount', 'Tenure', 'Risk', 'Action'],
        rows: [
            { provider: 'KCB Bank', product: 'Personal Loan', rate: '13.5%', maxAmount: 'KES 5M', tenure: 'Up to 5 yrs', risk: 'Low', action: 'Apply', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'Equity Bank', product: 'EazzyLoan', rate: '14.0%', maxAmount: 'KES 3M', tenure: 'Up to 3 yrs', risk: 'Low-Med', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-blue-50 text-blue-700' },
            { provider: 'Stima SACCO', product: 'Super Loan', rate: '12.5%', maxAmount: 'KES 2M', tenure: 'Up to 4 yrs', risk: 'Low', action: 'View', rateTone: 'text-amber-500', riskTone: 'bg-amber-50 text-amber-700' },
            { provider: 'M-Pesa Fuliza', product: 'Overdraft', rate: '7.5% /mo', maxAmount: 'KES 70K', tenure: 'Revolving', risk: 'High', action: 'View', rateTone: 'text-rose-500', riskTone: 'bg-rose-50 text-rose-700' },
            { provider: 'Branch App', product: 'Personal Loan', rate: '18-36%', maxAmount: 'KES 300K', tenure: 'Up to 1 yr', risk: 'High', action: 'View', rateTone: 'text-rose-500', riskTone: 'bg-rose-50 text-rose-700' },
        ],
    },
    savings: {
        title: 'Savings & Money Market Rates',
        subtitle: '6 providers compared',
        columns: ['Provider', 'Product', 'Rate (p.a.)', 'Min Amount', 'Liquidity', 'Risk', 'Action'],
        rows: [
            { provider: 'CIC Asset Managers', product: 'Money Market Fund', rate: '14.8%', maxAmount: 'KES 1,000', tenure: 'Same day', risk: 'Very Low', action: 'Invest', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'CBK', product: '91-Day T-Bill', rate: '16.2%', maxAmount: 'KES 100,000', tenure: '91 days', risk: 'Zero Risk', action: 'Best Rate', rateTone: 'text-primary-700', riskTone: 'bg-cyan-50 text-cyan-700' },
            { provider: 'KCB Bank', product: 'Savings Account', rate: '4.5%', maxAmount: 'KES 0', tenure: 'Instant', risk: 'Very Low', action: 'View', rateTone: 'text-slate-900', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'Stima DT SACCO', product: 'Savings Plan', rate: '12.5%', maxAmount: 'KES 500', tenure: 'Flexible', risk: 'Low', action: 'View', rateTone: 'text-violet-600', riskTone: 'bg-amber-50 text-amber-700' },
        ],
    },
    investments: {
        title: 'Investment Options - Curated Picks',
        subtitle: '5 products compared',
        columns: ['Provider', 'Product', 'Return', 'Minimum', 'Duration', 'Risk', 'Action'],
        rows: [
            { provider: 'Britam', product: 'Balanced Fund', rate: '13.1%', maxAmount: 'KES 5,000', tenure: '3-5 yrs', risk: 'Low-Med', action: 'Explore', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-amber-50 text-amber-700' },
            { provider: 'Old Mutual', product: 'Equity Fund', rate: '15.4%', maxAmount: 'KES 2,000', tenure: '5+ yrs', risk: 'Medium', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-blue-50 text-blue-700' },
            { provider: 'CBK', product: 'Infrastructure Bond', rate: '15.8%', maxAmount: 'KES 100,000', tenure: 'Long-term', risk: 'Low', action: 'View', rateTone: 'text-amber-500', riskTone: 'bg-emerald-50 text-emerald-700' },
        ],
    },
    banking: {
        title: 'Banking Products - Everyday Value',
        subtitle: '5 banks compared',
        columns: ['Provider', 'Product', 'Rate / Fee', 'Minimum', 'Access', 'Risk', 'Action'],
        rows: [
            { provider: 'NCBA', product: 'Current Account', rate: 'KES 0-500', maxAmount: 'KES 0', tenure: 'Branch + App', risk: 'Low', action: 'Open', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'Absa', product: 'Savings Account', rate: '3.5%', maxAmount: 'KES 0', tenure: 'App first', risk: 'Low', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'I&M', product: 'Salary Account', rate: 'KES 0', maxAmount: 'KES 0', tenure: 'Digital + branch', risk: 'Low', action: 'View', rateTone: 'text-slate-900', riskTone: 'bg-emerald-50 text-emerald-700' },
        ],
    },
    transfers: {
        title: 'Money Transfer Options',
        subtitle: '4 transfer rails compared',
        columns: ['Provider', 'Product', 'Fee', 'Limit', 'Speed', 'Risk', 'Action'],
        rows: [
            { provider: 'M-Pesa', product: 'Send Money', rate: 'KES 0-105', maxAmount: 'KES 500K', tenure: 'Instant', risk: 'Low', action: 'Use', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'Pesalink', product: 'Bank Transfer', rate: 'KES 30-78', maxAmount: 'KES 999K', tenure: 'Near instant', risk: 'Low', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'Wise', product: 'International', rate: 'Varies', maxAmount: 'By corridor', tenure: 'Same day', risk: 'Low-Med', action: 'View', rateTone: 'text-amber-500', riskTone: 'bg-blue-50 text-blue-700' },
        ],
    },
    retirement: {
        title: 'Retirement Products - Pension Options',
        subtitle: '4 pension products compared',
        columns: ['Provider', 'Product', 'Projected Return', 'Minimum', 'Access', 'Risk', 'Action'],
        rows: [
            { provider: 'Old Mutual', product: 'Mutual Pension', rate: '13.2%', maxAmount: 'KES 2,000', tenure: 'Long-term', risk: 'Low-Med', action: 'Compare', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-amber-50 text-amber-700' },
            { provider: 'Britam', product: 'Pension Plan', rate: '12.8%', maxAmount: 'KES 1,000', tenure: 'Long-term', risk: 'Low-Med', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-amber-50 text-amber-700' },
            { provider: 'NSSF', product: 'Tier II', rate: 'Fixed', maxAmount: 'Payroll-based', tenure: 'Long-term', risk: 'Low', action: 'View', rateTone: 'text-amber-500', riskTone: 'bg-emerald-50 text-emerald-700' },
        ],
    },
    mortgage: {
        title: 'Mortgage Products - Home Finance',
        subtitle: '4 lenders compared',
        columns: ['Provider', 'Product', 'Rate', 'Max Amount', 'Tenure', 'Risk', 'Action'],
        rows: [
            { provider: 'HF Group', product: 'Owner Occupier', rate: '12.5%', maxAmount: 'KES 20M', tenure: 'Up to 25 yrs', risk: 'Medium', action: 'Apply', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-blue-50 text-blue-700' },
            { provider: 'KCB', product: 'Home Loan', rate: '13.0%', maxAmount: 'KES 25M', tenure: 'Up to 20 yrs', risk: 'Medium', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-blue-50 text-blue-700' },
            { provider: 'Absa', product: 'Mortgage', rate: '12.9%', maxAmount: 'KES 30M', tenure: 'Up to 25 yrs', risk: 'Medium', action: 'View', rateTone: 'text-amber-500', riskTone: 'bg-blue-50 text-blue-700' },
        ],
    },
    insurance: {
        title: 'Insurance Products - Protection Options',
        subtitle: '5 providers compared',
        columns: ['Provider', 'Product', 'Premium', 'Cover', 'Tenure', 'Risk', 'Action'],
        rows: [
            { provider: 'Jubilee', product: 'Life Cover', rate: 'KES 2,500 /mo', maxAmount: 'KES 5M', tenure: 'Annual', risk: 'Low', action: 'Apply', featured: true, rateTone: 'text-emerald-700', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'Britam', product: 'Medical', rate: 'KES 1,800 /mo', maxAmount: 'KES 500K', tenure: 'Annual', risk: 'Low', action: 'View', rateTone: 'text-blue-600', riskTone: 'bg-emerald-50 text-emerald-700' },
            { provider: 'APA', product: 'Motor Insurance', rate: 'KES 500 /mo', maxAmount: 'Comprehensive', tenure: 'Annual', risk: 'Low-Med', action: 'View', rateTone: 'text-amber-500', riskTone: 'bg-blue-50 text-blue-700' },
        ],
    },
};

const ComparisonHubPanel = () => {
    const [activeTab, setActiveTab] = useState('loans');
    const current = useMemo(() => comparisonData[activeTab], [activeTab]);

    return (
        <div className="space-y-4">
            <section className="rounded-[1.4rem] bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-5 py-5 text-white shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-[2rem] font-extrabold tracking-tight">Comparison Hub</h2>
                        <p className="mt-1 text-sm text-white/85">Compare 40+ financial products across Kenya - rates updated weekly.</p>
                    </div>
                    <p className="pt-1 text-xs font-medium text-emerald-100">Updated: 8 Mar 2026</p>
                </div>
            </section>

            <div className="flex flex-wrap gap-2">
                {comparisonTabs.map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={
                                active
                                    ? 'inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm'
                                    : 'inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-700'
                            }
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    );
                })}
            </div>

            <section className="rounded-[1.35rem] border border-primary-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-[1.35rem] font-bold text-slate-950">{current.title}</h3>
                    <p className="text-xs font-medium text-slate-400">{current.subtitle}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-[#f3faf8] text-left text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                {current.columns.map((column) => (
                                    <th key={column} className="px-4 py-3 font-semibold first:rounded-l-xl last:rounded-r-xl">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {current.rows.map((row, index) => (
                                <tr
                                    key={`${row.provider}-${row.product}-${index}`}
                                    className={`border-b border-primary-100 last:border-b-0 ${row.featured ? 'bg-amber-50/45' : 'bg-white'}`}
                                >
                                    <td className="px-4 py-4 font-bold text-slate-900">{row.provider}</td>
                                    <td className="px-4 py-4 text-slate-800">{row.product}</td>
                                    <td className={`px-4 py-4 font-extrabold ${row.rateTone}`}>{row.rate}</td>
                                    <td className="px-4 py-4 text-slate-800">{row.maxAmount}</td>
                                    <td className="px-4 py-4 text-slate-800">{row.tenure}</td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.riskTone}`}>
                                            {row.risk}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            className={
                                                row.action === 'Apply' || row.action === 'Invest'
                                                    ? 'inline-flex items-center gap-1 rounded-lg bg-primary-700 px-3 py-2 text-xs font-semibold text-white'
                                                    : row.action === 'Best Rate'
                                                    ? 'inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950'
                                                    : 'inline-flex items-center gap-1 rounded-lg border border-primary-100 bg-[#f8fcfb] px-3 py-2 text-xs font-semibold text-slate-700'
                                            }
                                        >
                                            {row.action}
                                            {(row.action === 'Apply' || row.action === 'Invest') && <ArrowRight size={13} />}
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
