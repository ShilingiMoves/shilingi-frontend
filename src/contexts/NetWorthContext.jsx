import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import networthService from '../services/networthService';

const NetWorthContext = createContext();

export const useNetWorth = () => {
    const context = useContext(NetWorthContext);
    if (!context) {
        throw new Error('useNetWorth must be used within NetWorthProvider');
    }
    return context;
};

export const NetWorthProvider = ({ children }) => {
    const [assetCategories, setAssetCategories] = useState([]);
    const [liabilityCategories, setLiabilityCategories] = useState([]);
    const [assets, setAssets] = useState([]);
    const [liabilities, setLiabilities] = useState([]);
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ========== ASSET CATEGORIES ==========
    const fetchAssetCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await networthService.getAssetCategories();
            setAssetCategories(data.categories || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching asset categories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== LIABILITY CATEGORIES ==========
    const fetchLiabilityCategories = useCallback(async () => {
        try {
            setLoading(true);
            const data = await networthService.getLiabilityCategories();
            setLiabilityCategories(data.categories || []);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching liability categories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== ASSETS ==========
    const fetchAssets = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            const data = await networthService.getAssets(filters);
            setAssets(data.assets || []);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching assets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createAsset = useCallback(async (assetData) => {
        try {
            setLoading(true);
            const newAsset = await networthService.createAsset(assetData);
            await Promise.all([fetchAssets(), fetchSummary()]);
            setError(null);
            return newAsset;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAsset = useCallback(async (uuid, assetData) => {
        try {
            setLoading(true);
            const updated = await networthService.updateAsset(uuid, assetData);
            await Promise.all([fetchAssets(), fetchSummary()]);
            setError(null);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAsset = useCallback(async (uuid) => {
        try {
            setLoading(true);
            await networthService.deleteAsset(uuid);
            setAssets(prev => prev.filter(asset => asset.uuid !== uuid));
            await fetchSummary();
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== LIABILITIES ==========
    const fetchLiabilities = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            const data = await networthService.getLiabilities(filters);
            setLiabilities(data.liabilities || []);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching liabilities:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createLiability = useCallback(async (liabilityData) => {
        try {
            setLoading(true);
            const newLiability = await networthService.createLiability(liabilityData);
            await Promise.all([fetchLiabilities(), fetchSummary()]);
            setError(null);
            return newLiability;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateLiability = useCallback(async (uuid, liabilityData) => {
        try {
            setLoading(true);
            const updated = await networthService.updateLiability(uuid, liabilityData);
            await Promise.all([fetchLiabilities(), fetchSummary()]);
            setError(null);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteLiability = useCallback(async (uuid) => {
        try {
            setLoading(true);
            await networthService.deleteLiability(uuid);
            setLiabilities(prev => prev.filter(liability => liability.uuid !== uuid));
            await fetchSummary();
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== ANALYTICS ==========
    const fetchSummary = useCallback(async () => {
        try {
            const data = await networthService.getSummary();
            setSummary(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching net worth summary:', err);
        }
    }, []);

    const fetchHistory = useCallback(async (months = 12) => {
        try {
            const data = await networthService.getHistory(months);
            setHistory(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching net worth history:', err);
        }
    }, []);

    const fetchBreakdown = useCallback(async () => {
        try {
            const data = await networthService.getBreakdown();
            setBreakdown(data);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching net worth breakdown:', err);
        }
    }, []);

    // Initialize on mount
    useEffect(() => {
        fetchAssetCategories();
        fetchLiabilityCategories();
        fetchSummary();
    }, [fetchAssetCategories, fetchLiabilityCategories, fetchSummary]);

    const value = {
        // State
        assetCategories,
        liabilityCategories,
        assets,
        liabilities,
        summary,
        history,
        breakdown,
        loading,
        error,
        
        // Actions
        fetchAssetCategories,
        fetchLiabilityCategories,
        fetchAssets,
        createAsset,
        updateAsset,
        deleteAsset,
        fetchLiabilities,
        createLiability,
        updateLiability,
        deleteLiability,
        fetchSummary,
        fetchHistory,
        fetchBreakdown,
    };

    return (
        <NetWorthContext.Provider value={value}>
            {children}
        </NetWorthContext.Provider>
    );
};