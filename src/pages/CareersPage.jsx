import React, { useMemo, useState } from 'react';
import { Briefcase, MapPin, Search, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';

const openRoles = [];

const CareersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoles = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return openRoles;

        return openRoles.filter((role) =>
            [role.title, role.department, role.location, role.type]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [searchTerm]);

    const hasSearch = searchTerm.trim().length > 0;

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <section className="bg-[#f6fbf8]">
                <div className="container-custom py-10 text-center sm:py-12 md:py-14">
                    <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-semibold text-primary-700">
                        <Sparkles size={16} />
                        Careers at Shilingi Moves
                    </p>
                    <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-normal leading-[1.08] tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-7xl">
                        Help build practical money tools
                        <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-green-500"> for Kenyan realities.</span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                        When roles open, you will find them here with clear teams, locations, and application details.
                    </p>
                    <a
                        href="#open-roles"
                        className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-full bg-primary-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/15 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                    >
                        View Open Roles
                    </a>
                </div>
            </section>

            <section id="open-roles" className="container-custom scroll-mt-24 py-10 md:py-12">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                        <label htmlFor="career-search" className="mb-2 block text-sm font-semibold text-slate-700">
                            Search open roles
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                id="career-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by role, team, location, or type"
                                className="min-h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        {filteredRoles.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredRoles.map((role) => (
                                    <article key={role.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-950">{role.title}</h2>
                                                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Briefcase size={15} />
                                                        {role.department}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin size={15} />
                                                        {role.location}
                                                    </span>
                                                    <span>{role.type}</span>
                                                </div>
                                            </div>
                                            <a
                                                href={`mailto:careers@shilingimoves.com?subject=Application: ${encodeURIComponent(role.title)}`}
                                                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                                            >
                                                Apply
                                            </a>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-emerald-200 bg-[#f8fcfa] px-6 py-12 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
                                    <Briefcase size={28} />
                                </div>
                                <h2 className="mt-6 text-2xl font-extrabold text-slate-950">
                                    {hasSearch ? 'No available jobs for now' : 'No open roles right now'}
                                </h2>
                                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                                    {hasSearch
                                        ? 'We could not find a matching role. Please check back later as new opportunities open.'
                                        : 'We are not hiring for any roles at the moment. When opportunities open, they will appear on this page.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CareersPage;
