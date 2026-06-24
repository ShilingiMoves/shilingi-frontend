const ACCESS_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'shilingi_access_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_STORAGE_KEY || 'shilingi_refresh_token';
const USER_STORAGE_KEY = import.meta.env.VITE_AUTH_USER_STORAGE_KEY || 'shilingi_user_profile';
const AUTH_TOKEN_PERSISTENCE = import.meta.env.VITE_AUTH_TOKEN_PERSISTENCE || 'session';
const LAST_ACTIVITY_KEY = 'shilingi_last_activity_at';
const IDLE_TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_IDLE_TIMEOUT_MS || 30 * 60 * 1000);

function getStorage() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return AUTH_TOKEN_PERSISTENCE === 'local' ? window.localStorage : window.sessionStorage;
    } catch (error) {
        console.warn('Browser storage is unavailable:', error);
        return null;
    }
}

function getLegacyLocalStorage() {
    if (typeof window === 'undefined' || AUTH_TOKEN_PERSISTENCE === 'local') {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function migrateLegacyValue(key) {
    const storage = getStorage();
    const legacyStorage = getLegacyLocalStorage();
    const legacyValue = legacyStorage?.getItem(key) || '';

    if (storage && legacyValue) {
        storage.setItem(key, legacyValue);
        legacyStorage.removeItem(key);
    }

    return legacyValue;
}

export function getAccessToken() {
    const storage = getStorage();
    return storage?.getItem(ACCESS_TOKEN_KEY) || migrateLegacyValue(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    const storage = getStorage();
    return storage?.getItem(REFRESH_TOKEN_KEY) || migrateLegacyValue(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token) {
    const storage = getStorage();
    const legacyStorage = getLegacyLocalStorage();

    if (!storage) {
        return;
    }

    if (token) {
        storage.setItem(ACCESS_TOKEN_KEY, token);
        legacyStorage?.removeItem(ACCESS_TOKEN_KEY);
        return;
    }

    storage.removeItem(ACCESS_TOKEN_KEY);
    legacyStorage?.removeItem(ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token) {
    const storage = getStorage();
    const legacyStorage = getLegacyLocalStorage();

    if (!storage) {
        return;
    }

    if (token) {
        storage.setItem(REFRESH_TOKEN_KEY, token);
        legacyStorage?.removeItem(REFRESH_TOKEN_KEY);
        return;
    }

    storage.removeItem(REFRESH_TOKEN_KEY);
    legacyStorage?.removeItem(REFRESH_TOKEN_KEY);
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

export function markSessionActivity(referenceTime = Date.now()) {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(LAST_ACTIVITY_KEY, String(referenceTime));
}

export function getLastActivityAt() {
    const storage = getStorage();
    const value = Number(storage?.getItem(LAST_ACTIVITY_KEY) || 0);
    return Number.isFinite(value) ? value : 0;
}

export function isSessionIdle(referenceTime = Date.now()) {
    const lastActivityAt = getLastActivityAt();
    if (!lastActivityAt) return false;
    return referenceTime - lastActivityAt > IDLE_TIMEOUT_MS;
}

function decodeJwtPayload(token) {
    if (!token || typeof window === 'undefined') return null;
    const [, payload] = String(token).split('.');
    if (!payload) return null;

    try {
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        return JSON.parse(window.atob(padded));
    } catch {
        return null;
    }
}

export function getAccessTokenExpiresAt() {
    const payload = decodeJwtPayload(getAccessToken());
    const exp = Number(payload?.exp || 0);
    return exp > 0 ? exp * 1000 : 0;
}

export function shouldRefreshSession(referenceTime = Date.now()) {
    if (!getAccessToken() || !getRefreshToken() || isSessionIdle(referenceTime)) {
        return false;
    }

    const expiresAt = getAccessTokenExpiresAt();
    const refreshWindowMs = Number(import.meta.env.VITE_AUTH_REFRESH_WINDOW_MS || 2 * 60 * 1000);
    return Boolean(expiresAt) && expiresAt - referenceTime <= refreshWindowMs;
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
    const legacyStorage = getLegacyLocalStorage();

    if (!storage) {
        return;
    }

    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_STORAGE_KEY);
    storage.removeItem(LAST_ACTIVITY_KEY);
    storage.removeItem('shilingi_has_dashboard_data');
    legacyStorage?.removeItem(ACCESS_TOKEN_KEY);
    legacyStorage?.removeItem(REFRESH_TOKEN_KEY);
}

export function handleUnauthorizedSession() {
    clearSessionStorage();

    if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
        window.location.assign('/signin');
    }
}
