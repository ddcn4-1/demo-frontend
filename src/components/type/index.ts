export interface User {
  user_id: number;
  email: string;
  username: string;
  name: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'DEVOPS' | 'DEV';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at?: string;
  last_login?: string;
}

export interface UserResponse {
  userId: number;
  email: string;
  username: string;
  name: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'DEVOPS' | 'DEV';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at?: string;
  last_login?: string;
}

export interface Venue {
  venue_id: number;
  venue_name: string;
  address: string;
  description: string;
  contact: string;
  total_capacity: number;
  created_at: string;
}

export interface VenueResponse {
  venueId: number;
  venueName: string;
  address: string;
  description: string;
  contact: string;
  totalCapacity: number;
  created_at: string;
}

export interface Performance {
  performance_id: number;
  title: string;
  description?: string;
  venue: string;
  venue_name?: string; // alias for venue
  venue_id: number;
  theme: string;
  poster_url: string;
  price: number;
  base_price: number; // alias for price
  status:
  | 'UPCOMING'
  | 'ONGOING'
  | 'ENDED'
  | 'CANCELLED';
  start_date: string;
  end_date: string;
  running_time: number;
  venue_address: string;
  total_bookings?: number;
  revenue?: number;
  schedules: Array<{
    schedule_id: number;
    show_datetime: string;
    available_seats: number;
    total_seats: number;
    status: string;
  }>;
}

export interface PerformanceRequest {
  venueId: number;
  title: string;
  description: string;
  theme: string;
  posterUrl: string;
  basePrice: number;
  startDate: string;
  endDate: string;
  runningTime: number;
  status:
  | 'UPCOMING'
  | 'ONGOING'
  | 'ENDED'
  | 'CANCELLED';
  // schedules: Array<{
  //   schedule_id: number;
  //   show_datetime: string;
  //   available_seats: number;
  //   total_seats: number;
  //   status: string;
  // }>;
}

export interface PerformanceResponse {
  performanceId: number;
  title: string;
  venue: string;
  theme: string;
  posterUrl: string;
  price: number;
  status:
  | 'UPCOMING'
  | 'ONGOING'
  | 'ENDED'
  | 'CANCELLED';
  startDate: string;
  endDate: string;
  runningTime: number;
  venueAddress: string;
  venueId: number;
  description?: string;
  schedules: Array<{
    scheduleId: number;
    showDatetime: string;
    availableSeats: number;
    totalSeats: number;
    status: string;
  }>;
}

//   Performance DTOs
//   export interface PerformanceResponse {
//     performanceId: number;
//     title: string;
//     venue: string;
//     theme: string;
//     posterUrl: string;
//     price: number;
//     // status: "UPCOMING" | "ONGOING" | "ENDED" | "CANCELLED";
//     description?: string;
//     startDate?: string;
//     endDate?: string;
//     runningTime?: number;
//     venueAddress?: string;
//     schedules?: ScheduleResponse[];
//   }

export interface PerformanceSchedule {
  schedule_id: number;
  show_datetime: string;
  total_seats: number;
  available_seats: number;
  base_price?: number;
  status: 'OPEN' | 'CLOSED' | 'SOLDOUT';
  created_at: string;
}

export interface Seat {
  seat_id: number;
  venue_id: number;
  seat_row: string;
  seat_number: string;
  seat_grade: 'VIP' | 'Premium' | 'S' | 'A' | 'R';
  seat_price: number;
  is_available: boolean;
}

export interface Booking {
  booking_id: number;
  booking_number: string;
  user_id: number;
  performance_id: number;
  performance_title?: string;
  venue_name?: string;
  show_datetime?: string;
  seat_count: number;
  total_amount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  booked_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  refund_status?: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  refund_amount?: number;
  seats?: BookingSeatDto[];
}

export interface AdminBooking extends Booking {
  user_name: string;
  user_email: string;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface SystemMetrics {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activePerformances: number;
  serverStatus: 'online' | 'offline' | 'maintenance';
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  uptime: string;
}

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
  role: 'USER' | 'ADMIN';
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
  userName?: string;
  userPhone?: string;
  scheduleId: number;
  venueName?: string;
  performanceTitle?: string; // 공연 제목 추가
  showDate?: string; // date-time format
  seats?: BookingSeatDto[]; // 목록 응답에도 좌석 상세 포함 가능
  seatCodes?: string[]; // 좌석 코드 배열 추가
  seatZone?: string; // 좌석 구역 추가
  seatCount: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  expiresAt: string;
  bookedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSeatSelectorDto {
  grade: string;
  zone: string;
  rowLabel: string;
  colNum: string;
}

export interface CreateBookingRequestDto {
  scheduleId: number;
  seats: BookingSeatSelectorDto[];
  queueToken?: string;
}

export interface BookingSeatDto {
  bookingSeatId: number;
  bookingId: number;
  seatId: number;
  seatPrice: number;
  grade: string;
  zone: string;
  rowLabel: string;
  colNum: string;
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
  role?: 'USER' | 'ADMIN';
}

// Seat Map Types
export interface SeatMapSection {
  cols: number;
  rows: number;
  zone?: string;
  name?: string;
  grade?: string;
  seatStart?: number;
  rowLabelFrom: string; // e.g., "A", "K", "AE"
}

export interface SeatMapMeta {
  totalSeats?: number;
  seatCodeFormat?: string; // e.g., "{row}-{number}"
  alphabet?: string; // e.g., "ABCDEFGHJKLMNPQRSTUVWXYZ" (optional skip letters)
}

export interface SeatMapJson {
  meta?: SeatMapMeta;
  version?: number;
  pricing?: Record<string, number>;
  sections: SeatMapSection[];
}

export interface VenueApiResponse {
  venueId: number;
  seatMapUrl: string;
  seatMapJson: SeatMapJson;
}

// Queue 관련 타입 정의
export interface TokenIssueRequest {
    performanceId: number;
}

export interface TokenActivateRequest {
    token: string;
    performanceId: number;
    scheduleId: number;
}

//todo.곧 삭제
export interface TokenIssueResponse {
    token: string;
    status: 'WAITING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
    positionInQueue: number;
    estimatedWaitTime: number;
    message: string;
    expiresAt: string;
    bookingExpiresAt?: string;
}

export interface QueueStatusResponse {
    token: string;
    status: 'WAITING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
    positionInQueue: number;
    estimatedWaitTime: number;
    isActiveForBooking: boolean;
    bookingExpiresAt?: string;
    performanceTitle?: string;
}

export interface QueueStatus {
    queueId: string;
    position: number;
    totalInQueue: number;
    estimatedWaitTime: number;
    status: 'WAITING_FOR_CONNECTION' | 'ENTER_QUEUE' | 'WAITING' | 'AVAILABLE' | 'EXPIRED' | 'COMPLETED';
    sessionEndTime?: Date;
}

// API Response 타입들
export interface ApiResponseTokenIssue {
    message?: string;
    data: TokenIssueResponse;
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface ApiResponseQueueStatus {
    message?: string;
    data: QueueStatusResponse;
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface ApiResponseQueueStatusList {
    message?: string;
    data: QueueStatusResponse[];
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface QueueCheckRequest {
    performanceId: number;
    scheduleId: number;
}

export interface QueueCheckResponse {
    requiresQueue: boolean;
    canProceedDirectly: boolean;
    sessionId?: string;
    message: string;
    currentActiveSessions?: number;
    maxConcurrentSessions?: number;
    estimatedWaitTime?: number;
    currentWaitingCount?: number;
    reason?: string;
}

export interface ApiResponseQueueCheck {
    message?: string;
    data: QueueCheckResponse;
    success: boolean;
    error?: string;
    timestamp?: string;
}

export interface HeartbeatRequest {
    performanceId: number;
    scheduleId: number;
}

export interface SessionReleaseRequest {
    performanceId: number;
    scheduleId: number;
    userId: number;
    reason?: string;
}

