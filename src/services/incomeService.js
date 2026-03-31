import apiClient from './apiClient';

const INCOME_BASE = '/api/v1/cashflow';

function normaliseCategory(item) {
    const explicitId = item?.id ?? item?.pk ?? item?.category_id;
    return {
        ...item,
        id: explicitId,
        uuid: item?.uuid || '',
        name: item?.name || 'Unknown Category',
    };
}

class IncomeService {
    // ========== INCOME CATEGORIES ==========
    async getCategories() {
        const response = await apiClient.get(`${INCOME_BASE}/categories/`);
        const categories = response?.data?.categories || response?.categories || response?.data || response || [];
        // Ensure it's an array before mapping
        return Array.isArray(categories) ? categories.map(normaliseCategory) : [];
    }

    async createCategory(data) {
        const response = await apiClient.post(`${INCOME_BASE}/categories/`, data);
        return response?.data || response;
    }

    // ========== INCOME MANAGEMENT ==========
    async getIncomes(filters = {}) {
        const response = await apiClient.get(`${INCOME_BASE}/income/`, filters);
        return response?.data || response;
    }

    async getIncome(uuid) {
        const response = await apiClient.get(`${INCOME_BASE}/income/${uuid}/`);
        return response?.data || response;
    }

    async createIncome(data) {
        const response = await apiClient.post(`${INCOME_BASE}/income/`, data);
        return response?.data || response;
    }

    async updateIncome(uuid, data) {
        const response = await apiClient.patch(`${INCOME_BASE}/income/${uuid}/`, data);
        return response?.data || response;
    }

    async deleteIncome(uuid) {
        const response = await apiClient.delete(`${INCOME_BASE}/income/${uuid}/`);
        return response?.data || response;
    }

    async quickIncome(data) {
        const response = await apiClient.post(`${INCOME_BASE}/income/quick/`, data);
        return response?.data || response;
    }

    async getRecurringIncomes() {
        const response = await apiClient.get(`${INCOME_BASE}/income/recurring/`);
        return response?.data || response;
    }

    // ========== INCOME ANALYTICS ==========
    async getSummary() {
        const response = await apiClient.get(`${INCOME_BASE}/summary/`);
        return response?.data || response;
    }

    async getHistory(months = 6) {
        const response = await apiClient.get(`${INCOME_BASE}/history/`, { months });
        return response?.data || response;
    }

    async getIncomeVsExpense(year, month) {
        const params = {};
        if (year) params.year = year;
        if (month) params.month = month;
        const response = await apiClient.get(`${INCOME_BASE}/analysis/`, params);
        return response?.data || response;
    }
}

const incomeService = new IncomeService();
export default incomeService;