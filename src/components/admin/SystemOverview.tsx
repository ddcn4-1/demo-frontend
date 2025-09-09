import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, TrendingUp, Server, Clock, AlertTriangle } from 'lucide-react';
import { serverAPI } from '../../data/mockServer';

interface SystemMetrics {
  timestamp: string;
  active_users: number;
  queue_length: number;
  cpu_usage: number;
  memory_usage: number;
  request_count: number;
  avg_response_time: number;
}

interface SystemOverviewProps {
  permissions: {
    canViewMetrics: boolean;
    canControlTraffic: boolean;
  };
}

export function SystemOverview({ permissions }: SystemOverviewProps) {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Array<{ id: number; type: string; message: string; severity: 'low' | 'medium' | 'high' }>>([]);

  useEffect(() => {
    // Generate mock metrics data for the last 24 hours
    const generateMetrics = () => {
      const data: SystemMetrics[] = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = timestamp.getHours();
        
        // Simulate traffic patterns (higher during evening hours)
        const trafficMultiplier = hour >= 18 && hour <= 23 ? 2.5 : hour >= 9 && hour <= 17 ? 1.5 : 0.5;
        
        data.push({
          timestamp: timestamp.toISOString(),
          active_users: Math.floor(Math.random() * 1000 * trafficMultiplier) + 100,
          queue_length: Math.floor(Math.random() * 50 * trafficMultiplier),
          cpu_usage: Math.random() * 80 + 10,
          memory_usage: Math.random() * 70 + 20,
          request_count: Math.floor(Math.random() * 5000 * trafficMultiplier) + 500,
          avg_response_time: Math.random() * 200 + 50
        });
      }
      
      return data;
    };

    const metricsData = generateMetrics();
    setMetrics(metricsData);
    setCurrentMetrics(metricsData[metricsData.length - 1]);

    // Generate mock alerts
    setAlerts([
      {
        id: 1,
        type: 'Performance',
        message: 'High CPU usage detected on server-01 (85%)',
        severity: 'high'
      },
      {
        id: 2,
        type: 'Traffic',
        message: 'Queue length exceeded threshold (45 users)',
        severity: 'medium'
      },
      {
        id: 3,
        type: 'System',
        message: 'Memory usage approaching limit (78%)',
        severity: 'medium'
      }
    ]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newMetric: SystemMetrics = {
        timestamp: new Date().toISOString(),
        active_users: Math.floor(Math.random() * 2000) + 100,
        queue_length: Math.floor(Math.random() * 100),
        cpu_usage: Math.random() * 90 + 5,
        memory_usage: Math.random() * 80 + 15,
        request_count: Math.floor(Math.random() * 10000) + 500,
        avg_response_time: Math.random() * 300 + 30
      };

      setCurrentMetrics(newMetric);
      setMetrics(prev => [...prev.slice(1), newMetric]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!permissions.canViewMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Access denied. You don't have permission to view system metrics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-medium">{currentMetrics?.active_users.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queue Length</p>
                <p className={`text-2xl font-medium ${getStatusColor(currentMetrics?.queue_length || 0, { warning: 30, critical: 50 })}`}>
                  {currentMetrics?.queue_length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <p className={`text-2xl font-medium ${getStatusColor(currentMetrics?.cpu_usage || 0, { warning: 70, critical: 85 })}`}>
                  {currentMetrics?.cpu_usage.toFixed(1)}%
                </p>
              </div>
              <Server className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className={`text-2xl font-medium ${getStatusColor(currentMetrics?.avg_response_time || 0, { warning: 200, critical: 500 })}`}>
                  {currentMetrics?.avg_response_time.toFixed(0)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.type}</p>
                  </div>
                  <Badge variant={getAlertColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Users (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value) => [value, 'Active Users']}
                />
                <Area 
                  type="monotone" 
                  dataKey="active_users" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value, name) => [
                    name === 'avg_response_time' ? `${value}ms` : `${value}%`, 
                    name === 'cpu_usage' ? 'CPU' : name === 'memory_usage' ? 'Memory' : 'Response Time'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu_usage" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory_usage" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value) => [value, 'Requests']}
                />
                <Bar 
                  dataKey="request_count" 
                  fill="#8884d8" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Length</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatTime}
                  formatter={(value) => [value, 'Queue Length']}
                />
                <Line 
                  type="monotone" 
                  dataKey="queue_length" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}