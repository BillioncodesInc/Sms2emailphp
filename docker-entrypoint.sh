#!/bin/bash
# Docker entrypoint script for SE Gateway
# Starts both Apache (PHP frontend) and Node.js (backend API)

set -e

echo "=========================================="
echo "SE Gateway - Combined Deployment"
echo "=========================================="

# Get the PORT from environment or default to 10000
export PORT=${PORT:-10000}
echo "Using PORT: $PORT"

# Create necessary directories
mkdir -p /var/www/html/backend/data
mkdir -p /var/www/html/logs
chmod 777 /var/www/html/backend/data
chmod 777 /var/www/html/logs

# Configure Apache with the actual PORT value at runtime
echo "Configuring Apache to listen on port $PORT..."
cat > /etc/apache2/ports.conf <<EOF
Listen $PORT
EOF

cat > /etc/apache2/sites-available/000-default.conf <<EOF
<VirtualHost *:$PORT>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined

    # Proxy API requests to Node.js backend on port 9090
    ProxyPreserveHost On
    ProxyPass /api http://localhost:9090/api
    ProxyPassReverse /api http://localhost:9090/api

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php index.html
    </Directory>
</VirtualHost>
EOF

echo "✓ Apache configuration updated"

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
echo "Starting Apache PHP frontend on port $PORT..."
cd /var/www/html
exec apache2-foreground
