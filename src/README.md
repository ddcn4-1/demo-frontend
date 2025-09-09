# Ticket Booking System

A comprehensive ticket booking platform with role-based access control, real-time seat availability, and admin management capabilities.

## Features

### 🎭 **Customer Features**
- Browse performances without login
- Advanced search with filters (name, venue, status)
- Seat selection with real-time availability
- Booking management and history
- Mobile-responsive design

### 🛡️ **Admin Features**
- User management (ADMIN role)
- Performance management (ADMIN role)
- Booking oversight and analytics
- System monitoring and metrics
- Traffic control (DevOps role)

### 🔐 **Authentication & Security**
- Role-based access control (USER, ADMIN, DevOps, Dev)
- JWT-style authentication
- Protected routes with automatic redirects
- Session persistence

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router
- **UI Framework**: Tailwind CSS v4, ShadCN/UI
- **State**: React hooks, URL-based state management
- **Backend**: Mock server (ready for Spring Boot integration)
- **Database**: Ready for PostgreSQL

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Test Accounts
```
Admin: admin@ticket.com / password123
DevOps: devops@ticket.com / password123
User: user@ticket.com / password123
```

## Project Structure

```
├── App.tsx                 # Main application with routing
├── components/             # React components
│   ├── ui/                # ShadCN/UI components
│   ├── admin/             # Admin-specific components
│   └── figma/             # Figma integration helpers
├── data/                  # API layer and mock data
├── docs/                  # Documentation
├── styles/                # Global styles and theme
└── Guidelines.md          # Development guidelines
```

## Key Components

### Public Components
- **PerformanceList**: Browse and search performances
- **PerformanceDetail**: Detailed performance information
- **ClientDashboard**: Main user interface

### Protected Components
- **SeatSelection**: Interactive seat booking
- **BookingHistory**: User's booking management

### Admin Components
- **AdminDashboard**: System overview and management
- **UserManagement**: User administration
- **PerformanceManagement**: Content management
- **SystemOverview**: Monitoring and analytics

## API Documentation

The system uses a mock server that simulates real backend behavior:

- **Authentication**: JWT-style login/logout
- **Public APIs**: Performance browsing, search
- **Protected APIs**: Booking management, user data
- **Admin APIs**: System management, user administration

See [API Documentation](docs/API.md) for complete endpoint reference.

## Backend Integration

Ready for Spring Boot backend integration:

1. **Mock Development**: Current setup with realistic mock server
2. **API Service**: Drop-in replacement for real backend
3. **Environment Config**: Stage-specific API endpoints
4. **Migration Guide**: Step-by-step backend integration

See [Migration Guide](docs/MIGRATION.md) for backend integration instructions.

## Design System

### Typography
- Base: 16px system font
- Consistent spacing and sizing
- Support for light/dark themes

### Components
- **ShadCN/UI**: Professional component library
- **Custom Components**: Tailored for booking workflow
- **Responsive Design**: Mobile-first approach

### Colors & Theming
- CSS custom properties
- Automatic dark mode support
- Accessible color contrasts

## URL Structure

### Public Routes
- `/` - Performance listing
- `/performances/:id` - Performance details
- `/login` - Authentication

### Protected Routes
- `/dashboard` - User dashboard
- `/performances/:id/booking` - Seat selection

### Admin Routes
- `/admin` - Admin dashboard
- `/admin?tab=users` - User management
- `/admin?tab=performances` - Performance management

## Development Guidelines

### Code Quality
- TypeScript for type safety
- Component-based architecture
- Consistent naming conventions
- Comprehensive error handling

### State Management
- React hooks for component state
- URL parameters for shareable state
- localStorage for user preferences
- Context for authentication

### Performance
- Loading states for all async operations
- Skeleton loaders for better UX
- Optimized images and assets
- Lazy loading where appropriate

## Testing

### Mock Data
- Realistic user scenarios
- Complete booking workflows
- Various performance types
- Error conditions and edge cases

### User Testing
- All user roles and permissions
- Complete booking flow
- Search functionality
- Responsive design

## Deployment

### Environment Variables
```bash
REACT_APP_API_BASE_URL=https://your-api.com
REACT_APP_ENVIRONMENT=production
```

### Build Commands
```bash
npm run build:dev     # Development build
npm run build:staging # Staging build
npm run build:prod    # Production build
```

## Contributing

1. Follow the established code patterns
2. Add TypeScript types for new features
3. Test all user roles and scenarios
4. Update documentation for API changes
5. Maintain responsive design principles

## License

This project is proprietary software for ticket booking system implementation.

---

For detailed development guidelines, see [Guidelines.md](Guidelines.md).
For API documentation, see [docs/API.md](docs/API.md).
For backend integration, see [docs/MIGRATION.md](docs/MIGRATION.md).