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
import { Performance, Venue } from '../type/index';
import { serverAPI } from '../service/apiService';

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

  // 초기화
  useEffect(() => {
    const fetchPerfomances = async () => {
      try {
        setLoading(true);

        const venueData = await serverAPI.getVenues();
        const performanceData = await serverAPI.getPerformances();

        setVenues(venueData);
        setPerformances(performanceData);
      } catch (error) {
        console.error('공연 데이터를 가져오는데 실패했습니다: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfomances();
  }, []);

  const handleCreatePerformance = async () => {
    try {
      setLoading(true);

      const newPerformance = await serverAPI.createPerformance({
        venueId: formData.venue_id,
        title: formData.title,
        description: formData.description,
        theme: formData.theme,
        posterUrl: formData.poster_url,
        basePrice: formData.base_price,
        startDate: formData.start_date,
        endDate: formData.end_date,
        runningTime: formData.running_time,
        status: "UPCOMING"
      });

      if (newPerformance !== undefined) {
        setPerformances(prev => [...prev, newPerformance]);
        setShowCreateDialog(false);
        resetForm();
        console.log('공연 생성 성공');
      } else {
        throw new Error('공연 생성 실패');
      }
    } catch (error) {
      console.error('공연 생성 실패: ', error);
    } finally {
      setLoading(false);
    }
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
                  {performances.reduce((sum, p) => sum + (p.total_bookings || 0), 0).toLocaleString()}
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
                  <TableCell>{(performance.total_bookings || 0).toLocaleString()}</TableCell>
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