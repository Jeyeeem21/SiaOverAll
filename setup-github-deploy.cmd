@echo off
REM Quick setup script for GitHub automated deployment

echo ================================
echo GitHub Deployment Setup Wizard
echo ================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [ERROR] Git repository not initialized!
    echo Please run: git init
    pause
    exit /b 1
)

echo [1/5] Checking GitHub workflows...
if not exist ".github\workflows" (
    echo Creating .github\workflows directory...
    mkdir ".github\workflows"
)

echo [OK] GitHub Actions workflows are ready
echo.

echo [2/5] Checking Railway configuration...
if exist "railway.config.json" (
    echo [OK] Railway config found
) else (
    echo [WARNING] railway.config.json not found
)
echo.

echo [3/5] Verifying Dockerfiles...
set MISSING=0

if not exist "main-system\laravel-backend\Dockerfile.railway" (
    echo [MISSING] main-system\laravel-backend\Dockerfile.railway
    set MISSING=1
)
if not exist "main-system\react-frontend\Dockerfile.railway" (
    echo [MISSING] main-system\react-frontend\Dockerfile.railway
    set MISSING=1
)
if not exist "staff_id_managament\backend\Dockerfile.railway" (
    echo [MISSING] staff_id_managament\backend\Dockerfile.railway
    set MISSING=1
)
if not exist "staff_id_managament\frontend\Dockerfile.railway" (
    echo [MISSING] staff_id_managament\frontend\Dockerfile.railway
    set MISSING=1
)
if not exist "Student_print_module\backend\Dockerfile.railway" (
    echo [MISSING] Student_print_module\backend\Dockerfile.railway
    set MISSING=1
)
if not exist "Student_print_module\frontend\Dockerfile.railway" (
    echo [MISSING] Student_print_module\frontend\Dockerfile.railway
    set MISSING=1
)
if not exist "Staff_Sticker_module\backend\Dockerfile.railway" (
    echo [MISSING] Staff_Sticker_module\backend\Dockerfile.railway
    set MISSING=1
)
if not exist "Staff_Sticker_module\frontend\Dockerfile.railway" (
    echo [MISSING] Staff_Sticker_module\frontend\Dockerfile.railway
    set MISSING=1
)
if not exist "student_account_module\backend\Dockerfile.railway" (
    echo [MISSING] student_account_module\backend\Dockerfile.railway
    set MISSING=1
)
if not exist "student_account_module\frontend\Dockerfile.railway" (
    echo [MISSING] student_account_module\frontend\Dockerfile.railway
    set MISSING=1
)

if %MISSING%==1 (
    echo.
    echo [ERROR] Some Dockerfile.railway files are missing!
    echo Please ensure all services have Dockerfile.railway
    pause
    exit /b 1
) else (
    echo [OK] All Dockerfiles found
)
echo.

echo [4/5] Git Status Check...
git status --short
echo.

echo [5/5] Ready to commit and push!
echo.
echo ================================
echo Next Steps:
echo ================================
echo.
echo 1. Add Railway token to GitHub Secrets:
echo    - Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
echo    - Create secret named: RAILWAY_TOKEN
echo    - Get token from: https://railway.app/account/tokens
echo.
echo 2. Commit and push these changes:
echo    git add .
echo    git commit -m "Add GitHub Actions deployment workflows"
echo    git push origin main
echo.
echo 3. Monitor deployment:
echo    - GitHub: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
echo    - Railway: https://railway.app
echo.
echo 4. Read full documentation:
echo    - GITHUB_DEPLOY_SETUP.md (Railway)
echo    - ALTERNATIVE_DEPLOY_PLATFORMS.md (Other platforms)
echo.
echo ================================

pause
