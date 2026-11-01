# Laravel Backend Dockerfile
FROM php:8.3-fpm

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www

# Create necessary directories if they don't exist
RUN mkdir -p /var/www/storage/framework/cache/data \
    && mkdir -p /var/www/storage/framework/sessions \
    && mkdir -p /var/www/storage/framework/views \
    && mkdir -p /var/www/storage/framework/testing \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/storage/app/public \
    && mkdir -p /var/www/bootstrap/cache

# Set ownership and permissions
RUN chown -R www-data:www-data /var/www \
    && find /var/www/storage -type f -exec chmod 664 {} \; \
    && find /var/www/storage -type d -exec chmod 775 {} \; \
    && find /var/www/bootstrap/cache -type f -exec chmod 664 {} \; \
    && find /var/www/bootstrap/cache -type d -exec chmod 775 {} \;

# Install dependencies
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Expose port 9000 for PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
