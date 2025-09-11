import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  bookingApi,
  BookingDto,
  GetBookingDetail200ResponseDto,
  CancelBookingRequestDto,
} from "../libs/apis";

interface BookingHistoryProps {
  userId: number;
}

export function BookingHistory({ userId }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<BookingDto | null>(
    null
  );
  const [bookingDetails, setBookingDetails] =
    useState<GetBookingDetail200ResponseDto | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [processingCancellation, setProcessingCancellation] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("Fetching bookings for user:", userId);
        const response = await bookingApi.getBookings();
        console.log("Bookings response:", response);
        setBookings(response.bookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleCancelBooking = async (booking: BookingDto) => {
    setCancellingBooking(booking);
    setCancellationReason("");
    setSelectedCancelReason("");

    // 예약 상세 정보 로드
    try {
      const details = await bookingApi.getBookingDetail(booking.bookingId);
      setBookingDetails(details);
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    }
  };

  const processCancellation = async () => {
    if (!cancellingBooking || !selectedCancelReason) return;

    setProcessingCancellation(true);

    try {
      const reason =
        selectedCancelReason === "other"
          ? cancellationReason
          : selectedCancelReason;

      const cancelRequest: CancelBookingRequestDto = {
        reason: reason,
      };

      const response = await bookingApi.cancelBooking(
        cancellingBooking.bookingId,
        cancelRequest
      );

      console.log("Booking cancelled successfully:", response);

      // 예약 목록 새로고침
      const updatedBookings = await bookingApi.getBookings();
      setBookings(updatedBookings.bookings);

      alert("예약이 성공적으로 취소되었습니다.");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("예약 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setProcessingCancellation(false);
      setCancellingBooking(null);
      setBookingDetails(null);
    }
  };

  const calculateRefundAmount = (booking: BookingDto) => {
    // BookingDto에는 show_datetime이 없으므로 전체 금액 반환
    // 실제로는 스케줄 정보를 가져와서 계산해야 함
    return booking.totalAmount;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default";
      case "PENDING":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const canCancelBooking = (booking: BookingDto) => {
    // BookingDto에는 show_datetime이 없으므로 상태만으로 판단
    // 실제로는 스케줄 정보를 가져와서 시간을 확인해야 함
    return booking.status === "CONFIRMED" || booking.status === "PENDING";
  };

  const getCancellationFee = (booking: BookingDto) => {
    // BookingDto에는 show_datetime이 없으므로 기본값 반환
    // 실제로는 스케줄 정보를 가져와서 계산해야 함
    return 0; // No fee for now
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No booking history found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your booking history will appear here after you make your first
            booking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>My Bookings</h2>
        <Badge variant="outline">{bookings.length} bookings</Badge>
      </div>

      {bookings.map((booking) => (
        <Card key={booking.bookingId}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">
                      Performance #{booking.scheduleId}
                    </h3>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booking: {booking.bookingNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(booking.totalAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.seatCount} seat{booking.seatCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Schedule ID: {booking.scheduleId}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Expires: {formatDate(booking.expiresAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>
                    Seats: {booking.seatCount} selected
                    {bookingDetails && bookingDetails.seats && (
                      <span>
                        {" "}
                        (
                        {bookingDetails.seats
                          .map((s) => `Seat ${s.seatId}`)
                          .join(", ")}
                        )
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>Booked: {formatDate(booking.bookedAt)}</span>
                </div>
              </div>

              {bookingDetails &&
                bookingDetails.seats &&
                bookingDetails.seats.length > 0 && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Seat Details:</p>
                    <div className="grid gap-2 text-xs">
                      {bookingDetails.seats.map((seat, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Seat ID: {seat.seatId}</span>
                          <span>{formatPrice(seat.seatPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {booking.status === "PENDING" && (
                <Alert>
                  <AlertDescription>
                    Payment is pending. Please complete payment to confirm your
                    booking.
                  </AlertDescription>
                </Alert>
              )}

              {booking.status === "CANCELLED" && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>
                        Booking cancelled on{" "}
                        {booking.cancelledAt
                          ? formatDate(booking.cancelledAt)
                          : "Unknown"}
                      </p>
                      {booking.cancellationReason && (
                        <p className="text-xs">
                          Reason: {booking.cancellationReason}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 justify-end">
                {booking.status === "PENDING" && (
                  <Button variant="default">Complete Payment</Button>
                )}

                {canCancelBooking(booking) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Cancel Booking
                  </Button>
                )}

                {booking.status === "CONFIRMED" &&
                  !canCancelBooking(booking) && (
                    <Button variant="outline" disabled>
                      Cannot Cancel
                    </Button>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Cancellation Dialog */}
      <Dialog
        open={!!cancellingBooking}
        onOpenChange={(open) => {
          if (!open) {
            setCancellingBooking(null);
            setCancellationReason("");
            setSelectedCancelReason("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>

          {cancellingBooking && (
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Booking Number:</strong>{" "}
                    {cancellingBooking.bookingNumber}
                  </p>
                  <p>
                    <strong>Schedule ID:</strong> {cancellingBooking.scheduleId}
                  </p>
                  <p>
                    <strong>Seats:</strong> {cancellingBooking.seatCount} seats
                    {bookingDetails && bookingDetails.seats && (
                      <span>
                        {" "}
                        (IDs:{" "}
                        {bookingDetails.seats.map((s) => s.seatId).join(", ")})
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Amount:</strong>{" "}
                    {formatPrice(cancellingBooking.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Refund Information - Commented out as requested, uncomment when needed */}
              {/*
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Refund Policy
                </h4>
                <div className="space-y-1 text-sm text-yellow-800">
                  <p>• More than 48 hours: 100% refund</p>
                  <p>• 24-48 hours: 80% refund (20% cancellation fee)</p>
                  <p>• 12-24 hours: 50% refund (50% cancellation fee)</p>
                  <p>• Less than 12 hours: No refund</p>
                </div>
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-sm">
                    <strong>Your refund amount: {formatPrice(calculateRefundAmount(cancellingBooking))}</strong>
                    {getCancellationFee(cancellingBooking) > 0 && (
                      <span className="text-red-600 ml-2">
                        ({getCancellationFee(cancellingBooking)}% cancellation fee)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              */}

              {/* Cancellation Reason */}
              <div className="space-y-3">
                <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                <Select
                  value={selectedCancelReason}
                  onValueChange={setSelectedCancelReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal_emergency">
                      Personal Emergency
                    </SelectItem>
                    <SelectItem value="illness">Illness</SelectItem>
                    <SelectItem value="schedule_conflict">
                      Schedule Conflict
                    </SelectItem>
                    <SelectItem value="travel_issues">Travel Issues</SelectItem>
                    <SelectItem value="event_concerns">
                      Event-related Concerns
                    </SelectItem>
                    <SelectItem value="financial_reasons">
                      Financial Reasons
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                {selectedCancelReason === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-reason">Please specify</Label>
                    <Textarea
                      id="custom-reason"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide details about your cancellation reason..."
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Terms and Conditions - Commented out as requested, uncomment when needed */}
              {/*
              <div className="text-xs text-muted-foreground space-y-1">
                <p>By cancelling this booking, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The refund policy terms stated above</li>
                  <li>Refund processing may take 5-7 business days</li>
                  <li>Refunds will be processed to your original payment method</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
              */}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCancellingBooking(null)}
                  disabled={processingCancellation}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={processCancellation}
                  disabled={
                    !selectedCancelReason ||
                    processingCancellation ||
                    (selectedCancelReason === "other" &&
                      !cancellationReason.trim())
                  }
                >
                  {processingCancellation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
