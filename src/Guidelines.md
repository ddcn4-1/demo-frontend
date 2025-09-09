# Ticket Booking System - Development Guidelines

## Project Overview

A comprehensive ticket booking platform with role-based access control, performance management, and real-time seat booking capabilities. Built with React, TypeScript, and Tailwind CSS, designed for easy Spring Boot backend integration.

## Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **React Router** for URL-based navigation
- **Tailwind CSS v4** with custom design system
- **ShadCN/UI** component library
- **Mock Server** for realistic development environment

### Backend Integration
- **Spring Boot** backend (ready for integration)
- **PostgreSQL** database schema
- **JWT authentication** with role-based access
- **RESTful API** architecture

## URL Routing Structure

### Public Routes (No authentication required)
- `/` - Main performances listing
- `/performances` - Same as `/` (performances listing)
- `/performances/:id` - Performance detail page
- `/login` - Login page

### Protected Routes (Authentication required)
- `/dashboard` - User dashboard with full features
- `/dashboard?tab=performances` - Authenticated performances tab
- `/dashboard?tab=history` - My bookings (USER role only)
- `/performances/:id/booking` - Seat selection/booking page

### Admin Routes (Admin authentication required)
- `/admin` - Admin dashboard overview
- `/admin?tab=overview` - System overview
- `/admin?tab=performances` - Performance management (ADMIN only)
- `/admin?tab=bookings` - Booking management (ADMIN only)
- `/admin?tab=users` - User management (ADMIN only)
- `/admin?tab=traffic` - Traffic control (DevOps, ADMIN)

### Authentication Flow
- **Public browsing**: Users can view all performances without login
- **Booking attempt**: Redirects to login when trying to book without authentication
- **Post-login redirect**: Returns users to their intended destination after login
- **Protected content**: "My Bookings" only available to authenticated users

## Design System Guidelines

### Typography ⚠️ CRITICAL RULES
- **NEVER use font-size classes** (text-xl, text-lg, etc.) unless explicitly requested
- **NEVER use font-weight classes** (font-bold, font-medium, etc.) unless explicitly requested
- **NEVER use line-height classes** (leading-none, leading-tight, etc.) unless explicitly requested
- **Base font size**: 16px (defined in CSS custom properties)
- **System fonts**: Default weights 400 (normal), 500 (medium)
- **Typography handled by**: `/styles/globals.css` - do not override
- **Date formats**: "Jun 10, 2024" or "2024-06-10"

### Layout Principles
- **Flexbox and grid** for responsive layouts
- **Avoid absolute positioning** unless necessary
- **Mobile-first** responsive design
- **Container max-width** for content areas

### Component Guidelines
- **Keep components focused** and single-purpose
- **Extract reusable logic** into custom hooks
- **Use ShadCN/UI components** as the foundation
- **Follow established naming conventions**

#### Button Usage
- **Primary**: Main actions (Book Now, Submit, Login)
- **Secondary**: Alternative actions (Cancel, Back, View Details)
- **Outline**: Less important actions (Filter, Clear)
- **Ghost**: Minimal actions (Close, Skip)

#### Color Usage
- **Use CSS custom properties** for consistent theming
- **Support both light and dark modes**
- **Use semantic color names** (primary, destructive, muted)
- **Maintain proper contrast ratios**

### State Management
- **React hooks** for component-level data
- **URL parameters** for shareable/bookmarkable state
- **localStorage** for user preferences and session data
- **Context** for authentication state

### Performance Considerations
- **Loading states** for all async operations
- **Skeleton loaders** for better perceived performance
- **Lazy load components** when appropriate
- **Optimize images** with proper sizing and formats

## File Organization

### Project Structure
```
├── App.tsx                 # Main application component
├── README.md              # Project overview and setup
├── Guidelines.md          # This file
├── components/            # React components
│   ├── ui/               # ShadCN/UI components
│   ├── admin/            # Admin-specific components
│   └── figma/            # Figma integration components
├── data/                 # API layer and data management
│   ├── mockServer.ts     # Development mock server
│   ├── mockData.ts       # Mock data and type definitions
│   └── README.md         # Data layer documentation
├── docs/                 # Documentation
│   ├── API.md            # API endpoint documentation
│   └── MIGRATION.md      # Backend integration guide
└── styles/               # Global styles and theme
    └── globals.css       # Tailwind and custom styles
```

### Import Guidelines
- **Relative imports** for local components
- **Absolute imports** for external libraries
- **Group imports**: React, external libraries, internal modules
- **Export types** alongside implementation files

### Code Quality
- **TypeScript** for type safety
- **ESLint and Prettier** configurations
- **Self-documenting code** with clear names
- **Comments for complex business logic** only

## API Integration

### Mock Server (Current)
Located in `/data/mockServer.ts`:
- **HTTP-like request/response patterns**
- **JWT-style authentication system**
- **Role-based access control**
- **Realistic delays and error simulation**
- **Search functionality with filters**

### Backend Integration (Future)
Ready for Spring Boot integration:
- **Drop-in API service replacement**
- **Environment-based configuration**
- **Comprehensive migration guide** in `/docs/MIGRATION.md`
- **All endpoints documented** in `/docs/API.md`

## Security Considerations

### Authentication
- **JWT tokens** stored securely
- **Automatic token refresh** handling
- **Role-based access control** (USER, ADMIN, DevOps, Dev)
- **Protected routes** with proper redirects

### Data Handling
- **No PII storage** in frontend state
- **Secure API communication** (HTTPS)
- **Input validation** and sanitization
- **Error messages** that don't expose system details

### Best Practices
- **Environment-specific configurations**
- **Proper error boundaries**
- **Graceful degradation** for offline scenarios
- **Audit trail** for admin actions

## Development Workflow

### Getting Started
1. **Clone and install**: `npm install`
2. **Start development**: `npm start`
3. **Test with mock data**: Login with provided test accounts
4. **Review components**: Explore the component library

### Test Accounts
```
Admin: admin@ticket.com / password123
DevOps: devops@ticket.com / password123
User: user@ticket.com / password123
```

### Component Development
1. **Use existing UI components** from `/components/ui/`
2. **Follow TypeScript patterns** established in the codebase
3. **Add proper loading states** for async operations
4. **Test with different user roles**

### API Development
1. **Use mock server** for development (`/data/mockServer.ts`)
2. **Follow established API patterns**
3. **Add proper error handling**
4. **Test with realistic delays and errors**

## Testing Guidelines

### User Scenarios
- **Public browsing** without authentication
- **Complete booking flow** for authenticated users
- **Admin management** functions
- **Error scenarios** and edge cases

### Role Testing
- **USER**: Booking and history access
- **ADMIN**: Full system management
- **DevOps**: Traffic control and monitoring
- **Dev**: Development tools and debugging

### Responsive Testing
- **Mobile devices** (320px and up)
- **Tablet devices** (768px and up)
- **Desktop** (1024px and up)
- **Large screens** (1440px and up)

## Common Patterns

### API Calls
```typescript
import { serverAPI } from '../data/mockServer';

// With error handling
try {
  const data = await serverAPI.getPerformances();
  setPerformances(data);
} catch (error) {
  console.error('Failed to fetch:', error);
}
```

### Navigation
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate with state
navigate('/performances/123', { state: { performance } });

// Navigate to protected route
navigate('/dashboard?tab=history');
```

### Loading States
```typescript
const [loading, setLoading] = useState(true);

// Always include loading UI
if (loading) {
  return <LoadingSkeleton />;
}
```

## Performance Optimization

### Code Splitting
- **Lazy load admin components** for non-admin users
- **Split large components** into smaller modules
- **Use React.memo** for expensive re-renders

### Asset Optimization
- **Use Unsplash tool** for images (don't hardcode URLs)
- **Optimize bundle size** with proper imports
- **Cache API responses** when appropriate

### User Experience
- **Skeleton loaders** instead of spinners
- **Optimistic updates** for immediate feedback
- **Error boundaries** to prevent crashes

## Deployment

### Environment Configuration
```bash
# Development
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development

# Production
REACT_APP_API_BASE_URL=https://api.yourservice.com
REACT_APP_ENVIRONMENT=production
```

### Build Process
1. **Test thoroughly** with mock server
2. **Configure environment** variables
3. **Build for target environment**
4. **Test in staging** before production

## Migration to Production

When ready for Spring Boot backend:

1. **Review migration guide**: `/docs/MIGRATION.md`
2. **Set up backend endpoints**: Follow API documentation
3. **Update imports**: Switch from mock to real API
4. **Test incrementally**: One endpoint at a time
5. **Deploy and monitor**: Watch for issues

## Support and Maintenance

### Documentation
- **Keep README updated** with setup instructions
- **Document new API endpoints** in `/docs/API.md`
- **Update migration guide** for backend changes

### Code Quality
- **Regular refactoring** to keep code clean
- **Type safety** with comprehensive TypeScript
- **Performance monitoring** in production

This system is designed for rapid development with realistic mock data, followed by seamless migration to a production Spring Boot backend. The architecture supports scaling from a simple booking system to a comprehensive platform with advanced features.