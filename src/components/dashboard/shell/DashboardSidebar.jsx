import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Globe, LockKeyhole, X } from 'lucide-react';
import { dashboardSectionMap, dashboardSidebarGroups } from './dashboardSections';

const DashboardSidebar = ({
    collapsed,
    onToggle,
    onOpenWebsite,
    activeSection,
    onSelectSection,
    mobileOpen = false,
    onCloseMobile,
    accessBySection = {},
    navigationGroups = dashboardSidebarGroups,
    mobileTitle = 'Dashboard Menu',
    mobileDescription = 'Move easily between tools and close when finished.',
}) => {
    const groupIds = useMemo(() => navigationGroups.map((group) => group.id), [navigationGroups]);
    const activeGroupId = useMemo(
        () => navigationGroups.find((group) => group.items.includes(activeSection))?.id ?? navigationGroups[0]?.id,
        [activeSection, navigationGroups]
    );
    const [expandedGroups, setExpandedGroups] = useState(() =>
        groupIds.reduce((accumulator, groupId, index) => {
            accumulator[groupId] = index === 0;
            return accumulator;
        }, {})
    );

    useEffect(() => {
        if (!mobileOpen || !activeGroupId) {
            return;
        }

        setExpandedGroups((current) => ({
            ...current,
            [activeGroupId]: true,
        }));
    }, [activeGroupId, mobileOpen]);

    const handleSelectSection = (sectionId) => {
        onSelectSection(sectionId);
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups((current) => ({
            ...current,
            [groupId]: !current[groupId],
        }));
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
                className={`fixed inset-y-0 left-0 z-40 flex w-[min(92vw,360px)] flex-col border-r border-[#d9ebe3] bg-white text-slate-900 shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:h-full lg:shadow-none ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                } ${collapsed ? 'lg:w-[96px]' : 'lg:w-[268px]'} lg:translate-x-0`}
            >
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute -right-5 top-6 hidden h-10 w-10 items-center justify-center rounded-full bg-[#f4c95d] text-slate-950 shadow-lg lg:inline-flex"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft className={collapsed ? 'rotate-180' : ''} size={18} />
                </button>

                <div className="border-b border-slate-200 px-4 py-4 lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-700">{mobileTitle}</p>
                            <p className="mt-1 text-sm text-slate-500">{mobileDescription}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onCloseMobile}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-900 shadow-sm"
                            aria-label="Close sidebar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-gutter:stable] sm:px-4">
                    <div className="space-y-5">
                        {navigationGroups.map((group) => (
                            <div key={group.id}>
                                {!collapsed && (
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 lg:cursor-default lg:hover:bg-transparent"
                                        aria-expanded={expandedGroups[group.id]}
                                    >
                                        <span>{group.label}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform lg:hidden ${expandedGroups[group.id] ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                )}
                                <div className={`space-y-2 ${collapsed ? '' : 'mt-2'} ${expandedGroups[group.id] || collapsed ? 'block' : 'hidden lg:block'}`}>
                                    {group.items.map((sectionId) => {
                                        const item = dashboardSectionMap[sectionId];
                                        if (!item) {
                                            return null;
                                        }

                                        const Icon = item.icon;
                                        const isActive = activeSection === item.id;
                                        const sectionAccess = accessBySection[item.id];
                                        const isLocked = sectionAccess && !sectionAccess.allowed;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleSelectSection(item.id)}
                                                className={`flex w-full items-center rounded-2xl text-left transition-all ${
                                                    isActive
                                                        ? 'bg-[#edf9f4] text-[#0d6648] shadow-lg shadow-[#14986b]/15'
                                                        : 'bg-transparent text-slate-700 hover:bg-[#f3faf7] hover:text-slate-950'
                                                } ${collapsed ? 'justify-center px-0 py-4' : 'gap-3 px-4 py-3.5 lg:py-2.5'}`}
                                            >
                                                <span className={`inline-flex items-center justify-center rounded-xl ${
                                                    isActive ? 'bg-[#d4f0e4] text-[#0d6648]' : 'bg-slate-100 text-slate-600'
                                                } ${collapsed ? 'h-12 w-12' : 'h-11 w-11 lg:h-9 lg:w-9'}`}>
                                                    <Icon size={18} />
                                                </span>
                                                {!collapsed && (
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                                                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                                                            {isLocked ? `${sectionAccess.minimumTier} plan required` : item.helper}
                                                        </span>
                                                    </span>
                                                )}
                                                {isLocked && !collapsed && <LockKeyhole size={15} className="shrink-0 text-amber-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                <div className={`border-t border-slate-200 bg-white px-4 py-4 ${collapsed ? 'flex justify-center' : 'flex justify-end'} lg:py-5`}>
                    <button
                        type="button"
                        onClick={onOpenWebsite}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 lg:h-11 lg:w-auto"
                        title="Visit website"
                    >
                        <Globe size={18} />
                        {!collapsed && <span>Go to Website</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
