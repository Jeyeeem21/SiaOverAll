#!/bin/bash
# Seed admin accounts for initial setup
# Usage: railway run --service main-backend bash railway/scripts/seed-admin.sh

set -e

echo "==========================================="
echo " Seeding Admin Accounts"
echo "==========================================="
echo ""

# Navigate to main backend
cd /workspace/main-system/laravel-backend

# Run admin seeder
php artisan db:seed --class=AdminSeeder --force

echo ""
echo "==========================================="
echo -e "\033[0;32m Admin accounts created successfully! \033[0m"
echo "==========================================="
echo ""
echo "Default Credentials:"
echo "-------------------"
echo "1. System Admin:"
echo "   Email: jmpagaran24@gmail.com"
echo "   Password: admin123"
echo ""
echo "2. Test Admin:"
echo "   Email: test@example.com"
echo "   Password: password"
echo ""
echo "3. Staff User:"
echo "   Email: staff@sia.com"
echo "   Password: staff123"
echo ""
echo -e "\033[1;33m⚠️  IMPORTANT: Change these passwords immediately in production!\033[0m"
echo ""
echo "To change password, login and update via the UI or run:"
echo "php artisan tinker"
echo "\$user = User::where('email', 'jmpagaran24@gmail.com')->first();"
echo "\$user->password = Hash::make('your-new-password');"
echo "\$user->save();"
echo ""
echo "==========================================="
