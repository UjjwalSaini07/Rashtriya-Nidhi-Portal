# Database Schema

## Overview
The Rashtriya Nidhi Portal uses MongoDB with Mongoose ODM for data persistence. The database is named `rnp_db` and contains four main collections: Users, Bills, Entities, and AuditLogs.

## Database Configuration
- **Database Name:** rnp_db
- **Driver:** MongoDB Node.js Driver via Mongoose
- **Connection:** MongoDB Atlas (production) / Local MongoDB (development)
- **Authentication:** SCRAM-SHA-256
- **Replica Set:** Enabled for high availability

## User Collection

### Schema Definition
```javascript
{
  nicId:        { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, match: /^[6-9]\d{9}$/, 'Invalid Indian mobile number' },
  password:     { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ['CENTRAL_ADMIN','CENTRAL_REVIEWER','STATE_ADMIN','STATE_OFFICER','CONTRACTOR','SUPPLIER','MEDIATOR','AUDITOR','PUBLIC'],
    required: true,
  },
  stateCode:    { type: String, uppercase: true, trim: true },
  department:   { type: String, trim: true },
  designation:  { type: String, trim: true },
  isActive:     { type: Boolean, default: true },
  isVerified:   { type: Boolean, default: false },
  aadhaarVerified: { type: Boolean, default: false },
  lastLogin:    Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil:    Date,
  refreshTokens: { type: [String], select: false },
}
```

### Field Descriptions
- **nicId**: National Identity Card ID (unique identifier)
- **name**: Full name of the user
- **email**: Email address (unique)
- **phone**: Indian mobile number (10 digits, starts with 6-9)
- **password**: Bcrypt hashed password (not returned in queries)
- **role**: User role determining permissions
- **stateCode**: State code for state-level users (e.g., "MH", "DL")
- **department**: Department name (for government officials)
- **designation**: Job designation
- **isActive**: Account status (can be deactivated)
- **isVerified**: Email/phone verification status
- **aadhaarVerified**: Aadhaar verification status
- **lastLogin**: Timestamp of last successful login
- **loginAttempts**: Failed login attempts counter
- **lockUntil**: Account lockout timestamp
- **refreshTokens**: JWT refresh tokens (not returned in queries)

### Indexes
- `{ nicId: 1 }` (unique)
- `{ email: 1 }` (unique)
- Compound indexes for common queries

### Relationships
- Referenced by Bills (raisedBy, level1ReviewedBy, etc.)
- Referenced by Entities (registeredBy)
- Referenced by AuditLogs (performedBy)


## Bill Collection

### Schema Definition
```javascript
{
  billNumber:     { type: String, required: true, unique: true, uppercase: true, index: true },
  stateCode:      { type: String, required: true, uppercase: true },
  stateName:      { type: String, required: true },
  department:     { type: String, required: true },
  projectTitle:   { type: String, required: true, trim: true, maxlength: 300 },
  projectDescription: { type: String, required: true, maxlength: 2000 },
  projectCategory: {
    type: String,
    enum: ['ROADS_TRANSPORT','WATER_RESOURCES','HEALTH','EDUCATION','URBAN_DEV','AGRICULTURE','ENERGY','DEFENSE','MISC'],
    required: true,
  },
  totalAmount:    { type: Number, required: true, min: 0 },
  totalAmountPaise: { type: Number, required: true, min: 0 },
  expectedCompletionDate: { type: Date, required: true },
  fundSplit: [{
    entityId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
    entityNicId:  { type: String, required: true },
    entityName:   { type: String, required: true },
    entityType:   { type: String, required: true },
    amount:       { type: Number, required: true, min: 0 },
    amountPaise:  { type: Number, required: true, min: 0 },
    percentage:   { type: Number, required: true, min: 0, max: 100 },
    disbursed:    { type: Boolean, default: false },
    disbursedAt:  Date,
    transactionRef: String,
  }],
  status: {
    type: String,
    enum: ['DRAFT','SUBMITTED','LEVEL1_REVIEW','LEVEL2_REVIEW','AWAITING_STATE_SIGN','AWAITING_CENTRAL_SIGN','SANCTIONED','DISBURSING','DISBURSED','REJECTED','FLAGGED'],
    default: 'DRAFT',
    index: true,
  },
  raisedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raisedByNicId:  { type: String, required: true },
  level1ReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level1ReviewedAt: Date,
  level1Comments: String,
  level2ReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level2ReviewedAt: Date,
  level2Comments: String,
  stateSignOtpHash: { type: String, select: false },
  stateSignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stateSignedAt:  Date,
  centralSignOtpHash: { type: String, select: false },
  centralSignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  centralSignedAt: Date,
  sanctionedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sanctionedAt:   Date,
  sanctionOrderNumber: String,
  rejectedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt:     Date,
  rejectionReason: String,
  aiFlags: [{
    flagType:   String,
    severity:   { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'] },
    message:    String,
    detectedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  documents: [{
    docType: String,
    filename: String,
    path: String,
    hash: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  blockchainHash: String,
  blockNumber:    Number,
}
```

### Field Descriptions
- **billNumber**: Unique bill identifier (format: STATE-DEPT-YEAR-XXXX)
- **stateCode**: State code where project is located
- **stateName**: Full state name
- **department**: Government department (PWD, Health, etc.)
- **projectTitle**: Project title (max 300 chars)
- **projectDescription**: Detailed project description (max 2000 chars)
- **projectCategory**: Project category classification
- **totalAmount**: Total amount in crores
- **totalAmountPaise**: Total amount in exact paise
- **expectedCompletionDate**: Project completion deadline
- **fundSplit**: Array of fund allocations to entities
- **status**: Current bill status in workflow
- **raisedBy**: Reference to user who created the bill
- **raisedByNicId**: Cached NIC ID of bill creator
- **level1ReviewedBy/level2ReviewedBy**: Review workflow references
- **stateSignedBy/centralSignedBy**: Signature workflow references
- **sanctionedBy**: Final approver reference
- **aiFlags**: AI anomaly detection results
- **documents**: Attached document metadata
- **blockchainHash**: SHA-256 hash for audit chain
- **blockNumber**: Sequential block number in audit chain

### Indexes
- `{ billNumber: 1 }` (unique)
- `{ status: 1 }`
- `{ stateCode: 1, status: 1 }`
- `{ createdAt: -1 }`
- `{ raisedBy: 1 }`

### Relationships
- References Users (raisedBy, reviewers, signers)
- References Entities (in fundSplit)
- Referenced by AuditLogs


## Entity Collection

### Schema Definition
```javascript
{
  nicEntityId:  { type: String, required: true, unique: true, uppercase: true, index: true },
  type:         { type: String, enum: ['CONTRACTOR','SUPPLIER','MEDIATOR','STATE_DEPT'], required: true },
  name:         { type: String, required: true, trim: true, maxlength: 200 },
  gstNumber:    { type: String, uppercase: true, trim: true, match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/ },
  panNumber:    { type: String, required: true, uppercase: true, trim: true, match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
  aadhaarLinked: { type: Boolean, default: false },
  bankAccountNumber: { type: String, required: true }, // AES-256 encrypted
  bankIfsc:     { type: String, required: true, uppercase: true, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ },
  bankName:     { type: String, required: true },
  bankBranch:   { type: String, required: true },
  stateCode:    { type: String, required: true, uppercase: true },
  address:      { type: String, required: true, maxlength: 500 },
  contactEmail: { type: String, required: true, lowercase: true },
  contactPhone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  gstVerified:  { type: Boolean, default: false },
  panVerified:  { type: Boolean, default: false },
  gstVerifiedAt: Date,
  panVerifiedAt: Date,
  gstDetails:   mongoose.Schema.Types.Mixed,
  panDetails:   mongoose.Schema.Types.Mixed,
  isActive:     { type: Boolean, default: true },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documents: [{
    docType: String,
    filename: String,
    path: String,
    hash: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
}
```

### Field Descriptions
- **nicEntityId**: Unique entity identifier (format: TYPE-GST-XXXX or TYPE-PAN-XXXX)
- **type**: Entity type (contractor, supplier, mediator, state department)
- **name**: Legal entity name
- **gstNumber**: GST registration number (15-digit format)
- **panNumber**: PAN card number (10-character format)
- **aadhaarLinked**: Whether Aadhaar is linked to PAN
- **bankAccountNumber**: Bank account number (AES-256 encrypted)
- **bankIfsc**: IFSC code (11-character format)
- **bankName**: Bank name
- **bankBranch**: Bank branch name
- **stateCode**: State where entity is registered
- **address**: Registered address
- **contactEmail**: Contact email address
- **contactPhone**: Contact phone number
- **gstVerified**: GST validation status
- **panVerified**: PAN validation status
- **gstDetails/panDetails**: Validation response data from SurePass API
- **isActive**: Entity active status
- **registeredBy**: User who registered the entity
- **documents**: Supporting document metadata

### Indexes
- `{ nicEntityId: 1 }` (unique)
- `{ gstNumber: 1 }`
- `{ panNumber: 1 }`
- `{ type: 1 }`

### Relationships
- Referenced by Bills (in fundSplit)
- References Users (registeredBy)
- Referenced by AuditLogs


## AuditLog Collection

### Schema Definition
```javascript
{
  action:           { type: String, required: true, index: true },
  entityType:       { type: String, required: true },
  entityId:         { type: String, required: true, index: true },
  performedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByNicId: { type: String, required: true },
  performedByName:  { type: String, required: true },
  performedByRole:  { type: String, required: true },
  ipAddress:        { type: String, required: true },
  userAgent:        String,
  metadata:         { type: mongoose.Schema.Types.Mixed, default: {} },
  previousState:    mongoose.Schema.Types.Mixed,
  newState:         mongoose.Schema.Types.Mixed,
  dataHash:         { type: String, required: true, unique: true },
  previousHash:     { type: String, required: true },
  blockNumber:      { type: Number, required: true, unique: true },
}
```

### Field Descriptions
- **action**: Action performed (BILL_CREATED, USER_LOGIN, etc.)
- **entityType**: Type of entity affected (USER, BILL, ENTITY)
- **entityId**: ObjectId of affected entity
- **performedBy**: User who performed the action
- **performedByNicId**: Cached NIC ID
- **performedByName**: Cached user name
- **performedByRole**: Cached user role
- **ipAddress**: IP address of the request
- **userAgent**: Browser/client user agent string
- **metadata**: Additional context data
- **previousState**: Entity state before action
- **newState**: Entity state after action
- **dataHash**: SHA-256 hash of the log entry
- **previousHash**: Hash of previous log entry
- **blockNumber**: Sequential block number

### Indexes
- `{ action: 1 }`
- `{ entityType: 1, entityId: 1 }`
- `{ performedBy: 1, createdAt: -1 }`
- `{ createdAt: -1 }`
- `{ blockNumber: 1 }` (unique)

### Blockchain Implementation
Audit logs form an immutable blockchain:
1. Each log contains `dataHash` (SHA-256 of log content)
2. Each log contains `previousHash` (hash of previous log)
3. Sequential `blockNumber` for ordering
4. Genesis block has empty `previousHash`
5. Any tampering breaks the hash chain

### Relationships
- References Users (performedBy)
- Immutable collection (no updates allowed)


## Database Relationships

### Entity Relationship Diagram
```
Users (1) ────► Bills (many)
  │               │
  │               ▼
  └────────────► Entities (many)
                  │
                  ▼
               AuditLogs
```

### Key Relationships
- **User → Bills**: One user can create many bills
- **User → Entities**: One user can register many entities
- **User → AuditLogs**: One user can have many audit log entries
- **Bill → Entities**: Many-to-many through fundSplit array
- **Bill → Users**: Multiple user references (creator, reviewers, signers)
- **Entity → Users**: One user registers many entities
- **Entity → Bills**: Many-to-many through fundSplit
- **AuditLog → Users**: Each log entry references the performing user
- **AuditLog → All Collections**: Audit logs reference affected entities


## Data Validation Rules

### User Validation
- NIC ID format: uppercase, alphanumeric
- Email: valid email format, unique
- Phone: Indian mobile format (10 digits, starts 6-9)
- Password: minimum 8 characters
- State code: valid Indian state code

### Bill Validation
- Bill number format: STATE-DEPT-YEAR-XXXX
- Amount: positive numbers, fund split must sum to total
- Dates: future dates for completion
- Status transitions: strict workflow enforcement

### Entity Validation
- GST: 15-character format validation
- PAN: 10-character format validation
- IFSC: 11-character bank code format
- Account number: encrypted storage

### Audit Validation
- Hash chain integrity verification
- Immutable records (no updates allowed)
- Sequential block numbering


## Performance Optimizations

### Indexing Strategy
- Single field indexes on frequently queried fields
- Compound indexes for multi-field queries
- Unique indexes on identifier fields
- Sparse indexes for optional fields

### Query Patterns
- Paginated queries with skip/limit
- Filtered queries by status, state, user
- Text search on titles and descriptions
- Date range queries for reporting

### Data Access Patterns
- Read-heavy workload (dashboard queries)
- Write-heavy for audit logging
- Real-time queries for status updates
- Batch operations for reporting


## Backup and Recovery

### Backup Strategy
- Daily automated backups via MongoDB Atlas
- Point-in-time recovery capability
- Cross-region replication
- Encrypted backup storage

### Data Retention
- Audit logs: indefinite retention
- Bills: indefinite retention
- Users/Entities: active records only
- Failed login attempts: 30-day retention

### Disaster Recovery
- Multi-region replication
- Automatic failover
- Backup restoration procedures
- Data integrity verification