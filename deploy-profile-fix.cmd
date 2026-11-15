@echo off
echo ========================================
echo Deploy Profile Fix to Railway Production
echo ========================================
echo.

echo Changes being deployed:
echo - Year Level field in Personal Info modal
echo - Better Photo/Signature upload UI
echo - Improved error handling
echo - Visual improvements
echo.

echo Step 1: Add files to git...
git add student_account_module/frontend/src/pages/DevProfile.jsx
git add staff_id_managament/backend/app/Http/Controllers/Api/StudentController.php
git add staff_id_managament/backend/routes/api.php

echo.
echo Step 2: Commit changes...
git commit -m "Fix: Profile form UI improvements, year_level field, and error handling"

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
echo - Student Account Frontend (UI improvements)
echo - ID Management Backend (error handling)
echo.
echo Expected changes:
echo 1. Year Level field now in Personal Info
echo 2. Better photo/signature upload layout
echo 3. Placeholder icons when no upload
echo 4. Better error messages
echo.
echo Wait 3-5 minutes then test on:
echo https://student-account-frontend-production.up.railway.app
echo.
echo Watch deployment progress at:
echo https://railway.app
echo.
pause
