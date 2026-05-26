import { getAccessToken, handleUnauthorizedSession } from './sessionManager';
import { resolveApiBaseUrl } from './apiConfig';

const API_URL = resolveApiBaseUrl({
    envUrl: import.meta.env.VITE_API_URL,
    isDev: import.meta.env.DEV,
});
const AUTH_HEADER_PREFIX = import.meta.env.VITE_AUTH_HEADER_PREFIX || 'Bearer';
const AUTH_HEADER_NAME = import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization';

const NETWORTH_SUMMARY_ENDPOINT = `${API_URL}/api/v1/networth/summary/`;
const NETWORTH_BREAKDOWN_ENDPOINT = `${API_URL}/api/v1/networth/breakdown/`;
const NETWORTH_HISTORY_ENDPOINT = `${API_URL}/api/v1/networth/history/`;
const NETWORTH_ASSETS_ENDPOINT = `${API_URL}/api/v1/networth/assets/`;
const NETWORTH_ASSET_CATEGORIES_ENDPOINT = `${API_URL}/api/v1/networth/assets/categories/`;
const NETWORTH_LIABILITIES_ENDPOINT = `${API_URL}/api/v1/networth/liabilities/`;
const NETWORTH_LIABILITY_CATEGORIES_ENDPOINT = `${API_URL}/api/v1/networth/liabilities/categories/`;

function getAuthToken() {
    return import.meta.env.VITE_AUTH_TOKEN || getAccessToken();
}

function buildHeaders() {
    const token = getAuthToken();

    if (!token) {
        throw new Error('No access token found. Please sign in again.');
    }

    return {
        'Content-Type': 'application/json',
        [AUTH_HEADER_NAME]: `${AUTH_HEADER_PREFIX} ${token}`,
    };
}

async function parseResponse(response) {
    const rawText = await response.text();
    let payload = null;

    if (rawText) {
        try {
            payload = JSON.parse(rawText);
        } catch {
            payload = { message: rawText };
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            handleUnauthorizedSession();
        }

        const firstFieldError = payload?.errors
            ? Object.values(payload.errors).flat().find(Boolean)
            : null;
        const message = payload?.message || payload?.detail || payload?.error || firstFieldError || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

function requestOptions(method, body) {
    return {
        method,
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    };
}

function toNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function toNullableNumberString(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return Number(value).toString();
}

function toNullableString(value) {
    return value === null || value === undefined || value === '' ? null : value;
}

function normaliseSummary(data = {}) {
    return {
        netWorth: toNumber(data?.net_worth),
        totalAssets: toNumber(data?.total_assets),
        totalLiabilities: toNumber(data?.total_liabilities),
        liquidAssets: toNumber(data?.liquid_assets),
        nonLiquidAssets: toNumber(data?.non_liquid_assets),
        debtFromModule: toNumber(data?.debt_from_module),
        otherLiabilities: toNumber(data?.other_liabilities),
        savingsFromGoals: toNumber(data?.savings_from_goals),
        change30d: data?.change_30d === null || data?.change_30d === undefined ? null : toNumber(data?.change_30d),
        changePercentage30d: data?.change_percentage_30d === null || data?.change_percentage_30d === undefined
            ? null
            : toNumber(data?.change_percentage_30d),
        currency: data?.currency || 'KES',
        assetsCount: toNumber(data?.assets_count),
        liabilitiesCount: toNumber(data?.liabilities_count),
        debtsCount: toNumber(data?.debts_count),
        goalsContributing: toNumber(data?.goals_contributing),
        assetsBreakdown: data?.assets_breakdown || {},
        liabilitiesBreakdown: data?.liabilities_breakdown || {},
        snapshotDate: data?.snapshot_date || '',
        status: data?.status || 'neutral',
    };
}

function normaliseBreakdownEntry(item, index = 0) {
    return {
        id: item?.uuid || item?.id || `${item?.name || item?.label || item?.category_name || 'entry'}-${index}`,
        label: item?.label || item?.name || item?.category_name || item?.month || `Entry ${index + 1}`,
        value: toNumber(item?.value ?? item?.amount ?? item?.current_value ?? item?.balance ?? item?.net_worth ?? item?.total),
        description: item?.description || item?.institution || item?.creditor || item?.date || '',
        color: item?.category_color || item?.color || '',
        raw: item || {},
    };
}

function normaliseBreakdown(data = {}) {
    return {
        summary: {
            netWorth: toNumber(data?.summary?.net_worth),
            totalAssets: toNumber(data?.summary?.total_assets),
            totalLiabilities: toNumber(data?.summary?.total_liabilities),
        },
        assets: {
            manual: Array.isArray(data?.assets?.manual) ? data.assets.manual.map((item, index) => normaliseBreakdownEntry(item, index)) : [],
            fromGoals: Array.isArray(data?.assets?.from_goals) ? data.assets.from_goals.map((item, index) => normaliseBreakdownEntry(item, index)) : [],
        },
        liabilities: {
            debts: Array.isArray(data?.liabilities?.debts) ? data.liabilities.debts.map((item, index) => normaliseBreakdownEntry(item, index)) : [],
            other: Array.isArray(data?.liabilities?.other) ? data.liabilities.other.map((item, index) => normaliseBreakdownEntry(item, index)) : [],
        },
        currency: data?.currency || 'KES',
    };
}

function normaliseHistoryEntry(item, index = 0) {
    return {
        id: item?.date || item?.month || `history-${index}`,
        month: item?.month || 'Unknown period',
        date: item?.date || '',
        netWorth: toNumber(item?.net_worth),
        assets: toNumber(item?.assets),
        liabilities: toNumber(item?.liabilities),
        change: toNumber(item?.change),
    };
}

function normaliseCategory(item, index = 0) {
    const explicitId = item?.id ?? item?.pk ?? item?.category_id;
    const value = explicitId ?? item?.uuid ?? index + 1;
    const categoryId = explicitId ?? null;

    return {
        id: item?.uuid || `category-${index}`,
        uuid: item?.uuid || '',
        value,
        categoryId,
        usesDerivedId: explicitId === undefined,
        name: item?.name || `Category ${categoryId}`,
        icon: item?.icon || '',
        color: item?.color || '#94a3b8',
        isLiquid: Boolean(item?.is_liquid),
        categoryType: item?.category_type || 'SYSTEM',
        sortOrder: toNumber(item?.sort_order),
    };
}

function normaliseAsset(item, index = 0) {
    return {
        id: item?.uuid || `asset-${index}`,
        uuid: item?.uuid || `asset-${index}`,
        name: item?.name || 'Untitled asset',
        category: toNumber(item?.category),
        categoryName: item?.category_name || 'Asset',
        categoryIcon: item?.category_icon || '',
        categoryColor: item?.category_color || '#10b981',
        currentValue: toNumber(item?.current_value),
        purchaseValue: item?.purchase_value === null || item?.purchase_value === undefined ? null : toNumber(item?.purchase_value),
        currency: item?.currency || 'KES',
        purchaseDate: item?.purchase_date || '',
        interestRate: item?.interest_rate === null || item?.interest_rate === undefined ? null : toNumber(item?.interest_rate),
        institution: item?.institution || '',
        accountNumber: item?.account_number || '',
        isLiquid: Boolean(item?.is_liquid),
        includeInNetWorth: item?.include_in_net_worth !== false,
        lastValuedDate: item?.last_valued_date || '',
        notes: item?.notes || '',
        gainLoss: item?.gain_loss === null || item?.gain_loss === undefined ? null : toNumber(item?.gain_loss),
        gainLossPercentage: item?.gain_loss_percentage === null || item?.gain_loss_percentage === undefined ? null : toNumber(item?.gain_loss_percentage),
        createdAt: item?.created_at || '',
        updatedAt: item?.updated_at || '',
    };
}

function normaliseLiability(item, index = 0) {
    return {
        id: item?.uuid || `liability-${index}`,
        uuid: item?.uuid || `liability-${index}`,
        name: item?.name || 'Untitled liability',
        category: toNumber(item?.category),
        categoryName: item?.category_name || 'Liability',
        categoryIcon: item?.category_icon || '',
        categoryColor: item?.category_color || '#ef4444',
        amount: toNumber(item?.amount),
        currency: item?.currency || 'KES',
        dueDate: item?.due_date || '',
        creditor: item?.creditor || '',
        status: item?.status || 'ACTIVE',
        statusDisplay: item?.status_display || item?.status || 'Active',
        includeInNetWorth: item?.include_in_net_worth !== false,
        notes: item?.notes || '',
        isOverdue: Boolean(item?.is_overdue),
        createdAt: item?.created_at || '',
        updatedAt: item?.updated_at || '',
    };
}

function resolveCategoryValue(input) {
    if (input === null || input === undefined || input === '') {
        return null;
    }

    const parsed = Number(input);
    return Number.isNaN(parsed) ? input : parsed;
}

function prepareAssetPayload(formValues) {
    return {
        name: formValues.name,
        category: resolveCategoryValue(formValues.categoryId ?? formValues.category ?? formValues.categoryUuid),
        current_value: Number(formValues.currentValue).toString(),
        purchase_value: toNullableNumberString(formValues.purchaseValue),
        currency: formValues.currency || 'KES',
        purchase_date: toNullableString(formValues.purchaseDate),
        interest_rate: toNullableNumberString(formValues.interestRate),
        institution: formValues.institution || '',
        account_number: formValues.accountNumber || '',
        is_liquid: Boolean(formValues.isLiquid),
        include_in_net_worth: formValues.includeInNetWorth !== false,
        last_valued_date: toNullableString(formValues.lastValuedDate),
        notes: formValues.notes || '',
    };
}

function prepareLiabilityPayload(formValues) {
    return {
        name: formValues.name,
        category: resolveCategoryValue(formValues.categoryId ?? formValues.category ?? formValues.categoryUuid),
        amount: Number(formValues.amount).toString(),
        currency: formValues.currency || 'KES',
        due_date: toNullableString(formValues.dueDate),
        creditor: formValues.creditor || '',
        status: formValues.status || 'ACTIVE',
        include_in_net_worth: formValues.includeInNetWorth !== false,
        notes: formValues.notes || '',
    };
}

export async function getNetWorthSummary() {
    const response = await fetch(NETWORTH_SUMMARY_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    return normaliseSummary(payload?.data || payload);
}

export async function getNetWorthBreakdown() {
    const response = await fetch(NETWORTH_BREAKDOWN_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    return normaliseBreakdown(payload?.data || payload);
}

export async function getNetWorthHistory() {
    const response = await fetch(NETWORTH_HISTORY_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    const data = payload?.data || payload || {};

    return {
        history: Array.isArray(data?.history) ? data.history.map((item, index) => normaliseHistoryEntry(item, index)) : [],
        trendPercentage: toNumber(data?.trend_percentage),
        trendDirection: data?.trend_direction || 'stable',
        currency: data?.currency || 'KES',
    };
}

export async function getAssets() {
    const response = await fetch(NETWORTH_ASSETS_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    const data = payload?.data || payload || {};
    const assets = Array.isArray(data?.assets) ? data.assets : Array.isArray(data?.results) ? data.results : [];

    return {
        count: toNumber(data?.count ?? assets.length),
        totalValue: toNumber(data?.total_value),
        assets: assets.map((item, index) => normaliseAsset(item, index)),
    };
}

export async function createAsset(formValues) {
    const response = await fetch(NETWORTH_ASSETS_ENDPOINT, requestOptions('POST', prepareAssetPayload(formValues)));
    const payload = await parseResponse(response);
    return normaliseAsset(payload?.data || payload);
}

export async function updateAsset(assetId, formValues) {
    const response = await fetch(`${NETWORTH_ASSETS_ENDPOINT}${assetId}/`, requestOptions('PATCH', prepareAssetPayload(formValues)));
    const payload = await parseResponse(response);
    return normaliseAsset(payload?.data || payload);
}

export async function deleteAsset(assetId) {
    const response = await fetch(`${NETWORTH_ASSETS_ENDPOINT}${assetId}/`, requestOptions('DELETE'));
    await parseResponse(response);
    return assetId;
}

export async function getAssetCategories() {
    const response = await fetch(NETWORTH_ASSET_CATEGORIES_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    const data = payload?.data || payload || {};
    const categories = Array.isArray(data?.categories) ? data.categories : Array.isArray(data?.results) ? data.results : [];

    return categories.map((item, index) => normaliseCategory(item, index));
}

export async function getLiabilities() {
    const response = await fetch(NETWORTH_LIABILITIES_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    const data = payload?.data || payload || {};
    const liabilities = Array.isArray(data?.liabilities) ? data.liabilities : Array.isArray(data?.results) ? data.results : [];

    return {
        count: toNumber(data?.count ?? liabilities.length),
        totalOwed: toNumber(data?.total_owed),
        liabilities: liabilities.map((item, index) => normaliseLiability(item, index)),
    };
}

export async function createLiability(formValues) {
    const response = await fetch(NETWORTH_LIABILITIES_ENDPOINT, requestOptions('POST', prepareLiabilityPayload(formValues)));
    const payload = await parseResponse(response);
    return normaliseLiability(payload?.data || payload);
}

export async function updateLiability(liabilityId, formValues) {
    const response = await fetch(`${NETWORTH_LIABILITIES_ENDPOINT}${liabilityId}/`, requestOptions('PATCH', prepareLiabilityPayload(formValues)));
    const payload = await parseResponse(response);
    return normaliseLiability(payload?.data || payload);
}

export async function deleteLiability(liabilityId) {
    const response = await fetch(`${NETWORTH_LIABILITIES_ENDPOINT}${liabilityId}/`, requestOptions('DELETE'));
    await parseResponse(response);
    return liabilityId;
}

export async function getLiabilityCategories() {
    const response = await fetch(NETWORTH_LIABILITY_CATEGORIES_ENDPOINT, requestOptions('GET'));
    const payload = await parseResponse(response);
    const data = payload?.data || payload || {};
    const categories = Array.isArray(data?.categories) ? data.categories : Array.isArray(data?.results) ? data.results : [];

    return categories.map((item, index) => normaliseCategory(item, index));
}
