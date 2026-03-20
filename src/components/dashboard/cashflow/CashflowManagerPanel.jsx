import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import CashflowAnalysisCard from './CashflowAnalysisCard';
import CashflowExpenseList from './CashflowExpenseList';
import CashflowHistoryCard from './CashflowHistoryCard';
import CashflowIncomeList from './CashflowIncomeList';
import CashflowIntegrationCard from './CashflowIntegrationCard';
import CashflowOverviewCards from './CashflowOverviewCards';
import {
    getCashflowAnalysis,
    getCashflowHistory,
    getCashflowSummary,
    getExpenseEntries,
    getIncomeEntries,
} from '../../../services/cashflowApi';

const CashflowManagerPanel = () => {
    const [summary, setSummary] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [history, setHistory] = useState(null);
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCashflowWorkspace = async () => {
            try {
                setLoading(true);
                setError('');

                const [summaryData, analysisData, historyData, incomeData, expenseData] = await Promise.all([
                    getCashflowSummary(),
                    getCashflowAnalysis(),
                    getCashflowHistory(),
                    getIncomeEntries(),
                    getExpenseEntries(),
                ]);

                setSummary(summaryData);
                setAnalysis(analysisData);
                setHistory(historyData);
                setIncomes(incomeData.incomes);
                setExpenses(expenseData.expenses);
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

            <CashflowIntegrationCard />

            <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
                <div className="flex items-start gap-3">
                    <Info size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Your cash flow view is ready.</p>
                        <p className="mt-1">
                            You can already use this view to understand your monthly money position, spot pressure points, and see where stronger habits could improve your financial breathing room. More action tools will be added soon.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <CashflowAnalysisCard analysis={analysis} />
                <CashflowHistoryCard history={history} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Income tracking</p>
                        <h3 className="mt-2 text-2xl font-extrabold text-slate-950">What is supporting your month</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            See the income sources that are carrying your month, from regular earnings to one-time payments and other support.
                        </p>
                    </div>
                    <CashflowIncomeList incomes={incomes} />
                </section>

                <section className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary-700">Expenses from budget</p>
                        <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Where your money is being used</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Review the spending already captured in your Budget view so you can compare what is leaving your account against what is coming in.
                        </p>
                    </div>
                    <CashflowExpenseList expenses={expenses} />
                </section>
            </div>
        </div>
    );
};

export default CashflowManagerPanel;
