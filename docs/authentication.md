# Authentication & Authorization

## Overview
The Rashtriya Nidhi Portal implements a comprehensive authentication and authorization system designed for government security standards. The system uses JWT tokens for session management, OTP for critical operations, and role-based access control (RBAC) with state-level data isolation.

## Authentication Flow

### Primary Authentication (Username/Password)
1. User provides NIC ID and password
2. System validates credentials against User collection
3. For sensitive roles, OTP verification is required
4. Successful authentication issues JWT tokens
5. Failed attempts trigger account lockout

### Two-Factor Authentication (OTP)
- **Required for**: CENTRAL_ADMIN, STATE_ADMIN, CENTRAL_REVIEWER
- **OTP Delivery**: SMS via MSG91 API
- **OTP Validity**: 5 minutes
- **Rate Limiting**: 3 OTP requests per 10 minutes
- **Purpose-specific**: login, bill_sign, action

### Session Management
- **Access Token**: JWT with 8-hour expiry
- **Refresh Token**: HTTP-only cookie with 7-day expiry
- **Token Blacklisting**: Revoked tokens stored in Redis
- **Automatic Renewal**: Refresh endpoint for seamless sessions

## User Roles & Permissions

### Role Hierarchy
```
CENTRAL_ADMIN (God Mode)
├── CENTRAL_REVIEWER (Review & Approve)
├── STATE_ADMIN (State Management)
│   └── STATE_OFFICER (Bill Creation)
├── CONTRACTOR/SUPPLIER/MEDIATOR (Entity Portal)
└── AUDITOR (Read-Only Audit)
    └── PUBLIC (Public Transparency)
```

### Role Permissions Matrix

| Permission | CENTRAL_ADMIN | CENTRAL_REVIEWER | STATE_ADMIN | STATE_OFFICER | CONTRACTOR | AUDITOR | PUBLIC |
|------------|---------------|------------------|-------------|---------------|------------|---------|--------|
| View All Bills | ✓ | ✓ | State Only | State Only | Own Only | ✓ | Sanctioned Only |
| Create Bills | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Review Bills | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Sign Bills | ✓ | ✗ | State Sign | ✗ | ✗ | ✗ | ✗ |
| Disburse Funds | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Register Entities | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| System Administration | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### State-Level Data Isolation
- **Central Users**: Access all states' data
- **State Users**: Restricted to their assigned state
- **Contractors/Suppliers**: View only bills they're allocated in
- **Public Users**: Read-only sanctioned projects

## Security Features

### Password Security
- **Minimum Length**: 8 characters
- **Hashing**: bcrypt with configurable rounds (default: 12)
- **Storage**: Hashed only (never plain text)
- **Reset Policy**: Admin-initiated password changes

### Account Protection
- **Lockout Threshold**: 5 failed login attempts
- **Lockout Duration**: 30 minutes
- **Progressive Delay**: Increasing delays on failures
- **IP Tracking**: Failed attempts logged with IP addresses

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 10 login attempts per 15 minutes
- **OTP Requests**: 3 requests per 10 minutes
- **Implementation**: Redis-backed rate limiting

### Token Security
- **JWT Algorithm**: HS256
- **Secret Rotation**: Environment-based secrets
- **Expiration**: Access (8h), Refresh (7d)
- **Blacklisting**: Revoked tokens cached in Redis
- **Secure Cookies**: httpOnly, secure, sameSite flags

## Authorization Middleware

### Authentication Middleware
```javascript
function authenticate(req, res, next) {
  // Extract Bearer token from Authorization header
  // Verify JWT signature and expiry
  // Check token blacklisting in Redis
  // Load user from database
  // Attach user to request object
}
```

### Role-Based Authorization
```javascript
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Error('Access denied');
    }
  };
}
```

### State Access Control
```javascript
function enforceStateAccess(req, res, next) {
  const centralRoles = ['CENTRAL_ADMIN', 'CENTRAL_REVIEWER', 'AUDITOR'];
  if (centralRoles.includes(req.user.role)) return next();

  const requestedState = req.params.stateCode || req.body?.stateCode;
  if (requestedState && req.user.stateCode !== requestedState) {
    throw new Error('State access violation');
  }
}
```

## JWT Token Structure

### Access Token Payload
```json
{
  "userId": "ObjectId",
  "nicId": "CENTRAL-ADMIN-001",
  "role": "CENTRAL_ADMIN",
  "iat": 1640995200,
  "exp": 1641024000
}
```

### Refresh Token Payload
```json
{
  "userId": "ObjectId",
  "iat": 1640995200,
  "exp": 1641600000
}
```

## OTP System

### OTP Generation
- **Length**: 6 digits
- **Charset**: Numeric only (0-9)
- **Crypto-random**: Node.js crypto module
- **Storage**: Hashed in database (not plain text)

### OTP Verification
- **Single Use**: OTP invalidated after use
- **Time-based**: 5-minute validity window
- **Rate Limited**: 3 attempts per 10 minutes
- **Purpose-specific**: Different OTPs for different actions

### MSG91 Integration
- **API Endpoint**: MSG91 SMS API
- **Template**: Pre-approved government template
- **Delivery Tracking**: Success/failure logging
- **Cost Optimization**: Bulk SMS for multiple OTPs

## Session Management

### Redis Session Store
- **Connection**: Upstash Redis (production)
- **Data Types**: Strings for tokens, hashes for sessions
- **TTL**: Automatic expiration
- **Failover**: Automatic reconnection

### Session Data
```redis
# Token blacklisting
blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... -> "1"

# OTP sessions
login_otp:temp_token_123 -> "user_object_id"

# Rate limiting
rl:auth:192.168.1.100 -> "5"
```

## Development Authentication

### Development Tokens
For development environments, special JWT-like tokens can be used:
```
eyJ1c2VySWQiOiJkZXYtdXNlci0xIiwibmljSWQiOiJERVYtQURNSU4tMDAxIiwicm9sZSI6IkNFTlRSQUxfQURNSU4iLCJzdGF0ZUNvZGUiOiJDRVNUUkFMIiwiZXhwIjoxNjQxMDI0MDAwfQ.dev-temp-token-sig
```

### Mock User Creation
Development mode automatically creates mock users with full permissions for testing.

## Security Audit & Compliance

### Audit Logging
- **All Auth Events**: Login, logout, token refresh, OTP requests
- **IP Tracking**: Source IP address logging
- **User Agent**: Browser/client information
- **Success/Failure**: Detailed outcome logging

### Compliance Features
- **GDPR**: Data minimization, consent management
- **Government Standards**: NIC ID integration, state isolation
- **Audit Trail**: Immutable blockchain-style logging
- **Data Encryption**: AES-256 for sensitive data

### Security Headers
- **Helmet.js**: Security headers middleware
- **CORS**: Restricted to approved domains
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy

## Error Handling

### Authentication Errors
- `401 Unauthorized`: Invalid/expired token
- `403 Forbidden`: Insufficient permissions
- `423 Locked`: Account temporarily locked
- `429 Too Many Requests`: Rate limit exceeded

### Error Response Format
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UNAUTHORIZED"
}
```

## Configuration

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your_256_bit_secret
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=another_256_bit_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# OTP Configuration
MSG91_API_KEY=your_msg91_key
MSG91_TEMPLATE_ID=template_id

# Password Security
BCRYPT_ROUNDS=12
```

### Redis Configuration
```javascript
{
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxmemory: '256mb',
  maxmemoryPolicy: 'allkeys-lru'
}
```

## Best Practices

### Password Policies
- Enforce strong passwords (8+ chars, mixed case, numbers, symbols)
- Regular password rotation for admin accounts
- No password reuse from breached lists

### Token Management
- Short-lived access tokens (8 hours max)
- Secure refresh token storage (httpOnly cookies)
- Immediate token revocation on logout
- Automatic cleanup of expired tokens

### Monitoring & Alerts
- Failed login attempt alerts
- Unusual login location detection
- Bulk OTP request monitoring
- Token abuse detection

### Incident Response
- Immediate account lockout on suspicion
- Token blacklisting procedures
- Audit log analysis tools
- Security incident reporting workflow