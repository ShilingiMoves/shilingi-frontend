import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, ThumbsUp, X } from 'lucide-react';
import { getStoredUserProfile } from '../../../services/authApi';

const COMMUNITY_POSTS_KEY = 'shilingi_dashboard_community_posts';

const seedPosts = [
    { id: 'seed-1', initials: 'JM', name: 'James Mwangi', time: '2h', text: 'Just hit KES 100,000 in savings for the first time. Emergency fund goal and auto-save reminders helped a lot.', reactions: 24, replies: 8, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'seed-2', initials: 'SW', name: 'Stella Wanjiru', time: '4h', text: 'Quick question: for a 1-year savings goal of KES 50,000, SACCO or Money Market Fund?', reactions: 11, replies: 23, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: 'seed-3', initials: 'BO', name: 'Brian Ochieng', time: '6h', text: 'T-Bills are now at 16.2%. Just rolled over KES 200K for the 4th consecutive quarter.', reactions: 47, replies: 15, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
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

const getRelativeTime = (value) => {
    if (!value) return 'Now';
    const diffMs = Date.now() - new Date(value).getTime();
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 1) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
};

const getUserIdentity = (user) => {
    const firstName = user?.first_name || 'Shilingi';
    const lastName = user?.last_name || 'Member';
    const name = `${firstName} ${lastName}`.trim();
    return {
        name,
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
    };
};

const CommunityHubPanel = () => {
    const [posts, setPosts] = useState(seedPosts);
    const [composerOpen, setComposerOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const user = useMemo(() => getStoredUserProfile(), []);
    const identity = useMemo(() => getUserIdentity(user), [user]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
            if (!raw) {
                setPosts(seedPosts);
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setPosts(parsed);
            }
        } catch {
            setPosts(seedPosts);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
        } catch {
            // ignore storage errors
        }
    }, [posts]);

    const handleSubmitPost = () => {
        const message = draft.trim();
        if (!message) return;
        const post = {
            id: `post-${Date.now()}`,
            initials: identity.initials,
            name: identity.name,
            time: 'Now',
            text: message,
            reactions: 0,
            replies: 0,
            createdAt: new Date().toISOString(),
        };
        setPosts((current) => [post, ...current]);
        setDraft('');
        setComposerOpen(false);
    };

    return (
        <div className="space-y-4">
            <section className="rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Community</h2>
                        <p className="mt-1 text-sm text-white/85">Learn from fellow Kenyans on their financial journey.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setComposerOpen(true)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700"
                    >
                        Post
                    </button>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
                <article className="rounded-[1rem] border border-emerald-100 bg-white p-4 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setComposerOpen(true)}
                        className="mb-3 flex w-full items-center gap-3 rounded-full border border-slate-200 px-3 py-2 text-left transition-colors hover:border-primary-200 hover:bg-[#f9fcfb]"
                    >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                            {identity.initials}
                        </span>
                        <p className="text-sm text-slate-500">Share a win, ask a question, or start a discussion...</p>
                    </button>
                    <div className="space-y-3">
                        {posts.map((post) => (
                            <div key={post.id} className="rounded-xl border border-slate-200 bg-[#f9fcfb] px-3 py-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                                        {post.initials}
                                    </span>
                                    <p className="font-semibold text-slate-900">{post.name}</p>
                                    <p className="text-slate-500">{post.time === 'Now' ? getRelativeTime(post.createdAt) : post.time}</p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-700">{post.text}</p>
                                <div className="mt-3 flex gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                                        <ThumbsUp size={12} />
                                        {post.reactions}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                                        <MessageCircle size={12} />
                                        {post.replies} replies
                                    </span>
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

            {composerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
                    <div className="w-full max-w-2xl rounded-[1.4rem] border border-emerald-100 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Create post</h3>
                                <p className="text-sm text-slate-500">Post as {identity.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setComposerOpen(false)}
                                className="rounded-lg border border-emerald-100 bg-white p-2 text-slate-600"
                                aria-label="Close post composer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-4 px-5 py-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                                    {identity.initials}
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-900">{identity.name}</p>
                                    <p className="text-xs text-slate-500">{user?.email || 'Community member'}</p>
                                </div>
                            </div>

                            <textarea
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                placeholder="Share a win, ask a question, or start a discussion..."
                                rows={6}
                                className="w-full rounded-[1rem] border border-emerald-100 bg-[#f9fcfb] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                            />

                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-slate-500">Posts are stored locally for now until the community backend is connected.</p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setComposerOpen(false)}
                                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmitPost}
                                        disabled={!draft.trim()}
                                        className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Send size={14} />
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityHubPanel;
