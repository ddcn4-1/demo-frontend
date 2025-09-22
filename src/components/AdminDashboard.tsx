import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SystemOverview } from './admin/SystemOverview';
import { PerformanceManagement } from './admin/PerformanceManagement';
import { UserManagement } from './admin/UserManagement';
import { BookingManagement } from './admin/BookingManagement';
import { TrafficControl } from './admin/TrafficControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User } from './type';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          canManageUsers: true,
          canManagePerformances: true,
          canViewBookings: true,
          canControlTraffic: false,
          canViewMetrics: false,
          canScaleInfrastructure: false
        };
      case 'DEVOPS':
        return {
          canManageUsers: true,
          canManagePerformances: false,
          canViewBookings: false,
          canControlTraffic: true,
          canViewMetrics: true,
          canScaleInfrastructure: true
        };
      case 'DEV':
        return {
          canManageUsers: false,
          canManagePerformances: false,
          canViewBookings: false,
          canControlTraffic: false,
          canViewMetrics: true,
          canScaleInfrastructure: false
        };
      default:
        return {
          canManageUsers: false,
          canManagePerformances: false,
          canViewBookings: false,
          canControlTraffic: false,
          canViewMetrics: false,
          canScaleInfrastructure: false
        };
    }
  };

  const permissions = getRolePermissions(user.role);

  const getTabList = () => {
    const tabs = [
      { value: 'overview', label: 'Dashboard', condition: permissions.canViewMetrics },
      { value: 'performances', label: 'Performances', condition: permissions.canManagePerformances },
      { value: 'bookings', label: 'Bookings', condition: permissions.canViewBookings },
      { value: 'users', label: 'Users', condition: permissions.canManageUsers },
      { value: 'traffic', label: 'Traffic Control', condition: permissions.canControlTraffic }
    ];

    return tabs.filter(tab => tab.condition);
  };

  const availableTabs = getTabList();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(availableTabs.length > 0 ? availableTabs[0].value : 'overview');

  // Read tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && availableTabs.some(t => t.value === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, availableTabs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // Debug logging
  console.log(`User role: ${user.role}`, 'Permissions:', permissions, 'Available tabs:', availableTabs);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Portal</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {availableTabs.length} tab{availableTabs.length !== 1 ? 's' : ''} available for {user.role}
              </p>
            </div>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
              {availableTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {permissions.canViewMetrics && (
              <TabsContent value="overview" className="space-y-4">
                <SystemOverview permissions={permissions} />
              </TabsContent>
            )}

            {permissions.canManagePerformances && (
              <TabsContent value="performances" className="space-y-4">
                <PerformanceManagement />
              </TabsContent>
            )}

            {permissions.canViewBookings && (
              <TabsContent value="bookings" className="space-y-4">
                <BookingManagement permissions={permissions} />
              </TabsContent>
            )}

            {permissions.canManageUsers && (
              <TabsContent value="users" className="space-y-4">
                <UserManagement />
              </TabsContent>
            )}

            {permissions.canControlTraffic && (
              <TabsContent value="traffic" className="space-y-4">
                <TrafficControl permissions={permissions} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
