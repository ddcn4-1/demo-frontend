import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Server, 
  Plus, 
  Minus, 
  Activity, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ServerInstance {
  id: string;
  name: string;
  status: 'running' | 'starting' | 'stopping' | 'stopped';
  cpu: number;
  memory: number;
  requests_per_minute: number;
  uptime: string;
}

interface TrafficControlProps {
  permissions: {
    canControlTraffic: boolean;
    canScaleInfrastructure: boolean;
  };
}

export function TrafficControl({ permissions }: TrafficControlProps) {
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [autoScaling, setAutoScaling] = useState(true);
  const [loadBalancing, setLoadBalancing] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [rateLimit, setRateLimit] = useState([100]);
  const [scaling, setScaling] = useState(false);
  const [targetServerCount, setTargetServerCount] = useState('');
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    message: string;
    type: 'success' | 'warning' | 'error';
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    // Initialize mock servers
    setServers([
      {
        id: 'server-01',
        name: 'Web Server 01',
        status: 'running',
        cpu: 65.2,
        memory: 78.5,
        requests_per_minute: 1250,
        uptime: '15d 8h 32m'
      },
      {
        id: 'server-02',
        name: 'Web Server 02',
        status: 'running',
        cpu: 58.7,
        memory: 72.1,
        requests_per_minute: 1180,
        uptime: '15d 8h 32m'
      },
      {
        id: 'server-03',
        name: 'Web Server 03',
        status: 'running',
        cpu: 42.3,
        memory: 55.8,
        requests_per_minute: 890,
        uptime: '12d 4h 15m'
      }
    ]);

    // Add initial notification
    addNotification('System initialized successfully', 'success');
  }, []);

  const addNotification = (message: string, type: 'success' | 'warning' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleScaleServers = async () => {
    if (!permissions.canScaleInfrastructure) {
      addNotification('Access denied: Cannot scale infrastructure', 'error');
      return;
    }

    const targetCount = parseInt(targetServerCount);
    
    if (isNaN(targetCount) || targetCount < 1 || targetCount > 20) {
      addNotification('Invalid server count. Please enter a number between 1 and 20', 'error');
      return;
    }

    const currentCount = servers.filter(s => s.status === 'running' || s.status === 'starting').length;
    
    if (targetCount === currentCount) {
      addNotification(`Already have ${currentCount} servers running`, 'warning');
      return;
    }

    setScaling(true);
    setTargetServerCount('');

    if (targetCount > currentCount) {
      // Scale up
      const serversToAdd = targetCount - currentCount;
      addNotification(`Scaling up: Adding ${serversToAdd} server(s)...`, 'warning');
      addNotification('Executing: aws ec2 run-instances --count ' + serversToAdd + ' --image-id ami-xxx...', 'warning');
      
      for (let i = 0; i < serversToAdd; i++) {
        setTimeout(() => {
          const newServerId = `server-${String(servers.length + i + 1).padStart(2, '0')}`;
          const newServer: ServerInstance = {
            id: newServerId,
            name: `Web Server ${String(servers.length + i + 1).padStart(2, '0')}`,
            status: 'starting',
            cpu: 0,
            memory: 0,
            requests_per_minute: 0,
            uptime: '0m'
          };

          setServers(prev => [...prev, newServer]);
          addNotification(`Server ${newServer.name} is starting up`, 'success');

          // Simulate server becoming ready
          setTimeout(() => {
            setServers(prev => prev.map(server => 
              server.id === newServerId 
                ? { ...server, status: 'running', cpu: Math.random() * 40 + 20, memory: Math.random() * 30 + 30, requests_per_minute: Math.floor(Math.random() * 500 + 400) }
                : server
            ));
            addNotification(`Server ${newServer.name} is now online and ready`, 'success');
            
            if (i === serversToAdd - 1) {
              setScaling(false);
              addNotification(`Successfully scaled to ${targetCount} servers`, 'success');
            }
          }, 3000 + (i * 1000));
        }, i * 2000);
      }
    } else {
      // Scale down
      const serversToRemove = currentCount - targetCount;
      addNotification(`Scaling down: Removing ${serversToRemove} server(s)...`, 'warning');
      
      const runningServers = servers.filter(s => s.status === 'running');
      const serversToStop = runningServers.slice(-serversToRemove);
      
      serversToStop.forEach((server, i) => {
        setTimeout(() => {
          addNotification(`Gracefully shutting down ${server.name}`, 'warning');
          
          setServers(prev => prev.map(s => 
            s.id === server.id ? { ...s, status: 'stopping' } : s
          ));

          setTimeout(() => {
            setServers(prev => prev.filter(s => s.id !== server.id));
            addNotification(`Server ${server.name} has been terminated`, 'success');
            
            if (i === serversToRemove - 1) {
              setScaling(false);
              addNotification(`Successfully scaled down to ${targetCount} servers`, 'success');
            }
          }, 3000);
        }, i * 2000);
      });
    }
  };

  const toggleAutoScaling = () => {
    if (!permissions.canControlTraffic) {
      addNotification('Access denied: Cannot modify traffic control settings', 'error');
      return;
    }

    setAutoScaling(!autoScaling);
    addNotification(
      `Auto-scaling ${!autoScaling ? 'enabled' : 'disabled'}`, 
      !autoScaling ? 'success' : 'warning'
    );
  };

  const toggleLoadBalancing = () => {
    if (!permissions.canControlTraffic) {
      addNotification('Access denied: Cannot modify load balancing', 'error');
      return;
    }

    setLoadBalancing(!loadBalancing);
    addNotification(
      `Load balancing ${!loadBalancing ? 'enabled' : 'disabled'}`, 
      !loadBalancing ? 'success' : 'warning'
    );
  };

  const updateRateLimit = (value: number[]) => {
    if (!permissions.canControlTraffic) {
      addNotification('Access denied: Cannot modify rate limiting', 'error');
      return;
    }

    setRateLimit(value);
    addNotification(`Rate limit updated to ${value[0]} requests/minute per IP`, 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'starting': return 'secondary';
      case 'stopping': return 'secondary';
      case 'stopped': return 'destructive';
      default: return 'outline';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!permissions.canControlTraffic && !permissions.canScaleInfrastructure) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Access denied. You don't have permission to control traffic or infrastructure.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Alert key={notification.id} className="flex items-center gap-2">
              {getNotificationIcon(notification.type)}
              <AlertDescription className="flex-1">
                {notification.message}
              </AlertDescription>
              <span className="text-xs text-muted-foreground">
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </Alert>
          ))}
        </div>
      )}

      {/* Server Instances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Server Instances
            </CardTitle>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <div className="text-sm text-muted-foreground min-w-fit">
                  Current: {servers.filter(s => s.status === 'running' || s.status === 'starting').length} servers
                </div>
                <Input
                  type="number"
                  placeholder="Target"
                  value={targetServerCount}
                  onChange={(e) => setTargetServerCount(e.target.value)}
                  min="1"
                  max="20"
                  className="w-20"
                  disabled={scaling || !permissions.canScaleInfrastructure}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleScaleServers}
                  disabled={scaling || !permissions.canScaleInfrastructure || !targetServerCount}
                >
                  <Server className="w-4 h-4 mr-1" />
                  {scaling ? 'Scaling...' : 'Send'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter desired server count (1-20) and click Send
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => (
              <Card key={server.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{server.name}</h4>
                    <Badge variant={getStatusColor(server.status)}>
                      {server.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CPU:</span>
                      <span className={server.cpu > 80 ? 'text-red-500' : server.cpu > 60 ? 'text-yellow-500' : 'text-green-500'}>
                        {server.cpu.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span className={server.memory > 85 ? 'text-red-500' : server.memory > 70 ? 'text-yellow-500' : 'text-green-500'}>
                        {server.memory.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Requests/min:</span>
                      <span>{server.requests_per_minute.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{server.uptime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Control Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Auto Scaling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Scaling Status</p>
                <p className="text-sm text-muted-foreground">
                  Automatically scale servers based on traffic
                </p>
              </div>
              <Button 
                variant={autoScaling ? "default" : "outline"}
                onClick={toggleAutoScaling}
                disabled={!permissions.canControlTraffic}
              >
                {autoScaling ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            
            {autoScaling && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Thresholds:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Scale up when CPU &gt; 70% for 5 minutes</li>
                  <li>• Scale down when CPU &lt; 30% for 10 minutes</li>
                  <li>• Maximum instances: 10</li>
                  <li>• Minimum instances: 1</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Load Balancing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Load Balancer Status</p>
                <p className="text-sm text-muted-foreground">
                  Distribute traffic across servers
                </p>
              </div>
              <Button 
                variant={loadBalancing ? "default" : "outline"}
                onClick={toggleLoadBalancing}
                disabled={!permissions.canControlTraffic}
              >
                {loadBalancing ? 'Active' : 'Inactive'}
              </Button>
            </div>
            
            {loadBalancing && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Configuration:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Algorithm: Round Robin</li>
                  <li>• Health checks: Every 30 seconds</li>
                  <li>• Sticky sessions: Disabled</li>
                  <li>• SSL termination: Enabled</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Rate Limiting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Rate Limiting</p>
              <p className="text-sm text-muted-foreground">
                Control request rate per IP address
              </p>
            </div>
            <Button 
              variant={rateLimiting ? "default" : "outline"}
              onClick={() => setRateLimiting(!rateLimiting)}
              disabled={!permissions.canControlTraffic}
            >
              {rateLimiting ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          {rateLimiting && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Requests per minute per IP: {rateLimit[0]}
                </p>
                <Slider
                  value={rateLimit}
                  onValueChange={updateRateLimit}
                  max={1000}
                  min={10}
                  step={10}
                  className="w-full"
                  disabled={!permissions.canControlTraffic}
                />
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Current Status:</p>
                <ul className="text-xs space-y-1 text-muted-foreground mt-1">
                  <li>• Blocked IPs today: 12</li>
                  <li>• Rate limited requests: 1,847</li>
                  <li>• Average requests/min: 8,450</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}