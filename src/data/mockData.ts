// Mock Data for Ticket Booking System
// This file contains all mock data used throughout the application
// Replace with actual API calls when integrating with backend

export interface User {
    user_id: number;
    email: string;
    username: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'DevOps' | 'Dev';
    created_at: string;
    last_login?: string;
}

export interface Venue {
    venue_id: number;
    name: string;
    address: string;
    city: string;
    total_capacity: number;
    created_at: string;
}

interface Performance {
    performance_id: number;
    title: string;
    venue: string;
    venue_name?: string; // 추가 - 일부 컴포넌트에서 사용
    theme: string;
    poster_url: string;
    price: number;
    base_price?: number; // 추가 - 일부 컴포넌트에서 base_price로 접근
    status: string;
    start_date: string;
    end_date: string;
    running_time: number;
    venue_address: string;
    description?: string; // 추가 - 컴포넌트에서 사용
    schedules: Array<{
        schedule_id: number;
        show_datetime: string;
        available_seats: number;
        total_seats: number;
        status: string;
    }>;
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
    performance_title: string;
    venue_name: string;
    show_datetime: string;
    seat_count: number;
    total_amount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    booked_at: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    refund_status?: 'PENDING' | 'PROCESSING' | 'COMPLETED';
    refund_amount?: number;
    seats: Array<{
        seat_id: number;
        seat_row: string;
        seat_number: string;
        seat_grade: string;
        seat_price: number;
    }>;
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

// Mock Users Data
export const mockUsers: User[] = [
    {
        user_id: 1,
        email: 'admin@ticket.com',
        username: 'admin',
        name: 'Administrator',
        role: 'ADMIN',
        created_at: '2025-01-01T10:00:00Z',
        last_login: '2025-09-07T09:00:00Z',
    },
    {
        user_id: 2,
        email: 'user@ticket.com',
        username: 'testuser',
        name: 'Test User',
        role: 'USER',
        created_at: '2025-01-15T14:30:00Z',
        last_login: '2025-09-06T18:45:00Z',
    },
    {
        user_id: 3,
        email: 'john@ticket.com',
        username: 'john',
        name: 'John Doe',
        role: 'USER',
        created_at: '2025-02-01T09:15:00Z',
        last_login: '2025-09-05T20:30:00Z',
    },
    {
        user_id: 4,
        email: 'devops@ticket.com',
        username: 'devops',
        name: 'DevOps Engineer',
        role: 'DevOps',
        created_at: '2025-01-01T08:00:00Z',
        last_login: '2025-09-07T07:30:00Z',
    },
    {
        user_id: 5,
        email: 'dev@ticket.com',
        username: 'developer',
        name: 'System Developer',
        role: 'Dev',
        created_at: '2025-01-01T08:30:00Z',
        last_login: '2025-09-07T08:15:00Z',
    },
];

// Mock Venues Data
export const mockVenues: Venue[] = [
    {
        venue_id: 1,
        name: 'Grand Opera House',
        address: '123 Main Street',
        city: 'Seoul',
        total_capacity: 2000,
        created_at: '2025-01-01T00:00:00Z',
    },
    {
        venue_id: 2,
        name: 'National Theater',
        address: '456 Culture Avenue',
        city: 'Seoul',
        total_capacity: 1500,
        created_at: '2025-01-01T00:00:00Z',
    },
    {
        venue_id: 3,
        name: 'Arena Stadium',
        address: '789 Sports Complex',
        city: 'Seoul',
        total_capacity: 50000,
        created_at: '2025-01-01T00:00:00Z',
    },
    {
        venue_id: 4,
        name: 'Symphony Hall',
        address: '321 Music Street',
        city: 'Seoul',
        total_capacity: 1200,
        created_at: '2025-01-01T00:00:00Z',
    },
];

// Mock Performances Data
export const mockPerformances: Performance[] = [
    {
        performance_id: 1,
        title: 'The Phantom of the Opera',
        description:
            'The beloved musical returns with stunning performances and breathtaking visuals.',
        venue_id: 1,
        venue_name: 'Grand Opera House',
        show_datetime: '2025-10-15T19:00:00',
        duration_minutes: 180,
        total_seats: 2000,
        available_seats: 1850,
        base_price: 75000,
        status: 'SCHEDULED',
        created_at: '2025-08-01T10:00:00Z',
        category: 'Musical',
    },
    {
        performance_id: 2,
        title: 'Swan Lake Ballet',
        description:
            "Experience the timeless beauty of Tchaikovsky's masterpiece.",
        venue_id: 2,
        venue_name: 'National Theater',
        show_datetime: '2025-09-07T19:30:00',
        duration_minutes: 150,
        total_seats: 1500,
        available_seats: 1200,
        base_price: 65000,
        status: 'SCHEDULED',
        created_at: '2025-08-15T14:00:00Z',
        category: 'Ballet',
    },
    {
        performance_id: 3,
        title: 'Rock Concert Live',
        description: 'An electrifying night of rock music with top artists.',
        venue_id: 3,
        venue_name: 'Arena Stadium',
        show_datetime: '2025-12-21T19:00:00',
        duration_minutes: 240,
        total_seats: 50000,
        available_seats: 45000,
        base_price: 80000,
        status: 'SCHEDULED',
        created_at: '2025-09-01T16:00:00Z',
        category: 'Concert',
    },
    {
        performance_id: 4,
        title: 'Classical Music Concert',
        description: 'A sophisticated evening of classical masterpieces.',
        venue_id: 4,
        venue_name: 'Symphony Hall',
        show_datetime: '2025-08-20T19:00:00',
        duration_minutes: 120,
        total_seats: 1200,
        available_seats: 0,
        base_price: 60000,
        status: 'COMPLETED',
        created_at: '2025-07-15T09:00:00Z',
        category: 'Classical',
    },
    {
        performance_id: 5,
        title: 'Broadway Musical',
        description: 'The award-winning Broadway hit comes to Seoul.',
        venue_id: 2,
        venue_name: 'National Theater',
        show_datetime: '2025-11-30T20:00:00',
        duration_minutes: 165,
        total_seats: 1500,
        available_seats: 1300,
        base_price: 95000,
        status: 'SCHEDULED',
        created_at: '2025-08-20T11:00:00Z',
        category: 'Musical',
    },
];

// Mock Bookings Data
export const mockBookings: Booking[] = [
    {
        booking_id: 1,
        booking_number: 'BKG-20250001',
        user_id: 2,
        performance_id: 1,
        performance_title: 'The Phantom of the Opera',
        venue_name: 'Grand Opera House',
        show_datetime: '2025-10-15T19:00:00',
        seat_count: 2,
        total_amount: 150000,
        status: 'CONFIRMED',
        booked_at: '2025-09-01T10:30:00',
        seats: [
            {
                seat_id: 1,
                seat_row: 'A',
                seat_number: '5',
                seat_grade: 'VIP',
                seat_price: 75000,
            },
            {
                seat_id: 2,
                seat_row: 'A',
                seat_number: '6',
                seat_grade: 'VIP',
                seat_price: 75000,
            },
        ],
    },
    {
        booking_id: 2,
        booking_number: 'BKG-20250002',
        user_id: 2,
        performance_id: 2,
        performance_title: 'Swan Lake Ballet',
        venue_name: 'National Theater',
        show_datetime: '2025-09-07T19:30:00',
        seat_count: 1,
        total_amount: 65000,
        status: 'CONFIRMED',
        booked_at: '2025-08-15T14:20:00',
        seats: [
            {
                seat_id: 3,
                seat_row: 'B',
                seat_number: '12',
                seat_grade: 'R',
                seat_price: 65000,
            },
        ],
    },
    {
        booking_id: 3,
        booking_number: 'BKG-20250003',
        user_id: 2,
        performance_id: 3,
        performance_title: 'Rock Concert Live',
        venue_name: 'Arena Stadium',
        show_datetime: '2025-12-21T19:00:00',
        seat_count: 4,
        total_amount: 320000,
        status: 'PENDING',
        booked_at: '2025-09-05T16:45:00',
        seats: [
            {
                seat_id: 4,
                seat_row: 'C',
                seat_number: '15',
                seat_grade: 'S',
                seat_price: 80000,
            },
            {
                seat_id: 5,
                seat_row: 'C',
                seat_number: '16',
                seat_grade: 'S',
                seat_price: 80000,
            },
            {
                seat_id: 6,
                seat_row: 'C',
                seat_number: '17',
                seat_grade: 'S',
                seat_price: 80000,
            },
            {
                seat_id: 7,
                seat_row: 'C',
                seat_number: '18',
                seat_grade: 'S',
                seat_price: 80000,
            },
        ],
    },
    {
        booking_id: 4,
        booking_number: 'BKG-20250004',
        user_id: 2,
        performance_id: 4,
        performance_title: 'Classical Music Concert',
        venue_name: 'Symphony Hall',
        show_datetime: '2025-08-20T19:00:00',
        seat_count: 2,
        total_amount: 120000,
        status: 'CONFIRMED',
        booked_at: '2025-08-01T09:15:00',
        seats: [
            {
                seat_id: 8,
                seat_row: 'D',
                seat_number: '8',
                seat_grade: 'A',
                seat_price: 60000,
            },
            {
                seat_id: 9,
                seat_row: 'D',
                seat_number: '9',
                seat_grade: 'A',
                seat_price: 60000,
            },
        ],
    },
    {
        booking_id: 5,
        booking_number: 'BKG-20250005',
        user_id: 2,
        performance_id: 5,
        performance_title: 'Broadway Musical',
        venue_name: 'Theater District',
        show_datetime: '2025-11-30T20:00:00',
        seat_count: 1,
        total_amount: 95000,
        status: 'CANCELLED',
        booked_at: '2025-08-25T11:00:00',
        cancelled_at: '2025-09-02T15:30:00',
        cancellation_reason: 'Schedule Conflict',
        refund_status: 'COMPLETED',
        refund_amount: 95000,
        seats: [
            {
                seat_id: 10,
                seat_row: 'F',
                seat_number: '14',
                seat_grade: 'Premium',
                seat_price: 95000,
            },
        ],
    },
];

// Mock Seats Data (for seat selection)
export const mockSeats: Seat[] = [
    // VIP Section (Row A)
    {
        seat_id: 1,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '1',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: true,
    },
    {
        seat_id: 2,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '2',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: true,
    },
    {
        seat_id: 3,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '3',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: false,
    },
    {
        seat_id: 4,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '4',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: true,
    },
    {
        seat_id: 5,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '5',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: false,
    },
    {
        seat_id: 6,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '6',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: false,
    },
    {
        seat_id: 7,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '7',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: true,
    },
    {
        seat_id: 8,
        venue_id: 1,
        seat_row: 'A',
        seat_number: '8',
        seat_grade: 'VIP',
        seat_price: 75000,
        is_available: true,
    },

    // Premium Section (Row B)
    {
        seat_id: 9,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '1',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },
    {
        seat_id: 10,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '2',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },
    {
        seat_id: 11,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '3',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },
    {
        seat_id: 12,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '4',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: false,
    },
    {
        seat_id: 13,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '5',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },
    {
        seat_id: 14,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '6',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },
    {
        seat_id: 15,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '7',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },
    {
        seat_id: 16,
        venue_id: 1,
        seat_row: 'B',
        seat_number: '8',
        seat_grade: 'Premium',
        seat_price: 65000,
        is_available: true,
    },

    // S Grade Section (Row C)
    {
        seat_id: 17,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '1',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },
    {
        seat_id: 18,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '2',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },
    {
        seat_id: 19,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '3',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },
    {
        seat_id: 20,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '4',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },
    {
        seat_id: 21,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '5',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: false,
    },
    {
        seat_id: 22,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '6',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },
    {
        seat_id: 23,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '7',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },
    {
        seat_id: 24,
        venue_id: 1,
        seat_row: 'C',
        seat_number: '8',
        seat_grade: 'S',
        seat_price: 55000,
        is_available: true,
    },

    // A Grade Section (Row D)
    {
        seat_id: 25,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '1',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 26,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '2',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 27,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '3',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 28,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '4',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 29,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '5',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 30,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '6',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 31,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '7',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
    {
        seat_id: 32,
        venue_id: 1,
        seat_row: 'D',
        seat_number: '8',
        seat_grade: 'A',
        seat_price: 45000,
        is_available: true,
    },
];

// Mock System Metrics
export const mockSystemMetrics: SystemMetrics = {
    totalUsers: 15420,
    totalBookings: 8765,
    totalRevenue: 2847500000,
    activePerformances: 24,
    serverStatus: 'online',
    memoryUsage: 68.5,
    cpuUsage: 45.2,
    diskUsage: 34.8,
    uptime: '15 days, 6 hours, 23 minutes',
};

// API Simulation Functions
export const mockAPI = {
    // Authentication
    async login(identifier: string, password: string): Promise<User | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const trimmedIdentifier = identifier.trim().toLowerCase();
                const trimmedPassword = password.trim();

                const user = mockUsers.find(
                    (u) =>
                        (u.email.toLowerCase() === trimmedIdentifier ||
                            u.username.toLowerCase() === trimmedIdentifier) &&
                        trimmedPassword === 'password123'
                );

                resolve(user || null);
            }, 1000);
        });
    },

    // Users
    async getUsers(): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockUsers), 500);
        });
    },

    // Performances
    async getPerformances(): Promise<Performance[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockPerformances), 800);
        });
    },

    async getPerformanceById(id: number): Promise<Performance | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const performance = mockPerformances.find(
                    (p) => p.performance_id === id
                );
                resolve(performance || null);
            }, 500);
        });
    },

    // Bookings
    async getBookingsByUserId(userId: number): Promise<Booking[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userBookings = mockBookings.filter(
                    (b) => b.user_id === userId
                );
                resolve(userBookings);
            }, 800);
        });
    },

    async getAllBookings(): Promise<Booking[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockBookings), 600);
        });
    },

    async cancelBooking(bookingId: number, reason: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real implementation, this would update the database
                resolve(true);
            }, 2000);
        });
    },

    // Seats
    async getSeatsByVenueId(venueId: number): Promise<Seat[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const venueSeats = mockSeats.filter(
                    (s) => s.venue_id === venueId
                );
                resolve(venueSeats);
            }, 600);
        });
    },

    // System Metrics
    async getSystemMetrics(): Promise<SystemMetrics> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockSystemMetrics), 400);
        });
    },

    // Venues
    async getVenues(): Promise<Venue[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockVenues), 500);
        });
    },
};

// Export types for use in components
export type { User, Venue, Performance, Seat, Booking, SystemMetrics };
