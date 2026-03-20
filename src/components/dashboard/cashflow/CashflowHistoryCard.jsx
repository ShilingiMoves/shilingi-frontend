import React from 'react';
import { CalendarDays } from 'lucide-react';

const CashflowHistoryCard = ({ history }) => {
    const items = Array.isArray(history?.history) ? history.history : [];

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                    <CalendarDays size={18} />
                </div>
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">6-month trend</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Cash flow history</h3>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {items.map((item) => (
                    <div key={`${item.month}-${item.year}`} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-900">{item.month} {item.year}</span>
                        <span className="text-emerald-700">+{Number(item.income || 0).toLocaleString()}</span>
                        <span className="text-rose-700">-{Number(item.expenses || 0).toLocaleString()}</span>
                        <span className="font-semibold text-slate-900">{Number(item.net || 0).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CashflowHistoryCard;
