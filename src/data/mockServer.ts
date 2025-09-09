// Mock Server - Simulates real backend behavior
// This provides HTTP-like request/response patterns for easy backend migration

import { 
  User, 
  Performance, 
  Booking, 
  Seat, 
  Venue, 
  SystemMetrics,
  mockUsers,
  mockPerformances,
  mockBookings,
  mockSeats,
  mockVenues,
  mockSystemMetrics
} from './mockData';

// Re-export types and mockUsers for use in components
export type { User, Performance, Booking, Seat, Venue, SystemMetrics };
export { mockUsers };

// Types for API requests and responses
export interface ApiRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Mock Server State - simulates database
class MockServerState {
  private users: User[] = [...mockUsers];
  private performances: Performance[] = [...mockPerformances];
  private bookings: Booking[] = [...mockBookings];
  private seats: Seat[] = [...mockSeats];
  private venues: Venue[] = [...mockVenues];
  private currentUser: User | null = null;
  private sessionToken: string | null = null;

  // User management
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.user_id === id);
  }

  createUser(userData: Omit<User, 'user_id' | 'created_at'>): User {
    const newUser: User = {
      ...userData,
      user_id: Math.max(...this.users.map(u => u.user_id)) + 1,
      created_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: number, userData: Partial<User>): User | null {
    const userIndex = this.users.findIndex(user => user.user_id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  deleteUser(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.user_id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  // Authentication
  authenticate(identifier: string, password: string): { user: User; token: string } | null {
    const user = this.users.find(u => 
      (u.email.toLowerCase() === identifier.toLowerCase() || 
       u.username.toLowerCase() === identifier.toLowerCase()) && 
      password === 'password123'
    );
    
    if (user) {
      this.currentUser = user;
      this.sessionToken = `mock_token_${user.user_id}_${Date.now()}`;
      // Update last login
      this.updateUser(user.user_id, { last_login: new Date().toISOString() });
      return { user: { ...user, last_login: new Date().toISOString() }, token: this.sessionToken };
    }
    
    return null;
  }

  logout(): void {
    this.currentUser = null;
    this.sessionToken = null;
  }

  validateToken(token: string): User | null {
    if (token === this.sessionToken && this.currentUser) {
      return this.currentUser;
    }
    return null;
  }

  // Performance management
  getPerformances(): Performance[] {
    return this.performances;
  }

  getPerformanceById(id: number): Performance | undefined {
    return this.performances.find(perf => perf.performance_id === id);
  }

  createPerformance(perfData: Omit<Performance, 'performance_id' | 'created_at'>): Performance {
    const newPerformance: Performance = {
      ...perfData,
      performance_id: Math.max(...this.performances.map(p => p.performance_id)) + 1,
      created_at: new Date().toISOString()
    };
    this.performances.push(newPerformance);
    return newPerformance;
  }

  updatePerformance(id: number, perfData: Partial<Performance>): Performance | null {
    const perfIndex = this.performances.findIndex(perf => perf.performance_id === id);
    if (perfIndex === -1) return null;
    
    this.performances[perfIndex] = { ...this.performances[perfIndex], ...perfData };
    return this.performances[perfIndex];
  }

  // Booking management
  getBookings(): Booking[] {
    return this.bookings;
  }

  getBookingsByUserId(userId: number): Booking[] {
    return this.bookings.filter(booking => booking.user_id === userId);
  }

  getBookingById(id: number): Booking | undefined {
    return this.bookings.find(booking => booking.booking_id === id);
  }

  createBooking(bookingData: Omit<Booking, 'booking_id' | 'booking_number' | 'booked_at'>): Booking {
    const bookingNumber = `BKG-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newBooking: Booking = {
      ...bookingData,
      booking_id: Math.max(...this.bookings.map(b => b.booking_id)) + 1,
      booking_number: bookingNumber,
      booked_at: new Date().toISOString()
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  cancelBooking(id: number, reason: string): Booking | null {
    const booking = this.getBookingById(id);
    if (!booking) return null;

    const updatedBooking: Booking = {
      ...booking,
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      refund_status: 'PENDING',
      refund_amount: booking.total_amount
    };

    const bookingIndex = this.bookings.findIndex(b => b.booking_id === id);
    this.bookings[bookingIndex] = updatedBooking;
    
    return updatedBooking;
  }

  // Seat management
  getSeatsByVenueId(venueId: number): Seat[] {
    return this.seats.filter(seat => seat.venue_id === venueId);
  }

  updateSeatAvailability(seatId: number, isAvailable: boolean): boolean {
    const seatIndex = this.seats.findIndex(seat => seat.seat_id === seatId);
    if (seatIndex === -1) return false;
    
    this.seats[seatIndex].is_available = isAvailable;
    return true;
  }

  // Venue management
  getVenues(): Venue[] {
    return this.venues;
  }

  // System metrics
  getSystemMetrics(): SystemMetrics {
    // Update with current data
    return {
      ...mockSystemMetrics,
      totalUsers: this.users.length,
      totalBookings: this.bookings.length,
      activePerformances: this.performances.filter(p => p.status === 'SCHEDULED').length,
      totalRevenue: this.bookings
        .filter(b => b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + b.total_amount, 0)
    };
  }
}

// Mock Server Class
export class MockServer {
  private state = new MockServerState();
  private requestDelay = { min: 300, max: 1500 }; // Realistic delays
  private errorRate = 0.02; // 2% chance of random errors

  // Simulate network delay
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * (this.requestDelay.max - this.requestDelay.min) + this.requestDelay.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Simulate random errors
  private shouldSimulateError(): boolean {
    return Math.random() < this.errorRate;
  }

  // Generic request handler
  async request<T = any>(apiRequest: ApiRequest): Promise<ApiResponse<T>> {
    console.log(`[MockServer] ${apiRequest.method} ${apiRequest.endpoint}`, apiRequest.data);
    
    await this.simulateDelay();

    // Simulate random server errors
    if (this.shouldSimulateError()) {
      return {
        status: 500,
        error: 'Internal Server Error',
        message: 'Simulated server error',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await this.handleRequest(apiRequest);
      console.log(`[MockServer] Response:`, response);
      return response;
    } catch (error) {
      return {
        status: 500,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Route requests to appropriate handlers
  private async handleRequest<T>(apiRequest: ApiRequest): Promise<ApiResponse<T>> {
    const { method, endpoint, data, params } = apiRequest;
    const pathParts = endpoint.split('/').filter(Boolean);

    // Authentication endpoints
    if (pathParts[0] === 'auth') {
      return this.handleAuthRequest(method, pathParts, data);
    }

    // Check authentication for protected endpoints
    const authHeader = apiRequest.headers?.Authorization;
    if (!authHeader || !this.state.validateToken(authHeader.replace('Bearer ', ''))) {
      return {
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token',
        timestamp: new Date().toISOString()
      };
    }

    // Route to specific handlers
    switch (pathParts[0]) {
      case 'users':
        return this.handleUserRequest(method, pathParts, data, params);
      case 'performances':
        return this.handlePerformanceRequest(method, pathParts, data, params);
      case 'bookings':
        return this.handleBookingRequest(method, pathParts, data, params);
      case 'venues':
        return this.handleVenueRequest(method, pathParts, data, params);
      case 'system':
        return this.handleSystemRequest(method, pathParts, data, params);
      default:
        return {
          status: 404,
          error: 'Not Found',
          message: `Endpoint ${endpoint} not found`,
          timestamp: new Date().toISOString()
        };
    }
  }

  // Authentication request handler
  private async handleAuthRequest(method: string, pathParts: string[], data: any): Promise<ApiResponse> {
    if (method === 'POST' && pathParts[1] === 'login') {
      const { identifier, password } = data;
      const authResult = this.state.authenticate(identifier, password);
      
      if (authResult) {
        return {
          status: 200,
          data: {
            user: authResult.user,
            token: authResult.token,
            expiresIn: '24h'
          },
          message: 'Login successful',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 401,
          error: 'Unauthorized',
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        };
      }
    }

    if (method === 'POST' && pathParts[1] === 'logout') {
      this.state.logout();
      return {
        status: 200,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 404,
      error: 'Not Found',
      timestamp: new Date().toISOString()
    };
  }

  // User request handlers
  private async handleUserRequest(method: string, pathParts: string[], data: any, params: any): Promise<ApiResponse> {
    if (method === 'GET' && pathParts.length === 1) {
      const users = this.state.getUsers();
      return {
        status: 200,
        data: users,
        timestamp: new Date().toISOString()
      };
    }

    if (method === 'GET' && pathParts.length === 2) {
      const userId = parseInt(pathParts[1]);
      const user = this.state.getUserById(userId);
      
      if (user) {
        return {
          status: 200,
          data: user,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 404,
          error: 'Not Found',
          message: 'User not found',
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      status: 404,
      error: 'Not Found',
      timestamp: new Date().toISOString()
    };
  }

  // Performance request handlers
  private async handlePerformanceRequest(method: string, pathParts: string[], data: any, params: any): Promise<ApiResponse> {
    if (method === 'GET' && pathParts.length === 1) {
      const performances = this.state.getPerformances();
      return {
        status: 200,
        data: performances,
        timestamp: new Date().toISOString()
      };
    }

    if (method === 'GET' && pathParts.length === 2) {
      const performanceId = parseInt(pathParts[1]);
      const performance = this.state.getPerformanceById(performanceId);
      
      if (performance) {
        return {
          status: 200,
          data: performance,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 404,
          error: 'Not Found',
          message: 'Performance not found',
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      status: 404,
      error: 'Not Found',
      timestamp: new Date().toISOString()
    };
  }

  // Booking request handlers
  private async handleBookingRequest(method: string, pathParts: string[], data: any, params: any): Promise<ApiResponse> {
    if (method === 'GET' && pathParts.length === 1) {
      const bookings = this.state.getBookings();
      return {
        status: 200,
        data: bookings,
        timestamp: new Date().toISOString()
      };
    }

    if (method === 'GET' && pathParts.length === 3 && pathParts[1] === 'user') {
      const userId = parseInt(pathParts[2]);
      const bookings = this.state.getBookingsByUserId(userId);
      return {
        status: 200,
        data: bookings,
        timestamp: new Date().toISOString()
      };
    }

    if (method === 'POST' && pathParts.length === 3 && pathParts[2] === 'cancel') {
      const bookingId = parseInt(pathParts[1]);
      const { reason } = data;
      const updatedBooking = this.state.cancelBooking(bookingId, reason);
      
      if (updatedBooking) {
        return {
          status: 200,
          data: updatedBooking,
          message: 'Booking cancelled successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 404,
          error: 'Not Found',
          message: 'Booking not found',
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      status: 404,
      error: 'Not Found',
      timestamp: new Date().toISOString()
    };
  }

  // Venue request handlers
  private async handleVenueRequest(method: string, pathParts: string[], data: any, params: any): Promise<ApiResponse> {
    if (method === 'GET' && pathParts.length === 1) {
      const venues = this.state.getVenues();
      return {
        status: 200,
        data: venues,
        timestamp: new Date().toISOString()
      };
    }

    if (method === 'GET' && pathParts.length === 3 && pathParts[2] === 'seats') {
      const venueId = parseInt(pathParts[1]);
      const seats = this.state.getSeatsByVenueId(venueId);
      return {
        status: 200,
        data: seats,
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 404,
      error: 'Not Found',
      timestamp: new Date().toISOString()
    };
  }

  // System request handlers
  private async handleSystemRequest(method: string, pathParts: string[], data: any, params: any): Promise<ApiResponse> {
    if (method === 'GET' && pathParts[1] === 'metrics') {
      const metrics = this.state.getSystemMetrics();
      return {
        status: 200,
        data: metrics,
        timestamp: new Date().toISOString()
      };
    }

    if (method === 'GET' && pathParts[1] === 'health') {
      return {
        status: 200,
        data: {
          status: 'healthy',
          uptime: '15 days, 6 hours, 23 minutes',
          version: '1.0.0'
        },
        timestamp: new Date().toISOString()
      };
    }

    return {
      status: 404,
      error: 'Not Found',
      timestamp: new Date().toISOString()
    };
  }

  // Configuration methods
  setErrorRate(rate: number): void {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }

  setRequestDelay(min: number, max: number): void {
    this.requestDelay = { min, max };
  }
}

// Export singleton instance
export const mockServer = new MockServer();

// Convenience methods that match the existing mockAPI interface
export const serverAPI = {
  async login(identifier: string, password: string): Promise<User | null> {
    const response = await mockServer.request({
      method: 'POST',
      endpoint: '/auth/login',
      data: { identifier, password }
    });

    if (response.status === 200 && response.data) {
      // Store token for subsequent requests
      localStorage.setItem('mockAuthToken', response.data.token);
      return response.data.user;
    }
    return null;
  },

  async getUsers(): Promise<User[]> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: '/users',
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data || [] : [];
  },

  async getPerformances(): Promise<Performance[]> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: '/performances',
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data || [] : [];
  },

  async getPerformanceById(id: number): Promise<Performance | null> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: `/performances/${id}`,
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data : null;
  },

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: `/bookings/user/${userId}`,
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data || [] : [];
  },

  async getAllBookings(): Promise<Booking[]> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: '/bookings',
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data || [] : [];
  },

  async cancelBooking(bookingId: number, reason: string): Promise<boolean> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'POST',
      endpoint: `/bookings/${bookingId}/cancel`,
      data: { reason },
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200;
  },

  async getSeatsByVenueId(venueId: number): Promise<Seat[]> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: `/venues/${venueId}/seats`,
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data || [] : [];
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: '/system/metrics',
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data : mockSystemMetrics;
  },

  async getVenues(): Promise<Venue[]> {
    const token = localStorage.getItem('mockAuthToken');
    const response = await mockServer.request({
      method: 'GET',
      endpoint: '/venues',
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.status === 200 ? response.data || [] : [];
  }
};