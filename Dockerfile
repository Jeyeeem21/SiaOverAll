FROM php:8.2-fpm-alpine
RUN apk add --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libxml2-dev \
    oniguruma-dev \
 && docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp \
 && docker-php-ext-install -j"$(nproc)" pdo pdo_mysql bcmath gd
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY . .
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs
RUN chown -R www-data:www-data storage bootstrap/cache
CMD ["php-fpm"]
