import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    Flame,
    MessageCircle,
    Mic,
    PenLine,
    Send,
    Sparkles,
    Star,
    ThumbsUp,
    X,
} from 'lucide-react';
import { getStoredUserProfile } from '../../../services/authApi';
import { filterItemsForTier } from '../../../utils/tierAccess';

export const COMMUNITY_POSTS_KEY = 'shilingi_dashboard_community_posts_v3';
const COMMUNITY_ACTIONS_KEY = 'shilingi_dashboard_community_actions_v1';

const defaultCommunityState = {
    joinedChallenges: [],
    challengeProgress: {},
    challengeReminders: [],
    savedEpisodes: [],
    playedEpisodes: [],
    readingList: [],
    discussionEntries: [],
    guestApplications: [],
    kidsActions: {},
    familyRegistrations: [],
    juniorGoals: [],
    schoolPartners: [],
    expertQuestions: [],
    viewedBadges: [],
    createdChallenges: [],
};

export const seedPosts = [
    {
        id: 'seed-1',
        minimumTier: 'BASIC',
        initials: 'JM',
        name: 'James Mwangi',
        location: 'Nairobi',
        memberTier: 'Gold Member',
        time: '2 hours ago',
        type: 'Win',
        typeAccent: 'bg-amber-50 text-amber-700 border-amber-100',
        borderAccent: 'border-l-4 border-l-amber-400',
        text: 'Just hit KES 100,000 in savings for the very first time! The emergency fund goal tracker and auto-save reminders on Shilingi Moves kept me accountable every single week. If you are just starting, just start and let the platform do the nudging.',
        tags: ['#savings-win', '#emergencyfund', '#milestone'],
        reactions: 24,
        replies: 8,
        highlight: 'Win',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        avatarTone: 'from-[#2b7f67] to-[#d6a828]',
    },
    {
        id: 'seed-2',
        minimumTier: 'BASIC',
        initials: 'SW',
        name: 'Stella Wanjiru',
        location: 'Nakuru',
        memberTier: 'Plus Member',
        time: '4 hours ago',
        type: 'Question',
        typeAccent: 'bg-blue-50 text-blue-700 border-blue-100',
        borderAccent: 'border-l-4 border-l-blue-400',
        text: 'Quick question, for a 1-year savings goal of KES 50,000, is a SACCO (12.5% p.a.) or a Money Market Fund (14.8% p.a.) the better option? I want flexibility to withdraw if needed. The comparison hub shows the MMF wins on rate, but the SACCO feels safer to me. What do you all think?',
        tags: ['#investing-101', '#MMF', '#sacco'],
        reactions: 11,
        replies: 23,
        highlight: 'Ask Expert',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        avatarTone: 'from-[#f0a92d] to-[#efc468]',
    },
    {
        id: 'seed-3',
        minimumTier: 'PRO',
        initials: 'BO',
        name: 'Brian Ochieng',
        location: 'Mombasa',
        memberTier: 'Pro Member',
        time: '6 hours ago',
        type: 'Tip',
        typeAccent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        borderAccent: 'border-l-4 border-l-emerald-400',
        text: 'T-Bills are at 16.2% p.a. right now. I have rolled over my KES 200,000 for the 4th consecutive quarter. Here is my step-by-step: 1) Log into CBK DhowCSD portal 2) Apply for 91-day bill 3) Rollover on maturity. If you are keeping money in a savings account at 5%, you are literally giving away KES 22,400/year on KES 200K. Do not leave money on the table!',
        tags: ['#tbills2026', '#passiveincome', '#investing'],
        reactions: 47,
        replies: 15,
        highlight: 'Top Contributor',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        avatarTone: 'from-[#4f97e8] to-[#7bb3f3]',
    },
    {
        id: 'seed-4',
        minimumTier: 'PLUS',
        initials: 'AN',
        name: 'Amina Njeri',
        location: 'Kisumu',
        memberTier: 'Pro Member',
        time: '1 day ago',
        type: 'Milestone',
        typeAccent: 'bg-violet-50 text-violet-700 border-violet-100',
        borderAccent: 'border-l-4 border-l-violet-400',
        text: 'DEBT-FREE at 34! It took 3 years of discipline. I used the Avalanche method from the Shilingi Moves Debt Manager and attacked my highest-interest loan first. Monthly savings freed up: KES 18,000. My net worth went from KES 240,000 to KES 850,000 in 36 months. It is possible, especially for us women with wealth goals.',
        tags: ['#debtfree', '#womenwithwealth', '#financialfreedom'],
        reactions: 134,
        replies: 42,
        highlight: 'Milestone',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        avatarTone: 'from-[#7c63ea] to-[#a98ef9]',
    },
];

const trendingTopics = [
    { topic: '#emergencyfund', count: 142 },
    { topic: '#tbills2026', count: 98 },
    { topic: '#nseinvesting', count: 76 },
    { topic: '#savingsrate', count: 54 },
    { topic: '#debtfree', count: 41 },
    { topic: '#womenwithwealth', count: 38 },
];

const contributors = [
    { initials: 'BO', name: 'Brian Ochieng', role: 'T-Bills Expert', posts: 234, rank: '1st', tone: 'from-[#4f97e8] to-[#7bb3f3]' },
    { initials: 'AN', name: 'Amina Njeri', role: 'Debt-Free Journey', posts: 198, rank: '2nd', tone: 'from-[#2f9a73] to-[#57c194]' },
    { initials: 'JM', name: 'James Mwangi', role: 'Savings Champion', posts: 167, rank: '3rd', tone: 'from-[#f0a92d] to-[#f1cf7b]' },
];

const mainTabs = [
    { id: 'feed', label: 'Community Feed', badge: null, minimumTier: 'BASIC' },
    { id: 'challenges', label: 'Challenges', badge: '3 Active', minimumTier: 'BASIC' },
    { id: 'podcast', label: 'Podcast', badge: null, minimumTier: 'PLUS' },
    { id: 'bookclub', label: 'Book Club', badge: null, minimumTier: 'BASIC' },
    { id: 'kids', label: 'Shilingi Kids', badge: null, minimumTier: 'BASIC' },
    { id: 'expert', label: 'Expert Q&A', badge: null, minimumTier: 'PRO' },
    { id: 'leaderboard', label: 'Leaderboard', badge: null, minimumTier: 'BASIC' },
];

const filterTabs = ['All Posts', 'Wins', 'Questions', 'Tips', 'Milestones'];
const composerTypes = ['Win', 'Question', 'Tip', 'Milestone'];

const challengeCards = [
    { title: '30-Day Savings Sprint', description: 'Save KES 500 every day for 30 days. Build the daily savings habit that lasts a lifetime.', icon: '🌱', joined: '2,341', statTwo: 'Day 14', statThree: 'KES 15K', footer: 'Your progress: KES 7,000 saved', progress: 47, status: 'YOU\'RE IN', statusTone: 'bg-amber-400 text-white', action: 'Joined - Track Progress', actionTone: 'border border-[#9ed7c1] bg-[#f8fcfa] text-[#145944]' },
    { title: 'No-Impulse March', description: 'No unplanned purchases for 14 days. Every impulse buy you skip, transfer that amount to savings.', icon: '📱', joined: '1,892', statTwo: '9 days', statThree: 'Any Amount', footer: 'Community total saved', progress: 66, status: 'HOT', statusTone: 'bg-rose-500 text-white', action: 'Join Challenge', actionTone: 'bg-[#1c6c5d] text-white' },
    { title: 'Budget Like a Boss', description: 'Track every shilling for 21 days using the budget planner. Share your weekly report with the community.', icon: '📊', joined: '847', statTwo: '21 days', statThree: 'Free', footer: 'Challenge fills fast', progress: 48, status: 'NEW', statusTone: 'bg-[#145944] text-white', action: 'Join Challenge', actionTone: 'bg-[#1c6c5d] text-white' },
];

const upcomingChallenges = [
    { title: 'Home Deposit Race', description: 'Save 10% more toward your home deposit goal this month. Top 10 savers win a free financial coaching session.', icon: '🏠', starts: 'Apr 1st', duration: '30 days', reward: 'Prize', minimumTier: 'BASIC' },
    { title: 'Debt Demolition April', description: 'Pay KES 5,000 extra on any debt this April. Track your progress and inspire others to do the same.', icon: '🧩', starts: 'Apr 1st', duration: '30 days', reward: 'Free Entry', minimumTier: 'PLUS' },
    { title: 'NSE Investor Challenge', description: 'Buy your first NSE stock worth at least KES 5,000 this quarter. Share your experience and portfolio.', icon: '🌍', starts: 'Apr 15th', duration: '90 days', reward: 'Badge', minimumTier: 'PRO' },
];

const podcastEpisodes = [
    { title: 'Ep. 42: How to Build KES 1M by 35', host: 'Grace Nyambu, CFP', date: '8 Mar 2026', duration: '38 min', tag: 'Investing', icon: '💰', accent: 'bg-emerald-50 text-emerald-700', minimumTier: 'PRO' },
    { title: 'Ep. 41: Getting Out of Debt - Real Stories', host: 'Amina Njeri & Brian Ochieng', date: '1 Mar 2026', duration: '52 min', tag: 'Debt', icon: '💳', accent: 'bg-rose-50 text-rose-700', minimumTier: 'PLUS' },
    { title: 'Ep. 40: T-Bills, Bonds & Fixed Income Explained', host: 'David Kamau, CFA', date: '22 Feb 2026', duration: '44 min', tag: 'Fixed Income', icon: '🏛️', accent: 'bg-amber-50 text-amber-700', minimumTier: 'PRO' },
    { title: 'Ep. 39: FIRE at 45 - Is It Realistic in Kenya?', host: 'Moses Gitau, Retirement Coach', date: '15 Feb 2026', duration: '61 min', tag: 'Retirement', icon: '👵', accent: 'bg-violet-50 text-violet-700', minimumTier: 'PRO' },
    { title: 'Ep. 38: Buying Land in Kenya - What They Don\'t Tell You', host: 'Ruth Kamau, Property Attorney', date: '8 Feb 2026', duration: '48 min', tag: 'Property', icon: '🏡', accent: 'bg-blue-50 text-blue-700', minimumTier: 'PLUS' },
    { title: 'Ep. 37: Women & Wealth - Closing the Financial Gap', host: 'Shilingi Moves Team', date: '1 Feb 2026', duration: '55 min', tag: 'Women & Finance', icon: '👩', accent: 'bg-cyan-50 text-cyan-700', minimumTier: 'PRO' },
];

const readingSchedule = [
    { title: 'Week 1 (Mar 1-7) - Done', subtitle: 'Chapters 1-5: No One\'s Crazy', tone: 'border-[#9ed7c1] bg-[#eef8f3]' },
    { title: 'Week 2 (Mar 8-14) - NOW', subtitle: 'Chapters 6-10: Getting Wealthy vs Staying Wealthy', tone: 'border-amber-200 bg-amber-50' },
    { title: 'Week 3 (Mar 15-21)', subtitle: 'Chapters 11-15: Tails, You Win', tone: 'border-[#dbeee5] bg-[#f8fcfa]' },
    { title: 'Week 4 (Mar 22-31) - Final Discussion', subtitle: 'Chapters 16-20: Confessions + Live Session', tone: 'border-[#dbeee5] bg-[#f8fcfa]' },
];

const discussions = [
    { author: 'Mercy Oduya', text: '"Getting wealthy requires taking risk. Staying wealthy requires humility and caution." Applied this by keeping 20% in liquid MMF even when I want to invest everything.' },
    { author: 'Peter Ndung\'u', text: 'The idea that "enough" is more important than "more" hit different. I stopped comparing my salary to my colleagues and started comparing to my goals.' },
];

const upcomingReads = [
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', month: 'April 2026', color: 'from-[#ffb429] to-[#ffd576]' },
    { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', month: 'May 2026', color: 'from-[#4f97e8] to-[#79b6ff]' },
    { title: 'The Millionaire Next Door', author: 'Thomas J. Stanley', month: 'June 2026', color: 'from-[#8e68d6] to-[#ad8df5]' },
    { title: 'Think & Grow Rich', author: 'Napoleon Hill', month: 'July 2026', color: 'from-[#2f8f73] to-[#59c6a4]' },
];

const kidsCards = [
    { title: 'Money Games & Quizzes', description: 'Interactive games teaching savings, budgeting, and basic investing concepts through play. Aligned to the Kenyan primary curriculum.', age: 'Ages 6-12', cta: 'Play Now', color: 'from-[#ffb429] to-[#ffd576]' },
    { title: 'Stories for Young Earners', description: 'Illustrated financial stories featuring Kenyan children learning about pocket money, saving for goals, and avoiding debt traps.', age: 'Ages 4-10', cta: 'Read Stories', color: 'from-[#eef8f3] to-[#dff5ee]' },
    { title: 'Teen Finance Academy', description: 'A structured 8-week course for teens covering budgeting, banking, M-Pesa safety, and first investments. Certificates awarded.', age: 'Ages 13-18', cta: 'Enroll Teen', color: 'from-[#f3ecff] to-[#e5dcff]' },
];

const experts = [
    { initials: 'GN', name: 'Grace Nyambu, CFP', role: 'Certified Financial Planner', focus: 'Savings · Investments · Retirement', session: 'Tuesday 7PM', answered: '234 questions answered', tone: 'from-[#2f9a73] to-[#57c194]' },
    { initials: 'DK', name: 'David Kamau, CFA', role: 'Chartered Financial Analyst · NSE Specialist', focus: 'Equities · T-Bills · Bonds', session: 'Thursday 6PM', answered: '189 questions answered', tone: 'from-[#4f97e8] to-[#7bb3f3]' },
    { initials: 'RW', name: 'Ruth Waweru, CPA', role: 'Certified Public Accountant · Tax Specialist', focus: 'Tax Planning · KRA Filing', session: 'Saturday 11AM', answered: '156 questions answered', tone: 'from-[#eb7a9b] to-[#f4a5bd]' },
];

const recentAnswers = [
    { asker: 'Mercy Oduya', question: '"Is now a good time to invest in NSE or wait for the market to stabilise?"', answerer: 'Grace Nyambu, CFP', answer: 'Time in the market beats timing the market. If you have a 5+ year horizon, start now with a diversified position. Consider a monthly standing order of KES 3,000-5,000 into a diversified index fund or quality NSE stocks like SCOM or KCB.', likes: 48, age: '2 days ago', tone: 'border-l-4 border-l-emerald-400' },
    { asker: 'James Mwangi', question: '"How do I avoid KRA penalties when self-employed and not sure how much to declare?"', answerer: 'Ruth Waweru, CPA', answer: 'Set aside 30% of every payment you receive for tax. Open a separate M-Pesa or bank account labelled "Tax" and do not touch it. File by June 30 each year on iTax. If uncertain, come to one of our monthly tax clinics and we will help you calculate accurately.', likes: 37, age: '5 days ago', tone: 'border-l-4 border-l-blue-400' },
];

const pointsRules = [
    { label: 'Share a post or win', points: '+10 pts', tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Post gets 10+ likes', points: '+25 pts', tone: 'bg-[#eef8f3] text-[#1c6c5d]' },
    { label: 'Complete a challenge', points: '+50 pts', tone: 'bg-amber-50 text-amber-700' },
    { label: 'Refer a new member', points: '+100 pts', tone: 'bg-orange-50 text-orange-700' },
    { label: 'Hit a financial milestone', points: '+200 pts', tone: 'bg-violet-50 text-violet-700' },
    { label: '7-day login streak', points: '+30 pts', tone: 'bg-blue-50 text-blue-700' },
];

const badges = [
    { title: 'Starter', icon: '🌱', tone: 'border-[#9ed7c1] bg-[#eef8f3]' },
    { title: '14-Day Streak', icon: '🔥', tone: 'border-amber-200 bg-amber-50' },
    { title: 'Emergency Fund', icon: '🛡️', tone: 'border-[#9ed7c1] bg-[#eef8f3]' },
    { title: 'First Million', icon: '🏆', tone: 'border-[#dbeee5] bg-[#f8fcfa] text-slate-400' },
];

const getRelativeTime = (value, fallback) => {
    if (fallback) return fallback;
    if (!value) return 'Now';
    const diffMs = Date.now() - new Date(value).getTime();
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 1) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
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

const getTypeConfig = (type) => {
    const normalized = String(type || '').toLowerCase();
    if (normalized === 'question') return { accent: 'bg-blue-50 text-blue-700 border-blue-100', border: 'border-l-4 border-l-blue-400', action: 'Ask Expert' };
    if (normalized === 'tip') return { accent: 'bg-emerald-50 text-emerald-700 border-emerald-100', border: 'border-l-4 border-l-emerald-400', action: 'Top Contributor' };
    if (normalized === 'milestone') return { accent: 'bg-violet-50 text-violet-700 border-violet-100', border: 'border-l-4 border-l-violet-400', action: 'Milestone' };
    return { accent: 'bg-amber-50 text-amber-700 border-amber-100', border: 'border-l-4 border-l-amber-400', action: 'Win' };
};

const CommunityHubPanel = ({ currentTier = 'PRO' }) => {
    const [posts, setPosts] = useState(seedPosts);
    const [communityState, setCommunityState] = useState(defaultCommunityState);
    const [composerOpen, setComposerOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [selectedType, setSelectedType] = useState('Win');
    const [activeFilter, setActiveFilter] = useState('All Posts');
    const [activeTab, setActiveTab] = useState('feed');
    const [actionModal, setActionModal] = useState(null);
    const [actionDraft, setActionDraft] = useState('');
    const [actionNotice, setActionNotice] = useState('');
    const user = useMemo(() => getStoredUserProfile(), []);
    const identity = useMemo(() => getUserIdentity(user), [user]);
    const availableTabs = useMemo(() => filterItemsForTier(mainTabs, currentTier), [currentTier]);

    useEffect(() => {
        if (!availableTabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(availableTabs[0]?.id || 'feed');
        }
    }, [activeTab, availableTabs]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
            if (!raw) {
                setPosts(seedPosts);
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) setPosts(parsed);
        } catch {
            setPosts(seedPosts);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
        } catch {
            // ignore storage issues
        }
    }, [posts]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(COMMUNITY_ACTIONS_KEY);
            if (!raw) {
                setCommunityState(defaultCommunityState);
                return;
            }
            const parsed = JSON.parse(raw);
            setCommunityState({
                ...defaultCommunityState,
                ...(parsed || {}),
                challengeProgress: {
                    ...defaultCommunityState.challengeProgress,
                    ...(parsed?.challengeProgress || {}),
                },
                kidsActions: {
                    ...defaultCommunityState.kidsActions,
                    ...(parsed?.kidsActions || {}),
                },
            });
        } catch {
            setCommunityState(defaultCommunityState);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(COMMUNITY_ACTIONS_KEY, JSON.stringify(communityState));
        } catch {
            // ignore storage issues
        }
    }, [communityState]);

    useEffect(() => {
        setActionDraft(actionModal?.defaultValue || '');
    }, [actionModal]);

    const filteredPosts = useMemo(() => {
        const tierPosts = filterItemsForTier(posts, currentTier);
        if (activeFilter === 'All Posts') return tierPosts;
        return tierPosts.filter((post) => post.type === activeFilter.slice(0, -1) || post.type === activeFilter.slice(0, -1).replace('ie', 'y'));
    }, [activeFilter, currentTier, posts]);

    const handleSubmitPost = () => {
        const message = draft.trim();
        if (!message) return;
        const config = getTypeConfig(selectedType);
        const post = {
            id: `post-${Date.now()}`,
            initials: identity.initials,
            name: identity.name,
            location: 'Community member',
            memberTier: 'Member',
            time: 'Now',
            type: selectedType,
            typeAccent: config.accent,
            borderAccent: config.border,
            text: message,
            tags: ['#community', '#shilingimoves'],
            reactions: 0,
            replies: 0,
            highlight: config.action,
            createdAt: new Date().toISOString(),
            avatarTone: 'from-[#2b7f67] to-[#d6a828]',
        };
        setPosts((current) => [post, ...current]);
        setDraft('');
        setSelectedType('Win');
        setComposerOpen(false);
        setActiveFilter('All Posts');
        setActiveTab('feed');
    };

    const openActionModal = (config) => {
        setActionNotice('');
        setActionModal(config);
    };

    const closeActionModal = () => {
        setActionModal(null);
        setActionDraft('');
    };

    const handleActionSubmit = () => {
        const text = actionDraft.trim();
        setCommunityState((current) => {
            const next = {
                ...current,
                challengeProgress: { ...current.challengeProgress },
                kidsActions: { ...current.kidsActions },
            };

            switch (actionModal?.kind) {
            case 'join-challenge':
                if (actionModal.itemId && !next.joinedChallenges.includes(actionModal.itemId)) {
                    next.joinedChallenges = [...next.joinedChallenges, actionModal.itemId];
                }
                break;
            case 'track-challenge':
                if (actionModal.itemId) {
                    next.challengeProgress[actionModal.itemId] = text || 'Progress updated';
                    if (!next.joinedChallenges.includes(actionModal.itemId)) {
                        next.joinedChallenges = [...next.joinedChallenges, actionModal.itemId];
                    }
                }
                break;
            case 'remind-challenge':
                if (actionModal.itemId && !next.challengeReminders.includes(actionModal.itemId)) {
                    next.challengeReminders = [...next.challengeReminders, actionModal.itemId];
                }
                break;
            case 'create-challenge':
                if (text) {
                    next.createdChallenges = [
                        { id: `challenge-${Date.now()}`, text, createdAt: new Date().toISOString() },
                        ...next.createdChallenges,
                    ];
                }
                break;
            case 'save-episode':
                if (actionModal.itemId && !next.savedEpisodes.includes(actionModal.itemId)) {
                    next.savedEpisodes = [...next.savedEpisodes, actionModal.itemId];
                }
                break;
            case 'play-episode':
                if (actionModal.itemId && !next.playedEpisodes.includes(actionModal.itemId)) {
                    next.playedEpisodes = [...next.playedEpisodes, actionModal.itemId];
                }
                break;
            case 'guest-apply':
                if (text) {
                    next.guestApplications = [
                        { id: `guest-${Date.now()}`, text, createdAt: new Date().toISOString() },
                        ...next.guestApplications,
                    ];
                }
                break;
            case 'join-discussion':
            case 'book-insight':
                if (text) {
                    next.discussionEntries = [
                        { id: `discussion-${Date.now()}`, author: identity.name, text, createdAt: new Date().toISOString() },
                        ...next.discussionEntries,
                    ];
                }
                break;
            case 'reading-list':
                if (actionModal.itemId && !next.readingList.includes(actionModal.itemId)) {
                    next.readingList = [...next.readingList, actionModal.itemId];
                }
                break;
            case 'kids-action':
                if (actionModal.itemId) {
                    next.kidsActions[actionModal.itemId] = true;
                }
                break;
            case 'register-family':
                if (text) {
                    next.familyRegistrations = [
                        { id: `family-${Date.now()}`, text, createdAt: new Date().toISOString() },
                        ...next.familyRegistrations,
                    ];
                }
                break;
            case 'junior-goal':
                if (text) {
                    next.juniorGoals = [
                        { id: `goal-${Date.now()}`, text, createdAt: new Date().toISOString() },
                        ...next.juniorGoals,
                    ];
                }
                break;
            case 'school-partner':
                if (text) {
                    next.schoolPartners = [
                        { id: `school-${Date.now()}`, text, createdAt: new Date().toISOString() },
                        ...next.schoolPartners,
                    ];
                }
                break;
            case 'expert-question':
                if (text) {
                    next.expertQuestions = [
                        {
                            id: `expert-${Date.now()}`,
                            expert: actionModal.expertName || 'Expert Panel',
                            text,
                            createdAt: new Date().toISOString(),
                        },
                        ...next.expertQuestions,
                    ];
                }
                break;
            case 'view-badge':
                if (actionModal.itemId && !next.viewedBadges.includes(actionModal.itemId)) {
                    next.viewedBadges = [...next.viewedBadges, actionModal.itemId];
                }
                break;
            default:
                break;
            }

            return next;
        });
        const successMessage = actionModal?.successMessage || `${actionModal?.primaryLabel || 'Action'} saved successfully.`;
        setActionNotice(successMessage);
        closeActionModal();
    };

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-[1rem] bg-gradient-to-r from-primary-900 via-primary-700 to-primary-600 px-5 py-4 text-white shadow-sm lg:px-6 lg:py-5">
                <div className="dashboard-toolbar-row flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[0.85rem] bg-white/12 text-xl">👥</div>
                            <h1 className="text-lg font-bold text-white">Shilingi Moves Community</h1>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Learn from fellow Kenyans on their financial journey. Share wins, ask questions, join challenges, and build wealth together.</p>
                        <div className="mt-4 flex flex-wrap gap-4 text-amber-300">
                            <HeroMetric value="12,847" label="Members" />
                            <HeroMetric value="3,241" label="Posts this week" />
                            <HeroMetric value="486" label="Active challenges" />
                            <HeroMetric value="14" label="Your streak" icon={<Flame size={18} className="text-amber-300" />} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        <HeroButton onClick={() => { setSelectedType('Win'); setComposerOpen(true); }}><PenLine size={15} />Share a Win</HeroButton>
                        <HeroButton solid onClick={() => setComposerOpen(true)}>+ New Post</HeroButton>
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap gap-3">
                {availableTabs.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? 'inline-flex items-center gap-2 rounded-[1rem] border border-[#0f5d4a] bg-[#0f4f3f] px-4 py-3 text-sm font-semibold text-white shadow-sm' : 'inline-flex items-center gap-2 rounded-[1rem] border border-[#dbeee5] bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#bfe3d3]'}>
                        {tab.label}
                        {tab.badge ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{tab.badge}</span> : null}
                    </button>
                ))}
            </div>

            {actionNotice ? (
                <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    {actionNotice}
                </div>
            ) : null}

            {activeTab === 'feed' ? <FeedView identity={identity} posts={filteredPosts} activeFilter={activeFilter} setActiveFilter={setActiveFilter} setComposerOpen={setComposerOpen} setSelectedType={setSelectedType} openActionModal={openActionModal} /> : null}
            {activeTab === 'challenges' ? <ChallengesView currentTier={currentTier} openActionModal={openActionModal} communityState={communityState} /> : null}
            {activeTab === 'podcast' ? <PodcastView currentTier={currentTier} openActionModal={openActionModal} communityState={communityState} /> : null}
            {activeTab === 'bookclub' ? <BookClubView openActionModal={openActionModal} communityState={communityState} identity={identity} /> : null}
            {activeTab === 'kids' ? <KidsView openActionModal={openActionModal} communityState={communityState} /> : null}
            {activeTab === 'expert' ? <ExpertView openActionModal={openActionModal} communityState={communityState} /> : null}
            {activeTab === 'leaderboard' ? <LeaderboardView identity={identity} openActionModal={openActionModal} communityState={communityState} /> : null}

            {composerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-2xl rounded-[1.6rem] border border-[#dbeee5] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#e7f2ec] px-5 py-4">
                            <div>
                                <h3 className="dashboard-display-title text-slate-900">Create Post</h3>
                                <p className="text-sm text-slate-500">Post as {identity.name}</p>
                            </div>
                            <button type="button" onClick={() => setComposerOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbeee5] bg-[#f8fcfa] text-slate-500" aria-label="Close community composer"><X size={16} /></button>
                        </div>
                        <div className="space-y-5 px-5 py-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#2b7f67] to-[#d6a828] text-sm font-bold text-white">{identity.initials}</span>
                                <div>
                                    <p className="font-semibold text-slate-900">{identity.name}</p>
                                    <p className="text-sm text-slate-500">Community member</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {composerTypes.map((type) => (
                                    <button key={type} type="button" onClick={() => setSelectedType(type)} className={selectedType === type ? 'rounded-full border border-[#0f5d4a] bg-[#0f5d4a] px-4 py-2 text-sm font-semibold text-white' : 'rounded-full border border-[#dbeee5] bg-white px-4 py-2 text-sm font-semibold text-slate-700'}>{type}</button>
                                ))}
                            </div>
                            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share a win, ask a question, or start a discussion..." rows={7} className="w-full rounded-[1.2rem] border border-[#dbeee5] bg-[#f8fcfa] px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-[#9ed7c1] focus:ring-2 focus:ring-[#e6f5ee]" />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-500">Community posts are stored locally for now while the live community backend is being connected.</p>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setComposerOpen(false)} className="rounded-[0.95rem] border border-[#dbeee5] bg-[#f8fcfa] px-5 py-3 text-sm font-semibold text-slate-700">Cancel</button>
                                    <button type="button" onClick={handleSubmitPost} disabled={!draft.trim()} className="inline-flex items-center gap-2 rounded-[0.95rem] bg-[#1c6c5d] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"><Send size={14} />Post to Community</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {actionModal && (
                <ActionModal
                    config={actionModal}
                    draft={actionDraft}
                    onChangeDraft={setActionDraft}
                    onClose={closeActionModal}
                    onSubmit={handleActionSubmit}
                />
            )}
        </div>
    );
};

const FeedView = ({ identity, posts, activeFilter, setActiveFilter, setComposerOpen, setSelectedType, openActionModal }) => (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.62fr]">
        <div className="space-y-4">
            <section className="rounded-[1rem] border border-[#dbeee5] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4">
                    <button type="button" onClick={() => setComposerOpen(true)} className="flex w-full items-center gap-4 rounded-[0.9rem] border border-[#cfe8dc] px-4 py-3 text-left transition-colors hover:bg-[#f8fcfa]">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-700 to-[#d6a828] text-sm font-bold text-white">{identity.initials}</span>
                        <p className="text-sm text-slate-400 sm:text-base">Share a win, ask a question, or start a discussion...</p>
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                        {composerTypes.map((type) => (
                            <button key={type} type="button" onClick={() => { setSelectedType(type); setComposerOpen(true); }} className="inline-flex items-center gap-2 rounded-full border border-[#dbeee5] bg-white px-4 py-2 text-sm font-semibold text-slate-700">{type === 'Win' ? '🏆' : type === 'Question' ? '❓' : type === 'Tip' ? '💡' : '🎯'}{type}</button>
                        ))}
                        <button type="button" onClick={() => setComposerOpen(true)} className="ml-auto inline-flex items-center gap-2 rounded-[0.8rem] bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white"><Send size={14} />Post</button>
                    </div>
                </div>
            </section>
            <div className="flex flex-wrap gap-3">
                {filterTabs.map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveFilter(tab)} className={activeFilter === tab ? 'rounded-full border border-[#0f5d4a] bg-[#0f5d4a] px-4 py-2 text-sm font-semibold text-white' : 'rounded-full border border-[#dbeee5] bg-white px-4 py-2 text-sm font-semibold text-slate-700'}>{tab}</button>
                ))}
            </div>
            <div className="space-y-4">
                {posts.map((post) => (
                    <article key={post.id} className={`rounded-[1rem] border border-[#dbeee5] bg-white p-4 shadow-sm ${post.borderAccent}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 gap-4">
                                <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${post.avatarTone} text-sm font-bold text-white`}>{post.initials}</span>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-lg font-semibold text-slate-900">{post.name}</p>
                                        <span className="rounded-full bg-[#eef8f3] px-2.5 py-1 text-[11px] font-semibold text-[#1b6f5b]">{post.memberTier}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{post.location} · {getRelativeTime(post.createdAt, post.time)}</p>
                                </div>
                            </div>
                            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${post.typeAccent}`}>{post.type}</span>
                        </div>
                        <p className="mt-5 text-[1.03rem] leading-8 text-slate-800">{post.text}</p>
                        <div className="mt-4 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="text-sm font-semibold text-[#176b58]">{tag}</span>)}</div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <ActionPill icon={<ThumbsUp size={14} />} label={String(post.reactions)} />
                            <ActionPill icon={<MessageCircle size={14} />} label={`${post.replies} replies`} />
                            <ActionPill icon={<PenLine size={14} />} label="Share" />
                            <ActionPill icon={<Sparkles size={14} />} label={post.highlight} />
                        </div>
                    </article>
                ))}
            </div>
        </div>
        <div className="space-y-4">
            <SidebarCard title="Trending Topics" icon="🔥"><div className="space-y-3">{trendingTopics.map((item) => <div key={item.topic} className="flex items-center justify-between border-b border-[#eef4f0] pb-3 last:border-b-0 last:pb-0"><span className="font-semibold text-[#176b58]">{item.topic}</span><span className="text-sm text-slate-400">{item.count} posts</span></div>)}</div></SidebarCard>
            <SidebarCard title="Active Challenge" icon="⚡" tone="warm"><div className="space-y-3"><p className="text-lg font-semibold text-slate-900">30-Day Savings Sprint</p><p className="text-sm leading-6 text-slate-600">Save KES 500 every day for 30 days = KES 15,000. 2,341 members are in.</p><div><div className="mb-2 flex items-center justify-between text-sm text-slate-500"><span>Day 14 of 30</span><span className="font-semibold text-primary-700">47%</span></div><div className="h-2.5 rounded-full bg-[#e8f3ed]"><div className="h-full w-[47%] rounded-full bg-gradient-to-r from-primary-400 to-primary-700" /></div></div><button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-[0.8rem] bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white">View All Challenges<ArrowRight size={14} /></button></div></SidebarCard>
            <SidebarCard title="Top Contributors" icon="👑"><div className="space-y-4">{contributors.map((item) => <div key={item.name} className="flex items-center gap-3"><span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.tone} text-sm font-bold text-white`}>{item.initials}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{item.name}</p><p className="text-sm text-slate-400">{item.role} · {item.posts} posts</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.rank}</span></div>)}<button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#bfe3d3] px-4 py-3 text-sm font-semibold text-[#1c6c5d]">View Full Leaderboard<ArrowRight size={14} /></button></div></SidebarCard>
            <SidebarCard title="Latest Episode" icon={<Mic size={16} />}><div className="rounded-[1rem] bg-primary-900 p-4 text-white"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">New Episode</p><p className="mt-3 text-base font-semibold">Ep. 42: How to Build KES 1M by 35</p><p className="mt-1 text-sm text-white/72">with Grace Nyambu · 38 min</p><button type="button" className="mt-4 inline-flex items-center gap-2 rounded-[0.8rem] bg-amber-400 px-4 py-2.5 text-sm font-semibold text-[#08372d]">Listen Now</button></div></SidebarCard>
        </div>
    </div>
);

const ChallengesView = ({ currentTier, openActionModal, communityState }) => (
    <div className="space-y-6">
        <SectionHeader title="Community Challenges" description="Join money challenges with fellow Kenyans. Track progress, earn badges, and build wealth together." actionLabel="+ Create Challenge" onAction={() => openActionModal({ kind: 'create-challenge', title: 'Create a Community Challenge', description: 'Sketch the challenge idea you want to bring to the community and we will save it for the next content pass.', primaryLabel: 'Save Challenge Idea', inputLabel: 'Challenge concept', placeholder: 'e.g. 21-day cash-only challenge for households trying to reduce impulse spend...', successMessage: 'Your challenge idea has been saved.' })} />
        <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Currently Active</p>
            <div className="grid gap-4 xl:grid-cols-3">
                {challengeCards.map((challenge) => (
                    <div key={challenge.title} className="rounded-[1.6rem] border border-[#cfe8dc] bg-white p-5 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                        {(() => {
                            const joined = communityState.joinedChallenges.includes(challenge.title);
                            const savedProgress = communityState.challengeProgress[challenge.title];
                            const actionLabel = joined ? 'Joined - Track Progress' : 'Join Challenge';
                            const actionTone = joined ? 'border border-[#9ed7c1] bg-[#f8fcfa] text-[#145944]' : 'bg-[#1c6c5d] text-white';
                            return (
                                <>
                        <div className="mb-4 flex items-start justify-between gap-3"><span className="text-3xl">{challenge.icon}</span><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${challenge.statusTone}`}>{challenge.status}</span></div>
                        <h3 className="text-[1.35rem] font-semibold text-slate-900">{challenge.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{challenge.description}</p>
                        <div className="mt-4 grid grid-cols-3 gap-3"><MiniStat label="Joined" value={challenge.joined} /><MiniStat label="Duration" value={challenge.statTwo} /><MiniStat label="Target" value={challenge.statThree} /></div>
                        <div className="mt-4"><p className="mb-2 text-sm text-slate-500">Challenge progress - Day 14 of 30</p><div className="h-2.5 rounded-full bg-[#e8f3ed]"><div className="h-full rounded-full bg-gradient-to-r from-[#3ca488] to-[#1d6a53]" style={{ width: `${challenge.progress}%` }} /></div></div>
                        <p className="mt-4 text-sm font-medium text-[#145944]">{savedProgress || `${challenge.footer} ✓`}</p>
                        <button
                            type="button"
                            onClick={() => openActionModal({
                                kind: joined ? 'track-challenge' : 'join-challenge',
                                itemId: challenge.title,
                                title: joined ? challenge.title : `Join ${challenge.title}`,
                                description: joined
                                    ? 'Track your challenge progress, record your latest milestone, and keep your accountability streak alive.'
                                    : 'Choose how you want to participate in this community challenge and we will save your spot locally.',
                                primaryLabel: joined ? 'Save Progress' : 'Join Challenge',
                                inputLabel: joined ? 'Update your progress' : 'Why are you joining?',
                                placeholder: joined ? 'e.g. Saved KES 7,000 so far and stayed consistent all week...' : 'e.g. I want to improve my discipline and learn with the community...',
                                successMessage: joined ? `Progress saved for ${challenge.title}.` : `You have joined ${challenge.title}.`,
                                defaultValue: joined ? savedProgress || '' : '',
                            })}
                            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold ${actionTone}`}
                        >
                            {actionLabel}
                        </button>
                                </>
                            );
                        })()}
                    </div>
                ))}
            </div>
        </section>
        <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Upcoming Challenges</p>
            <div className="grid gap-4 xl:grid-cols-3">
                {filterItemsForTier(upcomingChallenges, currentTier).map((challenge) => (
                    <div key={challenge.title} className="rounded-[1.6rem] border border-[#cfe8dc] bg-white p-5 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                        <span className="text-3xl">{challenge.icon}</span>
                        <h3 className="mt-4 text-[1.25rem] font-semibold text-slate-900">{challenge.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{challenge.description}</p>
                        <div className="mt-4 grid grid-cols-3 gap-3"><MiniStat label="Starts" value={challenge.starts} /><MiniStat label="Duration" value={challenge.duration} /><MiniStat label="Reward" value={challenge.reward} /></div>
                        <button
                            type="button"
                            onClick={() => openActionModal({
                                kind: 'remind-challenge',
                                itemId: challenge.title,
                                title: `Reminder set for ${challenge.title}`,
                                description: 'We will keep this challenge on your radar so you can join when it opens.',
                                primaryLabel: 'Save Reminder',
                                inputLabel: 'Optional note',
                                placeholder: 'e.g. Remind me when salary lands or after I finish my current savings sprint...',
                                successMessage: `Reminder saved for ${challenge.title}.`,
                            })}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-amber-400 px-4 py-3 text-sm font-semibold text-[#0f3b31]"
                        >
                            {communityState.challengeReminders.includes(challenge.title) ? 'Reminder Saved' : '🔔 Remind Me'}
                        </button>
                    </div>
                ))}
            </div>
        </section>
        {communityState.createdChallenges.length ? (
            <SidebarCard title="Your Challenge Ideas" icon="📝">
                <div className="space-y-3">
                    {communityState.createdChallenges.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-[1rem] bg-[#f8fcfa] px-4 py-3">
                            <p className="text-sm font-medium leading-6 text-slate-700">{item.text}</p>
                        </div>
                    ))}
                </div>
            </SidebarCard>
        ) : null}
    </div>
);

const PodcastView = ({ currentTier, openActionModal, communityState }) => (
    <div className="space-y-6">
        <section className="rounded-[2rem] bg-gradient-to-r from-[#114738] to-[#226b57] p-6 text-white shadow-[0_18px_40px_rgba(8,51,39,0.16)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] bg-[#ffbf47] text-5xl">🎙️</div>
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Shilingi Moves Podcast - Ep. 42</p>
                    <h2 className="dashboard-display-title mt-2 text-white">How to Build KES 1 Million by Age 35</h2>
                    <p className="mt-2 text-sm text-white/75">with Grace Nyambu, CFP · 38 minutes</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => openActionModal({ kind: 'play-episode', itemId: podcastEpisodes[0].title, title: 'Now Playing', description: 'Episode 42 is ready. We can connect this to a real audio player next, but for now the listening flow and save intent are captured.', primaryLabel: 'Start Listening', successMessage: 'Podcast playback started.' })} className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-[#0d4736]">{communityState.playedEpisodes.includes(podcastEpisodes[0].title) ? 'Queued' : '▶ Play Now'}</button><button type="button" onClick={() => openActionModal({ kind: 'save-episode', itemId: podcastEpisodes[0].title, title: 'Save Episode', description: 'Add this episode to your saved list so you can return to it later.', primaryLabel: 'Save Episode', successMessage: 'Episode saved to your podcast list.' })} className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white">{communityState.savedEpisodes.includes(podcastEpisodes[0].title) ? '✓ Saved' : '✎ Save'}</button><p className="text-sm text-white/70">4,821 listens · ★★★★★</p></div>
                </div>
            </div>
        </section>
        <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">All Episodes</p>
            <div className="space-y-3">
                {filterItemsForTier(podcastEpisodes, currentTier).map((episode) => (
                    <div key={episode.title} className="rounded-[1.5rem] border border-[#cfe8dc] bg-white p-4 shadow-[0_14px_30px_rgba(15,76,58,0.08)]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-[#eef8f3] text-3xl">{episode.icon}</div><div className="flex-1"><p className="text-[1.15rem] font-semibold text-slate-900">{episode.title}</p><p className="text-sm text-slate-400">{episode.host} · {episode.date}</p><div className="mt-2 flex flex-wrap items-center gap-3"><span className="text-sm text-slate-400">◷ {episode.duration}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${episode.accent}`}>{episode.tag}</span><button type="button" onClick={() => openActionModal({ kind: 'play-episode', itemId: episode.title, title: episode.title, description: `Host: ${episode.host}. Category: ${episode.tag}. We can wire this into a full player next.`, primaryLabel: 'Play Episode', successMessage: `${episode.title} queued for playback.` })} className="rounded-full bg-[#1c6c5d] px-4 py-2 text-sm font-semibold text-white">{communityState.playedEpisodes.includes(episode.title) ? 'Queued' : '▶ Play'}</button>{communityState.savedEpisodes.includes(episode.title) ? <span className="rounded-full border border-[#bfe3d3] px-3 py-1 text-xs font-semibold text-[#1c6c5d]">Saved</span> : null}</div></div></div>
                    </div>
                ))}
            </div>
        </section>
        <section className="rounded-[1.5rem] border border-[#cfe8dc] bg-[#eef8f3] px-5 py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">🎙️ Want to be a guest on the Shilingi Moves Podcast?</p><p className="text-sm text-slate-500">Share your financial journey or expertise. We feature real Kenyan stories every week.</p></div><button type="button" onClick={() => openActionModal({ kind: 'guest-apply', title: 'Apply as Podcast Guest', description: 'Tell us what story or expertise you want to bring to the Shilingi Moves audience.', primaryLabel: 'Submit Application', inputLabel: 'Guest pitch', placeholder: 'e.g. I can share how I cleared debt and built a KES 500K emergency fund in 18 months...', successMessage: 'Podcast guest application saved.' })} className="rounded-full bg-[#1c6c5d] px-5 py-3 text-sm font-semibold text-white">Apply to Guest<ArrowRight size={14} className="inline ml-1" /></button></div></section>
    </div>
);

const BookClubView = ({ openActionModal, communityState, identity }) => (
    <div className="space-y-6">
        <section className="rounded-[2rem] bg-gradient-to-r from-[#243d72] to-[#3978ca] p-6 text-white shadow-[0_18px_40px_rgba(34,64,120,0.16)]"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-24 w-20 items-center justify-center rounded-[1.3rem] bg-[#ffbf47] text-5xl">📗</div><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Book of the Month - March 2026</p><h2 className="dashboard-display-title mt-2 text-white">The Psychology of Money</h2><p className="mt-1 text-sm text-white/75">Morgan Housel · Chapter 1-5 this week</p><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => openActionModal({ kind: 'join-discussion', title: 'Join Book Discussion', description: 'Share your biggest insight from this week’s chapters and join the Sunday evening discussion thread.', primaryLabel: 'Join Discussion', inputLabel: 'Your first thought', placeholder: 'e.g. The section on enough really changed how I think about lifestyle inflation...', successMessage: 'You joined this week’s book club discussion.' })} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#243d72]">{communityState.discussionEntries.length ? 'Discussion Joined' : 'Join Discussion'}</button><p className="text-sm text-white/75">1,247 readers · Discussion every Sunday 7PM</p></div></div></div></section>
        <div className="grid gap-6 xl:grid-cols-2">
            <SidebarCard title="Reading Schedule" icon="🗓️"><div className="space-y-3">{readingSchedule.map((item) => <div key={item.title} className={`rounded-[1rem] border px-4 py-3 ${item.tone}`}><p className="text-sm font-semibold text-slate-600">{item.title}</p><p className="mt-1 font-medium text-slate-900">{item.subtitle}</p></div>)}</div></SidebarCard>
            <SidebarCard title="This Week's Discussion" icon="💬"><p className="text-sm leading-6 text-slate-700">"What's the most valuable insight from Ch. 6-10 that you've applied to your own finances?"</p><div className="mt-4 space-y-3">{[...communityState.discussionEntries.map((item) => ({ author: item.author || identity.name, text: item.text })), ...discussions].slice(0, 4).map((item, index) => <div key={`${item.author}-${index}`} className="rounded-[1rem] bg-[#f8fcfa] px-4 py-3"><p className="font-semibold text-slate-800">{item.author}:</p><p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p></div>)}</div><button type="button" onClick={() => openActionModal({ kind: 'book-insight', title: 'Add Your Book Club Insight', description: 'Capture what stood out to you this week so your reflection can be added to the discussion.', primaryLabel: 'Share Insight', inputLabel: 'Your insight', placeholder: 'e.g. I realised my financial progress improved once I stopped chasing every trend and focused on consistency...', successMessage: 'Your insight was added to this week’s discussion.' })} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#bfe3d3] px-4 py-3 text-sm font-semibold text-[#1c6c5d]">Add Your Insight<ArrowRight size={14} /></button></SidebarCard>
        </div>
        <section className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Upcoming Reads</p><div className="grid gap-4 xl:grid-cols-4">{upcomingReads.map((item) => <div key={item.title} className="rounded-[1.5rem] border border-[#cfe8dc] bg-white p-5 shadow-[0_14px_30px_rgba(15,76,58,0.08)]"><div className={`flex h-24 w-20 items-center justify-center rounded-[1rem] bg-gradient-to-br ${item.color} text-4xl`}>📘</div><p className="mt-4 text-[1.08rem] font-semibold text-slate-900">{item.title}</p><p className="text-sm text-slate-400">{item.author}</p><p className="mt-3 text-sm text-slate-400">{item.month} · Starts {item.month.replace(' 2026', '').slice(0, 3)} 1</p><button type="button" onClick={() => openActionModal({ kind: 'reading-list', itemId: item.title, title: `Add ${item.title}`, description: 'Save this title to your reading list so you get nudges when the next book cycle starts.', primaryLabel: 'Add to Reading List', successMessage: `${item.title} added to your reading list.` })} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#bfe3d3] px-4 py-3 text-sm font-semibold text-[#1c6c5d]">{communityState.readingList.includes(item.title) ? '✓ Added' : '+ Reading List'}</button></div>)}</div></section>
    </div>
);

const KidsView = ({ openActionModal, communityState }) => (
    <div className="space-y-6">
        <section className="rounded-[2rem] bg-gradient-to-r from-[#ffb429] to-[#5f8d67] p-8 text-center shadow-[0_18px_40px_rgba(121,116,36,0.16)]"><div className="text-6xl">👶🏫💰</div><h2 className="dashboard-display-title mt-3 text-[#123d33]">Shilingi Kids</h2><p className="mx-auto mt-3 max-w-2xl text-base text-[#23493e]">Teaching Kenyan children the language of money early. Because financial literacy starts at home.</p></section>
        <div className="grid gap-4 xl:grid-cols-3">{kidsCards.map((card, index) => <div key={card.title} className={`rounded-[1.6rem] border border-[#cfe8dc] bg-gradient-to-br ${card.color} p-6 shadow-[0_14px_30px_rgba(15,76,58,0.08)]`}><div className="text-4xl">{index === 0 ? '🎮' : index === 1 ? '📖' : '🎓'}</div><h3 className="mt-4 text-[1.3rem] font-semibold text-slate-900">{card.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{card.description}</p><p className="mt-4 text-sm font-semibold text-[#145944]">{card.age}</p><button type="button" onClick={() => openActionModal({ kind: 'kids-action', itemId: card.title, title: card.title, description: `Start the ${card.title.toLowerCase()} experience and continue building financial literacy for young users.`, primaryLabel: card.cta, inputLabel: index === 2 ? 'Parent email' : 'Optional note', placeholder: index === 2 ? 'e.g. parent@example.com' : 'Add any context you want us to remember...', successMessage: `${card.cta} request saved for ${card.title}.` })} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold ${index === 2 ? 'bg-[#7d5ac7] text-white' : index === 0 ? 'bg-amber-400 text-[#0f3b31]' : 'bg-[#1c6c5d] text-white'}`}>{communityState.kidsActions[card.title] ? '✓ Saved' : card.cta}</button></div>)}</div>
        <div className="grid gap-6 xl:grid-cols-2">
            <SidebarCard title="Parent Corner" icon="👨‍👩‍👧‍👦"><div className="space-y-3"><div className="rounded-[1rem] border border-[#cfe8dc] bg-[#f8fcfa] px-4 py-4"><p className="font-semibold text-slate-900">📅 Family Finance Sunday</p><p className="mt-1 text-sm leading-6 text-slate-600">Every Sunday at 6PM. Join a live session to discuss your family's finances together. 10-minute guided conversation with your children.</p><button type="button" onClick={() => openActionModal({ kind: 'register-family', title: 'Register for Family Finance Sunday', description: 'Reserve a spot for your household and let us know how many family members may join.', primaryLabel: 'Register Family', inputLabel: 'Family note', placeholder: 'e.g. 2 adults and 2 kids, interested in pocket money and saving habits...', successMessage: 'Family Finance Sunday registration saved.' })} className="mt-4 rounded-full bg-[#1c6c5d] px-4 py-2 text-sm font-semibold text-white">{communityState.familyRegistrations.length ? '✓ Registered' : 'Register Family'}</button></div><div className="rounded-[1rem] border border-[#cfe8dc] bg-[#f8fcfa] px-4 py-4"><p className="font-semibold text-slate-900">🎁 Junior Savings Goal</p><p className="mt-1 text-sm leading-6 text-slate-600">Set a savings goal for your child and watch them track it on their own Shilingi Kids dashboard. Builds the savings habit early.</p><button type="button" onClick={() => openActionModal({ kind: 'junior-goal', title: 'Set Up Junior Savings Goal', description: 'Capture the goal you want your child to work toward and the habit you want to build.', primaryLabel: 'Save Goal Setup', inputLabel: 'Savings goal', placeholder: 'e.g. KES 5,000 for a school trip by August...', successMessage: 'Junior savings goal setup saved.' })} className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0f3b31]">{communityState.juniorGoals.length ? '✓ Goal Saved' : 'Set Up Goal'}</button></div></div></SidebarCard>
            <SidebarCard title="Schools Programme" icon="🏫"><p className="text-sm leading-6 text-slate-600">The Shilingi Moves Schools Programme brings financial education directly into primary and secondary schools across Kenya for free.</p><div className="mt-4 space-y-3"><MetricStrip label="Partner Schools" value="147" /><MetricStrip label="Students Reached" value="42,000+" /><MetricStrip label="Counties Covered" value="18 of 47" /></div><button type="button" onClick={() => openActionModal({ kind: 'school-partner', title: 'Partner Your School', description: 'Tell us about the school and we will save the partnership interest for follow-up.', primaryLabel: 'Submit School Interest', inputLabel: 'School name or details', placeholder: 'e.g. Green Valley Academy, Nairobi. Interested in upper primary financial literacy sessions...', successMessage: 'School partnership interest saved.' })} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{communityState.schoolPartners.length ? '✓ Interest Saved' : 'Partner Your School'}<ArrowRight size={14} /></button></SidebarCard>
        </div>
    </div>
);

const ExpertView = ({ openActionModal, communityState }) => (
    <div className="space-y-6">
        <SectionHeader title="Expert Q&A Sessions" description="Ask certified Kenyan financial experts your most pressing money questions. Live sessions every week." actionLabel="Ask a Question" onAction={() => openActionModal({ kind: 'expert-question', expertName: 'Expert Panel', title: 'Ask a Community Expert', description: 'Submit your question and choose what kind of support you need from the expert panel.', primaryLabel: 'Submit Question', inputLabel: 'Your question', placeholder: 'e.g. I am torn between increasing my emergency fund and starting an MMF. Which should come first?', successMessage: 'Your expert question has been submitted.' })} />
        <div className="grid gap-4 xl:grid-cols-3">{experts.map((expert) => <div key={expert.name} className="rounded-[1.6rem] border border-[#cfe8dc] bg-white p-5 shadow-[0_14px_30px_rgba(15,76,58,0.08)]"><div className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${expert.tone} text-lg font-bold text-white`}>{expert.initials}</div><h3 className="mt-4 text-[1.3rem] font-semibold text-slate-900">{expert.name}</h3><p className="text-sm text-slate-400">{expert.role}</p><div className="mt-4 flex flex-wrap gap-2">{expert.focus.split(' · ').map((focus) => <span key={focus} className="rounded-full bg-[#eef8f3] px-3 py-1 text-xs font-semibold text-[#1c6c5d]">{focus}</span>)}</div><p className="mt-4 text-sm text-slate-400">📅 Next session: {expert.session} · {expert.answered}</p><button type="button" onClick={() => openActionModal({ kind: 'expert-question', expertName: expert.name, title: `Ask ${expert.name}`, description: `Send a question directly into ${expert.name}'s topic area: ${expert.focus}.`, primaryLabel: `Send to ${expert.name.split(' ')[0]}`, inputLabel: 'Your question', placeholder: 'Write your question here...', successMessage: `Your question for ${expert.name} has been saved.` })} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1c6c5d] px-4 py-3 text-sm font-semibold text-white">Ask {expert.name.split(' ')[0]}<ArrowRight size={14} /></button></div>)}</div>
        {communityState.expertQuestions.length ? (
            <SidebarCard title="Your Submitted Questions" icon="📝">
                <div className="space-y-3">
                    {communityState.expertQuestions.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-[1rem] bg-[#f8fcfa] px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">{item.expert}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                        </div>
                    ))}
                </div>
            </SidebarCard>
        ) : null}
        <SidebarCard title="Recent Expert Answers" icon="💬"><div className="space-y-4">{recentAnswers.map((item) => <div key={item.asker} className={`rounded-[1rem] bg-[#f8fcfa] px-4 py-4 ${item.tone}`}><p className="text-sm text-slate-400">Q. {item.asker} asks:</p><p className="mt-2 text-[1.02rem] font-medium text-slate-900">{item.question}</p><p className="mt-3 text-sm font-semibold text-[#145944]">✅ {item.answerer} answers:</p><p className="mt-1 text-sm leading-7 text-slate-600">{item.answer}</p><p className="mt-3 text-sm text-slate-400">{item.likes} 👍 · {item.age}</p></div>)}</div></SidebarCard>
    </div>
);

const LeaderboardView = ({ identity, openActionModal, communityState }) => {
    const rows = [
        { position: '1', initials: 'BO', name: 'Brian Ochieng', role: 'T-Bills Expert', city: 'Mombasa', points: '4,820 pts', badge: '🏅', tone: 'from-[#4f97e8] to-[#7bb3f3]' },
        { position: '2', initials: 'AN', name: 'Amina Njeri', role: 'Debt-Free Champion', city: 'Nairobi', points: '4,231 pts', badge: '🥈', tone: 'from-[#7c63ea] to-[#a98ef9]' },
        { position: '3', initials: 'JM', name: 'James Mwangi', role: 'Savings Achiever', city: 'Nairobi', points: '3,780 pts', badge: '🥉', tone: 'from-[#f0a92d] to-[#f1cf7b]' },
        { position: '4', initials: 'SW', name: 'Stella Wanjiru', role: 'Investing Journey', city: 'Nakuru', points: '3,241 pts', badge: '🌟', tone: 'from-[#2f9a73] to-[#57c194]' },
        { position: '5', initials: 'DK', name: 'David Kamau', role: 'Budget Master', city: 'Eldoret', points: '2,980 pts', badge: '💡', tone: 'from-[#18a0aa] to-[#49c5cd]' },
        { position: '47', initials: identity.initials, name: `You - ${identity.name}`, role: 'On the rise!', city: 'Nairobi', points: '847 pts', badge: '⚡', tone: 'from-[#2b7f67] to-[#d6a828]', current: true },
    ];
    return (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SidebarCard title="All-Time Top Contributors" icon="🏆"><div className="space-y-2">{rows.map((row) => <div key={`${row.position}-${row.name}`} className={`flex items-center gap-4 rounded-[1rem] px-4 py-3 ${row.current ? 'bg-[#fff8e9]' : 'border-b border-[#eef4f0]'}`}><span className="w-8 text-lg font-semibold text-[#b57b16]">{row.position}</span><span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${row.tone} text-sm font-bold text-white`}>{row.initials}</span><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{row.name}</p><p className="text-sm text-slate-400">{row.role} · {row.city}</p></div><p className="font-semibold text-[#b57b16]">{row.points}</p><span>{row.badge}</span></div>)}</div></SidebarCard>
            <div className="space-y-6"><SidebarCard title="How to Earn Points" icon={<Star size={16} />}><div className="space-y-3">{pointsRules.map((rule) => <div key={rule.label} className="flex items-center justify-between rounded-[1rem] bg-[#f8fcfa] px-4 py-3"><span className="font-medium text-slate-800">{rule.label}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.tone}`}>{rule.points}</span></div>)}</div></SidebarCard><SidebarCard title="Your Badges" icon="🏅"><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{badges.map((badge) => <button key={badge.title} type="button" onClick={() => openActionModal({ kind: 'view-badge', itemId: badge.title, title: badge.title, description: `See what this badge represents and what action moves you closer to unlocking or keeping it.`, primaryLabel: 'Got It', successMessage: `${badge.title} badge details viewed.` })} className={`rounded-[1rem] border px-4 py-5 text-center ${badge.tone} ${communityState.viewedBadges.includes(badge.title) ? 'ring-2 ring-[#9ed7c1]' : ''}`}><div className="text-3xl">{badge.icon}</div><p className="mt-3 text-sm font-semibold text-slate-800">{badge.title}</p></button>)}</div></SidebarCard></div>
        </div>
    );
};

const SectionHeader = ({ title, description, actionLabel, onAction }) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-[1.15rem] font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div><button type="button" onClick={onAction} className="rounded-[0.8rem] bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white">{actionLabel}{actionLabel.includes('Create') || actionLabel.includes('Ask') ? ' ->' : ''}</button></div>
);

const HeroMetric = ({ value, label, icon = null }) => (<div className="min-w-[96px] border-r border-white/18 pr-4 last:border-r-0 last:pr-0"><p className="flex items-center gap-2 text-[1.45rem] font-bold leading-none text-amber-300">{icon}{value}</p><p className="mt-1 text-xs text-white/65">{label}</p></div>);
const HeroButton = ({ children, solid = false, ...props }) => (<button type="button" className={`inline-flex items-center gap-2 rounded-[0.8rem] px-4 py-2.5 text-sm font-semibold transition ${solid ? 'bg-[#fff5e8] text-primary-700' : 'border border-white/25 bg-white/10 text-white hover:bg-white/16'}`} {...props}>{children}</button>);
const ActionPill = ({ icon, label }) => (<button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#dbeee5] bg-[#f8fcfa] px-4 py-2 text-sm font-semibold text-slate-700">{icon}{label}</button>);
const SidebarCard = ({ title, icon, tone = 'default', children }) => (<section className={`rounded-[1rem] border p-4 shadow-sm ${tone === 'warm' ? 'border-amber-200 bg-[#fffaf0]' : 'border-[#dbeee5] bg-white'}`}><div className="mb-4 flex items-center gap-2 text-slate-900"><span className="text-lg">{icon}</span><h3 className="text-[1.05rem] font-bold text-slate-900">{title}</h3></div>{children}</section>);
const MiniStat = ({ label, value }) => (<div className="rounded-[0.9rem] bg-[#f8fcfa] px-3 py-2"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>);
const MetricStrip = ({ label, value }) => (<div className="flex items-center justify-between rounded-[1rem] bg-[#f8fcfa] px-4 py-3"><span className="text-slate-700">{label}</span><span className="font-semibold text-[#145944]">{value}</span></div>);

const ActionModal = ({ config, draft, onChangeDraft, onClose, onSubmit }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-xl rounded-[1.6rem] border border-[#dbeee5] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e7f2ec] px-5 py-4">
                <div>
                    <h3 className="dashboard-display-title text-slate-900">{config.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{config.description}</p>
                </div>
                <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbeee5] bg-[#f8fcfa] text-slate-500" aria-label="Close community action modal">
                    <X size={16} />
                </button>
            </div>
            <div className="space-y-4 px-5 py-5">
                {config.inputLabel ? (
                    <label className="block text-sm font-medium text-slate-700">
                        {config.inputLabel}
                        <textarea
                            value={draft}
                            onChange={(event) => onChangeDraft(event.target.value)}
                            rows={5}
                            placeholder={config.placeholder || 'Add details here...'}
                            className="mt-2 w-full rounded-[1rem] border border-[#dbeee5] bg-[#f8fcfa] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                        />
                    </label>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="rounded-[0.95rem] border border-[#dbeee5] bg-[#f8fcfa] px-5 py-3 text-sm font-semibold text-slate-700">
                        Cancel
                    </button>
                    <button type="button" onClick={onSubmit} className="rounded-[0.95rem] bg-primary-700 px-6 py-3 text-sm font-semibold text-white">
                        {config.primaryLabel || 'Save'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default CommunityHubPanel;
