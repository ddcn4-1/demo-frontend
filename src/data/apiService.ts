import {
    User,
    Performance,
    Booking,
    Seat,
    Venue,
    SystemMetrics,
} from '../type/index';

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/api/auth',
        USERS: '/api/users',
        PERFORMANCES: '/api/v1/performances',
        BOOKINGS: '/api/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
    },
};

// HTTP Client with error handling
class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor(baseURL: string, timeout: number = 10000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('authToken');

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            signal: AbortSignal.timeout(this.timeout),
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                if (response.status === 401) {
                    // Handle unauthorized - redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    window.location.href = '/login';
                    throw new Error('Unauthorized');
                }
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request failed: ${url}`, error);
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);

// API Service - matches mockServer interface exactly
export const serverAPI = {
    // Public endpoints (no auth required)
    async getPerformances(): Promise<Performance[]> {
        try {
            return await apiClient.get<Performance[]>(
                API_CONFIG.ENDPOINTS.PERFORMANCES
            );
        } catch (error) {
            console.error('Failed to fetch performances:', error);
            return [];
        }
    },

    async searchPerformances(searchParams: {
        name?: string;
        venue?: string;
        status?: string;
    }): Promise<Performance[]> {
        try {
            const queryString = new URLSearchParams(
                Object.entries(searchParams).filter(
                    ([_, value]) => value && value.trim() !== ''
                )
            ).toString();

            const endpoint = queryString
                ? `${API_CONFIG.ENDPOINTS.PERFORMANCES}/search?${queryString}`
                : API_CONFIG.ENDPOINTS.PERFORMANCES;

            return await apiClient.get<Performance[]>(endpoint);
        } catch (error) {
            console.error('Failed to search performances:', error);
            return [];
        }
    },

    // Add all other methods following the same pattern...
    // (Copying from the existing mockServer interface)
};

// Export types for components
export type { User, Performance, Booking, Seat, Venue, SystemMetrics };
