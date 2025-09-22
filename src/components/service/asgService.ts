import {
    AsgDashboardOverview,
    AsgListResponse,
    AsgDetails,
    InstanceListResponse,
    AsgCreateRequest,
    AsgCreateResponse,
    AsgCapacityRequest,
    OperationResponse,
} from '../type/index';

// ASG-specific configuration
const ASG_CONFIG = {
    BASE_URL: "https://asg.ddcn41.com", // ASG API base URL from OpenAPI spec
    TIMEOUT: 10000,
    ENDPOINTS: {
        ASG_OVERVIEW: "/v1/admin/dashboard/overview",
        ASG: "/v1/admin/asg",
    }
};

/**
 * HTTP Client for ASG Service
 */
class AsgApiClient {
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
            console.error(`ASG API Request failed: ${url}`, error);
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

/**
 * ASG Service - Auto Scaling Group management API service
 * Based on OpenAPI spec v3.0.3 for Auto Scaling Group Admin API
 */
class AsgService {
    private asgApiClient: AsgApiClient;

    constructor() {
        this.asgApiClient = new AsgApiClient(ASG_CONFIG.BASE_URL, ASG_CONFIG.TIMEOUT);
    }


    /**
     * GET /v1/admin/dashboard/overview
     * 전체 ASG 대시보드 요약
     */
    async getDashboardOverview(): Promise<AsgDashboardOverview> {
        try {
            return await this.asgApiClient.get<AsgDashboardOverview>(
                ASG_CONFIG.ENDPOINTS.ASG_OVERVIEW
            );
        } catch (error) {
            console.error('Failed to fetch ASG dashboard overview:', error);
            // Return empty data instead of mock data
            return {
                summary: {
                    totalAsgCount: 0,
                    totalInstances: 0,
                    healthyInstances: 0,
                },
                asgGroups: []
            };
        }
    }

    /**
     * GET /v1/admin/asg
     * ASG 목록 조회
     */
    async listAsgGroups(options?: {
        pageToken?: string;
        pageSize?: number;
        environment?: string;
        serverGroup?: string;
    }): Promise<AsgListResponse> {
        try {
            const params = new URLSearchParams();

            if (options?.pageToken) {
                params.append('pageToken', options.pageToken);
            }
            if (options?.pageSize) {
                params.append('pageSize', options.pageSize.toString());
            }
            if (options?.environment) {
                params.append('environment', options.environment);
            }
            if (options?.serverGroup) {
                params.append('serverGroup', options.serverGroup);
            }

            const endpoint = params.toString()
                ? `${ASG_CONFIG.ENDPOINTS.ASG}?${params.toString()}`
                : ASG_CONFIG.ENDPOINTS.ASG;

            return await this.asgApiClient.get<AsgListResponse>(endpoint);
        } catch (error) {
            console.error('Failed to fetch ASG groups:', error);
            // Return empty list instead of mock data
            return {
                autoScalingGroups: []
            };
        }
    }

    /**
     * GET /v1/admin/asg/{asgName}
     * 특정 ASG 상세 조회
     */
    async getAsgDetails(asgName: string): Promise<AsgDetails> {
        try {
            const encodedName = encodeURIComponent(asgName);
            return await this.asgApiClient.get<AsgDetails>(
                `${ASG_CONFIG.ENDPOINTS.ASG}/${encodedName}`
            );
        } catch (error) {
            console.error(`Failed to fetch ASG details for ${asgName}:`, error);
            throw error;
        }
    }

    /**
     * POST /v1/admin/asg
     * ASG 생성 (현재 비활성화)
     */
    async createAsg(payload: AsgCreateRequest): Promise<AsgCreateResponse> {
        try {
            return await this.asgApiClient.post<AsgCreateResponse>(
                ASG_CONFIG.ENDPOINTS.ASG,
                payload
            );
        } catch (error) {
            console.error('Failed to create ASG:', error);
            throw error;
        }
    }

    /**
     * DELETE /v1/admin/asg/{asgName}
     * 특정 ASG 삭제
     */
    async deleteAsg(asgName: string): Promise<OperationResponse> {
        try {
            const encodedName = encodeURIComponent(asgName);
            return await this.asgApiClient.delete<OperationResponse>(
                `${ASG_CONFIG.ENDPOINTS.ASG}/${encodedName}`
            );
        } catch (error) {
            console.error(`Failed to delete ASG ${asgName}:`, error);
            throw error;
        }
    }

    /**
     * PATCH /v1/admin/asg/{asgName}/capacity
     * ASG 용량(capacity) 업데이트
     */
    async updateAsgCapacity(
        asgName: string,
        payload: AsgCapacityRequest
    ): Promise<OperationResponse> {
        try {
            const encodedName = encodeURIComponent(asgName);
            return await this.asgApiClient.patch<OperationResponse>(
                `${ASG_CONFIG.ENDPOINTS.ASG}/${encodedName}/capacity`,
                payload
            );
        } catch (error) {
            console.error(`Failed to update ASG capacity for ${asgName}:`, error);
            throw error;
        }
    }

    /**
     * GET /v1/admin/asg/{asgName}/instances
     * 특정 ASG 인스턴스 목록
     */
    async getAsgInstances(asgName: string): Promise<InstanceListResponse> {
        try {
            const encodedName = encodeURIComponent(asgName);
            return await this.asgApiClient.get<InstanceListResponse>(
                `${ASG_CONFIG.ENDPOINTS.ASG}/${encodedName}/instances`
            );
        } catch (error) {
            console.error(`Failed to fetch ASG instances for ${asgName}:`, error);
            throw error;
        }
    }
}

export const asgService = new AsgService();
