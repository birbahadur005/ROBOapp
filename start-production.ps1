# Automated Local Production Start Script for Windows
$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "RAVAN College Receptionist - Starting Production Server" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Build if needed
if (-not (Test-Path "server/dist/index.js")) {
    Write-Host "[1/3] Compiling server TypeScript..." -ForegroundColor Yellow
    npm.cmd --prefix server run build
}

if (-not (Test-Path "client/dist/index.html")) {
    Write-Host "[2/3] Compiling client PWA bundle..." -ForegroundColor Yellow
    npm.cmd --prefix client run build
}

# 2. Sync database
Write-Host "[3/3] Synchronizing database schema and default seeds..." -ForegroundColor Yellow
Set-Location server
npx.cmd prisma generate
npx.cmd prisma db push --skip-generate
npx.cmd tsx prisma/seed.ts
Set-Location ..

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "SERVER RUNNING!" -ForegroundColor Green
Write-Host "Open: http://localhost:5000" -ForegroundColor White
Write-Host "Visitor Kiosk: http://localhost:5000" -ForegroundColor White
Write-Host "Admin Login:   http://localhost:5000/admin/login (ADMIN-001 / Admin@123)" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

node server/dist/index.js
