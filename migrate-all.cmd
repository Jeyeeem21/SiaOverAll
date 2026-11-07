@echo off
REM Migration script for Integrated System
REM Runs all migrations in the correct order to avoid conflicts

echo ========================================
echo  Integrated System - Database Migration
echo ========================================
echo.

REM Check if containers are running
echo [1/6] Checking if containers are running...
docker compose ps | findstr "mysql" >nul
if errorlevel 1 (
    echo ERROR: MySQL container is not running!
    echo Please run: docker compose up -d
    exit /b 1
)
echo     MySQL is running!
echo.

REM Wait for MySQL to be healthy
echo [2/6] Waiting for MySQL to be healthy...
timeout /t 5 /nobreak >nul
echo     MySQL is ready!
echo.

REM Wait for backends to install composer dependencies
echo     Waiting for backends to finish composer install...
echo     This may take 2-3 minutes on first run...
timeout /t 60 /nobreak >nul
echo     Backends should be ready!
echo.

REM Main System - Creates all base tables and core business logic
echo [3/6] Running Main System migrations...
echo     - Base tables: users, cache, jobs, sessions
echo     - Business tables: products, orders, payments, staff_info
echo     - Rental management tables
echo     - Toga department tables
docker compose exec -T main-backend php artisan migrate --force
if errorlevel 1 (
    echo ERROR: Main System migration failed!
    exit /b 1
)
echo     Main System migrations completed!
echo.

REM Staff ID Management Module - Staff and Student ID cards
echo [4/6] Running Staff ID Management migrations...
echo     - staff_id_cards, students, student_id_cards
docker compose exec -T staff-id-backend php artisan migrate --force
if errorlevel 1 (
    echo ERROR: Staff ID Management migration failed!
    exit /b 1
)
echo     Staff ID migrations completed!
echo.

REM Student Account Module - Student accounts and transactions
echo [5/6] Running Student Account Module migrations...
echo     - account_students, student_verifications
echo     - orders, order_items (student), transactions
docker compose exec -T account-backend php artisan migrate --force
if errorlevel 1 (
    echo ERROR: Student Account migration failed!
    exit /b 1
)
echo     Student Account migrations completed!
echo.

REM Print Module - Print orders and pricing
echo [6/6] Running Print Module migrations...
echo     - print_orders, print_order_files
echo     - print_order_status_history, print_pricing_config
docker compose exec -T print-backend php artisan migrate --force
if errorlevel 1 (
    echo ERROR: Print Module migration failed!
    exit /b 1
)
echo     Print Module migrations completed!
echo.

REM Sticker Module (if needed)
REM echo [7/7] Running Sticker Module migrations...
REM docker compose exec -T sticker-backend php artisan migrate --force

echo ========================================
echo  All migrations completed successfully!
echo ========================================
echo.
echo You can now verify the database structure:
echo   docker compose exec mysql mysql -u root -pRootPass123 business_center -e "SHOW TABLES;"
echo.
