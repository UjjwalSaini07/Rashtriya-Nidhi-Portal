# Usage: ./deploy.sh [environment]
ENVIRONMENT=${1:-production}
SERVER_HOST=${SERVER_HOST:-your-server.com}
SERVER_USER=${SERVER_USER:-deploy}

echo "Deploying to $ENVIRONMENT environment on $SERVER_HOST"

# Copy files to server
scp docker-compose.yml $SERVER_USER@$SERVER_HOST:/opt/rnp/
scp -r devOps/ $SERVER_USER@$SERVER_HOST:/opt/rnp/devOps/

# Run deployment commands on server
ssh $SERVER_USER@$SERVER_HOST << EOF
  cd /opt/rnp
  docker-compose pull
  docker-compose up -d
  docker-compose logs -f --tail=50
EOF

echo "Deployment completed"