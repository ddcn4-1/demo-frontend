import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, MapPin, Users, Search, Filter, X } from 'lucide-react';
import { serverAPI, Performance } from '../data/mockServer';

interface PerformanceListProps {
  onSelectPerformance: (performance: Performance) => void;
  onViewDetails: (performance: Performance) => void;
}

export function PerformanceList({ onSelectPerformance, onViewDetails }: PerformanceListProps) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Search and filter states
  const [searchName, setSearchName] = useState('');
  const [searchVenue, setSearchVenue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Current search parameters (what was last sent to backend)
  const [currentSearchParams, setCurrentSearchParams] = useState({
    name: '',
    venue: '',
    status: 'all'
  });

  // Fetch performances with search parameters
  const fetchPerformances = async (searchParams?: {
    name?: string;
    venue?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      // Call backend API with search parameters
      const performanceData = await serverAPI.searchPerformances({
        name: searchParams?.name || '',
        venue: searchParams?.venue || '',
        status: searchParams?.status === 'all' ? '' : searchParams?.status || ''
      });
      
      // Convert the Performance interface to the expected format for this component
      const formattedPerformances = performanceData.map(perf => ({
        ...perf,
        theme: perf.category,
        poster_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        start_date: perf.show_datetime.split('T')[0],
        end_date: perf.show_datetime.split('T')[0],
        running_time: perf.duration_minutes,
        venue_address: 'Seoul, Korea',
        schedules: [
          {
            schedule_id: perf.performance_id,
            show_datetime: perf.show_datetime,
            available_seats: perf.available_seats,
            total_seats: perf.total_seats,
            status: perf.available_seats > 0 ? 'OPEN' : 'SOLDOUT'
          }
        ]
      }));
      setPerformances(formattedPerformances);
      
      if (searchParams) {
        setCurrentSearchParams({
          name: searchParams.name || '',
          venue: searchParams.venue || '',
          status: searchParams.status || 'all'
        });
      }
    } catch (error) {
      console.error('Failed to fetch performances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch all performances
  useEffect(() => {
    fetchPerformances();
  }, []);

  // Handle search submission
  const handleSearch = async () => {
    setSearching(true);
    try {
      await fetchPerformances({
        name: searchName,
        venue: searchVenue,
        status: statusFilter
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  // Handle Enter key in search inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear all filters and fetch all performances
  const clearFilters = () => {
    setSearchName('');
    setSearchVenue('');
    setStatusFilter('all');
    fetchPerformances(); // Reset to show all performances
    setCurrentSearchParams({ name: '', venue: '', status: 'all' });
  };

  // Check if any filters are active in the input fields
  const hasActiveFilters = searchName !== '' || searchVenue !== '' || statusFilter !== 'all';
  
  // Check if current search differs from displayed results
  const hasUnsavedChanges = searchName !== currentSearchParams.name || 
                           searchVenue !== currentSearchParams.venue || 
                           statusFilter !== currentSearchParams.status;

  // Check if any search parameters were applied to current results
  const hasAppliedFilters = currentSearchParams.name !== '' || 
                           currentSearchParams.venue !== '' || 
                           currentSearchParams.status !== 'all';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'default';
      case 'SOLDOUT': return 'destructive';
      case 'CLOSED': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-muted rounded-t-lg"></div>
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and count */}
      <div className="flex items-center justify-between">
        <h2>Available Performances</h2>
        <div className="flex items-center gap-2">
          {hasAppliedFilters && (
            <Badge variant="secondary" className="text-xs">
              Filtered Results
            </Badge>
          )}
          <Badge variant="outline">
            {performances.length} performance{performances.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Performance Name Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by performance name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9"
              disabled={searching}
            />
          </div>

          {/* Venue Search */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by venue..."
              value={searchVenue}
              onChange={(e) => setSearchVenue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9"
              disabled={searching}
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={searching}>
              <SelectTrigger className="pl-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="available">Available Seats</SelectItem>
                <SelectItem value="soldout">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch} 
            disabled={searching || !hasUnsavedChanges}
            className="min-w-[100px]"
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Applied Filters & Clear Button */}
        {hasAppliedFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Applied filters:</span>
            
            {currentSearchParams.name && (
              <Badge variant="secondary" className="gap-1">
                Name: "{currentSearchParams.name}"
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => {
                    setSearchName('');
                    fetchPerformances({ 
                      name: '', 
                      venue: currentSearchParams.venue, 
                      status: currentSearchParams.status 
                    });
                  }} 
                />
              </Badge>
            )}
            
            {currentSearchParams.venue && (
              <Badge variant="secondary" className="gap-1">
                Venue: "{currentSearchParams.venue}"
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => {
                    setSearchVenue('');
                    fetchPerformances({ 
                      name: currentSearchParams.name, 
                      venue: '', 
                      status: currentSearchParams.status 
                    });
                  }} 
                />
              </Badge>
            )}
            
            {currentSearchParams.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {currentSearchParams.status}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => {
                    setStatusFilter('all');
                    fetchPerformances({ 
                      name: currentSearchParams.name, 
                      venue: currentSearchParams.venue, 
                      status: 'all' 
                    });
                  }} 
                />
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2" disabled={searching}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && !searching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Search criteria changed. Click "Search" to apply filters.
          </div>
        )}
      </div>

      {/* No Results Message */}
      {performances.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No performances found</h3>
          <p className="text-muted-foreground mb-4">
            {hasAppliedFilters 
              ? "No performances match your search criteria. Try adjusting your filters."
              : "No performances are currently available"
            }
          </p>
          {hasAppliedFilters && (
            <Button variant="outline" onClick={clearFilters} disabled={searching}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
      
      {/* Performance Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {performances.map((performance) => (
          <Card key={performance.performance_id} className="overflow-hidden">
            <div className="aspect-[3/4] relative cursor-pointer" onClick={() => onViewDetails(performance)}>
              <img 
                src={performance.poster_url} 
                alt={performance.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
              <Badge 
                className="absolute top-2 right-2" 
                variant={performance.status === 'ONGOING' ? 'default' : 'secondary'}
              >
                {performance.status}
              </Badge>
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white font-medium bg-black/50 px-3 py-1 rounded">View Details</span>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-medium line-clamp-1">{performance.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {performance.description}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{performance.venue_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(performance.start_date)} - {formatDate(performance.end_date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{performance.running_time}분</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">시작가 {formatPrice(performance.base_price)}</span>
                  <Badge variant="outline">{performance.theme}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Upcoming Shows:</p>
                {performance.schedules.slice(0, 2).map((schedule) => (
                  <div key={schedule.schedule_id} className="flex items-center justify-between text-xs">
                    <span>{formatDate(schedule.show_datetime)}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(schedule.status)} className="text-xs">
                        {schedule.status}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {schedule.available_seats}/{schedule.total_seats}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => onSelectPerformance(performance)}
                disabled={performance.schedules.every(s => s.status === 'SOLDOUT')}
              >
                {performance.schedules.every(s => s.status === 'SOLDOUT') ? 'Sold Out' : 'Book Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}