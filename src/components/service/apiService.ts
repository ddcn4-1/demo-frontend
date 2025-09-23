import {
    User,
    Performance,
    PerformanceResponse,
    ScheduleResponse,
    ScheduleStatus,
    Booking,
    BookingDto,
    Seat,
    Venue,
    SystemMetrics,
    UserResponse,
    VenueResponse,
    PerformanceRequest,
    AdminBooking,
    PresignedUrlResponse,
    AdminPerformanceResponse,
    AsgDashboardOverview,
    AsgListResponse,
    AsgDetails,
    InstanceListResponse,
    AsgCreateRequest,
    AsgCreateResponse,
    AsgCapacityRequest,
    OperationResponse,
} from '../type/index';
import { API_CONFIG } from '../../config/api.config';

import { bookingService } from './bookingService';
import { seatService } from './seatService';
import { venueService } from './venueService';
import { asgService } from './asgService';

// Re-export services
export { bookingService } from './bookingService';
export { seatService } from './seatService';
export { venueService } from './venueService';
export { asgService } from './asgService';
export { authService } from '../service/authService';

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
                    const unauthorizedError: any = new Error('Unauthorized');
                    unauthorizedError.response = {
                        status: response.status,
                        statusText: response.statusText,
                    };
                    throw unauthorizedError;
                }
                let errorPayload: unknown = null;
                try {
                    const rawBody = await response.text();
                    if (rawBody) {
                        try {
                            errorPayload = JSON.parse(rawBody);
                        } catch {
                            errorPayload = rawBody;
                        }
                    }
                } catch (parseError) {
                    console.warn('Failed to parse error response body:', parseError);
                }

                const httpError: any = new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
                httpError.status = response.status;
                httpError.statusText = response.statusText;
                httpError.response = {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorPayload,
                };
                httpError.data = errorPayload;
                throw httpError;
            }

            if (response.status === 204) {
                return {} as T;
            }

            // Check if response has content before parsing JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // If not JSON, return empty object for successful responses
                return {} as T;
            }

            // Check if response body is empty
            const text = await response.text();
            if (!text || text.trim() === '') {
                return {} as T;
            }

            try {
                return JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON parsing failed:', jsonError, 'Response text:', text);
                return {} as T;
            }
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

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined,
        });
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
        venue_id: response.venueId,

        // 스케줄 변환
        schedules: response.schedules.map((schedule) => ({
            schedule_id: schedule.scheduleId,
            show_datetime: schedule.showDatetime,
            available_seats: schedule.availableSeats,
            total_seats: schedule.totalSeats,
            status: schedule.status as ScheduleStatus,
        })),
    };

    return transformed;
};

// performance data transform util function
const transformAdminPerformanceData = (
    response: AdminPerformanceResponse
): Performance => {
    const transformed: Performance = {
        // 백엔드 응답 직접 매핑
        performance_id: response.performanceResponse.performanceId,
        title: response.performanceResponse.title,
        venue: response.performanceResponse.venue,
        venue_name: response.performanceResponse.venue,
        theme: response.performanceResponse.theme,
        description: response.performanceResponse.description || 'default text',
        poster_url: response.performanceResponse.posterUrl,
        price: response.performanceResponse.price,
        base_price: response.performanceResponse.price,
        status: response.performanceResponse.status,
        start_date: response.performanceResponse.startDate,
        end_date: response.performanceResponse.endDate,
        running_time: response.performanceResponse.runningTime,
        venue_address: response.performanceResponse.venueAddress,
        venue_id: response.performanceResponse.venueId,


        // 스케줄 변환
        schedules: response.performanceResponse.schedules.map((schedule) => ({
            schedule_id: schedule.scheduleId,
            show_datetime: schedule.showDatetime,
            available_seats: schedule.availableSeats,
            total_seats: schedule.totalSeats,
            status: schedule.status as ScheduleStatus,
        })),

        total_bookings: response.totalBookings,
        revenue: response.revenue,
    };

    return transformed;
};


// user data transform util function
const transformUserData = (
    response: UserResponse
): User => {
    const transformed: User = {
        user_id: response.userId,
        username: response.username,
        email: response.email,
        name: response.name,
        phone: response.phone,
        role: response.role,
        status: response.status
    };

    return transformed;
};

// user data transform util function
const transformVenueData = (
    response: VenueResponse
): Venue => {
    const transformed: Venue = {
        venue_id: response.venueId,
        venue_name: response.venueName,
        address: response.address,
        description: response.description,
        contact: response.contact,
        total_capacity: response.totalCapacity,
        created_at: response.created_at
    };

    return transformed;
};



export const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);


// Export all services as a single object for convenience
export const services = {
    booking: bookingService,
    seat: seatService,
    venue: venueService,

    // auth: authService,
    // user: userService,
    // performance: performanceService,
    // admin: adminApi,
};

// Export default
export default services;

export const serverAPI = {
    // Public endpoints (no auth required)
    async getPerformances(): Promise<Performance[]> {
        try {
            const backendResponse = await apiClient.get<PerformanceResponse[]>(
                API_CONFIG.ENDPOINTS.PERFORMANCES
            );

            if (!backendResponse || !Array.isArray(backendResponse)) {
                throw new Error('Invalid performances data received from backend');
            }

            const transformedData = backendResponse.map(transformPerformanceData);

            return transformedData;
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

    async getPerformanceSchedules(performanceId: number): Promise<{ schedules: ScheduleResponse[] }> {
        try {
            console.log('API - Requesting schedules for performance ID:', performanceId);

            const endpoint = `${API_CONFIG.ENDPOINTS.PERFORMANCES}/${performanceId}/schedules`;
            const response = await apiClient.get<{ schedules: ScheduleResponse[] }>(endpoint);

            console.log('API - Schedules response:', response);
            return response;
        } catch (error) {
            console.error(
                `Failed to get schedules for performance ${performanceId}:`,
                error
            );
            throw error;
        }
    },

    async getAllAdminPerformances(): Promise<Performance[]> {

        try {
            const backendResponse = await apiClient.get<AdminPerformanceResponse[]>(
                API_CONFIG.ENDPOINTS.ADMIN_PERFORMANCES
            );

            if (!backendResponse || !Array.isArray(backendResponse)) {
                throw new Error('Invalid performances data received from backend');
            }
            console.log(backendResponse);
            const transformedData = backendResponse.map(transformAdminPerformanceData);

            console.log(transformedData);
            return transformedData;
        } catch (error) {
            console.error('Failed to fetch admin performances:', error);
            return [];
        }
    },

    async getUploadPresignedUrlResponse(image: File): Promise<PresignedUrlResponse> {
        try {

            const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_PERFORMANCES}/upload-url`;
            const response = await apiClient.post<PresignedUrlResponse>(endpoint, {
                imageName: image.name,
                imageType: image.type
            });

            return response;
        } catch (error) {
            console.error(
                `Failed to get PresignedUrl`,
                error
            );
            throw error;
        }
    },

    async uploadImage(image: File | null): Promise<string> {
        if (image !== null) {

            const presignedUrlResponse = await this.getUploadPresignedUrlResponse(image);

            const uploadResponse = await fetch(presignedUrlResponse.presignedUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': image.type,
                },
                body: image
            });

            if (!uploadResponse.ok) {
                throw new Error('파일 업로드 실패');
            }
            return presignedUrlResponse.imageKey;
        }
        return '';
    },

    async createPerformance(performanceData: PerformanceRequest, image: File | null): Promise<Performance | undefined> {
        try {
            const posterKey = await this.uploadImage(image);
            performanceData.posterUrl = posterKey;

            const response = await apiClient.post<AdminPerformanceResponse>(API_CONFIG.ENDPOINTS.ADMIN_PERFORMANCES, performanceData);

            return transformAdminPerformanceData(response);
        } catch (error) {
            console.error('Failed to create performance: ', error);
            return undefined;
        }
    },

    async updatePerformance(performanceId: number, performanceData: PerformanceRequest, image: File | null): Promise<Performance | undefined> {
        try {
            const posterKey = await this.uploadImage(image);
            performanceData.posterUrl = posterKey;

            const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_PERFORMANCES}/${performanceId}`
            const response = await apiClient.put<AdminPerformanceResponse>(endpoint, performanceData);

            return transformAdminPerformanceData(response);
        } catch (error) {
            console.error('Failed to update performance: ', error);
            return undefined;
        }
    },

    async deletePerformance(performanceId: number): Promise<boolean> {
        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.ADMIN_PERFORMANCES}/${performanceId}`
            await apiClient.delete(endpoint);

            return true;
        } catch (error) {
            console.error('Failed to delete performance: ', error);
            return false;
        }
    },

    // Booking endpoints
    async getAllBookings(): Promise<Booking[]> {
        try {
            return await apiClient.get<Booking[]>(
                API_CONFIG.ENDPOINTS.BOOKINGS
            );
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            return [];
        }
    },

    async getAdminAllBookings(): Promise<Booking[]> {
        try {
            return await apiClient.get<Booking[]>(
                API_CONFIG.ENDPOINTS.ADMIN_BOOKINGS
            );
        } catch (error) {
            console.error('Failed to fetch admin bookings:', error);
            return [];
        }
    },

    async getBookingsByUserId(userId: number): Promise<Booking[]> {
        try {
            return await apiClient.get<Booking[]>(
                `${API_CONFIG.ENDPOINTS.BOOKINGS}/user/${userId}`
            );
        } catch (error) {
            console.error('Failed to fetch user bookings:', error);
            return [];
        }
    },

    async cancelBooking(bookingId: number, reason: string): Promise<boolean> {
        try {
            await apiClient.post(
                `${API_CONFIG.ENDPOINTS.BOOKINGS}/${bookingId}/cancel`,
                { reason }
            );
            return true;
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            return false;
        }
    },

    // // Auth endpoints (항상 실제 API 사용)
    // async login(identifier: string, password: string): Promise<User | null> {
    //     try {
    //         const response = await apiClient.post<{
    //             user: User;
    //             token: string;
    //         }>(`${API_CONFIG.ENDPOINTS.AUTH}/login`, { identifier, password });
    //
    //         if (response.token) {
    //             localStorage.setItem('authToken', response.token);
    //             localStorage.setItem(
    //                 'currentUser',
    //                 JSON.stringify(response.user)
    //             );
    //             return response.user;
    //         }
    //         return null;
    //     } catch (error) {
    //         console.error('Login failed:', error);
    //         return null;
    //     }
    // },
    //
    // async logout(): Promise<void> {
    //     try {
    //         await apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/logout`);
    //     } catch (error) {
    //         console.error('Logout failed:', error);
    //     } finally {
    //         localStorage.removeItem('authToken');
    //         localStorage.removeItem('currentUser');
    //     }
    // },

    // Other endpoints
    async getUsers(): Promise<User[]> {
        try {
            const backendResponse = await apiClient.get<UserResponse[]>(API_CONFIG.ENDPOINTS.USERS);

            if (!backendResponse || !Array.isArray(backendResponse)) {
                throw new Error('Invalid users data received from backend');
            }

            const transformedData = backendResponse.map(transformUserData);

            return transformedData;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return [];
        }
    },

    async searchUsers(searchParams: {
        username?: string;
        role?: string;
        status?: string;
    }): Promise<User[]> {
        try {
            const queryString = new URLSearchParams(
                Object.entries(searchParams).filter(
                    ([_, value]) => value && value.trim() !== ''
                )
            ).toString();

            const endpoint = queryString
                ? `${API_CONFIG.ENDPOINTS.USERS}/search?${queryString}`
                : API_CONFIG.ENDPOINTS.USERS;

            console.log('search URL: ', endpoint);

            return await apiClient.get<User[]>(endpoint);
        } catch (error) {
            console.error('Failed to search users: ', error);
            return [];
        }
    },

    async createUser(userData: {
        email: string;
        username: string;
        name: string;
        phone: string;
        role: 'USER' | 'ADMIN' | 'DEVOPS' | 'DEV';
        password: string;
    }): Promise<User | undefined> {
        try {
            return await apiClient.post<User>(
                API_CONFIG.ENDPOINTS.USERS,
                userData
            );
        } catch (error) {
            console.error('Failed to create user: ', error);
            return undefined;
        }
    },

    async deleteUser(userId: number): Promise<boolean> {
        try {
            await apiClient.delete(
                `${API_CONFIG.ENDPOINTS.USERS}/${userId}`
            );
            return true;
        } catch (error) {
            console.error('Failed to delete user:', error);
            return false;
        }
    },

    async getVenues(): Promise<Venue[]> {
        try {
            const backendResponse = await apiClient.get<VenueResponse[]>(API_CONFIG.ENDPOINTS.VENUES);

            if (!backendResponse || !Array.isArray(backendResponse)) {
                throw new Error('Invalid venues data received from backend');
            }

            const transformedData = backendResponse.map(transformVenueData);

            return transformedData;
        } catch (error) {
            console.error('Failed to fetch venues:', error);
            return [];
        }
    },

    async getSeatsByVenueId(venueId: number): Promise<Seat[]> {
        try {
            return await apiClient.get<Seat[]>(
                `${API_CONFIG.ENDPOINTS.VENUES}/${venueId}/seats`
            );
        } catch (error) {
            console.error('Failed to fetch seats:', error);
            return [];
        }
    },

    async getSystemMetrics(): Promise<SystemMetrics> {
        try {
            return await apiClient.get<SystemMetrics>(
                `${API_CONFIG.ENDPOINTS.SYSTEM}/metrics`
            );
        } catch (error) {
            console.error('Failed to fetch system metrics:', error);
            throw error;
        }
    },

    async getAsgDashboardOverview(): Promise<AsgDashboardOverview> {
        try {
            return await asgService.getDashboardOverview();
        } catch (error) {
            console.error('Failed to fetch ASG dashboard overview:', error);
            throw error;
        }
    },

    async listAsgGroups(): Promise<AsgListResponse> {
        try {
            return await asgService.listAsgGroups();
        } catch (error) {
            console.error('Failed to fetch ASG groups:', error);
            throw error;
        }
    },

    async getAsgDetails(asgName: string): Promise<AsgDetails> {
        try {
            return await asgService.getAsgDetails(asgName);
        } catch (error) {
            console.error(`Failed to fetch ASG details for ${asgName}:`, error);
            throw error;
        }
    },

    async createAsg(payload: AsgCreateRequest): Promise<AsgCreateResponse> {
        try {
            return await asgService.createAsg(payload);
        } catch (error) {
            console.error('Failed to create ASG:', error);
            throw error;
        }
    },

    async deleteAsg(asgName: string): Promise<OperationResponse> {
        try {
            return await asgService.deleteAsg(asgName);
        } catch (error) {
            console.error(`Failed to delete ASG ${asgName}:`, error);
            throw error;
        }
    },

    async updateAsgCapacity(
        asgName: string,
        payload: AsgCapacityRequest
    ): Promise<OperationResponse> {
        try {
            return await asgService.updateAsgCapacity(asgName, payload);
        } catch (error) {
            console.error(`Failed to update ASG capacity for ${asgName}:`, error);
            throw error;
        }
    },

    async getAsgInstances(asgName: string): Promise<InstanceListResponse> {
        try {
            return await asgService.getAsgInstances(asgName);
        } catch (error) {
            console.error(`Failed to fetch ASG instances for ${asgName}:`, error);
            throw error;
        }
    },
};
