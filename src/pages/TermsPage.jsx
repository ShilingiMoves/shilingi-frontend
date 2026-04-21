import React, { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    Banknote,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    FileText,
    Gavel,
    Globe,
    Lock,
    Mail,
    Phone,
    RefreshCw,
    Scale,
    ShieldAlert,
    UserCog,
    XCircle,
} from 'lucide-react';
import Footer from '../components/Footer';

const effectiveDate = '21 April 2026';
const legalEmail = 'legal@shilingimoves.com';
const supportEmail = 'hello@shilingimoves.com';
const phoneNumber = '+254 700 000 000';

const sections = [
    { id: 'welcome', label: 'Welcome', icon: FileText },
    { id: 'who-we-are', label: 'Who We Are', icon: BookOpen },
    { id: 'website-use', label: 'Use of Website', icon: Scale },
    { id: 'information', label: 'Website Information', icon: Globe },
    { id: 'no-advice', label: 'No Professional Advice', icon: AlertTriangle },
    { id: 'submissions', label: 'User Submissions', icon: UserCog },
    { id: 'accounts', label: 'Accounts & Access', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: ShieldAlert },
    { id: 'intellectual-property', label: 'Intellectual Property', icon: Lock },
    { id: 'third-party', label: 'Third-Party Links', icon: Globe },
    { id: 'availability', label: 'Availability', icon: RefreshCw },
    { id: 'liability', label: 'Liability', icon: ShieldAlert },
    { id: 'indemnity', label: 'Indemnity', icon: Gavel },
    { id: 'termination', label: 'Suspension & Termination', icon: XCircle },
    { id: 'changes', label: 'Changes', icon: RefreshCw },
    { id: 'law', label: 'Governing Law', icon: Gavel },
    { id: 'contact', label: 'Contact', icon: Mail },
];

const termsContent = [
    {
        id: 'welcome',
        title: 'Welcome to Shilingi Moves',
        summary: [
            'These Terms govern your use of the Shilingi Moves website, content, services, tools, and features.',
            'By accessing or using the website, you agree to these Terms.',
            'If you do not agree with these Terms, please do not use the website.',
        ],
        body: [
            'Welcome to Shilingi Moves. These Terms of Service govern your use of our website and any services, content, features, or tools made available through it.',
            'These Terms are designed to be clear, fair, and easy to understand while protecting our users, our platform, and our business.',
        ],
    },
    {
        id: 'who-we-are',
        title: 'Who We Are',
        summary: [
            'Shilingi Moves is a venture under Kaizen Publishers Limited.',
            'Our platform supports financial education, tools, comparisons, and user guidance.',
            'You can contact us using the details listed on this page.',
        ],
        body: [
            'Shilingi Moves is a venture under Kaizen Publishers Limited. In these Terms, references to "Shilingi Moves", "we", "us", and "our" mean Shilingi Moves and Kaizen Publishers Limited, as applicable.',
            'If you have questions about these Terms, contact us at legal@shilingimoves.com or hello@shilingimoves.com.',
        ],
    },
    {
        id: 'website-use',
        title: 'Use of the Website',
        summary: [
            'Use the website only for lawful purposes.',
            'Do not interfere with the website, security, systems, data, or other users.',
            'We may suspend or restrict access if we reasonably believe there has been misuse.',
        ],
        body: [
            'You may use this website only for lawful purposes and in a way that does not harm Shilingi Moves, our users, our service providers, or the public.',
        ],
        bullets: [
            'Do not use the website in any way that breaks any law or regulation.',
            'Do not try to gain unauthorized access to the website, server, database, user accounts, or connected systems.',
            'Do not interfere with the operation, security, availability, or integrity of the website.',
            'Do not upload or transmit malicious code, spam, harmful material, or disruptive content.',
            'Do not copy, scrape, harvest, or misuse website content without permission.',
            'Do not use the website to mislead, impersonate, harass, exploit, or harm others.',
        ],
    },
    {
        id: 'information',
        title: 'Information on the Website',
        summary: [
            'We try to keep information accurate and current.',
            'Website content may change or be removed without notice.',
            'We do not guarantee that every item of content is complete, accurate, or current at all times.',
        ],
        body: [
            'We try to ensure that information on the website is accurate and up to date. However, we do not guarantee that all content will always be complete, accurate, or current.',
            'The content on this website is for general information only and may be updated, changed, or removed at any time without notice.',
        ],
    },
    {
        id: 'no-advice',
        title: 'No Professional or Financial Advice',
        summary: [
            'Website content is general information unless we expressly say otherwise.',
            'It should not be treated as personal financial, investment, legal, tax, or professional advice.',
            'Seek appropriate professional advice before making decisions based on website content.',
        ],
        body: [
            'Unless we expressly state otherwise, content on this website is for general information only. It should not be treated as personal financial, investment, legal, tax, or other professional advice.',
            'You remain responsible for your own financial decisions. You should seek appropriate professional advice before making decisions based on information from this website.',
        ],
    },
    {
        id: 'submissions',
        title: 'User Submissions',
        summary: [
            'Information you submit must be accurate to the best of your knowledge.',
            'You must have the right to provide the information.',
            'You remain responsible for the information you submit.',
        ],
        body: [
            'If you submit information to us through forms, email, sign-up pages, contact pages, community features, or other website tools, you confirm that the information is accurate to the best of your knowledge and that you have the right to provide it.',
        ],
        bullets: [
            'Your submission must not violate any law.',
            'Your submission must not violate another person\'s rights.',
            'Your submission must not be misleading, harmful, fraudulent, or malicious.',
        ],
    },
    {
        id: 'accounts',
        title: 'Accounts and Access',
        summary: [
            'If accounts are available, you are responsible for keeping your login details secure.',
            'Tell us promptly if you suspect unauthorized access or misuse.',
            'We may suspend or disable accounts where we reasonably believe there has been misuse, fraud, or breach of these Terms.',
        ],
        body: [
            'If the website allows account creation, you are responsible for keeping your login details confidential, ensuring access to your account is secure, and notifying us promptly if you suspect unauthorized access or misuse.',
            'We may suspend or disable accounts where we reasonably believe there has been misuse, fraud, security risk, or a breach of these Terms.',
        ],
    },
    {
        id: 'privacy',
        title: 'Privacy',
        summary: [
            'Your use of the website is also subject to our Privacy Policy.',
            'The Privacy Policy explains how we collect, use, store, share, and protect personal information.',
            'By using the website, you acknowledge that you have read our Privacy Policy.',
        ],
        body: [
            'Your use of the website is also subject to our Privacy Policy, which explains how we collect, use, store, and protect personal information.',
            'By using the website, you acknowledge that you have read our Privacy Policy and understand how your data may be handled.',
        ],
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        summary: [
            'Website content, branding, layouts, logos, graphics, and original materials belong to Shilingi Moves and/or Kaizen Publishers Limited, or are used with permission.',
            'You may use the website for personal, lawful, and internal business purposes only.',
            'You may not commercially exploit, republish, or misuse our materials without written consent.',
        ],
        body: [
            'Unless otherwise stated, all content on this website, including text, branding, logos, graphics, layouts, and original materials, belongs to Shilingi Moves and/or Kaizen Publishers Limited or is used with permission.',
        ],
        bullets: [
            'Do not reproduce, republish, distribute, or redistribute website content without our prior written consent.',
            'Do not commercially exploit website materials without permission.',
            'Do not use our name, branding, logo, or content in a misleading or unauthorized way.',
        ],
    },
    {
        id: 'third-party',
        title: 'Third-Party Links and Tools',
        summary: [
            'Third-party links and tools may appear for convenience or functionality.',
            'We do not control third-party websites or services.',
            'Your use of third-party services is at your own risk and subject to their terms.',
        ],
        body: [
            'The website may contain links to third-party websites, platforms, or tools. These are provided for convenience only.',
            'We do not control third-party websites or services and are not responsible for their content, availability, privacy practices, security, or terms.',
        ],
    },
    {
        id: 'availability',
        title: 'Availability of the Website',
        summary: [
            'We do not guarantee that the website will always be available, uninterrupted, secure, or error-free.',
            'We may suspend, withdraw, update, or change any part of the website at any time.',
            'Maintenance, upgrades, outages, or external service issues may affect access.',
        ],
        body: [
            'We work to keep Shilingi Moves reliable, but we do not guarantee that the website will always be available, uninterrupted, secure, or error-free.',
            'We may suspend, withdraw, update, or change any part of the website at any time, including for maintenance, security, operational, legal, or business reasons.',
        ],
    },
    {
        id: 'liability',
        title: 'Limitation of Liability',
        summary: [
            'To the fullest extent permitted by law, we are not liable for indirect, incidental, special, or consequential loss.',
            'This includes loss of business, revenue, data, opportunity, or interruption of operations.',
            'Nothing in these Terms excludes liability where it cannot lawfully be excluded.',
        ],
        body: [
            'To the fullest extent permitted by law, Shilingi Moves and Kaizen Publishers Limited will not be liable for any indirect, incidental, special, or consequential loss arising from or connected to your use of, or inability to use, the website.',
            'Nothing in these Terms excludes liability where it cannot lawfully be excluded.',
        ],
    },
    {
        id: 'indemnity',
        title: 'Indemnity',
        summary: [
            'You agree to protect Shilingi Moves and Kaizen Publishers Limited from claims linked to your misuse of the website.',
            'This includes breaches of these Terms, legal violations, or violations of another person\'s rights.',
            'The indemnity also covers reasonable costs arising from those claims.',
        ],
        body: [
            'You agree to indemnify and hold harmless Shilingi Moves, Kaizen Publishers Limited, and their officers, representatives, and service providers from losses, claims, liabilities, or costs arising out of your misuse of the website, breach of these Terms, or violation of any law or the rights of another person.',
        ],
    },
    {
        id: 'termination',
        title: 'Suspension and Termination',
        summary: [
            'We may suspend, restrict, or terminate access if you breach these Terms.',
            'We may also act where your use creates legal, security, operational, or business risk.',
            'Suspension or termination does not affect rights and obligations that already existed.',
        ],
        body: [
            'We may suspend, restrict, or terminate your access to the website if you breach these Terms, if we believe your use creates legal, security, or operational risk, or if we need to protect the website, our users, our partners, or our business.',
            'Termination or suspension does not affect any rights or obligations that had already arisen before that action.',
        ],
    },
    {
        id: 'changes',
        title: 'Changes to These Terms',
        summary: [
            'We may update these Terms from time to time.',
            'Updated Terms will be posted on this page with a revised effective date.',
            'Your continued use of the website after changes are posted means you accept the updated Terms.',
        ],
        body: [
            'We may update these Terms from time to time to reflect changes in our website, services, business, legal obligations, or user needs.',
            'Any updated version will be posted on this page with a revised effective date. Your continued use of the website after changes are posted means you accept the updated Terms.',
        ],
    },
    {
        id: 'law',
        title: 'Governing Law',
        summary: [
            'These Terms are governed by the laws of Kenya.',
            'Disputes connected with these Terms or website use are subject to the laws and courts of Kenya.',
            'Different rules may apply only where applicable law requires otherwise.',
        ],
        body: [
            'These Terms are governed by the laws of Kenya.',
            'Any dispute arising from or connected with these Terms or the use of the website shall be subject to the laws and courts of Kenya, unless applicable law requires otherwise.',
        ],
    },
];

const SummaryPill = ({ text }) => (
    <div className="flex items-start gap-2 py-2">
        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary-600" />
        <span className="text-sm leading-snug text-gray-600">{text}</span>
    </div>
);

const TermsSection = ({ id, number, title, icon: Icon, summary, body, bullets }) => (
    <section id={id} className="mb-14 scroll-mt-28">
        <div className="mb-5 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Icon size={18} />
            </div>
            <div>
                <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-primary-600">Section {number}</p>
                <h2 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">{title}</h2>
            </div>
        </div>

        {summary && (
            <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-700">Quick Summary</p>
                <div className="divide-y divide-primary-100">
                    {summary.map((item) => <SummaryPill key={item} text={item} />)}
                </div>
            </div>
        )}

        <div className="space-y-4 text-sm leading-relaxed text-gray-600">
            {body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {bullets && (
                <ul className="space-y-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    {bullets.map((item) => (
                        <li key={item} className="flex gap-3">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary-600" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div className="mt-8 border-b border-gray-100" />
    </section>
);

const TermsPage = () => {
    const [activeSection, setActiveSection] = useState('welcome');
    const observerRef = useRef(null);

    useEffect(() => {
        document.title = 'Terms of Service | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Shilingi Moves Terms of Service for website access, account use, intellectual property, privacy, liability, and Kenyan governing law.');
        }
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observerRef.current.observe(element);
        });

        return () => observerRef.current?.disconnect();
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-white">
            <section className="relative overflow-hidden bg-[#004d3d] pb-16 pt-20">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                            <Scale size={14} /> Legal
                        </p>
                        <h1 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">Terms of Service</h1>
                        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-primary-100">
                            Clear rules for using Shilingi Moves, written for a Kenyan financial education platform under Kaizen Publishers Limited.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                                <CheckCircle2 size={12} /> Effective: {effectiveDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                                <RefreshCw size={12} /> Last Updated: {effectiveDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                                <Gavel size={12} /> Governed by Kenyan Law
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-b border-gray-100 bg-white py-4">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500 md:justify-start">
                        {[
                            { icon: Scale, text: 'Kenyan law applies' },
                            { icon: BookOpen, text: 'Kaizen Publishers Limited venture' },
                            { icon: XCircle, text: 'No hidden website charges' },
                            { icon: Globe, text: 'General information platform' },
                            { icon: Banknote, text: 'Not personal financial advice' },
                        ].map(({ icon: Icon, text }) => (
                            <span key={text} className="inline-flex items-center gap-1.5">
                                <Icon size={13} className="text-primary-600" />
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container-custom py-14">
                <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24">
                            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Table of Contents</p>
                            <nav className="space-y-1">
                                {sections.map(({ id, label, icon: Icon }) => {
                                    const isActive = activeSection === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => scrollTo(id)}
                                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${isActive
                                                ? 'bg-primary-50 font-semibold text-primary-700'
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

                            <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 p-4 text-center">
                                <Scale size={22} className="mx-auto mb-2 text-primary-600" />
                                <p className="mb-1 text-xs font-bold text-gray-800">Legal Questions?</p>
                                <p className="mb-3 text-xs text-gray-500">Reach our legal team</p>
                                <a href={`mailto:${legalEmail}`} className="text-xs font-semibold text-primary-600 hover:underline">{legalEmail}</a>
                            </div>
                        </div>
                    </aside>

                    <main className="max-w-3xl">
                        {termsContent.map((section, index) => {
                            const Icon = sections.find((item) => item.id === section.id)?.icon || FileText;
                            return (
                                <TermsSection
                                    key={section.id}
                                    number={index + 1}
                                    icon={Icon}
                                    {...section}
                                />
                            );
                        })}

                        <TermsSection
                            id="contact"
                            number={termsContent.length + 1}
                            title="Contact Us"
                            icon={Mail}
                            summary={[
                                'Use these contact details for questions about these Terms.',
                                'For privacy requests, use the privacy contact listed in the Privacy Policy.',
                                'Shilingi Moves is a venture under Kaizen Publishers Limited.',
                            ]}
                            body={[
                                'If you have any questions about these Terms, please contact us using the details below.',
                            ]}
                        />

                        <div className="mb-16 grid gap-4 sm:grid-cols-2">
                            {[
                                { label: 'Legal Email', value: legalEmail, href: `mailto:${legalEmail}`, icon: Mail },
                                { label: 'General Support', value: supportEmail, href: `mailto:${supportEmail}`, icon: Mail },
                                { label: 'Phone', value: phoneNumber, href: 'tel:+254700000000', icon: Phone },
                                { label: 'Legal Entity', value: 'Kaizen Publishers Limited', href: null, icon: BookOpen },
                            ].map(({ label, value, href, icon: Icon }) => {
                                const content = (
                                    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50">
                                        <Icon size={18} className="text-primary-600" />
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
                                            <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
                                        </div>
                                    </div>
                                );

                                return href ? <a key={label} href={href}>{content}</a> : <div key={label}>{content}</div>;
                            })}
                        </div>

                        <div className="rounded-3xl bg-[#004d3d] p-8 text-center text-white">
                            <h3 className="mb-3 text-2xl font-bold">Need help understanding these Terms?</h3>
                            <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-primary-100">
                                We have kept the language practical, but our team can clarify anything about website access, accounts, privacy, or platform use.
                            </p>
                            <a
                                href={`mailto:${legalEmail}`}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-50"
                            >
                                Contact Legal <ArrowRight size={16} />
                            </a>
                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsPage;
