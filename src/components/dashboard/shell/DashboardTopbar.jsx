import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, Home, LogOut, Menu, Search, Settings, Smartphone, UserCircle2 } from 'lucide-react';
import animatedLogo from '../../../assets/shilingi-logo-animated.gif';
import { dashboardTopTabs } from './dashboardSections';

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
    const searchInputRef = useRef(null);
    const firstName = user?.first_name || 'Client';
    const lastName = user?.last_name || '';
    const tierLabel = useMemo(
        () => normalizeTier(user?.tier || user?.subscription_tier || user?.plan || 'Basic'),
        [user]
    );
    const fullName = `${firstName} ${lastName}`.trim();

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    return (
        <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/96 backdrop-blur-xl">
            <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenMobileMenu}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
                        aria-label="Open dashboard menu"
                    >
                        <Menu size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectSection('overview')}
                        className="inline-flex h-[62px] w-[132px] items-center justify-center rounded-[1.3rem] border border-emerald-100 bg-white px-2 shadow-sm sm:h-[74px] sm:w-[165px] sm:rounded-[1.6rem] sm:px-4"
                    >
                        <span className="inline-flex h-[50px] w-[118px] items-center justify-center overflow-hidden rounded-xl sm:h-[58px] sm:w-[138px]">
                            <img src={animatedLogo} alt="Shilingi Moves" className="h-full w-full object-contain" />
                        </span>
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
                                        ? 'bg-[#eff8f4] text-primary-800 ring-1 ring-primary-100'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                                    }`}
                            >
                                {tab.topLabel || tab.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-2 sm:gap-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setSearchOpen((current) => !current);
                                setNotificationsOpen(false);
                                setAccountOpen(false);
                            }}
                            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-[#f3faf7] text-slate-700 shadow-sm transition-colors hover:text-slate-950"
                            aria-label="Open search"
                        >
                            <Search size={18} />
                        </button>

                        {searchOpen && (
                            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(92vw,340px)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.7rem] max-sm:w-auto">
                                <label className="flex w-full items-center gap-2.5 rounded-full border border-emerald-100 bg-[#f6fbf8] px-4 py-2 shadow-sm">
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
                            className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-[#f3faf7] text-slate-700 shadow-sm transition-colors hover:text-slate-950"
                            aria-label="Open notifications"
                        >
                            <Bell size={18} />
                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(92vw,360px)] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.7rem] max-sm:w-auto">
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">
                                    Notifications
                                </p>
                                <div className="mt-4 space-y-3">
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
                            className="inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-[#f3faf7] py-1 pl-1 pr-3 shadow-sm transition-colors hover:border-primary-200"
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8c8f3f] text-xs font-bold text-white">
                                {firstName.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden min-w-0 text-left md:block">
                                <span className="block truncate text-sm font-semibold text-slate-900">{fullName}</span>
                                <span className="block truncate text-[11px] text-amber-700">{tierLabel}</span>
                            </span>
                            <ChevronDown size={16} className="hidden text-slate-500 sm:block" />
                        </button>

                        {accountOpen && (
                            <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-56 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.12)] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.7rem] max-sm:w-auto">
                                <div className="px-3 py-2.5">
                                    <p className="truncate text-sm font-semibold text-slate-900">{fullName}</p>
                                    <p className="truncate text-xs text-slate-500">{user?.email || 'Signed in'}</p>
                                </div>
                                <div className="border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSelectSection('overview');
                                            setAccountOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
                                    >
                                        <Home size={15} />
                                        Dashboard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSelectSection('user');
                                            setAccountOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
                                    >
                                        <UserCircle2 size={15} />
                                        My Profile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSelectSection('settings');
                                            setAccountOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
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
                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-emerald-50"
                                    >
                                        <Smartphone size={15} />
                                        Mobile App
                                    </button>
                                </div>
                                <div className="border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={onSignOut}
                                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
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
        </header>
    );
};

export default DashboardTopbar;
