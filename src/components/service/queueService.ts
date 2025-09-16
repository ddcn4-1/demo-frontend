import {apiClient} from "./apiService";

export interface TokenIssueRequest {
    performanceId: number;
}

export interface TokenIssueResponse {
    token: string;
    status: 'WAITING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
    positionInQueue: number;
    estimatedWaitTime: number;
    message: string;
    expiresAt: string;
    bookingExpiresAt?: string;
}

export interface QueueStatusResponse {
    token: string;
    status: 'WAITING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
    positionInQueue: number;
    estimatedWaitTime: number;
    isActiveForBooking: boolean;
    bookingExpiresAt?: string;
    performanceTitle?: string;
}

export interface ApiResponseTokenIssue {
    message?: string;
    data: TokenIssueResponse;
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface ApiResponseQueueStatus {
    message?: string;
    data: QueueStatusResponse;
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface ApiResponseQueueStatusList {
    message?: string;
    data: QueueStatusResponse[];
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface ApiResponseString {
    message?: string;
    data: string;
    success: boolean;
    error?: string;
    timestamp?: string;
}
export interface QueueCheckRequest {
    performanceId: number;
    scheduleId: number;
}

export interface QueueCheckResponse {
    requiresQueue: boolean;
    canProceedDirectly: boolean;
    sessionId?: string;
    message: string;
    currentActiveSessions?: number;
    maxConcurrentSessions?: number;
    estimatedWaitTime?: number;
    currentWaitingCount?: number;
    reason?: string;
}

export interface ApiResponseQueueCheck {
    message?: string;
    data: QueueCheckResponse;
    success: boolean;
    error?: string;
    timestamp?: string;
}

class QueueService {
    /**
     * 대기열 필요성 확인
     */
    async checkQueueRequirement(
        performanceId: number,
        scheduleId: number
    ): Promise<ApiResponseQueueCheck> {
        const requestData: QueueCheckRequest = {
            performanceId,
            scheduleId
        };

        try {
            const response = await apiClient.post<ApiResponseQueueCheck>(
                '/api/v1/queue/check',
                requestData
            );
            return response;
        } catch (error: any) {
            console.error('Queue requirement check failed:', error);

            // 오류 시 안전하게 대기열로 유도
            return {
                success: false,
                message: 'Queue check failed',
                data: {
                    requiresQueue: true,
                    canProceedDirectly: false,
                    message: '시스템 오류로 인해 대기열에 참여합니다.',
                    currentActiveSessions: 10,
                    maxConcurrentSessions: 10,
                    estimatedWaitTime: 120,
                    currentWaitingCount: 5,
                    reason: '시스템 오류'
                }
            };
        }
    }
    /**
     * 대기열 토큰 발급
     */
    async issueToken(performanceId: number): Promise<ApiResponseTokenIssue> {
        console.log('Queue Service - Issuing token for performance:', performanceId);

        const requestData: TokenIssueRequest = { performanceId };

        return apiClient.post<ApiResponseTokenIssue>(
            '/api/v1/queue/token',
            requestData
        );
    }

    /**
     * 토큰 상태 조회
     */
    async getTokenStatus(token: string): Promise<ApiResponseQueueStatus> {
        console.log('Queue Service - Getting token status:', token);

        return apiClient.get<ApiResponseQueueStatus>(
            `/api/v1/queue/status/${token}`
        );
    }

    /**
     * 내 토큰 목록 조회
     */
    async getMyTokens(): Promise<ApiResponseQueueStatusList> {
        console.log('Queue Service - Getting my tokens');

        return apiClient.get<ApiResponseQueueStatusList>(
            '/api/v1/queue/my-tokens'
        );
    }

    /**
     * 토큰 취소 (대기열에서 나가기)
     */
    async cancelToken(token: string): Promise<ApiResponseString> {
        console.log('Queue Service - Canceling token:', token);

        return apiClient.delete<ApiResponseString>(
            `/api/v1/queue/token/${token}`
        );
    }

    /**
     * 폴링을 위한 지연 함수
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async clearSessions(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post('/api/v1/queue/clear-sessions');
            return response;
        } catch (error: any) {
            console.error('Clear sessions failed:', error);
            throw new Error(error.response?.data?.message || 'Failed to clear sessions');
        }
    }

    /**
     * 대기열 상태를 폴링하는 함수
     */
    async pollQueueStatus(
        token: string,
        onStatusUpdate: (status: QueueStatusResponse) => void,
        pollInterval: number = 3000
    ): Promise<() => void> {
        let isPolling = true;

        const poll = async () => {
            while (isPolling) {
                try {
                    const response = await this.getTokenStatus(token);
                    if (response.success && response.data) {
                        onStatusUpdate(response.data);

                        // ACTIVE 또는 완료 상태면 폴링 중단
                        if (['ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'].includes(response.data.status)) {
                            break;
                        }
                    }
                } catch (error) {
                    console.error('Queue polling error:', error);
                    // 에러가 발생해도 계속 폴링
                }

                await this.delay(pollInterval);
            }
        };

        // 폴링 시작
        poll();

        // 폴링 중단 함수 반환
        return () => {
            isPolling = false;
        };
    }

}

export const queueService = new QueueService();
export default queueService;