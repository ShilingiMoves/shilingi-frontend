import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Bot,
    Calculator,
    FileText,
    GraduationCap,
    HeartHandshake,
    Home,
    LineChart,
    MoreHorizontal,
    Users,
    X,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/shell/DashboardSidebar';
import DashboardOverview from '../components/dashboard/shell/DashboardOverview';
import DashboardTopbar from '../components/dashboard/shell/DashboardTopbar';
import { getStoredUserProfile, getUserProfile, logoutUser } from '../services/authApi';
import { IncomeProvider } from '../contexts/IncomeContext';
import { NetWorthProvider } from '../contexts/NetWorthContext';
import { FinancialHealthProvider } from '../contexts/FinancialHealthContext';
import { DEFAULT_DASHBOARD_SECTION, getInitialDashboardSection, persistDashboardSection } from '../utils/dashboardDataState';
import incomeService from '../services/incomeService';
import { dashboardSectionMap } from '../components/dashboard/shell/dashboardSections';
import {
    clearQueuedPreferredNamePrompt,
    getStoredPreferredName,
    readQueuedPreferredNamePrompt,
    setStoredPreferredName,
} from '../utils/memberIdentity';

const DebtManagerPanel = lazy(() => import('../components/dashboard/debt/DebtManagerPanel'));
const BudgetDashboard = lazy(() => import('../components/dashboard/budget/BudgetDashboard'));
const UserProfilePanel = lazy(() => import('../components/dashboard/user/UserProfilePanel'));
const NetWorthDashboard = lazy(() => import('../components/dashboard/networth'));
const InvestmentTracker = lazy(() => import('../components/dashboard/investments'));
const FinancialHealthDashboard = lazy(() => import('../components/dashboard/financialhealth/FinancialHealthDashboard'));
const ProtectionPlanner = lazy(() => import('../components/dashboard/protection/ProtectionPlanner'));
const RetirementPlanner = lazy(() => import('../components/dashboard/retirement/RetirementPlanner'));
const SettingsPanel = lazy(() => import('../components/dashboard/settings/SettingsPanel'));
const ComparisonHubPanel = lazy(() => import('../components/dashboard/explore/ComparisonHubPanel'));
const ResourcesToolsPanel = lazy(() => import('../components/dashboard/explore/ResourcesToolsPanel'));
const LearningHubPanel = lazy(() => import('../components/dashboard/explore/LearningHubPanel'));
const CommunityHubPanel = lazy(() => import('../components/dashboard/explore/CommunityHubPanel'));
const MarketWatchPanel = lazy(() => import('../components/dashboard/marketwatch/MarketWatchPanel'));

const getRequestedDashboardSection = (location) => {
    const querySection = new URLSearchParams(location.search || '').get('section');
    const requestedSection = querySection || location.state?.section;
    return dashboardSectionMap[requestedSection] ? requestedSection : '';
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mainContentRef = useRef(null);
    const lastAppliedLocationKeyRef = useRef(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(() => getStoredUserProfile());
    const [preferredNamePrompt, setPreferredNamePrompt] = useState(() => readQueuedPreferredNamePrompt());
    const [activeSection, setActiveSection] = useState(() => {
        return getRequestedDashboardSection(location) || getInitialDashboardSection();
    });
    const [hasIncomeData, setHasIncomeData] = useState(false);

    useEffect(() => {
        if (lastAppliedLocationKeyRef.current === location.key) {
            return;
        }

        lastAppliedLocationKeyRef.current = location.key;
        const requestedSection = getRequestedDashboardSection(location);
        if (requestedSection) {
            setActiveSection(requestedSection);
        }
    }, [location]);

    useEffect(() => {
        const shouldRefreshPrerequisites = ['overview', 'cashflow', 'user'].includes(activeSection);
        if (!shouldRefreshPrerequisites) {
            return undefined;
        }

        let isMounted = true;
        const fetchDashboardPrerequisites = async () => {
            try {
                const [userProfile, incomeSummary] = await Promise.all([
                    getUserProfile(),
                    incomeService.getSummary().catch(() => null),
                ]);

                if (!isMounted) {
                    return;
                }

                setProfile(userProfile);
                const hasIncome = Boolean(
                    (incomeSummary?.total_income && Number(incomeSummary.total_income) > 0) ||
                    (incomeSummary?.income_count && Number(incomeSummary.income_count) > 0) ||
                    (userProfile?.profile?.monthly_income && Number(userProfile.profile.monthly_income) > 0)
                );
                setHasIncomeData(hasIncome);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            }
        };

        fetchDashboardPrerequisites();

        return () => {
            isMounted = false;
        };
    }, [activeSection]);

    useEffect(() => {
        if (activeSection === 'buddy') {
            setActiveSection('overview');
        }
    }, [activeSection]);

    useEffect(() => {
        if (!dashboardSectionMap[activeSection] || activeSection === 'buddy') {
            setActiveSection(DEFAULT_DASHBOARD_SECTION);
            return;
        }

        persistDashboardSection(activeSection);
    }, [activeSection]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const syncSidebarState = (event) => {
            if (event.matches) {
                setMobileSidebarOpen(false);
                setSidebarCollapsed(false);
            }
        };

        syncSidebarState(mediaQuery);

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', syncSidebarState);
            return () => mediaQuery.removeEventListener('change', syncSidebarState);
        }

        mediaQuery.addListener(syncSidebarState);
        return () => mediaQuery.removeListener(syncSidebarState);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        if (mobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = previousOverflow || '';
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileSidebarOpen]);

    const handleSignOut = () => {
        logoutUser();
        navigate('/signin', { replace: true });
    };
    const handleOpenWebsite = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    };

    const handleSelectSection = useCallback((sectionId) => {
        if (!dashboardSectionMap[sectionId] || sectionId === 'buddy') {
            setActiveSection(DEFAULT_DASHBOARD_SECTION);
            navigate({ pathname: location.pathname, search: `?section=${DEFAULT_DASHBOARD_SECTION}` }, { state: { section: DEFAULT_DASHBOARD_SECTION } });
            return;
        }

        setActiveSection(sectionId);
        persistDashboardSection(sectionId);
        setMobileSidebarOpen(false);

        const nextSearch = `?section=${encodeURIComponent(sectionId)}`;
        if (location.search !== nextSearch) {
            navigate({ pathname: location.pathname, search: nextSearch }, { state: { section: sectionId } });
        }

        window.requestAnimationFrame(() => {
            mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }, [location.pathname, location.search, navigate]);

    const closePreferredNamePrompt = () => {
        clearQueuedPreferredNamePrompt();
        setPreferredNamePrompt({ shouldShow: false, reason: 'returning' });
    };

    const openProfileFromPrompt = () => {
        closePreferredNamePrompt();
        handleSelectSection('user');
    };

    const sectionLoader = (
        <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <p className="text-sm font-medium text-slate-600">Loading dashboard section...</p>
        </div>
    );
    const overviewActive = activeSection === 'overview';

    const standardShell = (children) => (
        <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <div className="mx-auto max-w-7xl space-y-4">{children}</div>
        </div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardOverview user={profile} hasIncomeData={hasIncomeData} onSelectSection={handleSelectSection} onSignOut={handleSignOut} />;

            case 'cashflow':
                return standardShell(
                    <IncomeProvider>
                        <Suspense fallback={sectionLoader}>
                            <UserProfilePanel initialTab="income" onSelectSection={handleSelectSection} />
                        </Suspense>
                    </IncomeProvider>
                );

            case 'debt':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <DebtManagerPanel onSelectSection={handleSelectSection} />
                    </Suspense>
                );

            case 'budget':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <BudgetDashboard onSelectSection={handleSelectSection} />
                    </Suspense>
                );

            case 'networth':
                return (
                    <NetWorthProvider>
                        {standardShell(
                            <Suspense fallback={sectionLoader}>
                                <NetWorthDashboard />
                            </Suspense>
                        )}
                    </NetWorthProvider>
                );

            case 'investments':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <InvestmentTracker onSelectSection={handleSelectSection} />
                    </Suspense>
                );

            case 'health':
                return (
                    <FinancialHealthProvider>
                        {standardShell(
                            <Suspense fallback={sectionLoader}>
                                <FinancialHealthDashboard />
                            </Suspense>
                        )}
                    </FinancialHealthProvider>
                );

            case 'user':
                return standardShell(
                    <IncomeProvider>
                        <Suspense fallback={sectionLoader}>
                            <UserProfilePanel onSelectSection={handleSelectSection} />
                        </Suspense>
                    </IncomeProvider>
                );

            case 'settings':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <SettingsPanel user={profile} />
                    </Suspense>
                );

            case 'comparehub':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <ComparisonHubPanel />
                    </Suspense>
                );

            case 'resourceshub':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <ResourcesToolsPanel onSelectSection={handleSelectSection} />
                    </Suspense>
                );

            case 'learninghub':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <LearningHubPanel />
                    </Suspense>
                );

            case 'communityhub':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <CommunityHubPanel />
                    </Suspense>
                );

            case 'protection':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <ProtectionPlanner onSelectSection={handleSelectSection} user={profile} />
                    </Suspense>
                );

            case 'retirement':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <RetirementPlanner onSelectSection={handleSelectSection} user={profile} />
                    </Suspense>
                );

            case 'buddy':
                return standardShell(
                    <InsightPanel
                        eyebrow="Insights"
                        title="Shilingi Buddy AI"
                        description="Position Shilingi Buddy as the always-available guide that helps members interpret the dashboard and decide what to do next."
                        sections={[
                            {
                                icon: Bot,
                                title: 'Personalized nudges',
                                text: 'Prompt users when spending drifts, savings slows, or an important calendar event is getting close.',
                            },
                            {
                                icon: GraduationCap,
                                title: 'Context-aware learning',
                                text: 'Recommend videos, articles, or tools tied to the user\'s current questions and goals.',
                            },
                            {
                                icon: HeartHandshake,
                                title: 'Decision support',
                                text: 'Help members prepare for compare flows, planner updates, and next-step decisions with clearer context.',
                            },
                        ]}
                        primaryAction={{ label: 'Open profile inputs', onClick: () => handleSelectSection('user') }}
                    />
                );

            case 'marketwatch':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <MarketWatchPanel onSelectSection={handleSelectSection} />
                    </Suspense>
                );

            default:
                return <DashboardOverview user={profile} hasIncomeData={hasIncomeData} onSelectSection={handleSelectSection} onSignOut={handleSignOut} />;
        }
    };

    return (
        <div className="dashboard-brand-theme min-h-screen bg-[linear-gradient(180deg,_#f7fbf9_0%,_#eef5f3_55%,_#edf4f7_100%)] lg:h-screen lg:overflow-hidden">
            {overviewActive ? (
                <div className="lg:hidden">
                    <DashboardTopbar
                        activeSection={activeSection}
                        onSelectSection={handleSelectSection}
                        onOpenMobileMenu={() => setMobileSidebarOpen(true)}
                        onSignOut={handleSignOut}
                        user={profile}
                    />
                </div>
            ) : (
                <DashboardTopbar
                    activeSection={activeSection}
                    onSelectSection={handleSelectSection}
                    onOpenMobileMenu={() => setMobileSidebarOpen(true)}
                    onSignOut={handleSignOut}
                    user={profile}
                />
            )}

            <div className={overviewActive ? 'lg:h-screen' : 'lg:flex lg:h-[calc(100vh-92px)]'}>
                {overviewActive ? (
                    <div className="lg:hidden">
                        <DashboardSidebar
                            collapsed={sidebarCollapsed}
                            onToggle={() => setSidebarCollapsed((current) => !current)}
                            onOpenWebsite={handleOpenWebsite}
                            activeSection={activeSection}
                            onSelectSection={handleSelectSection}
                            mobileOpen={mobileSidebarOpen}
                            onCloseMobile={() => setMobileSidebarOpen(false)}
                        />
                    </div>
                ) : (
                    <DashboardSidebar
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed((current) => !current)}
                        onOpenWebsite={handleOpenWebsite}
                        activeSection={activeSection}
                        onSelectSection={handleSelectSection}
                        mobileOpen={mobileSidebarOpen}
                        onCloseMobile={() => setMobileSidebarOpen(false)}
                    />
                )}

                <main ref={mainContentRef} className="min-w-0 flex-1 pb-6 lg:h-full lg:overflow-y-auto lg:pb-0 lg:[scrollbar-gutter:stable]">
                    {renderActiveSection()}
                </main>
            </div>

            {preferredNamePrompt.shouldShow && (
                <PreferredNamePrompt
                    reason={preferredNamePrompt.reason}
                    onClose={closePreferredNamePrompt}
                    onOpenProfile={openProfileFromPrompt}
                />
            )}

            <MobileDashboardNav
                activeSection={activeSection}
                onOpenMore={() => setMobileSidebarOpen(true)}
                onSelectSection={handleSelectSection}
            />
        </div>
    );
};

const mobileDashboardNavItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'budget', label: 'Budget', icon: Calculator },
    { id: 'debt', label: 'Debt', icon: FileText },
    { id: 'investments', label: 'Investment', icon: LineChart },
];

const MobileDashboardNav = ({ activeSection, onOpenMore, onSelectSection }) => (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden">
        <div className="mx-auto flex h-16 max-w-[430px] items-stretch">
            {mobileDashboardNavItems.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;

                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onSelectSection(id)}
                        className={`flex flex-1 flex-col items-center justify-center gap-1 border-t-2 text-[10px] ${
                            isActive ? 'border-[#0c6060] text-[#0c6060]' : 'border-transparent text-[#5e5f60]'
                        }`}
                    >
                        <Icon size={22} />
                        <span>{label}</span>
                    </button>
                );
            })}
            <button
                type="button"
                onClick={onOpenMore}
                className="flex flex-1 flex-col items-center justify-center gap-1 border-t-2 border-transparent text-[10px] text-[#5e5f60]"
            >
                <MoreHorizontal size={22} />
                <span>More</span>
            </button>
        </div>
    </nav>
);

const PreferredNamePrompt = ({ reason, onClose, onOpenProfile }) => {
    const [preferredName, setPreferredName] = useState(() => getStoredPreferredName());

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextPreferredName = preferredName.trim();
        if (!nextPreferredName) return;
        setStoredPreferredName(nextPreferredName);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/38 px-4 py-6 backdrop-blur-[2px]">
            <section className="w-full max-w-md rounded-[1.4rem] border border-emerald-100 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef8f4] text-primary-700">
                        <Users size={18} />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Close preferred name reminder"
                    >
                        <X size={16} />
                    </button>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                    {reason === 'signup' ? 'Finish profile setup' : 'Profile reminder'}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">What should we call you?</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                    Add your preferred name now so your dashboard can greet you naturally while your account stays tied to your member number.
                </p>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                        Preferred name
                        <input
                            value={preferredName}
                            onChange={(event) => setPreferredName(event.target.value)}
                            placeholder="e.g. Myra"
                            autoFocus
                            className="mt-2 w-full rounded-[1rem] border border-emerald-100 px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-primary-500"
                        />
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="submit"
                            disabled={!preferredName.trim()}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[1rem] bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Save name
                            <ArrowRight size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={onOpenProfile}
                            className="inline-flex items-center justify-center rounded-[1rem] border border-emerald-100 bg-[#f6fbf8] px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-[#eef8f4]"
                        >
                            Profile
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

const HighlightsGrid = ({ items }) => (
    <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
            <article key={item} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-900">{item}</p>
            </article>
        ))}
    </section>
);

const InsightPanel = ({ eyebrow, title, description, sections, primaryAction }) => (
    <>
        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{eyebrow}</p>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">{title}</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
                </div>
                {primaryAction && (
                    <div className="flex flex-wrap gap-3 lg:justify-end">
                        <button
                            type="button"
                            onClick={primaryAction.onClick}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
                        >
                            {primaryAction.label}
                        </button>
                    </div>
                )}
            </div>
        </section>
        <section className="grid gap-4 lg:grid-cols-3">
            {sections.map(({ icon: Icon, title: cardTitle, text }) => (
                <article key={cardTitle} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="inline-flex rounded-2xl bg-primary-50 p-3 text-primary-700">
                        <Icon size={20} />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-slate-950">{cardTitle}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                </article>
            ))}
        </section>
    </>
);

export default DashboardPage;
