# Development Guide

## Overview
This guide covers the development setup, coding standards, testing procedures, and contribution guidelines for the Rashtriya Nidhi Portal project.

## Development Environment Setup

### Prerequisites
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: Version control system
- **Docker**: Version 20.x or higher (for containerized development)
- **Docker Compose**: Version 2.x or higher

### Recommended Tools
- **VS Code**: Primary IDE with extensions
- **Postman**: API testing and documentation
- **MongoDB Compass**: Database GUI
- **Redis Desktop Manager**: Redis GUI
- **GitKraken**: Git GUI client

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-nextjs",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intros",
    "ms-vscode.vscode-docker",
    "mongodb.mongodb-vscode",
    "humao.rest-client"
  ]
}
```

## Project Structure

### Root Directory Structure
```
rashtriya-nidhi-portal/
├── .github/                 # GitHub Actions CI/CD
├── client/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   ├── package.json
│   └── next.config.js
├── server/                  # Express.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File uploads directory
│   ├── logs/               # Application logs
│   └── package.json
├── devOps/                  # Deployment configurations
├── docs/                    # Documentation
├── docker-compose.yml       # Docker orchestration
└── README.md
```

### Client Architecture (Next.js 14)
```
client/src/
├── app/                     # App Router directory
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API routes (if needed)
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── ui/                 # UI components (shadcn/ui)
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   └── charts/             # Chart components
├── hooks/                   # Custom hooks
├── lib/                     # Library configurations
└── utils/                   # Utility functions
```

### Server Architecture (Express.js)
```
server/src/
├── config/                  # Configuration modules
│   ├── database.js         # MongoDB connection
│   ├── redis.js            # Redis connection
│   └── logger.js           # Winston logger
├── controllers/             # Request handlers
│   ├── auth.controller.js
│   ├── bill.controller.js
│   ├── entity.controller.js
│   └── dashboard.controller.js
├── middleware/              # Express middleware
│   ├── auth.js             # Authentication middleware
│   ├── errorHandler.js     # Error handling
│   └── rateLimiter.js      # Rate limiting
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Bill.js
│   ├── Entity.js
│   └── AuditLog.js
├── routes/                  # API route definitions
├── services/                # Business logic services
│   ├── auth.service.js
│   ├── audit.service.js
│   └── anomaly.service.js
└── utils/                   # Utility functions
```

## Quick Start Development

### 1. Clone Repository
```bash
git clone https://github.com/your-org/rashtriya-nidhi-portal.git
cd rashtriya-nidhi-portal
```

### 2. Environment Setup
```bash
# Copy environment templates
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Edit environment variables (see Environment Configuration section)
```

### 3. Docker Development Setup
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Manual Development Setup
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Start development servers
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

### 5. Database Seeding
```bash
# Create initial admin user
cd server && npm run seed
```

### 6. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs (if configured)

## Environment Configuration

### Server Environment Variables (.env)
```bash
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/rnp_db
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=dev_jwt_secret_min_256_bits_long_for_production
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=dev_refresh_secret_min_256_bits_long
BCRYPT_ROUNDS=12

# External APIs (use test/sandbox accounts)
MSG91_API_KEY=your_test_msg91_key
MSG91_TEMPLATE_ID=your_template_id
GST_API_TOKEN=your_test_surepass_token
PAN_API_TOKEN=your_test_surepass_token

# Encryption
AES_ENCRYPTION_KEY=12345678901234567890123456789012  # 32 bytes hex

# Admin Account (for seeding)
ADMIN_NIC_ID=DEV-ADMIN-001
ADMIN_NAME=Development Administrator
ADMIN_EMAIL=admin@dev.gov.in
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=dev_password_123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Client Environment Variables (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Rashtriya Nidhi Portal (Dev)
NEXT_PUBLIC_APP_VERSION=1.0.0-dev
NEXT_PUBLIC_NODE_ENV=development
```

## Development Scripts

### Server Scripts (package.json)
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "seed": "node src/scripts/seed.js",
    "lint": "eslint src --ext .js",
    "lint:fix": "eslint src --ext .js --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Client Scripts (package.json)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  }
}
```

### Docker Scripts
```bash
# Development
docker-compose up --build          # Start all services
docker-compose up -d --build       # Start in background
docker-compose logs -f             # Follow logs
docker-compose logs -f server      # Server logs only
docker-compose exec server sh      # Shell into server container
docker-compose down                # Stop all services
docker-compose down -v             # Stop and remove volumes

# Production simulation
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Database operations
docker-compose exec mongo mongo rnp_db  # MongoDB shell
docker-compose exec redis redis-cli     # Redis CLI
```

## Coding Standards

### JavaScript/Node.js Standards
- **ES6+ Features**: Use modern JavaScript syntax
- **Async/Await**: Prefer over Promises for readability
- **Arrow Functions**: Use for concise anonymous functions
- **Destructuring**: Use for object/array unpacking
- **Template Literals**: Use for string interpolation

### Code Formatting
- **Prettier**: Automatic code formatting
- **ESLint**: Code linting and style enforcement
- **EditorConfig**: Consistent editor settings

### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john_doe';
function getUserById(userId) { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const JWT_EXPIRES_IN = '8h';

// Classes: PascalCase
class UserService { }

// Files: kebab-case
// user-service.js, auth-controller.js

// Database fields: camelCase
// userId, createdAt, isActive
```

### File Organization
- **One Responsibility**: Each file should have a single responsibility
- **Consistent Structure**: Follow established folder structure
- **Index Files**: Use index.js for clean imports
- **Barrel Exports**: Group related exports

### Error Handling
```javascript
// Use custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Async error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
});
```

## API Development Guidelines

### RESTful Design
- **Resource Naming**: Use plural nouns (/api/users, /api/bills)
- **HTTP Methods**: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- **Status Codes**: Use appropriate HTTP status codes
- **Response Format**: Consistent JSON response structure

### Controller Structure
```javascript
// controllers/user.controller.js
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json({ success: true, users });
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, user });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
};
```

### Route Definition
```javascript
// routes/user.routes.js
const router = require('express').Router();
const { getUsers, createUser, getUserById } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('ADMIN'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.get('/:id', getUserById);

module.exports = router;
```

## Database Development

### Schema Design
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nicId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // ... other fields
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, stateCode: 1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.nicId})`;
});

// Methods
userSchema.methods.getPublicProfile = function() {
  return {
    nicId: this.nicId,
    name: this.name,
    role: this.role
  };
};

module.exports = mongoose.model('User', userSchema);
```

### Query Optimization
- **Indexes**: Create indexes for frequently queried fields
- **Lean Queries**: Use `.lean()` for read-only operations
- **Select Fields**: Specify required fields to reduce data transfer
- **Pagination**: Implement cursor-based pagination for large datasets

## Testing Guidelines

### Unit Testing (Jest)
```javascript
// tests/unit/models/user.test.js
const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('Validation', () => {
    it('should validate required fields', async () => {
      const user = new User({});
      await expect(user.validate()).rejects.toThrow();
    });

    it('should validate NIC ID format', async () => {
      const user = new User({ nicId: 'invalid' });
      await expect(user.validate()).rejects.toThrow();
    });
  });

  describe('Methods', () => {
    it('should hash password on save', async () => {
      const user = new User({
        nicId: 'TEST001',
        name: 'Test User',
        password: 'password123'
      });
      await user.save();
      expect(user.password).not.toBe('password123');
    });
  });
});
```

### Integration Testing
```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../../src/index');

describe('Authentication API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await User.create({
        nicId: 'TEST001',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999',
        password: 'password123',
        role: 'STATE_OFFICER'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          nicId: 'TEST001',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
    });
  });
});
```

### E2E Testing (Playwright)
```javascript
// tests/e2e/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('[data-testid="nicId"]', 'TEST001');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Test User');
  });
});
```

## Git Workflow

### Branch Naming
```bash
# Feature branches
feature/user-authentication
feature/bill-creation
feature/entity-validation

# Bug fixes
bugfix/login-validation
bugfix/bill-status-update

# Hotfixes
hotfix/security-patch
hotfix/database-migration
```

### Commit Messages
```bash
# Format: type(scope): description
feat(auth): add JWT authentication middleware
fix(bill): resolve duplicate bill number issue
docs(api): update endpoint documentation
style(client): format code with prettier
refactor(user): simplify user validation logic
test(auth): add unit tests for login controller
chore(deps): update mongodb driver to v5
```

### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Make Changes**: Implement feature with tests
3. **Run Tests**: Ensure all tests pass locally
4. **Update Documentation**: Update docs if needed
5. **Commit Changes**: Use conventional commit messages
6. **Push Branch**: `git push origin feature/new-feature`
7. **Create PR**: Use GitHub PR template
8. **Code Review**: Address reviewer feedback
9. **Merge**: Squash merge to main branch

## Debugging & Troubleshooting

### Server Debugging
```javascript
// Add debug logging
const logger = require('./config/logger');
logger.debug('Processing user login', { userId: user._id });

// Use debugger in development
if (process.env.NODE_ENV === 'development') {
  debugger;
}
```

### Database Debugging
```javascript
// Log database queries
mongoose.set('debug', process.env.NODE_ENV === 'development');

// Explain query performance
const query = User.find({ stateCode: 'MH' });
const explanation = await query.explain('executionStats');
console.log(explanation);
```

### Client Debugging
```javascript
// React DevTools
// Use console.log for debugging
// Chrome DevTools for network inspection

// Error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  // ...
}
```

### Common Issues
- **Port Conflicts**: Check if ports 3000, 5000, 27017, 6379 are available
- **Environment Variables**: Ensure all required env vars are set
- **Database Connection**: Verify MongoDB and Redis are running
- **CORS Issues**: Check CORS configuration for API calls
- **Authentication Errors**: Verify JWT secrets and token expiry

## Performance Optimization

### Server Optimization
- **Caching**: Use Redis for session and data caching
- **Database Indexing**: Ensure proper indexes on query fields
- **Compression**: Enable gzip compression
- **Connection Pooling**: Configure MongoDB connection pool

### Client Optimization
- **Code Splitting**: Use Next.js dynamic imports
- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: Analyze bundle size with webpack-bundle-analyzer
- **Lazy Loading**: Implement lazy loading for components

### Database Optimization
- **Query Optimization**: Use aggregation pipelines for complex queries
- **Pagination**: Implement efficient pagination
- **Data Archiving**: Archive old data for better performance
- **Read Replicas**: Use read replicas for reporting queries

## Security Checklist

### Development Security
- [ ] Never commit secrets to version control
- [ ] Use environment variables for configuration
- [ ] Validate all user inputs
- [ ] Implement proper error handling
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Enable HTTPS in production
- [ ] Regular dependency updates

### Code Review Checklist
- [ ] Code follows established patterns
- [ ] Unit tests are included
- [ ] Documentation is updated
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Error handling implemented
- [ ] Input validation in place

## Contributing Guidelines

### Issue Reporting
- Use issue templates for bug reports and feature requests
- Include reproduction steps for bugs
- Provide environment details and version information
- Attach screenshots for UI issues

### Code Style
- Follow ESLint and Prettier configurations
- Use consistent naming conventions
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Documentation
- Update README for new features
- Document API changes
- Update environment setup instructions
- Maintain changelog for releases

### Testing
- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases and error conditions
- Include integration tests for APIs
- Test across different browsers/devices

## Resources

### Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [React Documentation](https://react.dev/)

### Development Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Redis Desktop Manager](https://redisdesktop.com/)

### Community & Support
- [GitHub Issues](https://github.com/your-org/rashtriya-nidhi-portal/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react+node.js+mongodb)
- [Dev Community](https://dev.to/)
- [Reddit r/reactjs](https://www.reddit.com/r/reactjs/)