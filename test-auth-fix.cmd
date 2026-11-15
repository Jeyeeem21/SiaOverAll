@echo off
echo ========================================
echo Testing Cross-Backend Authentication Fix
echo ========================================
echo.

echo Checking if all backends have the same APP_KEY...
echo.

set "EXPECTED_KEY=base64:hOGE8v7lZLGl9bopp3rCy0oN/x6yNCaGqnSp8Iavpuo="
set "ALL_MATCH=true"

echo [1/5] Checking main-system backend...
findstr /C:"APP_KEY=%EXPECTED_KEY%" "main-system\laravel-backend\.env" >nul
if %errorlevel% equ 0 (
    echo     ✓ MATCH
) else (
    echo     ✗ DIFFERENT
    set "ALL_MATCH=false"
)

echo [2/5] Checking staff-id backend...
findstr /C:"APP_KEY=%EXPECTED_KEY%" "staff_id_managament\backend\.env" >nul
if %errorlevel% equ 0 (
    echo     ✓ MATCH
) else (
    echo     ✗ DIFFERENT
    set "ALL_MATCH=false"
)

echo [3/5] Checking print backend...
findstr /C:"APP_KEY=%EXPECTED_KEY%" "Student_print_module\backend\.env" >nul
if %errorlevel% equ 0 (
    echo     ✓ MATCH
) else (
    echo     ✗ DIFFERENT
    set "ALL_MATCH=false"
)

echo [4/5] Checking sticker backend...
findstr /C:"APP_KEY=%EXPECTED_KEY%" "Staff_Sticker_module\backend\.env" >nul
if %errorlevel% equ 0 (
    echo     ✓ MATCH
) else (
    echo     ✗ DIFFERENT
    set "ALL_MATCH=false"
)

echo [5/5] Checking account backend...
findstr /C:"APP_KEY=%EXPECTED_KEY%" "student_account_module\backend\.env" >nul
if %errorlevel% equ 0 (
    echo     ✓ MATCH
) else (
    echo     ✗ DIFFERENT
    set "ALL_MATCH=false"
)

echo.
echo ========================================
if "%ALL_MATCH%"=="true" (
    echo ✓ SUCCESS: All backends use the same APP_KEY
    echo.
    echo Next steps:
    echo 1. Restart Docker: docker compose down ^&^& docker compose up -d
    echo 2. Test at http://localhost:5173
    echo 3. Update Railway APP_KEY variables ^(see RAILWAY_APP_KEY_UPDATE.md^)
) else (
    echo ✗ FAILED: Some backends have different APP_KEY
    echo Please check the .env files manually
)
echo ========================================
echo.
pause
