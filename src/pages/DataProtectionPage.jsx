import React, { useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Bell,
    CheckCircle2,
    ChevronRight,
    Database,
    Eye,
    FileText,
    Globe,
    Lock,
    Mail,
    Phone,
    RefreshCw,
    Shield,
    UserCheck,
} from 'lucide-react';
import Footer from '../components/Footer';

const effectiveDate = '21 April 2026';
const privacyEmail = 'privacy@shilingimoves.com';
const supportEmail = 'hello@shilingimoves.com';
const phoneNumber = '+254 700 000 000';

const sections = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'who-we-are', label: 'Who We Are', icon: FileText },
    { id: 'personal-data', label: 'Personal Data', icon: Database },
    { id: 'lawful-use', label: 'Lawful Use', icon: Eye },
    { id: 'cookies', label: 'Cookies & Analytics', icon: Bell },
    { id: 'sharing', label: 'Sharing', icon: UserCheck },
    { id: 'security', label: 'Security Safeguards', icon: Lock },
    { id: 'retention', label: 'Retention', icon: RefreshCw },
    { id: 'rights', label: 'Your Rights', icon: UserCheck },
    { id: 'children', label: 'Children', icon: Shield },
    { id: 'updates', label: 'Updates', icon: AlertCircle },
    { id: 'contact', label: 'Contact', icon: Mail },
];

const protectionContent = [
    {
        id: 'overview',
        title: 'Data Protection at Shilingi Moves',
        summary: [
            'Data protection and data privacy are connected: privacy explains what we do with personal data, while protection explains how we safeguard it.',
            'This page uses the same privacy policy source and presents the safeguards, rights, and handling practices in a dedicated format.',
            'Our approach is aligned with Kenyan data protection principles and the Kenya Data Protection Act, 2019.',
        ],
        body: [
            'Shilingi Moves respects your privacy and treats data protection as part of the product experience. This page explains how we collect, use, store, share, and protect your personal information when you visit our website or interact with us online.',
            'We keep this page practical and user-friendly so you can understand what happens to your information and how to contact us about data protection concerns.',
        ],
    },
    {
        id: 'who-we-are',
        title: 'Who We Are',
        summary: [
            'Shilingi Moves is a venture under Kaizen Publishers Limited.',
            'We operate a financial education, tools, comparison, dashboard, and communications platform.',
            'Privacy and data protection questions can be sent to privacy@shilingimoves.com.',
        ],
        body: [
            'In this Data Protection page, "Shilingi Moves", "we", "us", and "our" mean Shilingi Moves and Kaizen Publishers Limited, as applicable.',
            'If you have privacy questions, requests, or complaints, contact us at privacy@shilingimoves.com.',
        ],
    },
    {
        id: 'personal-data',
        title: 'Personal Data We Handle',
        summary: [
            'We collect information that is reasonably necessary for our website, services, communications, and user experience.',
            'This may include names, phone numbers, email addresses, form submissions, and basic website usage data.',
            'We aim to collect only what we reasonably need.',
        ],
        body: [
            'We may collect personal information directly from you, automatically through website usage, or through communications you choose to send us.',
        ],
        bullets: [
            'Name, phone number, and email address.',
            'Information submitted through contact forms, sign-up forms, newsletter forms, onboarding flows, or account features.',
            'Information you provide when communicating with us by email, phone, social channels, or support forms.',
            'Basic website usage information, including browser type, device information, pages visited, approximate location, and general site interaction.',
            'Information needed to operate accounts, dashboard access, and website features where those features are available.',
        ],
    },
    {
        id: 'lawful-use',
        title: 'How We Use Personal Data',
        summary: [
            'We use information to respond to enquiries, provide services, improve the website, keep records, and protect users.',
            'We may also use information to meet legal, regulatory, security, and operational obligations.',
            'We use personal data only where there is a lawful and legitimate reason to do so.',
        ],
        body: [
            'We may use your information to support the website, communicate with you, provide access to our services or features, and improve the Shilingi Moves experience.',
        ],
        bullets: [
            'Respond to enquiries and support requests.',
            'Communicate about services, products, content, updates, and platform changes.',
            'Provide access to website features, account areas, dashboards, or tools.',
            'Improve content, user journeys, accessibility, and overall user experience.',
            'Keep internal records and manage business operations.',
            'Comply with legal, regulatory, tax, accounting, or reporting obligations.',
            'Protect our business, website, partners, service providers, and users from misuse, fraud, security threats, or unlawful activity.',
        ],
    },
    {
        id: 'cookies',
        title: 'Cookies and Website Analytics',
        summary: [
            'Cookies and analytics help us improve functionality, understand traffic, and enhance the experience.',
            'Analytics may show which pages are visited, how users move through the site, and which devices are used.',
            'You can manage cookies through your browser settings.',
        ],
        body: [
            'Our website may use cookies or similar technologies to improve functionality, understand website traffic, measure engagement, and enhance user experience.',
        ],
    },
    {
        id: 'sharing',
        title: 'When We Share Information',
        summary: [
            'We do not sell your personal information.',
            'We share information only where necessary and where there is a legitimate reason.',
            'Service providers may help us host, communicate, analyze, secure, or operate the website.',
        ],
        body: [
            'We may share information only where necessary, proportionate, and supported by a legitimate reason.',
        ],
        bullets: [
            'Website hosting providers and infrastructure partners.',
            'Email, customer communication, or support service providers.',
            'Analytics providers that help improve website performance and user experience.',
            'Payment or technology service providers, where applicable.',
            'Professional advisers, auditors, lawyers, accountants, or consultants.',
            'Regulators, law enforcement, courts, or public authorities where required by law.',
        ],
    },
    {
        id: 'security',
        title: 'Security Safeguards',
        summary: [
            'We take reasonable technical, organizational, and administrative steps to protect personal information.',
            'We protect data against loss, misuse, unauthorized access, disclosure, alteration, or destruction.',
            'No online system is completely secure, so absolute security cannot be guaranteed.',
        ],
        body: [
            'Our data protection approach includes limiting access to information, using appropriate service providers, maintaining internal controls, and reviewing our practices as the platform grows.',
            'While we take privacy and security seriously, no online system is completely secure. We therefore cannot guarantee absolute security.',
        ],
    },
    {
        id: 'retention',
        title: 'Retention and Deletion',
        summary: [
            'We keep personal information only for as long as necessary for the purpose collected.',
            'Some information may be kept longer where required by law or legitimate business needs.',
            'When information is no longer needed, we may delete, anonymise, or securely archive it.',
        ],
        body: [
            'We keep personal information only for as long as necessary for the purpose for which it was collected, or as required by law.',
            'When information is no longer needed, we may delete it, anonymise it, or securely archive it where appropriate.',
        ],
    },
    {
        id: 'rights',
        title: 'Your Data Protection Rights',
        summary: [
            'Subject to applicable law, you may access, correct, delete, object to, or withdraw consent for certain processing.',
            'You may also make a complaint if you believe your information has been handled improperly.',
            'Send rights requests to privacy@shilingimoves.com.',
        ],
        body: [
            'Subject to applicable law, including the Kenya Data Protection Act, 2019, you may have rights over your personal information.',
        ],
        bullets: [
            'Ask for access to your personal information.',
            'Ask us to correct inaccurate or incomplete information.',
            'Ask us to delete information where appropriate.',
            'Object to certain uses of your information.',
            'Withdraw consent where processing is based on consent.',
            'Make a complaint if you believe your information has been handled improperly.',
        ],
    },
    {
        id: 'children',
        title: 'Children and Personal Data',
        summary: [
            'Our website is not intended to knowingly collect personal information from children without necessary consent or lawful basis.',
            'If you believe a child has provided personal information improperly, contact us.',
            'We will review the matter and take appropriate action.',
        ],
        body: [
            'If you believe that a child has provided personal information through our website improperly, please contact us and we will review the matter.',
        ],
    },
    {
        id: 'updates',
        title: 'Updates to This Page',
        summary: [
            'We may update this Data Protection page from time to time.',
            'Changes will be posted on this page with an updated effective date.',
            'We encourage you to review this page regularly.',
        ],
        body: [
            'We may update this page to reflect changes in our website, services, data practices, legal obligations, or user needs.',
        ],
    },
];

const SummaryPill = ({ text }) => (
    <div className="flex items-start gap-2 py-2">
        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary-600" />
        <span className="text-sm leading-snug text-gray-600">{text}</span>
    </div>
);

const ProtectionSection = ({ id, number, title, icon: Icon, summary, body, bullets }) => (
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
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-700">Protection Summary</p>
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

const DataProtectionPage = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const observerRef = useRef(null);

    useEffect(() => {
        document.title = 'Data Protection | Shilingi Moves';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Shilingi Moves Data Protection page explaining safeguards, personal data handling, retention, sharing, and user rights under Kenyan data protection principles.');
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
                            <Lock size={14} /> Data Protection
                        </p>
                        <h1 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">Data Protection</h1>
                        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-primary-100">
                            The safeguards, practices, and user rights behind how Shilingi Moves protects personal information.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                                <CheckCircle2 size={12} /> Effective: {effectiveDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                                <RefreshCw size={12} /> Last Updated: {effectiveDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                                <Shield size={12} /> Kenya Data Protection Act 2019
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-b border-gray-100 bg-white py-4">
                <div className="container-custom">
                    <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500 md:justify-start">
                        {[
                            { icon: Shield, text: 'Safeguards and access controls' },
                            { icon: Database, text: 'Purpose-limited collection' },
                            { icon: Lock, text: 'Reasonable security practices' },
                            { icon: UserCheck, text: 'Rights requests supported' },
                            { icon: Eye, text: 'No personal data selling' },
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
                                <Shield size={22} className="mx-auto mb-2 text-primary-600" />
                                <p className="mb-1 text-xs font-bold text-gray-800">Data Protection Questions?</p>
                                <p className="mb-3 text-xs text-gray-500">Contact our privacy team</p>
                                <a href={`mailto:${privacyEmail}`} className="text-xs font-semibold text-primary-600 hover:underline">{privacyEmail}</a>
                            </div>
                        </div>
                    </aside>

                    <main className="max-w-3xl">
                        {protectionContent.map((section, index) => {
                            const Icon = sections.find((item) => item.id === section.id)?.icon || Shield;
                            return (
                                <ProtectionSection
                                    key={section.id}
                                    number={index + 1}
                                    icon={Icon}
                                    {...section}
                                />
                            );
                        })}

                        <ProtectionSection
                            id="contact"
                            number={protectionContent.length + 1}
                            title="Contact Data Protection"
                            icon={Mail}
                            summary={[
                                'Use these details for data protection questions, rights requests, complaints, and privacy concerns.',
                                'We may need to verify your identity before acting on certain requests.',
                                'Shilingi Moves is a venture under Kaizen Publishers Limited.',
                            ]}
                            body={[
                                'If you have any questions, requests, or complaints about how your information is protected, please contact us using the details below.',
                            ]}
                        />

                        <div className="mb-16 grid gap-4 sm:grid-cols-2">
                            {[
                                { label: 'Privacy Email', value: privacyEmail, href: `mailto:${privacyEmail}`, icon: Mail },
                                { label: 'General Support', value: supportEmail, href: `mailto:${supportEmail}`, icon: Mail },
                                { label: 'Phone', value: phoneNumber, href: 'tel:+254700000000', icon: Phone },
                                { label: 'Legal Entity', value: 'Kaizen Publishers Limited', href: null, icon: Database },
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
                            <h3 className="mb-3 text-2xl font-bold">Want to exercise a data right?</h3>
                            <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-primary-100">
                                Ask us about access, correction, deletion, consent withdrawal, marketing preferences, or any data protection concern.
                            </p>
                            <a
                                href={`mailto:${privacyEmail}`}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-50"
                            >
                                Contact Privacy Team <ArrowRight size={16} />
                            </a>
                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DataProtectionPage;
