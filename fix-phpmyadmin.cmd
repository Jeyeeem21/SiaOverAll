@echo off
echo ============================================
echo FIX PHPMYADMIN ACCESS DENIED ERROR
echo ============================================
echo.
echo This script will:
echo 1. Stop all containers
echo 2. Remove ALL volumes (deletes all data!)
echo 3. Start fresh with default password
echo.
echo WARNING: This will delete all database data!
echo Press Ctrl+C to cancel, or
pause
echo.

echo Step 1: Stopping all containers...
docker compose down
if %ERRORLEVEL% NEQ 0 (
    echo Error stopping containers!
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 2: Listing all volumes...
docker volume ls
echo.

echo Step 3: Removing ALL project volumes...
docker compose down -v
echo Done!
echo.

echo Step 4: Double-check - manually remove mysql volume...
docker volume rm integrated-system_mysql_data 2>nul
docker volume rm siaoverall_mysql_data 2>nul
docker volume rm integ-sia_mysql_data 2>nul
echo.

echo Step 5: Prune unused volumes...
docker volume prune -f
echo.

echo Step 6: Starting containers fresh (this will take 2-3 minutes)...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo Error starting containers!
    pause
    exit /b 1
)
echo.

echo Step 7: Waiting for MySQL to initialize...
echo This takes about 2 minutes. Please wait...
echo.
timeout /t 30 /nobreak >nul
echo 30 seconds...
timeout /t 30 /nobreak >nul
echo 60 seconds...
timeout /t 30 /nobreak >nul
echo 90 seconds...
timeout /t 30 /nobreak >nul
echo 120 seconds...
echo.

echo Step 8: Checking container status...
docker compose ps
echo.

echo Step 9: Checking MySQL logs for "init process done"...
docker compose logs mysql | findstr "init process done"
echo.

echo ============================================
echo DONE! Now try accessing:
echo.
echo phpMyAdmin: http://localhost:8080
echo Username: root
echo Password: RootPass123
echo.
echo Main System: http://localhost:5173
echo ============================================
echo.
echo If phpMyAdmin still doesn't work:
echo 1. Wait another minute (MySQL might still be starting)
echo 2. Check logs: docker compose logs mysql
echo 3. Check if healthy: docker compose ps
echo.
echo After phpMyAdmin works, run: migrate-all.cmd
echo.
pause
