import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BarChart3,
    BookMarked,
    Bot,
    Calculator,
    CheckCircle2,
    GraduationCap,
    HeartHandshake,
    Shield,
    Users,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/shell/DashboardSidebar';
import DashboardOverview from '../components/dashboard/shell/DashboardOverview';
import DashboardTopbar from '../components/dashboard/shell/DashboardTopbar';
import { getStoredUserProfile, getUserProfile, logoutUser } from '../services/authApi';
import { IncomeProvider } from '../contexts/IncomeContext';
import { NetWorthProvider } from '../contexts/NetWorthContext';
import { FinancialHealthProvider } from '../contexts/FinancialHealthContext';
import { getInitialDashboardSection } from '../utils/dashboardDataState';
import { dashboardSectionMap } from '../components/dashboard/shell/dashboardSections';
import incomeService from '../services/incomeService';

const DebtManagerPanel = lazy(() => import('../components/dashboard/debt/DebtManagerPanel'));
const BudgetDashboard = lazy(() => import('../components/dashboard/budget/BudgetDashboard'));
const UserProfilePanel = lazy(() => import('../components/dashboard/user/UserProfilePanel'));
const IncomeDashboard = lazy(() => import('../components/dashboard/income'));
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

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(() => getStoredUserProfile());
    const [activeSection, setActiveSection] = useState(getInitialDashboardSection);
    const [hasIncomeData, setHasIncomeData] = useState(false);

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

    const handleSignOut = () => {
        logoutUser();
        navigate('/signin', { replace: true });
    };

    const sectionLoader = (
        <div className="flex min-h-[260px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <p className="text-sm font-medium text-slate-600">Loading dashboard section...</p>
        </div>
    );

    const standardShell = (children) => (
        <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <div className="mx-auto max-w-7xl space-y-4">{children}</div>
        </div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardOverview user={profile} hasIncomeData={hasIncomeData} onSelectSection={setActiveSection} />;

            case 'cashflow':
                return (
                    <IncomeProvider>
                        <Suspense fallback={sectionLoader}>
                            <IncomeDashboard />
                        </Suspense>
                    </IncomeProvider>
                );

            case 'debt':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <DebtManagerPanel />
                    </Suspense>
                );

            case 'budget':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <BudgetDashboard />
                    </Suspense>
                );

            case 'networth':
                return (
                    <NetWorthProvider>
                        {standardShell(
                            <>
                                <SectionHero
                                    eyebrow="Net worth planner"
                                    title="Keep the bigger financial picture in view."
                                    text="Bring your assets and liabilities together so every budgeting, debt, and investment decision connects back to your long-term position."
                                    variant="brand"
                                />
                                <Suspense fallback={sectionLoader}>
                                    <NetWorthDashboard />
                                </Suspense>
                            </>
                        )}
                    </NetWorthProvider>
                );

            case 'investments':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <InvestmentTracker />
                    </Suspense>
                );

            case 'health':
                return (
                    <FinancialHealthProvider>
                        {standardShell(
                            <>
                                <SectionHero
                                    eyebrow="Planner"
                                    title="See the areas that need your attention next."
                                    text="Your planner keeps your financial health visible so you can rebalance cash flow, debt, protection, and long-term goals before small gaps become bigger issues."
                                />
                                <Suspense fallback={sectionLoader}>
                                    <FinancialHealthDashboard />
                                </Suspense>
                            </>
                        )}
                    </FinancialHealthProvider>
                );

            case 'user':
                return standardShell(
                    <>
                        <SectionHero
                            eyebrow="Profile"
                            title="Shape the planning inputs that power your dashboard."
                            text="Keep your income manager current, define goals across time horizons, and optionally add dependents or family context."
                        />
                        <Suspense fallback={sectionLoader}>
                            <UserProfilePanel />
                        </Suspense>
                    </>
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
                        <ResourcesToolsPanel />
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
                        <ProtectionPlanner />
                    </Suspense>
                );

            case 'retirement':
                return standardShell(
                    <Suspense fallback={sectionLoader}>
                        <RetirementPlanner />
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
                                text: 'Help members prepare for compare flows, planner updates, and advisor conversations with clearer context.',
                            },
                        ]}
                        primaryAction={{ label: 'Open profile inputs', onClick: () => setActiveSection('user') }}
                    />
                );

            case 'marketwatch':
                return standardShell(
                    <InsightPanel
                        eyebrow="Insights"
                        title="Market Watch"
                        description="Keep macro and product-level changes connected to the user's planning decisions so insights feel practical instead of abstract."
                        sections={[
                            {
                                icon: BarChart3,
                                title: 'Rates and product signals',
                                text: 'Show movements in savings, MMFs, lending rates, and product trends that may affect choices.',
                            },
                            {
                                icon: Users,
                                title: 'What it means for members',
                                text: 'Translate market shifts into plain next steps for savers, borrowers, investors, and households.',
                            },
                            {
                                icon: ArrowRight,
                                title: 'Connected actions',
                                text: 'Link straight into Compare Hub, planners, and Learning Hub when action is needed.',
                            },
                        ]}
                        primaryAction={{ label: 'Open Compare Hub', onClick: () => setActiveSection('comparehub') }}
                    />
                );

            default:
                return <DashboardOverview user={profile} hasIncomeData={hasIncomeData} onSelectSection={setActiveSection} />;
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f7fbf9_0%,_#eef5f3_55%,_#edf4f7_100%)]">
            <DashboardTopbar
                activeSection={activeSection}
                onSelectSection={setActiveSection}
                onOpenMobileMenu={() => setMobileSidebarOpen(true)}
                onSignOut={handleSignOut}
                user={profile}
            />

            <div className="lg:flex">
                <DashboardSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed((current) => !current)}
                    onSignOut={handleSignOut}
                    activeSection={activeSection}
                    onSelectSection={setActiveSection}
                    mobileOpen={mobileSidebarOpen}
                    onCloseMobile={() => setMobileSidebarOpen(false)}
                />

                <main className="min-w-0 flex-1 lg:overflow-y-auto">
                    <div className="hidden border-b border-emerald-100/80 bg-white/80 px-4 py-2.5 text-sm text-slate-500 backdrop-blur lg:block">
                        <div className="mx-auto max-w-7xl">
                            {dashboardSectionMap[activeSection]?.helper || 'Private dashboard workspace'}
                        </div>
                    </div>

                    {renderActiveSection()}
                </main>
            </div>
        </div>
    );
};

const SectionHero = ({ eyebrow, title, text, primaryAction, secondaryAction, variant = 'default' }) => (
    <section
        className={
            variant === 'brand'
                ? 'rounded-[1.4rem] bg-gradient-to-r from-[#0f6b5b] via-[#1a7b67] to-[#2b8f78] px-5 py-5 text-white shadow-sm'
                : 'rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm'
        }
    >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
                <p className={variant === 'brand' ? 'text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100' : 'text-sm font-semibold uppercase tracking-[0.3em] text-primary-700'}>{eyebrow}</p>
                <h1 className={variant === 'brand' ? 'mt-3 text-4xl font-extrabold tracking-tight text-white' : 'mt-3 text-4xl font-extrabold tracking-tight text-slate-950'}>{title}</h1>
                <p className={variant === 'brand' ? 'mt-3 text-sm leading-7 text-white/85 sm:text-base' : 'mt-3 text-sm leading-7 text-slate-600 sm:text-base'}>{text}</p>
            </div>

            {(primaryAction || secondaryAction) && (
                <div className="flex flex-wrap gap-3 lg:justify-end">
                    {primaryAction && (
                        <button
                            type="button"
                            onClick={primaryAction.onClick}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
                        >
                            {primaryAction.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            type="button"
                            onClick={secondaryAction.onClick}
                            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-300/40 transition-colors hover:bg-amber-300"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    </section>
);

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
        <SectionHero eyebrow={eyebrow} title={title} text={description} primaryAction={primaryAction} />
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
