
import React, { useMemo, useState } from 'react';
import {
    Building2,
    Globe,
    HeartHandshake,
    Landmark,
    MessageCircle,
    PiggyBank,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    Zap,
    WalletCards,
    X,
} from 'lucide-react';

const BRAND_GREEN = '#1f9c72';

const currencyFormatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const compareTabs = [
    { id: 'loans', label: 'Loans', icon: '🏦' },
    { id: 'savings', label: 'MMFs', icon: '💰' },
    { id: 'investments', label: 'Investments', icon: '📈' },
    { id: 'banking', label: 'Banking', icon: '🧾' },
    { id: 'transfers', label: 'Transfers', icon: '🌍' },
    { id: 'retirement', label: 'Retirement', icon: '🛡️' },
    { id: 'mortgage', label: 'Mortgages', icon: '🏠' },
    { id: 'insurance', label: 'Insurance', icon: '✅' },
];

const wizardQuestions = [
    { key: 'goal', title: 'What is your primary financial goal?', options: ['Save', 'Borrow', 'Invest', 'Protect', 'Transfer', 'Retire'] },
    { key: 'horizon', title: 'What is your time horizon?', options: ['Under 1 year', '1-3 years', '3-5 years', '5+ years'] },
    { key: 'risk', title: 'What is your risk comfort level?', options: ['Conservative', 'Moderate', 'Aggressive', 'Unsure'] },
    { key: 'amount', title: 'How much can you commit monthly?', options: ['Under KES 5K', 'KES 5K-20K', 'KES 20K-50K', 'Over KES 50K'] },
];

const wizardPicks = {
    Save: [
        ['Nabo Africa MMF', 'Net yield ~12.9% p.a. - Same-day withdrawal - Min KES 1,000', 'Best Yield'],
        ['KCB Goal Savings', 'Up to 7% p.a. - Zero fees - M-Pesa integrated', 'Zero Fees'],
        ['T-Bills via Dyer & Blair', '~13-14% return - 91-day - CBK-backed', 'Lowest Risk'],
    ],
    Borrow: [
        ['Stanbic Bank Personal Loan', 'APR 11.8-13.5% - Up to 7M - 24-48 hr approval', 'Lowest APR'],
        ['Stima SACCO Development Loan', 'APR 10.5-12.5% - Member-backed', 'SACCO Pick'],
        ['KCB M-Pesa Credit', 'Instant credit - Up to 1M - Salary-linked', 'Instant Access'],
    ],
    Invest: [
        ['Dyer & Blair - Treasury Bonds', '~13-14% returns - CBK-backed - KES 50K min.', 'Safe Growth'],
        ['Ziidi Trader', 'From KES 100/share - M-Pesa funded - CMA regulated', 'Beginner Friendly'],
        ['Ndovu - Global ETFs', 'Diversified offshore - From KES 500 - CMA licensed', 'Global Exposure'],
    ],
    Protect: [
        ['Jubilee Health Insurance', 'Comprehensive - Family of 4 from KES 4,000/mo', 'Top Claims'],
        ['Britam Comprehensive Motor', 'From KES 22,000/yr - AI-assisted claims', 'Fastest Claims'],
        ['Britam Professional Indemnity', 'From KES 15,000/yr - PI + D&O cover', 'Professionals'],
    ],
    Transfer: [
        ['Wise', '0.5-1.5% total cost - Mid-market rate - Instant to M-Pesa', 'Best Rate'],
        ['WorldRemit', 'From USD 1.99 - M-Pesa, Airtel, Bank, Cash pickup', 'Most Options'],
        ['M-Pesa', 'Instant - 0-55 KES/transfer - Widest network', 'Local Leader'],
    ],
    Retire: [
        ['Old Mutual IPP', '9-12% returns - Flexible from KES 1,000/mo', 'Flexible'],
        ['Britam Umbrella Scheme', '9-12% pooled returns - SME & employer-friendly', 'Employer Pick'],
        ['Jubilee Personal Pension', '8-11% - M-Pesa contributions - Easy enrollment', 'Accessible'],
    ],
};

export const compareModules = [
    {
        id: 'loans',
        order: 'Module 1 of 8',
        title: 'Loans & Credit',
        description: 'Avoid expensive debt - compare true cost of credit, not just headline rates.',
        insight: 'Banks and SACCOs offer the lowest true cost of credit. Digital lenders are convenient but much more expensive.',
        filters: ['Lowest APR', 'Loan Limit', 'Speed'],
        segments: [
            {
                id: 'banks',
                label: 'Banks',
                columns: ['Provider', 'Type', 'Limits', 'APR', 'Term', 'Speed', 'Action'],
                rows: [
                    ['Equity Bank', 'Salary Advance', 'Up to 3M', '14.0 - 16.0%', '12-60 mo', '48-72 hrs', 'Apply'],
                    ['NCBA Bank', 'Loop Personal', 'Up to 4M', '14.5 - 16.5%', '12-60 mo', '24-48 hrs', 'Apply'],
                    ['Stanbic Bank', 'Commercial Bank', '100K - 7M', '11.8 - 13.5%', '12-96 mo', '24-48 hrs', 'Apply'],
                    ['Standard Chartered', 'Commercial Bank', '50K - 5M', '12.7 - 14.0%', '12-60 mo', '48 hrs', 'Apply'],
                    ['KCB Bank', 'Commercial Bank', 'Up to 5M', '13.8 - 15.5%', '12-72 mo', '24-72 hrs', 'Apply'],
                ],
            },
            {
                id: 'saccos',
                label: 'SACCOs',
                columns: ['Provider', 'Type', 'Limits', 'APR', 'Term', 'Speed', 'Action'],
                rows: [
                    ['Stima DT SACCO', 'Development Loan', 'Up to 10M+', '10.5 - 12.5%', '12-84 mo', '48-72 hrs', 'Apply'],
                    ['Mwalimu National', 'Wezesha / Normal', 'Up to 5M', '11.5 - 13.5%', '12-72 mo', '24-72 hrs', 'Apply'],
                ],
            },
            {
                id: 'microfinance',
                label: 'Microfinance',
                columns: ['Provider', 'Type', 'Limits', 'APR', 'Term', 'Speed', 'Action'],
                rows: [
                    ['Faulu Microfinance', 'Personal / Business', '50K - 6M', '16.5 - 19.5%', '6-48 mo', '24-72 hrs', 'Apply'],
                    ['KWFT (Women)', 'Salary / Asset', '30K - 3M', '17.0 - 20.0%', '6-36 mo', '48 hrs', 'Apply'],
                    ['Rafiki Microfinance', 'Personal / Trade', '20K - 2M', '17.5 - 21.0%', '3-36 mo', '24-48 hrs', 'Apply'],
                    ['SMEP Microfinance', 'Micro Enterprise', '10K - 1.5M', '18.0 - 22.0%', '3-24 mo', '24-72 hrs', 'Apply'],
                    ['Sumac Microfinance', 'Personal / Emergency', '15K - 1M', '18.5 - 23.0%', '3-24 mo', '<24 hrs', 'Apply'],
                ],
            },
            {
                id: 'digital',
                label: 'Digital Lenders',
                columns: ['Provider', 'Type', 'Limits', 'Effective APR', 'Term', 'Speed', 'Action'],
                rows: [
                    ['Little Pesa', 'Flexipay', '1K-300K', '11-16%/mo', '1-12 mo', 'Instant', 'Apply'],
                    ['Tala', 'Instant Cash', '500-50K', '0.3-0.6%/day', '1-3 mo', 'Instant', 'Apply'],
                ],
            },
        ],
    },
    {
        id: 'savings',
        order: 'Module 2 of 8',
        title: 'Savings & Money Market Funds',
        description: 'Park cash safely while beating inflation - net returns, liquidity and minimums compared.',
        insight: 'Top MMFs offer strong real returns above inflation with same-day liquidity.',
        filters: ['Highest Yield', 'Min. Investment', 'Liquidity'],
        segments: [
            {
                id: 'mmf',
                label: 'Money Market Funds',
                columns: ['Provider', 'Net Yield', 'Min. Investment', 'Fee', 'Withdrawal', 'Risk', 'Action'],
                rows: [
                    ['Nabo Africa MMF', '~12.9%', 'KES 1,000', '0.8-1.2%', 'Same-day / 24 hrs', 'Low Risk', 'Invest'],
                    ['Gulfcap MMF', '10.8 - 11.4%', 'KES 5,000', '0.9-1.3%', 'Same-day / 24 hrs', 'Low Risk', 'Invest'],
                    ['Etica MMF', '10.9 - 11.3%', 'KES 1,000', '1.0-1.4%', '24-48 hrs', 'Low Risk', 'Invest'],
                    ['Lofty-Corban MMF', '10.5 - 11.1%', 'KES 1,000', '0.8-1.2%', '24-72 hrs', 'Low Risk', 'Invest'],
                ],
            },
            {
                id: 'ut',
                label: 'Other Unit Trusts',
                columns: ['Provider', 'Fund Types', 'Min. Investment', 'Annual Fee', 'Regulation', 'Best For', 'Action'],
                rows: [
                    ['Sanlam Unit Trust', 'Equity, Balanced, Fixed Income', 'KES 1,000', '1.5-2.0%', 'CMA', 'Broad diversification', 'Invest'],
                    ['Britam Unit Trusts', 'Equity, Balanced, Fixed Income', 'KES 1,000', '1.5-2.0%', 'CMA', 'Medium-to-long term growth', 'Invest'],
                    ['CIC Unit Trust', 'Equity, Balanced & Special', 'KES 5,000', '1.8-2.2%', 'CMA', 'Family, education & retirement', 'Invest'],
                    ['Standard Investment Trust', 'Multi-asset & Balanced', 'KES 5,000', '1.7-2.1%', 'CMA', 'Conservative-to-moderate growth', 'Invest'],
                    ['Old Mutual / ICEA Lion', 'Equity & Balanced Funds', 'KES 5,000', '1.6-2.2%', 'CMA', 'Higher equity exposure for growth', 'Invest'],
                ],
            },
        ],
    },
    {
        id: 'investments',
        order: 'Module 3 of 8',
        title: 'Investment Solutions',
        description: 'Choose the right growth engine across govt. securities, NSE equities, special funds and offshore options.',
        insight: 'Use the wizard to match products to your goal, horizon and risk appetite.',
        filters: ['Best Risk-Adj. Return', 'CMA Regulated', 'Min. Investment'],
        segments: [
            {
                id: 'bonds',
                label: 'Govt Bonds & T-Bills',
                columns: ['Provider', 'Instruments', 'Minimum', 'Fees', 'Regulation', 'Best For', 'Action'],
                rows: [
                    ['Genghis Capital', 'Gov. Securities & Fixed Income', 'KES 50,000', '0.8-1.2%', 'CMA', 'Retail access to institutional bonds', 'Open Account'],
                    ['KCB Investments', 'Treasury Bills & Bonds', 'KES 100,000', '0.5-1%', 'CBK', 'Salary-linked government securities', 'Open Account'],
                    ['Dyer & Blair', 'T-Bills, T-Bonds', 'KES 50,000', '0.5-1%', 'CBK + CMA', 'Conservative safety', 'Open Account'],
                    ['Standard Chartered', 'T-Bills, T-Bonds', 'KES 100,000', '0.5-1%', 'CBK + CMA', 'Balanced fixed income', 'Open Account'],
                ],
            },
            {
                id: 'nse',
                label: 'NSE Shares',
                columns: ['Provider', 'Instruments', 'Minimum', 'Fees', 'Regulation', 'Best For', 'Action'],
                rows: [
                    ['Ziidi Trader', 'NSE-listed shares & bonds', 'KES 100', '~1.5% per trade', 'CMA', 'Beginners via M-Pesa', 'Open Account'],
                    ['Ndovu', 'NSE Stocks, ETFs & Indices', 'KES 500', '1.5% annual', 'CMA', 'Diversified local portfolios', 'Open Account'],
                ],
            },
        ],
    },
    {
        id: 'banking',
        order: 'Module 4 of 8',
        title: 'Bank & SACCO Accounts',
        description: 'Reduce fees and earn better interest across banks and SACCOs.',
        insight: 'SACCO savings accounts often deliver better yields, while banks win on liquidity and convenience.',
        filters: ['Lowest Fees', 'Highest Interest', 'Mobile Features'],
        segments: [
            {
                id: 'banks',
                label: 'Bank Accounts',
                columns: ['Provider', 'Account Type', 'Monthly Fee', 'Interest', 'Digital Features', 'Ideal For', 'Action'],
                rows: [
                    ['Equity Bank', 'Current Account', 'KES 0', '4-6%', 'Excellent app + USSD', 'Salary and transactions', 'Open'],
                    ['KCB Bank', 'Savings Account', 'KES 0', 'Up to 7%', 'Strong app + M-Pesa', 'Savings + everyday use', 'Open'],
                    ['NCBA (Loop / Gold)', 'Current + Savings', 'KES 0-50', '4-7%', 'Embedded M-Pesa, virtual cards', 'Millennials, digital users', 'Open'],
                    ['Stanbic Bank', 'Savings + Current', 'KES 0', 'Competitive (above 5K)', 'Good app + internet banking', 'Low-fee savings + transactions', 'Open'],
                    ['Co-operative Bank', 'Current + Savings', 'KES 0-50', 'Up to 7-9% on savings', 'Solid app + wide branch network', 'Family & group savers', 'Open'],
                ],
            },
            {
                id: 'saccos',
                label: 'SACCO Accounts',
                columns: ['Provider', 'Account Type', 'Monthly Fee', 'Interest', 'Digital Features', 'Ideal For', 'Action'],
                rows: [
                    ['Stima DT SACCO', 'Ordinary / Alpha Savings', 'KES 0', 'Up to 10-12%', 'App + USSD', 'Energy sector savers', 'Join'],
                    ['Mwalimu National', 'Teachers Savings', 'Low (0-100)', '10-13%', 'Mobile app + payroll deduction', 'Teachers', 'Join'],
                ],
            },
            {
                id: 'microfinance',
                label: 'Microfinance',
                columns: ['Provider', 'Account Type', 'Monthly Fee', 'Interest', 'Digital Features', 'Ideal For', 'Action'],
                rows: [
                    ['Faulu Microfinance', 'Current + Savings', 'KES 0-100', '4-8%', 'Mobile banking + agent network', 'SMEs and personal banking', 'Open'],
                    ['KWFT', 'Women Savings Account', 'KES 0', '5-9%', 'Mobile banking + branch access', 'Women savers and groups', 'Open'],
                    ['Rafiki Microfinance', 'Savings Account', 'KES 0-50', '4-7%', 'App + branch support', 'Daily savers and traders', 'Open'],
                    ['SMEP Microfinance', 'Business + Savings', 'KES 0-100', '5-8%', 'Digital banking + SME tools', 'Micro and small businesses', 'Open'],
                    ['Sumac Microfinance', 'Current / Deposit Account', 'KES 0-50', '4-7%', 'Mobile access + relationship support', 'Professionals and SMEs', 'Open'],
                ],
            },
        ],
    },
    {
        id: 'transfers',
        order: 'Module 5 of 8',
        title: 'Money Transfers',
        description: 'Compare local transfers and global Diaspora remittances.',
        insight: 'Wise offers strong overall value, while WorldRemit and Remitly excel on payout options and speed.',
        filters: ['Lowest Total Cost', 'Speed', 'Payout Method'],
        segments: [
            {
                id: 'local',
                label: 'Local Transfers',
                columns: ['Provider', 'Typical Fee', 'Speed', 'Limit', 'Payout', 'Best For', 'Action'],
                rows: [
                    ['M-Pesa', 'KES 0-55', 'Instant', 'Up to KES 500K', 'Wallet, Paybill, Bank', 'Daily local transfers', 'Add'],
                    ['Airtel Money', 'Free on-net / 0-50', 'Instant', 'Up to KES 500K', 'Wallet, bank', 'Low-cost on-network transfers', 'Add'],
                    ['T-Kash (Telkom)', 'Competitive', 'Instant', 'Up to KES 500K', 'T-Kash wallet, interoperability', 'Budget-conscious users', 'Add'],
                    ['Bank Apps (Equity/KCB/NCBA)', 'Free or very low', 'Instant - Minutes', 'High (account limits)', 'Bank-to-bank, M-Pesa', 'Salary & large local transfers', 'Add'],
                    ['Chipper Cash', 'Low / free P2P', 'Instant', 'Varies', 'Mobile wallets, bank', 'Peer-to-peer with friends', 'Add'],
                ],
            },
            {
                id: 'global',
                label: 'Global / Diaspora',
                columns: ['Provider', 'Total Cost', 'Speed', 'Kenya Payout', 'Limits', 'Best For', 'Action'],
                rows: [
                    ['Wise', 'Very low (0.5-1.5%)', 'Seconds to minutes', 'M-Pesa, Bank', 'High', 'Best exchange rates', 'Send'],
                    ['WorldRemit', 'Low (from ~USD 1.99)', 'Minutes to hours', 'M-Pesa, Airtel, Bank, Cash', 'High', 'Multiple payout methods', 'Send'],
                ],
            },
        ],
    },
    {
        id: 'retirement',
        order: 'Module 6 of 8',
        title: 'Retirement Solutions',
        description: 'Build long-term security and tax-efficient wealth with RBA-regulated products.',
        insight: 'Umbrella schemes reduce costs through pooling while IPPs give individuals more control.',
        filters: ['Highest Net Returns', 'Lowest Fees', 'Tax Relief'],
        segments: [
            {
                id: 'ipp',
                label: 'Individual Pension Plans',
                columns: ['Provider', 'Contributions', 'Returns', 'Fee', 'Withdrawal Rules', 'Best For', 'Action'],
                rows: [
                    ['Jubilee Personal Pension', 'Flexible + M-Pesa contributions', '8-11%', '1.3%', 'Standard RBA rules (age 55+)', 'Convenient mobile contributors', 'Enroll'],
                    ['CIC Individual Pension', 'Flexible monthly/annual', '9-11%', '1.2-1.8%', 'Age 55+; partial withdrawals allowed', 'Family-focused long-term savers', 'Enroll'],
                    ['Zamara IPP', 'Flexible contributions', '8.5-11%', '1.5%', 'RBA-regulated at retirement age', 'Custom investment choices', 'Enroll'],
                    ['Old Mutual IPP', 'Flexible from KES 1,000/mo', '9-12%', '1.0-1.5%', 'Age 55+; annuity or lump sum', 'Self-employed professionals', 'Enroll'],
                    ['Britam Individual Pension', 'Flexible monthly or annual', '9-11.5%', '1.2-1.8%', 'Age 55+; annuity or lump sum', 'Individuals wanting guarantees', 'Enroll'],
                ],
            },
            {
                id: 'annuity',
                label: 'Annuity',
                columns: ['Provider', 'Type', 'Payout', 'Fee', 'Rules', 'Best For', 'Action'],
                rows: [
                    ['Placeholder Provider', 'Life annuity', 'Monthly income', 'TBD', 'Placeholder terms', 'Retirees needing guaranteed income', 'Explore'],
                ],
            },
            {
                id: 'drawdown',
                label: 'Income Drawdown',
                columns: ['Provider', 'Type', 'Payout', 'Fee', 'Rules', 'Best For', 'Action'],
                rows: [
                    ['Placeholder Provider', 'Flexible drawdown', 'Variable income', 'TBD', 'Placeholder terms', 'Retirees wanting investment flexibility', 'Explore'],
                ],
            },
            {
                id: 'umbrella',
                label: 'Umbrella Schemes',
                columns: ['Provider', 'Contributions', 'Returns', 'Fee', 'Withdrawal Rules', 'Best For', 'Action'],
                rows: [
                    ['Britam Umbrella Scheme', 'Employer + employee', '9-12%', '1.0-1.5%', 'Age 55+; standard vesting', 'SMEs', 'Enroll'],
                    ['CIC Umbrella Pension', 'Flexible group / employer', '9-11.5%', '1.2-1.8%', 'Retirement at age 55+', 'Employee groups', 'Enroll'],
                ],
            },
        ],
    },
    {
        id: 'mortgage',
        order: 'Module 7 of 8',
        title: 'Mortgage Solutions',
        description: 'Compare KMRC, bank and SACCO mortgages with a live repayment simulator.',
        insight: 'KMRC-backed mortgages offer the lowest monthly burden with single-digit fixed rates.',
        filters: [],
        segments: [
            {
                id: 'kmrc',
                label: 'KMRC Affordable',
                columns: ['Provider', 'Type', 'Rate', 'Deposit', 'Monthly Repayment', 'Term', 'Best For', 'Action'],
                rows: [
                    ['Co-operative Bank (KMRC)', 'Fixed KMRC', 0.095, '10-20%', 'computed', 'Up to 25 yrs', 'Group & family buyers', 'Compare'],
                    ['NCBA (KMRC-linked)', 'Fixed KMRC', 0.095, '15-20%', 'computed', 'Up to 20 yrs', 'Digital-savvy buyers', 'Compare'],
                    ['Stanbic Bank (KMRC)', 'Fixed KMRC', 0.0899, '10-20%', 'computed', 'Up to 25 yrs', 'First-time buyers', 'Compare'],
                    ['KCB Bank (KMRC)', 'Fixed KMRC', 0.09, '10-20%', 'computed', 'Up to 25 yrs', 'Salary earners', 'Compare'],
                    ['Standard Chartered (KMRC)', 'Fixed KMRC', 0.095, '10-20%', 'computed', '20-25 yrs', 'Stable income buyers', 'Compare'],
                ],
            },
            {
                id: 'hfhousing',
                label: 'HF Housing Finance',
                columns: ['Provider', 'Type', 'Rate', 'Deposit', 'Monthly (est.)', 'Term', 'Best For', 'Action'],
                rows: [
                    ['Placeholder Provider', 'Housing finance', 'TBD', 'TBD', '~TBD', 'TBD', 'Placeholder buyers', 'Compare'],
                ],
            },
            {
                id: 'affordable',
                label: 'Affordable Housing',
                columns: ['Provider', 'Type', 'Rate', 'Deposit', 'Monthly (est.)', 'Term', 'Best For', 'Action'],
                rows: [
                    ['Placeholder Provider', 'Affordable housing', 'TBD', 'TBD', '~TBD', 'TBD', 'Placeholder first-time buyers', 'Compare'],
                ],
            },
            {
                id: 'commercial',
                label: 'Commercial Banks',
                columns: ['Provider', 'Type', 'Rate', 'Deposit', 'Monthly (est.)', 'Term', 'Best For', 'Action'],
                rows: [
                    ['Stanbic Bank', 'Fixed / Variable', '11.8-13.5%', '20%', '~KES 48,500-51,500', '15-25 yrs', 'Premium features', 'Compare'],
                    ['KCB Bank', 'Standard Home Loan', '13.5-15%', '20%', '~KES 52,000-55,000', '15-25 yrs', 'Wide branch network', 'Compare'],
                ],
            },
        ],
    },
    {
        id: 'insurance',
        order: 'Module 8 of 8',
        title: 'Insurance Plans',
        description: 'Protect income, health and assets across medical, motor, travel, life and specialized covers.',
        insight: 'Prioritise claims experience over the lowest premium.',
        filters: ['Claims Rating', 'Premium Range', 'Coverage Scope'],
        segments: [
            {
                id: 'motor',
                label: 'Motor',
                columns: ['Provider', 'Cover Type', 'Premium', 'Key Benefits', 'Claims Rating', 'Best For', 'Action'],
                rows: [
                    ['Jubilee', 'Comprehensive', 'KES 25,000-45,000/yr', 'Wide repair network, courtesy car', '?????', 'Full vehicle protection', 'Get Quote'],
                    ['Britam', 'Comprehensive', 'KES 22,000-40,000/yr', 'AI-assisted fast claims', '?????', 'Modern claims', 'Get Quote'],
                ],
            },
            {
                id: 'medical',
                label: 'Medical',
                columns: ['Provider', 'Cover Type', 'Premium', 'Key Benefits', 'Claims Rating', 'Best For', 'Action'],
                rows: [
                    ['Jubilee Health', 'Comprehensive', 'KES 4,000-8,000/mo', 'Wide network, dental, optical', '?????', 'Families needing broad cover', 'Get Quote'],
                    ['AAR Insurance', 'Bronze - Platinum', 'KES 3,500-7,500/mo', 'Fast digital claims, maternity', '?????', 'Digital users', 'Get Quote'],
                ],
            },
        ],
    },
];

const getActionClasses = (action) => {
    if (['Apply', 'Invest', 'Open Account', 'Open', 'Send', 'Enroll', 'Get Quote'].includes(action)) {
        return 'bg-[#1f9c72] text-white hover:bg-[#145f57]';
    }
    return 'border border-[#9bcfc9] bg-white text-[#145f57] hover:bg-[#e8f5f3]';
};

const compareActionContent = {
    loans: { primary: 'Apply Now', secondary: 'Save to Dashboard', guidance: 'Review Loan Guide' },
    savings: { primary: 'Open MMF Account', secondary: 'Save to Dashboard', guidance: 'Review Savings Guide' },
    investments: { primary: 'Open Investment Account', secondary: 'Save to Dashboard', guidance: 'Review Investment Guide' },
    banking: { primary: 'Open Account', secondary: 'Save to Dashboard', guidance: 'Review Banking Guide' },
    transfers: { primary: 'Start Transfer', secondary: 'Save to Dashboard', guidance: 'Review Transfer Guide' },
    retirement: { primary: 'Enroll Now', secondary: 'Save to Dashboard', guidance: 'Review Retirement Guide' },
    mortgage: { primary: 'Compare Mortgage', secondary: 'Save to Dashboard', guidance: 'Review Mortgage Guide' },
    insurance: { primary: 'Get Custom Quote', secondary: 'Save to Dashboard', guidance: 'Review Insurance Guide' },
};

const providerShells = ['bg-[#df6a3a]', 'bg-[#5c47c5]', 'bg-[#1967b3]', 'bg-[#4a7d15]', 'bg-[#177e72]', 'bg-[#9d5f10]', 'bg-[#8d3b4e]'];

const getProviderInitials = (name) => String(name || 'SM')
    .replace(/\(.*?\)/g, '')
    .split(/[\s/&-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getProviderShell = (name) => {
    const seed = String(name || '').split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return providerShells[seed % providerShells.length];
};

const getProviderMeta = (moduleId, segmentId, provider, detail) => {
    const detailText = String(detail || '');
    if (moduleId === 'loans') return segmentId === 'microfinance' ? 'Microfinance' : 'Commercial Bank';
    if (moduleId === 'savings') return segmentId === 'mmf' ? 'CMA-regulated' : 'CMA-regulated';
    if (moduleId === 'investments') return detailText.includes('CBK') ? 'Bank-linked Broker' : 'Licensed Broker';
    if (moduleId === 'banking') return detailText || 'Deposit account';
    if (moduleId === 'transfers') return segmentId === 'global' ? 'Remittance platform' : 'Payments provider';
    if (moduleId === 'retirement') return 'RBA-regulated';
    if (moduleId === 'mortgage') return detailText;
    if (moduleId === 'insurance') return 'Licensed insurer';
    return detailText;
};

const getCellPillTone = (column, value) => {
    const text = String(value || '').toLowerCase();
    if (text.includes('instant')) return 'border-[#f3c47a] bg-[#fff5dc] text-[#a96b00]';
    if (text.includes('low risk')) return 'border-[#cfe1ff] bg-[#eef5ff] text-[#2d67c8]';
    if (text.includes('cma') || text.includes('cbk') || text.includes('rba')) return 'border-[#99d0cb] bg-[#edf9f6] text-[#145f57]';
    if (text.includes('kes 0')) return 'border-[#99d0cb] bg-[#edf9f6] text-[#145f57]';
    if (text.includes('fixed kmrc')) return 'border-[#99d0cb] bg-[#edf9f6] text-[#145f57]';
    if (column === 'Speed' && text.includes('24-48')) return 'border-[#f3c47a] bg-[#fff5dc] text-[#a96b00]';
    return null;
};

const shouldRenderPill = (column, value) => ['Speed', 'Regulation', 'Risk', 'Monthly Fee', 'Type'].includes(column) && Boolean(getCellPillTone(column, value));

const getSecondaryActionLabel = (action) => {
    if (action === 'Get Quote') return 'Save';
    return 'Add';
};

const calculateMortgagePayment = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    return principal * ((monthlyRate * (1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1));
};

const ComparisonHubPanel = () => {
    const [activeTab, setActiveTab] = useState('loans');
    const [activeSegments, setActiveSegments] = useState(() => Object.fromEntries(compareModules.map((module) => [module.id, module.segments[0].id])));
    const [activeFilters, setActiveFilters] = useState(() => Object.fromEntries(compareModules.map((module) => [module.id, module.filters[0] || null])));
    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardAnswers, setWizardAnswers] = useState({});
    const [wizardComplete, setWizardComplete] = useState(false);
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [loanYears, setLoanYears] = useState(20);

    const moduleMap = useMemo(() => Object.fromEntries(compareModules.map((module) => [module.id, module])), []);
    const activeModule = moduleMap[activeTab];
    const activeSegment = activeModule.segments.find((segment) => segment.id === activeSegments[activeTab]) || activeModule.segments[0];
    const currentQuestion = wizardQuestions[wizardStep];
    const actionContent = compareActionContent[activeTab] || compareActionContent.loans;

    // The wizard mirrors the Claude flow but keeps every answer in React state,
    // which makes the Compare Hub easier to reason about and easier to test.
    const openWizard = () => {
        setWizardOpen(true);
        setWizardStep(0);
        setWizardAnswers({});
        setWizardComplete(false);
    };

    const closeWizard = () => {
        setWizardOpen(false);
    };

    const nextWizardStep = () => {
        if (wizardStep === wizardQuestions.length - 1) {
            setWizardComplete(true);
            return;
        }
        setWizardStep((previous) => previous + 1);
    };

    const previousWizardStep = () => {
        setWizardStep((previous) => Math.max(0, previous - 1));
    };
    return (
        <div className="space-y-4 pb-20">
            <section className="rounded-[1rem] bg-[linear-gradient(135deg,_#166d52_0%,_#1f9871_55%,_#43b184_100%)] px-5 py-4 text-white shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[0.85rem] bg-white/15 text-white">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Compare Hub</h2>
                            <p className="text-sm text-white/70">Shilingi Moves</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold text-white">Basic Tier</span>
                        <button type="button" className="rounded-lg bg-[#fff5e8] px-4 py-2 text-sm font-semibold text-[#166d52]">
                            Upgrade Plan ?
                        </button>
                    </div>
                </div>
            </section>

            <nav className="sticky top-[5.25rem] z-20 flex gap-2 overflow-x-auto rounded-[1rem] border border-[#d0ddd9] bg-white/95 p-2 shadow-sm backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {compareTabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex shrink-0 items-center gap-2 rounded-[0.8rem] border px-4 py-2 text-xs font-semibold transition ${
                                active ? 'border-[#9bcfc9] bg-[#e8f5f3] text-[#145f57]' : 'border-transparent text-slate-500 hover:bg-[#f5f7f6]'
                            }`}
                        >
                            <span className="text-[13px] leading-none" aria-hidden="true">{tab.icon}</span>
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <section className="rounded-[1rem] bg-[linear-gradient(135deg,_#145f57_0%,_#1f9c72_100%)] px-6 py-5 text-white shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Not sure where to start?</h3>
                        <p className="mt-1 text-sm text-white/80">Answer 4 quick questions and get 3 personalized Shilingi Picks matched to your goals, timeline and risk comfort.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {['Goal', 'Timeline', 'Risk', 'Budget'].map((step) => (
                                <span key={step} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white/90">{step}</span>
                            ))}
                        </div>
                    </div>

                    <button type="button" onClick={openWizard} className="rounded-[0.8rem] bg-[#e8a020] px-5 py-3 text-sm font-bold text-slate-950">
                        Start 30-sec Quiz ?
                    </button>
                </div>
            </section>

            <section id={activeModule.id} className="rounded-[1rem] border border-[#d0ddd9] bg-white shadow-sm">
                <div className="px-5 pb-2 pt-5">
                    <h3 className="text-xl font-bold text-slate-950">{activeModule.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{activeModule.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {activeModule.segments.map((segment) => (
                            <button
                                key={segment.id}
                                type="button"
                                onClick={() => setActiveSegments((previous) => ({ ...previous, [activeTab]: segment.id }))}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                    activeSegments[activeTab] === segment.id
                                        ? 'border-[#1f9c72] bg-[#1f9c72] text-white'
                                        : 'border-[#d0ddd9] text-slate-500 hover:bg-[#e8f5f3] hover:text-[#145f57]'
                                }`}
                            >
                                {segment.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeModule.filters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-y border-[#d0ddd9] bg-[#f5f7f6] px-5 py-3">
                        <span className="mr-1 text-[11px] font-semibold text-slate-500">Sort:</span>
                        {activeModule.filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilters((previous) => ({ ...previous, [activeTab]: filter }))}
                                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                                    activeFilters[activeTab] === filter
                                        ? 'border-[#b5d4f4] bg-[#e6f1fb] text-[#185fa5]'
                                        : 'border-[#d0ddd9] bg-white text-slate-500'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}

                {activeTab === 'mortgage' && (
                    <div className="flex flex-wrap items-center gap-6 border-b border-[#d0ddd9] bg-[#ebf5f3] px-5 py-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-500">Loan Amount:</span>
                            <input aria-label="Loan Amount" type="range" min={2000000} max={15000000} step={500000} value={loanAmount} onChange={(event) => setLoanAmount(Number(event.target.value))} className="accent-[#1f9c72]" />
                            <span className="min-w-[6rem] text-sm font-bold text-[#145f57]">KES {(loanAmount / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-500">Term:</span>
                            <input aria-label="Mortgage Term" type="range" min={10} max={25} step={5} value={loanYears} onChange={(event) => setLoanYears(Number(event.target.value))} className="accent-[#1f9c72]" />
                            <span className="min-w-[4rem] text-sm font-bold text-[#145f57]">{loanYears} yrs</span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-[#1f9c72] text-white">
                                {activeSegment.columns.map((column) => (
                                    <th key={column} className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em]">{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {activeSegment.rows.map((row) => (
                                <tr key={`${activeTab}-${activeSegment.id}-${row[0]}`} className="border-b border-[#eef3f1] last:border-b-0 hover:bg-[#f0f8f6]">
                                    {activeSegment.columns.map((column, columnIndex) => {
                                        let content = row[columnIndex];
                                        if (activeTab === 'mortgage' && column === 'Monthly Repayment') {
                                            content = currencyFormatter.format(calculateMortgagePayment(loanAmount, row[2], loanYears));
                                        }

                                        return (
                                            <td key={`${row[0]}-${column}`} className="px-4 py-3 align-top">
                                                {column === 'Action' ? (
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${getActionClasses(String(content))}`}>
                                                            {String(content)}
                                                        </button>
                                                        <button type="button" className="rounded-lg border border-[#1f9c72] bg-white px-3 py-2 text-xs font-semibold text-[#145f57] transition hover:bg-[#e8f5f3]">
                                                            + {getSecondaryActionLabel(String(content))}
                                                        </button>
                                                    </div>
                                                ) : column === 'Provider' ? (
                                                    <div className="flex items-start gap-3">
                                                        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.55rem] text-[11px] font-bold text-white ${getProviderShell(String(content))}`}>
                                                            {getProviderInitials(String(content))}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">{String(content)}</p>
                                                            <p className="mt-0.5 text-[11px] text-slate-500">{getProviderMeta(activeTab, activeSegment.id, row[0], row[1])}</p>
                                                        </div>
                                                    </div>
                                                ) : shouldRenderPill(column, content) ? (
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getCellPillTone(column, content)}`}>
                                                        {String(content).toLowerCase().includes('instant') ? <Zap size={11} /> : null}
                                                        {String(content).includes('CMA') || String(content).includes('CBK') || String(content).includes('RBA') ? '✓' : null}
                                                        {String(content)}
                                                    </span>
                                                ) : column === 'APR' || column === 'Net Yield' || column === 'Rate' || column === 'Returns' || column === 'Claims Rating' ? (
                                                    <span className="text-sm font-bold text-[#145f57]">{String(content)}</span>
                                                ) : (
                                                    <span className="text-sm text-slate-700">{String(content)}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-[#d0ddd9] bg-white">
                    <div className="mx-5 mt-4 rounded-r-[0.7rem] border-l-[3px] border-[#185fa5] bg-[#e6f1fb] px-4 py-3 text-sm leading-6 text-[#0c447c]">
                        <strong>Shilingi Insight:</strong> {activeModule.insight}
                    </div>
                    <div className="mx-5 mt-4 rounded-[0.9rem] border border-[#f0c477] bg-[#fff5e8] px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm leading-6 text-[#a86a00]">
                                Upgrade to unlock full lists, custom quote tools, rate trend views and personalized recommendations.
                            </p>
                            <button type="button" className="rounded-lg bg-[#e8a020] px-4 py-2 text-sm font-bold text-slate-950">
                                Upgrade Now
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 px-5 py-4">
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#1f9c72] px-4 py-2 text-xs font-semibold text-white">
                            <Sparkles size={13} />
                            {actionContent.primary}
                        </button>
                        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#d0ddd9] bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                            <Star size={13} />
                            {actionContent.secondary}
                        </button>
                        {activeTab !== 'insurance' ? (
                            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#d0ddd9] bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                                <MessageCircle size={13} />
                                {actionContent.guidance}
                            </button>
                        ) : null}
                    </div>
                </div>
            </section>

            <button
                type="button"
                onClick={openWizard}
                className="fixed bottom-7 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#1f9c72] px-5 py-3 text-sm font-bold text-white shadow-lg"
            >
                <Sparkles size={16} />
                Compare Wizard
            </button>

            {wizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(event) => event.target === event.currentTarget && closeWizard()}>
                    <div className="max-h-[90vh] w-full max-w-[28rem] overflow-y-auto rounded-[1rem] bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">{wizardComplete ? 'Your Shilingi Picks' : 'Smart Comparison Wizard'}</h2>
                                <p className="mt-1 text-sm text-slate-500">{wizardComplete ? 'Based on your goals' : '4 quick questions ? 3 personalized Shilingi Picks'}</p>
                            </div>
                            <button type="button" onClick={closeWizard} className="rounded-full p-2 text-slate-400 hover:bg-[#f5f7f6]" aria-label="Close wizard">
                                <X size={18} />
                            </button>
                        </div>

                        {!wizardComplete ? (
                            <>
                                <div className="mb-6 flex gap-2">
                                    {wizardQuestions.map((question, index) => (
                                        <div key={question.key} className={`h-1.5 flex-1 rounded-full ${index < wizardStep ? 'bg-[#1f9c72]' : index === wizardStep ? 'bg-[#8cdac1]' : 'bg-[#d0ddd9]'}`} />
                                    ))}
                                </div>

                                <p className="text-base font-bold text-slate-950">{currentQuestion.title}</p>
                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {currentQuestion.options.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setWizardAnswers((previous) => ({ ...previous, [currentQuestion.key]: option }))}
                                            className={`rounded-[0.8rem] border px-4 py-4 text-sm transition ${
                                                wizardAnswers[currentQuestion.key] === option
                                                    ? 'border-[#1f9c72] bg-[#e8f5f3] font-bold text-[#145f57]'
                                                    : 'border-[#d0ddd9] text-slate-700 hover:border-[#9bcfc9] hover:bg-[#f5faf8]'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={previousWizardStep}
                                        className="rounded-lg border border-[#d0ddd9] px-4 py-2 text-sm text-slate-500"
                                        style={{ visibility: wizardStep > 0 ? 'visible' : 'hidden' }}
                                    >
                                        ? Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextWizardStep}
                                        disabled={!wizardAnswers[currentQuestion.key]}
                                        className="rounded-lg px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#d0ddd9] disabled:text-slate-400"
                                        style={{ backgroundColor: wizardAnswers[currentQuestion.key] ? BRAND_GREEN : undefined }}
                                    >
                                        {wizardStep === wizardQuestions.length - 1 ? 'See My Picks ?' : 'Next ?'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                {(wizardPicks[wizardAnswers.goal] || wizardPicks.Save).map((pick) => (
                                    <div key={pick[0]} className="rounded-[1rem] border border-[#d0ddd9] bg-[#f5f7f6] p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-950">{pick[0]}</p>
                                                <p className="mt-1 text-xs leading-6 text-slate-500">{pick[1]}</p>
                                            </div>
                                            <span className="rounded-full border border-[#9bcfc9] bg-[#e8f5f3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#145f57]">
                                                {pick[2]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button type="button" className="rounded-lg bg-[#1f9c72] px-4 py-2 text-sm font-semibold text-white">Save to My Dashboard</button>
                                    <button type="button" onClick={openWizard} className="rounded-lg border border-[#d0ddd9] px-4 py-2 text-sm font-semibold text-slate-500">Retake Quiz</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparisonHubPanel;
