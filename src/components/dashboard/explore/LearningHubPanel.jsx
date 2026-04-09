import React, { useState } from 'react';

const tabs = ['All Courses', 'In Progress', 'Completed', 'Certificates'];

const courses = [
    { title: 'T-Bills & Treasury Bonds', description: 'How to invest in government securities in Kenya', level: 'Beginner', duration: '8 min', xp: '40 XP' },
    { title: 'Building an Emergency Fund', description: 'Why you need 3-6 months of expenses saved', level: 'Intermediate', duration: '10 min', xp: '60 XP' },
    { title: 'Saving for a Home in Kenya', description: 'Mortgages, REITs, and land buying guide', level: 'Intermediate', duration: '15 min', xp: '80 XP' },
    { title: 'Understanding PAYE & KRA Taxes', description: 'File your tax returns and claim reliefs', level: 'Beginner', duration: '12 min', xp: '60 XP' },
    { title: 'Planning for Retirement at 50', description: 'NSSF, pension, and FIRE strategies', level: 'Advanced', duration: '20 min', xp: '100 XP' },
];

const LearningHubPanel = () => {
    const [activeTab, setActiveTab] = useState(tabs[0]);

    return (
        <div className="space-y-4">
            <section className="rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Learning Hub</h2>
                        <p className="mt-1 text-sm text-white/85">Financial education built for Kenyans. Learn and level up.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold">14-Day Streak</span>
                        <span className="rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold">240 XP</span>
                    </div>
                </div>
            </section>

            <div className="inline-flex flex-wrap rounded-xl border border-emerald-100 bg-white p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-[1rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Continue where you left off</p>
                    <p className="mt-2 text-base font-bold text-slate-900">Unit 3: Investing in the NSE</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div className="h-2 w-[68%] rounded-full bg-primary-600" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">68% · 12 mins left</p>
                    <button type="button" className="mt-3 w-full rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white">Continue Lesson</button>
                </article>

                {courses.map((course) => (
                    <article key={course.title} className="rounded-[1rem] border border-emerald-100 bg-white p-4 shadow-sm">
                        <p className="text-base font-bold text-slate-900">{course.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{course.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">{course.level}</span>
                            <span className="text-xs text-slate-500">{course.duration} · {course.xp}</span>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
};

export default LearningHubPanel;
