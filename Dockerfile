# Dockerfile for SE Gateway - Combined Frontend (PHP) + Backend (Node.js)
# Both services run on the same instance

FROM php:8.1-apache

# Install system dependencies including Node.js
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install PHP dependencies (ignore errors if composer.json is minimal)
RUN composer install --no-dev --optimize-autoloader --no-interaction 2>/dev/null || true

# Install Node.js dependencies for backend
RUN cd backend && npm install --production

# Create logs and data directories
RUN mkdir -p logs backend/data && chmod 777 logs backend/data

# Enable Apache modules including proxy for backend API
RUN a2enmod rewrite headers proxy proxy_http

# Configure Apache for Render's PORT environment variable with proxy to Node.js backend
RUN echo 'Listen ${PORT:-8080}' > /etc/apache2/ports.conf && \
    echo '<VirtualHost *:${PORT:-8080}>\n\
    ServerAdmin webmaster@localhost\n\
    DocumentRoot /var/www/html\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
    \n\
    # Proxy API requests to Node.js backend on port 9090\n\
    ProxyPreserveHost On\n\
    ProxyPass /api http://localhost:9090/api\n\
    ProxyPassReverse /api http://localhost:9090/api\n\
    \n\
    <Directory /var/www/html>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
        DirectoryIndex index.php index.html\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Copy and setup startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Start both Apache and Node.js backend
CMD ["/usr/local/bin/docker-entrypoint.sh"]
