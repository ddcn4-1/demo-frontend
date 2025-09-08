import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';

interface Performance {
  performance_id: number;
  title: string;
  description: string;
  theme: string;
  poster_url: string;
  start_date: string;
  end_date: string;
  running_time: number;
  base_price: number;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
  venue_name: string;
  venue_id: number;
  total_bookings: number;
  revenue: number;
}

interface Venue {
  venue_id: number;
  venue_name: string;
  total_capacity: number;
}

export function PerformanceManagement() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    poster_url: '',
    start_date: '',
    end_date: '',
    running_time: 0,
    base_price: 0,
    venue_id: 0
  });

  useEffect(() => {
    // Mock data initialization
    setTimeout(() => {
      setVenues([
        { venue_id: 1, venue_name: 'Grand Opera House', total_capacity: 200 },
        { venue_id: 2, venue_name: 'National Theater', total_capacity: 150 },
        { venue_id: 3, venue_name: 'Arena Stadium', total_capacity: 3000 },
        { venue_id: 4, venue_name: 'Concert Hall', total_capacity: 500 }
      ]);

      setPerformances([
        {
          performance_id: 1,
          title: 'The Phantom of the Opera',
          description: 'A haunting tale of beauty and the beast in this timeless musical masterpiece.',
          theme: 'MUSICAL',
          poster_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
          start_date: '2024-12-01',
          end_date: '2024-12-31',
          running_time: 150,
          base_price: 75000,
          status: 'ONGOING',
          venue_name: 'Grand Opera House',
          venue_id: 1,
          total_bookings: 145,
          revenue: 10875000
        },
        {
          performance_id: 2,
          title: 'Swan Lake Ballet',
          description: 'Experience the classic ballet with stunning choreography and beautiful music.',
          theme: 'BALLET',
          poster_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop',
          start_date: '2024-12-10',
          end_date: '2024-12-25',
          running_time: 120,
          base_price: 65000,
          status: 'ONGOING',
          venue_name: 'National Theater',
          venue_id: 2,
          total_bookings: 78,
          revenue: 5070000
        },
        {
          performance_id: 3,
          title: 'Rock Concert Live',
          description: 'An electrifying rock concert featuring top bands and explosive performances.',
          theme: 'CONCERT',
          poster_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
          start_date: '2024-12-20',
          end_date: '2024-12-22',
          running_time: 180,
          base_price: 85000,
          status: 'UPCOMING',
          venue_name: 'Arena Stadium',
          venue_id: 3,
          total_bookings: 1250,
          revenue: 106250000
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreatePerformance = () => {
    const newPerformance: Performance = {
      performance_id: Date.now(),
      ...formData,
      status: 'UPCOMING' as const,
      venue_name: venues.find(v => v.venue_id === formData.venue_id)?.venue_name || '',
      total_bookings: 0,
      revenue: 0
    };

    setPerformances(prev => [...prev, newPerformance]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleUpdatePerformance = () => {
    if (!editingPerformance) return;

    setPerformances(prev => prev.map(perf => 
      perf.performance_id === editingPerformance.performance_id
        ? { 
            ...perf, 
            ...formData,
            venue_name: venues.find(v => v.venue_id === formData.venue_id)?.venue_name || perf.venue_name
          }
        : perf
    ));
    setEditingPerformance(null);
    resetForm();
  };

  const handleDeletePerformance = (id: number) => {
    if (window.confirm('Are you sure you want to delete this performance?')) {
      setPerformances(prev => prev.filter(perf => perf.performance_id !== id));
    }
  };

  const handleEditPerformance = (performance: Performance) => {
    setEditingPerformance(performance);
    setFormData({
      title: performance.title,
      description: performance.description,
      theme: performance.theme,
      poster_url: performance.poster_url,
      start_date: performance.start_date,
      end_date: performance.end_date,
      running_time: performance.running_time,
      base_price: performance.base_price,
      venue_id: performance.venue_id
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      theme: '',
      poster_url: '',
      start_date: '',
      end_date: '',
      running_time: 0,
      base_price: 0,
      venue_id: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'default';
      case 'UPCOMING': return 'secondary';
      case 'ENDED': return 'outline';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const PerformanceForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Performance title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Performance description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MUSICAL">Musical</SelectItem>
              <SelectItem value="BALLET">Ballet</SelectItem>
              <SelectItem value="CONCERT">Concert</SelectItem>
              <SelectItem value="OPERA">Opera</SelectItem>
              <SelectItem value="THEATER">Theater</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="venue">Venue</Label>
          <Select value={formData.venue_id.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, venue_id: parseInt(value) }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              {venues.map(venue => (
                <SelectItem key={venue.venue_id} value={venue.venue_id.toString()}>
                  {venue.venue_name} ({venue.total_capacity} seats)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="poster_url">Poster URL</Label>
        <Input
          id="poster_url"
          value={formData.poster_url}
          onChange={(e) => setFormData(prev => ({ ...prev, poster_url: e.target.value }))}
          placeholder="https://example.com/poster.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="running_time">Running Time (minutes)</Label>
          <Input
            id="running_time"
            type="number"
            value={formData.running_time}
            onChange={(e) => setFormData(prev => ({ ...prev, running_time: parseInt(e.target.value) || 0 }))}
            placeholder="120"
          />
        </div>

        <div>
          <Label htmlFor="base_price">Base Price (KRW)</Label>
          <Input
            id="base_price"
            type="number"
            value={formData.base_price}
            onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseInt(e.target.value) || 0 }))}
            placeholder="50000"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => {
          setShowCreateDialog(false);
          setEditingPerformance(null);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button onClick={isEdit ? handleUpdatePerformance : handleCreatePerformance}>
          {isEdit ? 'Update' : 'Create'} Performance
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
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
          <h2>Performance Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage performances, schedules, and venue assignments
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Performance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Performance</DialogTitle>
            </DialogHeader>
            <PerformanceForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Performances</p>
                <p className="text-xl font-medium">{performances.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-xl font-medium">
                  {performances.reduce((sum, p) => sum + p.total_bookings, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Venues</p>
                <p className="text-xl font-medium">{venues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-500 rounded"></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-medium">
                  {formatPrice(performances.reduce((sum, p) => sum + p.revenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Performances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Theme</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances.map((performance) => (
                <TableRow key={performance.performance_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={performance.poster_url} 
                        alt={performance.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{performance.title}</p>
                        <p className="text-sm text-muted-foreground">{performance.running_time}min</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{performance.venue_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{performance.theme}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(performance.start_date)}</div>
                      <div className="text-muted-foreground">to {formatDate(performance.end_date)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(performance.status)}>
                      {performance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{performance.total_bookings.toLocaleString()}</TableCell>
                  <TableCell>{formatPrice(performance.revenue)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPerformance(performance)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePerformance(performance.performance_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPerformance} onOpenChange={(open) => {
        if (!open) {
          setEditingPerformance(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Performance</DialogTitle>
          </DialogHeader>
          <PerformanceForm isEdit />
        </DialogContent>
      </Dialog>
    </div>
  );
}