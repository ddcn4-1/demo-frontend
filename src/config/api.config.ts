export interface ApiConfig {
    BASE_URL: string;
    TIMEOUT: number;
    ENDPOINTS: {
        AUTH: string;
        ADMIN_AUTH: string;
        USERS: string;
        PERFORMANCES: string;
        BOOKINGS: string;
        VENUES: string;
        SYSTEM: string;
    };
    MOCK_ENDPOINTS: string[];
}

//todo: 개발 중 변경
const development: ApiConfig = {
    BASE_URL: 'http://localhost:8080',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/auth',
        ADMIN_AUTH: '/admin/auth',
        USERS: '/admin/users',
        PERFORMANCES: '/api/v1/performances',
        BOOKINGS: '/api/v1/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
    },
    // ENDPOINT 정의된 엔드포인트 중에서 MOCK_ENDPOINTS 목록에 있는 엔드포인트는 mock 데이터를 사용합니다.
    MOCK_ENDPOINTS: ['USERS', 'SYSTEM', 'VENUES'],
};

const production: ApiConfig = {
    BASE_URL: 'https://staging-api.yourticketservice.com',
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/auth',
        ADMIN_AUTH: '/admin/auth',
        USERS: '/admin/users',
        PERFORMANCES: '/api/v1/performances',
        BOOKINGS: '/api/v1/bookings',
        VENUES: '/api/venues',
        SYSTEM: '/api/system',
    },
    MOCK_ENDPOINTS: [],
};

// 환경별 설정 반환
const getConfig = (): ApiConfig => {
    const env = process.env.NODE_ENV || 'development';
    switch (env) {
        case 'production':
            return production;
        default:
            return development;
    }
};

export const API_CONFIG = getConfig();

// Mock 사용 여부를 확인하는 헬퍼 함수
export const shouldUseMock = (endpointKey: string): boolean => {
    const forceMock = localStorage.getItem('forceMockMode') === 'true';
    if (forceMock) return true;

    return API_CONFIG.MOCK_ENDPOINTS.includes(endpointKey);
};

// 개발자 도구 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
    (window as any).apiDebug = {
        showConfig: () => console.table(API_CONFIG),
        toggleMockMode: () => {
            const current = localStorage.getItem('forceMockMode') === 'true';
            localStorage.setItem('forceMockMode', (!current).toString());
            window.location.reload();
        },
        setMockEndpoints: (endpoints: string[]) => {
            // 런타임에 Mock 엔드포인트 변경 (개발용)
            (API_CONFIG as any).MOCK_ENDPOINTS = endpoints;
            console.log('Mock endpoints updated:', endpoints);
        }
    };
}