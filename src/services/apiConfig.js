const DEFAULT_PRODUCTION_API_URL = 'https://shilingibackend-production.up.railway.app';
const DEFAULT_LOCAL_API_URL = '';

function sanitizeUrl(candidate) {
    if (!candidate) return null;
    const trimmed = String(candidate).trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null;
        }
        return parsed.origin.replace(/\/$/, '');
    } catch {
        return null;
    }
}

export function resolveApiBaseUrl({ envUrl, isDev }) {
    const raw = String(envUrl || '').trim();

    // Support accidental comma-separated values by taking the first valid URL.
    if (raw.includes(',')) {
        const firstValid = raw
            .split(',')
            .map((part) => sanitizeUrl(part))
            .find(Boolean);
        if (firstValid) return firstValid;
    }

    const normalizedEnv = sanitizeUrl(raw);
    if (normalizedEnv) return normalizedEnv;

    if (isDev) {
        return DEFAULT_LOCAL_API_URL;
    }

    return DEFAULT_PRODUCTION_API_URL;
}

export { DEFAULT_LOCAL_API_URL, DEFAULT_PRODUCTION_API_URL };
