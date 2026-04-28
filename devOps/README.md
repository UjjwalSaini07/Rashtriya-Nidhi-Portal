# DevOps Configuration

This folder contains all DevOps-related configurations for the Rashtriya Nidhi Portal project.

## Files

- `nginx.conf`: Nginx reverse proxy configuration for production
- `mongo-init.js`: MongoDB initialization script
- `deploy.sh`: Deployment script for remote servers
- `docker-compose.monitoring.yml`: Docker Compose for monitoring stack (Prometheus + Grafana)
- `prometheus.yml`: Prometheus configuration for monitoring

## Usage

### Deployment

1. Set environment variables:
   ```bash
   export SERVER_HOST=your-server.com
   export SERVER_USER=deploy
   ```

2. Run deployment:
   ```bash
   chmod +x devOps/deploy.sh
   ./devOps/deploy.sh production
   ```

### Monitoring

Start monitoring stack:
```bash
docker-compose -f devOps/docker-compose.monitoring.yml up -d
```

Access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/changeme_now)

### CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml`

## Security

- Change default passwords in all configurations
- Use secrets for sensitive data in CI/CD
- Review nginx configuration for your security requirements