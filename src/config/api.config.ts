export interface ApiConfig {
    BASE_URL: string;
    TIMEOUT: number;
    ENDPOINTS: {
        AUTH: string;
        USERS: string;
        PERFORMANCES: string;
        BOOKINGS: string;
        VENUES: string;
        SYSTEM: string;
    };
}

//todo: 개발 중 변경
const development: ApiConfig = {
    BASE_URL: 'http://localhost:8080',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/api/auth',
        USERS: '/api/users',
        PERFORMANCES: '/api/v1/performances',
        BOOKINGS: '/api/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
    },
};

//todo: 배포 직전 변경
const production: ApiConfig = {
    BASE_URL: 'https://staging-api.yourticketservice.com',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/api/auth',
        USERS: '/api/users',
        PERFORMANCES: '/api/performances',
        BOOKINGS: '/api/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
    },
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
