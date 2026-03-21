import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import CashflowAnalysisCard from './CashflowAnalysisCard';
import CashflowHistoryCard from './CashflowHistoryCard';
import CashflowIncomeList from './CashflowIncomeList';
import CashflowOverviewCards from './CashflowOverviewCards';
import {
    getCashflowAnalysis,
    getCashflowHistory,
    getCashflowSummary,
    getIncomeEntries,
} from '../../../services/cashflowApi';

const CashflowManagerPanel = () => {
    const [summary, setSummary] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [history, setHistory] = useState(null);
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCashflowWorkspace = async () => {
            try {
                setLoading(true);
                setError('');

                const [summaryData, analysisData, historyData, incomeData] = await Promise.all([
                    getCashflowSummary(),
                    getCashflowAnalysis(),
                    getCashflowHistory(),
                    getIncomeEntries(),
                ]);

                setSummary(summaryData);
                setAnalysis(analysisData);
                setHistory(historyData);
                setIncomes(incomeData.incomes);
            } catch (err) {
                setError(err.message || 'We could not load your cash flow workspace right now.');
            } finally {
                setLoading(false);
            }
        };

        loadCashflowWorkspace();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your cash flow workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">We could not load your cash flow view.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <CashflowOverviewCards summary={summary} />

            <div className="rounded-[1.75rem] border border-primary-100 bg-primary-50/70 p-5 text-sm text-slate-700 shadow-sm">
                <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 shrink-0 text-primary-700" />
                    <div>
                        <p className="font-semibold text-slate-900">Your cash flow view is ready.</p>
                        <p className="mt-1">
                            Start here by reviewing the income patterns shaping your month. As this area grows, it will become an even stronger planning space for day-to-day money decisions.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <CashflowAnalysisCard analysis={analysis} />
                <CashflowHistoryCard history={history} />
            </div>

            <section className="space-y-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Income tracking</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Income records you are tracking</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        Keep a clear view of the earnings and support flowing into your month so planning feels less uncertain.
                    </p>
                </div>
                <CashflowIncomeList incomes={incomes} />
            </section>
        </div>
    );
};

export default CashflowManagerPanel;
