import React from 'react';

const posts = [
    { initials: 'JM', name: 'James Mwangi', time: '2h', text: 'Just hit KES 100,000 in savings for the first time. Emergency fund goal and auto-save reminders helped a lot.', reactions: 24, replies: 8 },
    { initials: 'SW', name: 'Stella Wanjiru', time: '4h', text: 'Quick question: for a 1-year savings goal of KES 50,000, SACCO or Money Market Fund?', reactions: 11, replies: 23 },
    { initials: 'BO', name: 'Brian Ochieng', time: '6h', text: 'T-Bills are now at 16.2%. Just rolled over KES 200K for the 4th consecutive quarter.', reactions: 47, replies: 15 },
];

const trending = [
    { topic: '#emergencyfund', count: 142 },
    { topic: '#tbills2026', count: 98 },
    { topic: '#nseinvesting', count: 76 },
    { topic: '#savingsrate', count: 54 },
    { topic: '#debtfree', count: 41 },
];

const contributors = [
    { name: 'Brian Ochieng', rank: '1st' },
    { name: 'James Mwangi', rank: '2nd' },
    { name: 'Stella Wanjiru', rank: '3rd' },
];

const CommunityHubPanel = () => (
    <div className="space-y-4">
        <section className="rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Community</h2>
                    <p className="mt-1 text-sm text-white/85">Learn from fellow Kenyans on their financial journey.</p>
                </div>
                <button type="button" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700">Post</button>
            </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
            <article className="rounded-[1rem] border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3 rounded-full border border-slate-200 px-3 py-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">AK</span>
                    <p className="text-sm text-slate-500">Share a win, ask a question, or start a discussion...</p>
                </div>
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div key={`${post.name}-${post.time}`} className="rounded-xl border border-slate-200 bg-[#f9fcfb] px-3 py-3">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">{post.initials}</span>
                                <p className="font-semibold text-slate-900">{post.name}</p>
                                <p className="text-slate-500">{post.time}</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-700">{post.text}</p>
                            <div className="mt-2 flex gap-2 text-xs">
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">{post.reactions}</span>
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">{post.replies} replies</span>
                            </div>
                        </div>
                    ))}
                </div>
            </article>

            <div className="space-y-4">
                <article className="rounded-[1rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="text-base font-bold text-slate-950">Trending Topics</h3>
                    <div className="mt-3 space-y-2">
                        {trending.map((item) => (
                            <div key={item.topic} className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#f9fcfb] px-3 py-2 text-sm">
                                <span className="font-medium text-primary-700">{item.topic}</span>
                                <span className="text-xs text-slate-500">{item.count} posts</span>
                            </div>
                        ))}
                    </div>
                </article>
                <article className="rounded-[1rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <h3 className="text-base font-bold text-slate-950">Top Contributors</h3>
                    <div className="mt-3 space-y-2">
                        {contributors.map((item) => (
                            <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-[#f9fcfb] px-3 py-2 text-sm">
                                <span className="font-medium text-slate-800">{item.name}</span>
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{item.rank}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </div>
        </section>
    </div>
);

export default CommunityHubPanel;
