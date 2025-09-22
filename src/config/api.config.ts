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

  };
}

//todo: 개발 중 변경
const development: ApiConfig = {
  BASE_URL: "http://localhost:8080",
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: "/auth",
    ADMIN_AUTH: "/admin/auth",
    USERS: "/v1/admin/users",
    PERFORMANCES: "/v1/performances",
    ADMIN_PERFORMANCES: "/v1/admin/performances",
    ADMIN_BOOKINGS: "/v1/admin/bookings",
    BOOKINGS: "/api/bookings",
    VENUES: "/api/venues",
    SYSTEM: "/api/system",
    QUEUE: "/api/v1/queue",
    SEATS: "/api/v1",
  },
};

const production: ApiConfig = {
  BASE_URL: "https://staging-api.yourticketservice.com",
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: "/auth",
    ADMIN_AUTH: "/admin/auth",
    USERS: "/v1/admin/users",
    PERFORMANCES: "/v1/performances",
    ADMIN_PERFORMANCES: "/v1/admin/performances",
    BOOKINGS: "/api/bookings",
    ADMIN_BOOKINGS: "/v1/admin/bookings",
    VENUES: "/api/venues",
    SYSTEM: "/api/system",
    QUEUE: "/api/v1/queue",
    SEATS: "/api/v1",
  },
};

// 현재 환경 감지
const getCurrentEnvironment = (): string => {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    return "development";
  }
  return "production";
};

// 환경별 설정 반환
const getConfig = (): ApiConfig => {
  const env = getCurrentEnvironment();

  switch (env) {
    case "development":
      return development;
    case "production":
      return production;
    default:
      return development;
  }
};
export const API_CONFIG = getConfig();

// Mock 사용 여부를 확인하는 헬퍼 함수
// 개발자 도구 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  (window as any).apiDebug = {
    showConfig: () => console.table(API_CONFIG),
  };
}
