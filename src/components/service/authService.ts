import {API_CONFIG} from "../../config/api.config";


export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface EnhancedAuthResponse {
    accessToken: string;
    userType: 'USER' | 'ADMIN';
    user: {
        userId: number;
        username: string;
        email: string;
        name: string;
        role: string;
        lastLogin: string;
    };
    message: string;
    expiresIn: number;
}

export interface LogoutResponse {
    username: string;
    tokenTimeLeft?: string;
}

class AuthService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    // baseURL에 접근하기 위한 getter 메서드 추가
    getBaseURL(): string {
        return this.baseURL;
    }

    // 나머지 메서드들은 동일...
    async login(credentials: LoginRequest): Promise<EnhancedAuthResponse | null> {
        try {
            const userResponse = await this.attemptLogin('/auth/login', credentials);
            if (userResponse) {
                return userResponse;
            }

            const adminResponse = await this.attemptLogin('/admin/auth/login', credentials);
            return adminResponse;

        } catch (error) {
            console.error('Login failed:', error);
            return null;
        }
    }

    private async attemptLogin(endpoint: string, credentials: LoginRequest): Promise<EnhancedAuthResponse | null> {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const data: EnhancedAuthResponse = await response.json();
                return data;
            } else if (response.status === 403) {
                return null;
            } else {
                const errorData = await response.json().catch(() => ({message: 'Login failed'}));
                console.error('Login error:', errorData);
                return null;
            }
        } catch (error) {
            console.error(`Login attempt failed for ${endpoint}:`, error);
            return null;
        }
    }

    async logout(userRole: 'USER' | 'ADMIN'): Promise<LogoutResponse> {
        const token = localStorage.getItem('authToken');
        const endpoint = userRole === 'ADMIN' ? '/admin/auth/logout' : '/auth/logout';

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && {Authorization: `Bearer ${token}`}),
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (data.data) {
                    return data.data;
                } else {
                    return data;
                }
            } else {
                throw new Error(`Logout failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            return {username: 'unknown', tokenTimeLeft: '0분'};
        } finally {
            this.clearAuthData();
        }
    }

    saveAuthData(response: EnhancedAuthResponse): void {
        localStorage.setItem('authToken', response.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    clearAuthData(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    getCurrentUser(): any | null {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('authToken');
        const user = this.getCurrentUser();
        return !!(token && user);
    }
}

export const authService = new AuthService();