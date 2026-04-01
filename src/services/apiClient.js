import { getAccessToken, handleUnauthorizedSession } from './sessionManager';
import { resolveApiBaseUrl } from './apiConfig';

class ApiClient {
    constructor() {
        this.baseURL = this.detectBaseURL();
        this.authHeaderName = import.meta.env.VITE_AUTH_HEADER_NAME || 'Authorization';
        this.authHeaderPrefix = import.meta.env.VITE_AUTH_HEADER_PREFIX || 'Bearer';
        
        console.log('API Client initialized:', this.baseURL);
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
        const url = new URL(`${this.baseURL}${endpoint}`);
        
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

            console.log(`${method} ${url}`);
            
            const response = await fetch(url, options);
            return await this.parseResponse(response);
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error.message);
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
