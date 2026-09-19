@echo off
title RAVAN College Receptionist - Local Server
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ========================================================
echo Starting RAVAN College Receptionist on Localhost...
echo ========================================================
echo.
echo  Local URL:   http://localhost:5000
echo  Admin Login: http://localhost:5000/admin/login
echo.
echo ========================================================
node server\dist\index.js
pause
