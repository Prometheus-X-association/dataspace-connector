import axios, { AxiosInstance, AxiosError } from 'axios';

// Use the same origin for API calls (remove /dashboard from path)
const API_BASE_URL = window.location.origin;

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    data?: unknown;
}

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout
        });

        // Add token to requests
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(this.handleError(error));
            }
        );

        // Handle errors
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: unknown): ApiError {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            // Network error
            if (!axiosError.response) {
                if (axiosError.code === 'ECONNABORTED') {
                    return {
                        message: 'Request timeout. Please try again.',
                        code: 'TIMEOUT',
                    };
                }
                return {
                    message:
                        'Network error. Please check your connection and try again.',
                    code: 'NETWORK_ERROR',
                };
            }

            // Server error with response
            const status = axiosError.response.status;
            const data = axiosError.response.data as {
                message?: string;
                error?: string;
                errors?: Array<{
                    msg?: string;
                    path?: string;
                    value?: unknown;
                }>;
            };

            switch (status) {
                case 400:
                    // Handle validation errors
                    if (data.errors && Array.isArray(data.errors)) {
                        const validationMessages = data.errors
                            .map(
                                (err) =>
                                    `${err.path}: ${
                                        err.msg || 'Validation error'
                                    }`
                            )
                            .join(', ');
                        return {
                            message: `Validation error: ${validationMessages}`,
                            status,
                            code: 'BAD_REQUEST',
                            data: data.errors,
                        };
                    }
                    return {
                        message:
                            data.message ||
                            data.error ||
                            'Invalid request. Please check your input.',
                        status,
                        code: 'BAD_REQUEST',
                    };
                case 401:
                    return {
                        message: 'Authentication failed. Please login again.',
                        status,
                        code: 'UNAUTHORIZED',
                    };
                case 403:
                    return {
                        message:
                            'You do not have permission to perform this action.',
                        status,
                        code: 'FORBIDDEN',
                    };
                case 404:
                    return {
                        message: 'Resource not found.',
                        status,
                        code: 'NOT_FOUND',
                    };
                case 429:
                    return {
                        message: 'Too many requests. Please try again later.',
                        status,
                        code: 'RATE_LIMIT',
                    };
                case 500:
                case 502:
                case 503:
                case 504:
                    return {
                        message: 'Server error. Please try again later.',
                        status,
                        code: 'SERVER_ERROR',
                    };
                default:
                    return {
                        message:
                            data.message ||
                            data.error ||
                            `Request failed with status ${status}`,
                        status,
                        code: 'UNKNOWN_ERROR',
                    };
            }
        }

        // Unknown error type
        return {
            message:
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            code: 'UNKNOWN_ERROR',
        };
    }

    // Authentication
    async login(secretKey: string, serviceKey: string) {
        try {
            if (!secretKey || !serviceKey) {
                throw {
                    message: 'Secret Key and Service Key are required',
                    code: 'MISSING_CREDENTIALS',
                };
            }

            const response = await this.api.post('/login', {
                secretKey,
                serviceKey,
            });

            // Extract token from nested content object
            const token = response.data.content?.token;
            const refreshToken = response.data.content?.refreshToken;

            if (token) {
                localStorage.setItem('authToken', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
            } else {
                console.error('Login response:', response.data);
                throw {
                    message:
                        'No token received from server. Response: ' +
                        JSON.stringify(response.data),
                    code: 'NO_TOKEN',
                };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    }

    // Configuration endpoints
    async getConfiguration() {
        try {
            const response = await this.api.get('/private/configuration');
            // Extract content if response is wrapped
            return response.data.content || response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateConfiguration(config: unknown) {
        try {
            if (!config) {
                throw {
                    message: 'Configuration data is required',
                    code: 'MISSING_CONFIG',
                };
            }

            const response = await this.api.put(
                '/private/configuration',
                config
            );
            // Return the content or the full response
            return response.data.content || response.data;
        } catch (error) {
            throw error;
        }
    }

    async reloadConfiguration() {
        try {
            const response = await this.api.post(
                '/private/configuration/reload'
            );
            return response.data.content || response.data;
        } catch (error) {
            throw error;
        }
    }

    // Data Exchange endpoints
    async getDataExchanges() {
        try {
            const response = await this.api.get('/dataexchanges/');
            // Extract content if response is wrapped
            return response.data.content || response.data;
        } catch (error) {
            throw error;
        }
    }

    async getDataExchangeById(id: string) {
        try {
            if (!id) {
                throw {
                    message: 'Exchange ID is required',
                    code: 'MISSING_ID',
                };
            }

            const response = await this.api.get(`/dataexchanges/${id}`);
            // Extract content if response is wrapped
            return response.data.content || response.data;
        } catch (error) {
            throw error;
        }
    }

    // Health check endpoint
    async checkHealth() {
        try {
            const response = await this.api.get('/');
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export const apiService = new ApiService();
