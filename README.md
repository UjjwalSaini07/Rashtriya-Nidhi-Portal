# Rashtriya-Nidhi-Portal

**Government Fund Allocation & Transparency System — India**

🏛️ A secure digital platform for transparent government fund allocation — enabling states to raise fund bills, route payments to verified contractors and suppliers, detect fraud via AI scanning, enforce dual digital signatures, and maintain a tamper-proof blockchain audit trail eliminating corruption. 🔒

## Stack
- **Client**: Next.js 14 + JSX + Tailwind CSS
- **Server**: Node.js + Express.js (plain JS)
- **Database**: MongoDB (Mongoose)
- **Cache/Sessions**: Redis
- **Auth**: JWT + bcrypt + OTP (MSG91)
- **Audit**: SHA-256 blockchain-style immutable chain
- **Anomaly Detection**: Rule-based AI engine + live GST/PAN validation (SurePass API)
- **Docker**: Docker Compose + Nginx reverse proxy
- **CI/CD**: GitHub Actions (lint → security scan → build → docker → deploy)

## Quick Start

### 1. Configure Environment
```bash
cp server/.env.example server/.env      # Fill in all values
cp client/.env.example client/.env.local
```

### 2. Run with Docker (recommended)
```bash
docker-compose up --build
```

### 3. Run without Docker (development)
```bash
# Terminal 1 — Server
cd server && npm install && npm run dev

# Terminal 2 — Client
cd client && npm install && npm run dev
```

### 4. Create First Admin User (first time only)
```bash
cd server && npm run seed
```

### 5. Open Portal
- Portal: http://localhost:3000
- Backend API: http://localhost:5000
- Public Portal: http://localhost:3000/public-portal

## External APIs Required (Free Tiers Available)
| API | Purpose | Register At |
|-----|---------|-------------|
| MSG91 | OTP SMS delivery | msg91.com |
| SurePass | GST + PAN validation | surepass.io |
| MongoDB Atlas | Cloud database | mongodb.com/atlas |
| Upstash | Managed Redis | upstash.com |

## User Roles
| Role | Can Do |
|------|--------|
| CENTRAL_ADMIN | Everything — final sanction + disburse |
| CENTRAL_REVIEWER | Review and approve/reject bills |
| STATE_ADMIN | Raise bills, OTP-sign state approval |
| STATE_OFFICER | Raise bills for their state |
| CONTRACTOR / SUPPLIER / MEDIATOR | View own payment status |
| AUDITOR | Read-only full audit trail |
| PUBLIC | Read-only sanctioned projects (no login) |

## Security Features
- JWT (8h expiry) + httpOnly refresh token cookies
- OTP two-factor for CENTRAL_ADMIN, STATE_ADMIN, CENTRAL_REVIEWER
- AES-256-GCM encryption for bank account numbers
- SHA-256 blockchain audit chain (tamper-evident, immutable)
- Live GST + PAN validation before any entity is registered
- AI anomaly detection on every bill submission
- Rate limiting on all endpoints (auth: 10/15min, OTP: 3/10min)
- Helmet.js security headers + CORS lockdown
- Account lockout after 5 failed login attempts
- State-level data isolation for state users

Rest Readme I update Later....!!!