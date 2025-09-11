import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from "./service/authService";

interface LoginFormProps {
    onLogin: (user: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({
                usernameOrEmail: identifier,
                password: password
            });

            if (response && response.accessToken) {
                authService.saveAuthData(response);

                const user = {
                    user_id: response.user.userId,
                    email: response.user.email,
                    username: response.user.username,
                    name: response.user.name,
                    role: response.user.role,
                    created_at: new Date().toISOString(),
                    last_login: response.user.lastLogin
                };

                console.log('로그인 성공:', response);
                onLogin(user);
            } else {
                setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('로그인 중 오류가 발생했습니다. 서버 연결을 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (email: string, password: string = 'password123') => {
        setIdentifier(email);
        setPassword(password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login to Ticket System</CardTitle>
                    {/*<div className="text-sm text-muted-foreground">*/}
                    {/*    백엔드: {authService.getBaseURL()} /!* getter 메서드 사용 *!/*/}
                    {/*</div>*/}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="identifier">Email or Username</Label>
                            <Input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="admin@ticket.com or admin"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="password123"
                                required
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    {/*todo. 추후 삭제*/}

                    <div className="mt-6 space-y-2">
                        <p className="text-sm font-medium">빠른 로그인 (테스트용):</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('admin@ticket.com')}
                                type="button"
                            >
                                관리자
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('user@ticket.com')}
                                type="button"
                            >
                                일반사용자
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('dev@ticket.com')}
                                type="button"
                            >
                                개발자
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => quickLogin('ops@ticket.com')}
                                type="button"
                            >
                                DevOps
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Test Accounts:</p>
                        <div className="text-xs space-y-1 text-muted-foreground">
                            <div>관리자: admin@ticket.com / password123</div>
                            <div>일반사용자: user@ticket.com / password123</div>
                            <div>개발자: dev@ticket.com / password123</div>
                            <div>DevOps: ops@ticket.com / password123</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}