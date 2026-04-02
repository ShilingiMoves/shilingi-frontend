import React from 'react';
import { ArrowRight } from 'lucide-react';
import { dashboardNavSections } from './dashboardSections';

const DashboardOverview = ({ user, onSelectSection }) => {
    const firstName = user?.first_name || 'there';
    const toolSections = dashboardNavSections.filter((section) => section.id !== 'overview');

    return (
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
                <section className="rounded-[1.6rem] bg-[linear-gradient(135deg,_#18334a_0%,_#102536_100%)] px-6 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Welcome back, {firstName}!
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
                        Your personal finance dashboard. Use these tools to take control of your financial future.
                    </p>
                </section>

                <section className="mt-8">
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">Your Financial Tools</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {toolSections.map((section) => {
                            const Icon = section.icon;

                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => onSelectSection(section.id)}
                                    className="group rounded-[1.1rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${section.iconBg}`}>
                                            <Icon size={22} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-lg font-bold text-slate-950">{section.label}</h3>
                                                <ArrowRight size={16} className="shrink-0 text-slate-400 transition-colors group-hover:text-primary-600" />
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardOverview;
