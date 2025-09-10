import React, { useState, useEffect } from "react";
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
      setPerformance(performanceData);

      // Load schedules for this performance
      console.log("Fetching performance schedules...");
      const schedulesData = await performanceApi.getPerformanceSchedules(
        performanceId
      );
      console.log("Schedules data received:", schedulesData);
      setSchedules(schedulesData.schedules);
    } catch (error) {
      console.error("Failed to load performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeats = async (scheduleId: number) => {
    setLoading(true);
    try {
      // Get seat availability for the selected schedule
      const seatResponse = await seatApi.getScheduleSeats(scheduleId);
      setSeats(seatResponse.data.seats);
      setBookingStep("seats");
    } catch (error) {
      console.error("Failed to load seats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = (scheduleId: string) => {
    const id = parseInt(scheduleId);
    setSelectedSchedule(id);
    loadSeats(id);
  };

  const handleSeatClick = (seatId: number) => {
    const seat = seats.find((s) => s.seatId === seatId);
    if (!seat || seat.status !== "AVAILABLE") return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length < 4) {
        setSelectedSeats((prev) => [...prev, seatId]);
      }
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.seatId === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleBooking = async () => {
    if (!selectedSchedule) return;

    setLoading(true);
    try {
      const bookingRequest: CreateBookingRequestDto = {
        scheduleId: selectedSchedule,
        seatIds: selectedSeats,
      };

      const bookingResponse = await bookingApi.createBooking(bookingRequest);
      alert(
        `Booking confirmed! Booking number: ${bookingResponse.bookingNumber}`
      );
      onComplete();
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (seat: SeatDto) => {
    if (seat.status === "BOOKED") return "bg-gray-400 cursor-not-allowed";
    if (selectedSeats.includes(seat.seatId))
      return "bg-blue-500 hover:bg-blue-600";
    return "bg-green-500 hover:bg-green-600 cursor-pointer";
  };

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
            <div className="grid gap-4 md:grid-cols-2">
              {schedules.map((schedule) => (
                <Card
                  key={schedule.scheduleId}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() =>
                    schedule.status === "AVAILABLE" &&
                    handleScheduleSelect(schedule.scheduleId.toString())
                  }
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
                            schedule.status === "AVAILABLE"
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

        <div className="text-center">
          <div className="bg-gray-800 text-white py-2 px-4 rounded-lg inline-block">
            STAGE
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {["A", "B", "C", "D"].map((row) => (
              <div key={row} className="flex items-center justify-center gap-2">
                <div className="w-8 text-center font-medium">{row}</div>
                <div className="flex gap-1">
                  {seats
                    .filter((seat) => seat.seatRow === row)
                    .map((seat) => (
                      <div
                        key={seat.seatId}
                        className={`w-8 h-8 rounded text-xs flex items-center justify-center text-white ${getSeatColor(
                          seat
                        )}`}
                        onClick={() => handleSeatClick(seat.seatId)}
                        title={`${seat.seatRow}${seat.seatNumber} - ${
                          seat.seatGrade || "Standard"
                        } - ${seat.price.toLocaleString()}원`}
                      >
                        {seat.seatNumber}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Booked</span>
          </div>
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
                      .map((seatId) => {
                        const seat = seats.find((s) => s.seatId === seatId);
                        return seat ? `${seat.seatRow}${seat.seatNumber}` : "";
                      })
                      .join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Total: {getTotalPrice().toLocaleString()}원
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
