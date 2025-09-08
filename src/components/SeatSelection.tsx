import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { serverAPI, Seat, User } from '../data/mockServer';

interface Performance {
  performance_id: number;
  title: string;
  venue_name: string;
  schedules: Array<{
    schedule_id: number;
    show_datetime: string;
    available_seats: number;
    total_seats: number;
    status: string;
  }>;
}

interface ExtendedSeat extends Seat {
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

interface SeatSelectionProps {
  performance: Performance;
  user: User;
  onBack: () => void;
  onComplete: () => void;
}

export function SeatSelection({ performance, user, onBack, onComplete }: SeatSelectionProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [seats, setSeats] = useState<ExtendedSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState<'schedule' | 'seats' | 'confirm'>('schedule');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (bookingStep === 'seats' && selectedSeats.length > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time expired - release seats
            setSelectedSeats([]);
            setBookingStep('schedule');
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bookingStep, selectedSeats.length]);

  const loadSeats = async (scheduleId: number) => {
    setLoading(true);
    try {
      // Use mock API to get seats for venue
      const venueId = 1; // Default venue for demo
      const seatData = await serverAPI.getSeatsByVenueId(venueId);
      
      // Convert Seat to ExtendedSeat and add status
      const extendedSeats: ExtendedSeat[] = seatData.map(seat => ({
        ...seat,
        price: seat.seat_price,
        status: seat.is_available ? 'AVAILABLE' : 'BOOKED' as 'AVAILABLE' | 'LOCKED' | 'BOOKED'
      }));

      setSeats(extendedSeats);
      setBookingStep('seats');
    } catch (error) {
      console.error('Failed to load seats:', error);
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
    const seat = seats.find(s => s.seat_id === seatId);
    if (!seat || seat.status !== 'AVAILABLE') return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < 4) {
        setSelectedSeats(prev => [...prev, seatId]);
      }
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.seat_id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleBooking = async () => {
    setLoading(true);
    // Mock booking API call
    setTimeout(() => {
      alert(`Booking confirmed for ${selectedSeats.length} seats!`);
      setLoading(false);
      onComplete();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'BOOKED') return 'bg-gray-400 cursor-not-allowed';
    if (selectedSeats.includes(seat.seat_id)) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-green-500 hover:bg-green-600 cursor-pointer';
  };

  if (bookingStep === 'schedule') {
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
              <p className="text-muted-foreground">{performance.venue_name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3>Select a Show Time</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {performance.schedules.map((schedule) => (
                <Card key={schedule.schedule_id} className="cursor-pointer hover:bg-accent" 
                      onClick={() => schedule.status === 'OPEN' && handleScheduleSelect(schedule.schedule_id.toString())}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(schedule.show_datetime).toLocaleDateString('ko-KR')}
                        </p>
                        {/* Time display removed as requested
                        <p className="text-sm text-muted-foreground">
                          {new Date(schedule.show_datetime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        */}
                      </div>
                      <div className="text-right">
                        <Badge variant={schedule.status === 'OPEN' ? 'default' : 'destructive'}>
                          {schedule.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Users className="w-3 h-3 inline mr-1" />
                          {schedule.available_seats}/{schedule.total_seats}
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
            <Button variant="ghost" onClick={() => setBookingStep('schedule')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <CardTitle>{performance.title}</CardTitle>
              <p className="text-muted-foreground">{performance.venue_name}</p>
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
            {['A', 'B', 'C', 'D'].map((row) => (
              <div key={row} className="flex items-center justify-center gap-2">
                <div className="w-8 text-center font-medium">{row}</div>
                <div className="flex gap-1">
                  {seats
                    .filter(seat => seat.seat_row === row)
                    .map((seat) => (
                      <div
                        key={seat.seat_id}
                        className={`w-8 h-8 rounded text-xs flex items-center justify-center text-white ${getSeatColor(seat)}`}
                        onClick={() => handleSeatClick(seat.seat_id)}
                        title={`${seat.seat_row}${seat.seat_number} - ${seat.seat_grade} - ${seat.price.toLocaleString()}원`}
                      >
                        {seat.seat_number}
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
                  <p className="font-medium">Selected Seats ({selectedSeats.length})</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSeats.map(seatId => {
                      const seat = seats.find(s => s.seat_id === seatId);
                      return seat ? `${seat.seat_row}${seat.seat_number}` : '';
                    }).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Total: {getTotalPrice().toLocaleString()}원</p>
                  <Button onClick={handleBooking} disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm Booking'}
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