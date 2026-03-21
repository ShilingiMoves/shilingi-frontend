import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CashflowManagerPanel from '../components/dashboard/cashflow/CashflowManagerPanel';
import DebtManagerPanel from '../components/dashboard/debt/DebtManagerPanel';
import NetWorthManagerPanel from '../components/dashboard/networth/NetWorthManagerPanel';
import DashboardSidebar from '../components/dashboard/shell/DashboardSidebar';
import UserProfilePanel from '../components/dashboard/user/UserProfilePanel';
import { getStoredUserProfile, getUserProfile, logoutUser } from '../services/authApi';

const sections = {
    debt: {
        eyebrow: 'Debt management',
        title: 'Stay on top of what you owe and make each repayment count.',
        description: 'Keep your balances, repayment amounts, and due dates in one place so you can make steady progress with less stress and more clarity.',
        component: DebtManagerPanel,
    },
    cashflow: {
        eyebrow: 'Cash flow',
        title: 'Stay close to the income shaping your month.',
        description: 'Use this view to understand how steady your inflow feels, what is supporting your month, and where stronger consistency could improve your financial confidence.',
        component: CashflowManagerPanel,
    },
    networth: {
        eyebrow: 'Net worth',
        title: 'Track what you own, what you owe, and how the gap is moving.',
        description: 'Use this workspace to review your current net worth, inspect the asset and liability breakdown, and test the live endpoints backing that balance sheet.',
        component: NetWorthManagerPanel,
    },
    user: {
        eyebrow: 'Your account',
        title: 'Keep your profile, preferences, and security settings up to date.',
        description: 'Manage the personal details and financial preferences that shape how Shilingi Moves supports you across the platform.',
        component: UserProfilePanel,
    },
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profile, setProfile] = useState(() => getStoredUserProfile());
    const [activeSection, setActiveSection] = useState('debt');

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
    }, []);

    const handleSignOut = () => {
        logoutUser();
        navigate('/signin', { replace: true });
    };

    const activeView = sections[activeSection] || sections.debt;
    const ActivePanel = activeView.component;

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

            <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">{activeView.eyebrow}</p>
                        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">{activeView.title}</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                            {activeView.description}
                        </p>
                    </section>

                    <ActivePanel />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
