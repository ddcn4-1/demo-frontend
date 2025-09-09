# Data Layer Documentation

This directory contains the data management layer for the Ticket Booking System, including mock server implementation and type definitions.

## Files Overview

### `mockServer.ts`
Complete HTTP-like mock server with:
- JWT-style authentication system
- RESTful API endpoints
- Realistic request/response patterns
- State management and persistence
- Search functionality for performances

### `mockData.ts`
Comprehensive mock data including:
- User accounts (USER, ADMIN, DevOps, Dev roles)
- Performance catalog with multiple venues
- Booking scenarios and seat layouts
- System metrics for monitoring

## Quick Start

```typescript
import { serverAPI } from './mockServer';

// Authentication
const user = await serverAPI.login('admin@ticket.com', 'password123');

// Data fetching
const performances = await serverAPI.getPerformances();
const bookings = await serverAPI.getBookingsByUserId(userId);

// Search with filters
const results = await serverAPI.searchPerformances({
  name: 'Romeo',
  venue: 'Opera House',
  status: 'available'
});
```

## API Endpoints

### Public (No Auth)
- `GET /performances` - List all performances
- `GET /performances/search` - Search with filters
- `GET /performances/:id` - Performance details
- `GET /venues` - List venues

### Protected (Auth Required)
- `GET /bookings` - User bookings
- `POST /bookings` - Create booking
- `GET /users` - List users (Admin)
- `GET /system/metrics` - System metrics

## Backend Migration

When ready to connect to your Spring Boot backend:

1. **Replace imports**: `import { serverAPI } from './apiService'`
2. **Set environment**: `REACT_APP_API_BASE_URL=https://your-api.com`
3. **Configure CORS** on your backend
4. **Implement JWT authentication**

See `/Guidelines.md` for complete migration instructions.

## Features

- ✅ **Realistic delays** and error simulation
- ✅ **JWT-like authentication** with session management
- ✅ **Search functionality** with multiple criteria
- ✅ **Role-based access control**
- ✅ **State persistence** during development
- ✅ **Request/response logging** for debugging