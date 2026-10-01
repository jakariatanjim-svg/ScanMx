@echo off
echo ========================================
echo  ScanMx - GitHub Setup Script
echo ========================================
echo.

echo Checking Git status...
git status
echo.

echo Current commits to push:
git log --oneline -5
echo.

echo ========================================
echo  STEP 1: Create Repository on GitHub
echo ========================================
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: ScanMx
echo 3. Choose Public or Private
echo 4. Check "Add a README file"
echo 5. Click "Create repository"
echo.
pause

echo ========================================
echo  STEP 2: Connect to GitHub
echo ========================================
echo.
set /p repo_url="Enter your repository URL (e.g., https://github.com/YOUR_USERNAME/ScanMx.git): "
echo.

echo Setting up remote...
git remote add origin %repo_url%
echo.

echo Pushing to GitHub...
git push -u origin main
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Visit your repository at: %repo_url%
echo.
pause
