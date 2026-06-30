import apiClient from './apiClient';

const NETWORTH_BASE = '/api/v1/networth';
const ASSETS_ENDPOINT = `${NETWORTH_BASE}/assets/`;
const ASSET_CATEGORIES_ENDPOINT = `${NETWORTH_BASE}/assets/categories/`;

function unwrapPayload(response) {
    if (!response) return {};
    return response.data || response;
}

function arrayFromPayload(payload, preferredKey) {
    if (Array.isArray(payload)) return payload;
    if (preferredKey && Array.isArray(payload?.[preferredKey])) return payload[preferredKey];
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function parseAmount(value) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeCategory(item, index = 0) {
    const explicitId = item?.id ?? item?.pk ?? item?.category_id ?? null;
    const uuid = item?.uuid ?? item?.category_uuid ?? null;
    const categoryIdentifier = explicitId ?? uuid ?? null;
    const parsedCategoryId = categoryIdentifier === null || categoryIdentifier === undefined
        ? null
        : Number(categoryIdentifier);
    const hasNumericId = Number.isFinite(parsedCategoryId);
    const categoryId = hasNumericId ? parsedCategoryId : categoryIdentifier;
    const fallbackId = `derived-${index + 1}`;

    return {
        id: categoryId ?? fallbackId,
        categoryId,
        usesDerivedId: categoryIdentifier === null || categoryIdentifier === undefined,
        uuid: item?.uuid || '',
        name: item?.name || 'Asset Category',
        color: item?.color || '#64748b',
        icon: item?.icon || '',
        isLiquid: Boolean(item?.is_liquid),
        type: item?.category_type || 'SYSTEM',
        raw: item,
    };
}

function normalizeAsset(item) {
    return {
        uuid: item?.uuid || '',
        name: item?.name || 'Untitled investment',
        category: item?.category,
        categoryName: item?.category_name || '',
        categoryColor: item?.category_color || '#1d4ed8',
        currentValue: parseAmount(item?.current_value),
        purchaseValue: item?.purchase_value === null || item?.purchase_value === undefined
            ? null
            : parseAmount(item?.purchase_value),
        gainLoss: parseAmount(item?.gain_loss),
        gainLossPercentage: parseAmount(item?.gain_loss_percentage),
        institution: item?.institution || '',
        isLiquid: Boolean(item?.is_liquid),
        currency: item?.currency || 'KES',
        lastValuedDate: item?.last_valued_date || '',
        purchaseDate: item?.purchase_date || '',
        notes: item?.notes || '',
        raw: item,
    };
}

export async function getAssetCategories() {
    const response = await apiClient.get(ASSET_CATEGORIES_ENDPOINT);
    const payload = unwrapPayload(response);
    const categories = arrayFromPayload(payload, 'categories');
    return categories.map((item, index) => normalizeCategory(item, index));
}

export async function createAssetCategory(data) {
    const response = await apiClient.post(ASSET_CATEGORIES_ENDPOINT, data);
    const payload = unwrapPayload(response);
    return normalizeCategory(payload);
}

export async function getAssets() {
    const response = await apiClient.get(ASSETS_ENDPOINT, { page_size: 200 });
    const payload = unwrapPayload(response);
    const assets = arrayFromPayload(payload, 'assets');
    return assets.map(normalizeAsset);
}

export async function createAsset(data) {
    const response = await apiClient.post(ASSETS_ENDPOINT, data);
    const payload = unwrapPayload(response);
    return normalizeAsset(payload);
}

export async function updateAsset(uuid, data) {
    const response = await apiClient.patch(`${ASSETS_ENDPOINT}${uuid}/`, data);
    const payload = unwrapPayload(response);
    return normalizeAsset(payload);
}

export async function deleteAsset(uuid) {
    await apiClient.delete(`${ASSETS_ENDPOINT}${uuid}/`);
    return uuid;
}
