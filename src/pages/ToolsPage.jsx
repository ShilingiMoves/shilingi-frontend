import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Calculator, BookOpen, Headphones, MessageCircle,
    PieChart, TrendingUp, DollarSign, Calendar,
    ArrowRight, CheckCircle2, RefreshCcw, Percent,
    Target, ShieldCheck, CreditCard
} from 'lucide-react';
import Footer from '../components/Footer';
import toolsHeroVideo from '../video/tools-page-video-1.mp4';
import smartMoneyWoman from '../assets/smart-money-woman.PNG';
import richDadPoorDad from '../assets/Rich-Dad-Poor-Dad.PNG';
import psychologyOfMoney from '../assets/The-psychology-of-money.PNG';
import wealthWisdom from '../assets/Wealth-wisdom.PNG';

const ToolsPage = () => {
    // SEO
    useEffect(() => {
        document.title = 'Financial Tools & Calculators | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Plan your financial future with our free loan, investment, and budget calculators. Plus, access curated books and podcasts for Kenyan investors.');
        }
    }, []);

    const [activeTab, setActiveTab] = useState('loan');

    // Loan Calculator State
    const [loanAmount, setLoanAmount] = useState(100000);
    const [loanRate, setLoanRate] = useState(14);
    const [loanTerm, setLoanTerm] = useState(12);
    const [monthlyPayment, setMonthlyPayment] = useState(0);

    // Investment Calculator State
    const [invPrincipal, setInvPrincipal] = useState(50000);
    const [invMonthly, setInvMonthly] = useState(5000);
    const [invRate, setInvRate] = useState(10); // Money Market Fund avg
    const [invYears, setInvYears] = useState(5);
    const [invTotal, setInvTotal] = useState(0);

    // Budget Calculator State
    const [income, setIncome] = useState(50000);
    const [budget, setBudget] = useState({ needs: 0, wants: 0, savings: 0 });

    // Savings Goal Calculator State
    const [savGoal, setSavGoal] = useState(500000);
    const [savCurrent, setSavCurrent] = useState(50000);
    const [savMonthly, setSavMonthly] = useState(10000);
    const [savRate, setSavRate] = useState(8);
    const [savMonthsNeeded, setSavMonthsNeeded] = useState(0);

    // Emergency Fund Calculator State
    const [emMonthlyExpenses, setEmMonthlyExpenses] = useState(40000);
    const [emMonths, setEmMonths] = useState(6);
    const [emSaved, setEmSaved] = useState(50000);

    // Debt Payoff Calculator State
    const [debtBalance, setDebtBalance] = useState(200000);
    const [debtRate, setDebtRate] = useState(18);
    const [debtPayment, setDebtPayment] = useState(15000);
    const [debtResult, setDebtResult] = useState({ months: 0, totalPaid: 0, totalInterest: 0 });

    // Calculate Loan
    useEffect(() => {
        const r = loanRate / 100 / 12;
        const n = loanTerm;
        const p = loanAmount;
        if (p > 0 && r > 0 && n > 0) {
            const payment = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            setMonthlyPayment(payment);
        }
    }, [loanAmount, loanRate, loanTerm]);

    // Calculate Investment
    useEffect(() => {
        const r = invRate / 100 / 12;
        const n = invYears * 12;
        const p = invPrincipal;
        const pmt = invMonthly;

        // FV = P(1+r)^n + PMT * (((1+r)^n - 1) / r)
        const fv = (p * Math.pow(1 + r, n)) + (pmt * ((Math.pow(1 + r, n) - 1) / r));
        setInvTotal(fv);
    }, [invPrincipal, invMonthly, invRate, invYears]);

    // Calculate Budget (50/30/20 Rule)
    useEffect(() => {
        setBudget({
            needs: income * 0.5,
            wants: income * 0.3,
            savings: income * 0.2
        });
    }, [income]);

    // Calculate Savings Goal
    useEffect(() => {
        const r = savRate / 100 / 12;
        const remaining = savGoal - savCurrent;
        if (remaining <= 0) { setSavMonthsNeeded(0); return; }
        if (r === 0) { setSavMonthsNeeded(Math.ceil(remaining / savMonthly)); return; }
        // n = log(PMT / (PMT - r*PV)) / log(1+r)
        const n = Math.log(savMonthly / (savMonthly - r * remaining)) / Math.log(1 + r);
        setSavMonthsNeeded(isFinite(n) && n > 0 ? Math.ceil(n) : 999);
    }, [savGoal, savCurrent, savMonthly, savRate]);

    // Calculate Debt Payoff
    useEffect(() => {
        const r = debtRate / 100 / 12;
        let balance = debtBalance;
        let months = 0;
        let totalPaid = 0;
        if (debtPayment <= balance * r) { setDebtResult({ months: 999, totalPaid: 0, totalInterest: 0 }); return; }
        while (balance > 0 && months < 600) {
            const interest = balance * r;
            const principal = Math.min(debtPayment - interest, balance);
            balance -= principal;
            totalPaid += debtPayment;
            months++;
        }
        setDebtResult({ months, totalPaid, totalInterest: totalPaid - debtBalance });
    }, [debtBalance, debtRate, debtPayment]);


    const calculators = [
        { id: 'loan', label: 'Loan Repayment', icon: Calculator },
        { id: 'investment', label: 'Investment Growth', icon: TrendingUp },
        { id: 'budget', label: 'Budget Planner', icon: PieChart },
        { id: 'savings', label: 'Savings Goal', icon: Target },
        { id: 'emergency', label: 'Emergency Fund', icon: ShieldCheck },
        { id: 'debt', label: 'Debt Payoff', icon: CreditCard },
    ];

    const books = [
        { title: 'The Smart Money Woman', author: 'Arese Ugwu', color: 'bg-rose-100 text-rose-700', cover: smartMoneyWoman },
        { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', color: 'bg-purple-100 text-purple-700', cover: richDadPoorDad },
        { title: 'The Psychology of Money', author: 'Morgan Housel', color: 'bg-amber-100 text-amber-700', cover: psychologyOfMoney },
        { title: 'The Wealth of Wisdom', author: 'Tom McCullough & Keith Whitaker', color: 'bg-blue-100 text-blue-700', cover: wealthWisdom },
    ];

    const podcasts = [
        { title: 'The Financially Incorrect Podcast', host: 'Validated', color: 'bg-green-100 text-green-700' },
        { title: 'Money Wise', host: 'Shilingi Moves', color: 'bg-primary-100 text-primary-700' },
        { title: 'Kenyan Wallstreet', host: 'Market News', color: 'bg-gray-100 text-gray-700' },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* HERO SECTION with Video Background */}
            <section className="relative text-white min-h-[85vh] flex items-center overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                >
                    <source src={toolsHeroVideo} type="video/mp4" />
                </video>
                {/* Lighter Gradient Overlay for better video visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" style={{ zIndex: 1 }}></div>

                <div className="container-custom relative z-10 text-center max-w-4xl mx-auto py-20">
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-8 drop-shadow-xl tracking-tight leading-[1.1]"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        Make Smart Decisions with <span className="text-primary-400">Tools That Work for You</span>
                    </h1>
                    <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Make financial planning easy using our collection of calculators and personal growth tools. Our calculators simplify complex decisions so you can plan your money with accuracy.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#calculators" className="px-8 py-3 bg-white text-primary-900 font-bold rounded-full shadow-lg hover:bg-primary-50 transition-colors flex items-center gap-2">
                            <Calculator size={20} /> Try Calculators
                        </a>
                        <a href="#resources" className="px-8 py-3 bg-primary-600 text-white font-bold rounded-full border border-primary-500 hover:bg-primary-500 transition-colors flex items-center gap-2 shadow-lg">
                            <BookOpen size={20} /> Browse Resources
                        </a>
                    </div>
                </div>
            </section>

            {/* CALCULATORS SECTION */}
            <section id="calculators" className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Calculators</h2>
                        <p className="text-gray-600">Simple tools to help you crunch the numbers.</p>
                    </div>

                    {/* Calculator Tabs — scrollable on mobile */}
                    <div className="flex overflow-x-auto gap-3 mb-10 pb-2 scrollbar-hide sm:flex-wrap sm:justify-center sm:overflow-visible">
                        {calculators.map(calc => (
                            <button
                                key={calc.id}
                                onClick={() => setActiveTab(calc.id)}
                                className={`px-5 py-3 rounded-full font-bold flex items-center gap-2 transition-all shrink-0 ${activeTab === calc.id
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                <calc.icon size={18} /> {calc.label}
                            </button>
                        ))}
                    </div>

                    {/* Calculator Display */}
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">

                        {/* LOAN CALCULATOR */}
                        {activeTab === 'loan' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Calculator className="text-primary-600" /> Loan Repayment
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount (KES)</label>
                                            <input
                                                type="number"
                                                value={loanAmount}
                                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                                            />
                                            <input
                                                type="range" min="1000" max="5000000" step="1000"
                                                value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                                                className="w-full mt-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (% p.a)</label>
                                            <input
                                                type="number"
                                                value={loanRate}
                                                onChange={(e) => setLoanRate(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (Months)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    value={loanTerm}
                                                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                                                />
                                                <span className="text-gray-500 font-medium whitespace-nowrap">{Math.floor(loanTerm / 12)} Years</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="120"
                                                value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))}
                                                className="w-full mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-8 flex flex-col justify-center border border-gray-100">
                                    <p className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-1 text-center">Monthly Payment</p>
                                    <p className="text-4xl md:text-5xl font-bold text-primary-600 mb-6 text-center">
                                        KES {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                    <div className="w-full border-t border-gray-200 pt-5 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Loan Principal:</span>
                                            <span className="font-bold">KES {loanAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Repayment:</span>
                                            <span className="font-bold">KES {(monthlyPayment * loanTerm).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest Cost (KES):</span>
                                            <span className="font-bold text-rose-600">KES {((monthlyPayment * loanTerm) - loanAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest as % of Loan:</span>
                                            <span className="font-bold text-rose-600">{loanAmount > 0 ? ((((monthlyPayment * loanTerm) - loanAmount) / loanAmount) * 100).toFixed(1) : 0}%</span>
                                        </div>
                                        {/* Visual bar */}
                                        <div className="mt-2">
                                            <div className="flex text-xs text-gray-500 justify-between mb-1">
                                                <span>Principal</span><span>Interest</span>
                                            </div>
                                            <div className="w-full h-3 rounded-full bg-gray-200 flex overflow-hidden">
                                                <div className="bg-primary-500 h-3 rounded-l-full transition-all duration-500"
                                                    style={{ width: `${loanAmount > 0 ? Math.min(100, (loanAmount / (monthlyPayment * loanTerm)) * 100).toFixed(1) : 0}%` }}></div>
                                                <div className="bg-rose-400 h-3 rounded-r-full flex-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 p-3 bg-primary-50 rounded-xl text-xs text-primary-800 border border-primary-100">
                                        💡 <strong>Tip:</strong> Paying an extra KES 2,000/month can cut months off your loan and save you thousands in interest.
                                    </div>
                                    <button className="mt-5 w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                                        View Loan Offers
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* INVESTMENT CALCULATOR */}
                        {activeTab === 'investment' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <TrendingUp className="text-green-600" /> Investment Growth
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Starting Amount (KES)</label>
                                            <input
                                                type="number"
                                                value={invPrincipal}
                                                onChange={(e) => setInvPrincipal(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution (KES)</label>
                                            <input
                                                type="number"
                                                value={invMonthly}
                                                onChange={(e) => setInvMonthly(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Return Rate (%)</label>
                                                <input
                                                    type="number"
                                                    value={invRate}
                                                    onChange={(e) => setInvRate(Number(e.target.value))}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Time (Years)</label>
                                                <input
                                                    type="number"
                                                    value={invYears}
                                                    onChange={(e) => setInvYears(Number(e.target.value))}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-2xl p-8 flex flex-col justify-center border border-green-100">
                                    <p className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-1 text-center">Future Value</p>
                                    <p className="text-4xl md:text-5xl font-bold text-green-700 mb-6 text-center">
                                        KES {invTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </p>
                                    <div className="w-full border-t border-green-200 pt-5 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Invested:</span>
                                            <span className="font-bold">KES {(invPrincipal + (invMonthly * invYears * 12)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest Earned (KES):</span>
                                            <span className="font-bold text-green-600">KES {(invTotal - (invPrincipal + (invMonthly * invYears * 12))).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Return on Investment:</span>
                                            <span className="font-bold text-green-600">{(invPrincipal + (invMonthly * invYears * 12)) > 0 ? (((invTotal - (invPrincipal + (invMonthly * invYears * 12))) / (invPrincipal + (invMonthly * invYears * 12))) * 100).toFixed(1) : 0}%</span>
                                        </div>
                                        {/* Visual bar */}
                                        <div className="mt-2">
                                            <div className="flex text-xs text-gray-500 justify-between mb-1">
                                                <span>Your money</span><span>Interest earned</span>
                                            </div>
                                            <div className="w-full h-3 rounded-full bg-gray-200 flex overflow-hidden">
                                                <div className="bg-green-400 h-3 rounded-l-full transition-all duration-500"
                                                    style={{ width: `${invTotal > 0 ? Math.min(100, ((invPrincipal + (invMonthly * invYears * 12)) / invTotal) * 100).toFixed(1) : 0}%` }}></div>
                                                <div className="bg-green-700 h-3 rounded-r-full flex-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 p-3 bg-green-100 rounded-xl text-xs text-green-900 border border-green-200">
                                        🚀 <strong>Power of compounding:</strong> The longer you invest, the more interest earns interest — your money works for you 24/7.
                                    </div>
                                    <button className="mt-5 w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                                        Start Investing Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* BUDGET CALCULATOR */}
                        {activeTab === 'budget' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <PieChart className="text-purple-600" /> 50/30/20 Rule Planner
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly After-Tax Income (KES)</label>
                                            <input
                                                type="number"
                                                value={income}
                                                onChange={(e) => setIncome(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                                            />
                                            <input
                                                type="range" min="10000" max="1000000" step="5000"
                                                value={income} onChange={(e) => setIncome(Number(e.target.value))}
                                                className="w-full mt-2"
                                            />
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-sm text-purple-800">
                                            <p>The 50/30/20 rule allows you to spend <strong>50%</strong> of income on needs, <strong>30%</strong> on wants, and <strong>20%</strong> on savings.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Needs (Rent, Food)', amount: budget.needs, color: 'bg-purple-600', pct: '50%' },
                                        { label: 'Wants (Fun, Dining)', amount: budget.wants, color: 'bg-pink-500', pct: '30%' },
                                        { label: 'Savings/Debt (Investments)', amount: budget.savings, color: 'bg-green-500', pct: '20%' },
                                    ].map((cat, i) => (
                                        <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-gray-600 font-medium">{cat.label}</span>
                                                <span className="text-2xl font-bold">{cat.pct}</span>
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 mb-3">KES {cat.amount.toLocaleString()}</div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className={`${cat.color} h-2 rounded-full`} style={{ width: cat.pct }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-purple-50 rounded-xl text-xs text-purple-900 border border-purple-100">
                                    💡 <strong>Did you know?</strong> If you invest your 20% savings (KES {budget.savings.toLocaleString()}/mo) at 12% p.a., you'd have <strong>KES {Math.round(budget.savings * 12 * 1.12).toLocaleString()}</strong> after just one year — including interest!
                                </div>
                            </div>
                        )}

                        {/* SAVINGS GOAL CALCULATOR */}
                        {activeTab === 'savings' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Target className="text-amber-500" /> Savings Goal Calculator
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Savings Goal (KES)</label>
                                            <input type="number" value={savGoal} onChange={e => setSavGoal(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-shadow" />
                                            <input type="range" min="10000" max="10000000" step="10000" value={savGoal} onChange={e => setSavGoal(Number(e.target.value))} className="w-full mt-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Already Saved (KES)</label>
                                            <input type="number" value={savCurrent} onChange={e => setSavCurrent(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Savings (KES)</label>
                                            <input type="number" value={savMonthly} onChange={e => setSavMonthly(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Interest Rate (%)</label>
                                            <input type="number" value={savRate} onChange={e => setSavRate(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-shadow" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-2xl p-8 flex flex-col justify-center border border-amber-100">
                                    <p className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-1 text-center">Time to Reach Goal</p>
                                    <p className="text-5xl font-bold text-amber-600 mb-1 text-center">
                                        {savMonthsNeeded >= 999 ? '∞' : savMonthsNeeded}
                                    </p>
                                    <p className="text-amber-700 font-semibold mb-5 text-center">
                                        {savMonthsNeeded >= 999 ? 'increase your monthly savings' : `months (~${(savMonthsNeeded / 12).toFixed(1)} years)`}
                                    </p>
                                    <div className="w-full border-t border-amber-200 pt-5 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Remaining to Save:</span>
                                            <span className="font-bold">KES {Math.max(0, savGoal - savCurrent).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Your Contributions:</span>
                                            <span className="font-bold">KES {(savMonthly * Math.min(savMonthsNeeded, 998)).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest Earned (KES):</span>
                                            <span className="font-bold text-amber-600">KES {Math.max(0, savGoal - savCurrent - (savMonthly * Math.min(savMonthsNeeded, 998))).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        {/* Visual bar */}
                                        <div className="mt-2">
                                            <div className="flex text-xs text-gray-500 justify-between mb-1">
                                                <span>Your savings</span><span>Interest</span>
                                            </div>
                                            <div className="w-full h-3 rounded-full bg-gray-200 flex overflow-hidden">
                                                <div className="bg-amber-400 h-3 rounded-l-full transition-all duration-500"
                                                    style={{ width: `${savGoal > 0 ? Math.min(100, ((savMonthly * Math.min(savMonthsNeeded, 998) + savCurrent) / savGoal) * 100).toFixed(1) : 0}%` }}></div>
                                                <div className="bg-amber-600 h-3 rounded-r-full flex-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 p-3 bg-amber-100 rounded-xl text-xs text-amber-900 border border-amber-200">
                                        💡 <strong>Tip:</strong> Even a small interest rate (e.g. 8% MMF) means your money grows while you sleep — start today!
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EMERGENCY FUND CALCULATOR */}
                        {activeTab === 'emergency' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <ShieldCheck className="text-teal-600" /> Emergency Fund Calculator
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Expenses (KES)</label>
                                            <input type="number" value={emMonthlyExpenses} onChange={e => setEmMonthlyExpenses(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                                            <input type="range" min="5000" max="500000" step="5000" value={emMonthlyExpenses} onChange={e => setEmMonthlyExpenses(Number(e.target.value))} className="w-full mt-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Months of Cover Needed</label>
                                            <div className="flex gap-3 flex-wrap">
                                                {[3, 6, 9, 12].map(m => (
                                                    <button key={m} onClick={() => setEmMonths(m)}
                                                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${emMonths === m ? 'bg-teal-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-teal-50'
                                                            }`}>{m} months</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Already Saved (KES)</label>
                                            <input type="number" value={emSaved} onChange={e => setEmSaved(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow" />
                                        </div>
                                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-sm text-teal-800">
                                            <p>Experts recommend <strong>3–6 months</strong> of expenses. Kenyans with dependants should aim for <strong>6–12 months</strong>.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-teal-50 rounded-2xl p-8 flex flex-col justify-center border border-teal-100">
                                    <p className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-1 text-center">Target Fund Size</p>
                                    <p className="text-5xl font-bold text-teal-700 mb-6 text-center">
                                        KES {(emMonthlyExpenses * emMonths).toLocaleString()}
                                    </p>
                                    <div className="w-full border-t border-teal-200 pt-5 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Already Saved:</span>
                                            <span className="font-bold text-teal-600">KES {emSaved.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Still Needed:</span>
                                            <span className={`font-bold ${emSaved >= emMonthlyExpenses * emMonths ? 'text-green-600' : 'text-rose-600'}`}>
                                                {emSaved >= emMonthlyExpenses * emMonths
                                                    ? '✅ Goal Reached!'
                                                    : `KES ${(emMonthlyExpenses * emMonths - emSaved).toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Save KES 5,000/mo to reach in:</span>
                                            <span className="font-bold">{emSaved < emMonthlyExpenses * emMonths ? `${Math.ceil((emMonthlyExpenses * emMonths - emSaved) / 5000)} months` : '—'}</span>
                                        </div>
                                        <div className="w-full bg-teal-100 rounded-full h-3 mt-2">
                                            <div className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (emSaved / (emMonthlyExpenses * emMonths)) * 100).toFixed(1)}%` }}></div>
                                        </div>
                                        <p className="text-xs text-teal-700 font-semibold text-center">{Math.min(100, ((emSaved / (emMonthlyExpenses * emMonths)) * 100)).toFixed(0)}% funded</p>
                                    </div>
                                    <div className="mt-5 p-3 bg-teal-100 rounded-xl text-xs text-teal-900 border border-teal-200">
                                        🛡️ <strong>Why it matters:</strong> Job loss, medical bills, car repairs — an emergency fund means you never have to take a loan in a crisis.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DEBT PAYOFF CALCULATOR */}
                        {activeTab === 'debt' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <CreditCard className="text-rose-600" /> Debt Payoff Planner
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Debt Balance (KES)</label>
                                            <input type="number" value={debtBalance} onChange={e => setDebtBalance(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-shadow" />
                                            <input type="range" min="10000" max="5000000" step="10000" value={debtBalance} onChange={e => setDebtBalance(Number(e.target.value))} className="w-full mt-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Interest Rate (% p.a)</label>
                                            <input type="number" value={debtRate} onChange={e => setDebtRate(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Payment (KES)</label>
                                            <input type="number" value={debtPayment} onChange={e => setDebtPayment(Number(e.target.value))}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-shadow" />
                                            <input type="range" min="1000" max="200000" step="1000" value={debtPayment} onChange={e => setDebtPayment(Number(e.target.value))} className="w-full mt-2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-rose-50 rounded-2xl p-8 flex flex-col justify-center border border-rose-100">
                                    <p className="text-gray-500 font-medium uppercase tracking-wide text-sm mb-1 text-center">Debt-Free In</p>
                                    <p className="text-5xl font-bold text-rose-600 mb-1 text-center">
                                        {debtResult.months >= 999 ? '∞' : debtResult.months}
                                    </p>
                                    <p className="text-rose-700 font-semibold mb-5 text-center">
                                        {debtResult.months >= 999 ? 'Payment too low — increase it!' : `months (~${(debtResult.months / 12).toFixed(1)} years)`}
                                    </p>
                                    <div className="w-full border-t border-rose-200 pt-5 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Original Debt:</span>
                                            <span className="font-bold">KES {debtBalance.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Paid:</span>
                                            <span className="font-bold">KES {debtResult.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest Cost (KES):</span>
                                            <span className="font-bold text-rose-600">KES {debtResult.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Interest % of Debt:</span>
                                            <span className="font-bold text-rose-600">{debtBalance > 0 ? ((debtResult.totalInterest / debtBalance) * 100).toFixed(0) : 0}%</span>
                                        </div>
                                        {/* Visual bar */}
                                        <div className="mt-2">
                                            <div className="flex text-xs text-gray-500 justify-between mb-1">
                                                <span>Principal</span><span>Interest paid</span>
                                            </div>
                                            <div className="w-full h-3 rounded-full bg-gray-200 flex overflow-hidden">
                                                <div className="bg-rose-300 h-3 rounded-l-full transition-all duration-500"
                                                    style={{ width: `${debtResult.totalPaid > 0 ? Math.min(100, (debtBalance / debtResult.totalPaid) * 100).toFixed(1) : 0}%` }}></div>
                                                <div className="bg-rose-600 h-3 rounded-r-full flex-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 p-3 bg-rose-100 rounded-xl text-xs text-rose-900 border border-rose-200">
                                        ⚡ <strong>Quick win:</strong> Adding even KES 1,000 extra per month can save you months of payments and thousands in interest.
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </section>

            {/* CURATED RESOURCES */}
            <section id="resources" className="py-20 bg-white">
                <div className="container-custom">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Curated for Your Growth</h2>
                        <p className="text-gray-600">Hand-picked resources to level up your financial knowledge.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Books */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><BookOpen size={24} /></div>
                                <h3 className="text-2xl font-bold">Must-Read Books</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {books.map((book, i) => (
                                    <div key={i} className={`p-6 rounded-2xl ${book.color} bg-opacity-20 hover:scale-105 transition-transform cursor-pointer`}>
                                        <div className="h-48 bg-white/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden shadow-md">
                                            <img src={book.cover} alt={book.title} className="h-full w-full object-cover rounded-lg" />
                                        </div>
                                        <h4 className="font-bold leading-tight mb-1">{book.title}</h4>
                                        <p className="text-sm opacity-80 decoration-slice">by {book.author}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Podcasts */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Headphones size={24} /></div>
                                <h3 className="text-2xl font-bold">Top Podcasts</h3>
                            </div>
                            <div className="space-y-4">
                                {podcasts.map((pod, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer bg-white">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${pod.color}`}>
                                            <Headphones size={24} />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{pod.title}</h4>
                                            <p className="text-sm text-gray-500">{pod.host}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SHILINGI BUDDY Chatbot CTA */}
            <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="relative z-10 container-custom">
                    <div className="flex flex-col md:flex-row items-center gap-12 bg-primary-600 rounded-3xl p-10 md:p-16 shadow-2xl">
                        <div className="w-full md:w-1/2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
                                <MessageCircle size={16} /> Meet Shilingi Buddy
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Need instant answers? <br />Just ask Buddy.
                            </h2>
                            <p className="text-xl text-primary-100 mb-8 max-w-lg">
                                Your 24/7 financial assistant. Ask about rates, define terms, or get quick tips on saving money.
                            </p>
                            <button className="px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2">
                                Start Chatting <MessageCircle size={20} />
                            </button>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center">
                            {/* Chat Interface Mockup */}
                            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-2 text-xs font-bold text-gray-500">Shilingi Buddy AI</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none self-start max-w-[80%] text-sm">
                                        Hello! I'm Buddy. How can I help you save today? 👋
                                    </div>
                                    <div className="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[80%] ml-auto text-sm">
                                        What's the best way to save for a car? 🚗
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none self-start max-w-[80%] text-sm">
                                        I recommend the 50/30/20 rule! Start by setting aside 20% of your income...
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    <div className="h-10 bg-white border border-gray-200 rounded-full w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-20 bg-white text-center">
                <div className="container-custom max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Ready to take control?</h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Join thousands of Kenyans using Shilingi Moves to master their money.
                    </p>
                    <Link to="/signup" className="inline-flex px-10 py-5 bg-primary-600 text-white font-bold rounded-full shadow-xl hover:bg-primary-500 hover:scale-105 transition-all text-lg items-center gap-2">
                        Explore Smart Tools <ArrowRight />
                    </Link>
                </div>
            </section>

            <Footer showCTA={false} />
        </div>
    );
};

export default ToolsPage;
