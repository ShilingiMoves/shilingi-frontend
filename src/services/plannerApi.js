import apiClient from './apiClient';
import { API_PATHS, compactPayload, unwrapData, unwrapList } from './apiContract';

const PLANNER_KEYS = Object.freeze(['tax', 'protection', 'investment', 'retirement']);

const getBasePath = (planner) => {
    if (!PLANNER_KEYS.includes(planner)) throw new Error(`Unsupported planner: ${planner}`);
    return API_PATHS.planners[planner];
};

export const listPlans = async (planner, params = {}) => {
    const response = await apiClient.get(getBasePath(planner), params);
    return unwrapList(response, 'plans');
};

export const getPlan = async (planner, uuid) => unwrapData(
    await apiClient.get(`${getBasePath(planner)}${uuid}/`)
);

export const createPlan = async (planner, payload) => unwrapData(
    await apiClient.post(getBasePath(planner), compactPayload(payload))
);

export const updatePlan = async (planner, uuid, payload) => unwrapData(
    await apiClient.patch(`${getBasePath(planner)}${uuid}/`, compactPayload(payload))
);

export const deletePlan = (planner, uuid) => apiClient.delete(`${getBasePath(planner)}${uuid}/`);

export const calculatePlan = async (planner, payload) => unwrapData(
    await apiClient.post(`${getBasePath(planner)}calculate/`, compactPayload(payload))
);

export const recalculatePlan = async (planner, uuid) => unwrapData(
    await apiClient.post(`${getBasePath(planner)}${uuid}/recalculate/`)
);

export const getLatestPlan = async (planner) => {
    const plans = await listPlans(planner, { page_size: 100 });
    return plans
        .slice()
        .sort((left, right) => new Date(right.updated_at || right.created_at || 0) - new Date(left.updated_at || left.created_at || 0))[0] || null;
};

export const savePlan = async (planner, payload, currentPlan = null) => {
    const existing = currentPlan?.uuid ? currentPlan : await getLatestPlan(planner);
    if (!existing?.uuid) return createPlan(planner, payload);
    const updated = await updatePlan(planner, existing.uuid, payload);
    return recalculatePlan(planner, updated?.uuid || existing.uuid);
};

export const getTaxRules = async () => unwrapData(
    await apiClient.get(`${API_PATHS.planners.tax}rules/`)
);

export const calculateSalary = async (payload) => unwrapData(
    await apiClient.post(`${API_PATHS.planners.tax}salary-calculator/`, compactPayload(payload))
);

export const plannerApi = Object.freeze({
    list: listPlans,
    get: getPlan,
    create: createPlan,
    update: updatePlan,
    delete: deletePlan,
    calculate: calculatePlan,
    recalculate: recalculatePlan,
    latest: getLatestPlan,
    save: savePlan,
});

export default plannerApi;
