#!/bin/bash
# Docker entrypoint script for SE Gateway
# Starts both Apache (PHP frontend) and Node.js (backend API)

set -e

echo "=========================================="
echo "SE Gateway - Combined Deployment"
echo "=========================================="

# Get the PORT from environment or default to 10000
# This is the public-facing port for Apache
export APACHE_PORT=${PORT:-10000}
echo "Apache will use PORT: $APACHE_PORT"

# Backend always uses port 9090 internally
export BACKEND_PORT=9090
echo "Backend will use PORT: $BACKEND_PORT"

# Create necessary directories
mkdir -p /var/www/html/backend/data
mkdir -p /var/www/html/logs
chmod 777 /var/www/html/backend/data
chmod 777 /var/www/html/logs

# Configure Apache with the actual PORT value at runtime
echo "Configuring Apache to listen on port $APACHE_PORT..."
cat > /etc/apache2/ports.conf <<EOF
Listen $APACHE_PORT
EOF

cat > /etc/apache2/sites-available/000-default.conf <<EOF
<VirtualHost *:$APACHE_PORT>
    ServerName _default_
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined

    # Proxy API requests to Node.js backend on port 9090
    ProxyPreserveHost On
    ProxyPass /api http://localhost:$BACKEND_PORT/api
    ProxyPassReverse /api http://localhost:$BACKEND_PORT/api

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php index.html
    </Directory>
</VirtualHost>
EOF

echo "✓ Apache configuration updated"

# Create a wrapper script to keep Node.js running
# IMPORTANT: Use BACKEND_PORT instead of PORT to avoid conflict with Apache
cat > /usr/local/bin/start-backend.sh <<BACKEND_SCRIPT
#!/bin/bash
cd /var/www/html/backend
export PORT=$BACKEND_PORT
while true; do
    echo "Starting Node.js backend on port \$PORT..."
    node server/app.js
    exit_code=\$?
    echo "Backend exited with code \$exit_code. Restarting in 5 seconds..."
    sleep 5
done
BACKEND_SCRIPT

chmod +x /usr/local/bin/start-backend.sh

# Start Node.js backend in background with nohup
echo "Starting Node.js backend process on port $BACKEND_PORT..."
nohup /usr/local/bin/start-backend.sh > /var/www/html/logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..15}; do
    if curl -s http://localhost:$BACKEND_PORT/ > /dev/null 2>&1; then
        echo "✓ Backend started successfully and responding on port $BACKEND_PORT"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "⚠ Backend taking longer than expected, but continuing..."
        echo "Check logs at /var/www/html/logs/backend.log"
    fi
    sleep 1
done

# Start Apache in foreground
echo "Starting Apache PHP frontend on port $APACHE_PORT..."
cd /var/www/html
exec apache2-foreground
