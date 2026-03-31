import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DebtManagerPanel from '../components/dashboard/debt/DebtManagerPanel';
import BudgetDashboard from '../components/dashboard/budget/BudgetDashboard';
import DashboardSidebar from '../components/dashboard/shell/DashboardSidebar';
import UserProfilePanel from '../components/dashboard/user/UserProfilePanel';
import IncomeDashboard from '../components/dashboard/income';
import NetWorthDashboard from '../components/dashboard/networth';
import InvestmentTracker from '../components/dashboard/investments';
import { getStoredUserProfile, getUserProfile, logoutUser } from '../services/authApi';
import { IncomeProvider } from '../contexts/IncomeContext';
import { NetWorthProvider } from '../contexts/NetWorthContext';
import incomeService from '../services/incomeService';

const DASHBOARD_DATA_KEY = 'shilingi_has_dashboard_data';

/**
 * Determines the initial dashboard section:
 * - New users (no data yet) → 'cashflow' (Income Manager) to start adding data
 * - Returning users (have data) → 'networth' (Net Worth) to review their position
 */
function getInitialSection() {
    return localStorage.getItem(DASHBOARD_DATA_KEY) === 'true' ? 'networth' : 'cashflow';
}

/** Mark that the user has interacted with the dashboard */
export function markDashboardDataExists() {
    localStorage.setItem(DASHBOARD_DATA_KEY, 'true');
}

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profile, setProfile] = useState(() => getStoredUserProfile());
    const [activeSection, setActiveSection] = useState(getInitialSection);
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

    const handleSignOut = () => {
        logoutUser();
        navigate('/signin', { replace: true });
    };

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
                        <DebtManagerPanel requestAddDebtSignal={debtActionNonce} />
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
                        <BudgetDashboard activeTab={budgetActiveTab} onTabChange={setBudgetActiveTab} />
                    </>
                );

            case 'cashflow':
                return (
                    <IncomeProvider>
                        <IncomeDashboard />
                    </IncomeProvider>
                );

            case 'networth':
                return (
                    <NetWorthProvider>
                        <NetWorthDashboard />
                    </NetWorthProvider>
                );

            case 'investments':
                return <InvestmentTracker />;

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
                        <UserProfilePanel />
                    </>
                );

            default:
                return (
                    <IncomeProvider>
                        <IncomeDashboard />
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
            />

            <main className="flex-1 lg:overflow-y-auto">
                {(activeSection === 'cashflow' || activeSection === 'networth' || activeSection === 'investments') ? (
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
