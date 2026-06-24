import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, ChevronDown, BookOpen, BarChart2,
    Wrench, Users, Shield, HelpCircle, Mail,
    Phone, ArrowRight, MessageCircle, Sparkles
} from 'lucide-react';
import Footer from '../components/Footer';

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────

const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: Sparkles },
    { id: 'learn', label: 'Learning Hub', icon: BookOpen },
    { id: 'compare', label: 'Compare Products', icon: BarChart2 },
    { id: 'tools', label: 'Financial Tools', icon: Wrench },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'account', label: 'Account & Privacy', icon: Shield },
];

const faqs = [
    // ── General ──────────────────────────────────────────────────────────────
    {
        category: 'general',
        q: 'What is Shilingi Moves?',
        a: 'Shilingi Moves is Kenya\'s all-in-one financial wellness platform. We help everyday Kenyans learn about money, compare financial products like bank accounts and SACCOs, use free budgeting tools, and connect with a community of people on the same journey. It is all in one place and completely free.',
    },
    {
        category: 'general',
        q: 'Is Shilingi Moves free to use?',
        a: 'Yes! Shilingi Moves is 100% free to join and use. Our learning content, comparison tools, and calculators are all free. We make money through partnerships with financial institutions, never by charging you.',
    },
    {
        category: 'general',
        q: 'Who is Shilingi Moves built for?',
        a: 'Shilingi Moves is built for any Kenyan who earns money and wants to make the most of it. That includes students, young professionals, side hustlers, small business owners, families planning for the future, and Kenyans in the diaspora sending money home.',
    },
    {
        category: 'general',
        q: 'Is Shilingi Moves a bank or a financial institution?',
        a: 'No. Shilingi Moves is not a bank, SACCO, or investment firm. We are an independent financial education and comparison platform. We do not hold your money or offer financial products directly. We help you understand and compare the products offered by licensed Kenyan financial institutions.',
    },
    {
        category: 'general',
        q: 'Is the advice on Shilingi Moves regulated?',
        a: 'The content on Shilingi Moves is educational and informational - it is not personalised financial advice. For decisions tailored to your specific situation, use regulated providers and trusted financial professionals outside the platform.',
    },

    // ── Learning Hub ─────────────────────────────────────────────────────────
    {
        category: 'learn',
        q: 'What topics can I learn about on Shilingi Moves?',
        a: 'Our Learning Hub covers budgeting, saving, investing, debt management, insurance, SACCOs, M-Pesa and mobile money, retirement planning, and more. Everything is explained in simple, everyday language built for the Kenyan context.',
    },
    {
        category: 'learn',
        q: 'Do I need any financial background to use the Learning Hub?',
        a: 'Not at all. Our content is written at a simple reading level so anyone can understand it, whether you\'re hearing about compound interest for the first time or looking to level up your investment knowledge.',
    },
    {
        category: 'learn',
        q: 'Are the learning materials available in Swahili?',
        a: 'We currently publish content in English, but we are actively working on Swahili content to make financial education even more accessible. Stay tuned, or join our community to let us know which topics you\'d like in Swahili first.',
    },
    {
        category: 'learn',
        q: 'Can I track my learning progress?',
        a: 'Yes! Once you create a free account, you can track which lessons you\'ve completed, bookmark articles, and follow guided learning paths tailored to your financial goals.',
    },

    // ── Compare ──────────────────────────────────────────────────────────────
    {
        category: 'compare',
        q: 'What financial products can I compare on Shilingi Moves?',
        a: 'You can compare bank accounts, savings accounts, fixed deposits, SACCOs, mobile loans (like M-Shwari, KCB M-Pesa, Fuliza), unit trusts, money market funds, insurance products, and more. We\'re constantly adding new products.',
    },
    {
        category: 'compare',
        q: 'How do you get the rates and data for comparisons?',
        a: 'We gather data directly from financial institutions, their official websites, and publicly available regulatory filings. We update our data regularly, but we always recommend confirming current rates directly with the provider before making a decision.',
    },
    {
        category: 'compare',
        q: 'Is the comparison data unbiased?',
        a: 'Yes. We do not favour any financial institution in our comparisons. Our rankings are based on objective criteria like interest rates, fees, and terms. While we have commercial partnerships, these never influence how products are ranked or displayed.',
    },
    {
        category: 'compare',
        q: 'Can I apply for a financial product directly through Shilingi Moves?',
        a: 'In most cases, we direct you to the financial institution\'s own website or branch to apply. In some cases, we have integrated application flows with partner institutions, and these will be clearly marked.',
    },

    // ── Tools ─────────────────────────────────────────────────────────────────
    {
        category: 'tools',
        q: 'What financial tools does Shilingi Moves offer?',
        a: 'We offer a growing suite of free tools including: a Budget Planner, Savings Goal Calculator, Loan Repayment Calculator, Investment Growth Calculator, Emergency Fund Calculator, and a Debt Payoff Planner. They are all calibrated for Kenyan shillings and local financial realities.',
    },
    {
        category: 'tools',
        q: 'Do I need an account to use the tools?',
        a: 'Most tools are available without an account. However, creating a free account lets you save your calculations, track your progress over time, and get personalised recommendations based on your financial situation.',
    },
    {
        category: 'tools',
        q: 'How accurate are the calculators?',
        a: 'Our calculators use standard financial formulas and are designed to give you a realistic estimate. They are for planning purposes, and actual results may vary based on the specific terms of your financial product. Always confirm with your bank or SACCO.',
    },

    // ── Community ─────────────────────────────────────────────────────────────
    {
        category: 'community',
        q: 'What is the Shilingi Moves community?',
        a: 'Our community is a safe, supportive space where Kenyans share money tips, celebrate wins, ask questions, and support each other on their financial journeys. You can join discussions, share your story, and learn from others who are on the same path.',
    },
    {
        category: 'community',
        q: 'How do I join the community?',
        a: 'Simply create a free Shilingi Moves account and you\'ll have access to the community forums, discussion groups, and member events. You can also follow us on social media to join the wider conversation.',
    },
    {
        category: 'community',
        q: 'Is the community moderated?',
        a: 'Yes. Our community is actively moderated to ensure it remains a respectful, helpful, and scam-free space. We have clear community guidelines and a zero-tolerance policy for spam, harassment, or misleading financial advice.',
    },

    // ── Account & Privacy ─────────────────────────────────────────────────────
    {
        category: 'account',
        q: 'How do I create an account?',
        a: 'Click "Get Started Free" on any page, enter your name, email address, and a password, and you\'re in. No credit card or payment details required.',
    },
    {
        category: 'account',
        q: 'Is my personal data safe with Shilingi Moves?',
        a: 'Absolutely. We take data privacy very seriously. We never sell your personal data to third parties. Your information is encrypted and stored securely. You can read our full Privacy Policy for details on how we collect, use, and protect your data.',
    },
    {
        category: 'account',
        q: 'Can I delete my account?',
        a: 'Yes. You can delete your account at any time from your account settings. Once deleted, all your personal data will be permanently removed from our systems within 30 days, in line with our data retention policy.',
    },
    {
        category: 'account',
        q: 'Does Shilingi Moves share my data with financial institutions?',
        a: 'We only share data with partner institutions when you explicitly choose to apply for or enquire about a product through our platform. We will always ask for your consent before sharing any of your information.',
    },
];

// ─── ACCORDION ITEM ───────────────────────────────────────────────────────────

const AccordionItem = ({ item, isOpen, onToggle }) => (
    <div
        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary-200 shadow-md' : 'border-gray-100 hover:border-gray-200'
            } bg-white`}
    >
        <button
            onClick={onToggle}
            className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left group"
        >
            <span className={`font-semibold text-base leading-snug transition-colors ${isOpen ? 'text-primary-700' : 'text-gray-900 group-hover:text-primary-700'}`}>
                {item.q}
            </span>
            <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 mt-0.5 ${isOpen ? 'bg-primary-600 text-white rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                }`}>
                <ChevronDown size={16} />
            </span>
        </button>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="px-6 pb-6 text-gray-600 leading-relaxed text-sm border-t border-gray-50 pt-4">
                {item.a}
            </p>
        </div>
    </div>
);

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────

const FAQPage = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState(null);
    const faqSectionRef = useRef(null);

    const handleCategoryClick = (id) => {
        setActiveCategory(id);
        setTimeout(() => {
            faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    useEffect(() => {
        document.title = 'FAQs | Shilingi Moves | Kenya\'s Financial Companion';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Got questions about Shilingi Moves? Find answers about our learning hub, comparison tools, financial calculators, community, and account settings.');
    }, []);

    // Reset open accordion when filter changes
    useEffect(() => { setOpenIndex(null); }, [activeCategory, searchQuery]);

    const filtered = faqs.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = searchQuery.trim() === '' ||
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white">

            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section
                className="pt-20 pb-32 relative overflow-hidden"
                style={{
                    backgroundColor: '#004d3d',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Cpath d='M0 200c100 0 150 50 250 50s150-50 250-50 150 50 250 50 150-50 250-50v1H0z' fill='none' stroke='rgba(255,255,255,0.07)' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: 'cover',
                }}
            >
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                <div className="container-custom relative z-10 text-center">
                    <p className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-5">
                        <HelpCircle size={14} /> Help Centre
                    </p>
                    <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-5 leading-[1.1] tracking-tight"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.35)' }}
                    >
                        How can we help you?
                    </h1>
                    <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">
                        Find answers to the most common questions about Shilingi Moves, from getting started to managing your account.
                    </p>

                    {/* Search bar */}
                    <div className="max-w-xl mx-auto relative">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search your question…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-13 pr-6 py-4 rounded-2xl text-gray-900 placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-300 text-base"
                            style={{ paddingLeft: '3.25rem' }}
                        />
                    </div>
                </div>
            </section>

            {/* ── CATEGORY TABS + ACCORDION ─────────────────────────────── */}
            <section ref={faqSectionRef} className="container-custom -mt-10 pb-20 relative z-10">

                {/* Category pill tabs */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const active = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${active
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                                    }`}
                            >
                                <Icon size={14} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Results count */}
                {searchQuery && (
                    <p className="text-center text-sm text-gray-500 mb-6">
                        {filtered.length === 0
                            ? 'No results found. Try a different search term.'
                            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${searchQuery}"`}
                    </p>
                )}

                {/* Accordion list */}
                {filtered.length > 0 ? (
                    <div className="max-w-3xl mx-auto space-y-3">
                        {filtered.map((item, i) => (
                            <AccordionItem
                                key={i}
                                item={item}
                                isOpen={openIndex === i}
                                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-md mx-auto text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No questions found</h3>
                        <p className="text-gray-500 text-sm mb-6">Try searching with different keywords or browse all categories.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-500 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>

            {/* ── STILL HAVE QUESTIONS ──────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full mb-4 uppercase tracking-wide">
                            Still need help?
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            We're here for you.
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Can't find what you're looking for? Our team is happy to help. Reach out through any of the channels below.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {/* Email */}
                        <a
                            href="mailto:hello@shilingimoves.com"
                            className="group bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                <Mail size={24} className="text-primary-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                            <p className="text-sm text-gray-500 mb-3">We reply within 24 hours</p>
                            <p className="text-sm font-semibold text-primary-600">hello@shilingimoves.com</p>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/254700000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 bg-[#25D366]/10 rounded-xl flex items-center justify-center group-hover:bg-[#25D366] transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] group-hover:text-white transition-colors">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                            <p className="text-sm text-gray-500 mb-3">Chat with us instantly</p>
                            <p className="text-sm font-semibold text-[#128C7E]">+254 700 000 000</p>
                        </a>

                        {/* Community */}
                        <Link
                            to="/community"
                            className="group bg-white rounded-2xl border border-gray-100 p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                <MessageCircle size={24} className="text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">Ask the Community</h3>
                            <p className="text-sm text-gray-500 mb-3">Get answers from fellow Kenyans</p>
                            <p className="text-sm font-semibold text-purple-600">Visit Community →</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────── */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
                        <div className="relative z-10">
                            <Sparkles size={36} className="mx-auto mb-4 text-primary-200" />
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to take control of your money?</h2>
                            <p className="text-primary-100 mb-7 max-w-md mx-auto">
                                Join thousands of Kenyans already using Shilingi Moves for free.
                            </p>
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-extrabold rounded-full shadow-lg hover:scale-105 transition-all duration-300 group"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQPage;

