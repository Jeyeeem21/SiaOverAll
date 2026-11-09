@echo off
echo ========================================
echo  Student Account Module - Clean Rebuild
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Stopping any running dev server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo [2/4] Cleaning cache and build folders...
if exist ".vite" rd /s /q ".vite"
if exist "dist" rd /s /q "dist"
if exist "node_modules\.vite" rd /s /q "node_modules\.vite"
echo Done!

echo [3/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo [4/4] Starting development server...
echo.
echo ========================================
echo  Server starting...
echo  Press Ctrl+C to stop
echo ========================================
echo.
call npm run dev

pause
