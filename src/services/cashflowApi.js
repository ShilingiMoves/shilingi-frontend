import { getAccessToken, handleUnauthorizedSession } from './sessionManager';

const DEFAULT_API_URL = 'https://shilingibackend-production.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const AUTH_HEADER_PREFIX = import.meta.env.VITE_AUTH_HEADER_PREFIX || 'Bearer';
const AUTH_HEADER_NAME = import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization';

const CASHFLOW_SUMMARY_ENDPOINT = `${API_URL}/api/v1/cashflow/summary/`;
const CASHFLOW_ANALYSIS_ENDPOINT = `${API_URL}/api/v1/cashflow/analysis/`;
const CASHFLOW_HISTORY_ENDPOINT = `${API_URL}/api/v1/cashflow/history/`;
const CASHFLOW_INCOME_ENDPOINT = `${API_URL}/api/v1/cashflow/income/`;
const CASHFLOW_CATEGORIES_ENDPOINT = `${API_URL}/api/v1/cashflow/categories/`;

function buildHeaders() {
    const token = import.meta.env.VITE_AUTH_TOKEN || getAccessToken();

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
        const message = payload?.message || payload?.detail || firstFieldError || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

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
    const response = await fetch(CASHFLOW_SUMMARY_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    return payload?.data || payload;
}

export async function getCashflowAnalysis() {
    const response = await fetch(CASHFLOW_ANALYSIS_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    return payload?.data || payload;
}

export async function getCashflowHistory() {
    const response = await fetch(CASHFLOW_HISTORY_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    return payload?.data || payload;
}

export async function getIncomeEntries() {
    const response = await fetch(CASHFLOW_INCOME_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    const entries = payload?.data?.incomes || payload?.data?.results || [];
    return {
        count: payload?.data?.count || entries.length,
        total: toNumber(payload?.data?.total),
        incomes: entries.map((item, index) => normaliseIncome(item, index)),
    };
}

export async function getIncomeCategories() {
    const response = await fetch(CASHFLOW_CATEGORIES_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    return payload?.data?.categories || [];
}
