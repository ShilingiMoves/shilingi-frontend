import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Lock, Eye, Database, UserCheck, RefreshCw,
    Globe, Bell, Trash2, Mail, Phone, ArrowRight,
    ChevronRight, FileText, AlertCircle, CheckCircle2
} from 'lucide-react';
import Footer from '../components/Footer';

// ─── TOC SECTIONS ─────────────────────────────────────────────────────────────
const sections = [
    { id: 'introduction', label: 'Introduction', icon: FileText },
    { id: 'information-we-collect', label: 'Information We Collect', icon: Database },
    { id: 'how-we-use', label: 'How We Use Your Data', icon: Eye },
    { id: 'data-sharing', label: 'Data Sharing', icon: Globe },
    { id: 'data-security', label: 'Data Security', icon: Lock },
    { id: 'your-rights', label: 'Your Rights', icon: UserCheck },
    { id: 'cookies', label: 'Cookies & Tracking', icon: Bell },
    { id: 'data-retention', label: 'Data Retention', icon: RefreshCw },
    { id: 'children', label: "Children's Privacy", icon: Shield },
    { id: 'changes', label: 'Policy Changes', icon: AlertCircle },
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
const PolicySection = ({ id, number, title, icon: Icon, summary, children }) => (
    <section id={id} className="scroll-mt-28 mb-14">
        {/* Section header */}
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

        {/* Summary callout */}
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

        {/* Content */}
        <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed space-y-4">
            {children}
        </div>

        <div className="mt-8 border-b border-gray-100" />
    </section>
);

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const PrivacyPage = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const observerRef = useRef(null);

    useEffect(() => {
        document.title = 'Privacy Policy — Shilingi Moves | Protecting Your Data';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', 'Shilingi Moves Privacy Policy — learn how we collect, use, and protect your personal data in compliance with the Kenya Data Protection Act 2019.');
    }, []);

    // Intersection observer for active TOC highlight
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
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold text-white mb-6">
                            <Shield size={14} /> Legal
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bold mb-5 leading-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-primary-100 text-lg mb-6 max-w-xl leading-relaxed">
                            Your privacy is a right, not a feature. Here's exactly what data we collect,
                            why we collect it, and how we keep it safe — in plain English.
                        </p>
                        {/* Meta pills */}
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium">
                                <CheckCircle2 size={12} /> Effective: 1 January 2025
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium">
                                <RefreshCw size={12} /> Last Updated: 19 February 2026
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium">
                                <FileText size={12} /> Kenya Data Protection Act 2019
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
                            { icon: Lock, text: 'End-to-end encryption' },
                            { icon: Database, text: 'Data stored in Kenya' },
                            { icon: Shield, text: 'KDPA 2019 compliant' },
                            { icon: UserCheck, text: 'You own your data' },
                            { icon: Eye, text: 'No data selling — ever' },
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

                            {/* Download / contact mini CTA */}
                            <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-2xl text-center">
                                <Shield size={22} className="text-primary-600 mx-auto mb-2" />
                                <p className="text-xs font-bold text-gray-800 mb-1">Questions?</p>
                                <p className="text-xs text-gray-500 mb-3">Our DPO is here to help</p>
                                <a
                                    href="mailto:privacy@shilingimoves.com"
                                    className="text-xs font-semibold text-primary-600 hover:underline"
                                >
                                    privacy@shilingimoves.com
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* ── POLICY CONTENT ────────────────────────────────────── */}
                    <main className="max-w-3xl">

                        {/* ── 1. INTRODUCTION ─────────────────────────────── */}
                        <PolicySection
                            id="introduction"
                            number="1"
                            title="Introduction"
                            icon={FileText}
                            summary={[
                                'Shilingi Moves is a Kenyan financial education and comparison platform — not a bank.',
                                'This policy applies to all users of shilingimoves.com and our mobile applications.',
                                'By using Shilingi Moves, you agree to the terms of this Privacy Policy.',
                            ]}
                        >
                            <p>
                                Shilingi Moves Ltd ("Shilingi Moves", "we", "our", or "us") is registered in Kenya and
                                operates <strong>shilingimoves.com</strong> — Kenya's financial wellness platform for
                                learning, comparing, and making smarter money decisions.
                            </p>
                            <p>
                                We are committed to protecting the personal information of every Kenyan who uses our
                                platform. This Privacy Policy explains how we collect, use, store, share, and safeguard
                                your personal data, in line with the <strong>Kenya Data Protection Act 2019 (KDPA)</strong>,
                                the Data Protection (General) Regulations 2021, and all applicable guidelines issued by
                                the Office of the Data Protection Commissioner (ODPC).
                            </p>
                            <p>
                                This policy applies to all visitors, registered users, and partners who interact with
                                any Shilingi Moves product or service — including our website, web app, mobile app,
                                email communications, and social media channels.
                            </p>
                            <p>
                                <strong>Shilingi Moves is not a bank, SACCO, investment firm, or licensed financial
                                    institution.</strong> We do not hold your money. We provide educational content,
                                financial product comparisons, and planning tools.
                            </p>
                        </PolicySection>

                        {/* ── 2. INFORMATION WE COLLECT ───────────────────── */}
                        <PolicySection
                            id="information-we-collect"
                            number="2"
                            title="Information We Collect"
                            icon={Database}
                            summary={[
                                'We only collect data that helps us improve your financial experience.',
                                'You can use most of our tools without creating an account.',
                                'We never collect your M-Pesa PIN, bank password, or payment credentials.',
                            ]}
                        >
                            <p><strong>2.1 Information You Give Us Directly</strong></p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Account registration:</strong> Full name, email address, phone number, and password (stored encrypted).</li>
                                <li><strong>Profile information:</strong> Age range, county of residence, financial goals, occupation category — used to personalise your experience.</li>
                                <li><strong>Calculator inputs:</strong> Income, expenses, savings goals, loan amounts entered into our financial tools. This is processed locally and not permanently stored unless you save your results.</li>
                                <li><strong>Support communications:</strong> Messages you send via email, WhatsApp, or our contact forms.</li>
                                <li><strong>Community contributions:</strong> Posts, comments, and testimonials you choose to share in the Shilingi Moves community.</li>
                            </ul>

                            <p><strong>2.2 Information Collected Automatically</strong></p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Usage data:</strong> Pages visited, features used, time spent, click paths — to understand how our platform is used and improve it.</li>
                                <li><strong>Device information:</strong> Device type, browser, operating system, IP address, and general location (county-level).</li>
                                <li><strong>Cookies & similar technologies:</strong> Session cookies, preference cookies, and analytics identifiers. See Section 7 for full details.</li>
                            </ul>

                            <p><strong>2.3 Information We Do NOT Collect</strong></p>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="text-sm text-red-800 font-semibold mb-2">We will never ask for or collect:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                                    <li>Your M-Pesa PIN or mobile money credentials</li>
                                    <li>Your bank account password or OTP codes</li>
                                    <li>Your National ID number or KRA PIN (unless required for a specific partner integration, with explicit consent)</li>
                                    <li>Biometric data</li>
                                </ul>
                            </div>
                        </PolicySection>

                        {/* ── 3. HOW WE USE YOUR DATA ─────────────────────── */}
                        <PolicySection
                            id="how-we-use"
                            number="3"
                            title="How We Use Your Data"
                            icon={Eye}
                            summary={[
                                'We use your data to personalise your financial journey.',
                                'We use aggregated, anonymised data to improve our platform and content.',
                                'We only send you marketing emails with your explicit consent — and you can unsubscribe anytime.',
                            ]}
                        >
                            <p>We use your personal data for the following purposes, under the legal bases provided by the Kenya Data Protection Act 2019:</p>

                            <div className="space-y-3">
                                {[
                                    { title: 'Service Delivery', base: 'Contractual necessity', desc: 'Creating and managing your account, processing your calculator inputs, displaying personalised product comparisons, and enabling community participation.' },
                                    { title: 'Personalisation', base: 'Legitimate interest', desc: 'Recommending relevant financial products, learning modules, and tools based on your stated goals and usage patterns.' },
                                    { title: 'Platform Improvement', base: 'Legitimate interest', desc: 'Analysing aggregated, anonymised usage data to improve our content, tools, and user experience.' },
                                    { title: 'Communications', base: 'Consent', desc: 'Sending you newsletters, product updates, financial tips, and platform announcements — only if you have opted in.' },
                                    { title: 'Legal Compliance', base: 'Legal obligation', desc: 'Complying with the Kenya Data Protection Act 2019, Central Bank of Kenya guidelines, Capital Markets Authority regulations, and any court orders.' },
                                    { title: 'Security & Fraud Prevention', base: 'Legitimate interest', desc: 'Detecting and preventing fraudulent activity, protecting our users, and maintaining platform integrity.' },
                                ].map(({ title, base, desc }, i) => (
                                    <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{title} <span className="text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full ml-1">{base}</span></p>
                                            <p className="text-sm text-gray-600 mt-1">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PolicySection>

                        {/* ── 4. DATA SHARING ─────────────────────────────── */}
                        <PolicySection
                            id="data-sharing"
                            number="4"
                            title="Data Sharing"
                            icon={Globe}
                            summary={[
                                'We do not sell your personal data to anyone — ever.',
                                'Data is only shared with partner financial institutions when you explicitly choose to enquire about their products.',
                                'We use trusted third-party service providers under strict data processing agreements.',
                            ]}
                        >
                            <p>
                                Shilingi Moves <strong>does not sell, rent, or trade your personal data</strong>.
                                We may share data only in the limited circumstances below:
                            </p>

                            <p><strong>4.1 Partner Financial Institutions</strong></p>
                            <p>
                                When you use our platform to express interest in a financial product (e.g., applying for a loan,
                                requesting a callback from a SACCO, or comparing savings accounts), we may share only the
                                information necessary for that enquiry — <strong>with your explicit consent at the point of action</strong>.
                                You will always see a clear opt-in before any data is shared.
                            </p>

                            <p><strong>4.2 Service Providers</strong></p>
                            <p>We use carefully vetted third-party providers bound by Data Processing Agreements (DPAs) to help operate our platform:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Cloud hosting:</strong> Servers located in Africa where possible</li>
                                <li><strong>Analytics:</strong> Anonymised, aggregated data only (no personal identifiers)</li>
                                <li><strong>Email communications:</strong> Your email to send newsletters you opted into</li>
                                <li><strong>Customer support:</strong> Name and email to respond to your queries</li>
                            </ul>

                            <p><strong>4.3 Legal Requirements</strong></p>
                            <p>
                                We may disclose your data if required by Kenyan law, court order, or regulatory authority
                                (including the ODPC, CBK, or CMA) — but only to the minimum extent legally required.
                                We will notify you of such a request unless prohibited by law.
                            </p>

                            <p><strong>4.4 Business Transfers</strong></p>
                            <p>
                                In the event of a merger, acquisition, or sale of Shilingi Moves, your data may be
                                transferred to the new entity. You will be notified in advance and given the option to
                                delete your account before the transfer.
                            </p>
                        </PolicySection>

                        {/* ── 5. DATA SECURITY ────────────────────────────── */}
                        <PolicySection
                            id="data-security"
                            number="5"
                            title="Data Security"
                            icon={Lock}
                            summary={[
                                'All data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
                                'We conduct regular security audits and penetration testing.',
                                'We have a 72-hour breach notification policy in line with KDPA 2019.',
                            ]}
                        >
                            <p>
                                We treat data security as a core product requirement, not an afterthought. Our security
                                measures include:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { title: 'TLS 1.3 Encryption', desc: 'All data in transit is encrypted using industry-standard TLS 1.3.' },
                                    { title: 'AES-256 at Rest', desc: 'Stored data is encrypted using AES-256, the same standard used by financial institutions.' },
                                    { title: 'Access Controls', desc: 'Role-based access controls ensure only authorised team members can access user data.' },
                                    { title: 'Regular Audits', desc: 'We conduct quarterly security audits and bi-annual penetration tests.' },
                                    { title: 'Secure Passwords', desc: 'Passwords are hashed using bcrypt — we cannot see your password.' },
                                    { title: 'Breach Response', desc: 'In the event of a breach, we notify the ODPC and affected users within 72 hours, as required by law.' },
                                ].map(({ title, desc }, i) => (
                                    <div key={i} className="flex gap-3 p-4 border border-gray-100 rounded-xl bg-white">
                                        <Lock size={14} className="text-primary-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4">
                                While we implement robust security measures, no system is 100% immune to threats.
                                We recommend you use a strong, unique password and enable two-factor authentication
                                on your account when available.
                            </p>
                        </PolicySection>

                        {/* ── 6. YOUR RIGHTS ──────────────────────────────── */}
                        <PolicySection
                            id="your-rights"
                            number="6"
                            title="Your Rights"
                            icon={UserCheck}
                            summary={[
                                'You have the right to access, correct, and delete your data at any time.',
                                'You can withdraw consent for marketing communications with one click.',
                                'Under KDPA 2019, you have the right to object to automated decision-making.',
                            ]}
                        >
                            <p>
                                Under the Kenya Data Protection Act 2019, you have the following rights as a data subject.
                                You can exercise any of these rights by contacting us at <a href="mailto:privacy@shilingimoves.com" className="text-primary-600 hover:underline">privacy@shilingimoves.com</a>:
                            </p>
                            <div className="space-y-3">
                                {[
                                    { right: 'Right to Access', desc: 'Request a copy of all personal data we hold about you. We will respond within 21 days as required by law.' },
                                    { right: 'Right to Rectification', desc: 'Ask us to correct any inaccurate or incomplete personal data we hold about you.' },
                                    { right: 'Right to Erasure ("Right to be Forgotten")', desc: 'Request the deletion of your personal data. Upon account deletion, we remove all personal data within 30 days.' },
                                    { right: 'Right to Data Portability', desc: 'Request your data in a machine-readable format (JSON/CSV) so you can transfer it to another service.' },
                                    { right: 'Right to Object', desc: 'Object to processing based on legitimate interest, including profiling and direct marketing.' },
                                    { right: 'Right to Withdraw Consent', desc: 'Withdraw consent for any processing based on consent (e.g., marketing emails) at any time — without affecting prior lawful processing.' },
                                    { right: 'Right to Lodge a Complaint', desc: 'File a complaint with the Office of the Data Protection Commissioner (ODPC) at odpc.go.ke if you believe your rights have been violated.' },
                                ].map(({ right, desc }, i) => (
                                    <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                                        <CheckCircle2 size={15} className="text-primary-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">{right}</p>
                                            <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PolicySection>

                        {/* ── 7. COOKIES ──────────────────────────────────── */}
                        <PolicySection
                            id="cookies"
                            number="7"
                            title="Cookies & Tracking"
                            icon={Bell}
                            summary={[
                                'We use essential cookies to keep the platform running.',
                                'Analytics cookies are anonymised — we cannot identify you from them.',
                                'You can manage or reject non-essential cookies at any time.',
                            ]}
                        >
                            <p>
                                Cookies are small files stored on your device to help websites work better.
                                We use the following categories:
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-primary-600 text-white text-xs uppercase tracking-wide">
                                            <th className="text-left p-3 rounded-tl-xl">Category</th>
                                            <th className="text-left p-3">Purpose</th>
                                            <th className="text-left p-3 rounded-tr-xl">Can You Opt Out?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { cat: 'Essential', purpose: 'Login sessions, security tokens, preferences', opt: 'No — required to use the platform' },
                                            { cat: 'Analytics', purpose: 'Anonymised usage patterns to improve the platform', opt: 'Yes — manage in cookie settings' },
                                            { cat: 'Functional', purpose: 'Remembering your calculator inputs and saved preferences', opt: 'Yes — manage in cookie settings' },
                                            { cat: 'Marketing', purpose: 'We do not use marketing/ad tracking cookies', opt: 'N/A — not used' },
                                        ].map(({ cat, purpose, opt }, i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="p-3 font-semibold text-gray-800">{cat}</td>
                                                <td className="p-3 text-gray-600">{purpose}</td>
                                                <td className="p-3 text-gray-600">{opt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                You can manage cookies through your browser settings. Note that disabling essential
                                cookies will affect your ability to log in and use personalised features.
                            </p>
                        </PolicySection>

                        {/* ── 8. DATA RETENTION ───────────────────────────── */}
                        <PolicySection
                            id="data-retention"
                            number="8"
                            title="Data Retention"
                            icon={RefreshCw}
                            summary={[
                                'Active account data is retained for as long as your account is open.',
                                'Deleted accounts are fully purged within 30 days.',
                                'Anonymised analytics data may be retained for up to 3 years for platform improvement.',
                            ]}
                        >
                            <p>We retain your personal data only as long as necessary for the purpose it was collected:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Account data:</strong> Retained for the lifetime of your account, plus 30 days after deletion (to allow account recovery).</li>
                                <li><strong>Financial calculator data:</strong> Not stored permanently unless you explicitly save a calculation to your account.</li>
                                <li><strong>Support communications:</strong> Retained for up to 2 years for quality assurance and legal reference.</li>
                                <li><strong>Usage logs:</strong> Anonymised and retained for up to 3 years to support platform analytics.</li>
                                <li><strong>Legal hold data:</strong> If required by a court order or regulatory investigation, relevant data may be retained beyond standard periods until the matter is resolved.</li>
                            </ul>
                            <p>
                                When data is no longer needed, it is securely deleted or irreversibly anonymised.
                                You can request early deletion at any time under your Right to Erasure (Section 6).
                            </p>
                        </PolicySection>

                        {/* ── 9. CHILDREN'S PRIVACY ───────────────────────── */}
                        <PolicySection
                            id="children"
                            number="9"
                            title="Children's Privacy"
                            icon={Shield}
                            summary={[
                                'Shilingi Moves is designed for users aged 18 and above.',
                                'We do not knowingly collect data from children under 18.',
                                'If we discover a minor has registered, their account is immediately deleted.',
                            ]}
                        >
                            <p>
                                Shilingi Moves is designed for adults aged 18 and above. We do not knowingly collect,
                                store, or process personal data from individuals under 18 years of age.
                            </p>
                            <p>
                                If we become aware that a child under 18 has provided us with personal data without
                                verifiable parental consent, we will take immediate steps to delete that information
                                from our records and close the account.
                            </p>
                            <p>
                                If you are a parent or guardian and believe your child has registered on our platform,
                                please contact us immediately at <a href="mailto:privacy@shilingimoves.com" className="text-primary-600 hover:underline">privacy@shilingimoves.com</a>.
                            </p>
                        </PolicySection>

                        {/* ── 10. POLICY CHANGES ──────────────────────────── */}
                        <PolicySection
                            id="changes"
                            number="10"
                            title="Policy Changes"
                            icon={AlertCircle}
                            summary={[
                                'We will notify you of material changes by email and an in-app banner.',
                                'Continued use of the platform after the effective date constitutes acceptance.',
                                'Previous versions of this policy are available on request.',
                            ]}
                        >
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our
                                practices, technology, legal requirements, or business operations.
                            </p>
                            <p>
                                When we make <strong>material changes</strong>, we will notify you by:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Sending an email to your registered email address</li>
                                <li>Displaying a prominent banner on the Shilingi Moves platform for at least 14 days</li>
                                <li>Updating the "Last Updated" date at the top of this page</li>
                            </ul>
                            <p>
                                Your continued use of Shilingi Moves after the effective date of an updated policy
                                constitutes your acceptance of the changes. If you do not agree, please discontinue
                                use and delete your account.
                            </p>
                            <p>
                                Previous versions of this policy are available on written request to
                                <a href="mailto:privacy@shilingimoves.com" className="text-primary-600 hover:underline ml-1">privacy@shilingimoves.com</a>.
                            </p>
                        </PolicySection>

                        {/* ── 11. CONTACT ─────────────────────────────────── */}
                        <section id="contact" className="scroll-mt-28">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-0.5">Section 11</p>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Contact Us & Data Protection Officer</h2>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                                If you have questions, concerns, or requests relating to your personal data or this
                                Privacy Policy, please reach out to our Data Protection Officer. We are committed to
                                responding within <strong>72 hours</strong> for urgent matters and <strong>10 working
                                    days</strong> for standard requests.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                                {[
                                    {
                                        icon: Mail,
                                        title: 'Email DPO',
                                        value: 'privacy@shilingimoves.com',
                                        href: 'mailto:privacy@shilingimoves.com',
                                        sub: 'For privacy requests & data queries',
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
                                        title: 'ODPC Complaints',
                                        value: 'odpc.go.ke',
                                        href: 'https://www.odpc.go.ke',
                                        sub: 'Official regulator for data rights',
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

                            {/* Physical address */}
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
                            <Shield size={36} className="mx-auto mb-4 text-primary-200" />
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Your data, your rules.</h2>
                            <p className="text-primary-100 mb-7 max-w-md mx-auto">
                                Manage your privacy settings, download your data, or delete your account — all from your Shilingi Moves dashboard.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-extrabold rounded-full shadow-lg hover:scale-105 transition-all duration-300 group"
                                >
                                    Create Free Account
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="mailto:privacy@shilingimoves.com"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300"
                                >
                                    Contact Our DPO
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

export default PrivacyPage;
