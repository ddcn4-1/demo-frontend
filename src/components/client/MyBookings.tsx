import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Download, 
  MoreHorizontal,
  Star,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface Booking {
  id: string;
  performanceTitle: string;
  performanceId: string;
  venue: string;
  date: string;
  time: string;
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
  bookingReference: string;
  bookingDate: string;
  image: string;
}

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      performanceTitle: 'Hamilton Musical',
      performanceId: '1',
      venue: 'Broadway Theater',
      date: '2024-03-15',
      time: '19:30',
      seats: ['A12', 'A13'],
      totalAmount: 300,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingReference: 'BK001',
      bookingDate: '2024-03-10',
      image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NTYzNTYxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '2',
      performanceTitle: 'Rock Concert',
      performanceId: '2',
      venue: 'Madison Square Garden',
      date: '2024-03-20',
      time: '20:00',
      seats: ['B15', 'B16', 'B17', 'B18'],
      totalAmount: 340,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingReference: 'BK002',
      bookingDate: '2024-03-11',
      image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBtdXNpY3xlbnwxfHx8fDE3NTY0NDU3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '3',
      performanceTitle: 'Jazz Night',
      performanceId: '3',
      venue: 'Blue Note',
      date: '2024-02-28',
      time: '21:00',
      seats: ['C5'],
      totalAmount: 45,
      status: 'completed',
      paymentStatus: 'paid',
      bookingReference: 'BK003',
      bookingDate: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1731185762173-f7068929fb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwY2x1YiUyMG11c2ljfGVufDF8fHx8MTc1NjQwNTk0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '4',
      performanceTitle: 'Comedy Stand-up',
      performanceId: '4',
      venue: 'Comedy Club Downtown',
      date: '2024-03-25',
      time: '20:30',
      seats: ['D20', 'D21'],
      totalAmount: 70,
      status: 'pending',
      paymentStatus: 'pending',
      bookingReference: 'BK004',
      bookingDate: '2024-03-12',
      image: 'https://images.unsplash.com/photo-1585699622060-6b79b24a6bdb?w=1080'
    }
  ]);

  const upcomingBookings = bookings.filter(booking => 
    ['confirmed', 'pending'].includes(booking.status) && 
    new Date(booking.date) >= new Date()
  );

  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    new Date(booking.date) < new Date()
  );

  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled');

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

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const handleDownloadTicket = (booking: Booking) => {
    // Mock download functionality
    console.log('Downloading ticket for booking:', booking.bookingReference);
  };

  const handleCancelBooking = (bookingId: string) => {
    // Mock cancel functionality
    console.log('Cancelling booking:', bookingId);
  };

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="overflow-hidden">
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0">
          <ImageWithFallback 
            src={booking.image} 
            alt={booking.performanceTitle}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{booking.performanceTitle}</h3>
              <p className="text-sm text-gray-600">Booking #{booking.bookingReference}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              <Badge className={getPaymentStatusColor(booking.paymentStatus)} variant="outline">
                {booking.paymentStatus}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(booking.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{booking.venue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Ticket className="h-4 w-4" />
              <span>{booking.seats.join(', ')}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">${booking.totalAmount}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(booking)}
              >
                Details
              </Button>
              
              {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTicket(booking)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Ticket
                </Button>
              )}
              
              {booking.status === 'confirmed' && new Date(booking.date) > new Date() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderEmptyState = (type: string) => (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Ticket className="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No {type} bookings
        </h3>
        <p className="text-gray-600 mb-4">
          {type === 'upcoming' ? 
            "You don't have any upcoming performances booked." :
            type === 'past' ?
            "You haven't attended any performances yet." :
            "You don't have any cancelled bookings."
          }
        </p>
        {type === 'upcoming' && (
          <Button onClick={() => navigate('/client/performances')}>
            Browse Performances
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your ticket bookings and view performance details</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Ticket className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-xl font-bold">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-xl font-bold">{upcomingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold">{pastBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-bold">{cancelledBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? 
              renderEmptyState('upcoming') :
              upcomingBookings.map(booking => renderBookingCard(booking))
            }
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? 
              renderEmptyState('past') :
              pastBookings.map(booking => renderBookingCard(booking))
            }
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length === 0 ? 
              renderEmptyState('cancelled') :
              cancelledBookings.map(booking => renderBookingCard(booking))
            }
          </TabsContent>
        </Tabs>

        {/* Booking Details Modal */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete information for booking {selectedBooking?.bookingReference}
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ImageWithFallback 
                      src={selectedBooking.image} 
                      alt={selectedBooking.performanceTitle}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{selectedBooking.performanceTitle}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedBooking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedBooking.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedBooking.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ticket className="h-4 w-4" />
                        <span>{selectedBooking.seats.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Booking Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Reference:</strong> {selectedBooking.bookingReference}</div>
                      <div><strong>Booking Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</div>
                      <div><strong>Number of Tickets:</strong> {selectedBooking.seats.length}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Status & Payment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm"><strong>Status:</strong></span>
                        <Badge className={getStatusColor(selectedBooking.status)}>
                          {selectedBooking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm"><strong>Payment:</strong></span>
                        <Badge className={getPaymentStatusColor(selectedBooking.paymentStatus)} variant="outline">
                          {selectedBooking.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <strong>Total Amount:</strong> ${selectedBooking.totalAmount}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => navigate(`/client/performance/${selectedBooking.performanceId}`)}
                    className="flex-1"
                  >
                    View Performance Details
                  </Button>
                  
                  {selectedBooking.status === 'confirmed' && selectedBooking.paymentStatus === 'paid' && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadTicket(selectedBooking)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Ticket
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyBookings;