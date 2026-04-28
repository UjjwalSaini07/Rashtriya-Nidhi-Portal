# REST API Endpoints

## Base URL
```
Production: https://api.rnp.gov.in
Development: http://localhost:5000
```

## Authentication
All endpoints except public routes require JWT authentication via Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
All responses follow this structure:
```json
{
  "success": boolean,
  "message": "string", // Optional
  "data": object|array, // Response data
  "error": "string" // Only on errors
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `423` - Locked (account locked)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error


## Authentication Endpoints

### POST /api/auth/login
Authenticate user with NIC ID and password.

**Request Body:**
```json
{
  "nicId": "string",
  "password": "string"
}
```

**Response (Success - no OTP required):**
```json
{
  "success": true,
  "accessToken": "jwt_token",
  "user": {
    "nicId": "string",
    "name": "string",
    "role": "string",
    "stateCode": "string",
    "email": "string"
  }
}
```

**Response (OTP required):**
```json
{
  "success": true,
  "requireOTP": true,
  "tempToken": "string",
  "message": "OTP sent to registered mobile number"
}
```

### POST /api/auth/verify-otp
Complete authentication with OTP for sensitive roles.

**Request Body:**
```json
{
  "tempToken": "string",
  "otp": "string"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt_token",
  "user": {
    "nicId": "string",
    "name": "string",
    "role": "string",
    "stateCode": "string"
  }
}
```

### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/send-otp
Send OTP for additional verification.

**Headers:** Authorization required

**Request Body:**
```json
{
  "purpose": "login|action" // Default: action
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### GET /api/auth/me
Get current user profile information.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "user": {
    "nicId": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string",
    "stateCode": "string",
    "department": "string",
    "designation": "string",
    "isActive": boolean,
    "isVerified": boolean,
    "aadhaarVerified": boolean,
    "lastLogin": "date"
  }
}
```


## Bill Management Endpoints

### POST /api/bills
Create and submit a new bill for fund allocation.

**Headers:** Authorization required
**Roles:** STATE_OFFICER, STATE_ADMIN, CENTRAL_ADMIN

**Request Body:**
```json
{
  "stateCode": "MH", // Required
  "department": "PWD", // Required
  "projectTitle": "Highway Construction", // Required
  "projectDescription": "Construction of 50km highway", // Required
  "projectCategory": "ROADS_TRANSPORT", // Required
  "totalAmountCrore": 100.5, // Required
  "expectedCompletionDate": "2025-12-31", // Required
  "fundSplit": [
    {
      "entityNicId": "CONT-GST-22AAAAA0000A1Z5",
      "amountCrore": 60.0
    },
    {
      "entityNicId": "SUPP-GST-22BBBBB0000B1Z5",
      "amountCrore": 40.5
    }
  ] // Required
}
```

**Response:**
```json
{
  "success": true,
  "bill": {
    "billNumber": "MH-PWD-2024-0001",
    "status": "SUBMITTED",
    // ... full bill object
  },
  "message": "Bill submitted successfully. Under AI review and Level 1 review."
}
```

### GET /api/bills
List bills with filtering and pagination.

**Headers:** Authorization required

**Query Parameters:**
- `status` - Filter by status
- `stateCode` - Filter by state
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in bill number, title, state

**Response:**
```json
{
  "success": true,
  "bills": [
    {
      "billNumber": "MH-PWD-2024-0001",
      "stateName": "Maharashtra",
      "projectTitle": "Highway Construction",
      "status": "SUBMITTED",
      "totalAmount": 100.5,
      "raisedBy": {
        "name": "John Doe",
        "nicId": "STATE-OFFICER-001"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

### GET /api/bills/:id
Get detailed bill information.

**Headers:** Authorization required
**Parameters:** id - Bill ObjectId

**Response:**
```json
{
  "success": true,
  "bill": {
    "billNumber": "MH-PWD-2024-0001",
    "stateCode": "MH",
    "stateName": "Maharashtra",
    "department": "PWD",
    "projectTitle": "Highway Construction",
    "projectDescription": "Construction of 50km highway",
    "projectCategory": "ROADS_TRANSPORT",
    "totalAmount": 100.5,
    "expectedCompletionDate": "2025-12-31T00:00:00Z",
    "status": "SUBMITTED",
    "fundSplit": [
      {
        "entityId": "ObjectId",
        "entityNicId": "CONT-GST-22AAAAA0000A1Z5",
        "entityName": "ABC Construction Ltd",
        "entityType": "CONTRACTOR",
        "amount": 60.0,
        "percentage": 59.7,
        "disbursed": false
      }
    ],
    "raisedBy": {
      "name": "John Doe",
      "nicId": "STATE-OFFICER-001"
    },
    "aiFlags": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### PATCH /api/bills/:id/review
Review and approve/reject bill (Level 1 or Level 2 review).

**Headers:** Authorization required
**Roles:** CENTRAL_REVIEWER, CENTRAL_ADMIN
**Parameters:** id - Bill ObjectId

**Request Body:**
```json
{
  "action": "APPROVE", // or "REJECT"
  "comments": "Approved for implementation" // Required if rejecting
}
```

**Response:**
```json
{
  "success": true,
  "bill": { /* updated bill object */ },
  "message": "Bill approved"
}
```

### POST /api/bills/:id/sign
Apply digital signature to bill.

**Headers:** Authorization required
**Roles:** STATE_ADMIN (state signature), CENTRAL_ADMIN (central signature)
**Parameters:** id - Bill ObjectId

**Request Body:**
```json
{
  "otp": "123456",
  "signatureType": "STATE" // or "CENTRAL"
}
```

**Response:**
```json
{
  "success": true,
  "bill": { /* updated bill object */ },
  "message": "STATE signature applied successfully"
}
```

### POST /api/bills/:id/disburse
Disburse sanctioned funds to beneficiaries.

**Headers:** Authorization required
**Roles:** CENTRAL_ADMIN
**Parameters:** id - Bill ObjectId

**Response:**
```json
{
  "success": true,
  "bill": { /* updated bill object */ },
  "message": "Funds disbursed to all beneficiaries"
}
```


## Entity Management Endpoints

### GET /api/entities
List registered entities (contractors, suppliers, mediators).

**Headers:** Authorization required

**Query Parameters:**
- `type` - Filter by type (CONTRACTOR, SUPPLIER, MEDIATOR, STATE_DEPT)
- `stateCode` - Filter by state
- `search` - Search in name, NIC ID, GST, PAN

**Response:**
```json
{
  "success": true,
  "entities": [
    {
      "nicEntityId": "CONT-GST-22AAAAA0000A1Z5",
      "type": "CONTRACTOR",
      "name": "ABC Construction Ltd",
      "gstNumber": "22AAAAA0000A1Z5",
      "panNumber": "AAAAA0000A",
      "stateCode": "MH",
      "gstVerified": true,
      "panVerified": true,
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

### GET /api/entities/:id
Get detailed entity information.

**Headers:** Authorization required
**Parameters:** id - Entity ObjectId

**Response:**
```json
{
  "success": true,
  "entity": {
    "nicEntityId": "CONT-GST-22AAAAA0000A1Z5",
    "type": "CONTRACTOR",
    "name": "ABC Construction Ltd",
    "gstNumber": "22AAAAA0000A1Z5",
    "panNumber": "AAAAA0000A",
    "gstVerified": true,
    "panVerified": true,
    "stateCode": "MH",
    "address": "Mumbai, Maharashtra",
    "contactEmail": "contact@abc.com",
    "contactPhone": "9876543210",
    "isActive": true,
    "registeredBy": {
      "name": "Admin User",
      "nicId": "CENTRAL-ADMIN-001"
    }
  }
}
```

### POST /api/entities
Register a new entity with GST/PAN validation.

**Headers:** Authorization required
**Roles:** CENTRAL_ADMIN, CENTRAL_REVIEWER, STATE_ADMIN

**Request Body:**
```json
{
  "type": "CONTRACTOR", // CONTRACTOR, SUPPLIER, MEDIATOR, STATE_DEPT
  "name": "ABC Construction Ltd",
  "gstNumber": "22AAAAA0000A1Z5", // Optional for some types
  "panNumber": "AAAAA0000A", // Required
  "bankAccountNumber": "123456789012",
  "bankIfsc": "HDFC0001234",
  "bankName": "HDFC Bank",
  "bankBranch": "Mumbai Main Branch",
  "stateCode": "MH",
  "address": "123 Business Street, Mumbai",
  "contactEmail": "contact@abc.com",
  "contactPhone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "entity": { /* created entity object */ }
}
```

### PATCH /api/entities/:id/status
Activate or deactivate an entity.

**Headers:** Authorization required
**Roles:** CENTRAL_ADMIN
**Parameters:** id - Entity ObjectId

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "entity": { /* updated entity object */ }
}
```


## Dashboard Endpoints

### GET /api/dashboard/stats
Get system-wide statistics and analytics.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBills": 1250,
    "totalAmount": 50000.0, // in crores
    "billsByStatus": {
      "SUBMITTED": 45,
      "LEVEL1_REVIEW": 12,
      "SANCTIONED": 890,
      "DISBURSED": 780
    },
    "billsByState": {
      "MH": 120,
      "DL": 95,
      "KA": 80
    },
    "monthlyTrends": [
      {
        "month": "2024-01",
        "bills": 45,
        "amount": 1250.5
      }
    ]
  }
}
```

### GET /api/dashboard/by-state
Get statistics grouped by state (filtered by user permissions).

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "stateCode": "MH",
      "stateName": "Maharashtra",
      "totalBills": 120,
      "totalAmount": 4500.0,
      "billsByStatus": {
        "SUBMITTED": 10,
        "DISBURSED": 85
      }
    }
  ]
}
```


## Audit Trail Endpoints

### GET /api/audit/logs
Get audit logs with filtering.

**Headers:** Authorization required
**Roles:** CENTRAL_ADMIN, CENTRAL_REVIEWER, AUDITOR

**Query Parameters:**
- `action` - Filter by action type
- `entityType` - Filter by entity type
- `entityId` - Filter by specific entity
- `performedBy` - Filter by user NIC ID
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "action": "BILL_CREATED",
      "entityType": "BILL",
      "entityId": "ObjectId",
      "performedBy": "STATE-OFFICER-001",
      "performedByName": "John Doe",
      "performedByRole": "STATE_OFFICER",
      "ipAddress": "192.168.1.100",
      "metadata": {},
      "dataHash": "sha256_hash",
      "blockNumber": 1234,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 5000,
  "page": 1,
  "pages": 250
}
```

### GET /api/audit/verify-chain
Verify blockchain integrity of audit trail.

**Headers:** Authorization required
**Roles:** CENTRAL_ADMIN, CENTRAL_REVIEWER, AUDITOR

**Response:**
```json
{
  "success": true,
  "verified": true,
  "totalBlocks": 5000,
  "lastVerifiedBlock": 5000,
  "corruptedBlocks": []
}
```


## Public Endpoints

### GET /api/public/projects
Get publicly visible sanctioned projects (no authentication required).

**Query Parameters:**
- `stateCode` - Filter by state
- `category` - Filter by project category
- `page` - Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "billNumber": "MH-PWD-2024-0001",
      "stateName": "Maharashtra",
      "projectTitle": "Highway Construction",
      "projectCategory": "ROADS_TRANSPORT",
      "totalAmount": 100.5,
      "status": "DISBURSED",
      "sanctionedAt": "2024-02-15T10:00:00Z",
      "department": "PWD"
    }
  ],
  "total": 1250,
  "page": 1,
  "pages": 63
}
```


## Health Check

### GET /health
System health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "ts": "2024-01-15T10:30:00.000Z"
}
```