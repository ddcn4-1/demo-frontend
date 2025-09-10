import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    Info,
    Ticket,
} from 'lucide-react';
import { Performance, PerformanceSchedule } from './type/index';

interface PerformanceDetailProps {
    performance: Performance;
    onBack: () => void;
    onBookNow: (
        performance: Performance,
        schedule?: PerformanceSchedule
    ) => void;
}

export function PerformanceDetail({
    performance,
    onBack,
    onBookNow,
}: PerformanceDetailProps) {
    const [selectedSchedule, setSelectedSchedule] =
        useState<PerformanceSchedule | null>(null);

    const totalSeats =
        performance.schedules?.reduce(
            (sum, schedule) => sum + (schedule.total_seats || 0),
            0
        ) || 0;

    const availableSeats =
        performance.schedules?.reduce(
            (sum, schedule) => sum + (schedule.available_seats || 0),
            0
        ) || 0;

    const bookedSeats = totalSeats - availableSeats;
    const occupancyRate = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

    const formatDate = (dateString: string) => {
        if (!dateString) return '날짜 미정';
        try {
            return new Date(dateString).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return '날짜 오류';
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '시간 미정';
        try {
            return new Date(dateString).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '시간 오류';
        }
    };

    const formatPrice = (price: number) => {
        if (!price || price === 0) return '가격 미정';
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'SCHEDULED':
            case 'OPEN':
                return 'default';
            case 'ONGOING':
                return 'default';
            case 'COMPLETED':
            case 'CLOSED':
                return 'secondary';
            case 'CANCELLED':
                return 'destructive';
            case 'SOLDOUT':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusLabels: Record<string, string> = {
            SCHEDULED: 'Available',
            OPEN: 'Available',
            ONGOING: 'In Progress',
            COMPLETED: 'Completed',
            CLOSED: 'Completed',
            CANCELLED: 'Cancelled',
            SOLDOUT: 'Sold Out',
        };
        return statusLabels[status?.toUpperCase()] || status || 'Unknown';
    };

    // data log
    console.log('PerformanceDetail - Received performance data:', performance);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Performances
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Performance Header */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex gap-6">
                                <div className="w-48 h-72 flex-shrink-0">
                                    <img
                                        src={
                                            performance.poster_url ||
                                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
                                        }
                                        alt={performance.title}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h1 className="text-3xl font-medium">
                                                {performance.title}
                                            </h1>
                                            <Badge
                                                variant={getStatusColor(
                                                    performance.status
                                                )}
                                            >
                                                {getStatusLabel(
                                                    performance.status
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="text-lg text-muted-foreground">
                                            {performance.description}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-muted-foreground" />
                                            <span className="font-medium">
                                                {performance.venue_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Ticket className="w-5 h-5 text-muted-foreground" />
                                            <span className="font-medium">
                                                {formatPrice(
                                                    performance.base_price
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {performance.theme}
                                        </Badge>
                                        {performance.theme && (
                                            <Badge variant="secondary">
                                                {performance.theme}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Available Schedules */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Available Show Times
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {performance.schedules &&
                                performance.schedules.length > 0 ? (
                                    performance.schedules.map((schedule) => (
                                        <div
                                            key={schedule.schedule_id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedSchedule?.schedule_id ===
                                                schedule.schedule_id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            } ${
                                                schedule.available_seats ===
                                                    0 ||
                                                schedule.status === 'SOLDOUT'
                                                    ? 'opacity-60 cursor-not-allowed'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                if (
                                                    schedule.available_seats >
                                                        0 &&
                                                    schedule.status !==
                                                        'SOLDOUT'
                                                ) {
                                                    setSelectedSchedule(
                                                        schedule
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            {formatDate(
                                                                schedule.show_datetime
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatTime(
                                                                schedule.show_datetime
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={getStatusColor(
                                                            schedule.status
                                                        )}
                                                        className="text-xs"
                                                    >
                                                        {getStatusLabel(
                                                            schedule.status
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Price:</span>
                                                        <span className="font-medium">
                                                            {formatPrice(
                                                                performance.base_price
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Available:</span>
                                                        <span
                                                            className={
                                                                schedule.available_seats >
                                                                0
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }
                                                        >
                                                            {
                                                                schedule.available_seats
                                                            }{' '}
                                                            /{' '}
                                                            {
                                                                schedule.total_seats
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                {(schedule.available_seats ===
                                                    0 ||
                                                    schedule.status ===
                                                        'SOLDOUT') && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="w-full justify-center"
                                                    >
                                                        Sold Out
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        No schedules available for this
                                        performance.
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                Select a show time to view details and book
                                tickets for that specific performance.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Performance Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                Performance Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">
                                    About This Performance
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {performance.description ||
                                        "This is an exciting performance that promises to deliver an unforgettable experience. Join us for an evening of world-class entertainment featuring talented performers and stunning production values. Don't miss this opportunity to be part of something truly special."}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-medium mb-2">
                                        Duration
                                    </h4>
                                    <p className="text-muted-foreground">
                                        {performance.running_time > 0
                                            ? `${performance.running_time} minutes`
                                            : '시간 미정'}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Theme</h4>
                                    <p className="text-muted-foreground">
                                        {performance.theme}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Status</h4>
                                    <Badge
                                        variant={getStatusColor(
                                            performance.status
                                        )}
                                    >
                                        {getStatusLabel(performance.status)}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Venue Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Venue Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">
                                    {performance.venue_name ||
                                        performance.venue}
                                </h3>
                                <div className="grid gap-2 text-sm text-muted-foreground">
                                    {/* 선택된 스케줄이 있으면 해당 스케줄 정보, 없으면 전체 정보 */}
                                    {selectedSchedule ? (
                                        <>
                                            <p>
                                                Total Capacity:{' '}
                                                {selectedSchedule.total_seats}{' '}
                                                seats
                                            </p>
                                            <p>
                                                Available:{' '}
                                                {
                                                    selectedSchedule.available_seats
                                                }{' '}
                                                seats
                                            </p>
                                            <p>
                                                Booked:{' '}
                                                {selectedSchedule.total_seats -
                                                    selectedSchedule.available_seats}{' '}
                                                seats
                                            </p>
                                            <p>
                                                Occupancy:{' '}
                                                {selectedSchedule.total_seats >
                                                0
                                                    ? (
                                                          ((selectedSchedule.total_seats -
                                                              selectedSchedule.available_seats) /
                                                              selectedSchedule.total_seats) *
                                                          100
                                                      ).toFixed(1)
                                                    : 0}
                                                %
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p>
                                                Total Shows:{' '}
                                                {performance.schedules
                                                    ?.length || 0}
                                            </p>
                                            <p>
                                                Total Available Seats:{' '}
                                                {performance.schedules?.reduce(
                                                    (sum, schedule) =>
                                                        sum +
                                                        (schedule.available_seats ||
                                                            0),
                                                    0
                                                ) || 0}{' '}
                                                seats
                                            </p>
                                            <p>
                                                Average Capacity per Show:{' '}
                                                {performance.schedules?.length >
                                                0
                                                    ? Math.round(
                                                          performance.schedules.reduce(
                                                              (sum, schedule) =>
                                                                  sum +
                                                                  (schedule.total_seats ||
                                                                      0),
                                                              0
                                                          ) /
                                                              performance
                                                                  .schedules
                                                                  .length
                                                      )
                                                    : 0}{' '}
                                                seats
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {performance.venue_address && (
                                <div>
                                    <h4 className="font-medium mb-2">
                                        Address
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {performance.venue_address}
                                    </p>
                                </div>
                            )}

                            <div className="bg-muted rounded-lg p-4">
                                <h4 className="font-medium mb-2">
                                    Getting There
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Please arrive at least 30 minutes before the
                                    performance begins. Late arrivals may not be
                                    admitted until a suitable break in the
                                    performance.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Book Your Seats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* 선택된 스케줄 정보 표시 */}
                            {selectedSchedule ? (
                                <>
                                    <div className="text-center">
                                        <div className="text-2xl font-medium mb-1">
                                            {formatPrice(
                                                selectedSchedule.base_price ||
                                                    performance.base_price
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            per seat
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Selected Show:</span>
                                            <span className="font-medium">
                                                {formatDate(
                                                    selectedSchedule.show_datetime
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Show Time:</span>
                                            <span className="font-medium">
                                                {formatTime(
                                                    selectedSchedule.show_datetime
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Available Seats:</span>
                                            <span
                                                className={`font-medium ${
                                                    selectedSchedule.available_seats >
                                                    0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {
                                                    selectedSchedule.available_seats
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Status:</span>
                                            <Badge
                                                variant={getStatusColor(
                                                    selectedSchedule.status
                                                )}
                                                className="text-xs"
                                            >
                                                {getStatusLabel(
                                                    selectedSchedule.status
                                                )}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={() =>
                                            onBookNow(
                                                performance,
                                                selectedSchedule
                                            )
                                        }
                                        disabled={
                                            selectedSchedule.available_seats ===
                                                0 ||
                                            selectedSchedule.status ===
                                                'SOLDOUT' ||
                                            selectedSchedule.status ===
                                                'COMPLETED' ||
                                            selectedSchedule.status ===
                                                'CANCELLED'
                                        }
                                    >
                                        {selectedSchedule.available_seats ===
                                            0 ||
                                        selectedSchedule.status === 'SOLDOUT'
                                            ? 'Sold Out'
                                            : selectedSchedule.status ===
                                              'COMPLETED'
                                            ? 'Show Ended'
                                            : selectedSchedule.status ===
                                              'CANCELLED'
                                            ? 'Cancelled'
                                            : 'Select Seats'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <div className="text-2xl font-medium mb-1">
                                            {formatPrice(
                                                performance.base_price
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            per seat (starting from)
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="text-center py-4 text-muted-foreground">
                                            Please select a show time above
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        disabled={true}
                                        variant="outline"
                                    >
                                        Select Show Time First
                                    </Button>
                                </>
                            )}

                            <p className="text-xs text-muted-foreground text-center">
                                Secure booking • Instant confirmation • Mobile
                                tickets
                            </p>
                        </CardContent>
                    </Card>

                    {/* Occupancy Indicator - 선택된 스케줄 기준으로 업데이트 */}
                    <Card>
                        <CardContent className="p-4">
                            <h4 className="font-medium mb-3">
                                Seat Availability
                                {selectedSchedule && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        (
                                        {formatDate(
                                            selectedSchedule.show_datetime
                                        )}
                                        )
                                    </span>
                                )}
                            </h4>
                            <div className="space-y-2">
                                {selectedSchedule ? (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span>Booked</span>
                                            <span>
                                                {selectedSchedule.total_seats -
                                                    selectedSchedule.available_seats}{' '}
                                                seats
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${
                                                        selectedSchedule.total_seats >
                                                        0
                                                            ? ((selectedSchedule.total_seats -
                                                                  selectedSchedule.available_seats) /
                                                                  selectedSchedule.total_seats) *
                                                              100
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedSchedule.total_seats > 0
                                                ? (
                                                      ((selectedSchedule.total_seats -
                                                          selectedSchedule.available_seats) /
                                                          selectedSchedule.total_seats) *
                                                      100
                                                  ).toFixed(1)
                                                : 0}
                                            % booked
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span>Total Available</span>
                                            <span>{availableSeats} seats</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${occupancyRate}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Select a show time to see detailed
                                            availability
                                        </p>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
