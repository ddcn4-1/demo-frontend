import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Search, Filter, Download, Eye, XCircle, CheckCircle, Clock } from 'lucide-react';
// import { serverAPI, Booking, mockUsers } from '../../data/mockServer';
import { Booking, User, GetBookings200ResponseDto } from '../type/index'
import { serverAPI } from '../service/apiService'
import { bookingService } from '../service/bookingService'

interface AdminBooking extends Booking {
  user_name: string;
  user_email: string;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface BookingManagementProps {
  permissions: {
    canViewBookings: boolean;
  };
}

export function BookingManagement({ permissions }: BookingManagementProps) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingData = await bookingService.adminGetBookings();

        // TODO : 이후 유저 상세 조회 API 만들어서 백엔드에서 하나만 조회하도록 변경
        // 현재 전체 데이터 읽어와서 frontend에서 필터
        const userData = await serverAPI.getUsers();
        const userMap = new Map(userData.map(u => [u.userId, u]));

        // Convert Booking to AdminBooking by adding user data
        const adminBookings: AdminBooking[] = bookingData.bookings.map(booking => {
          const user = userMap.get(booking.userId);

          return {
            booking_id: booking.bookingId,
            booking_number: booking.bookingNumber,
            user_id: booking.userId,
            performance_id: booking.scheduleId,
            performance_title: booking.performanceTitle || 'Unknown Performance', // 기본값 추가
            venue_name: booking.venueName || 'Unknown Venue',                    // 기본값 추가
            show_datetime: booking.showDate || new Date().toISOString(),         // 기본값 추가
            seat_count: booking.seatCount || 0,                                  // 기본값 추가
            seats: booking.seatCode ? [{
              seat_id: 1,
              seat_row: booking.seatZone || '',
              seat_number: booking.seatCode || '',
              seat_grade: booking.seatZone || 'General',
              seat_price: booking.totalAmount || 0
            }] : [],
            total_amount: booking.totalAmount || 0,                              // 기본값 추가
            status: booking.status,
            booked_at: booking.bookedAt || new Date().toISOString(),            // 기본값 추가

            user_name: user?.name || 'Unknown User',
            user_email: user?.email || 'unknown@email.com',
            payment_status: (booking.status === 'CONFIRMED' ? 'COMPLETED' :
              booking.status === 'PENDING' ? 'PENDING' : 'COMPLETED') as 'PENDING' | 'COMPLETED' | 'FAILED'
          };
        });

        setBookings(adminBookings);
        setFilteredBookings(adminBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.performance_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === paymentFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  const handleCancelBooking = (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prev => prev.map(booking =>
        booking.booking_id === bookingId
          ? { ...booking, status: 'CANCELLED' as const }
          : booking
      ));
    }
  };

  const handleConfirmBooking = (bookingId: number) => {
    setBookings(prev => prev.map(booking =>
      booking.booking_id === bookingId
        ? { ...booking, status: 'CONFIRMED' as const, payment_status: 'COMPLETED' as const }
        : booking
    ));
  };

  const exportToCSV = () => {
    const csvData = filteredBookings.map(booking => ({
      'Booking Number': booking.booking_number,
      'Customer Name': booking.user_name,
      'Email': booking.user_email,
      'Performance': booking.performance_title,
      'Venue': booking.venue_name,
      'Show Date': formatDate(booking.show_datetime),
      'Seats': booking.seat_count,
      'Amount': booking.total_amount,
      'Status': booking.status,
      'Payment': booking.payment_status,
      'Booked At': formatDate(booking.booked_at)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default';
      case 'PENDING': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default';
      case 'PENDING': return 'secondary';
      case 'FAILED': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  if (!permissions.canViewBookings) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Access denied. You don't have permission to view booking management.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Booking Management</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage customer bookings and payments
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Booking Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-xl font-medium">
                  {bookings.filter(b => b.status === 'CONFIRMED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-medium">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-xl font-medium">
                  {bookings.filter(b => b.status === 'CANCELLED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded"></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-medium">
                  {formatPrice(bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.total_amount, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Show Date</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.booking_id}>
                  <TableCell>
                    <div className="font-medium">{booking.booking_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(booking.booked_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.user_name}</div>
                    <div className="text-xs text-muted-foreground">{booking.user_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.performance_title}</div>
                    <div className="text-xs text-muted-foreground">{booking.venue_name}</div>
                  </TableCell>
                  <TableCell>{formatDate(booking.show_datetime)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.seat_count} seats</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.seats.map(s => `${s.seat_row}${s.seat_number}`).join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(booking.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Booking Number</p>
                                  <p className="font-medium">{selectedBooking.booking_number}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge variant={getStatusColor(selectedBooking.status)}>
                                    {selectedBooking.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Customer</p>
                                  <p className="font-medium">{selectedBooking.user_name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedBooking.user_email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Payment Status</p>
                                  <Badge variant={getPaymentStatusColor(selectedBooking.payment_status)}>
                                    {selectedBooking.payment_status}
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Seat Details</p>
                                <div className="bg-muted rounded-lg p-3">
                                  {selectedBooking.seats.map((seat, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{seat.seat_row}{seat.seat_number} ({seat.seat_grade})</span>
                                      <span>{formatPrice(seat.seat_price)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatPrice(selectedBooking.total_amount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {booking.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirmBooking(booking.booking_id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}

                      {booking.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.booking_id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}