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

# Create necessary directories and subdirectories
mkdir -p /var/www/html/backend/data/campaigns
mkdir -p /var/www/html/backend/data/attachments
mkdir -p /var/www/html/backend/data/smtp_profiles
mkdir -p /var/www/html/backend/data/smtp_warmup
mkdir -p /var/www/html/logs
chmod -R 777 /var/www/html/backend/data
chmod -R 777 /var/www/html/logs

# Configure Apache with the actual PORT value at runtime
echo "Configuring Apache to listen on port $APACHE_PORT..."

# Set global ServerName to suppress warning
echo "ServerName localhost" >> /etc/apache2/apache2.conf

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

    # Proxy WebSocket connections for real-time features
    # Combo validator WebSocket
    ProxyPass /ws/combo ws://localhost:$BACKEND_PORT/ws/combo
    ProxyPassReverse /ws/combo ws://localhost:$BACKEND_PORT/ws/combo

    # Inbox searcher WebSocket
    ProxyPass /ws/inbox ws://localhost:$BACKEND_PORT/ws/inbox
    ProxyPassReverse /ws/inbox ws://localhost:$BACKEND_PORT/ws/inbox

    # Cookie inbox WebSocket
    ProxyPass /ws/cookie-inbox ws://localhost:$BACKEND_PORT/ws/cookie-inbox
    ProxyPassReverse /ws/cookie-inbox ws://localhost:$BACKEND_PORT/ws/cookie-inbox

    # Contact extractor WebSocket
    ProxyPass /ws/contacts ws://localhost:$BACKEND_PORT/ws/contacts
    ProxyPassReverse /ws/contacts ws://localhost:$BACKEND_PORT/ws/contacts

    # Debounce WebSocket
    ProxyPass /ws/debounce ws://localhost:$BACKEND_PORT/ws/debounce
    ProxyPassReverse /ws/debounce ws://localhost:$BACKEND_PORT/ws/debounce

    # Redirector WebSocket
    ProxyPass /ws/redirector ws://localhost:$BACKEND_PORT/ws/redirector
    ProxyPassReverse /ws/redirector ws://localhost:$BACKEND_PORT/ws/redirector

    # Email Campaign WebSocket (CRITICAL - for email campaign real-time updates)
    ProxyPass /ws/email-campaign ws://localhost:$BACKEND_PORT/ws/email-campaign
    ProxyPassReverse /ws/email-campaign ws://localhost:$BACKEND_PORT/ws/email-campaign

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
# Use 'tee' to send logs to both stdout (visible in Render) and log file
echo "Starting Node.js backend process on port $BACKEND_PORT..."
cd /var/www/html/backend
export PORT=$BACKEND_PORT
node server/app.js 2>&1 | tee /var/www/html/logs/backend.log &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to respond..."
backend_ready=false
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/ > /dev/null 2>&1; then
        echo "✓ Backend is responding on port $BACKEND_PORT"
        backend_ready=true
        break
    fi
    echo "  Attempt $i/30: Backend not ready yet..."
    sleep 2
done

if [ "$backend_ready" = false ]; then
    echo "⚠ Backend did not respond after 60 seconds"
    echo "Backend logs (last 50 lines):"
    tail -n 50 /var/www/html/logs/backend.log || echo "No backend logs available"
    echo "Continuing anyway - check /var/www/html/logs/backend.log for errors"
fi

# Start Apache in foreground
echo "Starting Apache PHP frontend on port $APACHE_PORT..."
cd /var/www/html
exec apache2-foreground
