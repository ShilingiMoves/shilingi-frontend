import { setDebtApiToken } from './debtApi';

const DEFAULT_API_URL = 'https://shilingibackend-production.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || `${API_URL}/api/v1/auth/login/`;
const REGISTER_ENDPOINT = import.meta.env.VITE_REGISTER_ENDPOINT || `${API_URL}/api/v1/auth/register/`;
const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'shilingi_access_token';
const REFRESH_STORAGE_KEY = import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'shilingi_refresh_token';

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
    // Some endpoints wrap tokens in 'data.tokens' or just 'data'
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

export async function loginUser(credentials) {
    const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const payload = await parseResponse(response);
    storeTokens(payload);
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

    return parseResponse(response);
}

export async function getUserProfile() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
        throw new Error('No access token found');
    }

    const response = await fetch(`${API_URL}/api/v1/users/me/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    return parseResponse(response);
}

export function logoutUser() {
    setDebtApiToken('');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_STORAGE_KEY);
}

export function hasStoredAccessToken() {
    return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}


