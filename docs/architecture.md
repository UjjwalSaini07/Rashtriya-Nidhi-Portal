# System Architecture

## Overview

The Rashtriya Nidhi Portal (RNP) is a secure, web-based platform designed for transparent government fund allocation and disbursement in India. The system enables state governments to raise fund bills, route payments to verified contractors and suppliers, detect fraud through AI scanning, enforce dual digital signatures, and maintain an immutable blockchain-style audit trail to eliminate corruption.

## Technology Stack

### Frontend (Client)
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend (Server)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache/Session Store**: Redis (Upstash)
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer
- **Logging**: Winston
- **Scheduling**: Node-cron
- **Documentation**: Swagger/OpenAPI

### Infrastructure
- **Containerization**: Docker with Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Security Scanning**: Trivy
- **Rate Limiting**: Express Rate Limit
- **CORS**: Configured for production domains

### External Integrations
- **SMS OTP**: MSG91 API
- **GST/PAN Validation**: SurePass API
- **Cloud Database**: MongoDB Atlas
- **Managed Redis**: Upstash

## Architecture Components

### 1. Client Layer (Next.js Application)
The frontend is a modern React application built with Next.js, providing:
- Responsive web interface for all user roles
- Public portal for transparency
- Dashboard with analytics and charts
- Form handling for bill creation and entity registration
- Real-time status updates using React Query

### 2. API Gateway Layer (Express.js Server)
The backend serves RESTful APIs with:
- Authentication and authorization middleware
- Rate limiting and security headers
- Request validation and error handling
- File upload handling
- Integration with external APIs (MSG91, SurePass)

### 3. Data Layer (MongoDB + Redis)
- **MongoDB**: Primary data storage for users, bills, entities, and audit logs
- **Redis**: Session management, caching, and rate limiting
- **Indexes**: Optimized for common queries (state, status, timestamps)

### 4. Security Layer
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256-GCM for sensitive data (bank accounts)
- **Audit Trail**: SHA-256 blockchain-style immutable chain
- **Anomaly Detection**: Rule-based AI engine for fraud prevention

### 5. External Services
- **MSG91**: OTP delivery for critical operations
- **SurePass**: Real-time GST and PAN validation
- **Blockchain**: Immutable audit trail using hash chaining

## Data Flow Architecture

### Bill Creation Flow
1. State Officer logs in and creates bill draft
2. System validates entity GST/PAN in real-time
3. AI engine scans for anomalies (duplicate bills, unusual amounts)
4. Bill submitted for review workflow
5. Level 1 Review (Central Reviewer)
6. Level 2 Review (Central Admin)
7. State Admin OTP signature
8. Central Admin final sanction and disbursement

### Authentication Flow
1. User enters NIC ID and password
2. System validates credentials and checks account status
3. For privileged roles, OTP sent to registered phone
4. OTP verification completes authentication
5. JWT access token and refresh token issued
6. Subsequent requests include JWT in Authorization header

### Audit Trail Flow
1. Every data-changing operation creates audit log
2. Log includes before/after state, user info, IP address
3. SHA-256 hash calculated from log data + previous hash
4. Chain maintained for immutability
5. Block number assigned sequentially

## Deployment Architecture

### Development Environment
- Local Docker Compose setup
- Hot reload for client and server
- Shared volumes for uploads and logs
- Direct database access for debugging

### Production Environment
- Docker containers orchestrated via Compose
- Nginx reverse proxy for SSL termination
- Environment-specific configurations
- Automated CI/CD pipeline with security scanning
- Health checks and monitoring

### Container Services
- **rnp-client**: Next.js application (port 3000)
- **rnp-server**: Express.js API server (port 5000)
- **rnp-mongo**: MongoDB database
- **rnp-redis**: Redis cache/session store
- **rnp-nginx**: Reverse proxy and load balancer

## Security Architecture

### Defense in Depth
- **Network Layer**: CORS, Helmet security headers, rate limiting
- **Application Layer**: Input validation, authentication, authorization
- **Data Layer**: Encryption at rest, access controls, audit trails
- **Operational Layer**: Secure logging, monitoring, incident response

### Compliance Features
- State-level data isolation
- Mandatory GST/PAN verification
- Dual authorization for disbursements
- Immutable audit trails
- Real-time anomaly detection

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers can be scaled horizontally
- Redis for session sharing across instances
- MongoDB sharding for large datasets

### Performance Optimizations
- Database indexing on critical fields
- Redis caching for frequently accessed data
- Compression middleware for responses
- File upload size limits and validation

### Monitoring and Observability
- Winston structured logging
- Health check endpoints
- Error tracking and alerting
- Performance monitoring via application metrics