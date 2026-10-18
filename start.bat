@echo off
title Student Account System - Startup

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
start "API Server :3002" cmd /k "cd /d C:\Users\Aldrin\Desktop\student_account\api-server && node server.js"

timeout /t 2 /nobreak >nul

:: Start Frontend (port 3000)
echo [2/2] Starting Frontend on port 3000...
start "Frontend :3000" cmd /k "cd /d C:\Users\Aldrin\Desktop\student_account\frontend && npm run dev"

echo.
echo ========================================
echo  All services started!
echo  Frontend  : http://localhost:3000
echo  API Server: http://localhost:3002
echo ========================================
echo.
echo You can close this window.
pause
