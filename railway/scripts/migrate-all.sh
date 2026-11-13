#!/bin/bash
# Run all database migrations in correct order for Railway deployment
# Usage: railway run bash railway/scripts/migrate-all.sh

set -e

echo "==========================================="
echo " Railway Migration - All Services"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in Railway environment
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    echo -e "${YELLOW}Warning: Not running in Railway environment${NC}"
fi

# Function to run migration
run_migration() {
    local service=$1
    local path=$2
    
    echo -e "\n${YELLOW}[$(date +'%H:%M:%S')] Migrating: $service${NC}"
    
    if [ ! -d "$path" ]; then
        echo -e "${RED}✗${NC} Directory not found: $path"
        return 1
    fi
    
    cd "$path"
    
    if php artisan migrate --force; then
        echo -e "${GREEN}✓${NC} $service migration completed"
        return 0
    else
        echo -e "${RED}✗${NC} $service migration failed!"
        return 1
    fi
}

# 1. Main System (creates base tables: users, products, orders, etc.)
run_migration "Main System" "/workspace/main-system/laravel-backend" || exit 1

# 2. Staff ID Management (staff_id_cards, students, student_id_cards)
run_migration "Staff ID Management" "/workspace/staff_id_managament/backend" || exit 1

# 3. Student Account (account_students, verifications, sticker dependencies)
run_migration "Student Account" "/workspace/student_account_module/backend" || exit 1

# 4. Print Module (print_orders, print_order_files, print_pricing_config)
run_migration "Print Module" "/workspace/Student_print_module/backend" || exit 1

# 5. Sticker Module (optional, may use account backend tables)
run_migration "Sticker Module" "/workspace/Staff_Sticker_module/backend" || echo -e "${YELLOW}⚠${NC} Sticker migration skipped (may use account backend)"

echo ""
echo "==========================================="
echo -e "${GREEN} All migrations completed successfully! ${NC}"
echo "==========================================="
echo ""
echo "Database: $DB_DATABASE"
echo "Host: $DB_HOST"
echo "Timestamp: $(date)"
echo ""
