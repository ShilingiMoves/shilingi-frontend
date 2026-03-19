const DEFAULT_API_URL = 'https://shilingibackend-production.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const DEBTS_ENDPOINT = `${API_URL}/api/v1/debts/`;
const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'shilingi_access_token';
const AUTH_HEADER_PREFIX = import.meta.env.VITE_AUTH_HEADER_PREFIX || 'Bearer';
const AUTH_HEADER_NAME = import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization';

function toNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function normaliseDebt(rawDebt, index = 0) {
    const currentBalance = toNumber(
        rawDebt?.current_balance ?? rawDebt?.currentBalance ?? rawDebt?.balance ?? rawDebt?.remainingBalance ?? rawDebt?.amount,
    );

    return {
        id: rawDebt?.id ?? rawDebt?._id ?? rawDebt?.debtId ?? `debt-${index}`,
        name: rawDebt?.name ?? rawDebt?.title ?? rawDebt?.creditor_name ?? rawDebt?.creditor ?? 'Untitled debt',
        creditor: rawDebt?.creditor_name ?? rawDebt?.creditor ?? rawDebt?.name ?? rawDebt?.title ?? 'Unknown creditor',
        balance: currentBalance,
        interestRate: toNumber(rawDebt?.interestRate ?? rawDebt?.interest_rate ?? rawDebt?.apr),
        minimumPayment: toNumber(rawDebt?.minimumPayment ?? rawDebt?.minimum_payment ?? rawDebt?.monthlyPayment),
        dueDate: rawDebt?.dueDate ?? rawDebt?.due_date ?? '',
        status: rawDebt?.status ?? (currentBalance > 0 ? 'active' : 'paid'),
        notes: rawDebt?.notes ?? rawDebt?.description ?? '',
        debtType: rawDebt?.debt_type ?? rawDebt?.debtType ?? 'PERSONAL_LOAN',
        paymentFrequency: rawDebt?.payment_frequency ?? rawDebt?.paymentFrequency ?? 'MONTHLY',
        startDate: rawDebt?.start_date ?? rawDebt?.startDate ?? '',
        isPriority: rawDebt?.is_priority ?? rawDebt?.isPriority ?? false,
        accountNumber: rawDebt?.account_number ?? rawDebt?.accountNumber ?? '',
        currency: rawDebt?.currency ?? 'KES',
    };
}

function extractDebtCollection(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.debts)) {
        return payload.debts;
    }

    if (Array.isArray(payload?.results)) {
        return payload.results;
    }

    return [];
}

function getAuthToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || import.meta.env.VITE_AUTH_TOKEN || '';
}

function buildAuthHeaders() {
    const token = getAuthToken();

    if (!token) {
        return {};
    }

    return {
        [AUTH_HEADER_NAME]: `${AUTH_HEADER_PREFIX} ${token}`,
    };
}

async function parseJsonResponse(response) {
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
        const message = payload?.message || payload?.error || payload?.detail || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

function buildRequestOptions(method, body) {
    return {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(),
        },
        body: body ? JSON.stringify(body) : undefined,
    };
}

function prepareDebtPayload(formValues) {
    const balance = toNumber(formValues.balance);
    const minimumPayment = toNumber(formValues.minimumPayment);
    const interestRate = toNumber(formValues.interestRate);

    return {
        name: formValues.name,
        creditor_name: formValues.creditor,
        original_amount: balance.toString(),
        current_balance: balance.toString(),
        interest_rate: interestRate.toString(),
        minimum_payment: minimumPayment.toString(),
        due_date: formValues.dueDate || null,
        status: formValues.status,
        notes: formValues.notes,
        currency: formValues.currency || 'KES',
        debt_type: formValues.debtType || 'PERSONAL_LOAN',
        payment_frequency: formValues.paymentFrequency || 'MONTHLY',
        start_date: formValues.startDate || null,
        is_priority: formValues.isPriority ?? false,
        account_number: formValues.accountNumber || '',
    };
}

export function setDebtApiToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        return;
    }

    localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function getDebts() {
    const response = await fetch(DEBTS_ENDPOINT, buildRequestOptions('GET'));
    const payload = await parseJsonResponse(response);
    return extractDebtCollection(payload).map((debt, index) => normaliseDebt(debt, index));
}

export async function createDebt(formValues) {
    const response = await fetch(DEBTS_ENDPOINT, buildRequestOptions('POST', prepareDebtPayload(formValues)));
    const payload = await parseJsonResponse(response);
    return normaliseDebt(payload?.data ?? payload?.debt ?? payload);
}

export async function updateDebt(debtId, formValues) {
    const debtUrl = `${DEBTS_ENDPOINT}${debtId}/`;
    const response = await fetch(debtUrl, buildRequestOptions('PUT', prepareDebtPayload(formValues)));
    const payload = await parseJsonResponse(response);
    return normaliseDebt(payload?.data ?? payload?.debt ?? payload);
}

export async function deleteDebt(debtId) {
    const debtUrl = `${DEBTS_ENDPOINT}${debtId}/`;
    const response = await fetch(debtUrl, buildRequestOptions('DELETE'));
    await parseJsonResponse(response);
    return debtId;
}

export function calculateDebtSummary(debts) {
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const weightedInterest = totalBalance
        ? debts.reduce((sum, debt) => sum + (debt.balance * debt.interestRate), 0) / totalBalance
        : 0;

    const activeDebts = debts.filter((debt) => debt.status !== 'paid').length;

    return {
        totalBalance,
        totalMinimumPayment,
        weightedInterest,
        activeDebts,
    };
}
