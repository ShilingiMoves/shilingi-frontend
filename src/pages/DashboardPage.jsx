import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    Plus, 
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import Button from '../components/Button';

const DEFAULT_BACKEND_URL = 'https://shilingibackend-production.up.railway.app';

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const BACKEND_URL = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');
useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // In a real app, you'd include the Authorization header
                const response = await fetch(`${BACKEND_URL}/api/dashboard/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load dashboard data. Please check your backend connection.');
                
                // Fallback mock data for demonstration
                setData({
                    user: { name: 'Kenyan Saver' },
                    balance: 45200.50,
                    income: 75000,
                    expenses: 29799.50,
                    goals: [
                        { id: 1, name: 'Emergency Fund', target: 100000, current: 45000 },
                        { id: 2, name: 'Holiday Trip', target: 50000, current: 15000 },
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {data?.user?.name}!</h1>
                        <p className="text-gray-600">Here's your financial overview for today.</p>
                    </div>
                    <Button variant="primary" className="inline-flex items-center gap-2">
                        <Plus size={20} />
                        <span>Add Transaction</span>
                    </Button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
                        <AlertCircle size={20} />
                        <p className="text-sm">{error} (Showing demo data instead)</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Current Balance" 
                        amount={data?.balance} 
                        icon={<Wallet className="text-primary-600" />}
                        trend="+12% from last month"
                        isPositive={true}
                    />
                    <StatCard 
                        title="Monthly Income" 
                        amount={data?.income} 
                        icon={<TrendingUp className="text-emerald-600" />}
                        trend="On track"
                        isPositive={true}
                    />
                    <StatCard 
                        title="Monthly Expenses" 
                        amount={data?.expenses} 
                        icon={<TrendingDown className="text-rose-600" />}
                        trend="15% of budget left"
                        isPositive={false}
                    />
                </div>

                {/* Goals & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Financial Goals */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Your Savings Goals</h2>
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold">View All</button>
                        </div>
                        <div className="space-y-6">
                            {data?.goals?.map(goal => (
                                <div key={goal.id}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium text-gray-700">{goal.name}</span>
                                        <span className="text-gray-500 text-sm">KSh {goal.current.toLocaleString()} / KSh {goal.target.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div 
                                            className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${(goal.current / goal.target) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-primary-900 rounded-2xl shadow-sm p-6 text-white">
                        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickAction icon={<LayoutDashboard />} label="Budgeting" />
                            <QuickAction icon={<TrendingUp />} label="Investments" />
                            <QuickAction icon={<Wallet />} label="Loans" />
                            <QuickAction icon={<ArrowRight />} label="Compare" />
                        </div>
                        <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10">
                            <p className="text-primary-100 text-sm mb-4">
                                "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."
                            </p>
                            <p className="text-xs font-bold uppercase tracking-wider">— Albert Einstein</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, amount, icon, trend, isPositive }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
                {icon}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
                {trend}
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-extrabold text-gray-900">
            KSh {amount?.toLocaleString() || '0.00'}
        </p>
    </div>
);

const QuickAction = ({ icon, label }) => (
    <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors gap-2">
        <div className="text-primary-400">
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className="text-sm font-medium">{label}</span>
    </button>
);

export default DashboardPage;


