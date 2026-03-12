import React from 'react';
import { WalletCards, CalendarClock, Percent, BadgeDollarSign } from 'lucide-react';

const cardConfig = [
    {
        key: 'totalBalance',
        label: 'Total debt balance',
        icon: WalletCards,
        accent: 'from-rose-500 to-orange-500',
        formatter: (value) => `KSh ${value.toLocaleString()}`,
    },
    {
        key: 'totalMinimumPayment',
        label: 'Monthly minimums',
        icon: CalendarClock,
        accent: 'from-amber-500 to-yellow-500',
        formatter: (value) => `KSh ${value.toLocaleString()}`,
    },
    {
        key: 'weightedInterest',
        label: 'Average interest rate',
        icon: Percent,
        accent: 'from-slate-700 to-slate-900',
        formatter: (value) => `${value.toFixed(1)}%`,
    },
    {
        key: 'activeDebts',
        label: 'Active debts',
        icon: BadgeDollarSign,
        accent: 'from-emerald-500 to-teal-500',
        formatter: (value) => value,
    },
];

const DebtSummaryCards = ({ summary }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cardConfig.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.key}
                        className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-5 shadow-sm"
                    >
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
};

export default DebtSummaryCards;
