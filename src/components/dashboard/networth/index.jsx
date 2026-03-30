import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { useNetWorth } from '../../../contexts/NetWorthContext';
import NetWorthSummary from './NetWorthSummary';
import NetWorthChart from './NetWorthChart';
import AssetList from './AssetList';
import AssetForm from './AssetForm';
import LiabilityList from './LiabilityList';
import LiabilityForm from './LiabilityForm';

const NetWorthDashboard = () => {
    const {
        assets,
        liabilities,
        summary,
        history,
        loading,
        error,
        fetchAssets,
        fetchLiabilities,
        fetchSummary,
        fetchHistory,
        deleteAsset,
        deleteLiability
    } = useNetWorth();

    const [showAssetForm, setShowAssetForm] = useState(false);
    const [showLiabilityForm, setShowLiabilityForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedLiability, setSelectedLiability] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Initial data fetch
    useEffect(() => {
        fetchAssets();
        fetchLiabilities();
        fetchHistory(12);
    }, []);

    const handleEditAsset = (asset) => {
        setSelectedAsset(asset);
        setShowAssetForm(true);
    };

    const handleEditLiability = (liability) => {
        setSelectedLiability(liability);
        setShowLiabilityForm(true);
    };

    const handleCloseAssetForm = () => {
        setSelectedAsset(null);
        setShowAssetForm(false);
    };

    const handleCloseLiabilityForm = () => {
        setSelectedLiability(null);
        setShowLiabilityForm(false);
    };

    const handleRefresh = async () => {
        await Promise.all([
            fetchAssets(),
            fetchLiabilities(),
            fetchSummary(),
            fetchHistory(12)
        ]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white">
                                    <DollarSign size={24} />
                                </span>
                                Net Worth Tracker
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Track your financial health and wealth growth</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 mt-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                activeTab === 'overview'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('assets')}
                            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                activeTab === 'assets'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Assets
                        </button>
                        <button
                            onClick={() => setActiveTab('liabilities')}
                            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                                activeTab === 'liabilities'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Liabilities
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <NetWorthSummary summary={summary} loading={loading} />
                        <NetWorthChart history={history} loading={loading} />
                    </div>
                )}

                {/* Assets Tab */}
                {activeTab === 'assets' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Your Assets
                                    {assets.length > 0 && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({assets.length} {assets.length === 1 ? 'asset' : 'assets'})
                                        </span>
                                    )}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Manage all your valuable assets</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedAsset(null);
                                    setShowAssetForm(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={16} />
                                Add Asset
                            </button>
                        </div>

                        <AssetList
                            assets={assets}
                            onEdit={handleEditAsset}
                            onDelete={deleteAsset}
                            loading={loading}
                            currency={summary?.currency || 'KES'}
                        />
                    </div>
                )}

                {/* Liabilities Tab */}
                {activeTab === 'liabilities' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Your Liabilities
                                    {liabilities.length > 0 && (
                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                            ({liabilities.length} {liabilities.length === 1 ? 'liability' : 'liabilities'})
                                        </span>
                                    )}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Track what you owe</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedLiability(null);
                                    setShowLiabilityForm(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={16} />
                                Add Liability
                            </button>
                        </div>

                        <LiabilityList
                            liabilities={liabilities}
                            onEdit={handleEditLiability}
                            onDelete={deleteLiability}
                            loading={loading}
                            currency={summary?.currency || 'KES'}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAssetForm && (
                <AssetForm
                    asset={selectedAsset}
                    onClose={handleCloseAssetForm}
                    onSuccess={() => {}}
                />
            )}

            {showLiabilityForm && (
                <LiabilityForm
                    liability={selectedLiability}
                    onClose={handleCloseLiabilityForm}
                    onSuccess={() => {}}
                />
            )}
        </div>
    );
};

export default NetWorthDashboard;