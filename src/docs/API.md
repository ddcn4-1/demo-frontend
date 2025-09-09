# API Documentation

## Mock Server Endpoints

The Mock Server provides a realistic backend simulation with HTTP-like request/response patterns, authentication, state management, and proper error handling.

### Authentication
```http
POST /auth/login     # User login
POST /auth/logout    # User logout
```

### Users
```http
GET    /users                 # List all users (Admin only)
GET    /users/{id}           # Get user by ID
POST   /users               # Create user (Admin only)
PUT    /users/{id}           # Update user (Admin only)
DELETE /users/{id}        # Delete user (Admin only)
```

### Performances
```http
GET    /performances         # List all performances
GET    /performances/search  # Search with filters
GET    /performances/{id}    # Get performance by ID
POST   /performances        # Create performance (Admin only)
PUT    /performances/{id}    # Update performance (Admin only)
```

### Performance Search
```http
GET /performances/search?name={query}&venue={venue}&status={status}

Query Parameters:
- name: string (optional) - Search in performance titles
- venue: string (optional) - Search in venue names  
- status: string (optional) - Filter by status
  - "scheduled", "ongoing", "completed", "cancelled"
  - "available" (has available seats)
  - "soldout" (no available seats)
```

### Bookings
```http
GET    /bookings                    # List all bookings (Admin only)
GET    /bookings/user/{userId}      # Get bookings by user
POST   /bookings/{id}/cancel       # Cancel booking
POST   /bookings                   # Create booking
```

### Venues
```http
GET    /venues                      # List all venues
GET    /venues/{id}/seats          # Get seats for venue
```

### System
```http
GET    /system/metrics             # Get system metrics (Admin only)
GET    /system/health              # Health check
```

## Authentication Flow

1. **Login**: `POST /auth/login` with credentials
2. **Token Storage**: Server returns JWT-like token, stored in localStorage
3. **Authenticated Requests**: Token automatically included in subsequent requests
4. **Token Validation**: Server validates token for protected endpoints
5. **Logout**: Clear token and session data

## Error Responses

### Authentication Errors (401)
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "timestamp": "2025-09-08T10:30:00.000Z"
}
```

### Not Found Errors (404)
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Performance not found",
  "timestamp": "2025-09-08T10:30:00.000Z"
}
```

### Server Errors (500)
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Simulated server error",
  "timestamp": "2025-09-08T10:30:00.000Z"
}
```

## Usage Examples

### Basic API Call
```typescript
import { serverAPI } from '../data/mockServer';

// Authentication
const user = await serverAPI.login('admin@ticket.com', 'password123');

// Get data (automatically includes auth token)
const bookings = await serverAPI.getBookingsByUserId(userId);
const performances = await serverAPI.getPerformances();

// Search with filters
const results = await serverAPI.searchPerformances({
  name: 'Romeo',
  venue: 'Opera House',
  status: 'available'
});
```

### Error Handling
```typescript
try {
  const response = await serverAPI.getPerformances();
  console.log('Performances:', response);
} catch (error) {
  console.error('Failed to fetch performances:', error);
}
```

## Testing Features

The mock server includes:
- **Realistic delays** (300ms - 1.5s)
- **Random error simulation** (2% failure rate)
- **Request logging** for debugging
- **State persistence** during development session
- **JWT-like authentication** with role-based access

## Security Notes

⚠️ **Development Only**: This mock server is for development purposes only.

- Tokens are simple strings, not real JWTs
- No actual encryption or security
- All data is client-side and temporary
- Authentication is simulated, not secure