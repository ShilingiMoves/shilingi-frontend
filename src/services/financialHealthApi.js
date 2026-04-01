import apiClient from './apiClient';


export const getHealthScore = async (forceRefresh = false) => {
    try {
        const params = forceRefresh ? { refresh: 'true' } : {};
        const response = await apiClient.get('/api/v1/health/score/', params);
        return response.data || response;
    } catch (error) {
        console.error('Failed to fetch health score:', error);
        throw error;
    }
};

export const getHealthScoreHistory = async (months = 6) => {
    try {
        const response = await apiClient.get('/api/v1/health/history/', { months });
        return response.data || response;
    } catch (error) {
        console.error('Failed to fetch health score history:', error);
        throw error;
    }
};

export const getHealthScoreBreakdown = async () => {
    try {
        const response = await apiClient.get('/api/v1/health/breakdown/');
        return response.data || response;
    } catch (error) {
        console.error('Failed to fetch health score breakdown:', error);
        throw error;
    }
};

export const getHealthInsights = async () => {
    try {
        const response = await apiClient.get('/api/v1/health/insights/');
        return response.data || response;
    } catch (error) {
        console.error('Failed to fetch health insights:', error);
        throw error;
    }
};