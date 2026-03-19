import { setDebtApiToken } from './debtApi';
import {
    clearSessionStorage,
    getAccessToken,
    getStoredUserProfile as getPersistedUserProfile,
    handleUnauthorizedSession,
    setRefreshToken,
    setStoredUserProfile,
} from './sessionManager';

const DEFAULT_API_URL = 'https://shilingibackend-production.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || `${API_URL}/api/v1/auth/login/`;
const REGISTER_ENDPOINT = import.meta.env.VITE_REGISTER_ENDPOINT || `${API_URL}/api/v1/auth/register/`;
const PROFILE_ENDPOINT = import.meta.env.VITE_PROFILE_ENDPOINT || `${API_URL}/api/v1/users/me/`;

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

function storeTokens(payload) {
    const source = payload?.data?.tokens || payload?.data || payload;
    const accessToken = source?.access || source?.access_token || source?.token || source?.jwt;
    const refreshToken = source?.refresh || source?.refresh_token;

    if (!accessToken) {
        return false;
    }

    setDebtApiToken(accessToken);

    if (refreshToken) {
        setRefreshToken(refreshToken);
    }

    return true;
}

function clearAuthStorage() {
    clearSessionStorage();
    setDebtApiToken('');
}

function extractUser(payload) {
    return payload?.data?.user || payload?.user || payload?.data || payload || null;
}

function storeUserProfile(user) {
    setStoredUserProfile(user);
}

export async function loginUser(credentials) {
    const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const payload = await parseResponse(response);
    const success = storeTokens(payload);

    if (!success) {
        throw new Error('Login response did not contain a valid authentication token.');
    }

    storeUserProfile(extractUser(payload));

    return payload;
}

export async function registerUser(payload) {
    const response = await fetch(REGISTER_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const result = await parseResponse(response);
    storeUserProfile(extractUser(result));
    return result?.data || result;
}

export async function getUserProfile() {
    const token = import.meta.env.VITE_AUTH_TOKEN || getAccessToken();

    if (!token) {
        throw new Error('No access token found');
    }

    const response = await fetch(PROFILE_ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    const result = await parseResponse(response);
    const user = extractUser(result);
    storeUserProfile(user);
    return user;
}

export function logoutUser() {
    clearAuthStorage();
}

export function hasStoredAccessToken() {
    return Boolean(import.meta.env.VITE_AUTH_TOKEN || getAccessToken());
}

export function getStoredUserProfile() {
    return getPersistedUserProfile();
}
