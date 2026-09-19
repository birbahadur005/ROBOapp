#!/bin/bash
set -e

echo "========================================================"
echo "RAVAN College Receptionist - Starting Production Server"
echo "========================================================"

# 1. Build if not built
if [ ! -f "server/dist/index.js" ]; then
    echo "[1/3] Compiling server TypeScript..."
    npm --prefix server run build
fi

if [ ! -f "client/dist/index.html" ]; then
    echo "[2/3] Compiling client PWA bundle..."
    npm --prefix client run build
fi

# 2. Database Sync
echo "[3/3] Synchronizing database schema and default seeds..."
cd server
npx prisma generate
npx prisma db push --skip-generate
npx tsx prisma/seed.ts
cd ..

echo ""
echo "========================================================"
echo "SERVER RUNNING!"
echo "Open: http://localhost:5000"
echo "Admin Login: http://localhost:5000/admin/login (ADMIN-001 / Admin@123)"
echo "========================================================"

node server/dist/index.js
