import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Users, Clock, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {queueService, QueueStatusResponse} from "./service/queueService";
import {Performance, PerformanceSchedule} from "./type";

export interface QueueStatus {
    token: string;
    position: number;
    totalInQueue: number;
    estimatedWaitTime: number;
    status: 'WAITING_FOR_CONNECTION' | 'ENTER_QUEUE' | 'WAITING' | 'AVAILABLE' | 'EXPIRED' | 'COMPLETED';
    sessionEndTime?: Date;
}

interface QueuePopupProps {
    isOpen: boolean;
    performance: Performance;
    selectedSchedule?: PerformanceSchedule;
    onClose: () => void;
    onQueueComplete: (performance: Performance, schedule?: PerformanceSchedule) => void;
    onQueueExpired: () => void;
}

export function QueuePopup({
                               isOpen,
                               performance,
                               selectedSchedule,
                               onClose,
                               onQueueComplete,
                               onQueueExpired,
                           }: QueuePopupProps) {
    const [queueStatus, setQueueStatus] = useState<QueueStatusResponse | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const stopPollingRef = useRef<(() => void) | null>(null);

    // Format time in MM:SS format
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize queue when popup opens
    useEffect(() => {
        if (isOpen && !queueStatus) {
            initializeQueue();
        }

        // Cleanup on close
        if (!isOpen) {
            cleanup();
        }

        return cleanup;
    }, [isOpen]);

    // Handle session timer when active
    useEffect(() => {
        if (queueStatus?.status === 'ACTIVE' && queueStatus.bookingExpiresAt) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const endTime = new Date(queueStatus.bookingExpiresAt!).getTime();
                const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

                setTimeRemaining(remaining);

                if (remaining === 0) {
                    // Session expired
                    setQueueStatus(prev => prev ? { ...prev, status: 'EXPIRED' } : null);
                }
            };

            updateTimer();
            intervalRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [queueStatus?.status, queueStatus?.bookingExpiresAt]);

    // Handle status changes
    useEffect(() => {
        if (queueStatus?.status === 'ACTIVE' && queueStatus.isActiveForBooking) {
            // User can now book - proceed after showing message for 2 seconds
            setTimeout(() => {
                onQueueComplete(performance, selectedSchedule);
                cleanup();
            }, 2000);
        } else if (queueStatus?.status === 'EXPIRED') {
            // Queue expired
            setTimeout(() => {
                onQueueExpired();
                cleanup();
            }, 3000);
        }
    }, [queueStatus?.status, queueStatus?.isActiveForBooking]);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (stopPollingRef.current) {
            stopPollingRef.current();
            stopPollingRef.current = null;
        }
        setQueueStatus(null);
        setTimeRemaining(0);
        setError(null);
        setIsInitializing(false);
    };

    const initializeQueue = async () => {
        console.log('Initializing queue for performance:', performance.performance_id);

        setIsInitializing(true);
        setError(null);

        try {
            // 먼저 대기열 필요성 확인 (selectedSchedule가 있는 경우)
            if (selectedSchedule) {
                console.log('Checking queue requirement for schedule:', selectedSchedule.schedule_id);

                const checkResponse = await queueService.checkQueueRequirement(
                    performance.performance_id,
                    selectedSchedule.schedule_id
                );

                if (checkResponse.success && checkResponse.data.canProceedDirectly) {
                    // 바로 진입 가능 - 즉시 완료 처리
                    console.log('Direct access granted - proceeding immediately');
                    // 즉시 진행 (로딩 표시 없이)
                    onQueueComplete(performance, selectedSchedule);
                    cleanup();
                    return;
                }

                console.log('Queue required - proceeding with token issuance');
            }

            // 대기열 필요 - 토큰 발급 요청
            const response = await queueService.issueToken(performance.performance_id);

            console.log('Token issue response:', response);

            if (response.success && response.data) {
                const tokenData = response.data;

                // QueueStatusResponse 형태로 변환
                const statusData: QueueStatusResponse = {
                    token: tokenData.token,
                    status: tokenData.status,
                    positionInQueue: tokenData.positionInQueue,
                    estimatedWaitTime: tokenData.estimatedWaitTime,
                    isActiveForBooking: tokenData.status === 'ACTIVE',
                    bookingExpiresAt: tokenData.bookingExpiresAt,
                    performanceTitle: performance.title
                };

                setQueueStatus(statusData);

                // 대기 상태이면 폴링 시작
                if (tokenData.status === 'WAITING') {
                    startPolling(tokenData.token);
                }
            } else {
                throw new Error(response.error || 'Failed to issue queue token');
            }
        } catch (error: any) {
            console.error('Failed to initialize queue:', error);
            setError(error.message || 'Failed to join queue. Please try again.');
        } finally {
            setIsInitializing(false);
        }
    };

    const startPolling = (token: string) => {
        console.log('Starting queue polling for token:', token);

        const onStatusUpdate = (status: QueueStatusResponse) => {
            console.log('Queue status update:', status);
            setQueueStatus(status);
        };

        // 폴링 시작 (3초 간격)
        queueService.pollQueueStatus(token, onStatusUpdate, 3000)
            .then(stopFunction => {
                stopPollingRef.current = stopFunction;
            })
            .catch(error => {
                console.error('Polling setup error:', error);
            });
    };

    const handleLeaveQueue = async () => {
        if (queueStatus?.token) {
            try {
                await queueService.cancelToken(queueStatus.token);
            } catch (error) {
                console.error('Failed to cancel token:', error);
            }
        }
        cleanup();
        onClose();
    };

    const handleRetry = () => {
        setError(null);
        setQueueStatus(null);
        initializeQueue();
    };

    const getStatusIcon = () => {
        if (error) {
            return <XCircle className="w-8 h-8 text-red-500" />;
        }

        switch (queueStatus?.status) {
            case 'WAITING':
                return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
            case 'ACTIVE':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'EXPIRED':
                return <XCircle className="w-8 h-8 text-red-500" />;
            case 'CANCELLED':
                return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
            default:
                return <Users className="w-8 h-8 text-muted-foreground" />;
        }
    };

    const getStatusMessage = () => {
        if (error) {
            return error;
        }

        if (isInitializing) {
            return 'Joining queue...';
        }

        switch (queueStatus?.status) {
            case 'WAITING':
                if (queueStatus.positionInQueue === 0) {
                    return "It's your turn! Proceeding to seat selection...";
                }
                return `${queueStatus.positionInQueue} ${
                    queueStatus.positionInQueue === 1 ? 'person' : 'people'
                } ahead of you`;
            case 'ACTIVE':
                return 'Your session is active! You can now select seats.';
            case 'EXPIRED':
                return 'Your queue session has expired. Please try again.';
            case 'CANCELLED':
                return 'Queue session was cancelled.';
            default:
                return 'Connecting to queue...';
        }
    };

    // 전체 대기열 크기 추정 (실제로는 백엔드에서 제공해야 함)
    const estimatedTotalQueue = queueStatus ? queueStatus.positionInQueue + Math.floor(Math.random() * 50) + 20 : 100;
    const progressPercentage = queueStatus
        ? ((estimatedTotalQueue - queueStatus.positionInQueue) / estimatedTotalQueue) * 100
        : 0;

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" hideClose>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Queue System
                    </DialogTitle>
                    <DialogDescription>
                        {performance.title} 예매를 위해 대기열에 참여하고 있습니다.
                        현재 위치와 예상 대기시간을 확인하세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Queue Status */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            {getStatusIcon()}
                        </div>

                        <div className="space-y-2">
                            <p className="text-lg font-medium">
                                {getStatusMessage()}
                            </p>

                            {queueStatus && queueStatus.status === 'WAITING' && queueStatus.positionInQueue > 0 && (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">
                                            {queueStatus.positionInQueue}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            대기 순번
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>진행률</span>
                                            <span>{Math.round(progressPercentage)}%</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            예상 대기시간: {Math.ceil(queueStatus.estimatedWaitTime / 60)}분
                                        </span>
                                    </div>
                                </div>
                            )}

                            {queueStatus?.status === 'ACTIVE' && timeRemaining > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                                        예매 세션이 활성화되었습니다!
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-800 dark:text-green-200">
                                        <Clock className="w-4 h-4" />
                                        <span>남은 시간: {formatTime(timeRemaining)}</span>
                                    </div>
                                </div>
                            )}

                            {queueStatus?.status === 'EXPIRED' && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        세션이 만료되었습니다. 다시 대기열에 참여할 수 있습니다.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {error && (
                            <Button onClick={handleRetry} className="flex-1">
                                다시 시도
                            </Button>
                        )}

                        {queueStatus?.status === 'WAITING' && (
                            <Button
                                variant="outline"
                                onClick={handleLeaveQueue}
                                className="flex-1"
                            >
                                대기열 나가기
                            </Button>
                        )}

                        {(queueStatus?.status === 'EXPIRED' ||
                            queueStatus?.status === 'CANCELLED' ||
                            error) && (
                            <Button onClick={onClose} className="flex-1">
                                닫기
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}