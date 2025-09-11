import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from './ui/button';

export function Breadcrumb() {
    const location = useLocation();
    const navigate = useNavigate();

    const getBreadcrumbs = () => {
        const path = location.pathname;
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');

        const breadcrumbs = [];

        if (path === '/' || path === '/performances') {
            breadcrumbs.push({ label: 'Performances', path: '/' });
        } else if (path === '/dashboard') {
            breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
            if (tab === 'history') {
                breadcrumbs.push({
                    label: 'My Bookings',
                    path: '/dashboard?tab=history',
                });
            } else {
                breadcrumbs.push({
                    label: 'Performances',
                    path: '/dashboard?tab=performances',
                });
            }
        } else if (path.startsWith('/admin')) {
            breadcrumbs.push({ label: 'Admin Portal', path: '/admin' });
            if (tab) {
                const tabLabels: Record<string, string> = {
                    overview: 'Dashboard',
                    performances: 'Performance Management',
                    bookings: 'Booking Management',
                    users: 'User Management',
                    traffic: 'Traffic Control',
                };
                if (tabLabels[tab]) {
                    breadcrumbs.push({
                        label: tabLabels[tab],
                        path: `/admin?tab=${tab}`,
                    });
                }
            }
        } else if (path.startsWith('/performances')) {
            const segments = path.split('/');
            breadcrumbs.push({ label: 'Performances', path: '/' });

            if (segments.length >= 3) {
                const performanceId = segments[2];
                const detailPath = `/performances/${performanceId}`;

                if (path.endsWith('/booking')) {
                    breadcrumbs.push({
                        label: 'Performance Details',
                        path: detailPath,
                    });
                    breadcrumbs.push({ label: 'Seat Selection', path: path });
                } else {
                    breadcrumbs.push({
                        label: 'Performance Details',
                        path: path,
                    });
                }
            }
        } else if (path === '/login') {
            breadcrumbs.push({ label: 'Login', path: '/login' });
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
            <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/')}
            >
                <Home className="w-4 h-4" />
            </Button>

            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.path}-${index}`}>
                    <ChevronRight className="w-4 h-4" />
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-foreground font-medium">
                            {crumb.label}
                        </span>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(crumb.path)}
                        >
                            {crumb.label}
                        </Button>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
