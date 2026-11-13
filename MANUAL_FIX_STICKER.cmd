@echo off
echo ============================================
echo   STICKER MODULE MANUAL FIX
echo ============================================
echo.

echo [1/5] Stopping sticker-frontend...
docker compose down sticker-frontend

echo.
echo [2/5] Removing cached volume...
docker volume rm integrated-system_sticker_node_modules

echo.
echo [3/5] Rebuilding image (this will take 2-3 minutes)...
docker compose build sticker-frontend --no-cache

echo.
echo [4/5] Starting fresh container...
docker compose up -d sticker-frontend

echo.
echo [5/5] Waiting for Vite to start...
timeout /t 15 /nobreak

echo.
echo ============================================
echo   CHECKING STATUS
echo ============================================
docker logs integrated-system-sticker-frontend-1 --tail 10

echo.
echo ============================================
echo   NEXT STEPS:
echo ============================================
echo 1. Close your browser tab completely
echo 2. Clear browser cache: Ctrl + Shift + Delete
echo 3. Open new tab to: http://localhost:5176
echo 4. Press Ctrl + Shift + R to hard refresh
echo.
echo If still not working, open Incognito window
echo and go to: http://localhost:5176
echo ============================================

pause
