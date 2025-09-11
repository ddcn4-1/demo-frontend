import { apiClient } from "./api-client";

// ===== DTOs (Data Transfer Objects) based on OpenAPI 3.1.0 spec =====

// Common Response Types
export interface ApiResponse<T> {
  message?: string;
  data: T;
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit?: number;
  totalPages?: number;
}

// Authentication DTOs
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userType: string;
}

export interface EnhancedAuthResponse {
  accessToken: string;
  userType: string;
  user: UserInfo;
  message: string;
  expiresIn: number;
}

export interface UserInfo {
  userId: number;
  username: string;
  email: string;
  name: string;
  role: string;
  lastLogin?: string;
}

export interface LogoutResponse {
  username: string;
  tokenTimeLeft: string;
}

export interface ApiResponseLogoutResponse {
  message: string;
  data: LogoutResponse;
  success: boolean;
  error?: string;
  timestamp: string;
}

// User DTOs
export interface UserDto {
  userId: number;
  username: string;
  email: string;
  name: string;
  passwordHash?: string;
  phone: string;
  role: "USER" | "ADMIN";
}

// Performance DTOs
export interface PerformanceResponse {
  performanceId: number;
  title: string;
  venue: string;
  theme: string;
  posterUrl: string;
  price: number;
  status: "UPCOMING" | "ONGOING" | "ENDED" | "CANCELLED";
  description?: string;
  startDate?: string;
  endDate?: string;
  runningTime?: number;
  venueAddress?: string;
  schedules?: ScheduleResponse[];
}

export interface ScheduleResponse {
  scheduleId: number;
  showDatetime: string;
  availableSeats: number;
  totalSeats: number;
  status: string;
}

export interface PerformanceSchedulesResponse {
  schedules: ScheduleResponse[];
}

// Booking DTOs
export interface BookingDto {
  bookingId: number;
  bookingNumber: string;
  userId: number;
  scheduleId: number;
  seatCount: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  expiresAt: string;
  bookedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequestDto {
  scheduleId: number;
  seatIds: number[];
  queueToken?: string;
}

export interface BookingSeatDto {
  bookingSeatId: number;
  bookingId: number;
  seatId: number;
  seatPrice: number;
  createdAt: string;
}

export interface CreateBookingResponseDto {
  bookingId: number;
  bookingNumber: string;
  userId: number;
  scheduleId: number;
  seatCount: number;
  totalAmount: number;
  status: string;
  expiresAt: string;
  bookedAt: string;
  seats: BookingSeatDto[];
}

export interface GetBookings200ResponseDto {
  bookings: BookingDto[];
  total: number;
  page: number;
}

export interface GetBookingDetail200ResponseDto extends BookingDto {
  seats: BookingSeatDto[];
}

export interface CancelBookingRequestDto {
  reason?: string;
}

export interface CancelBooking200ResponseDto {
  message: string;
  bookingId: number;
  status: string;
  cancelledAt: string;
  refundAmount: number;
}

// Venue DTOs
export interface VenueDto {
  venueId: number;
  venueName: string;
  address: string;
  description?: string;
  totalCapacity: number;
  contact?: string;
}

// Seat DTOs
export interface SeatDto {
  seatId: number;
  scheduleId: number;
  venueSeatId: number;
  seatRow: string;
  seatNumber: string;
  seatZone?: string;
  seatGrade?: string;
  price: number;
  status: string;
}

export interface SeatAvailabilityResponse {
  scheduleId: number;
  totalSeats: number;
  availableSeats: number;
  seats: SeatDto[];
}

export interface ApiResponseSeatAvailabilityResponse {
  message?: string;
  data: SeatAvailabilityResponse;
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface SeatLockRequest {
  seatIds: number[];
  userId: number;
  sessionId?: string;
}

export interface SeatLockResponse {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface ApiResponseSeatLockResponse {
  message?: string;
  data: SeatLockResponse;
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface SeatReleaseRequest {
  seatIds: number[];
  userId: number;
  sessionId?: string;
}

export interface SeatConfirmRequest {
  seatIds: number[];
  userId: number;
  bookingId: number;
}

export interface ApiResponseBoolean {
  message?: string;
  data: boolean;
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface ApiResponseString {
  message?: string;
  data: string;
  success: boolean;
  error?: string;
  timestamp?: string;
}

// Admin DTOs
export interface AuthLogDto {
  username: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface DashboardDto {
  recentAuthLogs: AuthLogDto[];
}

// Search Parameters
export interface PerformanceSearchParams {
  name?: string;
  venue?: string;
  status?: string;
}

export interface BookingSearchParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "USER" | "ADMIN";
}

// ===== API FUNCTIONS =====

// Authentication APIs
export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  async logout(): Promise<ApiResponseLogoutResponse> {
    return apiClient.post<ApiResponseLogoutResponse>("/auth/logout");
  },

  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/admin/auth/login", credentials);
  },

  async adminLogout(): Promise<Record<string, any>> {
    return apiClient.post<Record<string, any>>("/admin/auth/logout");
  },

  async adminStatus(): Promise<any> {
    return apiClient.get<any>("/admin/auth/status");
  },
};

// User APIs
export const userApi = {
  async getAllUsers(): Promise<UserDto[]> {
    return apiClient.get<UserDto[]>("/v1/admin/users");
  },

  async createUser(userData: UserDto): Promise<UserDto> {
    return apiClient.post<UserDto>("/v1/admin/users", userData);
  },

  async deleteUser(userId: number): Promise<void> {
    return apiClient.delete<void>(`/v1/admin/users/${userId}`);
  },
};

// Performance APIs
export const performanceApi = {
  async getAllPerformances(): Promise<PerformanceResponse> {
    return apiClient.get<PerformanceResponse>("/v1/performances");
  },

  async getPerformanceById(
    performanceId: number
  ): Promise<PerformanceResponse> {
    return apiClient.get<PerformanceResponse>(
      `/v1/performances/${performanceId}`
    );
  },

  async getPerformanceSchedules(
    performanceId: number
  ): Promise<PerformanceSchedulesResponse> {
    const endpoint = `/v1/performances/${performanceId}/schedules`;
    console.log("Making request to endpoint:", endpoint);
    return apiClient.get<PerformanceSchedulesResponse>(endpoint);
  },

  async searchPerformances(
    params: PerformanceSearchParams
  ): Promise<PerformanceResponse> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.append("name", params.name);
    if (params.venue) searchParams.append("venue", params.venue);
    if (params.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    return apiClient.get<PerformanceResponse>(
      `/v1/performances/search${query ? `?${query}` : ""}`
    );
  },
};

// Booking APIs
export const bookingApi = {
  async getBookings(
    params?: BookingSearchParams
  ): Promise<GetBookings200ResponseDto> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return apiClient.get<GetBookings200ResponseDto>(
      `/v1/bookings${query ? `?${query}` : ""}`
    );
  },

  async createBooking(
    bookingData: CreateBookingRequestDto
  ): Promise<CreateBookingResponseDto> {
    return apiClient.post<CreateBookingResponseDto>(
      "/v1/bookings",
      bookingData
    );
  },

  async getBookingDetail(
    bookingId: number
  ): Promise<GetBookingDetail200ResponseDto> {
    return apiClient.get<GetBookingDetail200ResponseDto>(
      `/v1/bookings/${bookingId}`
    );
  },

  async cancelBooking(
    bookingId: number,
    request?: CancelBookingRequestDto
  ): Promise<CancelBooking200ResponseDto> {
    return apiClient.patch<CancelBooking200ResponseDto>(
      `/v1/bookings/${bookingId}/cancel`,
      request
    );
  },
};

// Venue APIs
export const venueApi = {
  async getAllVenues(): Promise<VenueDto[]> {
    return apiClient.get<VenueDto[]>("/api/venues");
  },

  async createVenue(venueData: VenueDto): Promise<VenueDto> {
    return apiClient.post<VenueDto>("/api/venues", venueData);
  },

  async getVenueById(venueId: number): Promise<VenueDto> {
    return apiClient.get<VenueDto>(`/api/venues/${venueId}`);
  },

  async updateVenue(venueId: number, venueData: VenueDto): Promise<VenueDto> {
    return apiClient.put<VenueDto>(`/api/venues/${venueId}`, venueData);
  },

  async deleteVenue(venueId: number): Promise<void> {
    return apiClient.delete<void>(`/api/venues/${venueId}`);
  },
};

// Seat APIs
export const seatApi = {
  async getScheduleSeats(
    scheduleId: number
  ): Promise<ApiResponseSeatAvailabilityResponse> {
    return apiClient.get<ApiResponseSeatAvailabilityResponse>(
      `/api/v1/schedules/${scheduleId}/seats`
    );
  },

  async lockScheduleSeats(
    scheduleId: number,
    request: SeatLockRequest
  ): Promise<ApiResponseSeatLockResponse> {
    return apiClient.post<ApiResponseSeatLockResponse>(
      `/api/v1/schedules/${scheduleId}/seats/lock`,
      request
    );
  },

  async releaseScheduleSeats(
    scheduleId: number,
    request: SeatReleaseRequest
  ): Promise<ApiResponseBoolean> {
    return apiClient.delete<ApiResponseBoolean>(
      `/api/v1/schedules/${scheduleId}/seats/lock`,
      { data: request }
    );
  },

  async checkSeatsAvailability(seatIds: number[]): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>(
      "/api/v1/seats/check-availability",
      seatIds
    );
  },

  async confirmSeats(request: SeatConfirmRequest): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>("/api/v1/seats/confirm", request);
  },

  async cancelSeats(seatIds: number[]): Promise<ApiResponseBoolean> {
    return apiClient.post<ApiResponseBoolean>("/api/v1/seats/cancel", seatIds);
  },

  async cleanupExpiredLocks(): Promise<ApiResponseString> {
    return apiClient.post<ApiResponseString>("/api/v1/seats/cleanup-expired");
  },

  async releaseAllUserLocks(userId: number): Promise<ApiResponseString> {
    return apiClient.delete<ApiResponseString>(
      `/api/v1/users/${userId}/seat-locks`
    );
  },
};

// Admin APIs
export const adminApi = {
  async getDashboard(): Promise<DashboardDto> {
    return apiClient.get<DashboardDto>("/v1/admin/dashboard/system-status");
  },
};

// Export all APIs as a single object for convenience
export const apis = {
  auth: authApi,
  user: userApi,
  performance: performanceApi,
  booking: bookingApi,
  venue: venueApi,
  seat: seatApi,
  admin: adminApi,
};

// Export default
export default apis;
