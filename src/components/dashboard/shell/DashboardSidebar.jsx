import React from 'react';
import { ChevronLeft, LogOut, X } from 'lucide-react';
import animatedLogo from '../../../assets/shilingi-logo-animated.gif';
import { dashboardNavSections } from './dashboardSections';

const DashboardSidebar = ({
    collapsed,
    onToggle,
    onSignOut,
    user,
    activeSection,
    onSelectSection,
    mobileOpen = false,
    onCloseMobile,
}) => {
    const userInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
    const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'User account';
    const isUserSectionActive = activeSection === 'user';

    const handleSelectSection = (sectionId) => {
        onSelectSection(sectionId);
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar overlay"
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-[min(88vw,320px)] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:min-h-screen lg:shadow-none ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                } ${collapsed ? 'lg:w-[96px]' : 'lg:w-[268px]'} lg:translate-x-0`}
            >
            <div className={`border-b border-white/10 px-4 py-5 ${collapsed ? 'flex flex-col items-center gap-4' : 'flex items-center justify-between gap-4'}`}>
                {collapsed ? (
                    <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-white px-2 py-2 shadow-sm ring-1 ring-white/10">
                        <img src={animatedLogo} alt="Shilingi Moves" className="max-h-full max-w-full object-contain" />
                    </div>
                ) : (
                    <div className="flex min-h-[88px] flex-1 items-center rounded-[1.75rem] bg-white px-4 py-3 shadow-sm ring-1 ring-white/10">
                        <img src={animatedLogo} alt="Shilingi Moves" className="h-[64px] w-full object-contain object-left" />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="hidden h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-950 lg:inline-flex"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronLeft className={collapsed ? 'rotate-180' : ''} size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-3">
                    {dashboardNavSections.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelectSection(item.id)}
                                className={`flex w-full items-center rounded-2xl text-left transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30' : 'bg-white/5 text-slate-200 hover:bg-white/10'} ${collapsed ? 'justify-center px-0 py-4' : 'gap-3 px-4 py-3'}`}
                            >
                                <span className={`inline-flex items-center justify-center rounded-xl ${isActive ? 'bg-white/15' : 'bg-white/10'} ${collapsed ? 'h-12 w-12' : 'h-10 w-10'}`}>
                                    <Icon size={19} />
                                </span>
                                {!collapsed && (
                                    <span>
                                        <span className="block text-sm font-semibold">{item.label}</span>
                                        {item.helper && (
                                            <span className={`block text-xs ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                {item.helper}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-white/10 px-4 py-5">
                <div className={`rounded-2xl ${collapsed ? 'space-y-3 px-0 py-0' : 'space-y-3'}`}>
                    <button
                        type="button"
                        onClick={() => handleSelectSection('user')}
                        className={`w-full rounded-2xl text-left transition-all ${isUserSectionActive ? 'bg-primary-600 shadow-lg shadow-primary-900/30' : 'bg-white/5 hover:bg-white/10'} ${collapsed ? 'flex flex-col items-center gap-3 px-0 py-4' : 'flex items-center gap-3 px-4 py-4'}`}
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-white font-bold text-slate-950">
                            {userInitial}
                        </div>
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{userName}</p>
                                <p className={`truncate text-xs ${isUserSectionActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {user?.email || 'Signed in'}
                                </p>
                            </div>
                        )}
                    </button>

                    <div className={`${collapsed ? 'flex justify-center' : 'flex justify-end'}`}>
                        <button
                            type="button"
                            onClick={onSignOut}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-colors hover:text-white"
                            title="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
