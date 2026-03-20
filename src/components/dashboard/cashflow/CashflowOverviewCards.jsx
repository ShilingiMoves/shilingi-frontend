import React from 'react';
import { ArrowUpCircle, Landmark, PiggyBank, Wallet } from 'lucide-react';

const cardConfig = [
    {
        key: 'income',
        label: 'Income this month',
        icon: ArrowUpCircle,
        accent: 'from-emerald-500 to-teal-500',
    },
    {
        key: 'recurringIncome',
        label: 'Recurring income',
        icon: Landmark,
        accent: 'from-primary-500 to-cyan-500',
    },
    {
        key: 'incomeSources',
        label: 'Income sources',
        icon: Wallet,
        accent: 'from-slate-700 to-slate-900',
    },
    {
        key: 'savingsRate',
        label: 'Savings rate',
        icon: PiggyBank,
        accent: 'from-amber-500 to-orange-500',
    },
];

const formatCurrency = (value, currency = 'KES') => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(value || 0);

const CashflowOverviewCards = ({ summary }) => {
    const cardValues = {
        income: formatCurrency(Number(summary?.current_month?.total_income || 0), summary?.currency || 'KES'),
        recurringIncome: formatCurrency(Number(summary?.monthly_recurring_income || 0), summary?.currency || 'KES'),
        incomeSources: Number(summary?.income_sources_count || 0).toLocaleString(),
        savingsRate: `${Number(summary?.current_month?.savings_rate || 0).toFixed(1)}%`,
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cardConfig.map((card) => {
                const Icon = card.icon;

                return (
                    <div key={card.key} className="relative overflow-hidden rounded-3xl border border-white/60 bg-white p-5 shadow-sm">
                        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <p className="mt-2 text-2xl font-extrabold text-gray-900">{cardValues[card.key]}</p>
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

export default CashflowOverviewCards;
