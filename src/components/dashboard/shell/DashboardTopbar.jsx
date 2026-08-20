import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, Smartphone, UserCircle2, X } from 'lucide-react';
import animatedLogo from '../../../assets/shilingi-logo-animated.gif';
import { dashboardTopTabs } from './dashboardSections';
import {
    getDashboardDisplayName,
    getMemberInitials,
    getMemberNumber,
    PREFERRED_NAME_KEY,
    PREFERRED_NAME_UPDATED_EVENT,
} from '../../../utils/memberIdentity';

const notifications = [
    {
        title: 'Weekly check-in ready',
        text: 'Review your progress across planning tools and learning goals.',
    },
    {
        title: 'New comparison updates',
        text: 'Savings, MMF, and insurance product highlights are available to review.',
    },
    {
        title: 'Financial calendar reminder',
        text: 'Your rent, SACCO contribution, and investment check-in are coming up soon.',
    },
];

const normalizeTier = (value) => {
    if (!value) {
        return 'Basic';
    }

    return String(value)
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
};

const DashboardTopbar = ({
    activeSection,
    onSelectSection,
    onOpenMobileMenu,
    onSignOut,
    user,
}) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [displayName, setDisplayName] = useState(() => getDashboardDisplayName(user));
    const searchInputRef = useRef(null);
    const popoverContainerRef = useRef(null);
    const memberInitials = getMemberInitials(user);
    const memberNumber = getMemberNumber(user);
    const tierLabel = useMemo(
        () => normalizeTier(user?.tier || user?.subscription_tier || user?.plan || 'Basic'),
        [user]
    );
    const anyPanelOpen = searchOpen || notificationsOpen || accountOpen;

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        const syncDisplayName = () => setDisplayName(getDashboardDisplayName(user));
        syncDisplayName();

        const handleStorage = (event) => {
            if (event.key === PREFERRED_NAME_KEY) {
                syncDisplayName();
            }
        };

        window.addEventListener(PREFERRED_NAME_UPDATED_EVENT, syncDisplayName);
        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', syncDisplayName);

        return () => {
            window.removeEventListener(PREFERRED_NAME_UPDATED_EVENT, syncDisplayName);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('focus', syncDisplayName);
        };
    }, [user]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!popoverContainerRef.current?.contains(event.target)) {
                setSearchOpen(false);
                setNotificationsOpen(false);
                setAccountOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setSearchOpen(false);
                setNotificationsOpen(false);
                setAccountOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const closePanels = () => {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setAccountOpen(false);
    };

    const mobilePanelHeader = (title) => (
        <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">{title}</p>
            <button
                type="button"
                onClick={closePanels}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700"
                aria-label={`Close ${title.toLowerCase()}`}
            >
                <X size={16} />
            </button>
        </div>
    );

    return (
        <header
            className="sticky top-0 z-40 border-b border-[#e7ebe9] bg-white sm:shadow-sm"
        >
            {anyPanelOpen && (
                <button
                    type="button"
                    aria-label="Close open dashboard panels"
                    onClick={closePanels}
                    className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] sm:hidden"
                />
            )}

            <div className="mx-auto max-w-[1600px] px-[22px] py-3 sm:px-6 lg:px-8">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onOpenMobileMenu}
                            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-primary-600 sm:inline-flex lg:hidden"
                            aria-label="Open dashboard menu"
                        >
                            <Menu size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={() => onSelectSection('overview')}
                            className="inline-flex items-center justify-center"
                            aria-label="Go to dashboard home"
                        >
                            <img
                                src={animatedLogo}
                                alt="Shilingi Moves"
                                className="h-[46px] w-[58px] object-contain sm:h-14 sm:w-auto lg:h-16"
                            />
                        </button>
                    </div>

                    <nav className="hidden items-center justify-center gap-1 px-6 xl:flex">
                        {dashboardTopTabs.map((tab) => {
                            const isActive = activeSection === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onSelectSection(tab.id)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100'
                                        : 'text-gray-700 hover:bg-white hover:text-primary-600'
                                        }`}
                                >
                                    {tab.topLabel || tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div ref={popoverContainerRef} className="relative flex items-center justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchOpen((current) => !current);
                                    setNotificationsOpen(false);
                                    setAccountOpen(false);
                                }}
                                className="relative hidden h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-primary-600 sm:inline-flex"
                                aria-label="Open search"
                            >
                                <Search size={18} />
                            </button>

                            {searchOpen && (
                                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(92vw,340px)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.7rem] max-sm:w-auto">
                                    {mobilePanelHeader('Search')}
                                    <label className="flex w-full items-center gap-2.5 rounded-full border border-emerald-100 bg-[#f6fbf8] px-4 py-3 shadow-sm">
                                        <Search size={16} className="text-slate-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="search"
                                            placeholder="Search Shilingi Moves"
                                            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setNotificationsOpen((current) => !current);
                                    setAccountOpen(false);
                                    setSearchOpen(false);
                                }}
                                className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-primary-600 sm:inline-flex sm:rounded-2xl"
                                aria-label="Open notifications"
                            >
                                <Bell size={18} />
                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(92vw,360px)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.7rem] max-sm:w-auto">
                                    {mobilePanelHeader('Notifications')}
                                    <div className="space-y-3">
                                        {notifications.map((item) => (
                                            <div key={item.title} className="rounded-2xl bg-slate-50 px-4 py-3">
                                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountOpen((current) => !current);
                                    setNotificationsOpen(false);
                                    setSearchOpen(false);
                                }}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white py-1 pl-1 pr-1 text-[#16302b] transition-colors hover:bg-[#e4f0ee] sm:gap-3 sm:border sm:border-gray-200 sm:pr-3 sm:shadow-sm"
                            >
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0c6060] sm:bg-[#8c8f3f] sm:text-white">
                                    {memberInitials}
                                </span>
                                <span className="min-w-0 max-w-[108px] text-left sm:hidden md:block">
                                    <span className="block truncate text-[13px] font-semibold text-gray-900 sm:text-sm">{displayName}</span>
                                    <span className="hidden truncate text-[11px] text-[#f4c95d] md:block">{tierLabel}</span>
                                </span>
                                <ChevronDown size={15} className="text-gray-500" />
                            </button>

                            {accountOpen && (
                                <div className="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-[220px] overflow-hidden rounded-[1rem] border border-emerald-100 bg-white p-3 shadow-[0_20px_55px_rgba(15,23,42,0.12)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.7rem] max-sm:w-auto">
                                    {mobilePanelHeader('Account')}
                                    <div>
                                        <div className="mb-2 rounded-xl border border-emerald-100 bg-[#f6fbf8] px-3 py-2.5">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-700">Member Number</p>
                                            <p className="mt-1 text-sm font-bold text-slate-900">{memberNumber}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelectSection('user');
                                                setAccountOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
                                        >
                                            <UserCircle2 size={15} />
                                            Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelectSection('settings');
                                                setAccountOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
                                        >
                                            <Settings size={15} />
                                            Settings
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    window.open('https://shilingimoves-nu.vercel.app/', '_blank', 'noopener,noreferrer');
                                                }
                                                setAccountOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
                                        >
                                            <Smartphone size={15} />
                                            Mobile App
                                        </button>
                                    </div>
                                    <div className="mt-2 border-t border-slate-100 pt-2">
                                        <button
                                            type="button"
                                            onClick={onSignOut}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <LogOut size={15} />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hidden">
                    <div className="flex min-w-max items-center gap-2">
                        {dashboardTopTabs.map((tab) => {
                            const isActive = activeSection === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onSelectSection(tab.id)}
                                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100'
                                        : 'border border-gray-200 bg-white text-gray-700'
                                        }`}
                                >
                                    {tab.topLabel || tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardTopbar;
