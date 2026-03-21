import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, Loader2, Plus } from 'lucide-react';
import Button from '../../Button';
import NetWorthBreakdownCard from './NetWorthBreakdownCard';
import NetWorthEntryModal from './NetWorthEntryModal';
import NetWorthSummaryCards from './NetWorthSummaryCards';
import {
    createAsset,
    createLiability,
    deleteAsset,
    deleteLiability,
    getAssetCategories,
    getAssets,
    getLiabilities,
    getLiabilityCategories,
    getNetWorthBreakdown,
    getNetWorthSummary,
    updateAsset,
    updateLiability,
} from '../../../services/networthApi';

const emptySummary = {
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    currency: 'KES',
};

const emptyBreakdown = {
    summary: { netWorth: 0 },
    assets: { manual: [], fromGoals: [] },
    liabilities: { debts: [], other: [] },
    currency: 'KES',
};

const NetWorthManagerPanel = () => {
    const [summary, setSummary] = useState(emptySummary);
    const [breakdown, setBreakdown] = useState(emptyBreakdown);
    const [assetCategories, setAssetCategories] = useState([]);
    const [liabilityCategories, setLiabilityCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [entryKind, setEntryKind] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadFinancials = async () => {
        const [summaryData, breakdownData, assetData, liabilityData] = await Promise.all([
            getNetWorthSummary(),
            getNetWorthBreakdown(),
            getAssets(),
            getLiabilities(),
        ]);

        setSummary(summaryData);
        setBreakdown(breakdownData);
    };

    const loadWorkspace = async () => {
        try {
            setLoading(true);
            setError('');

            const [assetCategoryData, liabilityCategoryData] = await Promise.all([
                getAssetCategories(),
                getLiabilityCategories(),
            ]);

            setAssetCategories(assetCategoryData);
            setLiabilityCategories(liabilityCategoryData);

            await loadFinancials();
        } catch (err) {
            setError(err.message || 'We could not load your net worth workspace right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspace();
    }, []);

    const closeModal = (force = false) => {
        if (isSubmitting && !force) {
            return;
        }

        setIsModalOpen(false);
        setEditingItem(null);
        setEntryKind('');
        setSubmitError('');
    };

    const handleSubmit = async (formValues) => {
        try {
            setIsSubmitting(true);
            setSubmitError('');

            if (entryKind === 'asset') {
                if (editingItem) {
                    await updateAsset(editingItem.id, formValues);
                } else {
                    await createAsset(formValues);
                }
            } else if (entryKind === 'liability') {
                if (editingItem) {
                    await updateLiability(editingItem.id, formValues);
                } else {
                    await createLiability(formValues);
                }
            }

            await loadFinancials();
            closeModal(true);
        } catch (err) {
            setSubmitError(err.message || `We could not save this ${entryKind || 'net worth entry'} right now.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
                    <p className="mt-4 text-sm font-medium text-slate-600">Loading your Net Worth overview...</p>
                </div>
            </div>
        );
    }

    const currentCategories = entryKind === 'asset' ? assetCategories : liabilityCategories;
    const showCategoryIdNotice = currentCategories.some((category) => category.usesDerivedId);

    return (
        <div className="mx-auto max-w-[1400px] space-y-10 pb-20">
            <NetWorthEntryModal
                isOpen={isModalOpen}
                kind={entryKind}
                categories={currentCategories}
                initialValues={editingItem}
                onSubmit={handleSubmit}
                onClose={closeModal}
                isSubmitting={isSubmitting}
                showCategoryIdNotice={showCategoryIdNotice}
            />

            {/* Back Button Area */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-800"
                >
                    <ChevronLeft size={20} />
                    Back
                </button>
                
                {/* Manual Add buttons hidden to mirror Zurit's automated approach */}
                <div className="hidden flex gap-3">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="rounded-full shadow-lg transition hover:scale-105"
                        onClick={() => {
                            setEntryKind('asset');
                            setEditingItem(null);
                            setSubmitError('');
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        Add Asset
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-full shadow-lg transition hover:scale-105"
                        onClick={() => {
                            setEntryKind('liability');
                            setEditingItem(null);
                            setSubmitError('');
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        Add Liability
                    </Button>
                </div>
            </div>


            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">We could not load your net worth view.</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {submitError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">A request did not complete.</p>
                            <p className="mt-1">{submitError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Overview */}
            <div className="mx-auto max-w-5xl">
                <NetWorthSummaryCards summary={summary} />
            </div>

            {/* Detailed Breakdown Tables */}
            <div className="mt-12">
                <NetWorthBreakdownCard breakdown={breakdown} />
            </div>
        </div>
    );
};

export default NetWorthManagerPanel;

