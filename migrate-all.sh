#!/bin/bash
# Migration script for Integrated System
# Runs all migrations in the correct order to avoid conflicts

echo "========================================"
echo " Integrated System - Database Migration"
echo "========================================"
echo ""

# Check if containers are running
echo "[1/6] Checking if containers are running..."
if ! docker compose ps | grep -q "mysql.*healthy"; then
    echo "ERROR: MySQL container is not running or not healthy!"
    echo "Please run: docker compose up -d"
    exit 1
fi
echo "    ✓ MySQL is running!"
echo ""

# Wait for MySQL to be healthy
echo "[2/6] Waiting for MySQL to be healthy..."
sleep 5
echo "    ✓ MySQL is ready!"
echo ""

# Main System - Creates all base tables and core business logic
echo "[3/6] Running Main System migrations..."
echo "    - Base tables: users, cache, jobs, sessions"
echo "    - Business tables: products, orders, payments, staff_info"
echo "    - Rental management tables"
echo "    - Toga department tables"
if ! docker compose exec -T main-backend php artisan migrate --force; then
    echo "ERROR: Main System migration failed!"
    exit 1
fi
echo "    ✓ Main System migrations completed!"
echo ""

# Staff ID Management Module - Staff and Student ID cards
echo "[4/6] Running Staff ID Management migrations..."
echo "    - staff_id_cards, students, student_id_cards"
if ! docker compose exec -T staff-id-backend php artisan migrate --force; then
    echo "ERROR: Staff ID Management migration failed!"
    exit 1
fi
echo "    ✓ Staff ID migrations completed!"
echo ""

# Student Account Module - Student accounts and transactions
echo "[5/6] Running Student Account Module migrations..."
echo "    - account_students, student_verifications"
echo "    - orders, order_items (student), transactions"
if ! docker compose exec -T account-backend php artisan migrate --force; then
    echo "ERROR: Student Account migration failed!"
    exit 1
fi
echo "    ✓ Student Account migrations completed!"
echo ""

# Print Module - Print orders and pricing
echo "[6/6] Running Print Module migrations..."
echo "    - print_orders, print_order_files"
echo "    - print_order_status_history, print_pricing_config"
if ! docker compose exec -T print-backend php artisan migrate --force; then
    echo "ERROR: Print Module migration failed!"
    exit 1
fi
echo "    ✓ Print Module migrations completed!"
echo ""

# Sticker Module (if needed)
# echo "[7/7] Running Sticker Module migrations..."
# docker compose exec -T sticker-backend php artisan migrate --force

echo "========================================"
echo " All migrations completed successfully!"
echo "========================================"
echo ""
echo "You can now verify the database structure:"
echo "  docker compose exec mysql mysql -u root -pRootPass123 business_center -e 'SHOW TABLES;'"
echo ""
