import { apiClient } from "./apiService";
import { API_CONFIG } from '../../config/api.config';
import type {
    ApiResponseQueueCheck,
    ApiResponseQueueStatus,
    ApiResponseQueueStatusList,
    ApiResponseString,
    ApiResponseTokenIssue,
    HeartbeatRequest,
    QueueCheckRequest,
    QueueCheckResponse,
    QueueStatusResponse,
    SessionReleaseRequest,
    TokenIssueRequest,
    TokenIssueResponse,
} from '../type';

class QueueService {
    private heartbeatRetryCount = 0;
    private maxHeartbeatRetries = 3;
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
     * Heartbeat 전송 - 사용자 활성 상태 유지
     */
    async updateHeartbeat(performanceId: number, scheduleId: number): Promise<ApiResponseString> {
        console.log('Queue Service - Sending heartbeat for performance:', performanceId, 'schedule:', scheduleId);

        const requestData: HeartbeatRequest = {
            performanceId,
            scheduleId
        };

        try {
            const response = await apiClient.post<ApiResponseString>(
                '/api/v1/queue/heartbeat',
                requestData
            );

            // 성공시 재시도 카운트 리셋
            this.heartbeatRetryCount = 0;
            return response;
        } catch (error: any) {
            this.heartbeatRetryCount++;
            console.error(`Heartbeat failed (attempt ${this.heartbeatRetryCount}):`, error);

            if (this.heartbeatRetryCount >= this.maxHeartbeatRetries) {
                throw new Error('연속된 heartbeat 실패로 세션이 만료될 수 있습니다.');
            }

            throw error;
        }
    }

    /**
     * 세션 명시적 해제 (페이지 이탈 시)
     */
    async releaseSession(performanceId: number, scheduleId: number, reason?: string): Promise<ApiResponseString> {
        console.log('Queue Service - Releasing session for performance:', performanceId, 'schedule:', scheduleId);

        // 현재 사용자 ID 동적으로 가져오기
        const getCurrentUserId = (): number | null => {
            try {
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    const user = JSON.parse(currentUser);
                    return user.userId || user.user_id;
                }
            } catch (error) {
                console.error('Failed to get current user ID:', error);
            }
            return null;
        };

        const userId = getCurrentUserId();
        if (!userId) {
            console.warn('Cannot send beacon: userId not found');
            return Promise.reject(new Error('User not logged in')); // 사용자 ID 없으면 거부 수정필요
        }

        const requestData: SessionReleaseRequest = {
            performanceId,
            scheduleId,
            userId: userId,
            reason: reason || 'user_exit'
        };

        return apiClient.post<ApiResponseString>(
            '/api/v1/queue/release-session',
            requestData
        );
    }

    /**
     * 세션 정리 (테스트용)
     */
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
     * Beacon을 통한 세션 해제 (페이지 언로드 시)
     * 이 메서드는 브라우저가 페이지를 언로드할 때 사용됩니다.
     */
    sendSessionReleaseBeacon(performanceId: number, scheduleId: number): boolean {
        if (!navigator.sendBeacon) {
            console.warn('Beacon API not supported');
            return false;
        }

        // 현재 사용자 ID 동적으로 가져오기
        const getCurrentUserId = (): number | null => {
            try {
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    const user = JSON.parse(currentUser);
                    return user.userId || user.user_id;
                }
            } catch (error) {
                console.error('Failed to get current user ID:', error);
            }
            return null;
        };

        const userId = getCurrentUserId();
        if (!userId) {
            console.warn('Cannot send beacon: userId not found');
            return false;
        }

        const data = JSON.stringify({
            performanceId,
            scheduleId,
            userId: userId,
            reason: 'page_unload'
        });

        // API_CONFIG를 사용하여 동적 URL 구성
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUEUE}/release-session`;

        try {
            const success = navigator.sendBeacon(url, data);
            console.log('Beacon sent successfully:', success, 'to:', url);
            return success;
        } catch (error) {
            console.error('Beacon send failed:', error);
            return false;
        }
    }

    /**
     * 지연 함수
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    /**
     * 자동 재연결 기능이 있는 향상된 폴링
     */
    async pollQueueStatusWithRetry(
        token: string,
        onStatusUpdate: (status: QueueStatusResponse) => void,
        onError: (error: string) => void,
        pollInterval: number = 3000,
        maxRetries: number = 5
    ): Promise<() => void> {
        let isPolling = true;
        let retryCount = 0;

        const poll = async () => {
            while (isPolling && retryCount < maxRetries) {
                try {
                    const response = await this.getTokenStatus(token);
                    if (response.success && response.data) {
                        onStatusUpdate(response.data);
                        retryCount = 0; // 성공시 재시도 카운트 리셋

                        // ACTIVE 또는 완료 상태면 폴링 중단
                        if (['ACTIVE', 'USED', 'EXPIRED', 'CANCELLED'].includes(response.data.status)) {
                            break;
                        }
                    } else {
                        retryCount++;
                        console.warn(`Queue status check failed (attempt ${retryCount})`);
                    }
                } catch (error: any) {
                    retryCount++;
                    console.error(`Queue polling error (attempt ${retryCount}):`, error);

                    if (retryCount >= maxRetries) {
                        onError('대기열 상태 확인에 실패했습니다. 페이지를 새로고침해 주세요.');
                        break;
                    }
                }

                await this.delay(pollInterval * Math.min(retryCount + 1, 3)); // 점진적 백오프
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
