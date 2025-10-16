# Dockerfile for SE Gateway - Combined Frontend (PHP) + Backend (Node.js)
# Both services run on the same instance

FROM php:8.1-apache

# Install system dependencies including Node.js, Chromium for puppeteer
# Note: IMAP support is handled by the Node.js 'imap' package (no system libs needed)
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    gnupg \
    ca-certificates \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    # Additional utilities
    git \
    procps \
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
# Skip Chromium download for puppeteer to save memory and time
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN cd backend && npm install --production --no-optional \
    && npm cache clean --force

# Create logs and data directories with subdirectories
RUN mkdir -p logs \
    backend/data/campaigns \
    backend/data/attachments \
    backend/data/smtp_profiles \
    backend/data/smtp_warmup \
    && chmod -R 777 logs backend/data

# Enable Apache modules including proxy for backend API and WebSocket support
RUN a2enmod rewrite headers proxy proxy_http proxy_wstunnel

# Set proper permissions
# Note: Apache configuration is done at runtime in docker-entrypoint.sh
# This allows the PORT environment variable to be properly set
RUN chown -R www-data:www-data /var/www/html

# Copy and setup startup scripts
COPY docker-entrypoint.sh /usr/local/bin/
COPY start-backend.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /usr/local/bin/start-backend.sh

# Expose port
EXPOSE 8080

# Start both Apache and Node.js backend
CMD ["/usr/local/bin/docker-entrypoint.sh"]
