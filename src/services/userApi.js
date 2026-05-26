import {
    getAccessToken as getSessionAccessToken,
    handleUnauthorizedSession,
    setStoredUserProfile,
} from './sessionManager';
import { resolveApiBaseUrl } from './apiConfig';

const API_URL = resolveApiBaseUrl({
    envUrl: import.meta.env.VITE_API_URL,
    isDev: import.meta.env.DEV,
});
const AUTH_HEADER_PREFIX = import.meta.env.VITE_AUTH_HEADER_PREFIX || 'Bearer';
const AUTH_HEADER_NAME = import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization';

const USER_ENDPOINT = `${API_URL}/api/v1/users/me/`;
const USER_PROFILE_ENDPOINT = `${API_URL}/api/v1/users/me/profile/`;
const USER_PASSWORD_ENDPOINT = `${API_URL}/api/v1/users/me/change-password/`;
const USER_TIER_ENDPOINT = `${API_URL}/api/v1/users/me/tier/`;

function getAccessToken() {
    return getSessionAccessToken() || '';
}

function buildHeaders() {
    const token = getAccessToken();

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

export async function getUserAccount() {
    const response = await fetch(USER_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    const user = payload?.data || payload;
    setStoredUserProfile(user);
    return user;
}

export async function updateUserAccount(formValues) {
    const response = await fetch(USER_ENDPOINT, {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({
            first_name: formValues.first_name,
            last_name: formValues.last_name,
            phone_number: formValues.phone_number || '',
            default_currency: formValues.default_currency || 'KES',
        }),
    });

    const payload = await parseResponse(response);
    const user = payload?.data || payload;
    setStoredUserProfile(user);
    return user;
}

export async function updateUserPreferences(formValues) {
    const response = await fetch(USER_PROFILE_ENDPOINT, {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({
            monthly_income: formValues.monthly_income || null,
            primary_financial_goal: formValues.primary_financial_goal || null,
            receive_notifications: Boolean(formValues.receive_notifications),
            receive_weekly_summary: Boolean(formValues.receive_weekly_summary),
        }),
    });

    const payload = await parseResponse(response);
    const user = payload?.data || payload;
    if (user?.email) {
        setStoredUserProfile(user);
    }
    return user;
}

export async function changeUserPassword(formValues) {
    const response = await fetch(USER_PASSWORD_ENDPOINT, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
            current_password: formValues.current_password,
            new_password: formValues.new_password,
            new_password_confirm: formValues.new_password_confirm,
        }),
    });

    return parseResponse(response);
}

export async function getUserTier() {
    const response = await fetch(USER_TIER_ENDPOINT, {
        method: 'GET',
        headers: buildHeaders(),
    });

    const payload = await parseResponse(response);
    return payload?.data || payload;
}
