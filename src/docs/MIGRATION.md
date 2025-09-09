# Backend Migration Guide

This guide explains how to transition from the mock server to your real Spring Boot backend.

## Overview

The application is designed to easily transition from the mock server (`/data/mockServer.ts`) to your real Spring Boot backend. The frontend uses a service layer pattern that abstracts API calls, making the swap straightforward.

## Step 1: Create Real API Service

Create `/data/apiService.ts` to replace the mock server:

```typescript
// /data/apiService.ts
import { User, Performance, Booking, Seat, Venue, SystemMetrics } from './mockData';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    PERFORMANCES: '/api/performances',
    BOOKINGS: '/api/bookings',
    VENUES: '/api/venues',
    SYSTEM: '/api/system'
  }
};

// HTTP Client with error handling
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${url}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);

// API Service - matches mockServer interface exactly
export const serverAPI = {
  // Authentication
  async login(identifier: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.post<{
        user: User;
        token: string;
        expiresIn: string;
      }>(`${API_CONFIG.ENDPOINTS.AUTH}/login`, {
        identifier,
        password
      });

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/logout`);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  },

  // Public endpoints (no auth required)
  async getPerformances(): Promise<Performance[]> {
    try {
      return await apiClient.get<Performance[]>(API_CONFIG.ENDPOINTS.PERFORMANCES);
    } catch (error) {
      console.error('Failed to fetch performances:', error);
      return [];
    }
  },

  async searchPerformances(searchParams: {
    name?: string;
    venue?: string;
    status?: string;
  }): Promise<Performance[]> {
    try {
      const queryString = new URLSearchParams(
        Object.entries(searchParams).filter(([_, value]) => value && value.trim() !== '')
      ).toString();
      
      const endpoint = queryString 
        ? `${API_CONFIG.ENDPOINTS.PERFORMANCES}/search?${queryString}`
        : API_CONFIG.ENDPOINTS.PERFORMANCES;
        
      return await apiClient.get<Performance[]>(endpoint);
    } catch (error) {
      console.error('Failed to search performances:', error);
      return [];
    }
  },

  // Add all other methods following the same pattern...
  // (Copying from the existing mockServer interface)
};

// Export types for components
export type { User, Performance, Booking, Seat, Venue, SystemMetrics };
```

## Step 2: Environment Configuration

Create environment files for different deployment stages:

```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_MOCK=false

# .env.staging
REACT_APP_API_BASE_URL=https://staging-api.yourticketservice.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_ENABLE_MOCK=false

# .env.production
REACT_APP_API_BASE_URL=https://api.yourticketservice.com
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_MOCK=false
```

## Step 3: Update Component Imports

Replace all imports in your components:

```typescript
// OLD - Mock Server
import { serverAPI, User, Performance } from '../data/mockServer';

// NEW - Real API
import { serverAPI, User, Performance } from '../data/apiService';
```

## Step 4: Backend API Requirements

Your Spring Boot backend should implement these endpoints:

### Public Endpoints (No Auth Required)
```http
GET    /api/performances              # List all performances
GET    /api/performances/search       # Search performances with query params
GET    /api/performances/{id}         # Get performance details
GET    /api/venues                    # List all venues
GET    /api/venues/{id}/seats         # Get venue seating layout
```

### Authentication Endpoints
```http
POST   /api/auth/login               # Login with identifier/password
POST   /api/auth/logout              # Logout user
POST   /api/auth/refresh             # Refresh JWT token
GET    /api/auth/me                  # Get current user info
```

### Protected Endpoints (Auth Required)
```http
GET    /api/users                    # List users (ADMIN only)
GET    /api/users/{id}               # Get user details
PUT    /api/users/{id}               # Update user

GET    /api/bookings                 # List all bookings (ADMIN)
GET    /api/bookings/user/{userId}   # Get user's bookings
POST   /api/bookings                 # Create new booking
PUT    /api/bookings/{id}/cancel     # Cancel booking

GET    /api/system/metrics           # System metrics (ADMIN)
GET    /api/system/health            # Health check
```

## Step 5: Testing Strategy

### Phase 1: Side-by-Side Testing
Keep both mock server and real API service during initial testing:

```typescript
// /data/hybridApi.ts - For testing phase only
const USE_MOCK = process.env.REACT_APP_ENABLE_MOCK === 'true';

export const serverAPI = USE_MOCK 
  ? require('./mockServer').serverAPI 
  : require('./apiService').serverAPI;
```

### Phase 2: Gradual Migration
Test endpoints one by one:

1. Start with public endpoints (performances, venues)
2. Move to authentication
3. Add protected endpoints (bookings, user management)
4. Finally, admin endpoints (system metrics, user management)

## Step 6: Production Deployment

### Backend Requirements
- CORS configured for your frontend domain
- HTTPS enabled
- JWT tokens with proper expiration
- Rate limiting implemented
- Input validation on all endpoints
- Proper PostgreSQL connection pooling

### Frontend Build Configuration
```json
{
  "scripts": {
    "build:dev": "REACT_APP_API_BASE_URL=http://localhost:8080 npm run build",
    "build:staging": "REACT_APP_API_BASE_URL=https://staging-api.yoursite.com npm run build",
    "build:prod": "REACT_APP_API_BASE_URL=https://api.yoursite.com npm run build"
  }
}
```

## Migration Checklist

- [ ] Create `/data/apiService.ts` with all serverAPI methods
- [ ] Set up environment variables for different stages  
- [ ] Update all component imports from mockServer to apiService
- [ ] Configure CORS on Spring Boot backend
- [ ] Implement JWT authentication on backend
- [ ] Test all public endpoints (performances, venues)
- [ ] Test authentication flow (login/logout)
- [ ] Test protected endpoints (bookings, user data)
- [ ] Test admin endpoints (user management, metrics)
- [ ] Set up error handling and loading states
- [ ] Configure production environment variables
- [ ] Deploy and test in staging environment
- [ ] Monitor API performance and error rates

## Rollback Plan

If issues occur, quickly switch back to mock server:

```typescript
// Emergency rollback in /data/apiService.ts
export * from './mockServer';
```

This preserves all functionality while you debug backend issues.