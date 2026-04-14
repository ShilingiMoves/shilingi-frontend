import React, { useMemo, useState } from 'react';
import { Calculator, X } from 'lucide-react';

const tools = [
    { id: 'budget', title: 'Budget Builder', subtitle: 'Plan your monthly budget' },
    { id: 'loan', title: 'Loan Calculator', subtitle: 'Monthly repayments and interest' },
    { id: 'compound', title: 'Compound Interest', subtitle: 'Grow your savings over time' },
    { id: 'paye', title: 'PAYE / Tax Calculator', subtitle: 'Kenya income tax estimator' },
    { id: 'fx', title: 'FX Converter', subtitle: 'Live currency exchange rates' },
    { id: 'fire', title: 'FIRE Calculator', subtitle: 'Find your financial freedom number' },
    { id: 'debtPayoff', title: 'Debt Payoff Planner', subtitle: 'Avalanche & snowball method' },
    { id: 'netWorth', title: 'Net Worth Tracker', subtitle: 'Assets minus liabilities' },
    { id: 'insurance', title: 'Insurance Calculator', subtitle: 'How much cover do you need?' },
];

const curatedBooks = [
    {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        blurb: 'Timeless lessons on wealth, greed, and happiness.',
        tone: 'from-[#2f8f72] to-[#175a4a]',
        tag: 'Top Pick',
        tagClass: 'bg-emerald-50 text-emerald-700',
    },
    {
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        blurb: 'What the rich teach their kids about money.',
        tone: 'from-[#ffb63d] to-[#f07f18]',
        tag: 'Beginner',
        tagClass: 'bg-amber-50 text-amber-700',
    },
    {
        title: 'I Will Teach You to Be Rich',
        author: 'Ramit Sethi',
        blurb: 'A practical guide to managing money in your 20s-40s.',
        tone: 'from-[#5ea5f4] to-[#3474c9]',
        tag: 'Intermediate',
        tagClass: 'bg-blue-50 text-blue-700',
    },
];

const curatedPodcasts = [
    {
        title: 'Pesa Nane',
        host: 'Kenyan personal finance podcast',
        blurb: 'Practical money conversations for local savers and planners.',
        tone: 'from-[#8b6ad9] to-[#6b46c1]',
        tag: 'KE Local',
        tagClass: 'bg-violet-50 text-violet-700',
    },
    {
        title: 'Planet Money (NPR)',
        host: 'How the economy really works',
        blurb: 'Simple explanations of economic stories and money decisions.',
        tone: 'from-[#ff8d8d] to-[#ff6464]',
        tag: 'Global',
        tagClass: 'bg-blue-50 text-blue-700',
    },
    {
        title: 'We Study Billionaires',
        host: 'Investing mindset & strategies',
        blurb: 'Long-form investing conversations and portfolio thinking.',
        tone: 'from-[#3ba884] to-[#156f5f]',
        tag: 'Investing',
        tagClass: 'bg-emerald-50 text-emerald-700',
    },
];

const numberFormatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const labelClass = 'block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500';
const inputClass = 'mt-2 w-full rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100';

const ResourcesToolsPanel = () => {
    const [selectedTool, setSelectedTool] = useState(null);

    const [monthlyIncome, setMonthlyIncome] = useState(120000);
    const budgetSplit = useMemo(() => ({
        needs: monthlyIncome * 0.5,
        wants: monthlyIncome * 0.3,
        savings: monthlyIncome * 0.2,
    }), [monthlyIncome]);

    const [loanAmount, setLoanAmount] = useState(500000);
    const [loanRate, setLoanRate] = useState(13);
    const [loanMonths, setLoanMonths] = useState(36);
    const loanResult = useMemo(() => {
        if (loanAmount <= 0 || loanRate <= 0 || loanMonths <= 0) return { monthly: 0, totalInterest: 0 };
        const r = loanRate / 100 / 12;
        const monthly = (loanAmount * r * Math.pow(1 + r, loanMonths)) / (Math.pow(1 + r, loanMonths) - 1);
        const totalInterest = monthly * loanMonths - loanAmount;
        return { monthly, totalInterest };
    }, [loanAmount, loanRate, loanMonths]);

    const [principal, setPrincipal] = useState(100000);
    const [monthlyAdd, setMonthlyAdd] = useState(5000);
    const [annualReturn, setAnnualReturn] = useState(10);
    const [years, setYears] = useState(5);
    const compoundResult = useMemo(() => {
        const r = annualReturn / 100 / 12;
        const n = years * 12;
        if (n <= 0) return 0;
        if (r === 0) return principal + monthlyAdd * n;
        return (principal * Math.pow(1 + r, n)) + (monthlyAdd * ((Math.pow(1 + r, n) - 1) / r));
    }, [principal, monthlyAdd, annualReturn, years]);

    const [grossMonthlyPay, setGrossMonthlyPay] = useState(120000);
    const payeResult = useMemo(() => {
        const annual = grossMonthlyPay * 12;
        const firstBand = Math.min(annual, 288000) * 0.1;
        const secondBand = Math.max(Math.min(annual - 288000, 100000), 0) * 0.25;
        const thirdBand = Math.max(annual - 388000, 0) * 0.3;
        const annualTaxBeforeRelief = firstBand + secondBand + thirdBand;
        const annualRelief = 2400 * 12;
        const annualTax = Math.max(annualTaxBeforeRelief - annualRelief, 0);
        const netMonthly = grossMonthlyPay - annualTax / 12;
        return { monthlyTax: annualTax / 12, netMonthly };
    }, [grossMonthlyPay]);

    const [fxAmount, setFxAmount] = useState(1000);
    const [fxFrom, setFxFrom] = useState('USD');
    const [fxTo, setFxTo] = useState('KES');
    const fxRatesToKes = {
        KES: 1,
        USD: 129,
        EUR: 140,
        GBP: 163,
        UGX: 0.036,
        TZS: 0.05,
    };
    const fxConvertedAmount = useMemo(() => {
        const fromRate = fxRatesToKes[fxFrom] ?? 1;
        const toRate = fxRatesToKes[fxTo] ?? 1;
        if (fxAmount <= 0 || fromRate <= 0 || toRate <= 0) return 0;
        const kesValue = fxAmount * fromRate;
        return kesValue / toRate;
    }, [fxAmount, fxFrom, fxTo]);

    const [yearlyExpense, setYearlyExpense] = useState(1200000);
    const [safeRate, setSafeRate] = useState(4);
    const fireNumber = useMemo(() => {
        if (safeRate <= 0) return 0;
        return yearlyExpense / (safeRate / 100);
    }, [yearlyExpense, safeRate]);

    const [annualIncome, setAnnualIncome] = useState(1440000);
    const [dependants, setDependants] = useState(2);
    const [debtBalance, setDebtBalance] = useState(300000);
    const insuranceCover = useMemo(() => (annualIncome * 10) + debtBalance + (dependants * 250000), [annualIncome, dependants, debtBalance]);

    const [payoffBalance, setPayoffBalance] = useState(300000);
    const [payoffRate, setPayoffRate] = useState(14);
    const [payoffMonthly, setPayoffMonthly] = useState(20000);
    const debtPayoffResult = useMemo(() => {
        if (payoffBalance <= 0 || payoffMonthly <= 0) return { months: 0, totalInterest: 0, totalPaid: 0 };
        const monthlyRate = payoffRate / 100 / 12;
        if (monthlyRate > 0 && payoffMonthly <= payoffBalance * monthlyRate) {
            return { months: 999, totalInterest: 0, totalPaid: 0 };
        }
        let months = 0;
        let balance = payoffBalance;
        let totalPaid = 0;
        while (balance > 0.01 && months < 600) {
            const interest = balance * monthlyRate;
            const principalPaid = Math.min(Math.max(payoffMonthly - interest, 0), balance);
            if (principalPaid <= 0) break;
            balance -= principalPaid;
            totalPaid += payoffMonthly;
            months += 1;
        }
        return {
            months,
            totalInterest: Math.max(totalPaid - payoffBalance, 0),
            totalPaid,
        };
    }, [payoffBalance, payoffRate, payoffMonthly]);

    const [manualAssets, setManualAssets] = useState(500000);
    const [manualLiabilities, setManualLiabilities] = useState(120000);
    const netWorthResult = useMemo(() => manualAssets - manualLiabilities, [manualAssets, manualLiabilities]);

    return (
        <div className="space-y-4">
            <section className="rounded-[1.4rem] bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-5 py-5 text-white shadow-sm">
                <h2 className="text-3xl font-extrabold tracking-tight">Resources & Tools</h2>
                <p className="mt-1 text-sm text-white/85">Financial calculators and tools to help you make smarter decisions.</p>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                    <button
                        type="button"
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className="rounded-[1rem] border border-primary-100 bg-white px-4 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
                    >
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                                <Calculator size={16} />
                            </span>
                            <p className="text-base font-bold text-slate-900">{tool.title}</p>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{tool.subtitle}</p>
                        <p className="mt-3 text-xs font-semibold text-primary-700">Open calculator</p>
                    </button>
                ))}
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[1.35rem] font-bold text-slate-950">Curated Books</h3>
                    <button type="button" className="text-sm font-semibold text-primary-700">See All -</button>
                </div>
                <div className="grid gap-3 xl:grid-cols-3">
                    {curatedBooks.map((book) => (
                        <article key={book.title} className="rounded-[1.2rem] border border-primary-100 bg-white p-4 shadow-sm">
                            <div className="flex gap-4">
                                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${book.tone} text-2xl text-white shadow-sm`}>
                                    <span>▮</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{book.title}</h4>
                                    <p className="text-sm text-slate-500">{book.author}</p>
                                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{book.blurb}</p>
                                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${book.tagClass}`}>{book.tag}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[1.35rem] font-bold text-slate-950">Curated Podcasts</h3>
                    <button type="button" className="text-sm font-semibold text-primary-700">See All -</button>
                </div>
                <div className="grid gap-3 xl:grid-cols-3">
                    {curatedPodcasts.map((podcast) => (
                        <article key={podcast.title} className="rounded-[1.2rem] border border-primary-100 bg-white p-4 shadow-sm">
                            <div className="flex gap-4">
                                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${podcast.tone} text-2xl text-white shadow-sm`}>
                                    <span>◔</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{podcast.title}</h4>
                                    <p className="text-sm text-slate-500">{podcast.host}</p>
                                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{podcast.blurb}</p>
                                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${podcast.tagClass}`}>{podcast.tag}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {selectedTool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
                    <div className="w-full max-w-3xl rounded-2xl border border-primary-100 bg-slate-50 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {tools.find((tool) => tool.id === selectedTool)?.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedTool(null)}
                                className="rounded-lg border border-primary-100 bg-white p-2 text-slate-600 transition hover:text-slate-900"
                                aria-label="Close calculator"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-5">
                            {selectedTool === 'budget' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Monthly income (KES)</label>
                                        <input aria-label="Monthly income (KES)" className={inputClass} type="number" min={0} value={monthlyIncome} onChange={(event) => setMonthlyIncome(Number(event.target.value || 0))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">50/30/20 split</p>
                                        <p className="mt-2 text-sm text-slate-600">Needs (50%): <span className="font-semibold text-emerald-700">{numberFormatter.format(budgetSplit.needs)}</span></p>
                                        <p className="mt-1 text-sm text-slate-600">Wants (30%): <span className="font-semibold text-blue-700">{numberFormatter.format(budgetSplit.wants)}</span></p>
                                        <p className="mt-1 text-sm text-slate-600">Savings (20%): <span className="font-semibold text-amber-700">{numberFormatter.format(budgetSplit.savings)}</span></p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'loan' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Loan amount (KES)</label>
                                        <input aria-label="Loan amount (KES)" className={inputClass} type="number" min={0} value={loanAmount} onChange={(event) => setLoanAmount(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Annual interest (%)</label>
                                        <input aria-label="Annual interest (%)" className={inputClass} type="number" min={0} step="0.1" value={loanRate} onChange={(event) => setLoanRate(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Repayment months</label>
                                        <input aria-label="Repayment months" className={inputClass} type="number" min={1} value={loanMonths} onChange={(event) => setLoanMonths(Number(event.target.value || 1))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">Estimated monthly payment</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">{numberFormatter.format(loanResult.monthly)}</p>
                                        <p className="mt-2 text-sm text-slate-600">Total interest: <span className="font-semibold text-slate-900">{numberFormatter.format(loanResult.totalInterest)}</span></p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'compound' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Current savings (KES)</label>
                                        <input className={inputClass} type="number" min={0} value={principal} onChange={(event) => setPrincipal(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Monthly contribution (KES)</label>
                                        <input className={inputClass} type="number" min={0} value={monthlyAdd} onChange={(event) => setMonthlyAdd(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Annual return (%)</label>
                                        <input className={inputClass} type="number" min={0} step="0.1" value={annualReturn} onChange={(event) => setAnnualReturn(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Years</label>
                                        <input className={inputClass} type="number" min={1} value={years} onChange={(event) => setYears(Number(event.target.value || 1))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4 md:col-span-2">
                                        <p className="text-sm font-semibold text-slate-900">Projected future value</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">{numberFormatter.format(compoundResult)}</p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'paye' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Gross monthly pay (KES)</label>
                                        <input className={inputClass} type="number" min={0} value={grossMonthlyPay} onChange={(event) => setGrossMonthlyPay(Number(event.target.value || 0))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">Estimated PAYE (monthly)</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">{numberFormatter.format(payeResult.monthlyTax)}</p>
                                        <p className="mt-2 text-sm text-slate-600">Estimated net pay: <span className="font-semibold text-slate-900">{numberFormatter.format(payeResult.netMonthly)}</span></p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'fx' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Amount</label>
                                        <input aria-label="FX amount" className={inputClass} type="number" min={0} value={fxAmount} onChange={(event) => setFxAmount(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>From currency</label>
                                        <select aria-label="From currency" className={inputClass} value={fxFrom} onChange={(event) => setFxFrom(event.target.value)}>
                                            {Object.keys(fxRatesToKes).map((currency) => (
                                                <option key={currency} value={currency}>{currency}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>To currency</label>
                                        <select aria-label="To currency" className={inputClass} value={fxTo} onChange={(event) => setFxTo(event.target.value)}>
                                            {Object.keys(fxRatesToKes).map((currency) => (
                                                <option key={currency} value={currency}>{currency}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">Converted amount</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                                            {new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 }).format(fxConvertedAmount)} {fxTo}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">Indicative rates for planning preview.</p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'fire' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Annual expense (KES)</label>
                                        <input className={inputClass} type="number" min={0} value={yearlyExpense} onChange={(event) => setYearlyExpense(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Safe withdrawal rate (%)</label>
                                        <input className={inputClass} type="number" min={0.5} step="0.1" value={safeRate} onChange={(event) => setSafeRate(Number(event.target.value || 0))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4 md:col-span-2">
                                        <p className="text-sm font-semibold text-slate-900">FIRE number (target portfolio)</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">{numberFormatter.format(fireNumber)}</p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'debtPayoff' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Total debt balance (KES)</label>
                                        <input aria-label="Total debt balance (KES)" className={inputClass} type="number" min={0} value={payoffBalance} onChange={(event) => setPayoffBalance(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Average annual interest (%)</label>
                                        <input aria-label="Average annual interest (%)" className={inputClass} type="number" min={0} step="0.1" value={payoffRate} onChange={(event) => setPayoffRate(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Monthly payment (KES)</label>
                                        <input aria-label="Monthly payment (KES)" className={inputClass} type="number" min={0} value={payoffMonthly} onChange={(event) => setPayoffMonthly(Number(event.target.value || 0))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">Debt-free timeline</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                                            {debtPayoffResult.months >= 999 ? 'Increase payment' : `${debtPayoffResult.months} months`}
                                        </p>
                                        {debtPayoffResult.months < 999 && (
                                            <>
                                                <p className="mt-2 text-sm text-slate-600">Total paid: <span className="font-semibold text-slate-900">{numberFormatter.format(debtPayoffResult.totalPaid)}</span></p>
                                                <p className="mt-1 text-sm text-slate-600">Total interest: <span className="font-semibold text-slate-900">{numberFormatter.format(debtPayoffResult.totalInterest)}</span></p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'netWorth' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Total assets (KES)</label>
                                        <input aria-label="Total assets (KES)" className={inputClass} type="number" min={0} value={manualAssets} onChange={(event) => setManualAssets(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Total liabilities (KES)</label>
                                        <input aria-label="Total liabilities (KES)" className={inputClass} type="number" min={0} value={manualLiabilities} onChange={(event) => setManualLiabilities(Number(event.target.value || 0))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4 md:col-span-2">
                                        <p className="text-sm font-semibold text-slate-900">Estimated net worth</p>
                                        <p className={`mt-2 text-2xl font-extrabold ${netWorthResult >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                            {numberFormatter.format(netWorthResult)}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            {netWorthResult >= 0 ? 'Healthy positive position. Keep compounding.' : 'Negative position. Prioritize debt reduction and saving.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedTool === 'insurance' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Annual income (KES)</label>
                                        <input className={inputClass} type="number" min={0} value={annualIncome} onChange={(event) => setAnnualIncome(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Dependants</label>
                                        <input className={inputClass} type="number" min={0} value={dependants} onChange={(event) => setDependants(Number(event.target.value || 0))} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Outstanding debt (KES)</label>
                                        <input className={inputClass} type="number" min={0} value={debtBalance} onChange={(event) => setDebtBalance(Number(event.target.value || 0))} />
                                    </div>
                                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">Suggested cover amount</p>
                                        <p className="mt-2 text-2xl font-extrabold text-emerald-700">{numberFormatter.format(insuranceCover)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesToolsPanel;
