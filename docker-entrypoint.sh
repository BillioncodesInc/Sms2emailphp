#!/bin/bash
# Docker entrypoint script for SE Gateway
# Starts both Apache (PHP frontend) and Node.js (backend API)

set -e

echo "=========================================="
echo "SE Gateway - Combined Deployment"
echo "=========================================="

# Create necessary directories
mkdir -p /var/www/html/backend/data
mkdir -p /var/www/html/logs
chmod 777 /var/www/html/backend/data
chmod 777 /var/www/html/logs

# Start Node.js backend in background
echo "Starting Node.js backend on port 9090..."
cd /var/www/html/backend
node server/app.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✓ Backend started successfully (PID: $BACKEND_PID)"
else
    echo "✗ Backend failed to start"
    exit 1
fi

# Start Apache in foreground
echo "Starting Apache PHP frontend on port ${PORT:-8080}..."
cd /var/www/html
exec apache2-foreground
