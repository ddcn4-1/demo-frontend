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
import { Card, CardContent } from './ui/card';
import { Users, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Performance, PerformanceSchedule } from '../data/mockServer';

export interface QueueStatus {
    queueId: string;
    position: number; // 0 means it's your turn
    totalInQueue: number;
    estimatedWaitTime: number; // in seconds
    status:
        | 'WAITING_FOR_CONNECTION'
        | 'ENTER_QUEUE'
        | 'WAITING'
        | 'AVAILABLE'
        | 'EXPIRED'
        | 'COMPLETED';
    sessionEndTime?: Date;
}

interface QueuePopupProps {
    isOpen: boolean;
    performance: Performance;
    selectedSchedule?: PerformanceSchedule;
    onClose: () => void;
    onQueueComplete: (
        performance: Performance,
        schedule?: PerformanceSchedule
    ) => void;
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
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const queuePollRef = useRef<NodeJS.Timeout | null>(null);

    // Format time in MM:SS format
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
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

    // Poll queue status
    useEffect(() => {
        if (queueStatus && queueStatus.status === 'WAITING') {
            queuePollRef.current = setInterval(() => {
                pollQueueStatus();
            }, 2000); // Poll every 2 seconds

            return () => {
                if (queuePollRef.current) {
                    clearInterval(queuePollRef.current);
                }
            };
        }
    }, [queueStatus]);

    // Handle session timer when available
    useEffect(() => {
        if (queueStatus?.status === 'AVAILABLE' && queueStatus.sessionEndTime) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const endTime = new Date(queueStatus.sessionEndTime!).getTime();
                const remaining = Math.max(
                    0,
                    Math.floor((endTime - now) / 1000)
                );

                setTimeRemaining(remaining);

                if (remaining === 0) {
                    // Session expired
                    setQueueStatus((prev) =>
                        prev ? { ...prev, status: 'EXPIRED' } : null
                    );
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
    }, [queueStatus?.status, queueStatus?.sessionEndTime]);

    // Handle status changes
    useEffect(() => {
        if (queueStatus?.status === 'AVAILABLE' && queueStatus.position === 0) {
            // User reached front of queue, auto-proceed after 1 second
            setTimeout(() => {
                onQueueComplete(performance, selectedSchedule);
                cleanup();
            }, 1000);
        } else if (queueStatus?.status === 'EXPIRED') {
            // Queue expired
            setTimeout(() => {
                onQueueExpired();
                cleanup();
            }, 2000);
        }
    }, [queueStatus?.status, queueStatus?.position]);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (queuePollRef.current) {
            clearInterval(queuePollRef.current);
            queuePollRef.current = null;
        }
        setQueueStatus(null);
        setTimeRemaining(0);
    };

    const initializeQueue = async () => {
        console.log(
            'Initializing queue for performance:',
            performance.performance_id
        );

        // For demo reliability, always use the fallback queue system
        // This ensures the queue works consistently for testing
        const mockStatus = {
            queueId: `queue_${Date.now()}_${performance.performance_id}`,
            position: Math.floor(Math.random() * 8) + 1, // 1-8 people ahead
            totalInQueue: Math.floor(Math.random() * 30) + 15, // 15-45 total
            estimatedWaitTime: Math.floor(Math.random() * 240) + 60, // 1-5 minutes
            status: 'WAITING' as const,
        };

        console.log('Using demo queue status:', mockStatus);
        setQueueStatus(mockStatus);

        // Optional: Still try the real API in the background for testing, but don't block
        try {
            const authToken = localStorage.getItem('mockAuthToken');
            if (authToken) {
                const { serverAPI } = await import('../data/mockServer');
                const realQueueStatus = await serverAPI.joinQueue(
                    performance.performance_id,
                    selectedSchedule?.schedule_id
                );
                console.log(
                    'Real API queue status (background):',
                    realQueueStatus
                );
                // Use real status if available and valid
                if (realQueueStatus && realQueueStatus.queueId) {
                    setQueueStatus(realQueueStatus);
                }
            }
        } catch (error) {
            console.log(
                'Background API attempt failed (this is normal for demo):',
                error.message
            );
            // Keep using the fallback status - no error handling needed
        }
    };

    const pollQueueStatus = async () => {
        if (!queueStatus?.queueId) return;

        // For demo reliability, always use mock progress updates
        // This ensures consistent queue behavior for testing
        setQueueStatus((prev) => {
            if (!prev) return null;

            // Simulate queue progress - 30% chance to move forward each poll
            const shouldProgress = Math.random() > 0.7;
            const newPosition = shouldProgress
                ? Math.max(0, prev.position - 1)
                : prev.position;
            const newStatus = newPosition === 0 ? 'AVAILABLE' : prev.status;

            return {
                ...prev,
                position: newPosition,
                status: newStatus,
                estimatedWaitTime: Math.max(0, newPosition * 30), // Update estimated time
                sessionEndTime:
                    newStatus === 'AVAILABLE'
                        ? new Date(Date.now() + 10 * 60 * 1000)
                        : undefined, // 10 minutes from now
            };
        });

        // Optional: Try real API in background but don't let it break the experience
        try {
            const authToken = localStorage.getItem('mockAuthToken');
            if (authToken && queueStatus.queueId.startsWith('queue_real_')) {
                const { serverAPI } = await import('../data/mockServer');
                const updatedStatus = await serverAPI.getQueueStatus(
                    queueStatus.queueId
                );
                console.log(
                    'Real API poll result (background):',
                    updatedStatus
                );
                // Only use real status if it's valid
                if (
                    updatedStatus &&
                    typeof updatedStatus.position === 'number'
                ) {
                    setQueueStatus(updatedStatus);
                }
            }
        } catch (error) {
            console.log(
                'Background API poll failed (this is normal for demo):',
                error.message
            );
            // Continue with mock progress - no error handling needed
        }
    };

    const handleLeaveQueue = () => {
        // Optional: Call API to leave queue
        cleanup();
        onClose();
    };

    const getStatusIcon = () => {
        switch (queueStatus?.status) {
            case 'WAITING':
                return (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                );
            case 'AVAILABLE':
                return <CheckCircle className="w-8 h-8 text-green-500" />;
            case 'EXPIRED':
                return <XCircle className="w-8 h-8 text-red-500" />;
            default:
                return <Users className="w-8 h-8 text-muted-foreground" />;
        }
    };

    const getStatusMessage = () => {
        switch (queueStatus?.status) {
            case 'WAITING_FOR_CONNECTION':
                return 'Connecting to queue...';
            case 'ENTER_QUEUE':
                return 'Joining queue...';
            case 'WAITING':
                if (queueStatus.position === 0) {
                    return "It's your turn! Proceeding to seat selection...";
                }
                return `${queueStatus.position} ${
                    queueStatus.position === 1 ? 'person' : 'people'
                } ahead of you`;
            case 'AVAILABLE':
                return 'Your session is active! You can now select seats.';
            case 'EXPIRED':
                return 'Your queue session has expired. Please try again.';
            default:
                return 'Preparing queue...';
        }
    };

    const progressPercentage = queueStatus
        ? ((queueStatus.totalInQueue - queueStatus.position) /
              queueStatus.totalInQueue) *
          100
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
                        Please wait in the queue to secure your seat selection
                        session. Your position and estimated wait time will be
                        displayed below.
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

                            {queueStatus &&
                                queueStatus.status === 'WAITING' &&
                                queueStatus.position > 0 && (
                                    <div className="space-y-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">
                                                {queueStatus.position} /{' '}
                                                {queueStatus.totalInQueue}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                People in queue
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Queue Progress</span>
                                                <span>
                                                    {Math.round(
                                                        progressPercentage
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={progressPercentage}
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                Estimated wait:{' '}
                                                {Math.ceil(
                                                    queueStatus.estimatedWaitTime /
                                                        60
                                                )}{' '}
                                                minutes
                                            </span>
                                        </div>
                                    </div>
                                )}

                            {queueStatus?.status === 'EXPIRED' && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        Queue session expired. You can try
                                        joining the queue again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {queueStatus?.status === 'WAITING' && (
                            <Button
                                variant="outline"
                                onClick={handleLeaveQueue}
                                className="flex-1"
                            >
                                Leave Queue
                            </Button>
                        )}

                        {(queueStatus?.status === 'EXPIRED' ||
                            queueStatus?.status === 'COMPLETED') && (
                            <Button onClick={onClose} className="flex-1">
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
