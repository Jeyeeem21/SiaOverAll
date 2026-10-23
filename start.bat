@echo off
title Student Account System - Startup
setlocal
set "ROOT=%~dp0"

echo ========================================
echo  Starting Student Account System...
echo ========================================

:: Kill any existing node processes on ports 3000-3003 to avoid conflicts
echo [0/2] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

timeout /t 1 /nobreak >nul

:: Start API Server (port 3002)
echo [1/2] Starting API Server on port 3002...
start "API Server :3002" /D "%ROOT%api-server" cmd /k npm start

echo Waiting for API server to become ready...
set "API_READY="
for /l %%i in (1,1,30) do (
    powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'http://localhost:3002/api/health' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
    if not errorlevel 1 (
        set "API_READY=1"
        goto :api_ready
    )
    timeout /t 1 /nobreak >nul
)

:api_ready
if not defined API_READY (
    echo.
    echo ERROR: API server did not respond on http://localhost:3002/api/health
    echo Check the API Server window for the startup error.
    pause
    exit /b 1
)

:: Start Frontend (port 3000)
echo [2/2] Starting Frontend on port 3000...
start "Frontend :3000" /D "%ROOT%frontend" cmd /k npm run dev

echo.
echo ========================================
echo  All services started!
echo  Frontend  : http://localhost:3000
echo  API Server: http://localhost:3002
echo ========================================
echo.
echo You can close this window.
pause
