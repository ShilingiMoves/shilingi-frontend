import {
    clearSessionStorage,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    getStoredUserProfile as getPersistedUserProfile,
    handleUnauthorizedSession,
    isSessionIdle,
    markSessionActivity,
    setRefreshToken,
    setStoredUserProfile,
} from './sessionManager';
import { resolveApiBaseUrl } from './apiConfig';
import { fetchWithTimeout } from './secureFetch';
import { syncStoredPreferredNameFromUser } from '../utils/memberIdentity';

const API_URL = resolveApiBaseUrl({
    envUrl: import.meta.env.VITE_API_URL,
    isDev: import.meta.env.DEV,
});

const LOGIN_ENDPOINT =`${API_URL}/api/v1/auth/login/`;
const REGISTER_ENDPOINT = `${API_URL}/api/v1/auth/register/`;
const PASSWORD_RESET_REQUEST_ENDPOINT = `${API_URL}/api/v1/auth/forgot-password/`;
const PASSWORD_RESET_CONFIRM_ENDPOINT = `${API_URL}/api/v1/auth/reset-password/`;
const VERIFY_EMAIL_ENDPOINT = `${API_URL}/api/v1/auth/verify-email/`;
const RESEND_VERIFICATION_ENDPOINT = `${API_URL}/api/v1/auth/resend-verification/`;
const PROFILE_ENDPOINT = `${API_URL}/api/v1/users/me/`;
const REFRESH_ENDPOINT = `${API_URL}${import.meta.env.VITE_AUTH_REFRESH_ENDPOINT || '/api/v1/auth/token/refresh/'}`;
const AUTH_TIMEOUT_MS = Number(import.meta.env.VITE_AUTH_TIMEOUT_MS || 15000);
let refreshSessionPromise = null;

export class AuthApiError extends Error {
    constructor(message, { payload = null, status = null } = {}) {
        super(message);
        this.name = 'AuthApiError';
        this.payload = payload;
        this.status = status;
    }
}

async function parseResponse(response, { handleUnauthorized = true } = {}) {
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
        if (response.status === 401 && handleUnauthorized) {
            handleUnauthorizedSession();
        }

        const message = getFriendlyAuthErrorMessage(payload, response.status);
        throw new AuthApiError(message, { payload, status: response.status });
    }

    return payload;
}

function getFriendlyAuthErrorMessage(payload, status) {
    const rawMessage = getApiErrorMessage(payload) || `Request failed with status ${status}`;
    const normalized = String(rawMessage || '').replace(/_/g, ' ').toLowerCase();

    if (normalized.includes('email') && normalized.includes('not verified')) {
        return 'Please verify your email before signing in. Check your inbox for the verification link.';
    }

    if (normalized.includes('inactive') || normalized.includes('disabled')) {
        return 'This account is not active yet. Please verify your email or contact support if you believe this is a mistake.';
    }

    if (
        status === 401
        || normalized.includes('invalid email or password')
        || normalized.includes('invalid credentials')
        || normalized.includes('unable to log in')
        || normalized.includes('no active account')
    ) {
        return 'The email or password you entered is incorrect. Please check your details and try again.';
    }

    return humanizeApiErrorMessage(rawMessage);
}

function getApiErrorMessage(payload) {
    if (!payload) return '';

    const directMessage = payload.message || payload.detail || payload.error;
    if (directMessage) return directMessage;

    const errorSource = payload.errors || payload;
    if (errorSource && typeof errorSource === 'object' && !Array.isArray(errorSource)) {
        const firstEntry = Object.entries(errorSource).find(([, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            return typeof value === 'string' && value.trim();
        });

        if (firstEntry) {
            const [field, value] = firstEntry;
            const firstValue = Array.isArray(value) ? value[0] : value;
            return `${field}: ${firstValue}`;
        }
    }

    if (Array.isArray(payload)) return payload.find(Boolean) || '';
    return '';
}

function humanizeApiErrorMessage(message) {
    return String(message || '')
        .replace(/^non[_\s-]?field[_\s-]?errors?:\s*/i, '')
        .replace(/^[a-z0-9_]+:\s*/i, '')
        .replace(/_/g, ' ')
        .trim()
        || 'We could not complete that request. Please try again.';
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    markSessionActivity();

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
    syncStoredPreferredNameFromUser(user);
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
    const response = await fetchWithTimeout(REGISTER_ENDPOINT, {
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

export async function requestPasswordReset(payload) {
    const response = await authRequestWithRetry(
        PASSWORD_RESET_REQUEST_ENDPOINT,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
        {
            timeoutMs: AUTH_TIMEOUT_MS,
            retries: 1,
        }
    );

    const result = await parseResponse(response);
    return result?.data || result;
}

export async function confirmPasswordReset(payload) {
    const response = await authRequestWithRetry(
        PASSWORD_RESET_CONFIRM_ENDPOINT,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
        {
            timeoutMs: AUTH_TIMEOUT_MS,
            retries: 1,
        }
    );

    const result = await parseResponse(response);
    return result?.data || result;
}

export async function refreshSession() {
    if (isSessionIdle()) {
        handleUnauthorizedSession();
        return false;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        return false;
    }

    if (!refreshSessionPromise) {
        refreshSessionPromise = (async () => {
            const response = await fetchWithTimeout(REFRESH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken, refresh_token: refreshToken }),
            });

            const payload = await parseResponse(response, { handleUnauthorized: false });
            return storeTokens(payload);
        })().finally(() => {
            refreshSessionPromise = null;
        });
    }

    try {
        return await refreshSessionPromise;
    } catch {
        return false;
    }
}

export async function completePasswordSetup(payload) {
    const result = await confirmPasswordReset(payload);
    const authenticated = storeTokens(result);

    if (authenticated) {
        storeUserProfile(extractUser(result));
    }

    return {
        authenticated,
        result,
    };
}

export async function verifyEmail(payload) {
    const response = await authRequestWithRetry(
        VERIFY_EMAIL_ENDPOINT,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
        {
            timeoutMs: AUTH_TIMEOUT_MS,
            retries: 1,
        }
    );

    const result = await parseResponse(response);
    const authenticated = storeTokens(result);

    if (authenticated) {
        storeUserProfile(extractUser(result));
    }

    return {
        authenticated,
        result: result?.data || result,
    };
}

export async function resendVerificationEmail(payload) {
    const response = await authRequestWithRetry(
        RESEND_VERIFICATION_ENDPOINT,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
        {
            timeoutMs: AUTH_TIMEOUT_MS,
            retries: 1,
        }
    );

    const result = await parseResponse(response);
    return result?.data || result;
}

export async function getUserProfile() {
    const token = getAccessToken();

    if (!token) {
        throw new Error('No access token found');
    }

    let response = await fetchWithTimeout(PROFILE_ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401 && await refreshSession()) {
        response = await fetchWithTimeout(PROFILE_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAccessToken()}`,
            },
        });
    }

    const result = await parseResponse(response);
    const user = extractUser(result);
    storeUserProfile(user);
    return user;
}

export function logoutUser() {
    clearAuthStorage();
}

export function hasStoredAccessToken() {
    return Boolean(getAccessToken());
}

export function getStoredUserProfile() {
    return getPersistedUserProfile();
}
