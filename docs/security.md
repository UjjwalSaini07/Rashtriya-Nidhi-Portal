# Security Features

## Overview
The Rashtriya Nidhi Portal implements multiple layers of security to protect against fraud, unauthorized access, and data breaches. The system combines encryption, real-time validation, AI-powered anomaly detection, and immutable audit trails to ensure government fund security.

## Data Encryption

### AES-256-GCM Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Length**: 256 bits (32 bytes)
- **Initialization Vector**: 16 bytes random IV per encryption
- **Authentication Tag**: 16 bytes GCM tag for integrity

### Encrypted Fields
- **Bank Account Numbers**: Stored encrypted in Entity collection
- **Sensitive Metadata**: Payment transaction references

### Encryption Implementation
```javascript
function encrypt(text) {
  const key = Buffer.from(process.env.AES_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16); // 128-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag(); // 128-bit authentication tag
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
```

### Key Management
- **Environment-based**: AES_ENCRYPTION_KEY from environment variables
- **Hex Format**: 64-character hexadecimal string
- **Rotation**: Manual key rotation with data migration
- **Backup**: Encrypted key storage with access controls

## Real-Time Validation

### GST Verification
- **API Integration**: SurePass API for live GST validation
- **Format Check**: 15-character GSTIN format validation
- **Status Verification**: Active/inactive GST status
- **Entity Details**: Business name, address, registration date

### PAN Verification
- **API Integration**: SurePass API for PAN validation
- **Format Check**: 10-character PAN format (AAAAA0000A)
- **Name Matching**: PAN holder name verification
- **Aadhaar Linking**: Aadhaar-PAN linkage status

### IFSC Validation
- **Format Check**: 11-character IFSC code (AAAA0000000)
- **Bank Verification**: Valid bank and branch codes
- **Real-time**: No external API dependency

### Phone Number Validation
- **Format**: Indian mobile numbers only (6-9 prefix, 10 digits)
- **Regex**: `/^[6-9]\d{9}$/`
- **OTP Delivery**: MSG91 integration for verification

## Rate Limiting & DDoS Protection

### Rate Limiting Tiers
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 login attempts per 15 minutes per IP
- **OTP Requests**: 3 OTP requests per 10 minutes per user
- **File Uploads**: Size limits (10MB) and type restrictions

### Redis-Backed Rate Limiting
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: 'Too many login attempts',
  skipSuccessfulRequests: true, // Don't count successful logins
});
```

### Distributed Rate Limiting
- **Redis Storage**: Rate limit counters in Redis
- **IP-based**: Source IP address tracking
- **User-based**: User-specific limits for sensitive operations
- **Automatic Cleanup**: TTL-based counter expiration

## Immutable Audit Trail

### SHA-256 Blockchain Implementation
- **Hash Algorithm**: SHA-256 cryptographic hashing
- **Chain Structure**: Each log links to previous via hash
- **Sequential Blocks**: Auto-incrementing block numbers
- **Genesis Block**: Empty previous hash for first entry

### Audit Log Structure
```javascript
{
  action: 'BILL_CREATED',
  entityType: 'BILL',
  entityId: 'ObjectId',
  performedBy: 'user_id',
  performedByNicId: 'CENTRAL-ADMIN-001',
  performedByName: 'Administrator',
  performedByRole: 'CENTRAL_ADMIN',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  metadata: {},
  previousState: null,
  newState: { status: 'SUBMITTED' },
  dataHash: 'a1b2c3...', // SHA-256 of log data
  previousHash: 'd4e5f6...', // Hash of previous log
  blockNumber: 1234,
  createdAt: '2024-01-15T10:30:00Z'
}
```

### Chain Verification
```javascript
async function verifyAuditChain() {
  const logs = await AuditLog.find().sort({ blockNumber: 1 });
  for (let i = 0; i < logs.length; i++) {
    if (i > 0 && logs[i].previousHash !== logs[i-1].dataHash) {
      return { valid: false, brokenAt: logs[i].blockNumber };
    }
    // Verify data integrity
    const expectedHash = calculateHash(logs[i]);
    if (expectedHash !== logs[i].dataHash) {
      return { valid: false, corruptedAt: logs[i].blockNumber };
    }
  }
  return { valid: true, totalBlocks: logs.length };
}
```

### Audit Events
- **User Actions**: Login, logout, password change, profile update
- **Bill Operations**: Create, review, approve, reject, sign, disburse
- **Entity Management**: Register, update, deactivate
- **System Events**: Configuration changes, security alerts

## AI Anomaly Detection

### Rule-Based AI Engine
- **Real-time Scanning**: Every bill submission triggers detection
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Automatic Actions**: Critical flags block disbursements
- **Manual Review**: Non-critical flags require human review

### Detection Rules

#### Entity Validation
```javascript
// GST/PAN verification checks
if (!entity.gstVerified && entity.type !== 'STATE_DEPT') {
  flags.push({
    flagType: 'GST_NOT_VERIFIED',
    severity: 'CRITICAL',
    message: 'GST not verified. Payment blocked.'
  });
}
```

#### Duplicate Prevention
```javascript
// Check for duplicate entities in same bill
const ids = bill.fundSplit.map(s => s.entityNicId);
if (new Set(ids).size !== ids.length) {
  flags.push({
    flagType: 'DUPLICATE_ENTITY',
    severity: 'HIGH',
    message: 'Duplicate entity allocation detected.'
  });
}
```

#### Amount Thresholds
```javascript
// Excessive contractor share (>85%)
if (split.entityType === 'CONTRACTOR' && split.percentage > 85) {
  flags.push({
    flagType: 'EXCESSIVE_CONTRACTOR_SHARE',
    severity: 'HIGH',
    message: `Contractor share ${percentage}% exceeds threshold.`
  });
}
```

#### Historical Analysis
```javascript
// Compare with historical department averages
const historicalAvg = await calculateDepartmentAverage(bill.department);
if (bill.totalAmount > historicalAvg * 3) {
  flags.push({
    flagType: 'UNUSUALLY_LARGE_AMOUNT',
    severity: 'MEDIUM',
    message: `Amount ${(bill.totalAmount/historicalAvg).toFixed(1)}x historical average.`
  });
}
```

### Anomaly Categories
- **Entity Issues**: Unverified GST/PAN, inactive entities
- **Allocation Problems**: Duplicate entities, excessive shares
- **Amount Anomalies**: Unusual project sizes, mediator commissions
- **Pattern Detection**: Historical deviation analysis

## Account Security

### Password Security
- **Hashing**: bcrypt with 12 rounds (configurable)
- **Minimum Length**: 8 characters
- **Storage**: Hashed only (no plain text recovery)
- **Reset Process**: Admin-initiated password changes

### Account Lockout
- **Threshold**: 5 failed login attempts
- **Lock Duration**: 30 minutes
- **Progressive**: Increasing lock times
- **Admin Unlock**: Manual account unlock by administrators

### Session Security
- **Token Expiry**: 8 hours for access tokens
- **Refresh Tokens**: 7 days with secure httpOnly cookies
- **Blacklisting**: Revoked tokens cached in Redis
- **Single Session**: One active session per user

## Network Security

### HTTPS Enforcement
- **SSL/TLS**: End-to-end encryption
- **Certificate**: Valid government SSL certificates
- **HSTS**: HTTP Strict Transport Security headers
- **Secure Cookies**: httpOnly, secure, sameSite flags

### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://rnp.gov.in']
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Helmet Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));
```

## File Upload Security

### Upload Restrictions
- **Size Limit**: 10MB per file
- **File Types**: PDF, DOC, XLS, JPG, PNG only
- **Virus Scanning**: ClamAV integration (planned)
- **Storage**: Local file system with hash verification

### Secure File Handling
```javascript
const multerOptions = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
};
```

## Incident Response

### Security Monitoring
- **Log Analysis**: Real-time log monitoring
- **Alert System**: Email/SMS alerts for security events
- **Intrusion Detection**: Failed login pattern analysis
- **Anomaly Alerts**: AI flag notifications

### Breach Response
1. **Immediate Isolation**: Account suspension
2. **Investigation**: Audit log analysis
3. **Evidence Collection**: Forensic data gathering
4. **Communication**: Stakeholder notification
5. **Recovery**: System restoration and patching

## Compliance & Standards

### Government Security Standards
- **NIC Guidelines**: National Informatics Centre security standards
- **Data Classification**: Sensitive data encryption requirements
- **Access Controls**: Role-based access with audit trails
- **Incident Reporting**: Mandatory security incident reporting

### Data Protection
- **PII Encryption**: Personal identifiable information protection
- **Data Minimization**: Collect only necessary data
- **Retention Policies**: Automatic data cleanup
- **Cross-border Transfer**: No international data transfers

### Regulatory Compliance
- **Indian IT Act**: Information Technology Act compliance
- **RBI Guidelines**: Banking and financial data security
- **Government Procurement**: Public procurement security requirements

## Security Testing

### Penetration Testing
- **Regular Audits**: Quarterly security assessments
- **Vulnerability Scanning**: Automated vulnerability detection
- **Code Reviews**: Security-focused code review process
- **Third-party Audits**: Independent security firm assessments

### Security Headers Testing
```bash
# Test security headers
curl -I https://api.rnp.gov.in/health

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: default-src 'self'
```

## Configuration Security

### Environment Variables
```bash
# Encryption keys (hex format)
AES_ENCRYPTION_KEY=64_character_hex_string
JWT_SECRET=256_bit_jwt_secret
REFRESH_TOKEN_SECRET=256_bit_refresh_secret

# API keys (encrypted storage recommended)
MSG91_API_KEY=your_msg91_api_key
SUREPASS_GST_TOKEN=your_surepass_token
SUREPASS_PAN_TOKEN=your_surepass_token

# Security settings
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
```

### Secret Management
- **Environment Isolation**: Different secrets per environment
- **Access Control**: Limited access to production secrets
- **Rotation Policy**: Regular secret rotation (quarterly)
- **Backup Security**: Encrypted secret backups

## Performance & Security Balance

### Security Overhead
- **Encryption**: Minimal performance impact (<1ms per operation)
- **Rate Limiting**: Redis-based with low latency
- **Audit Logging**: Asynchronous logging to avoid blocking
- **Validation**: Real-time checks with caching

### Scalability Considerations
- **Redis Clustering**: For high-traffic rate limiting
- **Database Indexing**: Optimized audit log queries
- **CDN Integration**: For static asset security headers
- **Load Balancing**: Session affinity for security

## Future Security Enhancements

### Planned Features
- **Multi-factor Authentication**: Biometric authentication
- **Zero Trust Architecture**: Continuous verification
- **AI Threat Detection**: Machine learning anomaly detection
- **Blockchain Integration**: Distributed ledger for audit trails
- **Quantum-resistant Encryption**: Post-quantum cryptography preparation

### Advanced Monitoring
- **SIEM Integration**: Security information and event management
- **Behavioral Analysis**: User behavior pattern detection
- **Threat Intelligence**: External threat feed integration
- **Automated Response**: AI-driven incident response