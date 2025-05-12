import { getAuthToken } from "../app/context/authContext";
import { AppException } from './AppException';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface ApiOptions {
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
}

export class Api {
    private readonly baseUrl: string;
    private readonly defaultHeaders: Record<string, string>;

    constructor(options: ApiOptions = {}) {
        this.baseUrl = options.baseUrl || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...(options.defaultHeaders || {})
        };
    }

    /** GET **/
    async get<T = unknown>(
        url: string,
        params?: QueryParams,
        headers?: Record<string, string>,
        token?: string | null
    ): Promise<T> {
        const authToken = token ?? getAuthToken();
        return this.request<T>({
            url,
            method: 'GET',
            params,
            headers,
            token: authToken
        });
    }

    /** POST */
    async post<T = unknown>(
        url: string,
        body?: unknown,
        headers?: Record<string, string>,
        token?: string | null
    ): Promise<T> {
        const authToken = token ?? getAuthToken();
        return this.request<T>({
            url,
            method: 'POST',
            body,
            headers,
            token: authToken
        });
    }

    /** PUT */
    async put<T = unknown>(
        url: string,
        body?: unknown,
        headers?: Record<string, string>,
        token?: string | null
    ): Promise<T> {
        const authToken = token ?? getAuthToken();
        return this.request<T>({
            url,
            method: 'PUT',
            body,
            headers,
            token: authToken
        });
    }

    /** Make a DELETE request */
    async delete<T = unknown>(
        url: string,
        body?: unknown,
        headers?: Record<string, string>,
        token?: string | null
    ): Promise<T> {
        const authToken = token ?? getAuthToken();
        return this.request<T>({
            url,
            method: 'DELETE',
            body,
            headers,
            token: authToken
        });
    }

    /** Make an authenticated GET request (requires token) */
    async authGet<T = never>(
        url: string,
        params?: QueryParams,
        headers?: Record<string, string>
    ): Promise<T> {
        const authToken = getAuthToken();
        return this.get<T>(url, params, headers, authToken);
    }

    /** Make an authenticated POST request (requires token) */
    async authPost<T = never>(
        url: string,
        body?: any,
        headers?: Record<string, string>
    ): Promise<T> {
        const authToken = getAuthToken();
        return this.post<T>(url, body, headers, authToken);
    }

    /** Make an authenticated PUT request (requires token) */
    async authPut<T = never>(
        url: string,
        body?: any,
        headers?: Record<string, string>
    ): Promise<T> {
        const authToken = getAuthToken();
        return this.put<T>(url, body, headers, authToken);
    }

    /** Core request method that handles all API requests */
    private async request<T = never>(config: {
        url: string;
        method: string;
        params?: QueryParams;
        body?: any;
        headers?: Record<string, string>;
        token?: string | null;
    }): Promise<T> {
        try {
            const { url, method, params, body, headers, token } = config;

            // Build the full URL with query parameters if needed
            const fullUrl = this.getFullUrl(url, params);

            // Prepare request headers
            const requestHeaders = {
                ...this.defaultHeaders,
                ...(headers || {})
            };

            // Add authorization header if token is provided
            if (token) {
                requestHeaders['Authorization'] = `Bearer ${token}`;
            }

            // Build request options
            const options: RequestInit = {
                method,
                headers: requestHeaders,
            };

            // Add body for non-GET requests
            if (body && method !== 'GET') {
                options.body = JSON.stringify(body);
            }

            // Make the request
            const response = await fetch(fullUrl, options);

            // Handle error responses
            if (!response.ok) {
                return this.handleErrorResponse(response);
            }

            // Parse and return successful response
            return this.parseResponse<T>(response);
        } catch (error) {
            throw AppException.from(error);
        }
    }

    /** Builds a full URL with optional query parameters */
    private getFullUrl(url: string, params?: QueryParams): string {
        // Use baseUrl if the URL doesn't start with http:// or https://
        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

        if (!params) return fullUrl;

        // Filter out null/undefined values and build query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        if (!queryString) return fullUrl;

        return `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }

    /** Handles error responses */
    private async handleErrorResponse(response: Response): Promise<never> {
        let errorMessage = `Request failed with status ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage = errorData?.message || errorMessage;
        } catch (err) {
            console.error(err.message)
            // If parsing fails, use status-specific messages
            if (response.status === 401) {
                errorMessage = 'Authentication required: JWT token is missing or invalid.';
            } else if (response.status === 403) {
                errorMessage = 'You do not have permission to access this resource.';
            } else if (response.status === 404) {
                errorMessage = 'The requested resource was not found.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error occurred. Please try again later.';
            }
        }

        throw new AppException(errorMessage);
    }

    /** Parses response data */
    private async parseResponse<T>(response: Response): Promise<T> {
        try {
            // Check for empty response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            // Return empty object for non-JSON responses
            return {} as T;
        } catch (error) {
            console.error('Error parsing response:', error);
            return {} as T;
        }
    }
}

export const api = new Api();