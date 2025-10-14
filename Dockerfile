# Dockerfile for SE Gateway Frontend (PHP only)
# Backend Node.js runs as a separate service on Render

FROM php:8.1-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
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

# Create logs directory
RUN mkdir -p logs && chmod 777 logs

# Enable Apache modules
RUN a2enmod rewrite headers

# Configure Apache for Render's PORT environment variable
RUN echo 'Listen ${PORT:-8080}' > /etc/apache2/ports.conf && \
    echo '<VirtualHost *:${PORT:-8080}>\n\
    ServerAdmin webmaster@localhost\n\
    DocumentRoot /var/www/html\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
    <Directory /var/www/html>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
        DirectoryIndex index.php index.html\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port
EXPOSE 8080

# Start Apache
CMD ["apache2-foreground"]
