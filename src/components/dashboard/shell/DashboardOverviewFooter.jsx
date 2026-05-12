import React from 'react';
import { Linkedin, MessageCircle, Youtube } from 'lucide-react';
import animatedLogo from '../../../assets/shilingi-logo-animated.gif';

const dashboardFooterColumns = [
    {
        title: 'Platform',
        items: [
            { label: 'Dashboard', target: 'overview', type: 'section' },
            { label: 'Learning Hub', target: 'learninghub', type: 'section' },
            { label: 'Compare Portal', target: 'comparehub', type: 'section' },
            { label: 'Resources', target: 'resourceshub', type: 'section' },
            { label: 'Community', target: 'communityhub', type: 'section' },
        ],
    },
    {
        title: 'Planning Tools',
        items: [
            { label: 'Budget Planner', target: 'budget', type: 'section' },
            { label: 'Debt Center', target: 'debt', type: 'section' },
            { label: 'Investment Planner', target: 'investments', type: 'section' },
            { label: 'Protection Planner', target: 'protection', type: 'section' },
            { label: 'Retirement Planner', target: 'retirement', type: 'section' },
            { label: 'Net Worth Tracker', target: 'networth', type: 'section' },
        ],
    },
    {
        title: 'Company',
        items: [
            { label: 'About Us', target: '/about', type: 'href' },
            { label: 'Careers', target: '/about', type: 'href' },
            { label: 'Contact Us', target: '/#site-footer', type: 'href' },
            { label: 'Partner With Us', target: '/partnerships', type: 'href' },
        ],
    },
    {
        title: 'Support',
        items: [
            { label: 'Help Centre', target: '/faqs', type: 'href' },
            { label: 'FAQs', target: '/faqs', type: 'href' },
            { label: 'Privacy Policy', target: '/privacy', type: 'href' },
            { label: 'Terms of Use', target: '/terms', type: 'href' },
            { label: 'Cookie Policy', target: '/privacy', type: 'href' },
            { label: 'Data Protection', target: '/privacy', type: 'href' },
        ],
    },
];

const DashboardOverviewFooter = ({ onSelectSection }) => {
    const handleFooterItemClick = (item) => {
        if (item.type === 'section') {
            onSelectSection?.(item.target);
            return;
        }

        window.location.assign(item.target);
    };

    return (
        <footer className="overflow-hidden rounded-[1.5rem] bg-[#050807] text-white shadow-[0_22px_48px_rgba(5,8,7,0.36)]">
            <div className="border-b border-white/8 px-5 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 xl:grid-cols-[minmax(220px,1.1fr)_repeat(4,minmax(120px,1fr))]">
                    <div className="max-w-sm">
                        <img src={animatedLogo} alt="Shilingi Moves" className="h-14 w-auto object-contain" />
                        <p className="mt-4 text-base leading-7 text-white/72">
                            Powering every step of your financial journey.
                            <br />
                            One shillingi at a time.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            {[
                                { label: 'X', content: <span className="text-sm font-bold">X</span> },
                                { label: 'LinkedIn', content: <Linkedin size={16} /> },
                                { label: 'YouTube', content: <Youtube size={16} /> },
                                { label: 'Community', content: <MessageCircle size={16} /> },
                            ].map((item) => (
                                <a key={item.label} href="#" aria-label={item.label} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white">
                                    {item.content}
                                </a>
                            ))}
                        </div>
                    </div>

                    {dashboardFooterColumns.map((column) => (
                        <div key={column.title}>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">{column.title}</p>
                            <div className="mt-4 space-y-2.5">
                                {column.items.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => handleFooterItemClick(item)}
                                        className="block text-left text-sm text-white/78 transition-colors hover:text-white"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-5 py-5 sm:px-6 lg:px-8">
                <p className="text-sm text-white/65">&copy;Kaizen Publishers Limited All rights reserved.</p>
                <p className="mt-4 max-w-4xl text-sm leading-6 text-white/50">
                    Shilingi Moves is a financial wellness platform and does not provide regulated financial advice. All content is for educational and informational purposes only. Consult a licensed financial advisor before making investment decisions.
                </p>
            </div>
        </footer>
    );
};

export default DashboardOverviewFooter;
