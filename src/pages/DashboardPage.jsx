import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DebtManagerPanel from '../components/dashboard/debt/DebtManagerPanel';
import DashboardSidebar from '../components/dashboard/shell/DashboardSidebar';
import { getUserProfile, logoutUser } from '../services/authApi';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userProfile = await getUserProfile();
                setProfile(userProfile);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                // Redirect to sign in if not authenticated
                if (err.message.includes('token') || err.message.includes('401') || err.message.includes('Unauthorized')) {
                    navigate('/signin');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleSignOut = () => {
        logoutUser();
        navigate('/signin');
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef4f8_100%)] lg:flex">
            <DashboardSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((current) => !current)}
                onSignOut={handleSignOut}
                user={profile}
            />

            <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-700">Debt management</p>
                        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">Stay on top of what you owe and make each repayment count.</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                            Keep your balances, repayment amounts, and due dates in one place so you can make steady progress with less stress and more clarity.
                        </p>
                    </section>

                    <DebtManagerPanel />
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
