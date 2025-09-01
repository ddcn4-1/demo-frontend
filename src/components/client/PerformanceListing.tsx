import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface Performance {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
  image: string;
}

const PerformanceListing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [performances] = useState<Performance[]>([
    {
      id: '1',
      title: 'Hamilton Musical',
      description: 'The revolutionary musical about Alexander Hamilton',
      venue: 'Broadway Theater',
      date: '2024-03-15',
      time: '19:30',
      price: 150,
      totalSeats: 500,
      availableSeats: 120,
      status: 'upcoming',
      category: 'Musical',
      image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NTYzNTYxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '2',
      title: 'Rock Concert',
      description: 'Live rock performance by popular band',
      venue: 'Madison Square Garden',
      date: '2024-03-20',
      time: '20:00',
      price: 85,
      totalSeats: 2000,
      availableSeats: 450,
      status: 'upcoming',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1656283384093-1e227e621fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBtdXNpY3xlbnwxfHx8fDE3NTY0NDU3Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '3',
      title: 'Jazz Night',
      description: 'Smooth jazz evening with renowned artists',
      venue: 'Blue Note',
      date: '2024-03-25',
      time: '21:00',
      price: 45,
      totalSeats: 150,
      availableSeats: 85,
      status: 'upcoming',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1731185762173-f7068929fb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwY2x1YiUyMG11c2ljfGVufDF8fHx8MTc1NjQwNTk0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '4',
      title: 'Comedy Stand-up',
      description: 'Hilarious night with top comedians',
      venue: 'Comedy Club Downtown',
      date: '2024-03-18',
      time: '20:30',
      price: 35,
      totalSeats: 200,
      availableSeats: 150,
      status: 'upcoming',
      category: 'Comedy',
      image: 'https://images.unsplash.com/photo-1585699622060-6b79b24a6bdb?w=1080'
    },
    {
      id: '5',
      title: 'Classical Symphony',
      description: 'Beautiful evening of classical music',
      venue: 'Symphony Hall',
      date: '2024-03-22',
      time: '19:00',
      price: 120,
      totalSeats: 800,
      availableSeats: 320,
      status: 'upcoming',
      category: 'Classical',
      image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=1080'
    },
    {
      id: '6',
      title: 'Modern Dance Performance',
      description: 'Contemporary dance by acclaimed company',
      venue: 'Dance Theater',
      date: '2024-03-28',
      time: '18:30',
      price: 75,
      totalSeats: 300,
      availableSeats: 180,
      status: 'upcoming',
      category: 'Dance',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1080'
    }
  ]);

  const [filteredPerformances, setFilteredPerformances] = useState<Performance[]>(performances);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let filtered = [...performances];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(performance =>
        performance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performance.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performance.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(performance =>
        performance.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'under50':
          filtered = filtered.filter(performance => performance.price < 50);
          break;
        case '50to100':
          filtered = filtered.filter(performance => performance.price >= 50 && performance.price < 100);
          break;
        case 'over100':
          filtered = filtered.filter(performance => performance.price >= 100);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'availability':
          aValue = a.availableSeats;
          bValue = b.availableSeats;
          break;
        default: // date
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPerformances(filtered);
  }, [searchTerm, categoryFilter, priceFilter, sortBy, sortOrder, performances]);

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAvailabilityText = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'Good Availability';
    if (percentage > 20) return 'Limited Seats';
    if (available > 0) return 'Few Seats Left';
    return 'Sold Out';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPriceFilter('all');
    setSortBy('date');
    setSortOrder('asc');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Performances</h1>
          <p className="text-gray-600">Discover and book tickets for amazing events</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search performances..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="musical">Musical</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="dance">Dance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Range</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under50">Under $50</SelectItem>
                    <SelectItem value="50to100">$50 - $100</SelectItem>
                    <SelectItem value="over100">Over $100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-1"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPerformances.length} of {performances.length} performances
          </p>
        </div>

        {/* Performance Grid */}
        {filteredPerformances.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No performances found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or clearing the filters
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPerformances.map((performance) => (
              <Card key={performance.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 relative">
                  <ImageWithFallback 
                    src={performance.image} 
                    alt={performance.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-gray-900">
                      ${performance.price}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">
                      {performance.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{performance.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{performance.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{performance.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{new Date(performance.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{performance.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {performance.availableSeats} / {performance.totalSeats} seats available
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Badge className={getAvailabilityColor(performance.availableSeats, performance.totalSeats)}>
                      {getAvailabilityText(performance.availableSeats, performance.totalSeats)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => navigate(`/client/performance/${performance.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/client/booking/${performance.id}`)}
                      disabled={performance.availableSeats === 0}
                    >
                      {performance.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceListing;