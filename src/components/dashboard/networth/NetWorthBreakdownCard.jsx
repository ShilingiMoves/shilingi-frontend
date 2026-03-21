import React from 'react';

const formatCurrency = (value, currency = 'KES') => new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
}).format(value || 0);

const TableHeader = ({ title, column1, column2 }) => (
    <div className="grid grid-cols-[1fr_80px_100px] bg-slate-700 p-3 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
        <div>{column1}</div>
        <div className="text-center">Source</div>
        <div className="text-right">{column2}</div>
    </div>
);

const TableRow = ({ label, value, currency, source }) => (
    <div className="grid grid-cols-[1fr_80px_100px] items-center border-b border-slate-100 p-3 text-sm text-slate-700 last:border-0 hover:bg-slate-50/50">
        <div className="truncate pr-4 font-medium">{label}</div>
        <div className="text-center">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                source === 'Goal' ? 'bg-emerald-100 text-emerald-700' :
                source === 'Debt' ? 'bg-rose-100 text-rose-700' :
                'bg-slate-100 text-slate-600'
            }`}>
                {source}
            </span>
        </div>
        <div className="text-right font-bold text-slate-900">{formatCurrency(value, currency)}</div>
    </div>
);

const NetWorthBreakdownCard = ({ breakdown }) => {
    const currency = breakdown?.currency || 'KES';
    
    const assets = [
        ...(breakdown?.assets?.manual || []).map(a => ({ ...a, source: 'Manual' })),
        ...(breakdown?.assets?.fromGoals || []).map(a => ({ ...a, source: 'Goal' })),
    ];
    
    const liabilities = [
        ...(breakdown?.liabilities?.debts || []).map(l => ({ ...l, source: 'Debt' })),
        ...(breakdown?.liabilities?.other || []).map(l => ({ ...l, source: 'Manual' })),
    ];

    const totalAssets = assets.reduce((sum, item) => sum + (item.value || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Assets Table */}
            <div className="flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">Assets</h3>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <TableHeader column1="Asset Name" column2="Value" />
                    <div className="min-h-[160px]">
                        {assets.length > 0 ? (
                            assets.map((item) => (
                                <TableRow 
                                    key={item.id} 
                                    label={item.label} 
                                    value={item.value} 
                                    currency={currency} 
                                    source={item.source}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-slate-400">
                                <p className="italic">No assets found</p>
                                <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-300 font-bold">Auto-syncs from Goals & Savings</p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-[1fr_100px] items-center bg-slate-50 p-4 text-sm font-bold text-slate-900">
                        <div className="uppercase tracking-widest text-[10px] text-slate-500">Total Assets</div>
                        <div className="text-right text-base">{formatCurrency(totalAssets, currency)}</div>
                    </div>
                </div>
            </div>

            {/* Liabilities Table */}
            <div className="flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">Liabilities</h3>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <TableHeader column1="Liability Name" column2="Owed" />
                    <div className="min-h-[160px]">
                        {liabilities.length > 0 ? (
                            liabilities.map((item) => (
                                <TableRow 
                                    key={item.id} 
                                    label={item.label} 
                                    value={item.value} 
                                    currency={currency} 
                                    source={item.source}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-slate-400">
                                <p className="italic">No liabilities found</p>
                                <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-300 font-bold">Auto-syncs from Debt Module</p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-[1fr_100px] items-center bg-slate-50 p-4 text-sm font-bold text-slate-900">
                        <div className="uppercase tracking-widest text-[10px] text-slate-500">Total Liabilities</div>
                        <div className="text-right text-base">{formatCurrency(totalLiabilities, currency)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetWorthBreakdownCard;


