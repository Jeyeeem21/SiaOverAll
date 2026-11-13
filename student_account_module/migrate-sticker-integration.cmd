@echo off
echo ===============================================
echo Running Sticker Integration Migrations
echo ===============================================

docker exec -it integrated-system-account-backend-1 php artisan migrate

echo.
echo ===============================================
echo Migrations Complete!
echo ===============================================
pause
