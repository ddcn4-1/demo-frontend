import { useEffect, useRef, useCallback } from 'react';
import { queueService } from './service/queueService';
import { Performance, PerformanceSchedule } from './type';

interface QueueLifecycleHandlerProps {
    performance: Performance | null;
    selectedSchedule?: PerformanceSchedule;
    isActive: boolean; // 대기열이 활성 상태인지
    onSessionLost: () => void; // 세션이 손실되었을 때 호출
}

export function QueueLifecycleHandler({
                                          performance,
                                          selectedSchedule,
                                          isActive,
                                          onSessionLost
                                      }: QueueLifecycleHandlerProps) {
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isUnloadingRef = useRef(false);

    // Heartbeat 전송
    const sendHeartbeat = useCallback(async () => {
        if (!performance || !selectedSchedule || !isActive) return;

        try {
            await queueService.updateHeartbeat(
                performance.performance_id,
                selectedSchedule.schedule_id
            );
            console.log('Heartbeat sent successfully');
        } catch (error) {
            console.error('Heartbeat failed:', error);
            // 연속된 heartbeat 실패 시 세션 손실 처리
            onSessionLost();
        }
    }, [performance, selectedSchedule, isActive, onSessionLost]);

    // 세션 해제
    const releaseSession = useCallback(async () => {
        if (!performance || !selectedSchedule || isUnloadingRef.current) return;

        isUnloadingRef.current = true;

        try {
            await queueService.releaseSession(
                performance.performance_id,
                selectedSchedule.schedule_id
            );
            console.log('Session released successfully');
        } catch (error) {
            console.error('Session release failed:', error);
        }
    }, [performance, selectedSchedule]);

    // 페이지 언로드 처리 (새로고침, 브라우저 닫기, 탭 닫기)
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isActive && performance && selectedSchedule) {
                // 동기적으로 세션 해제 신호 전송
                navigator.sendBeacon(
                    `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/v1/queue/release-session`,
                    JSON.stringify({
                        performanceId: performance.performance_id,
                        scheduleId: selectedSchedule.schedule_id,
                        reason: 'page_unload'
                    })
                );

                // 사용자에게 경고 메시지 표시 (선택사항)
                event.preventDefault();
                event.returnValue = '대기열에서 나가시겠습니까? 다시 대기해야 할 수 있습니다.';
                return event.returnValue;
            }
        };

        const handleUnload = () => {
            if (isActive && performance && selectedSchedule) {
                // 마지막 시도로 beacon 전송
                navigator.sendBeacon(
                    `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/v1/queue/release-session`,
                    JSON.stringify({
                        performanceId: performance.performance_id,
                        scheduleId: selectedSchedule.schedule_id,
                        reason: 'page_unload'
                    })
                );
            }
        };

        if (isActive) {
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('unload', handleUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [isActive, performance, selectedSchedule]);

    // 페이지 가시성 변경 처리 (탭 전환)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isActive) {
                // 탭이 숨겨졌을 때 - heartbeat 간격 증가
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 10000); // 10초 간격
                }
            } else if (!document.hidden && isActive) {
                // 탭이 다시 보일 때 - 정상 heartbeat 간격
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5000); // 5초 간격
                }
                // 즉시 heartbeat 전송
                sendHeartbeat();
            }
        };

        if (isActive) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, sendHeartbeat]);

    // Heartbeat 시작/중지
    useEffect(() => {
        if (isActive && performance && selectedSchedule) {
            // Heartbeat 시작
            sendHeartbeat(); // 즉시 한 번 전송
            heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5000); // 5초 간격

            console.log('Heartbeat started for performance:', performance.performance_id);
        } else {
            // Heartbeat 중지
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
    }, [isActive, performance, selectedSchedule, sendHeartbeat]);

    // 컴포넌트 언마운트 시 세션 해제
    useEffect(() => {
        return () => {
            if (isActive && !isUnloadingRef.current) {
                releaseSession();
            }
        };
    }, [isActive, releaseSession]);

    // Focus/Blur 이벤트 처리 (창 포커스 관리)
    useEffect(() => {
        const handleFocus = () => {
            if (isActive) {
                console.log('Window focused - sending heartbeat');
                sendHeartbeat();
            }
        };

        const handleBlur = () => {
            if (isActive) {
                console.log('Window blurred');
                // 필요시 추가 로직
            }
        };

        if (isActive) {
            window.addEventListener('focus', handleFocus);
            window.addEventListener('blur', handleBlur);
        }

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [isActive, sendHeartbeat]);

    return null; // UI를 렌더링하지 않음
}

export default QueueLifecycleHandler;