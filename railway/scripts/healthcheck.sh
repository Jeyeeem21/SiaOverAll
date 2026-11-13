#!/bin/bash
# Health check all Railway services
# Usage: bash railway/scripts/healthcheck.sh

echo "==========================================="
echo " Health Check - All Services"
echo "==========================================="
echo ""

# Service URLs (update these after deployment)
BACKENDS=(
    "main-backend.railway.internal:8000"
    "staff-id-backend.railway.internal:8000"
    "print-backend.railway.internal:8000"
    "sticker-backend.railway.internal:8000"
    "account-backend.railway.internal:8000"
)

FRONTENDS=(
    "main-frontend.up.railway.app"
    "staff-id-frontend.up.railway.app"
    "print-frontend.up.railway.app"
    "sticker-frontend.up.railway.app"
    "account-frontend.up.railway.app"
)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

check_service() {
    local name=$1
    local url=$2
    
    printf "%-30s " "$name:"
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ unhealthy${NC}"
        return 1
    fi
}

echo "Backend Services (Internal):"
echo "----------------------------"
for backend in "${BACKENDS[@]}"; do
    service_name=$(echo "$backend" | cut -d'.' -f1)
    check_service "$service_name" "https://$backend/api/health"
done

echo ""
echo "Frontend Services (Public):"
echo "---------------------------"
for frontend in "${FRONTENDS[@]}"; do
    service_name=$(echo "$frontend" | cut -d'.' -f1)
    check_service "$service_name" "https://$frontend/health"
done

echo ""
echo "==========================================="
echo "Health check completed: $(date)"
echo "==========================================="
