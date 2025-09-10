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
    MOCK_ENDPOINTS?: string[];
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
    // ENDPOINT 정의된 엔드포인트 중에서 MOCK_ENDPOINTS 목록에 있는 엔드포인트는 mock 데이터를 사용합니다.
    // MOCK_ENDPOINTS: ['AUTH', 'USERS', 'PERFORMANCES', 'BOOKINGS', 'VENUES', 'SYSTEM'], 
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

// Mock 사용 여부를 확인하는 헬퍼 함수
export const shouldUseMock = (endpoint: keyof ApiConfig['ENDPOINTS']): boolean => {
    return API_CONFIG.MOCK_ENDPOINTS?.includes(endpoint) ?? false;
};
