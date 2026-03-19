import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from 'lucide-react';

const cardConfig = [
    {
        key: 'monthlyIncome',
        label: 'Monthly income',
        icon: ArrowUpCircle,
        accent: 'from-emerald-500 to-teal-500',
        formatter: (value) => `KSh ${value.toLocaleString()}`,
    },
    {
        key: 'monthlyExpenses',
        label: 'Monthly expenses',
        icon: ArrowDownCircle,
        accent: 'from-rose-500 to-orange-500',
        formatter: (value) => `KSh ${value.toLocaleString()}`,
    },
    {
        key: 'netCashflow',
        label: 'Net cash flow',
        icon: Scale,
        accent: 'from-slate-700 to-slate-900',
        formatter: (value) => `KSh ${value.toLocaleString()}`,
    },
    {
        key: 'entriesTracked',
        label: 'Tracked entries',
        icon: Wallet,
        accent: 'from-primary-500 to-cyan-500',
        formatter: (value) => value,
    },
];

const CashflowSummaryCards = ({ summary }) => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cardConfig.map((card) => {
            const Icon = card.icon;

            return (
                <div key={card.key} className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-5 shadow-sm">
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                            <p className="mt-2 text-2xl font-extrabold text-gray-900">{card.formatter(summary[card.key])}</p>
                        </div>
                        <div className={`rounded-2xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-lg`}>
                            <Icon size={22} />
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
);

export default CashflowSummaryCards;
