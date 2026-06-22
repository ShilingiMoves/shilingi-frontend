import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Calculator, BookOpen, Headphones, MessageCircle,
    PieChart, TrendingUp, DollarSign, Calendar,
    ArrowRight, CheckCircle2, RefreshCcw, Percent,
    Target, ShieldCheck, CreditCard, X, Sparkles, Navigation,
    Map, Search, Lock, ChevronRight, Play
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

    const [selectedCalc, setSelectedCalc] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const openShilingiBuddy = (prompt = 'Help me choose the right Shilingi Moves tool') => {
        window.dispatchEvent(new CustomEvent('shilingi-buddy-open', { detail: { prompt } }));
    };

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
        { id: 'loan', label: 'Loan Repayment', desc: 'Know your monthly repayment before you borrow.', icon: Calculator, category: 'Borrowing' },
        { id: 'investment', label: 'Investment Growth', desc: 'See how compound interest grows your wealth.', icon: TrendingUp, category: 'Investing' },
        { id: 'budget', label: 'Budget Planner', desc: 'Apply the 50/30/20 rule to your income.', icon: PieChart, category: 'Planning' },
        { id: 'savings', label: 'Savings Goal', desc: 'Find out exactly how long it will take to reach your goal.', icon: Target, category: 'Saving' },
        { id: 'emergency', label: 'Emergency Fund', desc: 'Calculate how much safety net you really need.', icon: ShieldCheck, category: 'Saving' },
        { id: 'debt', label: 'Debt Payoff', desc: 'Plan your journey to becoming debt-free.', icon: CreditCard, category: 'Borrowing' },
    ];

    const books = [
        { title: 'The Smart Money Woman', author: 'Arese Ugwu', color: 'bg-rose-100 text-rose-700', cover: smartMoneyWoman, level: 'Beginner', badge: 'Free Chapter' },
        { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', color: 'bg-purple-100 text-purple-700', cover: richDadPoorDad, level: 'Inter.', badge: 'Pro Library' },
        { title: 'The Psychology of Money', author: 'Morgan Housel', color: 'bg-amber-100 text-amber-700', cover: psychologyOfMoney, level: 'All Levels', badge: 'Pro Library' },
        { title: 'The Wealth of Wisdom', author: 'Tom McCullough', color: 'bg-blue-100 text-blue-700', cover: wealthWisdom, level: 'Advanced', badge: 'Premium' },
    ];

    const podcasts = [
        { title: 'The Financially Incorrect Podcast', host: 'Validated', color: 'bg-green-100 text-green-700', related: 'Budget Calculator' },
        { title: 'Money Wise', host: 'Shilingi Moves', color: 'bg-primary-100 text-primary-700', related: 'Emergency Fund' },
        { title: 'Kenyan Wallstreet', host: 'Market News', color: 'bg-gray-100 text-gray-700', related: 'Investment Growth' },
    ];

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* HERO SECTION */}
            <section className="relative text-white min-h-[75vh] flex items-center overflow-hidden bg-gray-900 border-b-8 border-primary-600">
                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source src={toolsHeroVideo} type="video/mp4" />
                </video>

                {/* Subtle overlay for text legibility */}
                <div className="absolute inset-0 bg-gray-900/40 z-10" />

                <div className="container-custom relative z-20 py-20 lg:py-32 flex flex-col items-center justify-center text-center">
                    <div className="max-w-3xl mx-auto flex flex-col items-center">
                        <h1 className="text-4xl sm:text-5xl md:text-[56px] text-white mb-6 font-medium tracking-tight leading-[1.2]">
                            Make Smart Decisions<br className="hidden sm:block" />
                            with <span className="text-primary-400">Tools That Work for<br className="hidden sm:block" /> You</span>
                        </h1>
                        <p className="text-base sm:text-lg text-white/90 mb-10 max-w-2xl leading-relaxed font-light">
                            Practical digital tools designed for Kenyan realities. Plan your money, compare products, and grow your wealth.
                        </p>
                        <div className="flex justify-center w-full">
                            <Link to="/signup" className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-full shadow-xl hover:bg-gray-50 hover:scale-105 transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto text-sm sm:text-base min-w-[200px]">
                                <Calculator size={18} className="text-primary-600" /> Launch My Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK TOOL SHORTCUT STRIP (Sticky on scroll) */}
            <div className="sticky top-[72px] lg:top-[88px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-4">
                <div className="container-custom">
                    <div className="flex overflow-x-auto gap-3 scrollbar-hide sm:justify-center">
                        <button onClick={() => scrollToSection('calculators')} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-bold text-sm rounded-full border border-gray-200 hover:border-primary-200 transition-all whitespace-nowrap shadow-sm">
                            <Calculator size={16} className="text-primary-600" /> Calculators
                        </button>
                        <button onClick={() => scrollToSection('books')} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-bold text-sm rounded-full border border-gray-200 hover:border-primary-200 transition-all whitespace-nowrap shadow-sm">
                            <BookOpen size={16} className="text-rose-600" /> Curated Books
                        </button>
                        <button onClick={() => scrollToSection('podcasts')} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-bold text-sm rounded-full border border-gray-200 hover:border-primary-200 transition-all whitespace-nowrap shadow-sm">
                            <Headphones size={16} className="text-indigo-600" /> Podcasts
                        </button>
                        <button onClick={() => scrollToSection('buddy')} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-primary-50 hover:text-primary-700 text-gray-700 font-bold text-sm rounded-full border border-gray-200 hover:border-primary-200 transition-all whitespace-nowrap shadow-sm">
                            <MessageCircle size={16} className="text-blue-600" /> Shilingi Buddy
                        </button>
                    </div>
                </div>
            </div>

            {/* CALCULATORS HUB SECTION */}
            <section id="calculators" className="py-20 bg-gray-50 border-b border-gray-200">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Financial Calculators</h2>
                            <p className="text-gray-600 max-w-xl">Your financial roadmap deserves clarity. Select a tool below to crunch your numbers.</p>
                        </div>
                        {/* Filter Bar */}
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                            {['All', 'Borrowing', 'Saving', 'Investing', 'Planning'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calculator Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {calculators.filter(c => activeFilter === 'All' || c.category === activeFilter).map(calc => (
                            <div key={calc.id} onClick={() => setSelectedCalc(calc.id)} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <calc.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{calc.label}</h3>
                                <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{calc.desc}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-primary-600 font-bold text-sm flex items-center gap-1 group-hover:underline">
                                        Open Calculator <ArrowRight size={14} />
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        <Lock size={12} /> Save to Dash
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CALCULATOR MODAL OVERLAY */}
            <div
                className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${selectedCalc ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSelectedCalc(null)} />

                {/* Modal Container */}
                <div
                    className={`relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-transform duration-300 ${selectedCalc ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                                {selectedCalc && React.createElement(calculators.find(c => c.id === selectedCalc)?.icon || Calculator, { size: 20 })}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedCalc && calculators.find(c => c.id === selectedCalc)?.label}
                            </h3>
                        </div>
                        <button onClick={() => setSelectedCalc(null)} className="p-2 bg-gray-50 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Scrollable Content */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-grow" style={{ WebkitOverflowScrolling: 'touch' }}>

                        {/* LOAN CALCULATOR */}
                        {selectedCalc === 'loan' && (
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
                        {selectedCalc === 'investment' && (
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
                        {selectedCalc === 'budget' && (
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
                        {selectedCalc === 'savings' && (
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
                        {selectedCalc === 'emergency' && (
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
                        {selectedCalc === 'debt' && (
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

                        {/* UNIVERSAL DASHBOARD CTA INSIDE MODAL */}
                        {selectedCalc && (
                            <div className="mt-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 md:p-8 border border-primary-200 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Want to save and track this result over time?</h4>
                                    <p className="text-gray-600 mb-6 max-w-lg mx-auto text-sm">Create your free Shilingi Dashboard to save scenarios, compare products, and get personalized advice tailored to your goals.</p>
                                    <Link to="/signup" onClick={() => setSelectedCalc(null)} className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                        Create Free Dashboard <ArrowRight size={18} />
                                    </Link>
                                </div>
                                <Sparkles className="absolute -top-6 -right-6 text-primary-300 w-32 h-32 opacity-30 pointer-events-none group-hover:rotate-12 transition-transform duration-700" />
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* TOOLS FOR EVERY STAGE (JOURNEY MATRIX) */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <div className="container-custom relative z-10">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-full text-xs font-bold tracking-wide mb-4 uppercase">
                            <Map size={14} /> Guided Journey
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tools for Every Stage</h2>
                        <p className="text-gray-600">Not sure where to start? Follow our guided path to financial freedom. Select a stage to see your toolkit.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { phase: '1. Getting Started', desc: 'Building the foundation', tools: ['Budget Planner', 'Savings Calculator', 'Beginner Books'] },
                            { phase: '2. Building Stability', desc: 'Protecting your baseline', tools: ['Emergency Fund', 'Insurance Compare', 'Money Mistakes Pod'] },
                            { phase: '3. Growing Wealth', desc: 'Making money work harder', tools: ['Investment Growth', 'Investment Compare', 'Advanced Books'] },
                            { phase: '4. Retirement', desc: 'Securing the future', tools: ['Retirement Planner', 'Annuities Info', 'Advisors Hub'] }
                        ].map((stage, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col relative overflow-hidden cursor-pointer" onClick={() => scrollToSection('calculators')}>
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-10 rounded-bl-full ${i === 0 ? 'from-rose-500' : i === 1 ? 'from-amber-500' : i === 2 ? 'from-green-500' : 'from-purple-500'}`}></div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{stage.phase}</h3>
                                <p className="text-sm text-gray-500 mb-6">{stage.desc}</p>
                                <div className="space-y-3 mt-auto relative z-10">
                                    {stage.tools.map((tool, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                                            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-rose-400' : i === 1 ? 'bg-amber-400' : i === 2 ? 'bg-green-400' : 'bg-purple-400'}`}></div> {tool}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CURATED RESOURCES */}
            <section id="books" className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="container-custom">
                    <div className="mb-16 md:flex justify-between items-end">
                        <div className="max-w-xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Curated for Your Growth</h2>
                            <p className="text-gray-600 text-lg">Books and podcasts hand-picked to sharpen your wallet.</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Books Column */}
                        <div className="lg:col-span-7">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <BookOpen className="text-rose-500" /> Essential Books
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {books.map((book, i) => (
                                    <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col">
                                        <div className={`h-40 ${book.color} bg-opacity-20 flex items-center justify-center p-4 relative`}>
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-md text-gray-800 shadow-sm">{book.badge}</div>
                                            <img src={book.cover} alt={book.title} className="h-full w-auto object-contain rounded drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col">
                                            <div className="text-xs font-bold text-gray-400 mb-2 tracking-wide uppercase">{book.level}</div>
                                            <h4 className="font-bold text-lg leading-tight mb-1 text-gray-900 group-hover:text-primary-600 transition-colors">{book.title}</h4>
                                            <p className="text-sm text-gray-500 mb-4">by {book.author}</p>
                                            <Link to="/signup" className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-1 text-primary-600 font-bold text-xs hover:text-primary-700">
                                                <Lock size={14} /> Unlock Dashboard to Read
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Podcasts Column */}
                        <div className="lg:col-span-5" id="podcasts">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Headphones className="text-indigo-500" /> Must-Listen Podcasts
                            </h3>
                            <div className="space-y-4">
                                {podcasts.map((pod, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group cursor-pointer flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${pod.color}`}>
                                            <Headphones size={24} />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{pod.title}</h4>
                                            <p className="text-sm text-gray-500 truncate">{pod.host}</p>
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                                Related: <span className="text-primary-600 font-bold">{pod.related}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Play size={16} className="ml-0.5" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center">
                                <h4 className="font-bold text-indigo-900 mb-2">Want to save favorites?</h4>
                                <p className="text-sm text-indigo-700 mb-4">Create your Shilingi Dashboard to bookmark podcasts and books.</p>
                                <Link to="/signup" className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full shadow-md transition-colors">Create Free Account</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SHILINGI BUDDY DEMO */}
            <section id="buddy" className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-gray-900 to-gray-900"></div>

                <div className="relative z-10 container-custom">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 overflow-hidden flex flex-col lg:flex-row items-center gap-12 backdrop-blur-md">

                        <div className="w-full lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-xs font-bold tracking-wide mb-6 uppercase border border-primary-500/30">
                                <MessageCircle size={14} /> AI Beta
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                                Meet your 24/7 financial companion.
                            </h2>
                            <p className="text-lg text-gray-300 mb-8 max-w-lg">
                                Shilingi Buddy helps you decode jargon, run quick math, and compare accounts instantly. See how it works here, then unlock personalized advice in your dashboard.
                            </p>

                            <div className="space-y-3 mb-8">
                                <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Try clicking a prompt:</p>
                                <button
                                    type="button"
                                    onClick={() => openShilingiBuddy('Is a Sacco better than a bank?')}
                                    className="w-full text-left px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-sm font-medium flex items-center justify-between group"
                                >
                                    "Is a Sacco better than a bank?" <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openShilingiBuddy('How much should I save monthly?')}
                                    className="w-full text-left px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-sm font-medium flex items-center justify-between group"
                                >
                                    "How much should I save monthly?" <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => openShilingiBuddy()}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full transition-colors shadow-lg shadow-primary-900/50"
                            >
                                Unlock Shilingi Buddy <MessageCircle size={16} />
                            </button>
                        </div>

                        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                            {/* Chat Interface Mockup */}
                            <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden text-gray-900 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 group border border-gray-200">
                                <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <Sparkles size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Shilingi Buddy</h4>
                                            <div className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div> Online
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 bg-gray-100 h-80 overflow-y-auto">
                                    <div className="bg-white p-3.5 shadow-sm rounded-2xl rounded-tl-none self-start max-w-[85%] text-sm border border-gray-100">
                                        Hello! I'm Buddy. I can help you compare products, run numbers, or explain financial terms. What's on your mind? 👋
                                    </div>
                                    <div className="bg-primary-600 text-white p-3.5 shadow-sm rounded-2xl rounded-tr-none self-end max-w-[85%] ml-auto text-sm delay-100">
                                        Can I afford a KES 5M mortgage? 🏠
                                    </div>
                                    <div className="bg-white p-3.5 shadow-sm rounded-2xl rounded-tl-none self-start max-w-[85%] text-sm border border-gray-100 delay-200 relative overflow-hidden">
                                        <div className="mb-2">To give you an accurate answer, I need to look at your current income and expenses.</div>

                                        {/* Gated Content Blur */}
                                        <div className="relative mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                                            <div className="blur-sm opacity-40 text-xs w-full">
                                                Based on a 15-year term at 13% interest, your monthly payment would be ~KES 63,000.
                                            </div>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
                                                <Lock size={20} className="text-gray-400 mb-1" />
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Sign in to unlock</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <div className="h-12 bg-gray-50 border border-gray-200 rounded-xl w-full flex items-center px-4">
                                        <span className="text-gray-400 text-sm">Ask Buddy anything...</span>
                                        <button className="ml-auto w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 bg-primary-600 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container-custom max-w-3xl relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Want all your tools in one place?</h2>
                    <p className="text-xl text-primary-100 mb-10 leading-relaxed">
                        Join thousands of Kenyans using Shilingi Moves to track their goals, compare the best accounts, and master their money.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/signup" className="inline-flex px-10 py-5 bg-white text-primary-800 font-bold rounded-full shadow-2xl hover:bg-gray-50 hover:-translate-y-1 transition-all text-lg items-center justify-center gap-2">
                            Create Free Dashboard <ArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ToolsPage;
