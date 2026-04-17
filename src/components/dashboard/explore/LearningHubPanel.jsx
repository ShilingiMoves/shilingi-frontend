import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Flame, GraduationCap, Play, Star } from 'lucide-react';

const tabs = ['Learning Paths', 'Expert Articles', 'Short Videos', 'Financial Games', 'Quizzes & Assessments'];

const pathCards = [
    { title: 'T-Bills & Treasury Bonds', description: 'How to invest in government securities in Kenya', level: 'Beginner', duration: '8 min', xp: '40 XP', accent: 'bg-[#eef9f3]' },
    { title: 'Building an Emergency Fund', description: 'Why you need 3-6 months of expenses saved', level: 'Intermediate', duration: '10 min', xp: '60 XP', accent: 'bg-[#eef8f5]' },
    { title: 'Saving for a Home in Kenya', description: 'Mortgages, REITs, and land buying guide', level: 'Intermediate', duration: '15 min', xp: '80 XP', accent: 'bg-[#edf4ff]' },
    { title: 'Understanding PAYE & KRA Taxes', description: 'File your returns and claim reliefs', level: 'Beginner', duration: '12 min', xp: '60 XP', accent: 'bg-[#fff6dd]' },
    { title: 'Planning for Retirement at 50', description: 'NSSF, pension, and FIRE strategies', level: 'Advanced', duration: '20 min', xp: '100 XP', accent: 'bg-[#fff0f0]' },
    { title: 'Financial Trivia Game', description: 'Test your financial knowledge and earn XP badges', level: 'Game', duration: '5-15 min', xp: '50 XP', accent: 'bg-[#f3ecff]' },
];

const expertArticles = [
    { title: 'Why Most Kenyans Fail to Save', meta: 'By Shilingi Financial Coach - 5 min read', tag: 'Featured', tagClass: 'bg-emerald-50 text-emerald-700' },
    { title: 'NSE 2026: Where to Invest Now', meta: 'By Market Expert - 8 min read', tag: 'Trending', tagClass: 'bg-amber-50 text-amber-700' },
];

const assessments = [
    { title: 'Financial IQ Test', meta: '20 questions - 10 mins' },
    { title: 'Risk Appetite Assessment', meta: '15 questions - 7 mins' },
    { title: 'Retirement Readiness Check', meta: '10 questions - 5 mins' },
];

const levelStyles = {
    Beginner: 'bg-amber-50 text-amber-700',
    Intermediate: 'bg-violet-50 text-violet-700',
    Advanced: 'bg-rose-50 text-rose-700',
    Game: 'bg-blue-50 text-blue-700',
};

const visibleByTab = (tab) => {
    if (tab === 'Expert Articles') return pathCards.slice(0, 2);
    if (tab === 'Short Videos') return pathCards.slice(1, 4);
    if (tab === 'Financial Games') return [pathCards[5]];
    if (tab === 'Quizzes & Assessments') return pathCards.slice(3, 6);
    return pathCards;
};

const LearningHubPanel = () => {
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const visibleCards = useMemo(() => visibleByTab(activeTab), [activeTab]);

    return (
        <div className="space-y-4 pb-20">
            <section className="rounded-[1rem] bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-5 py-4 text-white shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[0.85rem] bg-white/12 text-white">
                                <GraduationCap size={18} />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold">Learning Hub</h2>
                                <p className="text-sm text-white/70">Shilingi Moves</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/85">Financial education built for Kenyans. Learn, earn XP, and level up.</p>
                    </div>

                    <div className="flex gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-white/15 px-3 py-2 text-xs font-semibold">
                            <Flame size={14} className="text-amber-300" />
                            14-Day Streak
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#b88f22]/40 px-3 py-2 text-xs font-semibold">
                            <Star size={13} className="fill-amber-300 text-amber-300" />
                            240 XP
                        </span>
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap gap-2 rounded-[1rem] border border-[#d0ddd9] bg-white p-2 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={
                            activeTab === tab
                                ? 'rounded-[0.8rem] bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700'
                                : 'rounded-[0.8rem] px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-[#f6fbf8] hover:text-primary-700'
                        }
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <section className="rounded-[1rem] border border-[#d0ddd9] bg-[#f4fbf8] p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">Continue where you left off</p>
                        <h3 className="mt-2 text-[1.15rem] font-bold text-slate-950">Unit 3: Investing In the NSE</h3>
                        <div className="mt-3 h-2.5 max-w-md rounded-full bg-[#dcece6]">
                            <div className="h-2.5 w-[68%] rounded-full bg-primary-500" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">68% - 12 mins left</p>
                    </div>
                    <button type="button" className="inline-flex items-center gap-2 rounded-[0.8rem] bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                        <Play size={15} className="fill-white" />
                        Continue Lesson
                    </button>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="text-[1.15rem] font-bold text-slate-950">Learning Paths</h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {visibleCards.map((course) => (
                        <article key={course.title} className="rounded-[1rem] border border-[#d0ddd9] bg-white p-4 shadow-sm">
                            <div className="pl-2 sm:pl-3">
                                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-[0.85rem] ${course.accent}`}>
                                    <BookOpen size={20} className="text-primary-700" />
                                </div>
                                <h4 className="max-w-[16rem] text-base font-bold leading-6 text-slate-900">{course.title}</h4>
                                <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-600">{course.description}</p>
                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${levelStyles[course.level] || 'bg-slate-100 text-slate-700'}`}>
                                        {course.level}
                                    </span>
                                    <p className="text-xs text-slate-400">{course.duration} - {course.xp}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[1.15rem] font-bold text-slate-950">Expert Articles</h3>
                    <button type="button" className="text-sm font-semibold text-primary-700">All Articles -&gt;</button>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                    {expertArticles.map((article) => (
                        <article key={article.title} className="rounded-[1rem] border border-[#d0ddd9] bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.85rem] bg-[#eef8f5] text-primary-700">
                                    <BookOpen size={18} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="max-w-[20rem] text-base font-bold leading-6 text-slate-900">{article.title}</h4>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">{article.meta}</p>
                                    <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${article.tagClass}`}>{article.tag}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[1.15rem] font-bold text-slate-950">Quizzes & Assessments</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {assessments.map((item) => (
                        <article key={item.title} className="rounded-[1rem] border border-[#d0ddd9] bg-white p-4 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f5] text-primary-700">
                                <GraduationCap size={18} />
                            </div>
                            <h4 className="mt-4 text-base font-bold leading-6 text-slate-900">{item.title}</h4>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{item.meta}</p>
                            <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-[0.8rem] bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white">
                                Start Quiz
                                <ArrowRight size={14} />
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LearningHubPanel;
