#!/bin/bash
# Build script for Render.com deployment
# This runs during the build phase before the app starts

set -e

echo "========================================="
echo "SE Gateway - Build Script"
echo "========================================="

# Print environment info
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo "PHP version: $(php -v | head -n 1)"

# Install Composer if not present
if ! command -v composer &> /dev/null; then
    echo "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

echo "Composer version: $(composer --version)"

# Install PHP dependencies
echo ""
echo "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Install Node.js dependencies
echo ""
echo "Installing Node.js dependencies..."
cd backend
npm ci --only=production

# Create required directories
echo ""
echo "Creating required directories..."
cd ..
mkdir -p logs
chmod 755 logs

echo ""
echo "========================================="
echo "Build completed successfully!"
echo "========================================="
