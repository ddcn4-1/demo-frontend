# Mock Server Documentation

The Mock Server provides a realistic backend simulation with HTTP-like request/response patterns, authentication, state management, and proper error handling.

## Features

### 🔐 **Authentication & Security**
- JWT-like token system with session management
- Protected endpoints requiring authentication
- Automatic token validation for secured routes
- Session persistence across browser refreshes

### 🌐 **HTTP-like Request/Response**
- RESTful endpoint patterns (`GET /users`, `POST /auth/login`, etc.)
- Proper HTTP status codes (200, 401, 404, 500)
- Request/response headers support
- JSON request/response format

### 📊 **State Management**
- In-memory data persistence during session
- Real-time updates across components
- CRUD operations with proper state updates
- Referential integrity maintenance

### ⚡ **Realistic Behavior**
- Configurable network delays (300ms - 1.5s)
- Random error simulation (2% failure rate)
- Request logging and debugging
- Proper error messages and handling

## API Endpoints

### Authentication
```typescript
POST /auth/login
POST /auth/logout
```

### Users
```typescript
GET /users                 // List all users
GET /users/{id}           // Get user by ID
POST /users               // Create user
PUT /users/{id}           // Update user
DELETE /users/{id}        // Delete user
```

### Performances
```typescript
GET /performances         // List all performances
GET /performances/{id}    // Get performance by ID
POST /performances        // Create performance
PUT /performances/{id}    // Update performance
```

### Bookings
```typescript
GET /bookings                    // List all bookings
GET /bookings/user/{userId}      // Get bookings by user
POST /bookings/{id}/cancel       // Cancel booking
POST /bookings                   // Create booking
```

### Venues
```typescript
GET /venues                      // List all venues
GET /venues/{id}/seats          // Get seats for venue
```

### System
```typescript
GET /system/metrics             // Get system metrics
GET /system/health              // Health check
```

## Usage Examples

### Basic API Call
```typescript
import { mockServer } from '../data/mockServer';

const response = await mockServer.request({
  method: 'GET',
  endpoint: '/users',
  headers: { Authorization: `Bearer ${token}` }
});

if (response.status === 200) {
  console.log('Users:', response.data);
}
```

### Using Convenience Methods
```typescript
import { serverAPI } from '../data/mockServer';

// Login
const user = await serverAPI.login('admin@ticket.com', 'password123');

// Get data (automatically includes auth token)
const bookings = await serverAPI.getBookingsByUserId(userId);
const performances = await serverAPI.getPerformances();
```

## Authentication Flow

1. **Login**: `POST /auth/login` with credentials
2. **Token Storage**: Server returns JWT-like token, stored in localStorage
3. **Authenticated Requests**: Token automatically included in subsequent requests
4. **Token Validation**: Server validates token for protected endpoints
5. **Logout**: Clear token and session data

## Error Handling

The mock server simulates real-world error scenarios:

### Network Errors (2% chance)
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Simulated server error",
  "timestamp": "2025-09-08T10:30:00.000Z"
}
```

### Authentication Errors
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "timestamp": "2025-09-08T10:30:00.000Z"
}
```

### Not Found Errors
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "User not found",
  "timestamp": "2025-09-08T10:30:00.000Z"
}
```

## Configuration

### Adjust Error Rate
```typescript
import { mockServer } from '../data/mockServer';

// Set 5% error rate for testing
mockServer.setErrorRate(0.05);

// Disable errors for development
mockServer.setErrorRate(0);
```

### Adjust Request Delays
```typescript
// Faster responses for development
mockServer.setRequestDelay(100, 500);

// Slower responses to test loading states
mockServer.setRequestDelay(1000, 3000);
```

## Migration to Real Backend

When ready to connect to a real backend:

### 1. Replace Server Imports
```typescript
// Before
import { serverAPI } from '../data/mockServer';

// After
import { realAPI } from '../services/api';
```

### 2. Update API Configuration
```typescript
// api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const realAPI = {
  async login(identifier: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return response.json();
  }
  // ... other methods
};
```

### 3. Environment Variables
```env
REACT_APP_API_URL=https://your-api-server.com/api
```

## Debugging

The mock server includes comprehensive logging:

```typescript
// Check browser console for:
[MockServer] POST /auth/login { identifier: "admin@ticket.com", password: "..." }
[MockServer] Response: { status: 200, data: { user: {...}, token: "..." } }
```

## Testing Scenarios

The mock server supports various testing scenarios:

### Successful Operations
- Login with valid credentials
- CRUD operations with proper responses
- Real-time state updates

### Error Scenarios
- Invalid credentials (401)
- Missing resources (404)
- Server errors (500)
- Network timeouts

### Edge Cases
- Concurrent requests
- Token expiration
- Rate limiting simulation

## Performance

The mock server is designed for development efficiency:

- **Memory Usage**: Minimal, all data in-memory
- **Request Speed**: 300ms - 1.5s realistic delays
- **Concurrency**: Handles multiple simultaneous requests
- **State Consistency**: Proper transaction-like behavior

## Security Notes

⚠️ **Development Only**: This mock server is for development purposes only. Never use in production.

- Tokens are simple strings, not real JWTs
- No actual encryption or security
- All data is client-side and temporary
- Authentication is simulated, not secure

This mock server provides a realistic development environment that closely mimics production backend behavior, making the eventual transition to a real API seamless and predictable.