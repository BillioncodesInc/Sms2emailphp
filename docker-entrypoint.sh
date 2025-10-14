#!/bin/bash
# Docker entrypoint script for SE Gateway
# Starts both Node.js backend and Apache PHP frontend

set -e

echo "========================================="
echo "SE Gateway - Starting Services"
echo "========================================="

# Set default port if not provided
export PORT=${PORT:-8080}
export NODE_PORT=${NODE_PORT:-9090}

# Update Apache port configuration
echo "Configuring Apache to listen on port $PORT..."
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/:80>/:$PORT>/g" /etc/apache2/sites-available/000-default.conf

# Start Node.js backend in background
echo "Starting Node.js backend on port $NODE_PORT..."
cd /var/www/html/backend
NODE_ENV=production PORT=$NODE_PORT node server/app.js > /var/log/node-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:$NODE_PORT/ > /dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Start Apache in foreground
echo "Starting Apache on port $PORT..."
cd /var/www/html

# Trap SIGTERM and SIGINT to gracefully shutdown
trap "echo 'Shutting down...'; kill $BACKEND_PID; apache2ctl stop; exit 0" SIGTERM SIGINT

# Start Apache
exec apache2-foreground
