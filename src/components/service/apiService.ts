import {
    User,
    Performance,
    PerformanceResponse,
    Booking,
    Seat,
    Venue,
    SystemMetrics,
} from '../type/index';
import { API_CONFIG } from '../../config/api.config';

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

// performance data transform util function
const transformPerformanceData = (
    response: PerformanceResponse
): Performance => {
    const transformed: Performance = {
        // 백엔드 응답 직접 매핑
        performance_id: response.performanceId,
        title: response.title,
        venue: response.venue,
        venue_name: response.venue,
        theme: response.theme,
        description: response.description || 'default text',
        poster_url: response.posterUrl,
        price: response.price,
        base_price: response.price,
        status: response.status,
        start_date: response.startDate,
        end_date: response.endDate,
        running_time: response.runningTime,
        venue_address: response.venueAddress,

        // 스케줄 변환
        schedules: response.schedules.map((schedule) => ({
            schedule_id: schedule.scheduleId,
            show_datetime: schedule.showDatetime,
            available_seats: schedule.availableSeats,
            total_seats: schedule.totalSeats,
            status: schedule.status,
        })),
    };

    return transformed;
};

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

    async getPerformanceById(performanceId: number): Promise<Performance> {
        try {
            console.log('API - Requesting performance with ID:', performanceId);

            const endpoint = `${API_CONFIG.ENDPOINTS.PERFORMANCES}/${performanceId}`;
            const backendResponse = await apiClient.get<PerformanceResponse>(
                endpoint
            );

            console.log('API - Raw backend response:', backendResponse);

            // 백엔드 응답 검증
            if (!backendResponse || !backendResponse.performanceId) {
                throw new Error(
                    'Invalid performance data received from backend'
                );
            }

            const transformedData = transformPerformanceData(backendResponse);

            console.log('API - Final transformed data:', transformedData);
            return transformedData;
        } catch (error) {
            console.error(
                `Failed to get performance by id ${performanceId}:`,
                error
            );
            throw error;
        }
    },
};
