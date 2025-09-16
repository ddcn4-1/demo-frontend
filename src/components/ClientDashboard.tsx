import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { PerformanceList } from './PerformanceList';
import { BookingHistory } from './BookingHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LogIn } from 'lucide-react';
import { User, Performance, PerformanceSchedule } from './type/index';

interface ClientDashboardProps {
    user: User | null;
    onOpenQueue?: (
        performance: Performance,
        selectedSchedule?: PerformanceSchedule
    ) => void;
}

export function ClientDashboard({ user, onOpenQueue }: ClientDashboardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('performances');

    // Read tab from URL params and handle authentication requirements
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'history' && !user) {
            // Redirect to login if trying to access history without authentication
            navigate('/login', { state: { from: location } });
            return;
        }
        if (tab && (tab === 'performances' || tab === 'history')) {
            setActiveTab(tab);
        }
    }, [searchParams, user, navigate, location]);

    const handleTabChange = (value: string) => {
        if (value === 'history' && !user) {
            navigate('/login', { state: { from: location } });
            return;
        }
        setActiveTab(value);
        setSearchParams({ tab: value });
    };

    const handlePerformanceSelect = (performance: Performance) => {
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        // 큐 시스템이 있으면 큐를 사용, 없으면 직접 이동
        if (onOpenQueue) {
            // 첫 번째 사용 가능한 스케줄을 찾아서 큐에 전달
            const availableSchedule = performance.schedules?.find(
                (schedule) =>
                    schedule.available_seats > 0 && schedule.status === 'OPEN'
            );
            onOpenQueue(performance, availableSchedule);
        } else {
            // 폴백: 직접 예약 페이지로 이동
            navigate(`/performances/${performance.performance_id}/booking`, {
                state: { performance },
            });
        }
    };

    const handleViewDetails = (performance: Performance) => {
        navigate(`/performances/${performance.performance_id}`, {
            state: { performance },
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Client Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    {user ? (
                        // Authenticated users get tabs
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="performances">
                                    Browse Performances
                                </TabsTrigger>
                                <TabsTrigger value="history">
                                    My Bookings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="performances"
                                className="space-y-4"
                            >
                                <PerformanceList
                                    onSelectPerformance={
                                        handlePerformanceSelect
                                    }
                                    onViewDetails={handleViewDetails}
                                />
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <BookingHistory userId={user.user_id} />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // Non-authenticated users see the same performance list, just without tabs
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium">
                                    Browse Performances
                                </h3>
                                <Button onClick={() => navigate('/login')}>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login to Book
                                </Button>
                            </div>
                            <PerformanceList
                                onSelectPerformance={handlePerformanceSelect}
                                onViewDetails={handleViewDetails}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
