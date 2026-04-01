import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/shell/DashboardSidebar';
import { getStoredUserProfile, getUserProfile, logoutUser } from '../services/authApi';
import { IncomeProvider } from '../contexts/IncomeContext';
import { NetWorthProvider } from '../contexts/NetWorthContext';
import { FinancialHealthProvider } from '../contexts/FinancialHealthContext';
import incomeService from '../services/incomeService';
import { DASHBOARD_DATA_KEY, getInitialDashboardSection, markDashboardDataExists } from '../utils/dashboardDataState';

const DebtManagerPanel = lazy(() => import('../components/dashboard/debt/DebtManagerPanel'));
const BudgetDashboard = lazy(() => import('../components/dashboard/budget/BudgetDashboard'));
const UserProfilePanel = lazy(() => import('../components/dashboard/user/UserProfilePanel'));
const IncomeDashboard = lazy(() => import('../components/dashboard/income'));
const NetWorthDashboard = lazy(() => import('../components/dashboard/networth'));
const InvestmentTracker = lazy(() => import('../components/dashboard/investments'));
const FinancialHealthDashboard = lazy(() => import('../components/dashboard/financialhealth/FinancialHealthDashboard'));

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(() => getStoredUserProfile());
    const [activeSection, setActiveSection] = useState(getInitialDashboardSection);
    const [budgetActiveTab, setBudgetActiveTab] = useState('overview');
    const [debtActionNonce, setDebtActionNonce] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userProfile = await getUserProfile();
                setProfile(userProfile);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
            }
        };

        fetchProfile();

        // On mount, verify the data flag by checking if the user actually has income data.
        // This handles edge cases like cleared localStorage but existing backend data.
        const verifyUserData = async () => {
            try {
                const summary = await incomeService.getSummary();
                const hasData = summary && (
                    (summary.total_income && Number(summary.total_income) > 0) ||
                    (summary.income_count && Number(summary.income_count) > 0)
                );
                if (hasData) {
                    markDashboardDataExists();
                    // Only update section if the user hasn't already navigated away
                    setActiveSection(prev => prev === 'cashflow' && localStorage.getItem(DASHBOARD_DATA_KEY) === 'true' ? 'networth' : prev);
                }
            } catch (err) {
                // Non-critical — if the check fails, we just keep the current section
                console.error('Data verification check failed:', err);
            }
        };

        verifyUserData();
    }, []);

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

    // Render active section with proper context wrapping
    const renderActiveSection = () => {
        switch (activeSection) {
            case 'debt':
                return (
                    <>
                        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">
                                        Debt management
                                    </p>
                                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
                                        Stay on top of what you owe and make each repayment count.
                                    </h1>
                                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                                        Keep your balances, repayment amounts, and due dates in one place so you can make steady progress with less stress and more clarity.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setDebtActionNonce((current) => current + 1)}
                                    className="inline-flex items-center gap-2 self-start rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
                                >
                                    <Plus size={16} />
                                    Add Debt
                                </button>
                            </div>
                        </section>
                        <Suspense fallback={sectionLoader}>
                            <DebtManagerPanel requestAddDebtSignal={debtActionNonce} />
                        </Suspense>
                    </>
                );

            case 'budget':
                return (
                    <>
                        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">
                                        Budget & Spending
                                    </p>
                                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
                                        Take control of your money with smart budgeting and expense tracking.
                                    </h1>
                                    <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                                        Set spending limits, track expenses in real-time, and work towards your financial goals with clarity and confidence.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 lg:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setBudgetActiveTab('expenses')}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
                                    >
                                        <Plus size={16} />
                                        Add Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBudgetActiveTab('budgets')}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-300/40 transition-colors hover:bg-amber-300"
                                    >
                                        <Plus size={16} />
                                        Add Budget
                                    </button>
                                </div>
                            </div>
                        </section>
                        <Suspense fallback={sectionLoader}>
                            <BudgetDashboard activeTab={budgetActiveTab} onTabChange={setBudgetActiveTab} />
                        </Suspense>
                    </>
                );

            case 'cashflow':
                return (
                    <IncomeProvider>
                        <Suspense fallback={sectionLoader}>
                            <IncomeDashboard />
                        </Suspense>
                    </IncomeProvider>
                );

            case 'networth':
                return (
                    <NetWorthProvider>
                        <Suspense fallback={sectionLoader}>
                            <NetWorthDashboard />
                        </Suspense>
                    </NetWorthProvider>
                );

            case 'investments':
                return (
                    <Suspense fallback={sectionLoader}>
                        <InvestmentTracker />
                    </Suspense>
                );

            case 'health':
                return (
                    <FinancialHealthProvider>
                        <Suspense fallback={sectionLoader}>
                            <FinancialHealthDashboard />
                        </Suspense>
                    </FinancialHealthProvider>
                );

            case 'user':
                return (
                    <>
                        <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">
                                Your account
                            </p>
                            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
                                Keep your profile, preferences, and security settings up to date.
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                                Manage the personal details and financial preferences that shape how Shilingi Moves supports you across the platform.
                            </p>
                        </section>
                        <Suspense fallback={sectionLoader}>
                            <UserProfilePanel />
                        </Suspense>
                    </>
                );

            default:
                return (
                    <IncomeProvider>
                        <Suspense fallback={sectionLoader}>
                            <IncomeDashboard />
                        </Suspense>
                    </IncomeProvider>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)] lg:flex">
            <DashboardSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((current) => !current)}
                onSignOut={handleSignOut}
                user={profile}
                activeSection={activeSection}
                onSelectSection={setActiveSection}
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            <main className="min-w-0 flex-1 lg:overflow-y-auto">
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100"
                    >
                        <Menu size={18} />
                        Dashboard Menu
                    </button>
                    <p className="truncate text-sm font-semibold text-slate-600">
                        {activeSection === 'cashflow' ? 'Income Manager' :
                            activeSection === 'budget' ? 'Budget & Planning' :
                                activeSection === 'debt' ? 'Debt Management' :
                                    activeSection === 'investments' ? 'Investment Planner' :
                                        activeSection === 'networth' ? 'Net Worth' :
                                            activeSection === 'health' ? 'Financial Health' : 'Your Account'}
                    </p>
                </div>

                {(activeSection === 'cashflow' ||
                    activeSection === 'networth' ||
                    activeSection === 'investments' ||
                    activeSection === 'health') ? (
                    renderActiveSection()
                ) : (
                    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {renderActiveSection()}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;

