import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Scale, BookOpen, AlertTriangle, UserCog, Lock,
    Banknote, Globe, RefreshCw, XCircle, Mail,
    Phone, ArrowRight, ChevronRight, FileText,
    CheckCircle2, ShieldAlert, Gavel
} from 'lucide-react';
import Footer from '../components/Footer';

// ─── TOC SECTIONS ─────────────────────────────────────────────────────────────
const sections = [
    { id: 'introduction', label: 'Introduction', icon: FileText },
    { id: 'definitions', label: 'Definitions', icon: BookOpen },
    { id: 'general-use', label: 'General Terms of Use', icon: Scale },
    { id: 'platform-services', label: 'Platform Services', icon: Globe },
    { id: 'account', label: 'Your Account', icon: UserCog },
    { id: 'disclaimers', label: 'Disclaimers', icon: AlertTriangle },
    { id: 'fees', label: 'Fees & Charges', icon: Banknote },
    { id: 'intellectual', label: 'Intellectual Property', icon: Lock },
    { id: 'privacy-data', label: 'Your Privacy & Data', icon: Lock },
    { id: 'modifications', label: 'Modifications & Termination', icon: RefreshCw },
    { id: 'liability', label: 'Limitation of Liability', icon: ShieldAlert },
    { id: 'governing-law', label: 'Governing Law', icon: Gavel },
    { id: 'contact', label: 'Contact Us', icon: Mail },
];

// ─── SUMMARY PILL ─────────────────────────────────────────────────────────────
const SummaryPill = ({ text }) => (
    <div className="flex items-start gap-2 py-2">
        <CheckCircle2 size={15} className="text-primary-600 shrink-0 mt-0.5" />
        <span className="text-sm text-gray-600 leading-snug">{text}</span>
    </div>
);

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
const TermsSection = ({ id, number, title, icon: Icon, summary, children }) => (
    <section id={id} className="scroll-mt-28 mb-14">
        <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shrink-0">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-0.5">
                    Section {number}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {title}
                </h2>
            </div>
        </div>

        {summary && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-6">
                <p className="text-xs font-bold text-primary-700 uppercase tracking-widest mb-3">
                    Quick Summary
                </p>
                <div className="divide-y divide-primary-100">
                    {summary.map((s, i) => <SummaryPill key={i} text={s} />)}
                </div>
            </div>
        )}

        <div className="text-gray-600 text-sm leading-relaxed space-y-4">
            {children}
        </div>

        <div className="mt-8 border-b border-gray-100" />
    </section>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const TermsPage = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const observerRef = useRef(null);

    useEffect(() => {
        document.title = 'Terms of Service — Shilingi Moves | Kenya\'s Financial Wellness Platform';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Shilingi Moves Terms of Service — the rules that govern your use of our financial education and comparison platform in Kenya.');
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        );
        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observerRef.current.observe(el);
        });
        return () => observerRef.current?.disconnect();
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-white">

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section
                className="pt-20 pb-16 relative overflow-hidden"
                style={{ backgroundColor: '#004d3d' }}
            >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-6">
                            <Scale size={14} /> Legal
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-5 leading-tight">
                            Terms of Service
                        </h1>
                        <p className="text-primary-100 text-lg mb-6 max-w-xl leading-relaxed">
                            These terms govern your use of Shilingi Moves. We've written them to be as clear and fair
                            as possible — please read them so we're on the same page.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium">
                                <CheckCircle2 size={12} /> Effective: 1 January 2025
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium">
                                <RefreshCw size={12} /> Last Updated: 19 February 2026
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium">
                                <Gavel size={12} /> Governed by Kenyan Law
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST STRIP ───────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 py-4">
                <div className="container-custom">
                    <div className="flex flex-wrap gap-6 justify-center md:justify-start text-xs text-gray-500 font-medium">
                        {[
                            { icon: Scale, text: 'Kenyan law applies' },
                            { icon: CheckCircle2, text: 'Free to use — always' },
                            { icon: XCircle, text: 'No hidden charges' },
                            { icon: Globe, text: 'Not a financial institution' },
                            { icon: Gavel, text: 'CBK & CMA compliant disclosures' },
                        ].map(({ icon: Icon, text }, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5">
                                <Icon size={13} className="text-primary-600" />
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MAIN LAYOUT ───────────────────────────────────────────────── */}
            <div className="container-custom py-14">
                <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14">

                    {/* ── STICKY TOC SIDEBAR ────────────────────────────────── */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Table of Contents
                            </p>
                            <nav className="space-y-1">
                                {sections.map(({ id, label, icon: Icon }) => {
                                    const isActive = activeSection === id;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => scrollTo(id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 group ${isActive
                                                ? 'bg-primary-50 text-primary-700 font-semibold'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                                }`}
                                        >
                                            <Icon size={14} className={isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                            {label}
                                            {isActive && <ChevronRight size={12} className="ml-auto text-primary-400" />}
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-2xl text-center">
                                <Scale size={22} className="text-primary-600 mx-auto mb-2" />
                                <p className="text-xs font-bold text-gray-800 mb-1">Legal Questions?</p>
                                <p className="text-xs text-gray-500 mb-3">Reach our legal team</p>
                                <a
                                    href="mailto:legal@shilingimoves.com"
                                    className="text-xs font-semibold text-primary-600 hover:underline"
                                >
                                    legal@shilingimoves.com
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* ── TERMS CONTENT ─────────────────────────────────────── */}
                    <main className="max-w-3xl">

                        {/* ── 1. INTRODUCTION ─────────────────────────────── */}
                        <TermsSection
                            id="introduction"
                            number="1"
                            title="Introduction"
                            icon={FileText}
                            summary={[
                                'By using Shilingi Moves, you agree to these Terms of Service.',
                                'These terms apply to all visitors, registered users, and partners.',
                                'Shilingi Moves is a financial education and comparison platform — not a bank or investment firm.',
                            ]}
                        >
                            <p>
                                Welcome to Shilingi Moves. These Terms of Service ("Terms") constitute a legally binding
                                agreement between you and <strong>Shilingi Moves Ltd</strong> ("Shilingi Moves", "we",
                                "us", or "our"), a company registered in Kenya, governing your access to and use of
                                our platform at <strong>shilingimoves.com</strong> and any associated mobile applications,
                                tools, or services (collectively, the "Platform").
                            </p>
                            <p>
                                <strong>By accessing or using the Platform, you confirm that you have read, understood,
                                    and agree to be bound by these Terms.</strong> If you do not agree to these Terms,
                                please do not use the Platform.
                            </p>
                            <p>
                                These Terms should be read alongside our{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>,
                                which explains how we collect and handle your personal data.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                                    <AlertTriangle size={15} /> Important Notice
                                </p>
                                <p className="text-sm text-amber-700">
                                    Shilingi Moves is <strong>not a bank, SACCO, licensed investment adviser, or financial
                                        institution</strong>. We do not hold your money, execute trades, or provide personalised
                                    financial advice. All content is for educational and informational purposes only.
                                </p>
                            </div>
                        </TermsSection>

                        {/* ── 2. DEFINITIONS ──────────────────────────────── */}
                        <TermsSection
                            id="definitions"
                            number="2"
                            title="Definitions"
                            icon={BookOpen}
                        >
                            <p>In these Terms, the following words have the meanings given below:</p>
                            <div className="space-y-2">
                                {[
                                    { term: '"Shilingi Moves" / "Platform" / "we" / "our"', def: 'Means Shilingi Moves Ltd, its affiliates, officers, employees, agents, and licensors, operating shilingimoves.com and related services.' },
                                    { term: '"User" / "You" / "Your"', def: 'Any person who visits, accesses, or uses the Platform, whether registered or not.' },
                                    { term: '"Registered User"', def: 'A User who has created a Shilingi Moves account and agreed to these Terms.' },
                                    { term: '"Dashboard"', def: 'The personalised member hub accessible to Registered Users after logging in, containing saved calculations, goals, and recommendations.' },
                                    { term: '"Services"', def: 'All features, tools, content, and functionality provided through the Platform, including financial education, product comparisons, calculators, and community features.' },
                                    { term: '"Partner Institution"', def: 'A bank, SACCO, insurance company, investment firm, or other licensed Kenyan financial institution that has entered a commercial agreement with Shilingi Moves.' },
                                    { term: '"Credentials"', def: 'Your unique account login details, including email address and password.' },
                                    { term: '"Business Day"', def: 'Any day other than a Saturday, Sunday, or public holiday in Kenya.' },
                                    { term: '"Content"', def: 'All text, graphics, images, videos, tools, calculators, comparisons, and other material available on the Platform.' },
                                    { term: '"KDPA"', def: 'The Kenya Data Protection Act 2019 and associated regulations.' },
                                ].map(({ term, def }, i) => (
                                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0 mt-2" />
                                        <div>
                                            <span className="font-semibold text-gray-900">{term}:</span>{' '}
                                            <span className="text-gray-600">{def}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TermsSection>

                        {/* ── 3. GENERAL TERMS OF USE ─────────────────────── */}
                        <TermsSection
                            id="general-use"
                            number="3"
                            title="General Terms of Use"
                            icon={Scale}
                            summary={[
                                'You must be 18 or older to use Shilingi Moves.',
                                'You may not use the Platform for unlawful purposes or to harm other users.',
                                'Attempting to hack, overload, or manipulate the Platform is strictly prohibited.',
                            ]}
                        >
                            <p><strong>3.1 Eligibility</strong></p>
                            <p>
                                You must be at least 18 years of age and legally capable of entering into a binding
                                contract under Kenyan law to use this Platform. By using it, you confirm you meet
                                these requirements.
                            </p>

                            <p><strong>3.2 Acceptable Use</strong></p>
                            <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You must not:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Use the Platform in any way that violates Kenyan law or regulation</li>
                                <li>Attempt to gain unauthorised access to any part of the Platform or its systems</li>
                                <li>Disrupt, disable, or impair the Platform's functionality</li>
                                <li>Transmit any malicious software or harmful code</li>
                                <li>Harvest or collect other users' personal data without consent</li>
                                <li>Impersonate another person or entity</li>
                                <li>Post false, misleading, or fraudulent financial information in the community</li>
                                <li>Use the Platform to solicit or conduct pyramid schemes, fraudulent investments, or unlicensed financial services</li>
                            </ul>

                            <p><strong>3.3 Intellectual Property</strong></p>
                            <p>
                                Using our Platform does not grant you ownership of any intellectual property rights
                                in our Services or content. You may access content for your own personal, non-commercial
                                use only. You may not reproduce, distribute, modify, or create derivative works from
                                our content without our express written permission.
                            </p>

                            <p><strong>3.4 Geographic Availability</strong></p>
                            <p>
                                Shilingi Moves is designed for users in Kenya. Not all features or partner products
                                may be available in all locations. We reserve the right to restrict access based on
                                geographic or eligibility factors.
                            </p>
                        </TermsSection>

                        {/* ── 4. PLATFORM SERVICES ────────────────────────── */}
                        <TermsSection
                            id="platform-services"
                            number="4"
                            title="Platform Services"
                            icon={Globe}
                            summary={[
                                'Our comparison data is sourced from public filings and partner institutions — always verify rates directly.',
                                'Calculator results are estimates for planning purposes only.',
                                'Community content reflects user opinions and is not endorsed by Shilingi Moves.',
                            ]}
                        >
                            <p><strong>4.1 Financial Education</strong></p>
                            <p>
                                Our Learning Hub provides educational articles, videos, and guides on personal finance
                                topics relevant to everyday Kenyans. All content is for general information only and
                                does not constitute personalised financial advice.
                            </p>

                            <p><strong>4.2 Product Comparisons</strong></p>
                            <p>
                                We compare financial products (including bank accounts, SACCOs, loans, unit trusts,
                                and insurance) based on publicly available data and information provided by Partner
                                Institutions. While we strive for accuracy:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Rates, fees, and terms may change — always confirm directly with the provider before applying</li>
                                <li>Comparison rankings are based on objective criteria and are not influenced by our commercial partnerships</li>
                                <li>We do not guarantee that any product is suitable for your particular circumstances</li>
                            </ul>

                            <p><strong>4.3 Financial Calculators & Tools</strong></p>
                            <p>
                                Our calculators use standard financial formulas calibrated for the Kenyan market.
                                Results are estimates for planning purposes only. Actual outcomes will depend on
                                the specific terms of your financial products and your personal circumstances.
                            </p>

                            <p><strong>4.4 Community Features</strong></p>
                            <p>
                                The Shilingi Moves community allows Registered Users to share experiences,
                                ask questions, and support each other. User-generated content does not represent
                                the views of Shilingi Moves and is not financial advice. We actively moderate the
                                community to ensure it remains safe, but we are not liable for content posted by users.
                            </p>

                            <p><strong>4.5 Service Changes</strong></p>
                            <p>
                                We are constantly improving our Platform. We may add, modify, or discontinue features
                                at any time. Where changes are material, we will give you reasonable advance notice.
                                We are not liable for any loss resulting from the discontinuation of a feature.
                            </p>
                        </TermsSection>

                        {/* ── 5. YOUR ACCOUNT ─────────────────────────────── */}
                        <TermsSection
                            id="account"
                            number="5"
                            title="Your Account"
                            icon={UserCog}
                            summary={[
                                'You are responsible for keeping your login credentials secure.',
                                'You must notify us immediately if you suspect unauthorised access.',
                                'You may delete your account at any time from your settings.',
                            ]}
                        >
                            <p><strong>5.1 Registration</strong></p>
                            <p>
                                To access personalised features, you must create a Shilingi Moves account using a valid
                                email address. You agree to provide accurate, complete, and up-to-date information
                                during registration and to keep this information current.
                            </p>

                            <p><strong>5.2 Account Security</strong></p>
                            <p>
                                You are solely responsible for maintaining the confidentiality of your Credentials.
                                Do not share your password with anyone. We recommend changing your password
                                periodically and never using the same password across multiple platforms.
                            </p>
                            <p>
                                If you believe your account has been compromised, contact us immediately at{' '}
                                <a href="mailto:security@shilingimoves.com" className="text-primary-600 hover:underline">security@shilingimoves.com</a>.
                                We will never ask for your password via email or phone.
                            </p>

                            <p><strong>5.3 Account Suspension & Termination</strong></p>
                            <p>
                                We reserve the right to suspend or terminate your account at any time if we believe
                                you have breached these Terms — including, but not limited to, misuse of the Platform,
                                fraud, or providing false information. We will endeavour to notify you before doing so
                                unless the situation requires immediate action.
                            </p>
                            <p>
                                You may close your account at any time from your Dashboard settings. Upon closure,
                                your personal data will be handled in accordance with our{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                            </p>
                        </TermsSection>

                        {/* ── 6. DISCLAIMERS ──────────────────────────────── */}
                        <TermsSection
                            id="disclaimers"
                            number="6"
                            title="Disclaimers"
                            icon={AlertTriangle}
                            summary={[
                                'Shilingi Moves provides information, not personalised financial advice.',
                                'We are not responsible for decisions you make based on our content.',
                                'Third-party links are provided for convenience — we do not endorse them.',
                            ]}
                        >
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-2">
                                    <AlertTriangle size={15} /> Not Financial Advice
                                </p>
                                <p className="text-sm text-amber-700">
                                    The content on Shilingi Moves — including articles, comparisons, calculator results,
                                    community posts, and any other material — is for <strong>general information and
                                        educational purposes only</strong>. It does not constitute personalised financial,
                                    investment, tax, or legal advice. Always consult a qualified Kenyan financial
                                    professional before making financial decisions.
                                </p>
                            </div>

                            <p><strong>6.1 Accuracy of Information</strong></p>
                            <p>
                                We take all reasonable steps to ensure the accuracy and completeness of information
                                on the Platform. However, we make no representation, warranty, or guarantee —
                                express or implied — as to the accuracy, completeness, or fitness for purpose
                                of any content, data, tool, calculator, or product comparison.
                            </p>

                            <p><strong>6.2 Third-Party Links & Services</strong></p>
                            <p>
                                The Platform may contain links to third-party websites, including Partner Institution
                                websites. These links are provided for convenience only. We do not control, endorse,
                                or take responsibility for the content, accuracy, or practices of any third-party site.
                                Access to third-party sites is entirely at your own risk.
                            </p>

                            <p><strong>6.3 Market Data</strong></p>
                            <p>
                                Interest rates, investment returns, exchange rates, and other market data displayed
                                on the Platform may be subject to delays and may not reflect current market conditions.
                                Always verify current rates and terms directly with the relevant financial institution
                                before making any financial decision.
                            </p>

                            <p><strong>6.4 Force Majeure</strong></p>
                            <p>
                                Shilingi Moves shall not be liable for any failure or delay in performing its
                                obligations where such failure or delay results from circumstances beyond our
                                reasonable control — including but not limited to acts of God, natural disasters,
                                civil unrest, cyberattacks, telecommunications failures, government actions, or
                                power outages. In such events, our obligations are suspended for the duration
                                of the force majeure event.
                            </p>
                        </TermsSection>

                        {/* ── 7. FEES & CHARGES ───────────────────────────── */}
                        <TermsSection
                            id="fees"
                            number="7"
                            title="Fees & Charges"
                            icon={Banknote}
                            summary={[
                                'Shilingi Moves is free to use — there are no subscription fees.',
                                'We earn revenue through partnerships with financial institutions, not from users.',
                                'Any future fee changes will be communicated at least 30 days in advance.',
                            ]}
                        >
                            <p><strong>7.1 Free Platform</strong></p>
                            <p>
                                Shilingi Moves is currently free for all users. Our Learning Hub, comparison tools,
                                financial calculators, and community features are all available at no cost. We do not
                                charge subscription or access fees.
                            </p>

                            <p><strong>7.2 How We Earn Revenue</strong></p>
                            <p>
                                We generate revenue through commercial partnerships with financial institutions — who
                                may pay us a referral or listing fee when users engage with their products through our
                                Platform. These arrangements <strong>never influence the objectivity of our comparisons
                                    or educational content</strong>.
                            </p>
                            <p>
                                Where products are featured through a paid partnership, this will be clearly disclosed
                                with a "Sponsored" or "Partner" label.
                            </p>

                            <p><strong>7.3 Future Fee Changes</strong></p>
                            <p>
                                Shilingi Moves reserves the right to introduce fees for specific premium services in the
                                future. Any such changes will be communicated to Registered Users via email and an
                                in-app notification at least <strong>30 days before taking effect</strong>. You will
                                always have the option to cancel your account before any fee applies.
                            </p>
                        </TermsSection>

                        {/* ── 8. INTELLECTUAL PROPERTY ────────────────────── */}
                        <TermsSection
                            id="intellectual"
                            number="8"
                            title="Intellectual Property"
                            icon={Lock}
                            summary={[
                                'All Platform content, branding, and tools are owned by Shilingi Moves.',
                                'You may use content for personal, non-commercial purposes only.',
                                'User-generated content remains yours, but you grant us a licence to display it.',
                            ]}
                        >
                            <p><strong>8.1 Our Content</strong></p>
                            <p>
                                All content on the Platform — including articles, videos, infographics, tool designs,
                                algorithms, logos, trademarks, and branding — is owned by or licensed to
                                Shilingi Moves Ltd and is protected by Kenyan and international intellectual
                                property law. You may not reproduce, republish, or distribute our content without
                                prior written consent.
                            </p>

                            <p><strong>8.2 Your Content</strong></p>
                            <p>
                                When you post content on our community or provide reviews, you retain ownership
                                of that content. By posting, you grant Shilingi Moves a non-exclusive,
                                royalty-free, worldwide licence to use, display, and distribute your content
                                on the Platform. We may also use anonymised community insights to improve our
                                products and services.
                            </p>
                            <p>
                                You confirm that any content you post does not infringe the intellectual property
                                rights of any third party and complies with our Community Guidelines.
                            </p>
                        </TermsSection>

                        {/* ── 9. YOUR PRIVACY & DATA ──────────────────────── */}
                        <TermsSection
                            id="privacy-data"
                            number="9"
                            title="Your Privacy & Data"
                            icon={Lock}
                            summary={[
                                'Your privacy is protected under the Kenya Data Protection Act 2019.',
                                'We never sell your personal data.',
                                'See our full Privacy Policy for complete details on how we handle your data.',
                            ]}
                        >
                            <p>
                                Shilingi Moves takes your privacy seriously. Our collection, use, storage, and
                                sharing of your personal data is governed by the{' '}
                                <strong>Kenya Data Protection Act 2019 (KDPA)</strong> and detailed in our{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>,
                                which forms part of these Terms.
                            </p>
                            <p>
                                By using the Platform, you accept our Privacy Policy and consent to the
                                collection and use of your data as described therein. Key commitments:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>We do not sell your personal data to third parties</li>
                                <li>Data is shared with Partner Institutions only with your explicit consent</li>
                                <li>You have full rights to access, correct, and delete your data at any time</li>
                                <li>You are responsible for keeping your login credentials confidential</li>
                            </ul>
                        </TermsSection>

                        {/* ── 10. MODIFICATIONS & TERMINATION ─────────────── */}
                        <TermsSection
                            id="modifications"
                            number="10"
                            title="Modifications & Termination"
                            icon={RefreshCw}
                            summary={[
                                'We may update these Terms at any time with reasonable notice.',
                                'Continued use of the Platform after changes means you accept the new Terms.',
                                'You can stop using the Platform and delete your account at any time.',
                            ]}
                        >
                            <p><strong>10.1 Changes to These Terms</strong></p>
                            <p>
                                Shilingi Moves may update or amend these Terms at any time to reflect changes
                                in our practices, Kenyan law, or business operations. When we make material changes,
                                we will notify you by:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Email to your registered email address</li>
                                <li>A prominent notice on the Platform for at least 14 days</li>
                                <li>Updating the "Last Updated" date at the top of this page</li>
                            </ul>
                            <p>
                                Your continued use of the Platform after the effective date of updated Terms
                                constitutes acceptance. If you do not agree, you may close your account.
                            </p>

                            <p><strong>10.2 Changes to the Platform</strong></p>
                            <p>
                                We are constantly evolving. We may add new features, modify existing ones, or
                                discontinue services with reasonable advance notice. We are not liable for any
                                loss arising from service modifications or discontinuation.
                            </p>

                            <p><strong>10.3 Termination by Either Party</strong></p>
                            <p>
                                You can stop using the Platform at any time. Shilingi Moves may also terminate or
                                suspend your access if you breach these Terms. Upon termination, Sections 3.3, 6,
                                8, 11, and 12 of these Terms will continue to apply.
                            </p>
                        </TermsSection>

                        {/* ── 11. LIMITATION OF LIABILITY ─────────────────── */}
                        <TermsSection
                            id="liability"
                            number="11"
                            title="Limitation of Liability"
                            icon={ShieldAlert}
                            summary={[
                                'Shilingi Moves is not liable for financial losses arising from use of the Platform.',
                                'Our total liability is limited to the amount you have paid us in the past 12 months (typically zero).',
                                'We are not responsible for losses caused by third-party websites or Partner Institutions.',
                            ]}
                        >
                            <p>
                                To the fullest extent permitted by Kenyan law, Shilingi Moves, its directors,
                                employees, partners, and licensors shall not be liable for:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>Any financial loss or investment loss arising from decisions made based on Platform content</li>
                                <li>Indirect, incidental, consequential, punitive, or special damages of any nature</li>
                                <li>Loss of data, loss of profits, or business interruption</li>
                                <li>Actions or omissions of Partner Institutions or third-party websites</li>
                                <li>Inaccuracies in market data, rates, or product information</li>
                                <li>Unauthorised access to your account resulting from your failure to protect your credentials</li>
                            </ul>
                            <p className="mt-2">
                                Where we cannot exclude liability by law, our total aggregate liability to you for any
                                claims arising out of or in connection with the Platform shall not exceed the total
                                amount you have paid to Shilingi Moves in the 12 months preceding the claim (which,
                                given our free model, will typically be zero).
                            </p>
                            <p>
                                <strong>Nothing in these Terms excludes liability for fraud, death, or personal injury
                                    caused by our negligence</strong> — as required by Kenyan law.
                            </p>
                        </TermsSection>

                        {/* ── 12. GOVERNING LAW ───────────────────────────── */}
                        <TermsSection
                            id="governing-law"
                            number="12"
                            title="Governing Law & Jurisdiction"
                            icon={Gavel}
                            summary={[
                                'These Terms are governed by the laws of Kenya.',
                                'Disputes shall be resolved in the courts of Nairobi, Kenya.',
                                'We will always try to resolve disputes amicably before resorting to legal proceedings.',
                            ]}
                        >
                            <p>
                                These Terms of Service shall be governed by and construed in accordance with the laws
                                of the Republic of Kenya, including but not limited to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>The Kenya Data Protection Act 2019</li>
                                <li>The Computer Misuse and Cybercrimes Act 2018</li>
                                <li>The Consumer Protection Act (Cap. 502A)</li>
                                <li>The Central Bank of Kenya Act</li>
                                <li>The Capital Markets Act</li>
                            </ul>
                            <p>
                                Any dispute, controversy, or claim arising out of or relating to these Terms, or the
                                breach, termination, or invalidity thereof, shall be subject to the exclusive jurisdiction
                                of the courts in <strong>Nairobi, Kenya</strong>.
                            </p>
                            <p>
                                Before initiating any legal proceedings, both parties agree to attempt to resolve
                                disputes through good-faith negotiation for a period of at least 30 days.
                            </p>
                            <p>
                                If any provision of these Terms is found to be unenforceable by a court of competent
                                jurisdiction, the remaining provisions shall continue in full force and effect.
                            </p>
                        </TermsSection>

                        {/* ── 13. CONTACT ─────────────────────────────────── */}
                        <section id="contact" className="scroll-mt-28">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-0.5">Section 13</p>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Contact Us</h2>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                                If you have questions about these Terms, please contact our legal team. We aim to
                                respond to all legal queries within <strong>5 Business Days</strong>.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                                {[
                                    {
                                        icon: Mail,
                                        title: 'Legal Team',
                                        value: 'legal@shilingimoves.com',
                                        href: 'mailto:legal@shilingimoves.com',
                                        sub: 'For Terms & legal queries',
                                        color: 'bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white',
                                    },
                                    {
                                        icon: Phone,
                                        title: 'Call Us',
                                        value: '+254 700 000 000',
                                        href: 'tel:+254700000000',
                                        sub: 'Mon–Fri, 8am–6pm EAT',
                                        color: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
                                    },
                                    {
                                        icon: Globe,
                                        title: 'Consumer Protection',
                                        value: 'kebs.org',
                                        href: 'https://www.kebs.org',
                                        sub: 'Kenya consumer rights body',
                                        color: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
                                        external: true,
                                    },
                                ].map(({ icon: Icon, title, value, href, sub, color, external }, i) => (
                                    <a
                                        key={i}
                                        href={href}
                                        target={external ? '_blank' : undefined}
                                        rel={external ? 'noopener noreferrer' : undefined}
                                        className="group bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-colors ${color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
                                        <p className="text-primary-600 font-semibold text-xs mb-1 break-all">{value}</p>
                                        <p className="text-xs text-gray-400">{sub}</p>
                                    </a>
                                ))}
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm text-gray-600">
                                <p className="font-bold text-gray-900 mb-2">Registered Address</p>
                                <p>Shilingi Moves Ltd</p>
                                <p>Park Court, Ojijo Road, Parklands</p>
                                <p>Nairobi, Kenya</p>
                            </div>
                        </section>

                    </main>
                </div>
            </div>

            {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
            <section className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
                        <div className="relative z-10">
                            <Scale size={36} className="mx-auto mb-4 text-primary-200" />
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                Questions about our Terms?
                            </h2>
                            <p className="text-primary-100 mb-7 max-w-md mx-auto">
                                We're happy to explain anything. Our team responds to legal queries within 5 Business Days.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-extrabold rounded-full shadow-lg hover:scale-105 transition-all duration-300 group"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="mailto:legal@shilingimoves.com"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300"
                                >
                                    Email Legal Team
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer showCTA={false} />
        </div>
    );
};

export default TermsPage;
