#!/bin/sh
set -e

echo "========================================================"
echo "Starting RAVAN College Receptionist & Visitor App..."
echo "========================================================"

cd /app/server

# Apply database schema
echo "Applying database schema migrations with Prisma..."
npx prisma db push --skip-generate || true

# Seed default accounts (ADMIN-001, DIRECTOR-001, etc.) if needed
echo "Seeding initial accounts and departments if not present..."
npx tsx prisma/seed.ts || true

# Start Node.js production server
echo "Starting server process on port ${PORT:-5000}..."
exec node dist/index.js
