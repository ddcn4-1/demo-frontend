import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Heart,
  Share2,
  ArrowLeft,
  Ticket
} from 'lucide-react';

const PerformanceDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock performance data - would normally fetch from API using id
  const performance = {
    id: id,
    title: 'Hamilton Musical',
    description: 'The revolutionary musical about Alexander Hamilton that tells the story of America then, told by America now. Featuring a score that blends hip-hop, jazz, blues, rap, R&B, and Broadway, Hamilton is the story of America then, told by America now.',
    longDescription: `Hamilton is a sung-and-rapped-through musical by Lin-Manuel Miranda. It tells the story of American Founding Father Alexander Hamilton. Miranda said he was inspired to write the musical after reading the 2004 biography Alexander Hamilton by Ron Chernow.

The musical has been acclaimed for its musical score and its cast, which consists predominantly of non-white actors portraying white historical figures. The show features the songs "Wait for It," "The Room Where It Happens," and many more that have become cultural phenomena.

This production features the original Broadway arrangements with incredible choreography and staging that brings the founding of America to life in a completely new way.`,
    venue: 'Broadway Theater',
    address: '1681 Broadway, New York, NY 10019',
    date: '2024-03-15',
    time: '19:30',
    duration: '2h 45min',
    price: 150,
    totalSeats: 500,
    availableSeats: 120,
    status: 'upcoming',
    category: 'Musical',
    rating: 4.8,
    reviewCount: 1247,
    image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NTYzNTYxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ageRestriction: 'Recommended for ages 10+',
    highlights: [
      'Tony Award-winning musical',
      'Original Broadway production',
      'Revolutionary hip-hop score',
      'Acclaimed diverse cast',
      'Historical American story'
    ],
    cast: [
      { name: 'Alexander Hamilton', actor: 'John Smith' },
      { name: 'Aaron Burr', actor: 'Michael Johnson' },
      { name: 'Eliza Hamilton', actor: 'Sarah Davis' },
      { name: 'George Washington', actor: 'David Wilson' },
      { name: 'Angelica Schuyler', actor: 'Emma Brown' }
    ]
  };

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2024-03-01',
      comment: 'Absolutely incredible performance! The energy, the music, the acting - everything was perfect. A must-see show!'
    },
    {
      id: 2,
      name: 'John D.',
      rating: 5,
      date: '2024-02-28',
      comment: 'One of the best theatrical experiences of my life. The cast was phenomenal and the staging was brilliant.'
    },
    {
      id: 3,
      name: 'Emily R.',
      rating: 4,
      date: '2024-02-25',
      comment: 'Great show with amazing music. The seats were good and the theater was beautiful. Highly recommended!'
    }
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: performance.title,
          text: `Check out ${performance.title} at ${performance.venue}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getAvailabilityStatus = () => {
    const percentage = (performance.availableSeats / performance.totalSeats) * 100;
    if (percentage > 50) return { text: 'Good Availability', color: 'bg-green-500' };
    if (percentage > 20) return { text: 'Limited Seats', color: 'bg-yellow-500' };
    if (performance.availableSeats > 0) return { text: 'Few Seats Left', color: 'bg-red-500' };
    return { text: 'Sold Out', color: 'bg-gray-500' };
  };

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Performances
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image and Basic Info */}
            <Card>
              <div className="h-64 md:h-80 relative">
                <ImageWithFallback 
                  src={performance.image} 
                  alt={performance.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-white text-gray-900 text-lg px-3 py-1">
                    ${performance.price}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{performance.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{performance.rating}</span>
                        <span className="text-sm">({performance.reviewCount} reviews)</span>
                      </div>
                      <Badge variant="secondary">{performance.category}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{new Date(performance.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{performance.time}</div>
                      <div className="text-sm">Duration: {performance.duration}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{performance.venue}</div>
                      <div className="text-sm">{performance.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{performance.availableSeats} seats available</div>
                      <div className="text-sm">of {performance.totalSeats} total</div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">{performance.description}</p>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About the Show</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {performance.longDescription}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Highlights</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {performance.highlights.map((highlight, index) => (
                          <li key={index} className="text-gray-700">{highlight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="font-medium">Age Restriction:</span>
                        <span className="text-gray-700 ml-2">{performance.ageRestriction}</span>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <span className="text-gray-700 ml-2">{performance.duration}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="cast" className="space-y-4">
                    <h3 className="text-lg font-semibold">Main Cast</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {performance.cast.map((member, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-gray-600">{member.actor}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Customer Reviews</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{performance.rating}</span>
                        <span className="text-gray-600">({performance.reviewCount} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.name}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Book Your Tickets
                </CardTitle>
                <CardDescription>
                  Secure your seats for this amazing performance
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Price per ticket</span>
                    <span className="text-2xl font-bold">${performance.price}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Includes all taxes and fees
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Date</span>
                    <span className="font-medium">
                      {new Date(performance.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time</span>
                    <span className="font-medium">{performance.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Venue</span>
                    <span className="font-medium">{performance.venue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Availability</span>
                    <Badge className={availabilityStatus.color}>
                      {availabilityStatus.text}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full mb-3" 
                    size="lg"
                    onClick={() => navigate(`/client/booking/${performance.id}`)}
                    disabled={performance.availableSeats === 0}
                  >
                    {performance.availableSeats === 0 ? 'Sold Out' : 'Select Seats & Book'}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Free cancellation up to 24 hours before the show
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDetails;