import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/budgetHelpers';

const BudgetOverview = ({ summary, budgets, expenses, expenseTotal, goals, goalSummary, budgetHealth, onNavigate }) => {
    // Chart colors
    const COLORS = {
        spent: '#ef4444',
        remaining: '#10b981',
        warning: '#f59e0b',
    };

    // Prepare pie chart data
    const budgetPieData = [
        { name: 'Spent', value: summary.total_spent, color: COLORS.spent },
        { name: 'Remaining', value: Math.max(0, summary.total_remaining), color: COLORS.remaining },
    ];

    // Prepare category breakdown for bar chart
    const categoryData = summary.budgets?.slice(0, 5).map(b => ({
        name: b.category.length > 10 ? b.category.substring(0, 10) + '...' : b.category,
        budgeted: b.budgeted,
        spent: b.spent,
    })) || [];

    const getStatusColor = (percentage) => {
        if (percentage >= 100) return 'rose';
        if (percentage >= 80) return 'amber';
        return 'emerald';
    };

    const statusColor = getStatusColor(summary.overall_spent_percentage);

    return (
        <div className="space-y-6">
            {/* Top Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Budget */}
                <div className="group cursor-pointer rounded-[1.75rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-all hover:shadow-lg">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-indigo-600">Total Budget</span>
                        <div className="rounded-xl bg-indigo-100 p-2">
                            <TrendingUp size={16} className="text-indigo-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900">
                        {formatCurrency(summary.total_budget, summary.currency)}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600">
                        {summary.active_budgets_count} active budget{summary.active_budgets_count !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Total Spent */}
                <div className={`group cursor-pointer rounded-[1.75rem] border border-${statusColor}-100 bg-gradient-to-br from-${statusColor}-50 to-white p-6 shadow-sm transition-all hover:shadow-lg`}>
                    <div className="mb-3 flex items-center justify-between">
                        <span className={`text-sm font-semibold text-${statusColor}-600`}>Total Spent</span>
                        <div className={`rounded-xl bg-${statusColor}-100 p-2`}>
                            <TrendingDown size={16} className={`text-${statusColor}-600`} />
                        </div>
                    </div>
                    <h3 className={`text-3xl font-bold text-${statusColor}-900`}>
                        {formatCurrency(summary.total_spent, summary.currency)}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                            <div
                                className={`h-full bg-${statusColor}-500 transition-all duration-500`}
                                style={{ width: `${Math.min(summary.overall_spent_percentage, 100)}%` }}
                            />
                        </div>
                        <span className={`text-xs font-bold text-${statusColor}-700`}>
                            {summary.overall_spent_percentage.toFixed(0)}%
                        </span>
                    </div>
                </div>

                {/* Remaining */}
                <div className={`group cursor-pointer rounded-[1.75rem] border ${summary.total_remaining >= 0 ? 'border-emerald-100 bg-gradient-to-br from-emerald-50' : 'border-rose-100 bg-gradient-to-br from-rose-50'} to-white p-6 shadow-sm transition-all hover:shadow-lg`}>
                    <div className="mb-3 flex items-center justify-between">
                        <span className={`text-sm font-semibold ${summary.total_remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {summary.total_remaining >= 0 ? 'Remaining' : 'Over Budget'}
                        </span>
                        <div className={`rounded-xl ${summary.total_remaining >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} p-2`}>
                            {summary.total_remaining >= 0 ? (
                                <TrendingDown size={16} className="text-emerald-600" />
                            ) : (
                                <TrendingUp size={16} className="text-rose-600" />
                            )}
                        </div>
                    </div>
                    <h3 className={`text-3xl font-bold ${summary.total_remaining >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {formatCurrency(Math.abs(summary.total_remaining), summary.currency)}
                    </h3>
                    <p className={`mt-2 text-xs ${summary.total_remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {summary.total_remaining >= 0 ? 'Available to spend' : 'Exceeded limit'}
                    </p>
                </div>

                {/* Goals Progress */}
                <div className="group cursor-pointer rounded-[1.75rem] border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-all hover:shadow-lg"
                    onClick={() => onNavigate('goals')}>
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-purple-600">Goals Progress</span>
                        <div className="rounded-xl bg-purple-100 p-2">
                            <Target size={16} className="text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-purple-900">
                        {goalSummary?.overall_progress || 0}%
                    </h3>
                    <p className="mt-2 text-xs text-slate-600">
                        {goalSummary?.active_goals || 0} active goal{(goalSummary?.active_goals || 0) !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Budget Distribution Pie Chart */}
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-lg font-bold text-slate-900">Budget vs Spending</h3>
                    {summary.total_budget > 0 ? (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={budgetPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {budgetPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                                        <span className="text-sm font-medium text-slate-700">Spent</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {formatCurrency(summary.total_spent, summary.currency)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm font-medium text-slate-700">Remaining</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {formatCurrency(Math.max(0, summary.total_remaining), summary.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                            No budget data available
                        </div>
                    )}
                </div>

                {/* Category Breakdown Bar Chart */}
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-lg font-bold text-slate-900">Top Categories</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value, summary.currency)}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="budgeted" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Budgeted" />
                                <Bar dataKey="spent" fill="#ef4444" radius={[8, 8, 0, 0]} name="Spent" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                            No category data available
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 sm:grid-cols-3">
                <button
                    onClick={() => onNavigate('budgets')}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
                >
                    <div>
                        <p className="text-sm font-semibold text-slate-600">Manage Budgets</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{budgets.length}</p>
                    </div>
                    <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                    onClick={() => onNavigate('expenses')}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
                >
                    <div>
                        <p className="text-sm font-semibold text-slate-600">View Expenses</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(expenseTotal, summary.currency)}</p>
                    </div>
                    <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                    onClick={() => onNavigate('goals')}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
                >
                    <div>
                        <p className="text-sm font-semibold text-slate-600">Track Goals</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{goals.length} Active</p>
                    </div>
                    <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default BudgetOverview;