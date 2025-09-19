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
import QueueLifecycleHandler from './QueueLifecycleHandler';

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

    // 대기 상태 자동 이동용 카운트다운 (10초)
    const [waitingCountdown, setWaitingCountdown] = useState<number>(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const stopPollingRef = useRef<(() => void) | null>(null);
    const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 자동 이동용

    // 생명주기 관리용 상태
    const [isActiveSession, setIsActiveSession] = useState(false);

    // Format time in MM:SS format
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 세션 손실 처리
    const handleSessionLost = () => {
        console.log('Session lost detected');
        setError('연결이 끊어졌습니다. 대기열에 다시 참여해주세요.');
        setIsActiveSession(false);
        cleanup();
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
                    setIsActiveSession(false);
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
            setIsActiveSession(true);
            // User can now book - proceed after showing message for 2 seconds
            setTimeout(() => {
                onQueueComplete(performance, selectedSchedule);
                cleanup();
            }, 2000);
        } else if (queueStatus?.status === 'EXPIRED') {
            setIsActiveSession(false);
            // Queue expired
            setTimeout(() => {
                onQueueExpired();
                cleanup();
            }, 3000);
        } else if (queueStatus?.status === 'WAITING') {
            // 대기 상태에서도 heartbeat 필요 (이후 선택)
            setIsActiveSession(false);
        }
    }, [queueStatus?.status, queueStatus?.isActiveForBooking]);


    // 대기 상태에서 10초 카운트다운 처리
    useEffect(() => {
        if (queueStatus?.status === 'WAITING') {
            console.log('Starting 10 second countdown for WAITING status');
            setWaitingCountdown(10);

            // 1초마다 카운트다운
            const countdownInterval = setInterval(() => {
                setWaitingCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        console.log('Countdown finished, proceeding to booking');
                        // 10초 후 자동으로 예매 창으로 이동
                        onQueueComplete(performance, selectedSchedule);
                        cleanup();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        } else {
            setWaitingCountdown(0);
        }
    }, [queueStatus?.status]);


    // cleanup 함수에 카운트다운 정리 추가
    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (stopPollingRef.current) {
            stopPollingRef.current();
            stopPollingRef.current = null;
        }
        if (waitingTimeoutRef.current) {
            clearTimeout(waitingTimeoutRef.current);
            waitingTimeoutRef.current = null;
        }
        setQueueStatus(null);
        setTimeRemaining(0);
        setWaitingCountdown(0);
        setError(null);
        setIsInitializing(false);
        setIsActiveSession(false);
    };

    const initializeQueue = async () => {
        console.log('Queue initialization started:', {
            performanceId: performance.performance_id,
            scheduleId: selectedSchedule?.schedule_id,
            timestamp: new Date().toISOString()
        });

        setIsInitializing(true);
        setError(null);

        try {
            if (!selectedSchedule) {
                throw new Error('Schedule not selected');
            }

            console.log('Requesting booking token...');

            const checkResponse = await queueService.checkQueueRequirement(
                performance.performance_id,
                selectedSchedule.schedule_id
            );

            console.log('Token response:', {
                success: checkResponse.success,
                canProceedDirectly: checkResponse.data?.canProceedDirectly,
                requiresQueue: checkResponse.data?.requiresQueue,
                sessionId: checkResponse.data?.sessionId, // 토큰
                currentSessions: checkResponse.data?.currentActiveSessions,
                maxSessions: checkResponse.data?.maxConcurrentSessions
            });

            if (checkResponse.success && checkResponse.data) {
                const token = checkResponse.data.sessionId; // 항상 토큰 받음

                if (checkResponse.data.canProceedDirectly) {
                    // Direct 입장 (ACTIVE 토큰)
                    console.log('Direct access granted with ACTIVE token:', token);

                    setIsActiveSession(true);
                    // 즉시 좌석 선택으로 이동
                    onQueueComplete(performance, selectedSchedule);
                    cleanup();

                } else if (checkResponse.data.requiresQueue) {
                    // 대기열 진입 (WAITING 토큰)
                    console.log('Entering queue with WAITING token:', token);

                    // QueueStatusResponse 생성 (타입 변환)
                    const queueStatusResponse: QueueStatusResponse = {
                        token: token,
                        status: 'WAITING', // 백엔드에서 WAITING 토큰 발급됨
                        positionInQueue: checkResponse.data.currentWaitingCount || 1,
                        estimatedWaitTime: checkResponse.data.estimatedWaitTime || 0,
                        isActiveForBooking: false,
                        bookingExpiresAt: null,
                        performanceTitle: performance.title
                    };

                    setQueueStatus(queueStatusResponse);

                    // 대기열 상태 폴링 시작
                    startPolling(token);
                }
            } else {
                throw new Error(checkResponse.error || 'Failed to get booking token');
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

        const onPollingError = (errorMessage: string) => {
            console.error('Polling error:', errorMessage);
            setError(errorMessage);
        };

        // 향상된 폴링 사용 (재시도 기능 포함) 3000ms 간격
        queueService.pollQueueStatusWithRetry(token, onStatusUpdate, onPollingError, 3000)
            .then(stopFunction => {
                stopPollingRef.current = stopFunction;
            })
            .catch(error => {
                console.error('Polling setup error:', error);
                setError('대기열 상태 확인에 실패했습니다.');
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
                const position = queueStatus.positionInQueue ?? 1;
                if (waitingCountdown > 0) {
                    return `대기열 처리 중... ${waitingCountdown}초 후 예매 화면으로 이동합니다.`;
                }
                return `${position} ${position === 1 ? 'person' : 'people'} ahead of you`;
            case 'ACTIVE':
                return '이제 자리를 선택할 수 있습니다.';
            case 'EXPIRED':
                return 'Your queue session has expired. 다시 시도해주세요';
            case 'CANCELLED':
                return 'Queue session 취소되었습니다.';
            default:
                return '큐 연결 중 ...';
        }
    };


    const safePosition = queueStatus?.positionInQueue ?? 1;
    const safeEstimatedTime = queueStatus?.estimatedWaitTime ?? 60; // 기본 1분

    const estimatedTotalQueue = safePosition + Math.floor(Math.random() * 50) + 20;
    /*const progressPercentage = Math.max(0, Math.min(100,
        ((estimatedTotalQueue - safePosition) / estimatedTotalQueue) * 100
    ));*/

    // Progress bar에 카운트다운 표시 추가
    const shouldShowProgress = queueStatus?.status === 'WAITING' || queueStatus?.status === 'ACTIVE';

    // 카운트다운 중일 때는 카운트다운 진행률 표시
    const progressPercentage = waitingCountdown > 0
        ? ((10 - waitingCountdown) / 10) * 100
        : Math.max(0, Math.min(100, ((estimatedTotalQueue - safePosition) / estimatedTotalQueue) * 100));


    return (
        <>
            {/* 생명주기 관리 컴포넌트 */}
            <QueueLifecycleHandler
                performance={performance}
                selectedSchedule={selectedSchedule}
                isActive={isActiveSession}
                isWaiting={queueStatus?.status === 'WAITING'} // 대기 상태 추가
                onSessionLost={handleSessionLost}
            />

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

                                {shouldShowProgress && (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">
                                                {safePosition}
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

                {/*                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">*/}
                {/*                            <Clock className="w-4 h-4" />*/}
                {/*                            <span>*/}
                {/*    예상 대기시간: {Math.ceil(safeEstimatedTime / 60)}분*/}
                {/*</span>*/}
                {/*                        </div>*/}
                                    </div>
                                )}

                                {queueStatus?.status === 'ACTIVE' && timeRemaining > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                                            예매 세션이 활성화되었습니다!
                                        </p>
                                        {/*<div className="flex items-center justify-center gap-2 text-sm font-medium text-green-800 dark:text-green-200">*/}
                                        {/*    <Clock className="w-4 h-4" />*/}
                                        {/*    <span>남은 시간: {formatTime(timeRemaining)}</span>*/}
                                        {/*</div>*/}
                                        <div className="mt-2 text-xs text-green-600 dark:text-green-400 text-center">
                                            페이지를 새로고침하거나 벗어나지 마세요
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
                                        {error.includes('새로고침') && (
                                            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                                연결 상태를 확인하고 다시 시도해주세요
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 활성 세션 중 추가 안내 */}
                                {isActiveSession && queueStatus?.status === 'ACTIVE' && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span>세션 활성화됨 - 연결 유지 중</span>
                                        </div>
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

                        {/* 대기 중 유의사항 */}
                        {(queueStatus?.status === 'WAITING' || queueStatus?.status === 'ACTIVE') && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                    💡 대기열 진행 중에는 페이지를 새로고침하거나 다른 탭으로 이동하지 마세요.
                                    순서를 잃을 수 있습니다.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}