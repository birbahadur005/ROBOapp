# Multi-stage Dockerfile for RAVAN College Receptionist & Appointment System
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN cd server && npm install
RUN cd client && npm install

# Copy source codes
COPY server/ ./server/
COPY client/ ./client/

# Build client PWA
RUN cd client && npm run build

# Build server TypeScript & Prisma
RUN cd server && npx prisma generate && npm run build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev && npm install tsx prisma

# Copy built server and generated Prisma client
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma
COPY --from=builder /app/server/node_modules/@prisma ./server/node_modules/@prisma
COPY --from=builder /app/server/prisma ./server/prisma

# Copy built client static assets
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/client/dist ./server/public

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create private storage directory for photos and branding logos
RUN mkdir -p /app/uploads/visitor-photos /app/uploads/logos

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
