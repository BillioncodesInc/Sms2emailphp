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

# Create a wrapper script to keep Node.js running
cat > /usr/local/bin/start-backend.sh <<'BACKEND_SCRIPT'
#!/bin/bash
cd /var/www/html/backend
while true; do
    echo "Starting Node.js backend on port 9090..."
    node server/app.js
    exit_code=$?
    echo "Backend exited with code $exit_code. Restarting in 5 seconds..."
    sleep 5
done
BACKEND_SCRIPT

chmod +x /usr/local/bin/start-backend.sh

# Start Node.js backend in background with nohup
echo "Starting Node.js backend process..."
nohup /usr/local/bin/start-backend.sh > /var/www/html/logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..15}; do
    if curl -s http://localhost:9090/ > /dev/null 2>&1; then
        echo "✓ Backend started successfully and responding on port 9090"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "⚠ Backend taking longer than expected, but continuing..."
        echo "Check logs at /var/www/html/logs/backend.log"
    fi
    sleep 1
done

# Start Apache in foreground
echo "Starting Apache PHP frontend on port $PORT..."
cd /var/www/html
exec apache2-foreground
