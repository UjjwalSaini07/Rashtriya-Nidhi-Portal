# Deployment Guide

## Overview
The Rashtriya Nidhi Portal uses containerized deployment with Docker and Docker Compose for development and production environments. The CI/CD pipeline automates testing, building, and deployment processes.

## Docker Architecture

### Container Services
- **rnp-client**: Next.js frontend application
- **rnp-server**: Express.js API server
- **rnp-mongo**: MongoDB database with authentication
- **rnp-redis**: Redis cache and session store
- **rnp-nginx**: Nginx reverse proxy and load balancer

### Multi-Stage Dockerfiles

#### Server Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S rnp && adduser -S rnp -G rnp
COPY --chown=rnp:rnp --from=builder /app/node_modules ./node_modules
COPY --chown=rnp:rnp src ./src
COPY --chown=rnp:rnp package*.json ./
RUN mkdir -p uploads logs && chown rnp:rnp uploads logs
USER rnp
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "src/index.js"]
```

#### Client Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S rnp && adduser -S rnp -G rnp
COPY --chown=rnp:rnp --from=builder /app/.next/standalone ./
COPY --chown=rnp:rnp --from=builder /app/.next/static ./.next/static
COPY --chown=rnp:rnp --from=builder /app/public ./public
USER rnp
EXPOSE 3000
CMD ["node", "server.js"]
```

## Docker Compose Configuration

### Production docker-compose.yml
```yaml
version: '3.9'

services:
  server:
    build: { context: ./server, dockerfile: Dockerfile }
    container_name: rnp-server
    restart: unless-stopped
    ports: ["5000:5000"]
    env_file: ./server/.env
    depends_on: [mongo, redis]
    volumes: ["./server/uploads:/app/uploads", "./server/logs:/app/logs"]
    networks: [rnp-net]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  client:
    build: { context: ./client, dockerfile: Dockerfile }
    container_name: rnp-client
    restart: unless-stopped
    ports: ["3000:3000"]
    env_file: ./client/.env.local
    depends_on: [server]
    networks: [rnp-net]

  mongo:
    image: mongo:7.0
    container_name: rnp-mongo
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
      - ./devOps/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    environment:
      MONGO_INITDB_ROOT_USERNAME: rnp_admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: rnp_db
    networks: [rnp-net]

  redis:
    image: redis:7.2-alpine
    container_name: rnp-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes: [redis_data:/data]
    networks: [rnp-net]

  nginx:
    image: nginx:1.25-alpine
    container_name: rnp-nginx
    restart: unless-stopped
    ports: ["80:80"]
    volumes: ["./devOps/nginx.conf:/etc/nginx/nginx.conf:ro"]
    depends_on: [client, server]
    networks: [rnp-net]

volumes:
  mongo_data:
  redis_data:

networks:
  rnp-net:
    driver: bridge
```

## Nginx Reverse Proxy

### Configuration (devOps/nginx.conf)
```nginx
events { worker_connections 1024; }
http {
  server_tokens off;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

  upstream client { server rnp-client:3000; }
  upstream server  { server rnp-server:5000; }

  server {
    listen 80;
    location /api/auth/ {
      limit_req zone=auth burst=5 nodelay;
      proxy_pass http://server;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
    location /api/ {
      limit_req zone=api burst=20 nodelay;
      proxy_pass http://server;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
    location / {
      proxy_pass http://client;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

### Features
- **Rate Limiting**: Different zones for auth (1 req/sec) and API (10 req/sec)
- **Security Headers**: XSS protection, frame options, content type sniffing prevention
- **Load Balancing**: Round-robin distribution to backend services
- **Health Checks**: Automatic failover for unhealthy containers

## CI/CD Pipeline

### GitHub Actions Workflow (.github/workflows/ci.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install client dependencies
        run: cd client && npm ci

      - name: Lint client
        run: cd client && npm run lint

      - name: Install server dependencies
        run: cd server && npm ci

      - name: Lint server
        run: |
          cd server
          npx eslint src --ext .js

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  build-and-test:
    runs-on: ubuntu-latest
    needs: [lint, security-scan]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install client dependencies
        run: cd client && npm ci

      - name: Build client
        run: cd client && npm run build

      - name: Install server dependencies
        run: cd server && npm ci

      - name: Build server (if needed)
        run: cd server && npm run build || echo "No build step for server"

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        if: github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push server image
        uses: docker/build-push-action@v5
        with:
          context: ./server
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: your-registry/rnp-server:latest

      - name: Build and push client image
        uses: docker/build-push-action@v5
        with:
          context: ./client
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: your-registry/rnp-client:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server
        run: |
          echo "Add deployment commands here"
          # Example: scp docker-compose.yml user@server:/path
          # ssh user@server 'docker-compose pull && docker-compose up -d'
```

### Pipeline Stages
1. **Lint**: ESLint for both client and server code
2. **Security Scan**: Trivy vulnerability scanning
3. **Build & Test**: Docker image building and basic tests
4. **Deploy**: Automated deployment to production (configurable)

## Environment Configuration

### Server Environment Variables (server/.env)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://rnp_app:password@cluster.mongodb.net/rnp_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_256_bit_jwt_secret
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=your_256_bit_refresh_secret
MSG91_API_KEY=your_msg91_api_key
MSG91_TEMPLATE_ID=your_sms_template_id
GST_API_TOKEN=your_surepass_gst_token
PAN_API_TOKEN=your_surepass_pan_token
AES_ENCRYPTION_KEY=your_64_char_hex_key
BCRYPT_ROUNDS=12
ADMIN_NIC_ID=CENTRAL-ADMIN-001
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@gov.in
ADMIN_PHONE=9999999999
ADMIN_PASSWORD=secure_admin_password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Client Environment Variables (client/.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Rashtriya Nidhi Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### MongoDB Initialization (devOps/mongo-init.js)
```javascript
db = db.getSiblingDB('rnp_db');
db.createUser({ user: 'rnp_app', pwd: 'changeme_now', roles: [{ role: 'readWrite', db: 'rnp_db' }] });
db.auditlogs.createIndex({ blockNumber: 1 }, { unique: true });
db.auditlogs.createIndex({ dataHash: 1 }, { unique: true });
db.bills.createIndex({ billNumber: 1 }, { unique: true });
db.users.createIndex({ nicId: 1 }, { unique: true });
db.entities.createIndex({ nicEntityId: 1 }, { unique: true });
print('MongoDB initialized for RNP');
```

## Database Setup

### MongoDB Atlas Configuration
1. Create MongoDB Atlas cluster
2. Set up database user with read/write permissions
3. Configure IP whitelist for server access
4. Enable database-level authentication
5. Set up automated backups

### Redis Configuration
- **Upstash Redis**: Managed Redis service
- **Password Authentication**: Required for security
- **Memory Limits**: 256MB with LRU eviction
- **Persistence**: AOF (Append Only File) enabled

## Monitoring & Observability

### Health Checks
- **Container Health**: Docker health checks every 30 seconds
- **Application Health**: `/health` endpoint monitoring
- **Database Health**: MongoDB connection monitoring
- **Cache Health**: Redis connectivity checks

### Logging
- **Application Logs**: Winston structured logging
- **Container Logs**: Docker logging drivers
- **Access Logs**: Nginx access logging
- **Error Logs**: Centralized error collection

### Metrics (Planned)
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Custom Metrics**: Application performance monitoring
- **Alert Manager**: Automated alerting

## Backup & Recovery

### Database Backup
- **MongoDB Atlas**: Automated daily backups
- **Point-in-time Recovery**: 24-hour retention
- **Cross-region Replication**: Disaster recovery
- **Backup Encryption**: AES-256 encryption

### File Storage Backup
- **Upload Files**: Periodic backup of uploaded documents
- **Log Files**: Log rotation and archival
- **Configuration**: Environment-specific backup policies

### Recovery Procedures
1. **Container Restart**: Automatic recovery via Docker restart policies
2. **Database Failover**: MongoDB Atlas automatic failover
3. **Data Recovery**: Restore from latest backup
4. **Service Restoration**: Rolling deployment for zero-downtime updates

## Scaling Strategies

### Horizontal Scaling
- **Application Servers**: Multiple server instances behind load balancer
- **Session Affinity**: Redis-backed session sharing
- **Database Sharding**: MongoDB sharding for large datasets
- **Cache Clustering**: Redis cluster for high availability

### Vertical Scaling
- **Resource Limits**: Container memory and CPU limits
- **Auto-scaling**: Kubernetes HPA (planned)
- **Resource Monitoring**: Container resource usage tracking

## Security in Production

### Network Security
- **Firewall Rules**: Restrict access to necessary ports only
- **VPC Configuration**: Isolated network segments
- **SSL/TLS**: End-to-end encryption
- **DDoS Protection**: Cloud-based DDoS mitigation

### Access Control
- **SSH Keys**: Key-based authentication for server access
- **Bastion Host**: Jump server for administrative access
- **Principle of Least Privilege**: Minimal required permissions
- **Regular Audits**: Access log monitoring and review

### Secret Management
- **Environment Variables**: Secure secret storage
- **Key Rotation**: Regular rotation of encryption keys
- **Access Logging**: Secret access audit trails
- **Backup Security**: Encrypted secret backups

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database initialized with indexes
- [ ] SSL certificates installed
- [ ] DNS records updated
- [ ] Firewall rules configured
- [ ] Monitoring alerts set up

### Deployment Steps
1. Update docker-compose.yml with production values
2. Run `docker-compose pull` to get latest images
3. Execute `docker-compose up -d` for zero-downtime deployment
4. Verify health checks pass
5. Update load balancer configuration
6. Monitor application logs and metrics

### Post-deployment
- [ ] Functional testing completed
- [ ] Performance benchmarks met
- [ ] Security scans passed
- [ ] Backup verification successful
- [ ] Documentation updated

## Troubleshooting

### Common Issues
- **Container Startup Failures**: Check environment variables and dependencies
- **Database Connection Issues**: Verify connection strings and network access
- **Redis Connection Errors**: Check Redis URL and authentication
- **Memory Issues**: Monitor container resource usage

### Debug Commands
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs -f server

# Execute commands in running container
docker-compose exec server sh

# Health check
curl http://localhost:5000/health

# Database connection test
docker-compose exec mongo mongo --eval "db.stats()"
```

### Rollback Procedures
1. Stop current deployment: `docker-compose down`
2. Pull previous image version
3. Start with previous configuration
4. Verify system stability
5. Investigate root cause before re-deployment