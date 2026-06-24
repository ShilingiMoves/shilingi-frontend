import { getAccessToken, handleUnauthorizedSession } from './sessionManager';
import { resolveApiBaseUrl } from './apiConfig';
import { fetchWithTimeout, isAbortError } from './secureFetch';
import { refreshSession } from './authApi';

class ApiClient {
    constructor() {
        this.baseURL = this.detectBaseURL();
        this.authHeaderName = import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization';
        this.authHeaderPrefix = import.meta.env.VITE_AUTH_HEADER_PREFIX || 'Bearer';
    }

    detectBaseURL() {
        return resolveApiBaseUrl({
            envUrl: import.meta.env.VITE_API_URL,
            isDev: import.meta.env.DEV,
        });
    }

    getAuthHeaders() {
        const token = getAccessToken();
        if (!token) return {};

        return {
            [this.authHeaderName]: `${this.authHeaderPrefix} ${token}`,
        };
    }

    buildRequestOptions(method, body = null, customHeaders = {}) {
        return {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...customHeaders,
            },
            body: body ? JSON.stringify(body) : undefined,
        };
    }

    buildURL(endpoint, params = {}) {
        const endpointPath = String(endpoint || '');
        const normalizedEndpoint = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
        const base = this.baseURL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const url = new URL(normalizedEndpoint, base);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                url.searchParams.append(key, value);
            }
        });

        return url.toString();
    }

    async parseResponse(response) {
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
            if (response.status === 401) {
                handleUnauthorizedSession();
            }

            const firstFieldError = payload?.errors
                ? Object.values(payload.errors).flat().find(Boolean)
                : null;

            const errorMessage = 
                payload?.message || 
                payload?.error || 
                payload?.detail || 
                firstFieldError || 
                `Request failed with status ${response.status}`;

            throw new Error(errorMessage);
        }

        return payload;
    }

    async request(method, endpoint, body = null, params = {}, customHeaders = {}) {
        try {
            const url = this.buildURL(endpoint, params);
            const options = this.buildRequestOptions(method, body, customHeaders);

            let response = await fetchWithTimeout(url, options);

            if (response.status === 401 && await refreshSession()) {
                response = await fetchWithTimeout(url, this.buildRequestOptions(method, body, customHeaders));
            }

            return await this.parseResponse(response);
        } catch (error) {
            if (isAbortError(error)) {
                throw new Error('The request timed out. Please try again in a moment.');
            }
            throw error;
        }
    }

    get(endpoint, params = {}, customHeaders = {}) {
        return this.request('GET', endpoint, null, params, customHeaders);
    }

    post(endpoint, body = null, params = {}, customHeaders = {}) {
        return this.request('POST', endpoint, body, params, customHeaders);
    }

    patch(endpoint, body = null, params = {}, customHeaders = {}) {
        return this.request('PATCH', endpoint, body, params, customHeaders);
    }

    put(endpoint, body = null, params = {}, customHeaders = {}) {
        return this.request('PUT', endpoint, body, params, customHeaders);
    }

    delete(endpoint, params = {}, customHeaders = {}) {
        return this.request('DELETE', endpoint, null, params, customHeaders);
    }
}

const apiClient = new ApiClient();
export default apiClient;
