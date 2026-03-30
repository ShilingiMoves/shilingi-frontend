import apiClient from './apiClient';

const BASE_PATH = '/api/v1/budgets';

// ============ CATEGORIES ============
export async function getCategories() {
    const response = await apiClient.get(`${BASE_PATH}/categories/`);
    return response?.data?.categories || response?.categories || [];
}

export async function createCategory(data) {
    const response = await apiClient.post(`${BASE_PATH}/categories/`, data);
    return response?.data || response;
}

// ============ BUDGETS ============
export async function getBudgets(params = {}) {
    const response = await apiClient.get(`${BASE_PATH}/`, params);
    return response?.data?.budgets || response?.budgets || [];
}

export async function getBudget(uuid) {
    const response = await apiClient.get(`${BASE_PATH}/${uuid}/`);
    return response?.data || response;
}

export async function getBudgetSummary() {
    const response = await apiClient.get(`${BASE_PATH}/summary/`);
    return response?.data || response;
}

export async function createBudget(data) {
    const response = await apiClient.post(`${BASE_PATH}/`, data);
    return response?.data || response;
}

export async function updateBudget(uuid, data) {
    const response = await apiClient.patch(`${BASE_PATH}/${uuid}/`, data);
    return response?.data || response;
}

export async function deleteBudget(uuid) {
    await apiClient.delete(`${BASE_PATH}/${uuid}/`);
    return uuid;
}

// ============ EXPENSES ============
export async function getExpenses(params = {}) {
    const response = await apiClient.get(`${BASE_PATH}/expenses/`, params);
    return response?.data || response;
}

export async function createExpense(data) {
    return await apiClient.post(`${BASE_PATH}/expenses/`, data);
}

export async function quickExpense(data) {
    return await apiClient.post(`${BASE_PATH}/expenses/quick/`, data);
}

export async function updateExpense(uuid, data) {
    const response = await apiClient.patch(`${BASE_PATH}/expenses/${uuid}/`, data);
    return response?.data || response;
}

export async function deleteExpense(uuid) {
    await apiClient.delete(`${BASE_PATH}/expenses/${uuid}/`);
    return uuid;
}

// ============ GOALS ============
export async function getGoals(params = {}) {
    const response = await apiClient.get(`${BASE_PATH}/goals/`, params);
    return response?.data?.goals || response?.goals || [];
}

export async function getGoal(uuid) {
    const response = await apiClient.get(`${BASE_PATH}/goals/${uuid}/`);
    return response?.data || response;
}

export async function getGoalSummary() {
    const response = await apiClient.get(`${BASE_PATH}/goals/summary/`);
    return response?.data || response;
}

export async function createGoal(data) {
    const response = await apiClient.post(`${BASE_PATH}/goals/`, data);
    return response?.data || response;
}

export async function updateGoal(uuid, data) {
    const response = await apiClient.patch(`${BASE_PATH}/goals/${uuid}/`, data);
    return response?.data || response;
}

export async function deleteGoal(uuid) {
    await apiClient.delete(`${BASE_PATH}/goals/${uuid}/`);
    return uuid;
}

export async function addGoalContribution(uuid, data) {
    return await apiClient.post(`${BASE_PATH}/goals/${uuid}/contributions/`, data);
}

export async function getGoalContributions(uuid) {
    const response = await apiClient.get(`${BASE_PATH}/goals/${uuid}/contributions/`);
    return response?.data || response;
}