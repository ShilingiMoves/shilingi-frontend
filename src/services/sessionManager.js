const ACCESS_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'shilingi_access_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'shilingi_refresh_token';
const USER_STORAGE_KEY = import.meta.env.VITE_AUTH_USER_STORAGE_KEY || 'shilingi_user_profile';

function getStorage() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage;
    } catch (error) {
        console.warn('Local storage is unavailable:', error);
        return null;
    }
}

export function getAccessToken() {
    const storage = getStorage();
    return storage?.getItem(ACCESS_TOKEN_KEY) || '';
}

export function setAccessToken(token) {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    if (token) {
        storage.setItem(ACCESS_TOKEN_KEY, token);
        return;
    }

    storage.removeItem(ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token) {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    if (token) {
        storage.setItem(REFRESH_TOKEN_KEY, token);
        return;
    }

    storage.removeItem(REFRESH_TOKEN_KEY);
}

export function setStoredUserProfile(user) {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    if (!user?.email) {
        return;
    }

    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUserProfile() {
    const storage = getStorage();
    const rawUser = storage?.getItem(USER_STORAGE_KEY);

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
    const storage = getStorage();

    if (!storage) {
        return;
    }

    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_STORAGE_KEY);
    storage.removeItem('shilingi_has_dashboard_data');
}

export function handleUnauthorizedSession() {
    clearSessionStorage();

    if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
        window.location.assign('/signin');
    }
}
