# Mock Data System

This directory contains the mock data system for the Ticket Booking System. It's designed to be easily replaced with real API calls when integrating with a backend.

## Files Overview

### `mockData.ts`
Contains all mock data and interfaces used throughout the application:
- **User data**: Admin, DevOps, Dev, and regular users
- **Performance data**: Shows, concerts, ballets, and musicals
- **Booking data**: Various booking scenarios including confirmed, pending, and cancelled bookings
- **Seat data**: Seat layouts with different grades and prices
- **System metrics**: Real-time system monitoring data
- **Venue data**: Theater and venue information

### `api.ts`
Contains API configuration and utilities for future backend integration:
- API endpoint configurations
- HTTP client wrapper (ready for real implementation)
- Error handling utilities
- Authentication token management

## Mock Data Structure

### Users
```typescript
interface User {
  user_id: number;
  email: string;
  username: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'DevOps' | 'Dev';
  created_at: string;
  last_login?: string;
}
```

### Performances
```typescript
interface Performance {
  performance_id: number;
  title: string;
  description: string;
  venue_id: number;
  venue_name: string;
  show_datetime: string;
  duration_minutes: number;
  total_seats: number;
  available_seats: number;
  base_price: number;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  category: string;
}
```

### Bookings
```typescript
interface Booking {
  booking_id: number;
  booking_number: string;
  user_id: number;
  performance_id: number;
  performance_title: string;
  venue_name: string;
  show_datetime: string;
  seat_count: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  // ... additional fields for cancellation and refund tracking
}
```

## Using Mock Data

All components import mock data through the `mockAPI` object:

```typescript
import { mockAPI } from '../data/mockData';

// Example usage
const bookings = await mockAPI.getBookingsByUserId(userId);
const performances = await mockAPI.getPerformances();
```

## Migration to Real API

### Step 1: Backend Integration
Replace the mock API calls with real HTTP requests:

```typescript
// Replace mockAPI.login() with:
const user = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier, password })
});
```

### Step 2: Use API Client
Implement the `ApiClient` class in `api.ts`:

```typescript
import { apiClient, API_ENDPOINTS } from '../data/api';

const performances = await apiClient.get(API_ENDPOINTS.PERFORMANCES.LIST);
```

### Step 3: Environment Configuration
Set up environment variables:

```env
REACT_APP_API_BASE_URL=https://your-api-server.com/api
```

### Step 4: Replace Mock Functions
Update each component to use real API calls instead of mock functions:

1. **Authentication**: `LoginForm.tsx`
2. **Bookings**: `BookingHistory.tsx`, `BookingManagement.tsx`
3. **Performances**: `PerformanceList.tsx`, `PerformanceManagement.tsx`
4. **Seats**: `SeatSelection.tsx`
5. **Users**: `UserManagement.tsx`
6. **System**: `SystemOverview.tsx`, `TrafficControl.tsx`

## Features Included in Mock Data

### Authentication
- Multiple user roles (USER, ADMIN, DevOps, Dev)
- Persistent login state via localStorage
- Role-based access control

### Booking Management
- Complete booking lifecycle (PENDING → CONFIRMED → CANCELLED)
- Cancellation reasons and refund tracking
- Time-based cancellation policies
- Seat reservation with timeout

### Performance Management
- Multiple venue support
- Different performance categories
- Real-time seat availability
- Show scheduling

### System Monitoring
- Real-time metrics simulation
- Performance tracking
- Error handling and alerts

## Data Consistency

The mock data maintains referential integrity:
- Users reference valid user IDs in bookings
- Performances reference valid venue IDs
- Bookings reference valid performance and user IDs
- Seats reference valid venue IDs

## Testing Scenarios

The mock data includes various scenarios for testing:

1. **Successful Bookings**: Confirmed bookings with completed payments
2. **Pending Bookings**: Bookings awaiting payment with timeout
3. **Cancelled Bookings**: Bookings with cancellation reasons and refunds
4. **Past Events**: Events that cannot be cancelled
5. **Sold Out Shows**: Performances with no available seats
6. **Different User Roles**: Various permission levels for admin features

## Performance Considerations

- All mock API calls include realistic delays (500ms - 2000ms)
- Loading states are properly handled
- Error scenarios can be simulated by modifying the mock functions

## Next Steps for Backend Integration

1. **Set up Spring Boot backend** with the provided database schema
2. **Implement REST endpoints** matching the structure in `api.ts`
3. **Add authentication** with JWT tokens
4. **Replace mock functions** one by one with real API calls
5. **Test thoroughly** with real data and edge cases
6. **Deploy** and configure production environment variables

This mock data system provides a complete foundation that closely mimics real backend behavior, making the transition to a live API seamless and predictable.