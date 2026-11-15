@echo off
echo ========================================
echo Deploy Profile Fix to Railway Production
echo ========================================
echo.

echo Files to be deployed:
echo - DevProfile.jsx (Year Level + Photo upload)
echo - StudentController.php (updatePhoto method)
echo - api.php (new route)
echo.

echo Step 1: Add files to git...
git add student_account_module/frontend/src/pages/DevProfile.jsx
git add staff_id_managament/backend/app/Http/Controllers/Api/StudentController.php
git add staff_id_managament/backend/routes/api.php

echo.
echo Step 2: Commit changes...
git commit -m "Fix: Add year_level to profile form and photo/signature upload endpoints"

echo.
echo Step 3: Push to GitHub (Railway will auto-deploy)...
git push origin main

echo.
echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo Railway is now deploying your changes...
echo.
echo Services being deployed:
echo - Student Account Frontend (profile form updates)
echo - ID Management Backend (photo upload endpoint)
echo.
echo Wait 3-5 minutes then test on:
echo https://student-account-frontend-production.up.railway.app
echo.
echo Watch deployment progress at:
echo https://railway.app
echo.
pause
