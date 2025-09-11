import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Users } from "lucide-react";
import {
  performanceApi,
  seatApi,
  bookingApi,
  PerformanceResponse,
  ScheduleResponse,
  SeatDto,
  CreateBookingRequestDto,
  UserInfo,
} from "../libs/apis";

interface SeatSelectionProps {
  performanceId: number;
  user: UserInfo;
  onBack: () => void;
  onComplete: () => void;
}

export function SeatSelection({
  performanceId,
  user,
  onBack,
  onComplete,
}: SeatSelectionProps) {
  const [performance, setPerformance] = useState<PerformanceResponse | null>(
    null
  );
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<
    "schedule" | "seats" | "confirm"
  >("schedule");

  // Load performance data and schedules on component mount
  useEffect(() => {
    if (performanceId) {
      loadPerformanceData();
    }
  }, [performanceId]);

  const loadPerformanceData = async () => {
    if (!performanceId) {
      console.error("Performance ID is required");
      return;
    }

    console.log("Loading performance data for ID:", performanceId);
    setLoading(true);
    try {
      // Load performance details
      console.log("Fetching performance details...");
      const performanceData = await performanceApi.getPerformanceById(
        performanceId
      );
      console.log("Performance data:", performanceData);
      setPerformance(performanceData);

      // Load schedules for this performance
      console.log("Fetching performance schedules...");
      try {
        const schedulesData = await performanceApi.getPerformanceSchedules(
          performanceId
        );
        console.log("Schedules data received:", schedulesData);
        console.log("Individual schedules:", schedulesData.schedules);
        setSchedules(schedulesData.schedules || []);
      } catch (scheduleError: any) {
        console.error("Failed to load schedules:", scheduleError);

        // Check if performance data already includes schedules
        if (performanceData.schedules && performanceData.schedules.length > 0) {
          console.log(
            "Using schedules from performance data:",
            performanceData.schedules
          );
          setSchedules(performanceData.schedules);
        } else {
          console.log("No schedules available");
          setSchedules([]);
          alert(
            "스케줄 정보를 불러올 수 없습니다. 서버에서 문제가 발생했습니다."
          );
        }
      }
    } catch (error: any) {
      console.error("Failed to load performance data:", error);

      // Show specific error message if available
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "공연 정보를 불러올 수 없습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSeats = async (scheduleId: number) => {
    console.log("loadSeats called with scheduleId:", scheduleId);
    setLoading(true);
    try {
      // Get seat availability for the selected schedule
      console.log("Fetching seats for schedule:", scheduleId);
      const seatResponse = await seatApi.getScheduleSeats(scheduleId);
      console.log("Seat response received:", seatResponse);
      setSeats(seatResponse.data.seats);
      console.log("Setting booking step to seats");
      setBookingStep("seats");
    } catch (error) {
      console.error("Failed to load seats:", error);
      alert("좌석 정보를 불러올 수 없습니다: " + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = (scheduleId: string) => {
    console.log("handleScheduleSelect called with:", scheduleId);
    const id = parseInt(scheduleId);
    console.log("Parsed schedule ID:", id);
    setSelectedSchedule(id);
    loadSeats(id);
  };

  const handleSeatClick = useCallback(
    (seatId: number) => {
      console.log("=== Seat Click Debug ===");
      console.log("Clicked seat ID:", seatId);

      const seat = seats.find((s) => s.seatId === seatId);
      console.log("Found seat:", seat);

      if (!seat) {
        console.log("Seat not found!");
        return;
      }

      console.log("Seat status:", seat.status);
      if (seat.status !== "AVAILABLE") {
        console.log("Seat not available, status:", seat.status);
        return;
      }

      setSelectedSeats((prev: number[]) => {
        console.log("Current selected seats:", prev);
        console.log("Prev length:", prev.length);

        if (prev.includes(seatId)) {
          console.log("Removing seat from selection");
          const newSelection = prev.filter((id: number) => id !== seatId);
          console.log("New selection after removal:", newSelection);
          return newSelection;
        } else {
          if (prev.length < 4) {
            console.log("Adding seat to selection");
            const newSelection = [...prev, seatId];
            console.log("New selection after addition:", newSelection);
            return newSelection;
          } else {
            console.log("Maximum seats (4) already selected");
            // 사용자에게 알림 표시 (너무 자주 뜨지 않도록 조건부)
            if (prev.length === 4) {
              alert("최대 4개의 좌석까지만 선택할 수 있습니다.");
            }
            return prev;
          }
        }
      });
    },
    [seats]
  );

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total: number, seatId: number) => {
      const seat = seats.find((s: SeatDto) => s.seatId === seatId);
      return total + (seat?.price || 0);
    }, 0);
  }, [selectedSeats, seats]);

  // 좌석 데이터에서 동적으로 행 추출 및 정렬
  const seatRows = useMemo(() => {
    if (!seats || seats.length === 0) return [];

    // 모든 고유한 행을 추출
    const uniqueRows = [
      ...new Set(seats.map((seat: SeatDto) => String(seat.seatRow))),
    ];

    // 행을 알파벳 순으로 정렬 (A, B, C, D... 또는 1, 2, 3, 4...)
    return uniqueRows.sort((a, b) => {
      // 숫자인지 문자인지 확인
      const aIsNumber = !isNaN(Number(a));
      const bIsNumber = !isNaN(Number(b));

      if (aIsNumber && bIsNumber) {
        return Number(a) - Number(b);
      } else {
        return String(a).localeCompare(String(b));
      }
    });
  }, [seats]);

  // 각 행의 좌석을 번호순으로 정렬
  const getSortedSeatsForRow = useCallback(
    (row: string) => {
      return seats
        .filter((seat) => seat.seatRow === row)
        .sort((a: SeatDto, b: SeatDto) => {
          // 좌석 번호가 숫자인지 문자인지 확인
          const aIsNumber = !isNaN(Number(a.seatNumber));
          const bIsNumber = !isNaN(Number(b.seatNumber));

          if (aIsNumber && bIsNumber) {
            return Number(a.seatNumber) - Number(b.seatNumber);
          } else {
            return a.seatNumber.localeCompare(b.seatNumber);
          }
        });
    },
    [seats]
  );

  const handleBooking = useCallback(async () => {
    if (!selectedSchedule) return;

    // 토큰 확인 디버깅
    const token = localStorage.getItem("authToken");
    console.log("=== 예약 요청 디버깅 ===");
    console.log("저장된 토큰:", token ? "있음" : "없음");
    console.log("토큰 길이:", token?.length || 0);
    console.log("선택된 스케줄:", selectedSchedule);
    console.log("선택된 좌석:", selectedSeats);

    if (!token) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      return;
    }

    setLoading(true);
    try {
      const bookingRequest: CreateBookingRequestDto = {
        scheduleId: selectedSchedule,
        seatIds: selectedSeats,
      };

      console.log("예약 요청 데이터:", bookingRequest);
      const bookingResponse = await bookingApi.createBooking(bookingRequest);
      console.log("예약 응답:", bookingResponse);

      alert(
        `Booking confirmed! Booking number: ${bookingResponse.bookingNumber}`
      );
      onComplete();
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Booking failed. Please try again.");

      // 예약 실패 시 좌석 상태를 다시 조회하여 최신 상태로 업데이트
      console.log("예약 실패로 인한 좌석 상태 재조회 시작...");
      try {
        const seatResponse = await seatApi.getScheduleSeats(selectedSchedule);
        console.log("좌석 상태 재조회 완료:", seatResponse);
        setSeats(seatResponse.data.seats);
        // 선택된 좌석 초기화 (상태가 변경되었을 수 있으므로)
        setSelectedSeats([]);
      } catch (refreshError) {
        console.error("좌석 상태 재조회 실패:", refreshError);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSchedule, selectedSeats, onComplete]);

  const getSeatColor = useCallback(
    (seat: SeatDto) => {
      console.log(`좌석 ${seat.seatId} 상태: "${seat.status}"`);

      // 선택된 좌석 - 파란색
      if (selectedSeats.includes(seat.seatId)) {
        return "bg-blue-500 hover:bg-blue-600 cursor-pointer text-white shadow-md ring-2 ring-blue-300 transition-all duration-150 ease-out";
      }

      // 좌석 상태를 소문자로 변환하여 비교 (대소문자 구분 없이)
      const status = seat.status?.toString().toUpperCase() || '';

      // 예약된 좌석 - 노란색 배경 (다양한 상태값 처리)
      const unavailableStatuses = [
        "BOOKED", "OCCUPIED", "UNAVAILABLE", "RESERVED", 
        "SOLD", "TAKEN", "BOOKING", "예약됨", "점유됨"
      ];
      
      if (unavailableStatuses.includes(status)) {
        return "!bg-yellow-400 cursor-not-allowed text-black font-bold border-2 border-yellow-600 shadow-inner opacity-100";
      }

      // 사용 가능한 좌석 - 초록색
      const availableStatuses = ["AVAILABLE", "FREE", "OPEN", "사용가능"];
      
      if (availableStatuses.includes(status)) {
        return "bg-green-500 hover:bg-green-600 cursor-pointer text-white hover:shadow-sm transition-all duration-150 ease-out";
      }

      // 기본값 - 알 수 없는 상태는 빨간색으로 표시하고 로그 출력 (더 눈에 띄게)
      console.warn(
        `알 수 없는 좌석 상태: "${seat.status}" (좌석 ID: ${seat.seatId})`
      );
      return "bg-red-300 cursor-not-allowed text-red-800 border border-red-400";
    },
    [selectedSeats]
  );

  // Early return if performanceId is invalid
  if (!performanceId || isNaN(performanceId)) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Invalid performance ID</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !performance) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!performance) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Performance not found</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookingStep === "schedule") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle>{performance.title}</CardTitle>
              <p className="text-muted-foreground">{performance.venue}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3>Select a Show Time</h3>
            {schedules.length === 0 ? (
              <p className="text-center text-muted-foreground">
                스케줄을 불러오는 중이거나 사용 가능한 스케줄이 없습니다.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                총 {schedules.length}개의 스케줄이 있습니다.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule) => (
                <Card
                  key={schedule.scheduleId}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    console.log("=== Schedule Card Clicked ===");
                    console.log("Schedule object:", schedule);
                    console.log("Schedule ID:", schedule.scheduleId);
                    console.log("Schedule status:", schedule.status);
                    console.log("Available seats:", schedule.availableSeats);

                    // Try to proceed regardless of status for debugging
                    console.log("Attempting to select schedule...");
                    handleScheduleSelect(schedule.scheduleId.toString());
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(schedule.showDatetime).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(schedule.showDatetime).toLocaleTimeString(
                            "ko-KR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            schedule.status === "AVAILABLE" ||
                            schedule.status === "OPEN" ||
                            schedule.availableSeats > 0
                              ? "default"
                              : "destructive"
                          }
                        >
                          {schedule.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Users className="w-3 h-3 inline mr-1" />
                          {schedule.availableSeats}/{schedule.totalSeats}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setBookingStep("schedule")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle>{performance.title}</CardTitle>
              <p className="text-muted-foreground">{performance.venue}</p>
            </div>
          </div>
          {/* Time display removed as requested 
          {selectedSeats.length > 0 && (
            <div className="text-right">
              <Badge variant="destructive">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              <p className="text-xs text-muted-foreground">Time remaining</p>
            </div>
          )}
          */}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer alert removed as requested
        {selectedSeats.length > 0 && (
          <Alert>
            <AlertDescription>
              Seats are temporarily reserved for 5 minutes. Please complete your booking before the timer expires.
            </AlertDescription>
          </Alert>
        )}
        */}

        {/* 좌석 선택 안내 */}
        <div className="text-center space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💺 최대 <span className="font-bold">4개</span>의 좌석까지 선택할
              수 있습니다
            </p>
            <p className="text-xs text-blue-600 mt-1">
              현재 선택된 좌석:{" "}
              <span className="font-semibold">{selectedSeats.length}</span>개 /
              4개
            </p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="bg-gray-800 text-white py-2 px-4 rounded-lg inline-block">
            STAGE
          </div>
          {seatRows.length > 0 && (
            <p className="text-xs text-muted-foreground">
              총 {seatRows.length}개 행 ({seatRows.join(", ")}) • {seats.length}
              개 좌석
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {seatRows.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                좌석 정보를 불러오는 중입니다...
              </div>
            ) : (
              seatRows.map((row) => {
                const rowSeats = getSortedSeatsForRow(row);
                return (
                  <div
                    key={row}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="w-8 text-center font-medium">{row}</div>
                    <div className="flex gap-1">
                      {rowSeats.map((seat) => (
                        <div
                          key={seat.seatId}
                          className={`w-8 h-8 rounded text-xs flex items-center justify-center font-semibold select-none ${getSeatColor(
                            seat
                          )}`}
                          onClick={() => handleSeatClick(seat.seatId)}
                          onMouseDown={(e) => e.preventDefault()} // 드래그 방지
                          title={`좌석 ${seat.seatRow}${
                            seat.seatNumber
                          }\n등급: ${
                            seat.seatGrade || "Standard"
                          }\n가격: ${seat.price.toLocaleString()}원\n상태: ${
                            seat.status
                          }`}
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                            ...(seat.status === "BOOKED" || 
                                seat.status === "OCCUPIED" || 
                                seat.status === "UNAVAILABLE" || 
                                seat.status === "RESERVED" || 
                                seat.status === "SOLD" || 
                                seat.status === "TAKEN" || 
                                seat.status === "BOOKING" || 
                                seat.status === "예약됨" || 
                                seat.status === "점유됨" ? 
                              {
                                backgroundColor: "#6b7280",
                                color: "#ffffff",
                                cursor: "not-allowed"
                              } : {})
                          }}
                        >
                          {seat.seatNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm shadow-sm"></div>
              <span>사용 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm shadow-sm"></div>
              <span>선택됨 ({selectedSeats.length}/4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: "#6b7280" }}></div>
              <span>예약됨</span>
            </div>
          </div>

          {selectedSeats.length >= 4 && (
            <div className="text-center">
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ 최대 선택 가능한 좌석 수에 도달했습니다 (4개)
              </p>
            </div>
          )}
        </div>

        {selectedSeats.length > 0 && (
          <Card className="bg-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Selected Seats ({selectedSeats.length})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSeats
                      .map((seatId: number) => {
                        const seat = seats.find(
                          (s: SeatDto) => s.seatId === seatId
                        );
                        return seat ? `${seat.seatRow}${seat.seatNumber}` : "";
                      })
                      .join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Total: {totalPrice.toLocaleString()}원
                  </p>
                  <Button onClick={handleBooking} disabled={loading}>
                    {loading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
