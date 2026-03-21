import React from 'react';

const formatCurrency = (value, currency = 'KES') => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(value || 0);

const NetWorthSummaryCards = ({ summary }) => {
    const { totalAssets, totalLiabilities, netWorth, currency } = summary;

    const maxVal = Math.max(totalAssets, totalLiabilities, 1); // Avoid division by zero
    const assetWidth = `${(totalAssets / maxVal) * 100}%`;
    const liabilityWidth = `${(totalLiabilities / maxVal) * 100}%`;
    const netWorthWidth = `${(netWorth / maxVal) * 100}%`;

    const items = [
        { label: 'Assets', value: totalAssets, color: 'text-emerald-500', barColor: 'bg-emerald-500', width: assetWidth },
        { label: 'Liabilities', value: totalLiabilities, color: 'text-rose-500', barColor: 'bg-rose-500', width: liabilityWidth },
        { label: 'Net Worth', value: netWorth, color: 'text-blue-500', barColor: 'bg-blue-500', width: netWorthWidth },
    ];

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-center text-xl font-bold text-slate-800 tracking-tight">Net Worth Overview</h2>
            
            <div className="mx-auto max-w-4xl space-y-6">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-6">
                        <div className={`w-24 text-right text-xs font-black uppercase tracking-widest ${item.color}`}>
                            {item.label}
                        </div>
                        <div className="relative h-4 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${item.barColor} opacity-20`} 
                                style={{ width: '100%' }}
                            />
                            <div 
                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${item.barColor} shadow-sm`} 
                                style={{ width: item.width }}
                            />
                        </div>
                        <div className="w-32 text-sm font-black text-slate-900 tabular-nums">
                            {formatCurrency(item.value, currency)}
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Live Data synced from all your active modules
            </p>
        </div>
    );
};


export default NetWorthSummaryCards;

