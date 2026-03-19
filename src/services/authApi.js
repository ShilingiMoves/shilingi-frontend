import { setDebtApiToken } from './debtApi';

const DEFAULT_API_URL = 'https://shilingibackend-production.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || `${API_URL}/api/v1/auth/login/`;
const REGISTER_ENDPOINT = import.meta.env.VITE_REGISTER_ENDPOINT || `${API_URL}/api/v1/auth/register/`;
const PROFILE_ENDPOINT = import.meta.env.VITE_PROFILE_ENDPOINT || `${API_URL}/api/v1/users/me/`;
const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'shilingi_access_token';
const REFRESH_STORAGE_KEY = import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'shilingi_refresh_token';
const USER_STORAGE_KEY = import.meta.env.VITE_AUTH_USER_STORAGE_KEY || 'shilingi_user_profile';

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
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);

    if (refreshToken) {
        localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
    }

    return true;
}

function clearAuthStorage() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setDebtApiToken('');
}

function extractUser(payload) {
    return payload?.data?.user || payload?.user || payload?.data || payload || null;
}

function storeUserProfile(user) {
    if (!user?.email) {
        return;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
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
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

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
    return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}

export function getStoredUserProfile() {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch {
        return null;
    }
}
