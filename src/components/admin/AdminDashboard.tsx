import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../App';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import AdminSidebar from './AdminSidebar';
import PerformanceManagement from './PerformanceManagement';
import UserManagement from './UserManagement';
import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';
import { 
  Users, 
  Calendar, 
  Ticket, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Activity,
  LogOut
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock dashboard data
  const dashboardStats = {
    totalUsers: 1250,
    totalPerformances: 45,
    totalBookings: 3240,
    activeUsers: 186,
    revenue: 125600,
    topPerformance: 'Hamilton Musical'
  };

  const recentActivity = [
    { id: 1, action: 'New user registered', user: 'john@example.com', time: '5 min ago' },
    { id: 2, action: 'Booking confirmed', user: 'sarah@example.com', time: '12 min ago' },
    { id: 3, action: 'Performance added', user: 'admin@example.com', time: '1 hour ago' },
    { id: 4, action: 'User permission updated', user: 'manager@example.com', time: '2 hours ago' },
  ];

  const isOnDashboard = location.pathname === '/admin' || location.pathname === '/admin/';

  if (!isOnDashboard) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route path="performances" element={<PerformanceManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="settings" element={<SystemSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performances</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalPerformances}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalBookings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +23% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${dashboardStats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +18% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest system activities and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {activity.time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Current system performance and health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Server Status</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="default" className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Response Time</span>
                      <Badge variant="secondary">125ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <Badge variant="secondary">{dashboardStats.activeUsers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => navigate('/admin/performances')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    Add Performance
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Users className="h-5 w-5" />
                    Manage Users
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/admin/bookings')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Ticket className="h-5 w-5" />
                    View Bookings
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/admin/settings')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;