// Types for API requests and responses
export interface ApiRequest<T = any> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    data?: T;
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
    status: number;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Queue management types
export interface QueueEntry {
    queueId: string;
    userId: number;
    performanceId: number;
    scheduleId?: number;
    position: number;
    joinedAt: Date;
    status:
        | 'WAITING_FOR_CONNECTION'
        | 'ENTER_QUEUE'
        | 'WAITING'
        | 'AVAILABLE'
        | 'EXPIRED'
        | 'COMPLETED';
}

export interface QueueSession {
    queueId: string;
    userId: number;
    performanceId: number;
    scheduleId?: number;
    sessionStartTime: Date;
    sessionEndTime: Date;
    status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
}

export interface QueueStatus {
    queueId: string;
    position: number;
    totalInQueue: number;
    estimatedWaitTime: number;
    status:
        | 'WAITING_FOR_CONNECTION'
        | 'ENTER_QUEUE'
        | 'WAITING'
        | 'AVAILABLE'
        | 'EXPIRED'
        | 'COMPLETED';
    sessionEndTime?: Date;
}

// Mock Server State - simulates database
class MockServerState {
    private queues: Map<string, QueueEntry[]> = new Map(); // performanceId_scheduleId -> queue
    private queueSessions: Map<string, QueueSession> = new Map(); // queueId -> session

    // Queue management
    joinQueue(
        userId: number,
        performanceId: number,
        scheduleId?: number
    ): QueueStatus {
        const queueKey = `${performanceId}_${scheduleId || 'default'}`;
        const queueId = `queue_${Date.now()}_${userId}`;

        // Get or create queue for this performance/schedule
        if (!this.queues.has(queueKey)) {
            this.queues.set(queueKey, []);
        }

        const queue = this.queues.get(queueKey)!;

        // Check if user is already in this queue
        const existingEntry = queue.find((entry) => entry.userId === userId);
        if (existingEntry) {
            return this.getQueueStatus(existingEntry.queueId);
        }

        // Add user to queue
        const queueEntry: QueueEntry = {
            queueId,
            userId,
            performanceId,
            scheduleId,
            position: queue.length + 1,
            joinedAt: new Date(),
            status: 'WAITING',
        };

        queue.push(queueEntry);

        // Update positions for all entries
        queue.forEach((entry, index) => {
            entry.position = index + 1;
        });

        return {
            queueId,
            position: queueEntry.position,
            totalInQueue: queue.length,
            estimatedWaitTime: queueEntry.position * 30, // 30 seconds per person
            status: queueEntry.status,
        };
    }

    getQueueStatus(queueId: string): QueueStatus {
        // Find queue entry
        let queueEntry: QueueEntry | undefined;
        let queue: QueueEntry[] | undefined;

        for (const [key, queueList] of this.queues.entries()) {
            const entry = queueList.find((e) => e.queueId === queueId);
            if (entry) {
                queueEntry = entry;
                queue = queueList;
                break;
            }
        }

        if (!queueEntry || !queue) {
            throw new Error('Queue entry not found');
        }

        // Check if it's the user's turn
        if (queueEntry.position === 1 && queueEntry.status === 'WAITING') {
            // Activate session
            this.activateQueueSession(
                queueId,
                queueEntry.userId,
                queueEntry.performanceId,
                queueEntry.scheduleId
            );
            queueEntry.status = 'AVAILABLE';
        }

        // Get session info if available
        const session = this.queueSessions.get(queueId);

        return {
            queueId,
            position: queueEntry.position - 1, // Convert to 0-based for "people ahead"
            totalInQueue: queue.length,
            estimatedWaitTime: Math.max(0, (queueEntry.position - 1) * 30),
            status: queueEntry.status,
            sessionEndTime: session?.sessionEndTime,
        };
    }

    private activateQueueSession(
        queueId: string,
        userId: number,
        performanceId: number,
        scheduleId?: number
    ): void {
        const sessionEndTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        const session: QueueSession = {
            queueId,
            userId,
            performanceId,
            scheduleId,
            sessionStartTime: new Date(),
            sessionEndTime,
            status: 'ACTIVE',
        };

        this.queueSessions.set(queueId, session);
    }

    completeQueue(queueId: string): boolean {
        // Remove from queue and mark session as completed
        for (const [key, queue] of this.queues.entries()) {
            const entryIndex = queue.findIndex((e) => e.queueId === queueId);
            if (entryIndex !== -1) {
                queue.splice(entryIndex, 1);

                // Update positions for remaining entries
                queue.forEach((entry, index) => {
                    entry.position = index + 1;
                });

                // Mark session as completed
                const session = this.queueSessions.get(queueId);
                if (session) {
                    session.status = 'COMPLETED';
                }

                return true;
            }
        }
        return false;
    }

    leaveQueue(queueId: string): boolean {
        // Remove from queue
        for (const [key, queue] of this.queues.entries()) {
            const entryIndex = queue.findIndex((e) => e.queueId === queueId);
            if (entryIndex !== -1) {
                queue.splice(entryIndex, 1);

                // Update positions for remaining entries
                queue.forEach((entry, index) => {
                    entry.position = index + 1;
                });

                // Remove session
                this.queueSessions.delete(queueId);

                return true;
            }
        }
        return false;
    }
}

// Mock Server Class
export class MockServer {
    private state = new MockServerState();
    private requestDelay = { min: 300, max: 1500 }; // Realistic delays
    private errorRate = 0.001; // 0.1% chance of random errors - reduced for testing

    // Simulate network delay
    private async simulateDelay(): Promise<void> {
        const delay =
            Math.random() * (this.requestDelay.max - this.requestDelay.min) +
            this.requestDelay.min;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Simulate random errors
    private shouldSimulateError(): boolean {
        return Math.random() < this.errorRate;
    }

    // Generic request handler
    async request<T = any>(apiRequest: ApiRequest): Promise<ApiResponse<T>> {
        console.log(
            `[MockServer] ${apiRequest.method} ${apiRequest.endpoint}`,
            {
                data: apiRequest.data,
                hasAuth: !!apiRequest.headers?.Authorization,
                authToken:
                    apiRequest.headers?.Authorization?.substring(0, 20) + '...',
            }
        );

        await this.simulateDelay();

        // Simulate random server errors
        if (this.shouldSimulateError()) {
            return {
                status: 500,
                error: 'Internal Server Error',
                message: 'Simulated server error',
                timestamp: new Date().toISOString(),
            };
        }

        try {
            const response = await this.handleRequest(apiRequest);
            console.log(`[MockServer] Response:`, response);
            return response;
        } catch (error) {
            return {
                status: 500,
                error: 'Internal Server Error',
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    // Route requests to appropriate handlers
    private async handleRequest<T>(
        apiRequest: ApiRequest
    ): Promise<ApiResponse<T>> {
        const { method, endpoint, data, params } = apiRequest;
        const pathParts = endpoint.split('/').filter(Boolean);

        // Authentication endpoints
        if (pathParts[0] === 'auth') {
            return this.handleAuthRequest(method, pathParts, data);
        }

        // Public endpoints - no authentication required
        if (pathParts[0] === 'performances' && method === 'GET') {
            return this.handlePerformanceRequest(
                method,
                pathParts,
                data,
                params
            );
        }
        if (pathParts[0] === 'venues' && method === 'GET') {
            return this.handleVenueRequest(method, pathParts, data, params);
        }

        // Check authentication for protected endpoints
        const authHeader = apiRequest.headers?.Authorization;
        let validatedUser = authHeader
            ? this.state.validateToken(authHeader.replace('Bearer ', ''))
            : null;

        // For demo reliability, also check localStorage for user info
        if (
            !validatedUser &&
            authHeader &&
            typeof localStorage !== 'undefined'
        ) {
            try {
                const currentUserStr = localStorage.getItem('currentUser');
                if (currentUserStr) {
                    const currentUser = JSON.parse(currentUserStr);
                    const token = authHeader.replace('Bearer ', '');
                    // For demo, accept any token format if we have a valid user in localStorage
                    if (
                        token.startsWith('mock_token_') &&
                        currentUser.user_id
                    ) {
                        validatedUser = currentUser;
                        console.log(
                            '[MockServer] Demo auth: Using localStorage user for token validation'
                        );
                    }
                }
            } catch (e) {
                console.warn(
                    '[MockServer] Failed to access localStorage or parse user data'
                );
            }
        }

        if (!validatedUser) {
            console.warn('[MockServer] Authentication failed:', {
                hasAuthHeader: !!authHeader,
                tokenStart: authHeader?.substring(0, 20),
                hasUserInStorage: !!localStorage.getItem('currentUser'),
            });
            return {
                status: 401,
                error: 'Unauthorized',
                message: 'Invalid or missing authentication token',
                timestamp: new Date().toISOString(),
            };
        }

        // Set current user for this request context
        this.state.currentUser = validatedUser;

        // Route to specific handlers
        switch (pathParts[0]) {
            case 'users':
                return this.handleUserRequest(method, pathParts, data, params);
            case 'performances':
                return this.handlePerformanceRequest(
                    method,
                    pathParts,
                    data,
                    params
                );
            case 'bookings':
                return this.handleBookingRequest(
                    method,
                    pathParts,
                    data,
                    params
                );
            case 'venues':
                return this.handleVenueRequest(method, pathParts, data, params);
            case 'system':
                return this.handleSystemRequest(
                    method,
                    pathParts,
                    data,
                    params
                );
            case 'queue':
                // For demo reliability, ensure queue always works with the validated user
                return this.handleQueueRequest(
                    method,
                    pathParts,
                    data,
                    params,
                    apiRequest,
                    validatedUser
                );
            default:
                return {
                    status: 404,
                    error: 'Not Found',
                    message: `Endpoint ${endpoint} not found`,
                    timestamp: new Date().toISOString(),
                };
        }
    }

    // Queue request handlers
    private async handleQueueRequest(
        method: string,
        pathParts: string[],
        data: any,
        params: any,
        apiRequest?: ApiRequest,
        validatedUser?: User
    ): Promise<ApiResponse> {
        // POST /queue/join - Join queue
        if (
            method === 'POST' &&
            pathParts.length === 2 &&
            pathParts[1] === 'join'
        ) {
            try {
                const { performanceId, scheduleId } = data;
                // Use the passed validated user or fall back to state
                const user = validatedUser || this.state.currentUser;
                const userId = user?.user_id;

                if (!userId) {
                    console.warn(
                        '[MockServer] Queue join failed: No valid user found'
                    );
                    return {
                        status: 401,
                        error: 'Unauthorized',
                        message: 'User not authenticated',
                        timestamp: new Date().toISOString(),
                    };
                }

                console.log(
                    `[MockServer] Queue join: User ${userId} joining queue for performance ${performanceId}`
                );
                const queueStatus = this.state.joinQueue(
                    userId,
                    performanceId,
                    scheduleId
                );

                return {
                    status: 200,
                    data: queueStatus,
                    timestamp: new Date().toISOString(),
                };
            } catch (error) {
                return {
                    status: 400,
                    error: 'Bad Request',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Invalid request',
                    timestamp: new Date().toISOString(),
                };
            }
        }

        // GET /queue/status/:queueId - Get queue status
        if (
            method === 'GET' &&
            pathParts.length === 3 &&
            pathParts[1] === 'status'
        ) {
            try {
                const queueId = pathParts[2];
                const queueStatus = this.state.getQueueStatus(queueId);

                return {
                    status: 200,
                    data: queueStatus,
                    timestamp: new Date().toISOString(),
                };
            } catch (error) {
                return {
                    status: 404,
                    error: 'Not Found',
                    message: 'Queue not found',
                    timestamp: new Date().toISOString(),
                };
            }
        }

        // POST /queue/:queueId/complete - Complete queue (proceed to booking)
        if (
            method === 'POST' &&
            pathParts.length === 3 &&
            pathParts[2] === 'complete'
        ) {
            try {
                const queueId = pathParts[1];
                const success = this.state.completeQueue(queueId);

                if (success) {
                    return {
                        status: 200,
                        data: { success: true },
                        message: 'Queue completed successfully',
                        timestamp: new Date().toISOString(),
                    };
                } else {
                    return {
                        status: 404,
                        error: 'Not Found',
                        message: 'Queue not found',
                        timestamp: new Date().toISOString(),
                    };
                }
            } catch (error) {
                return {
                    status: 400,
                    error: 'Bad Request',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Invalid request',
                    timestamp: new Date().toISOString(),
                };
            }
        }

        // DELETE /queue/:queueId - Leave queue
        if (method === 'DELETE' && pathParts.length === 2) {
            try {
                const queueId = pathParts[1];
                const success = this.state.leaveQueue(queueId);

                if (success) {
                    return {
                        status: 200,
                        data: { success: true },
                        message: 'Left queue successfully',
                        timestamp: new Date().toISOString(),
                    };
                } else {
                    return {
                        status: 404,
                        error: 'Not Found',
                        message: 'Queue not found',
                        timestamp: new Date().toISOString(),
                    };
                }
            } catch (error) {
                return {
                    status: 400,
                    error: 'Bad Request',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Invalid request',
                    timestamp: new Date().toISOString(),
                };
            }
        }

        return {
            status: 404,
            error: 'Not Found',
            timestamp: new Date().toISOString(),
        };
    }

    // Configuration methods
    setErrorRate(rate: number): void {
        this.errorRate = Math.max(0, Math.min(1, rate));
    }

    setRequestDelay(min: number, max: number): void {
        this.requestDelay = { min, max };
    }
}

// Export singleton instance
export const mockServer = new MockServer();

// Convenience methods that match the existing mockAPI interface
export const serverAPI = {
    // Queue management
    async joinQueue(
        performanceId: number,
        scheduleId?: number
    ): Promise<QueueStatus> {
        const token = localStorage.getItem('mockAuthToken');
        const response = await mockServer.request({
            method: 'POST',
            endpoint: '/queue/join',
            data: { performanceId, scheduleId },
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.message || 'Failed to join queue');
        }
    },

    async getQueueStatus(queueId: string): Promise<QueueStatus> {
        const token = localStorage.getItem('mockAuthToken');
        const response = await mockServer.request({
            method: 'GET',
            endpoint: `/queue/status/${queueId}`,
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.message || 'Failed to get queue status');
        }
    },

    async completeQueue(queueId: string): Promise<boolean> {
        const token = localStorage.getItem('mockAuthToken');
        const response = await mockServer.request({
            method: 'POST',
            endpoint: `/queue/${queueId}/complete`,
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.status === 200;
    },

    async leaveQueue(queueId: string): Promise<boolean> {
        const token = localStorage.getItem('mockAuthToken');
        const response = await mockServer.request({
            method: 'DELETE',
            endpoint: `/queue/${queueId}`,
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.status === 200;
    },
};
