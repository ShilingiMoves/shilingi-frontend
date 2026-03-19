const ACCESS_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'shilingi_access_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'shilingi_refresh_token';
const USER_STORAGE_KEY = import.meta.env.VITE_AUTH_USER_STORAGE_KEY || 'shilingi_user_profile';

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function setAccessToken(token) {
    if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        return;
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token) {
    if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
        return;
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setStoredUserProfile(user) {
    if (!user?.email) {
        return;
    }

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
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

export function clearSessionStorage() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
}

export function handleUnauthorizedSession() {
    clearSessionStorage();

    if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
        window.location.assign('/signin');
    }
}
