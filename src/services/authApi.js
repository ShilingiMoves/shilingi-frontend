import {
    clearSessionStorage,
    getAccessToken,
    setAccessToken,
    getStoredUserProfile as getPersistedUserProfile,
    handleUnauthorizedSession,
    setRefreshToken,
    setStoredUserProfile,
} from './sessionManager';
import { resolveApiBaseUrl } from './apiConfig';

const API_URL = resolveApiBaseUrl({
    envUrl: import.meta.env.VITE_API_URL,
    isDev: import.meta.env.DEV,
});
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || `${API_URL}/api/v1/auth/login/`;
const REGISTER_ENDPOINT = import.meta.env.VITE_REGISTER_ENDPOINT || `${API_URL}/api/v1/auth/register/`;
const PROFILE_ENDPOINT = import.meta.env.VITE_PROFILE_ENDPOINT || `${API_URL}/api/v1/users/me/`;
const AUTH_TIMEOUT_MS = Number(import.meta.env.VITE_AUTH_TIMEOUT_MS || 15000);

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

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs = AUTH_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }
}

async function authRequestWithRetry(url, options, { timeoutMs = AUTH_TIMEOUT_MS, retries = 1 } = {}) {
    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await fetchWithTimeout(url, options, timeoutMs);
        } catch (error) {
            lastError = error;
            const isAbort = error?.name === 'AbortError';
            const isNetworkFailure = error instanceof TypeError;
            const canRetry = attempt < retries && (isAbort || isNetworkFailure);

            if (!canRetry) {
                break;
            }

            await wait(800);
        }
    }

    if (lastError?.name === 'AbortError') {
        throw new Error('The server is taking too long to respond. Please try again in a moment.');
    }

    throw new Error('Network connection to the server failed. Please verify backend availability and CORS settings.');
}

function storeTokens(payload) {
    const source = payload?.data?.tokens || payload?.data || payload;
    const accessToken = source?.access || source?.access_token || source?.token || source?.jwt;
    const refreshToken = source?.refresh || source?.refresh_token;

    if (!accessToken) {
        return false;
    }

    setAccessToken(accessToken);

    if (refreshToken) {
        setRefreshToken(refreshToken);
    }

    return true;
}

function clearAuthStorage() {
    clearSessionStorage();
}

function extractUser(payload) {
    return payload?.data?.user || payload?.user || payload?.data || payload || null;
}

function storeUserProfile(user) {
    setStoredUserProfile(user);
}

export async function loginUser(credentials) {
    const response = await authRequestWithRetry(
        LOGIN_ENDPOINT,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        },
        {
            timeoutMs: AUTH_TIMEOUT_MS,
            retries: 1,
        }
    );

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
