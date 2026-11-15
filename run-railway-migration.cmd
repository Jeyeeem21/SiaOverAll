@echo off
echo ========================================
echo Run Migration on Railway Production
echo ========================================
echo.
echo This will add photo_path and signature_path columns
echo to the account_students table in Railway database.
echo.
echo Make sure Railway CLI is installed:
echo npm i -g @railway/cli
echo.
pause

echo.
echo Step 1: Login to Railway...
railway login

echo.
echo Step 2: Link to your project...
railway link

echo.
echo Step 3: Select ID Management Backend service...
echo (You'll be prompted to select the service)
echo.

echo Step 4: Run migrations...
railway run php artisan migrate --force

echo.
echo ========================================
echo Migration Complete!
========================================
echo.
echo The following columns should now exist:
echo - account_students.photo_path
echo - account_students.signature_path
echo.
echo Now test signature upload on production:
echo https://student-account-frontend-production.up.railway.app
echo.
pause
