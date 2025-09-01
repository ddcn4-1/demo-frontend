import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock } from 'lucide-react';

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
}

const PerformanceManagement: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([
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
      category: 'Musical'
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
      category: 'Concert'
    },
    {
      id: '3',
      title: 'Comedy Night',
      description: 'Stand-up comedy show with top comedians',
      venue: 'Comedy Club',
      date: '2024-03-10',
      time: '21:00',
      price: 35,
      totalSeats: 200,
      availableSeats: 0,
      status: 'completed',
      category: 'Comedy'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    price: '',
    totalSeats: '',
    category: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      venue: '',
      date: '',
      time: '',
      price: '',
      totalSeats: '',
      category: ''
    });
    setEditingPerformance(null);
  };

  const handleEdit = (performance: Performance) => {
    setEditingPerformance(performance);
    setFormData({
      title: performance.title,
      description: performance.description,
      venue: performance.venue,
      date: performance.date,
      time: performance.time,
      price: performance.price.toString(),
      totalSeats: performance.totalSeats.toString(),
      category: performance.category
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPerformance: Performance = {
      id: editingPerformance?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      venue: formData.venue,
      date: formData.date,
      time: formData.time,
      price: parseFloat(formData.price),
      totalSeats: parseInt(formData.totalSeats),
      availableSeats: editingPerformance?.availableSeats || parseInt(formData.totalSeats),
      status: editingPerformance?.status || 'upcoming',
      category: formData.category
    };

    if (editingPerformance) {
      setPerformances(performances.map(p => 
        p.id === editingPerformance.id ? newPerformance : p
      ));
    } else {
      setPerformances([...performances, newPerformance]);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPerformances(performances.filter(p => p.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Management</h2>
          <p className="text-gray-600">Manage performances, shows, and events</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Performance
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPerformance ? 'Edit Performance' : 'Add New Performance'}
              </DialogTitle>
              <DialogDescription>
                {editingPerformance ? 'Update performance details' : 'Create a new performance or event'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Performance title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Musical">Musical</SelectItem>
                      <SelectItem value="Concert">Concert</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Theater">Theater</SelectItem>
                      <SelectItem value="Dance">Dance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Performance description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="Venue name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalSeats">Total Seats</Label>
                  <Input
                    id="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPerformance ? 'Update' : 'Create'} Performance
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Performances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performances.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performances.filter(p => p.status === 'upcoming').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performances.reduce((sum, p) => sum + p.totalSeats, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performances.reduce((sum, p) => sum + p.availableSeats, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performances Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Performances</CardTitle>
          <CardDescription>Manage and view all performances</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Performance</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performances.map((performance) => (
                <TableRow key={performance.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{performance.title}</div>
                      <div className="text-sm text-gray-600">{performance.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div>{new Date(performance.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {performance.time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {performance.venue}
                    </div>
                  </TableCell>
                  <TableCell>${performance.price}</TableCell>
                  <TableCell>
                    <div>
                      <div>{performance.availableSeats} / {performance.totalSeats}</div>
                      <div className="text-sm text-gray-600">
                        {Math.round((1 - performance.availableSeats / performance.totalSeats) * 100)}% sold
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(performance.status)}>
                      {performance.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(performance)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(performance.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
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
};

export default PerformanceManagement;