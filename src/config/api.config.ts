export interface ApiConfig {
    BASE_URL: string;
    TIMEOUT: number;
    ENDPOINTS: {
        AUTH: string;
        ADMIN_AUTH: string;
        USERS: string;
        PERFORMANCES: string;
        ADMIN_PERFORMANCES: string;
        BOOKINGS: string;
        ADMIN_BOOKINGS: string;
        VENUES: string;
        SYSTEM: string;
        QUEUE: string;
        SEATS: string;
        ASG: string;
        ASG_OVERVIEW: string;
    };
    MOCK_ENDPOINTS?: string[];
}

//todo: 개발 중 변경
const development: ApiConfig = {
    BASE_URL: 'http://localhost:8080',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/auth',
        ADMIN_AUTH: '/admin/auth',
        USERS: '/v1/admin/users',
        PERFORMANCES: '/v1/performances',
        ADMIN_PERFORMANCES: '/v1/admin/performances',
        ADMIN_BOOKINGS: '/v1/admin/bookings',
        BOOKINGS: '/api/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
        QUEUE: '/api/v1/queue',
        SEATS: '/api/v1',
    },
    MOCK_ENDPOINTS: [],
};

const production: ApiConfig = {
    BASE_URL: 'https://api.ddcn41.com',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/auth',
        ADMIN_AUTH: '/admin/auth',
        USERS: '/v1/admin/users',
        PERFORMANCES: '/v1/performances',
        ADMIN_PERFORMANCES: '/v1/admin/performances',
        ADMIN_BOOKINGS: '/v1/admin/bookings',
        BOOKINGS: '/api/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
        QUEUE: '/api/v1/queue',
        SEATS: '/api/v1',
    },
    MOCK_ENDPOINTS: [],
};

// 현재 환경 감지
const getCurrentEnvironment = (): string => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost') {
        return 'development';
    }
    return 'production';
};

// 환경별 설정 반환
const getConfig = (): ApiConfig => {
    const env = getCurrentEnvironment();

    switch (env) {
        case 'development':
            return development;
        case 'production':
            return production;
        default:
            return development;
    }
};
export const API_CONFIG = getConfig();

// Mock 사용 여부를 확인하는 헬퍼 함수
export const shouldUseMock = (
    endpoint: keyof ApiConfig['ENDPOINTS']
): boolean => {
    if (typeof window !== 'undefined') {
        try {
            const override = localStorage.getItem('forceMockMode');
            if (override === 'true') {
                return true;
            }
            if (override === 'false') {
                return false;
            }
        } catch (error) {
            console.warn(
                'Unable to read forceMockMode from localStorage',
                error
            );
        }
    }

    return API_CONFIG.MOCK_ENDPOINTS?.includes(endpoint) ?? false;
};

// 개발자 도구 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
    (window as any).apiDebug = {
        showConfig: () => console.table(API_CONFIG),
    };
}
