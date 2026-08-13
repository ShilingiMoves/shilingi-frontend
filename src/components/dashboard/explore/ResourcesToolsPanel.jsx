import React, { useEffect, useMemo, useState } from 'react';
import NumericInput from '../../common/NumericInput';
import { filterItemsForTier, tierAllows } from '../../../utils/tierAccess';
import {
    Bot,
    BookOpen,
    Calculator,
    GraduationCap,
    Globe,
    Headphones,
    Home,
    Landmark,
    PiggyBank,
    Receipt,
    ShieldCheck,
    Target,
    TrendingUp,
    Wallet,
    X,
    Zap,
} from 'lucide-react';

const BRAND_GREEN = '#24a06f';
const BRAND_GREEN_DARK = '#167a53';
const BRAND_GREEN_LIGHT = '#e6f5ef';

const currencyFormatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const primaryTabs = [
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'books', label: 'Books', icon: BookOpen, activeTone: 'gold' },
];

// These tabs drive the same multi-surface experience shown in the designs:
// a hero switcher at the top and a lighter in-section switcher below.
const contentTabs = [
    { id: 'calculators', label: 'My Calculators', icon: Calculator },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'learning', label: 'Learning Hub', icon: GraduationCap },
];

// The calculator catalog powers both the filterable cards and the reusable
// calculator modal so we only define the resource metadata once.
const calculatorFilters = [
    { id: 'all', label: 'All Tools' },
    { id: 'budgeting', label: 'Budgeting' },
    { id: 'investing', label: 'Investing' },
    { id: 'debt', label: 'Debt' },
    { id: 'tax', label: 'Tax' },
    { id: 'insurance', label: 'Insurance' },
];

const calculatorCards = [
    {
        id: 'paye',
        title: 'PAYE / Tax Calculator',
        description: 'Estimate your Kenya income tax, NHIF, NSSF and net take-home pay with 2025/26 tax bands.',
        category: 'tax',
        badge: 'Popular',
        badgeTone: 'text-white',
        icon: Landmark,
        iconTone: 'bg-[#e9f7f3] text-[#166a55]',
    },
    {
        id: 'loan',
        title: 'Debt Repayment Calculator',
        description: 'Monthly repayments, total interest, and full amortisation schedule for any loan.',
        category: 'debt',
        badge: 'Popular',
        badgeTone: 'text-white',
        icon: Receipt,
        iconTone: 'bg-[#fff4df] text-[#b56a00]',
    },
    {
        id: 'compound',
        title: 'Compound Interest Calculator',
        description: 'Grow your savings over time. See the magic of compounding on T-Bills, MMF, or pensions.',
        category: 'investing',
        badge: 'Popular',
        badgeTone: 'text-white',
        icon: TrendingUp,
        iconTone: 'bg-[#f3efff] text-[#7a57d1]',
    },
    {
        id: 'budget',
        title: 'Savings Calculator',
        description: 'Estimate a practical monthly and annual savings target from your income.',
        category: 'budgeting',
        icon: Calculator,
        iconTone: 'bg-[#eef8f4] text-[#166a55]',
    },
    {
        id: 'fire',
        title: 'Retirement Calculator',
        description: 'Estimate the portfolio needed to support your planned annual retirement income.',
        category: 'investing',
        icon: Zap,
        iconTone: 'bg-[#fff5e7] text-[#df8a00]',
    },
    {
        id: 'debtPayoff',
        title: 'Debt Snowball Calculator',
        description: 'Avalanche vs snowball method - see which strategy saves you the most interest.',
        category: 'debt',
        icon: Target,
        iconTone: 'bg-[#fff1ef] text-[#d94d4d]',
    },
    {
        id: 'insurance',
        title: 'Insurance Needs Analysis',
        description: 'Calculate how much life, medical, and income protection cover your family needs.',
        category: 'insurance',
        icon: ShieldCheck,
        iconTone: 'bg-[#f5efff] text-[#7a57d1]',
    },
    {
        id: 'nseReturns',
        title: 'Investment Return Calculator',
        description: 'Estimate income, growth, and total value from an investment assumption.',
        category: 'investing',
        icon: TrendingUp,
        iconTone: 'bg-[#eef8f4] text-[#166a55]',
    },
    {
        id: 'emergencyFund',
        title: 'Emergency Fund Calculator',
        description: 'Calculate your 3-6 month emergency fund target based on your monthly expenses.',
        category: 'budgeting',
        icon: ShieldCheck,
        iconTone: 'bg-[#fff7ec] text-[#b56a00]',
    },
    {
        id: 'portfolio',
        title: 'Portfolio Allocator',
        description: 'Split an investment amount across cash, fixed income, and growth assets.',
        category: 'investing',
        badge: 'New',
        badgeTone: 'bg-[#ffb320] text-[#5a3a00]',
        icon: Wallet,
        iconTone: 'bg-[#fff7ec] text-[#b56a00]',
    },
    {
        id: 'creditCard',
        title: 'Credit Card Repayment Calculator',
        description: 'Estimate how long a credit card balance may take to clear and the interest paid.',
        category: 'debt',
        icon: Receipt,
        iconTone: 'bg-[#fff1ef] text-[#d94d4d]',
    },
];

const calculatorMinimumTier = {
    paye: 'BASIC',
    budget: 'BASIC',
    emergencyFund: 'BASIC',
    loan: 'PLUS',
    debtPayoff: 'PLUS',
    insurance: 'PLUS',
    creditCard: 'PLUS',
    compound: 'PRO',
    fire: 'PRO',
    nseReturns: 'PRO',
    portfolio: 'PRO',
};

const getResourceMinimumTier = (item) => {
    const text = [item.title, item.blurb, item.description, item.badge, item.tagTwo]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    if (/debt|loan|insurance|credit|net worth|mortgage/.test(text)) return 'PLUS';
    if (/invest|retire|portfolio|nse|t-bill|bond|fire|wealth/.test(text)) return 'PRO';
    return 'BASIC';
};

const filterResourceSections = (sections, currentTier, itemKey) => (
    sections
        .map((section) => ({
            ...section,
            [itemKey]: (section[itemKey] || []).filter((item) => tierAllows(currentTier, getResourceMinimumTier(item))),
        }))
        .filter((section) => section[itemKey].length > 0)
);

const curatedBookSections = [
    {
        id: 'kenyan',
        title: 'Kenyan & East African Authors',
        helper: 'Start here. Most relatable',
        books: [
            {
                title: 'Pesa: Personal Finance for Kenyans',
                author: 'David Ndii',
                blurb: "A Kenyan economist's guide to managing money, navigating the Nairobi economy and building wealth in the local context.",
                badge: 'Beginner',
                badgeTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#24a06f] to-[#2f8f72]',
            },
            {
                title: 'The Kenyan Millionaire Blueprint',
                author: 'Ken Gichinga',
                blurb: 'Practical roadmap for building wealth in Kenya using local investment vehicles - T-Bills, SACCOs, NSE, and real estate.',
                badge: 'Intermediate',
                badgeTone: 'bg-[#fff3d8] text-[#b56a00]',
                coverTone: 'from-[#f5a623] to-[#ffca63]',
            },
            {
                title: 'Money Matters Kenya: SACCO & Investment Guide',
                author: 'Grace Nyambu',
                blurb: "Deep dive into Kenya's unique investment landscape - SACCOs, unit trusts, NSE, and pension planning for salaried workers.",
                badge: 'Intermediate',
                badgeTone: 'bg-[#eef4ff] text-[#2f74db]',
                coverTone: 'from-[#2f74db] to-[#67a8ef]',
            },
            {
                title: 'Debt-Free Kenya: Escape the Cycle',
                author: 'Wanja Mwaura',
                blurb: 'A real story of getting out of Fuliza, mobile loan debt, and rebuilding financial health from zero. Deeply Kenyan.',
                badge: 'Beginner',
                badgeTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#7a57d1] to-[#9c7aea]',
            },
            {
                title: 'She Builds Wealth: Women & Money in East Africa',
                author: 'Amina Abdi Rabar',
                blurb: 'Written for Kenyan women: financial independence, overcoming gender pay gaps, and building generational wealth in East Africa.',
                badge: 'Beginner',
                badgeTone: 'bg-[#ffe7ef] text-[#d94d7a]',
                coverTone: 'from-[#df5f8d] to-[#f49abb]',
            },
            {
                title: 'Farming as Investment: Kenya Agribusiness',
                author: 'Peter Gitau',
                blurb: 'How to treat farming as an investment vehicle in Kenya - land, value chains, and profitable agribusiness models.',
                badge: 'Advanced',
                badgeTone: 'bg-[#e7f7fb] text-[#0a88a8]',
                coverTone: 'from-[#0f8f7f] to-[#4fc2b3]',
            },
        ],
    },
    {
        id: 'african',
        title: 'African Authors',
        helper: "Our continent's money wisdom",
        books: [
            {
                title: 'Die Empty: The African Wealth Blueprint',
                author: 'Strive Masiyiwa',
                blurb: "Zimbabwe's billionaire founder of Econet shares lessons on entrepreneurship, investing, and building African wealth from scratch.",
                badge: 'Intermediate',
                badgeTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#24a06f] to-[#d5a42b]',
            },
            {
                title: 'Rich Habits, Poor Habits: African Edition',
                author: 'Nimi Akinkugbe (Nigeria)',
                blurb: "Nigeria's top financial educator on the money habits that separate wealthy Africans from those who remain stuck.",
                badge: 'Beginner',
                badgeTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#ef4444] to-[#ff8b8b]',
            },
            {
                title: "Africa's Business Revolution",
                author: 'Acha Leke, Mutsa Chironga (McKinsey)',
                blurb: "How African businesses and investors are winning globally. Investment thinking anchored in African market realities.",
                badge: 'Advanced',
                badgeTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#d8a11f] to-[#24a06f]',
            },
        ],
    },
    {
        id: 'global',
        title: 'Global Must-Reads',
        helper: 'Timeless money wisdom',
        books: [
            {
                title: 'The Psychology of Money',
                author: 'Morgan Housel',
                blurb: 'Timeless lessons on wealth, greed, and happiness. The best personal finance book of the last decade. Non-negotiable read.',
                badge: 'Top Pick',
                badgeTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#24a06f] to-[#2f8f72]',
            },
            {
                title: 'Rich Dad Poor Dad',
                author: 'Robert Kiyosaki',
                blurb: "The book that changed how a generation thinks about assets and liabilities. Foundational for every investor.",
                badge: 'Beginner',
                badgeTone: 'bg-[#fff3d8] text-[#b56a00]',
                coverTone: 'from-[#f5a623] to-[#ffca63]',
            },
            {
                title: 'I Will Teach You to Be Rich',
                author: 'Ramit Sethi',
                blurb: 'A practical, no-nonsense guide to automating finances, investing, and living your rich life. Particularly useful for 20s-40s.',
                badge: 'Intermediate',
                badgeTone: 'bg-[#eef4ff] text-[#2f74db]',
                coverTone: 'from-[#2f74db] to-[#67a8ef]',
            },
            {
                title: 'The Millionaire Next Door',
                author: 'Thomas J. Stanley',
                blurb: 'Research-backed look at how real millionaires live, save, and invest - surprisingly frugal and relatable.',
                badge: 'Intermediate',
                badgeTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#7a57d1] to-[#9c7aea]',
            },
            {
                title: 'Think and Grow Rich',
                author: 'Napoleon Hill',
                blurb: 'The original wealth mindset masterpiece. Still the most quoted personal finance book in Africa after 85 years.',
                badge: 'Beginner',
                badgeTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#df5f8d] to-[#f49abb]',
            },
            {
                title: 'The Intelligent Investor',
                author: 'Benjamin Graham',
                blurb: "Warren Buffett's favourite book. The bible of value investing. For those who want to master NSE and global markets.",
                badge: 'Advanced',
                badgeTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#134b3d] to-[#24a06f]',
            },
        ],
    },
];

const curatedPodcastSections = [
    {
        id: 'kenyan',
        title: 'Kenyan Podcasters',
        helper: 'Start here - locally relevant',
        items: [
            {
                title: 'Pesa Nane',
                host: 'Grace Nyambu & Team - KE',
                blurb: "Kenya's most popular personal finance podcast. Practical money conversations for local savers, investors and planners.",
                tagOne: 'KE Local',
                tagOneTone: 'bg-[#eef8f4] text-[#166a55]',
                tagTwo: 'Beginner',
                tagTwoTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#8a6bd9] to-[#9f84ec]',
                icon: Headphones,
            },
            {
                title: 'The Wealthy Woman Kenya',
                host: 'Wanja Mwaura - Nairobi',
                blurb: 'Financial empowerment for Kenyan women - from mobile savings to real estate, NSE investing and breaking financial taboos.',
                tagOne: 'KE Local',
                tagOneTone: 'bg-[#eef8f4] text-[#166a55]',
                tagTwo: 'Women',
                tagTwoTone: 'bg-[#ffe7ef] text-[#d94d7a]',
                coverTone: 'from-[#24a06f] to-[#57c0a4]',
                icon: PiggyBank,
            },
            {
                title: 'NSE Insider',
                host: 'David Kamau - Nairobi',
                blurb: "Kenya's stock market decoded. Weekly breakdown of NSE performance, top movers, dividends and investment opportunities.",
                tagOne: 'KE Local',
                tagOneTone: 'bg-[#eef8f4] text-[#166a55]',
                tagTwo: 'Investing',
                tagTwoTone: 'bg-[#fff3d8] text-[#b56a00]',
                coverTone: 'from-[#f5a623] to-[#ffca63]',
                icon: TrendingUp,
            },
            {
                title: 'Mzigo wa Pesa (Money Talk)',
                host: 'Ken Gichinga - Nairobi',
                blurb: 'Deep conversations in Swahili and English on Kenyan economic news, T-Bills, M-Pesa, and how policy affects your wallet.',
                tagOne: 'KE Local',
                tagOneTone: 'bg-[#eef8f4] text-[#166a55]',
                tagTwo: 'Economy',
                tagTwoTone: 'bg-[#eef4ff] text-[#2f74db]',
                coverTone: 'from-[#2f74db] to-[#67a8ef]',
                icon: Landmark,
            },
            {
                title: 'Young & Wealthy Kenya',
                host: 'Ruth Waweru & Friends',
                blurb: 'For Kenyans under 35 - navigating first jobs, NSSF, SACCO membership, investing KES 5,000 a month and building wealth young.',
                tagOne: 'KE Local',
                tagOneTone: 'bg-[#eef8f4] text-[#166a55]',
                tagTwo: 'Youth',
                tagTwoTone: 'bg-[#ffe7ef] text-[#d94d7a]',
                coverTone: 'from-[#df5f8d] to-[#f49abb]',
                icon: Zap,
            },
            {
                title: 'Real Estate Kenya',
                host: 'Mercy Njoroge - Property Investor',
                blurb: 'Everything about buying, renting, and investing in Kenyan property - Nairobi, Mombasa, Kisumu and satellite towns.',
                tagOne: 'KE Local',
                tagOneTone: 'bg-[#eef8f4] text-[#166a55]',
                tagTwo: 'Property',
                tagTwoTone: 'bg-[#e7f7fb] text-[#0a88a8]',
                coverTone: 'from-[#0f8f7f] to-[#4fc2b3]',
                icon: Home,
            },
        ],
    },
    {
        id: 'african',
        title: 'African Podcasters',
        helper: "Our continent's financial conversations",
        items: [
            {
                title: 'African Money Stories',
                host: 'Nimi Akinkugbe - Nigeria',
                blurb: 'Real money stories from across Africa - financial struggles, successes, and lessons applicable from Lagos to Nairobi.',
                tagOne: 'Africa',
                tagOneTone: 'bg-[#fff3d8] text-[#b56a00]',
                tagTwo: 'Beginner',
                tagTwoTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#24a06f] to-[#d5a42b]',
                icon: BookOpen,
            },
            {
                title: 'How We Made It In Africa',
                host: 'Jaco Maritz - Pan-African',
                blurb: 'Business and investment strategies across African markets. Features founders, investors and economic analysts from the continent.',
                tagOne: 'Africa',
                tagOneTone: 'bg-[#fff3d8] text-[#b56a00]',
                tagTwo: 'Business',
                tagTwoTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#f58f20] to-[#ef5a5a]',
                icon: Zap,
            },
            {
                title: 'Sanlam African Money Matters',
                host: 'Sanlam Group - Pan-African',
                blurb: "Pension, insurance and investment conversations from Africa's largest financial services group. Highly applicable to Kenyan users.",
                tagOne: 'Africa',
                tagOneTone: 'bg-[#fff3d8] text-[#b56a00]',
                tagTwo: 'Investing',
                tagTwoTone: 'bg-[#eef4ff] text-[#2f74db]',
                coverTone: 'from-[#7a57d1] to-[#2f74db]',
                icon: ShieldCheck,
            },
        ],
    },
    {
        id: 'global',
        title: 'Global Podcasters',
        helper: 'World-class financial education',
        items: [
            {
                title: 'Planet Money (NPR)',
                host: 'NPR - USA',
                blurb: 'Simple, fascinating explanations of how the global economy really works - inflation, interest rates, currency movements. Perfect for Kenyans watching the USD/KES rate.',
                tagOne: 'Global',
                tagOneTone: 'bg-[#eef4ff] text-[#2f74db]',
                tagTwo: 'Beginner',
                tagTwoTone: 'bg-[#eef8f4] text-[#166a55]',
                coverTone: 'from-[#ef5a5a] to-[#ff8b8b]',
                icon: Globe,
            },
            {
                title: 'We Study Billionaires',
                host: "The Investor's Podcast Network",
                blurb: 'Long-form conversations on investing like Warren Buffett, Ray Dalio, and other billionaires. Portfolio thinking and mindset for serious investors.',
                tagOne: 'Global',
                tagOneTone: 'bg-[#eef4ff] text-[#2f74db]',
                tagTwo: 'Investing',
                tagTwoTone: 'bg-[#fff3d8] text-[#b56a00]',
                coverTone: 'from-[#134b3d] to-[#24a06f]',
                icon: Calculator,
            },
            {
                title: 'ChooseFI',
                host: 'Brad Barrett & Jonathan Mendonsa',
                blurb: 'Financial independence for regular people. Directly applicable to Kenyan FIRE seekers - frugality, index investing, retiring early.',
                tagOne: 'Global',
                tagOneTone: 'bg-[#eef4ff] text-[#2f74db]',
                tagTwo: 'FIRE',
                tagTwoTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#2f74db] to-[#5d6df5]',
                icon: Target,
            },
            {
                title: 'How I Built This',
                host: 'Guy Raz - NPR',
                blurb: 'Entrepreneurs from around the world share how they built iconic businesses. Entrepreneurship lessons directly applicable to Kenyan SMEs.',
                tagOne: 'Global',
                tagOneTone: 'bg-[#eef4ff] text-[#2f74db]',
                tagTwo: 'Entrepreneurship',
                tagTwoTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#8a6bd9] to-[#f5a623]',
                icon: Zap,
            },
            {
                title: 'Masters of Scale',
                host: 'Reid Hoffman - USA',
                blurb: "LinkedIn co-founder interviews the world's top business builders. Entrepreneurship, product-market fit, and scaling ideas relevant globally.",
                tagOne: 'Global',
                tagOneTone: 'bg-[#eef4ff] text-[#2f74db]',
                tagTwo: 'Business',
                tagTwoTone: 'bg-[#f2edff] text-[#7a57d1]',
                coverTone: 'from-[#0f8f7f] to-[#2f74db]',
                icon: Landmark,
            },
            {
                title: 'The Tim Ferriss Show',
                host: 'Tim Ferriss - USA',
                blurb: "Decoding world-class performers' morning routines, investments, tools, and philosophies. Especially the money habits of billionaires.",
                tagOne: 'Global',
                tagOneTone: 'bg-[#eef4ff] text-[#2f74db]',
                tagTwo: 'Mindset',
                tagTwoTone: 'bg-[#fff3d8] text-[#b56a00]',
                coverTone: 'from-[#df5f8d] to-[#7a57d1]',
                icon: Headphones,
            },
        ],
    },
];

const learningHighlights = [
    {
        title: 'Budgeting Basics',
        description: 'Master the 50/30/20 rule, set up your first budget, and start tracking expenses. Perfect starting point.',
        progress: 40,
        meta: '5 lessons · 45 mins',
        badge: 'In Progress',
        badgeTone: 'bg-[#e7f6f1] text-[#166a55]',
        accent: 'border-l-[4px] border-[#24a06f]',
        icon: PiggyBank,
        iconTone: 'bg-[#fff7ec] text-[#b56a00]',
    },
    {
        title: 'Investing 101 - Kenya Focus',
        description: 'T-Bills, MMF, NSE, SACCOs - understand every Kenyan investment option with real numbers.',
        progress: null,
        meta: '8 lessons · 60 mins',
        badge: 'Beginner',
        badgeTone: 'bg-[#fff3d8] text-[#b56a00]',
        accent: 'border-l-[4px] border-[#f5a623]',
        icon: TrendingUp,
        iconTone: 'bg-[#f3efff] text-[#7a57d1]',
    },
    {
        title: 'Debt Management Masterclass',
        description: 'Avalanche vs snowball, negotiating with banks, and becoming debt-free - with Kenyan examples.',
        progress: null,
        meta: '6 lessons · 50 mins',
        badge: 'Intermediate',
        badgeTone: 'bg-[#eef4ff] text-[#2f74db]',
        accent: 'border-l-[4px] border-[#2f74db]',
        icon: Receipt,
        iconTone: 'bg-[#fff4df] text-[#b56a00]',
    },
    {
        title: 'Retirement Planning (FIRE)',
        description: 'NSSF, pension funds, FIRE number calculation - retire on your terms, at your age.',
        progress: null,
        meta: '7 lessons · 55 mins',
        badge: 'Intermediate',
        badgeTone: 'bg-[#f2edff] text-[#7a57d1]',
        accent: 'border-l-[4px] border-[#7a57d1]',
        icon: Wallet,
        iconTone: 'bg-[#fff7ec] text-[#b56a00]',
    },
    {
        title: 'Protection & Insurance 101',
        description: 'Life, health, income protection - understand what cover you need in Kenya and how much it costs.',
        progress: null,
        meta: '5 lessons · 40 mins',
        badge: 'New',
        badgeTone: 'bg-[#fff1ef] text-[#d94d4d]',
        accent: 'border-l-[4px] border-[#ef4444]',
        icon: ShieldCheck,
        iconTone: 'bg-[#f5efff] text-[#7a57d1]',
    },
    {
        title: 'Tax & KRA for Kenyans',
        description: 'PAYE, iTax filing, KRA PIN, tax reliefs and how to legally minimise your tax burden in Kenya.',
        progress: null,
        meta: '6 lessons · 45 mins',
        badge: 'Intermediate',
        badgeTone: 'bg-[#e7f7fb] text-[#0a88a8]',
        accent: 'border-l-[4px] border-[#0a88a8]',
        icon: Landmark,
        iconTone: 'bg-[#f8fcfa] text-slate-700',
    },
];

const ecosystemLinks = [
    { id: 'budget', title: 'Budget Planner', cta: 'Open', icon: Calculator, iconTone: 'bg-[#eef8f4] text-[#166a55]' },
    { id: 'investments', title: 'Investments', cta: 'Open', icon: TrendingUp, iconTone: 'bg-[#eef4ff] text-[#2f74db]' },
    { id: 'debt', title: 'Debt Manager', cta: 'Manage', icon: Receipt, iconTone: 'bg-[#fff4df] text-[#b56a00]' },
    { id: 'retirement', title: 'Retirement', cta: 'Plan', icon: PiggyBank, iconTone: 'bg-[#eef8f4] text-[#166a55]' },
    { id: 'protection', title: 'Protection', cta: 'View', icon: ShieldCheck, iconTone: 'bg-[#f5efff] text-[#7a57d1]' },
    { id: 'buddy', title: 'Buddy AI', cta: 'Chat', icon: Bot, iconTone: 'bg-[#eef4ff] text-[#2f74db]' },
];

const labelClass = 'block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500';
const inputClass = 'mt-2 w-full rounded-[1rem] border border-[#d8ece3] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#8fcfba] focus:ring-2 focus:ring-[#dff1ea]';

const TopMetricCard = ({ label, value, helper, accent }) => (
    <article className="rounded-[1rem] border border-[#d0ddd9] bg-white px-4 py-3.5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{label}</p>
        <p className={`mt-2 text-[1.55rem] font-bold tracking-tight ${accent}`}>{value}</p>
        <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </article>
);

const TabButton = ({ active, icon: Icon, label, onClick, compact = false, activeTone = 'green' }) => (
    <button
        type="button"
        onClick={onClick}
        style={active && activeTone !== 'gold' ? { backgroundColor: BRAND_GREEN, borderColor: BRAND_GREEN } : undefined}
        className={`inline-flex items-center gap-2 rounded-[0.8rem] border px-3.5 py-2.5 text-sm font-semibold transition-all ${
            active
                ? activeTone === 'gold'
                    ? 'border-[#ffb320] bg-[#ffb320] text-slate-950 shadow-sm'
                    : 'text-white shadow-sm'
                : compact
                    ? 'border-[#c7e4db] bg-white text-slate-600 hover:bg-[#f6fbf8]'
                    : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
        }`}
    >
        <Icon size={15} />
        {label}
    </button>
);

const FilterPill = ({ active, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={active ? { backgroundColor: BRAND_GREEN, borderColor: BRAND_GREEN } : undefined}
        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-colors ${
            active
                ? 'text-white'
                : 'border-[#d0ddd9] bg-white text-slate-700 hover:bg-[#f7fbf9] hover:text-[#166a55]'
        }`}
    >
        {label}
    </button>
);

const ResourceCard = ({ item, onOpen }) => {
    const Icon = item.icon;
    const badgeUsesBrandGreen = item.badgeTone === 'text-white';

    return (
        <button
            type="button"
            onClick={() => onOpen(item.id)}
            className="relative flex h-full flex-col rounded-[1rem] border border-[#d0ddd9] bg-white p-4.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#afd8ca] hover:shadow-md"
        >
            {item.badge && (
                <span
                    className={`absolute right-0 top-0 rounded-bl-[0.7rem] rounded-tr-[1rem] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${item.badgeTone}`}
                    style={badgeUsesBrandGreen ? { backgroundColor: BRAND_GREEN_DARK } : undefined}
                >
                    {item.badge}
                </span>
            )}
            <div className="pl-2 sm:pl-3">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] ${item.iconTone}`}>
                    <Icon size={18} />
                </span>
                <h3 className="mt-4 max-w-[16rem] text-[1.06rem] font-bold leading-6 tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-7 text-slate-600">{item.description}</p>
                <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-2 border-b border-[#9ed7c1] pb-1 text-sm font-semibold text-[#166a55]">
                        Open Calculator
                        <span aria-hidden="true">-&gt;</span>
                    </span>
                </div>
            </div>
        </button>
    );
};

const ModalField = ({ label, children }) => (
    <div>
        <label className={labelClass}>{label}</label>
        {children}
    </div>
);

const ResourcesToolsPanel = ({ currentTier = 'PRO', onSelectSection }) => {
    const [activeTab, setActiveTab] = useState('calculators');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedTool, setSelectedTool] = useState(null);

    const [monthlyIncome, setMonthlyIncome] = useState(120000);
    const budgetSplit = useMemo(() => ({
        monthlySavings: monthlyIncome * 0.2,
        annualSavings: monthlyIncome * 0.2 * 12,
    }), [monthlyIncome]);

    const [loanAmount, setLoanAmount] = useState(500000);
    const [loanRate, setLoanRate] = useState(13);
    const [loanMonths, setLoanMonths] = useState(36);
    const loanResult = useMemo(() => {
        if (loanAmount <= 0 || loanRate <= 0 || loanMonths <= 0) {
            return { monthly: 0, totalInterest: 0 };
        }
        const monthlyRate = loanRate / 100 / 12;
        const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) / (Math.pow(1 + monthlyRate, loanMonths) - 1);
        return {
            monthly: monthlyPayment,
            totalInterest: Math.max((monthlyPayment * loanMonths) - loanAmount, 0),
        };
    }, [loanAmount, loanRate, loanMonths]);

    const [principal, setPrincipal] = useState(100000);
    const [monthlyAdd, setMonthlyAdd] = useState(5000);
    const [annualReturn, setAnnualReturn] = useState(10);
    const [years, setYears] = useState(5);
    const compoundResult = useMemo(() => {
        const periods = years * 12;
        const monthlyRate = annualReturn / 100 / 12;
        if (periods <= 0) {
            return 0;
        }
        if (monthlyRate === 0) {
            return principal + (monthlyAdd * periods);
        }
        return (principal * Math.pow(1 + monthlyRate, periods)) + (monthlyAdd * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate));
    }, [principal, monthlyAdd, annualReturn, years]);

    const [grossMonthlyPay, setGrossMonthlyPay] = useState(120000);
    const payeResult = useMemo(() => {
        const annualIncome = grossMonthlyPay * 12;
        const firstBand = Math.min(annualIncome, 288000) * 0.1;
        const secondBand = Math.max(Math.min(annualIncome - 288000, 100000), 0) * 0.25;
        const thirdBand = Math.max(annualIncome - 388000, 0) * 0.3;
        const taxBeforeRelief = firstBand + secondBand + thirdBand;
        const annualRelief = 2400 * 12;
        const annualTax = Math.max(taxBeforeRelief - annualRelief, 0);
        return {
            monthlyTax: annualTax / 12,
            netMonthly: grossMonthlyPay - (annualTax / 12),
        };
    }, [grossMonthlyPay]);

    const [portfolioAmount, setPortfolioAmount] = useState(500000);
    const [portfolioStyle, setPortfolioStyle] = useState('balanced');
    const portfolioAllocation = useMemo(() => {
        const weights = {
            conservative: { cash: 20, fixedIncome: 60, growth: 20 },
            balanced: { cash: 10, fixedIncome: 45, growth: 45 },
            growth: { cash: 5, fixedIncome: 25, growth: 70 },
        }[portfolioStyle];
        return Object.fromEntries(Object.entries(weights).map(([key, percent]) => [key, { percent, amount: portfolioAmount * percent / 100 }]));
    }, [portfolioAmount, portfolioStyle]);

    const [yearlyExpense, setYearlyExpense] = useState(1200000);
    const [safeRate, setSafeRate] = useState(4);
    const fireNumber = useMemo(() => {
        if (safeRate <= 0) {
            return 0;
        }
        return yearlyExpense / (safeRate / 100);
    }, [yearlyExpense, safeRate]);

    const [annualIncome, setAnnualIncome] = useState(1440000);
    const [dependants, setDependants] = useState(2);
    const [debtBalance, setDebtBalance] = useState(300000);
    const insuranceCover = useMemo(() => {
        return (annualIncome * 10) + debtBalance + (dependants * 250000);
    }, [annualIncome, dependants, debtBalance]);

    const [payoffBalance, setPayoffBalance] = useState(300000);
    const [payoffRate, setPayoffRate] = useState(14);
    const [payoffMonthly, setPayoffMonthly] = useState(20000);
    const debtPayoffResult = useMemo(() => {
        if (payoffBalance <= 0 || payoffMonthly <= 0) {
            return { months: 0, totalInterest: 0, totalPaid: 0 };
        }

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
            if (principalPaid <= 0) {
                break;
            }
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

    const [cardBalance, setCardBalance] = useState(120000);
    const [cardRate, setCardRate] = useState(36);
    const [cardPayment, setCardPayment] = useState(15000);
    const cardRepayment = useMemo(() => {
        const monthlyRate = cardRate / 100 / 12;
        if (cardBalance <= 0 || cardPayment <= 0 || (monthlyRate > 0 && cardPayment <= cardBalance * monthlyRate)) {
            return { months: 999, interest: 0 };
        }
        let balance = cardBalance;
        let months = 0;
        let paid = 0;
        while (balance > 0.01 && months < 600) {
            const interest = balance * monthlyRate;
            const payment = Math.min(cardPayment, balance + interest);
            balance = Math.max(balance + interest - payment, 0);
            paid += payment;
            months += 1;
        }
        return { months, interest: Math.max(paid - cardBalance, 0) };
    }, [cardBalance, cardPayment, cardRate]);

    const [monthlyExpenses, setMonthlyExpenses] = useState(60000);
    const [monthsCovered, setMonthsCovered] = useState(6);
    const emergencyTarget = useMemo(() => monthlyExpenses * monthsCovered, [monthlyExpenses, monthsCovered]);

    const [nseInvestment, setNseInvestment] = useState(100000);
    const [dividendYield, setDividendYield] = useState(6);
    const [capitalGainRate, setCapitalGainRate] = useState(12);
    const nseReturns = useMemo(() => {
        const dividendIncome = nseInvestment * (dividendYield / 100);
        const capitalGain = nseInvestment * (capitalGainRate / 100);
        return {
            dividendIncome,
            capitalGain,
            totalValue: nseInvestment + dividendIncome + capitalGain,
        };
    }, [nseInvestment, dividendYield, capitalGainRate]);

    const availableCalculators = useMemo(
        () => filterItemsForTier(
            calculatorCards.map((item) => ({ ...item, minimumTier: calculatorMinimumTier[item.id] || 'BASIC' })),
            currentTier,
        ),
        [currentTier],
    );
    const availableLearningHighlights = useMemo(
        () => learningHighlights.filter((item) => tierAllows(currentTier, getResourceMinimumTier(item))),
        [currentTier],
    );
    const availableEcosystemLinks = useMemo(
        () => ecosystemLinks.filter((item) => tierAllows(currentTier, {
            debt: 'PLUS', protection: 'PLUS', investments: 'PRO', retirement: 'PRO',
        }[item.id] || 'BASIC')),
        [currentTier],
    );
    const availableBookSections = useMemo(
        () => filterResourceSections(curatedBookSections, currentTier, 'books'),
        [currentTier],
    );
    const availablePodcastSections = useMemo(
        () => filterResourceSections(curatedPodcastSections, currentTier, 'items'),
        [currentTier],
    );
    const availableCalculatorFilters = useMemo(() => {
        const categories = new Set(availableCalculators.map((item) => item.category));
        return calculatorFilters.filter((filter) => filter.id === 'all' || categories.has(filter.id));
    }, [availableCalculators]);

    useEffect(() => {
        if (!availableCalculatorFilters.some((filter) => filter.id === activeFilter)) {
            setActiveFilter('all');
        }
    }, [activeFilter, availableCalculatorFilters]);

    const selectedToolMeta = useMemo(() => {
        return availableCalculators.find((item) => item.id === selectedTool);
    }, [availableCalculators, selectedTool]);

    const filteredCalculators = useMemo(() => {
        if (activeFilter === 'all') {
            return availableCalculators;
        }
        return availableCalculators.filter((item) => item.category === activeFilter);
    }, [activeFilter, availableCalculators]);

    const readingProgress = '3 Books';

    const handleEcosystemNavigate = (sectionId) => {
        if (sectionId === 'buddy') {
            onSelectSection?.('buddy');
            return;
        }
        onSelectSection?.(sectionId);
    };

    // Each calculator body swaps into the same modal shell so the catalog,
    // tests, and interactions stay consistent as we add more tools later.
    const renderCalculatorModalBody = () => {
        switch (selectedTool) {
            case 'budget':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Monthly income (KES)">
                            <NumericInput aria-label="Monthly income (KES)" className={inputClass} value={monthlyIncome} onChange={(event) => setMonthlyIncome(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Suggested savings target</p>
                            <p className="mt-3 text-sm text-slate-600">Monthly (20%): <span className="font-semibold text-[#166a55]">{currencyFormatter.format(budgetSplit.monthlySavings)}</span></p>
                            <p className="mt-1 text-sm text-slate-600">Annual target: <span className="font-semibold text-[#2f74db]">{currencyFormatter.format(budgetSplit.annualSavings)}</span></p>
                        </div>
                    </div>
                );
            case 'loan':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Loan amount (KES)">
                            <NumericInput aria-label="Loan amount (KES)" className={inputClass} value={loanAmount} onChange={(event) => setLoanAmount(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Annual interest (%)">
                            <input aria-label="Annual interest (%)" className={inputClass} type="number" min={0} step="0.1" value={loanRate} onChange={(event) => setLoanRate(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Repayment months">
                            <input aria-label="Repayment months" className={inputClass} type="number" min={1} value={loanMonths} onChange={(event) => setLoanMonths(Number(event.target.value || 1))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Estimated monthly payment</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(loanResult.monthly)}</p>
                            <p className="mt-2 text-sm text-slate-600">Total interest: <span className="font-semibold text-slate-900">{currencyFormatter.format(loanResult.totalInterest)}</span></p>
                        </div>
                    </div>
                );
            case 'compound':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Current savings (KES)">
                            <NumericInput className={inputClass} value={principal} onChange={(event) => setPrincipal(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Monthly contribution (KES)">
                            <NumericInput className={inputClass} value={monthlyAdd} onChange={(event) => setMonthlyAdd(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Annual return (%)">
                            <input className={inputClass} type="number" min={0} step="0.1" value={annualReturn} onChange={(event) => setAnnualReturn(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Years">
                            <input className={inputClass} type="number" min={1} value={years} onChange={(event) => setYears(Number(event.target.value || 1))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4 md:col-span-2">
                            <p className="text-sm font-semibold text-slate-900">Projected future value</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(compoundResult)}</p>
                        </div>
                    </div>
                );
            case 'paye':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Gross monthly pay (KES)">
                            <NumericInput className={inputClass} value={grossMonthlyPay} onChange={(event) => setGrossMonthlyPay(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Estimated PAYE (monthly)</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(payeResult.monthlyTax)}</p>
                            <p className="mt-2 text-sm text-slate-600">Estimated net pay: <span className="font-semibold text-slate-900">{currencyFormatter.format(payeResult.netMonthly)}</span></p>
                        </div>
                    </div>
                );
            case 'portfolio':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Portfolio amount (KES)">
                            <NumericInput aria-label="Portfolio amount (KES)" className={inputClass} value={portfolioAmount} onChange={(event) => setPortfolioAmount(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Risk style">
                            <select aria-label="Risk style" className={inputClass} value={portfolioStyle} onChange={(event) => setPortfolioStyle(event.target.value)}>
                                <option value="conservative">Conservative</option>
                                <option value="balanced">Balanced</option>
                                <option value="growth">Growth</option>
                            </select>
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4 md:col-span-2">
                            <p className="text-sm font-semibold text-slate-900">Illustrative allocation</p>
                            <p className="mt-3 text-sm text-slate-600">Cash ({portfolioAllocation.cash.percent}%): <span className="font-semibold text-slate-900">{currencyFormatter.format(portfolioAllocation.cash.amount)}</span></p>
                            <p className="mt-1 text-sm text-slate-600">Fixed income ({portfolioAllocation.fixedIncome.percent}%): <span className="font-semibold text-slate-900">{currencyFormatter.format(portfolioAllocation.fixedIncome.amount)}</span></p>
                            <p className="mt-1 text-sm text-slate-600">Growth assets ({portfolioAllocation.growth.percent}%): <span className="font-semibold text-[#166a55]">{currencyFormatter.format(portfolioAllocation.growth.amount)}</span></p>
                            <p className="mt-2 text-xs text-slate-500">Educational illustration only, not investment advice.</p>
                        </div>
                    </div>
                );
            case 'fire':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Annual retirement income needed (KES)">
                            <NumericInput className={inputClass} value={yearlyExpense} onChange={(event) => setYearlyExpense(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Safe withdrawal rate (%)">
                            <input className={inputClass} type="number" min={0.5} step="0.1" value={safeRate} onChange={(event) => setSafeRate(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4 md:col-span-2">
                            <p className="text-sm font-semibold text-slate-900">Estimated retirement portfolio target</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(fireNumber)}</p>
                        </div>
                    </div>
                );
            case 'debtPayoff':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Total debt balance (KES)">
                            <NumericInput aria-label="Total debt balance (KES)" className={inputClass} value={payoffBalance} onChange={(event) => setPayoffBalance(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Average annual interest (%)">
                            <input aria-label="Average annual interest (%)" className={inputClass} type="number" min={0} step="0.1" value={payoffRate} onChange={(event) => setPayoffRate(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Monthly payment (KES)">
                            <NumericInput aria-label="Monthly payment (KES)" className={inputClass} value={payoffMonthly} onChange={(event) => setPayoffMonthly(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Debt-free timeline</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{debtPayoffResult.months >= 999 ? 'Increase payment' : `${debtPayoffResult.months} months`}</p>
                            {debtPayoffResult.months < 999 && (
                                <>
                                    <p className="mt-2 text-sm text-slate-600">Total paid: <span className="font-semibold text-slate-900">{currencyFormatter.format(debtPayoffResult.totalPaid)}</span></p>
                                    <p className="mt-1 text-sm text-slate-600">Total interest: <span className="font-semibold text-slate-900">{currencyFormatter.format(debtPayoffResult.totalInterest)}</span></p>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'insurance':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Annual income (KES)">
                            <NumericInput className={inputClass} value={annualIncome} onChange={(event) => setAnnualIncome(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Dependants">
                            <input className={inputClass} type="number" min={0} value={dependants} onChange={(event) => setDependants(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Outstanding debt (KES)">
                            <NumericInput className={inputClass} value={debtBalance} onChange={(event) => setDebtBalance(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Suggested cover amount</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(insuranceCover)}</p>
                        </div>
                    </div>
                );
            case 'emergencyFund':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Monthly expenses (KES)">
                            <NumericInput className={inputClass} value={monthlyExpenses} onChange={(event) => setMonthlyExpenses(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Months to cover">
                            <input className={inputClass} type="number" min={1} max={12} value={monthsCovered} onChange={(event) => setMonthsCovered(Number(event.target.value || 1))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4 md:col-span-2">
                            <p className="text-sm font-semibold text-slate-900">Emergency fund target</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(emergencyTarget)}</p>
                        </div>
                    </div>
                );
            case 'nseReturns':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Investment amount (KES)">
                            <NumericInput className={inputClass} value={nseInvestment} onChange={(event) => setNseInvestment(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Dividend yield (%)">
                            <input className={inputClass} type="number" min={0} step="0.1" value={dividendYield} onChange={(event) => setDividendYield(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Expected capital gain (%)">
                            <input className={inputClass} type="number" min={0} step="0.1" value={capitalGainRate} onChange={(event) => setCapitalGainRate(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Estimated first-year outcome</p>
                            <p className="mt-2 text-sm text-slate-600">Dividends: <span className="font-semibold text-slate-900">{currencyFormatter.format(nseReturns.dividendIncome)}</span></p>
                            <p className="mt-1 text-sm text-slate-600">Capital gain: <span className="font-semibold text-slate-900">{currencyFormatter.format(nseReturns.capitalGain)}</span></p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{currencyFormatter.format(nseReturns.totalValue)}</p>
                        </div>
                    </div>
                );
            case 'creditCard':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModalField label="Credit card balance (KES)">
                            <NumericInput aria-label="Credit card balance (KES)" className={inputClass} value={cardBalance} onChange={(event) => setCardBalance(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Annual interest rate (%)">
                            <input aria-label="Credit card annual interest rate (%)" className={inputClass} type="number" min={0} step="0.1" value={cardRate} onChange={(event) => setCardRate(Number(event.target.value || 0))} />
                        </ModalField>
                        <ModalField label="Monthly repayment (KES)">
                            <NumericInput aria-label="Credit card monthly repayment (KES)" className={inputClass} value={cardPayment} onChange={(event) => setCardPayment(Number(event.target.value || 0))} />
                        </ModalField>
                        <div className="rounded-[1.1rem] border border-[#c7e4db] bg-[#f8fcfa] p-4">
                            <p className="text-sm font-semibold text-slate-900">Estimated repayment result</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#166a55]">{cardRepayment.months >= 999 ? 'Increase payment' : `${cardRepayment.months} months`}</p>
                            {cardRepayment.months < 999 && <p className="mt-2 text-sm text-slate-600">Estimated interest: <span className="font-semibold text-slate-900">{currencyFormatter.format(cardRepayment.interest)}</span></p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4 pb-20">
            <section
                className="rounded-[1rem] px-5 py-4 text-white shadow-sm sm:px-6"
                style={{ background: `linear-gradient(135deg, ${BRAND_GREEN_DARK} 0%, ${BRAND_GREEN} 55%, #38b180 100%)` }}
            >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[0.85rem] bg-[#ef4444] text-white">
                                <Wallet size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Resources &amp; Tools</h2>
                                <p className="text-sm text-white/70">Shilingi Moves</p>
                            </div>
                        </div>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                            Financial calculators, curated books and learning resources tailored for the Kenyan market - to help you make smarter money decisions every day.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:justify-end">
                        {primaryTabs.map((tab) => (
                            <TabButton
                                key={tab.id}
                                active={activeTab === tab.id}
                                activeTone={tab.activeTone}
                                icon={tab.icon}
                                label={tab.label}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
                <TopMetricCard label="Calculators Available" value={availableCalculators.length} helper={`Included with your ${String(currentTier || 'BASIC').toUpperCase()} plan`} accent="text-[#166a55]" />
                <TopMetricCard label="Curated Books" value="18" helper="KE - Africa - Global editions" accent="text-[#b56a00]" />
                <TopMetricCard label="Your Reading Progress" value={readingProgress} helper="1 in progress - 2 completed" accent="text-[#7a57d1]" />
            </section>

            <section className="rounded-[1rem] border border-[#d0ddd9] bg-white p-2 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {contentTabs.map((tab) => (
                        <TabButton key={tab.id} active={activeTab === tab.id} icon={tab.icon} label={tab.label} compact onClick={() => setActiveTab(tab.id)} />
                    ))}
                </div>
            </section>

            {activeTab === 'calculators' && (
                <>
                    <section className="flex flex-wrap gap-2 rounded-[1rem] border border-[#d0ddd9] bg-[#f8fbfa] p-2">
                        {availableCalculatorFilters.map((filter) => (
                            <FilterPill key={filter.id} active={activeFilter === filter.id} label={filter.label} onClick={() => setActiveFilter(filter.id)} />
                        ))}
                    </section>

                    <section className="grid gap-3 xl:grid-cols-3">
                        {filteredCalculators.map((item) => (
                            <ResourceCard key={item.id} item={item} onOpen={setSelectedTool} />
                        ))}
                    </section>
                </>
            )}

            {activeTab === 'books' && (
                <section className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#fff4df] text-[#b56a00]">
                                    <BookOpen size={18} />
                                </span>
                                <h3 className="text-[1.35rem] font-bold tracking-tight text-slate-950">Curated Financial Books</h3>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Build your money mindset - from Nairobi to the world. Start local, grow global.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center rounded-[0.8rem] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            + Suggest a Book
                        </button>
                    </div>

                    {availableBookSections.map((section) => (
                        <div key={section.id} className="space-y-4">
                            <div className="flex items-center justify-between gap-4 border-b border-[#cfe8df] pb-3">
                                <h4 className="text-[1.15rem] font-bold tracking-tight text-slate-950">{section.title}</h4>
                                <p className="text-sm text-slate-400">{section.helper}</p>
                            </div>

                            <div className="grid gap-3 xl:grid-cols-3">
                                {section.books.map((book) => (
                                    <article key={book.title} className="rounded-[1rem] border border-[#d0ddd9] bg-white p-4 shadow-sm">
                                        <div className="flex gap-4">
                                            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.85rem] bg-gradient-to-br ${book.coverTone} shadow-sm`}>
                                                <div className="flex h-7 w-6 items-center justify-center rounded-[0.35rem] border-2 border-slate-950 bg-white text-[10px] text-slate-950">
                                                    <span className="block h-4 w-3 rounded-[0.15rem] bg-[#69d74f]" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h5 className="text-base font-bold leading-6 text-slate-950">{book.title}</h5>
                                                <p className="mt-1 text-sm text-slate-400">{book.author}</p>
                                                <p className="mt-3 text-sm leading-6 text-slate-600">{book.blurb}</p>
                                                <div className="mt-4 flex items-center justify-between gap-3">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${book.badgeTone}`}>{book.badge}</span>
                                                    <button type="button" className="text-sm font-semibold text-[#166a55]">
                                                        Read More -&gt;
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {activeTab === 'podcasts' && (
                <section className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#f5efff] text-[#7a57d1]">
                                    <Headphones size={18} />
                                </span>
                                <h3 className="text-[1.35rem] font-bold tracking-tight text-slate-950">Curated Financial Podcasts</h3>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Learn money on the move - Kenyan voices first, then the world&apos;s best.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center rounded-[0.8rem] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            + Suggest a Podcast
                        </button>
                    </div>

                    {availablePodcastSections.map((section) => (
                        <div key={section.id} className="space-y-4">
                            <div className="flex items-center justify-between gap-4 border-b border-[#cfe8df] pb-3">
                                <h4 className="text-[1.15rem] font-bold tracking-tight text-slate-950">{section.title}</h4>
                                <p className="text-sm text-slate-400">{section.helper}</p>
                            </div>

                            <div className="grid gap-3 xl:grid-cols-3">
                                {section.items.map((podcast) => {
                                    const Icon = podcast.icon;

                                    return (
                                        <article key={podcast.title} className="rounded-[1rem] border border-[#d0ddd9] bg-white p-4 shadow-sm">
                                            <div className="flex gap-4">
                                                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.85rem] bg-gradient-to-br ${podcast.coverTone} shadow-sm text-white`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                <h5 className="text-base font-bold leading-6 text-slate-950">{podcast.title}</h5>
                                                <p className="mt-1 text-sm text-slate-400">{podcast.host}</p>
                                                <p className="mt-3 text-sm leading-6 text-slate-600">{podcast.blurb}</p>
                                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${podcast.tagOneTone}`}>{podcast.tagOne}</span>
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${podcast.tagTwoTone}`}>{podcast.tagTwo}</span>
                                                        <button
                                                            type="button"
                                                            className="ml-auto inline-flex items-center rounded-[0.75rem] px-3.5 py-2 text-sm font-semibold text-white"
                                                            style={{ backgroundColor: BRAND_GREEN }}
                                                        >
                                                            Listen
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {activeTab === 'learning' && (
                <section className="space-y-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#f8f1df] text-[#6e5a1b]">
                                <GraduationCap size={18} />
                            </span>
                            <h3 className="text-[1.35rem] font-bold tracking-tight text-slate-950">Learning Hub</h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Structured financial education for every stage of your money journey.</p>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-3">
                        {availableLearningHighlights.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article key={item.title} className={`rounded-[1rem] border border-[#d0ddd9] bg-white p-4 shadow-sm ${item.accent}`}>
                                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] ${item.iconTone}`}>
                                        <Icon size={18} />
                                    </div>
                                    <h4 className="mt-4 text-base font-bold text-slate-950">{item.title}</h4>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>

                                    {item.progress !== null && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-sm text-slate-400">
                                                <span>Your progress</span>
                                                <span className="font-semibold text-[#166a55]">{item.progress}%</span>
                                            </div>
                                            <div className="mt-2 h-2 rounded-full bg-[#edf5f1]">
                                                <div className="h-2 rounded-full" style={{ width: `${item.progress}%`, backgroundColor: BRAND_GREEN }} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <p className="text-sm text-slate-400">{item.meta}</p>
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.badgeTone}`}>{item.badge}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            <section
                className="rounded-[1rem] p-5 text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${BRAND_GREEN_DARK} 0%, #1b8a61 55%, ${BRAND_GREEN} 100%)` }}
            >
                <div className="max-w-3xl">
                    <h3 className="text-lg font-bold tracking-tight">Resources Connect to Your Full Financial Journey</h3>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                        Every calculator links to the relevant pillar. Apply what you learn directly to your budget, investments, and planning tools.
                    </p>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
                    {availableEcosystemLinks.map((item) => {
                        const Icon = item.icon;
                        const isDisabled = false;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleEcosystemNavigate(item.id)}
                                disabled={isDisabled}
                                className="rounded-[0.95rem] border border-white/12 bg-white/6 px-4 py-4 text-left transition hover:bg-white/10 disabled:cursor-default"
                            >
                                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] ${item.iconTone}`}>
                                    <Icon size={18} />
                                </span>
                                <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                                <p className="mt-1 text-sm font-semibold text-[#ffcf5a]">{item.cta} -&gt;</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {selectedTool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
                    <div className="w-full max-w-3xl rounded-[1.5rem] border border-[#c7e4db] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#e2f1eb] px-5 py-4">
                            <h3 className="text-xl font-bold text-slate-950">{selectedToolMeta?.title}</h3>
                            <button type="button" onClick={() => setSelectedTool(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c7e4db] text-slate-500 transition hover:bg-[#f8fcfa]" aria-label="Close calculator">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-5">
                            <p className="text-sm leading-6 text-slate-600">{selectedToolMeta?.description}</p>
                            {renderCalculatorModalBody()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesToolsPanel;

