import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star, Info, Ticket } from 'lucide-react';
import { Performance } from '../data/mockServer';

interface PerformanceDetailProps {
  performance: Performance;
  onBack: () => void;
  onBookNow: (performance: Performance) => void;
}

export function PerformanceDetail({ performance, onBack, onBookNow }: PerformanceDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'ONGOING': return 'default';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const availableSeats = performance.total_seats - (performance.total_seats - performance.available_seats);
  const occupancyRate = ((performance.total_seats - performance.available_seats) / performance.total_seats * 100);

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
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
                    alt={performance.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-medium">{performance.title}</h1>
                      <Badge variant={getStatusColor(performance.status)}>
                        {performance.status}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground">{performance.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{performance.venue_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span>{formatDate(performance.show_datetime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <span>{formatTime(performance.show_datetime)} ({performance.duration_minutes}분)</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span>{performance.available_seats} / {performance.total_seats} seats available</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">From {formatPrice(performance.base_price)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{performance.category}</Badge>
                    {performance.age_rating && (
                      <Badge variant="secondary">{performance.age_rating}</Badge>
                    )}
                  </div>
                </div>
              </div>
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
                <h3 className="font-medium mb-2">About This Performance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {performance.description || "This is an exciting performance that promises to deliver an unforgettable experience. Join us for an evening of world-class entertainment featuring talented performers and stunning production values. Don't miss this opportunity to be part of something truly special."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-muted-foreground">{performance.duration_minutes} minutes</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <p className="text-muted-foreground">{performance.category}</p>
                </div>

                {performance.age_rating && (
                  <div>
                    <h4 className="font-medium mb-2">Age Rating</h4>
                    <p className="text-muted-foreground">{performance.age_rating}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge variant={getStatusColor(performance.status)}>
                    {performance.status}
                  </Badge>
                </div>
              </div>

              {performance.performance_notes && (
                <div>
                  <h4 className="font-medium mb-2">Important Notes</h4>
                  <p className="text-muted-foreground">{performance.performance_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Venue Information */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{performance.venue_name}</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p>Total Capacity: {performance.total_seats} seats</p>
                  <p>Available: {performance.available_seats} seats</p>
                  <p>Occupancy: {occupancyRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium mb-2">Getting There</h4>
                <p className="text-sm text-muted-foreground">
                  Please arrive at least 30 minutes before the performance begins. 
                  Late arrivals may not be admitted until a suitable break in the performance.
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
              <div className="text-center">
                <div className="text-2xl font-medium mb-1">
                  From {formatPrice(performance.base_price)}
                </div>
                <p className="text-sm text-muted-foreground">per seat</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Available Seats:</span>
                  <span className="font-medium">{performance.available_seats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Performance Date:</span>
                  <span className="font-medium">{formatDate(performance.show_datetime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Start Time:</span>
                  <span className="font-medium">{formatTime(performance.show_datetime)}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onBookNow(performance)}
                disabled={performance.available_seats === 0 || performance.status !== 'SCHEDULED'}
              >
                {performance.available_seats === 0 
                  ? 'Sold Out' 
                  : performance.status !== 'SCHEDULED'
                  ? 'Booking Unavailable'
                  : 'Select Seats'
                }
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Secure booking • Instant confirmation • Mobile tickets
              </p>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Quick Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Premium venue experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-500" />
                  <span>Mobile tickets available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>Group discounts available</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Indicator */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Seat Availability</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Booked</span>
                  <span>{performance.total_seats - performance.available_seats} seats</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {occupancyRate.toFixed(1)}% booked
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}