import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Eye, Download, Search, Filter, Calendar, User, CreditCard, Ticket } from 'lucide-react';

interface Booking {
  id: string;
  performanceTitle: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  performanceDate: string;
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
  bookingReference: string;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      performanceTitle: 'Hamilton Musical',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      bookingDate: '2024-03-10',
      performanceDate: '2024-03-15',
      seats: ['A12', 'A13'],
      totalAmount: 300,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingReference: 'BK001'
    },
    {
      id: '2',
      performanceTitle: 'Rock Concert',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      bookingDate: '2024-03-11',
      performanceDate: '2024-03-20',
      seats: ['B15', 'B16', 'B17', 'B18'],
      totalAmount: 340,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingReference: 'BK002'
    },
    {
      id: '3',
      performanceTitle: 'Comedy Night',
      customerName: 'Mike Wilson',
      customerEmail: 'mike.w@email.com',
      bookingDate: '2024-03-08',
      performanceDate: '2024-03-10',
      seats: ['C5'],
      totalAmount: 35,
      status: 'completed',
      paymentStatus: 'paid',
      bookingReference: 'BK003'
    },
    {
      id: '4',
      performanceTitle: 'Hamilton Musical',
      customerName: 'Emma Davis',
      customerEmail: 'emma.d@email.com',
      bookingDate: '2024-03-12',
      performanceDate: '2024-03-15',
      seats: ['D20', 'D21'],
      totalAmount: 300,
      status: 'pending',
      paymentStatus: 'pending',
      bookingReference: 'BK004'
    },
    {
      id: '5',
      performanceTitle: 'Rock Concert',
      customerName: 'Alex Brown',
      customerEmail: 'alex.b@email.com',
      bookingDate: '2024-03-09',
      performanceDate: '2024-03-20',
      seats: ['A1', 'A2'],
      totalAmount: 170,
      status: 'cancelled',
      paymentStatus: 'refunded',
      bookingReference: 'BK005'
    }
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.performanceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const updatePaymentStatus = (bookingId: string, newPaymentStatus: Booking['paymentStatus']) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, paymentStatus: newPaymentStatus } : booking
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'refunded': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Manage customer bookings and reservations</p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Bookings
        </Button>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Performance Date</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.bookingReference}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-gray-400" />
                      {booking.performanceTitle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(booking.performanceDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {booking.seats.join(', ')}
                      <span className="text-gray-500 ml-1">({booking.seats.length} seats)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      ${booking.totalAmount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={booking.status} 
                      onValueChange={(value) => updateBookingStatus(booking.id, value as Booking['status'])}
                    >
                      <SelectTrigger className="w-32">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={booking.paymentStatus} 
                      onValueChange={(value) => updatePaymentStatus(booking.id, value as Booking['paymentStatus'])}
                    >
                      <SelectTrigger className="w-32">
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Detailed information for booking {selectedBooking?.bookingReference}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedBooking.customerName}</div>
                    <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Reference:</strong> {selectedBooking.bookingReference}</div>
                    <div><strong>Booking Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Performance Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {selectedBooking.performanceTitle}</div>
                  <div><strong>Date:</strong> {new Date(selectedBooking.performanceDate).toLocaleDateString()}</div>
                  <div><strong>Seats:</strong> {selectedBooking.seats.join(', ')}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="space-y-2">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Payment</h4>
                  <div className="space-y-2">
                    <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)}>
                      {selectedBooking.paymentStatus}
                    </Badge>
                    <div className="text-lg font-bold">${selectedBooking.totalAmount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;