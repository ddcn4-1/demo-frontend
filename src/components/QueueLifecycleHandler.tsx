import React, { useEffect, useRef, useCallback } from 'react';
import { queueService } from './service/queueService';
import { Performance, PerformanceSchedule } from './type';

interface QueueLifecycleHandlerProps {
    performance: Performance;
    selectedSchedule?: PerformanceSchedule;
    isActive: boolean;
    isWaiting?: boolean; // 대기 상태 추가
    onSessionLost: () => void;
}

const QueueLifecycleHandler: React.FC<QueueLifecycleHandlerProps> = ({
                                                                         performance,
                                                                         selectedSchedule,
                                                                         isActive,
                                                                         isWaiting = false, // 대기 상태
                                                                         onSessionLost,
                                                                     }) => {
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isUnmountingRef = useRef(false);

    const sendHeartbeat = useCallback(async () => {
        if (!selectedSchedule || isUnmountingRef.current) return;

        try {
            await queueService.updateHeartbeat(
                performance.performance_id,
                selectedSchedule.schedule_id
            );
            console.log('Heartbeat sent successfully');
        } catch (error) {
            console.error('Heartbeat failed:', error);
            // 연속된 heartbeat 실패 시 세션 손실로 처리
            if (error.message?.includes('연속된 heartbeat 실패')) {
                onSessionLost();
            }
        }
    }, [performance.performance_id, selectedSchedule?.schedule_id, onSessionLost]);

    // Heartbeat 시작/중지
    useEffect(() => {
        // 활성 상태이거나 대기 상태일 때 heartbeat 전송
        if ((isActive || isWaiting) && selectedSchedule) {
            console.log('Starting heartbeat for session...');

            // 즉시 한 번 전송
            sendHeartbeat();

            // 30초마다 heartbeat 전송
            heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);
        } else {
            // heartbeat 중지
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
                console.log('Heartbeat stopped');
            }
        }

        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
            }
        };
    }, [isActive, isWaiting, sendHeartbeat, selectedSchedule]);

    // 컴포넌트 언마운트 시 세션 해제
    useEffect(() => {
        const handleUnload = async () => {
            if (selectedSchedule && (isActive || isWaiting)) {
                isUnmountingRef.current = true;
                const beaconSent = queueService.sendSessionReleaseBeacon(
                    performance.performance_id,
                    selectedSchedule.schedule_id
                );
                if (!beaconSent) {
                    try {
                        await queueService.releaseSession(
                            performance.performance_id,
                            selectedSchedule.schedule_id,
                            'component_unmount'
                        );
                    } catch (error) {
                        console.error('Failed to release session on unmount:', error);
                    }
                }
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pagehide', handleUnload);   // iOS/Safari 대응
        window.addEventListener('popstate', handleUnload);   // 브라우저 뒤로가기

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('pagehide', handleUnload);
            window.removeEventListener('popstate', handleUnload);
        };
    }, [performance.performance_id, selectedSchedule, isActive, isWaiting]);

    return null;
};

export default QueueLifecycleHandler;