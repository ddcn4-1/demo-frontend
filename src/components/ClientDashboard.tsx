import React, { useState } from 'react';
import { PerformanceList } from './PerformanceList';
import { PerformanceDetail } from './PerformanceDetail';
import { BookingHistory } from './BookingHistory';
import { SeatSelection } from './SeatSelection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';

interface User {
  user_id: number;
  email: string;
  username: string;
  name: string;
  role: string;
}

interface ClientDashboardProps {
  user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
  const [selectedPerformance, setSelectedPerformance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('performances');
  const [viewState, setViewState] = useState<'list' | 'detail' | 'booking'>('list');

  const handlePerformanceSelect = (performance: any) => {
    setSelectedPerformance(performance);
    setViewState('booking');
  };

  const handleViewDetails = (performance: any) => {
    setSelectedPerformance(performance);
    setViewState('detail');
  };

  const handleBookNow = (performance: any) => {
    setSelectedPerformance(performance);
    setViewState('booking');
  };

  const handleBackToList = () => {
    setSelectedPerformance(null);
    setViewState('list');
    setActiveTab('performances');
  };

  const handleBookingComplete = () => {
    setSelectedPerformance(null);
    setViewState('list');
    setActiveTab('history');
  };

  // Handle performance detail view
  if (selectedPerformance && viewState === 'detail') {
    return (
      <PerformanceDetail
        performance={selectedPerformance}
        onBack={handleBackToList}
        onBookNow={handleBookNow}
      />
    );
  }

  // Handle seat selection/booking view
  if (selectedPerformance && viewState === 'booking') {
    return (
      <SeatSelection 
        performance={selectedPerformance}
        user={user}
        onBack={handleBackToList}
        onComplete={handleBookingComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="performances">Browse Performances</TabsTrigger>
              <TabsTrigger value="history">My Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performances" className="space-y-4">
              <PerformanceList 
                onSelectPerformance={handlePerformanceSelect}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <BookingHistory userId={user.user_id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}