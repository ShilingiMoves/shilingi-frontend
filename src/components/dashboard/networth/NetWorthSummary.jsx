import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, AlertCircle, Target } from 'lucide-react';
import NetWorthStatCard from './NetWorthStatCard';

const NetWorthSummary = ({ summary, loading }) => {
    if (!summary && !loading) {
        return null;
    }

    const netWorth = parseFloat(summary?.net_worth || 0);
    const totalAssets = parseFloat(summary?.total_assets || 0);
    const totalLiabilities = parseFloat(summary?.total_liabilities || 0);
    const liquidAssets = parseFloat(summary?.liquid_assets || 0);
    const change30d = summary?.change_30d;
    const changePercentage = summary?.change_percentage_30d;

    const getNetWorthColor = () => {
        if (netWorth > 0) return 'text-green-600';
        if (netWorth < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getNetWorthTrend = () => {
        if (changePercentage > 0) return 'up';
        if (changePercentage < 0) return 'down';
        return 'neutral';
    };

    return (
        <div className="space-y-6">
            {/* Main Net Worth Card */}
            <div className={`bg-gradient-to-br ${
                netWorth >= 0 
                    ? 'from-green-50 to-green-100 border-green-200' 
                    : 'from-red-50 to-red-100 border-red-200'
            } rounded-2xl p-8 border-2`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Your Net Worth</p>
                        <h2 className={`text-4xl font-bold ${getNetWorthColor()}`}>
                            {netWorth < 0 && '-'}{summary?.currency || 'KES'} {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(Math.abs(netWorth))}
                        </h2>
                    </div>
                    <div className={`p-4 rounded-xl ${netWorth >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                        {netWorth >= 0 ? (
                            <TrendingUp className="text-white" size={32} />
                        ) : (
                            <TrendingDown className="text-white" size={32} />
                        )}
                    </div>
                </div>

                {change30d !== null && change30d !== undefined && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300">
                        <span className={`text-lg font-semibold ${
                            change30d >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {change30d >= 0 ? '+' : ''}{summary?.currency || 'KES'} {new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(Math.abs(change30d))}
                        </span>
                        <span className={`text-sm font-medium ${
                            changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            ({changePercentage >= 0 ? '+' : ''}{changePercentage?.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-gray-600">in the last 30 days</span>
                    </div>
                )}
            </div>

            {/* Assets and Liabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NetWorthStatCard
                    title="Total Assets"
                    value={totalAssets}
                    currency={summary?.currency || 'KES'}
                    icon={<Briefcase />}
                    trend="up"
                    subtitle={`${summary?.assets_count || 0} assets tracked`}
                    loading={loading}
                    valueColor="text-green-600"
                />

                <NetWorthStatCard
                    title="Total Liabilities"
                    value={totalLiabilities}
                    currency={summary?.currency || 'KES'}
                    icon={<AlertCircle />}
                    trend="down"
                    subtitle={`${summary?.liabilities_count || 0} liabilities + ${summary?.debts_count || 0} debts`}
                    loading={loading}
                    valueColor="text-red-600"
                />
            </div>

            {/* Detailed Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Liquid Assets */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <DollarSign className="text-white" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                            Liquid
                        </span>
                    </div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Liquid Assets</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {summary?.currency || 'KES'} {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(liquidAssets)}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">Quick access cash</p>
                </div>

                {/* From Debts Module */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                            <AlertCircle className="text-white" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
                            Debts
                        </span>
                    </div>
                    <p className="text-sm font-medium text-orange-900 mb-1">From Debt Manager</p>
                    <p className="text-2xl font-bold text-orange-900">
                        {summary?.currency || 'KES'} {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(parseFloat(summary?.debt_from_module || 0))}
                    </p>
                    <p className="text-xs text-orange-700 mt-2">{summary?.debts_count || 0} active debts</p>
                </div>

                {/* From Goals */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <Target className="text-white" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                            Goals
                        </span>
                    </div>
                    <p className="text-sm font-medium text-purple-900 mb-1">From Financial Goals</p>
                    <p className="text-2xl font-bold text-purple-900">
                        {summary?.currency || 'KES'} {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(parseFloat(summary?.savings_from_goals || 0))}
                    </p>
                    <p className="text-xs text-purple-700 mt-2">{summary?.goals_contributing || 0} active goals</p>
                </div>
            </div>

            {/* Breakdown by Category */}
            {/* {summary?.assets_breakdown && Object.keys(summary.assets_breakdown).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Assets by Category</h3>
                    <div className="space-y-3">
                        {Object.entries(summary.assets_breakdown).map(([category, amount]) => {
                            const percentage = totalAssets > 0 ? (parseFloat(amount) / totalAssets) * 100 : 0;
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-900">{category}</span>
                                        <span className="font-bold text-gray-900">
                                            {summary?.currency || 'KES'} {new Intl.NumberFormat('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(parseFloat(amount))}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default NetWorthSummary;