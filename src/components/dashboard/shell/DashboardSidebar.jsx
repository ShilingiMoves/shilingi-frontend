import React from 'react';
import { ChevronLeft, Globe, X } from 'lucide-react';
import { dashboardSectionMap, dashboardSidebarGroups } from './dashboardSections';

const DashboardSidebar = ({
    collapsed,
    onToggle,
    onOpenWebsite,
    activeSection,
    onSelectSection,
    mobileOpen = false,
    onCloseMobile,
}) => {
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
                className={`fixed inset-y-0 left-0 z-40 flex w-[min(88vw,320px)] flex-col border-r border-[#d9ebe3] bg-white text-slate-900 shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:h-full lg:shadow-none ${
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

                <div className="flex items-center justify-end border-b border-white/10 px-4 py-4 lg:hidden">
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-900"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-gutter:stable]">
                    <div className="space-y-5">
                        {dashboardSidebarGroups.map((group) => (
                            <div key={group.id}>
                                {!collapsed && (
                                    <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                                        {group.label}
                                    </p>
                                )}
                                <div className={`space-y-2 ${collapsed ? '' : 'mt-3'}`}>
                                    {group.items.map((sectionId) => {
                                        const item = dashboardSectionMap[sectionId];
                                        if (!item) {
                                            return null;
                                        }

                                        const Icon = item.icon;
                                        const isActive = activeSection === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleSelectSection(item.id)}
                                                className={`flex w-full items-center rounded-2xl text-left transition-all ${
                                                    isActive
                                                        ? 'bg-[#edf9f4] text-[#0d6648] shadow-lg shadow-[#14986b]/15'
                                                        : 'bg-transparent text-slate-700 hover:bg-[#f3faf7] hover:text-slate-950'
                                                } ${collapsed ? 'justify-center px-0 py-4' : 'gap-3 px-4 py-2.5'}`}
                                            >
                                                <span className={`inline-flex items-center justify-center rounded-xl ${
                                                    isActive ? 'bg-[#d4f0e4] text-[#0d6648]' : 'bg-slate-100 text-slate-600'
                                                } ${collapsed ? 'h-12 w-12' : 'h-9 w-9'}`}>
                                                    <Icon size={18} />
                                                </span>
                                                {!collapsed && (
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </nav>

                <div className={`border-t border-slate-200 px-4 py-5 ${collapsed ? 'flex justify-center' : 'flex justify-end'}`}>
                    <button
                        type="button"
                        onClick={onOpenWebsite}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
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
