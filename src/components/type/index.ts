export interface User {
    user_id: number;
    email: string;
    username: string;
    name: string;
    phone: string;
    role: 'USER' | 'ADMIN' | 'DevOps' | 'Dev';
    status: 'active' | 'inactive' | 'suspended';
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

export interface Performance {
    performance_id: number;
    title: string;
    venue: string;
    theme: string;
    poster_url: string;
    price: number;
    status: string;
    start_date: string;
    end_date: string;
    running_time: number;
    venue_address: string;
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
