const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

export function isAbortError(error) {
    return error?.name === 'AbortError';
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            cache: 'no-store',
            credentials: 'same-origin',
            ...options,
            headers: {
                Accept: 'application/json',
                ...(options.headers || {}),
            },
            signal: options.signal || controller.signal,
        });
    } finally {
        window.clearTimeout(timeout);
    }
}

export { DEFAULT_TIMEOUT_MS };
