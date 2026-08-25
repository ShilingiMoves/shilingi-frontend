import apiClient from './apiClient';
import { API_PATHS, compactPayload, unwrapData } from './apiContract';

const paths = API_PATHS.dailyMoney;

export const getTodayMoney = async () => unwrapData(await apiClient.get(paths.today));

export const saveDailyPlan = async (payload, uuid = null) => unwrapData(
    uuid
        ? await apiClient.patch(`${paths.plans}${uuid}/`, compactPayload(payload))
        : await apiClient.post(paths.plans, compactPayload(payload))
);

export const saveShoppingList = async (payload, uuid = null) => unwrapData(
    uuid
        ? await apiClient.patch(`${paths.shoppingLists}${uuid}/`, compactPayload(payload))
        : await apiClient.post(paths.shoppingLists, compactPayload(payload))
);

export const createReminder = async (payload) => unwrapData(
    await apiClient.post(paths.reminders, compactPayload(payload))
);

export const checkAffordability = async (payload) => unwrapData(
    await apiClient.post(paths.affordability, compactPayload(payload))
);

export const getMoneyCalendar = async (params = {}) => unwrapData(
    await apiClient.get(paths.calendar, params)
);
