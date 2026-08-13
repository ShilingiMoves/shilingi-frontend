import { describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCTION_API_URL, resolveApiBaseUrl } from '../apiConfig';

describe('Railway API configuration', () => {
    it('defaults production builds to Railway staging', () => {
        expect(resolveApiBaseUrl({ envUrl: '', isDev: false })).toBe(DEFAULT_PRODUCTION_API_URL);
        expect(DEFAULT_PRODUCTION_API_URL).toBe('https://shilingi-backend-production.up.railway.app');
    });

    it('accepts local HTTP only in development', () => {
        expect(resolveApiBaseUrl({ envUrl: 'http://127.0.0.1:8000', isDev: true })).toBe('http://127.0.0.1:8000');
        expect(resolveApiBaseUrl({ envUrl: 'http://127.0.0.1:8000', isDev: false })).toBe(DEFAULT_PRODUCTION_API_URL);
    });
});
