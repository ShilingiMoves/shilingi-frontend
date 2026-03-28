import apiClient from './apiClient';

const NETWORTH_BASE = '/api/v1/networth';

class NetWorthService {
    // ========== ASSET CATEGORIES ==========
    async getAssetCategories() {
        const response = await apiClient.get(`${NETWORTH_BASE}/assets/categories/`);
        return response?.data || response;
    }

    async createAssetCategory(data) {
        const response = await apiClient.post(`${NETWORTH_BASE}/assets/categories/`, data);
        return response?.data || response;
    }

    // ========== ASSETS ==========
    async getAssets(filters = {}) {
        const response = await apiClient.get(`${NETWORTH_BASE}/assets/`, filters);
        return response?.data || response;
    }

    async getAsset(uuid) {
        const response = await apiClient.get(`${NETWORTH_BASE}/assets/${uuid}/`);
        return response?.data || response;
    }

    async createAsset(data) {
        const response = await apiClient.post(`${NETWORTH_BASE}/assets/`, data);
        return response?.data || response;
    }

    async updateAsset(uuid, data) {
        const response = await apiClient.patch(`${NETWORTH_BASE}/assets/${uuid}/`, data);
        return response?.data || response;
    }

    async deleteAsset(uuid) {
        const response = await apiClient.delete(`${NETWORTH_BASE}/assets/${uuid}/`);
        return response?.data || response;
    }

    // ========== LIABILITY CATEGORIES ==========
    async getLiabilityCategories() {
        const response = await apiClient.get(`${NETWORTH_BASE}/liabilities/categories/`);
        return response?.data || response;
    }

    async createLiabilityCategory(data) {
        const response = await apiClient.post(`${NETWORTH_BASE}/liabilities/categories/`, data);
        return response?.data || response;
    }

    // ========== LIABILITIES ==========
    async getLiabilities(filters = {}) {
        const response = await apiClient.get(`${NETWORTH_BASE}/liabilities/`, filters);
        return response?.data || response;
    }

    async getLiability(uuid) {
        const response = await apiClient.get(`${NETWORTH_BASE}/liabilities/${uuid}/`);
        return response?.data || response;
    }

    async createLiability(data) {
        const response = await apiClient.post(`${NETWORTH_BASE}/liabilities/`, data);
        return response?.data || response;
    }

    async updateLiability(uuid, data) {
        const response = await apiClient.patch(`${NETWORTH_BASE}/liabilities/${uuid}/`, data);
        return response?.data || response;
    }

    async deleteLiability(uuid) {
        const response = await apiClient.delete(`${NETWORTH_BASE}/liabilities/${uuid}/`);
        return response?.data || response;
    }

    // ========== NET WORTH ANALYTICS ==========
    async getSummary() {
        const response = await apiClient.get(`${NETWORTH_BASE}/summary/`);
        return response?.data || response;
    }

    async getHistory(months = 12) {
        const response = await apiClient.get(`${NETWORTH_BASE}/history/`, { months });
        return response?.data || response;
    }

    async getBreakdown() {
        const response = await apiClient.get(`${NETWORTH_BASE}/breakdown/`);
        return response?.data || response;
    }
}

const networthService = new NetWorthService();
export default networthService;