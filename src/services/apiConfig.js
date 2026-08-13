const DEFAULT_PRODUCTION_API_URL = 'https://shilingi-backend-production.up.railway.app';
const DEFAULT_LOCAL_API_URL = '';

function sanitizeUrl(candidate, { allowHttp = false } = {}) {
    if (!candidate) return null;
    const trimmed = String(candidate).trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed);
        const allowedProtocols = allowHttp ? ['http:', 'https:'] : ['https:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            return null;
        }
        return parsed.origin.replace(/\/$/, '');
    } catch {
        return null;
    }
}

export function resolveApiBaseUrl({ envUrl, isDev }) {
    const raw = String(envUrl || '').trim();
    const allowHttp = Boolean(isDev);

    // Support accidental comma-separated values by taking the first valid URL.
    if (raw.includes(',')) {
        const firstValid = raw
            .split(',')
            .map((part) => sanitizeUrl(part, { allowHttp }))
            .find(Boolean);
        if (firstValid) return firstValid;
    }

    const normalizedEnv = sanitizeUrl(raw, { allowHttp });
    if (normalizedEnv) return normalizedEnv;

    if (isDev) {
        return DEFAULT_LOCAL_API_URL;
    }

    return DEFAULT_PRODUCTION_API_URL;
}

export function getConfiguredApiUrl() {
    return resolveApiBaseUrl({
        envUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL,
        isDev: import.meta.env.DEV,
    });
}

export { DEFAULT_LOCAL_API_URL, DEFAULT_PRODUCTION_API_URL };
