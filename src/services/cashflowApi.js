import apiClient from './apiClient';

const API_VERSION = '/api/v1';

function toNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function normaliseIncome(item, index = 0) {
    return {
        id: item?.uuid || `income-${index}`,
        uuid: item?.uuid || `income-${index}`,
        amount: toNumber(item?.amount),
        currency: item?.currency || 'KES',
        description: item?.description || 'Income entry',
        source: item?.source || 'Unknown source',
        incomeDate: item?.income_date || '',
        categoryName: item?.category_name || 'Income',
        categoryColor: item?.category_color || '#28a745',
        frequency: item?.frequency || 'ONE_TIME',
        frequencyDisplay: item?.frequency_display || item?.frequency || 'One-time',
        status: item?.status || 'RECEIVED',
        statusDisplay: item?.status_display || item?.status || 'Received',
        monthlyEquivalent: toNumber(item?.monthly_equivalent),
        isRecurring: Boolean(item?.is_recurring),
        notes: item?.notes || '',
    };
}

export async function getCashflowSummary() {
    const response = await apiClient.get(`${API_VERSION}/cashflow/summary/`);
    return response?.data || response;
}

export async function getCashflowAnalysis() {
    const response = await apiClient.get(`${API_VERSION}/cashflow/analysis/`);
    return response?.data || response;
}

export async function getCashflowHistory() {
    const response = await apiClient.get(`${API_VERSION}/cashflow/history/`);
    return response?.data || response;
}

export async function getIncomeEntries() {
    const response = await apiClient.get(`${API_VERSION}/cashflow/income/`);
    const payload = response?.data || response;
    
    const incomeArray = Array.isArray(payload) 
        ? payload 
        : payload?.income || payload?.results || [];
    
    return incomeArray.map((item, index) => normaliseIncome(item, index));
}

export async function createIncomeEntry(data) {
    const response = await apiClient.post(`${API_VERSION}/cashflow/income/`, data);
    return normaliseIncome(response?.data || response);
}

export async function updateIncomeEntry(uuid, data) {
    const response = await apiClient.patch(`${API_VERSION}/cashflow/income/${uuid}/`, data);
    return normaliseIncome(response?.data || response);
}

export async function deleteIncomeEntry(uuid) {
    await apiClient.delete(`${API_VERSION}/cashflow/income/${uuid}/`);
    return uuid;
}

export async function getIncomeCategories() {
    const response = await apiClient.get(`${API_VERSION}/cashflow/categories/`);
    return response?.data?.categories || response?.categories || [];
}