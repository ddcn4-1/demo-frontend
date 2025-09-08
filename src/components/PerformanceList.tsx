import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { serverAPI, Performance } from '../data/mockServer';

interface PerformanceListProps {
  onSelectPerformance: (performance: Performance) => void;
  onViewDetails: (performance: Performance) => void;
}

export function PerformanceList({ onSelectPerformance, onViewDetails }: PerformanceListProps) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const performanceData = await serverAPI.getPerformances();
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
      } catch (error) {
        console.error('Failed to fetch performances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, []);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Available Performances</h2>
        <Badge variant="outline">{performances.length} performances</Badge>
      </div>
      
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