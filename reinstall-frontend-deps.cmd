@echo off
echo ============================================
echo Reinstalling Frontend Dependencies
echo ============================================
echo.

echo Stopping frontend containers...
docker compose stop print-frontend staff-id-frontend sticker-frontend account-frontend

echo.
echo Removing node_modules volumes...
docker volume rm integrated-system_print_node_modules
docker volume rm integrated-system_staff_id_node_modules
docker volume rm integrated-system_sticker_node_modules
docker volume rm integrated-system_account_node_modules

echo.
echo Starting frontend containers (will reinstall dependencies)...
docker compose up -d print-frontend staff-id-frontend sticker-frontend account-frontend

echo.
echo ============================================
echo Done! Containers are starting up...
echo Dependencies will be installed automatically.
echo Check logs with: docker compose logs -f [container-name]
echo ============================================
pause
