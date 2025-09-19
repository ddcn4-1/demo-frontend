// src/components/TestConcurrency.tsx
// 개발 환경에서만 사용하는 대기열 테스트 컴포넌트

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { queueService } from './service/queueService';

interface TestResult {
    userId: number;
    canProceed?: boolean;
    requiresQueue?: boolean;
    currentSessions?: number;
    maxSessions?: number;
    message?: string;
    error?: string;
}

export function TestConcurrency() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<TestResult[]>([]);
    const [summary, setSummary] = useState<{
        direct: number;
        queue: number;
        errors: number;
    }>({ direct: 0, queue: 0, errors: 0 });

    // 현재 상태 확인
    const checkCurrentStatus = async () => {
        setIsLoading(true);
        try {
            const response = await queueService.checkQueueRequirement(2, 3);

            console.log('📊 현재 시스템 상태:', {
                '현재 활성 세션': response.data?.currentActiveSessions || 0,
                '최대 세션': response.data?.maxConcurrentSessions || 0,
                '대기열 필요': response.data?.requiresQueue ? 'Yes' : 'No',
                '바로 진입': response.data?.canProceedDirectly ? 'Yes' : 'No',
                '사유': response.data?.reason || '-'
            });

            alert(`현재 활성 세션: ${response.data?.currentActiveSessions || 0}/${response.data?.maxConcurrentSessions || 0}`);
        } catch (error) {
            console.error('상태 확인 실패:', error);
            alert('상태 확인 실패: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 동시성 테스트 (15명)
    const runConcurrencyTest = async () => {
        setIsLoading(true);
        setResults([]);

        try {
            console.log('🚀 15명 동시 접속 테스트 시작...');

            const promises = [];

            for (let i = 1; i <= 15; i++) {
                const promise = queueService.checkQueueRequirement(2, 3)
                    .then(response => ({
                        userId: i,
                        canProceed: response.data?.canProceedDirectly,
                        requiresQueue: response.data?.requiresQueue,
                        currentSessions: response.data?.currentActiveSessions,
                        maxSessions: response.data?.maxConcurrentSessions,
                        message: response.data?.message,
                        success: response.success
                    }))
                    .catch(error => ({
                        userId: i,
                        error: error.message
                    }));

                promises.push(promise);
            }

            const testResults = await Promise.all(promises);
            setResults(testResults);

            // 결과 분석
            const directAccess = testResults.filter(r => r.canProceed === true);
            const queueRequired = testResults.filter(r => r.requiresQueue === true);
            const errors = testResults.filter(r => r.error);

            setSummary({
                direct: directAccess.length,
                queue: queueRequired.length,
                errors: errors.length
            });

            console.log('=== 📊 테스트 결과 ===');
            console.log(`✅ 바로 진입: ${directAccess.length}명`);
            console.log(`⏳ 대기열 필요: ${queueRequired.length}명`);
            console.log(`❌ 오류: ${errors.length}명`);

        } catch (error) {
            console.error('테스트 실패:', error);
            alert('테스트 실패: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 활성 세션을 최대치로 채우기 곧 대체
    const fillActiveSessions = async () => {
        setIsLoading(true);

        try {
            console.log('🔥 활성 세션을 최대치로 채우는 중...');

            const promises = [];
            for (let i = 1; i <= 15; i++) {
                promises.push(queueService.checkQueueRequirement(2, 3));
            }

            const results = await Promise.all(promises);
            const directCount = results.filter(r => r.data?.canProceedDirectly).length;

            alert(`${directCount}명이 활성 세션에 진입했습니다. 이제 새로운 사용자는 대기열에 진입합니다!`);

        } catch (error) {
            console.error('세션 채우기 실패:', error);
            alert('실패: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    // 실제 토큰 발급으로 세션 채우기 변경 예정
    const fillWithRealTokens = async () => {
        console.log('🔥 실제 토큰으로 세션 채우기...');

        const promises = [];
        for (let i = 1; i <= 25; i++) { // 20개 초과하도록
            // 실제 토큰 발급 API 호출
            promises.push(queueService.issueToken(2)); // performanceId = 2
        }

        const results = await Promise.all(promises);
        const activeTokens = results.filter(r => r.data?.status === 'ACTIVE').length;
        const waitingTokens = results.filter(r => r.data?.status === 'WAITING').length;

        alert(`활성 토큰: ${activeTokens}개, 대기 토큰: ${waitingTokens}개`);
    };


    //todo. 삭제 필요 TestConcurrency.tsx에서
    const runProperConcurrencyTest = async () => {
        // 1. 먼저 기존 세션들을 가득 채움 (20개)
        await fillActiveSessions();

        // 2. 새로운 사용자로 로그인하여 테스트
        // 3. 이때 대기열에 진입해야 함
    };

    // 대기열 토큰 발급 테스트
    const testQueueToken = async () => {
        setIsLoading(true);

        try {
            console.log('🎫 대기열 토큰 발급 테스트...');

            const response = await queueService.issueToken(1);

            if (response.success) {
                console.log('✅ 대기열 토큰 발급 성공!');
                console.log('📋 토큰 정보:', {
                    token: response.data.token,
                    status: response.data.status,
                    position: response.data.positionInQueue,
                    waitTime: response.data.estimatedWaitTime,
                    message: response.data.message
                });

                alert(`토큰 발급 성공!\n상태: ${response.data.status}\n순서: ${response.data.positionInQueue}\n예상 대기: ${response.data.estimatedWaitTime}분`);
            } else {
                alert('토큰 발급 실패: ' + response.error);
            }

        } catch (error) {
            console.error('토큰 발급 오류:', error);
            alert('오류: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Heartbeat 테스트
    const testHeartbeat = async () => {
        setIsLoading(true);

        try {
            const response = await queueService.updateHeartbeat(1, 1);
            alert(`Heartbeat 결과: ${response.data || response.message}`);
        } catch (error) {
            console.error('Heartbeat 실패:', error);
            alert('Heartbeat 실패: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 세션 정리
    const clearSessions = async () => {
        setIsLoading(true);

        try {
            const response = await queueService.clearSessions();
            alert(`세션 정리 완료: ${response.message}`);
        } catch (error) {
            console.error('세션 정리 실패:', error);
            alert('세션 정리 실패: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 개발 환경이 아니면 컴포넌트를 렌더링하지 않음
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🧪 대기열 시스템 테스트
                        <Badge variant="secondary">개발 전용</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 기본 테스트 버튼들 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button
                            onClick={checkCurrentStatus}
                            disabled={isLoading}
                            variant="outline"
                        >
                            📊 현재 상태 확인
                        </Button>

                        <Button
                            onClick={fillWithRealTokens}
                            disabled={isLoading}
                            variant="outline"
                        >
                            🔥 세션 가득 채우기
                        </Button>

                        <Button
                            onClick={runConcurrencyTest}
                            disabled={isLoading}
                        >
                            🚀 동시성 테스트
                        </Button>

                        <Button
                            onClick={testQueueToken}
                            disabled={isLoading}
                            variant="outline"
                        >
                            🎫 토큰 발급 테스트
                        </Button>

                        <Button
                            onClick={testHeartbeat}
                            disabled={isLoading}
                            variant="outline"
                        >
                            💓 Heartbeat 테스트
                        </Button>

                        <Button
                            onClick={clearSessions}
                            disabled={isLoading}
                            variant="destructive"
                        >
                            🧹 세션 정리
                        </Button>
                    </div>

                    {/* 테스트 결과 요약 */}
                    {results.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">📊 테스트 결과</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{summary.direct}</div>
                                        <div className="text-sm text-muted-foreground">바로 진입</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{summary.queue}</div>
                                        <div className="text-sm text-muted-foreground">대기열 필요</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                                        <div className="text-sm text-muted-foreground">오류</div>
                                    </div>
                                </div>

                                {/* 상세 결과 */}
                                <div className="max-h-60 overflow-y-auto">
                                    <div className="grid gap-2">
                                        {results.map((result, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="font-mono">사용자 {result.userId}</span>
                                                {result.canProceed && <Badge variant="default">바로 진입</Badge>}
                                                {result.requiresQueue && <Badge variant="secondary">대기열</Badge>}
                                                {result.error && <Badge variant="destructive">오류</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 사용 가이드 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">🎯 테스트 가이드</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>1단계:</strong> "현재 상태 확인"으로 시스템 상태 파악</p>
                            <p><strong>2단계:</strong> "세션 가득 채우기"로 활성 세션을 최대치로 만듦</p>
                            <p><strong>3단계:</strong> 이제 UI에서 "예매하기" 클릭 → 대기열 팝업 확인!</p>
                            <p><strong>4단계:</strong> "토큰 발급 테스트"로 대기열 토큰 직접 체험</p>
                            <p className="text-muted-foreground">※ 테스트 후 "세션 정리"로 초기화 권장</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}