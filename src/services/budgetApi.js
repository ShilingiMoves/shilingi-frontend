import apiClient from './apiClient';

const BASE_PATH = '/api/v1/budgets';

function normaliseCategory(item, index = 0) {
    const explicitId = item?.id ?? item?.pk ?? item?.category_id;
    const uuid = item?.uuid ?? item?.category_uuid ?? null;
    const hasExplicitId = explicitId !== null && explicitId !== undefined && explicitId !== '';
    const derivedId = index + 1;
    const categoryId = hasExplicitId ? explicitId : (uuid ?? derivedId);
    const categoryValue = hasExplicitId ? explicitId : (uuid ?? derivedId);

    return {
        ...item,
        id: categoryId,
        uuid: uuid || '',
        value: String(categoryValue),
        name: item?.name || `Category ${categoryId}`,
        usesDerivedId: !hasExplicitId && !uuid,
    };
}

function prepareCategoryPayload(data) {
    if (!data || data.category === null || data.category === undefined || data.category === '') {
        return data;
    }

    const numericCategory = Number(data.category);

    return {
        ...data,
        category: Number.isNaN(numericCategory) ? data.category : numericCategory,
    };
}

// ============ CATEGORIES ============
export async function getCategories() {
    const response = await apiClient.get(`${BASE_PATH}/categories/`);
    const categories = response?.data?.categories || response?.categories || [];
    return categories.map((item, index) => normaliseCategory(item, index));
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
    const response = await apiClient.post(`${BASE_PATH}/`, prepareCategoryPayload(data));
    return response?.data || response;
}

export async function updateBudget(uuid, data) {
    const response = await apiClient.patch(`${BASE_PATH}/${uuid}/`, prepareCategoryPayload(data));
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
    return await apiClient.post(`${BASE_PATH}/expenses/`, prepareCategoryPayload(data));
}

export async function quickExpense(data) {
    return await apiClient.post(`${BASE_PATH}/expenses/quick/`, prepareCategoryPayload(data));
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
