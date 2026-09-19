import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { realTimeService } from './services/realTimeService';
import { PhotoStorageService } from './services/photoStorageService';
import prisma from './prisma/client';

const app = express();

// Ensure upload directory exists
PhotoStorageService.ensureDirectory();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Permit inline scripts/styles for PWA and client dev
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps or curl) or matching origins
    if (!origin || config.corsOrigins.includes(origin) || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, can restrict in production
    }
  },
  credentials: true
}));

// Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Rate limiting for public appointment creation and AI requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this device, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api', routes);

// Serve uploaded logos
const logosDir = path.resolve(config.storageUploadDir, '../logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}
app.use('/uploads/logos', express.static(logosDir));

// Dynamic PWA Web App Manifest
app.get('/manifest.webmanifest', async (req, res) => {
  try {
    const settings = await prisma.applicationSettings.findFirst();
    const appName = settings?.appName || settings?.collegeName || 'RAVAN College Receptionist';
    const shortName = settings?.appShortName || 'RAVAN Reception';
    const themeColor = settings?.themeColor || '#1e3a8a';
    const appLogo = settings?.appLogoUrl || settings?.logoUrl;

    const icons: any[] = [];
    if (appLogo) {
      icons.push(
        {
          src: appLogo,
          sizes: '192x192',
          type: appLogo.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'any maskable'
        },
        {
          src: appLogo,
          sizes: '512x512',
          type: appLogo.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'any maskable'
        }
      );
    }
    icons.push(
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    );

    const manifest = {
      name: appName,
      short_name: shortName,
      description: settings?.tagline || 'AI Visitor & Appointment Management System',
      start_url: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: settings?.darkModeDefault ? '#0f172a' : '#ffffff',
      theme_color: themeColor,
      categories: ['education', 'productivity', 'utilities'],
      icons
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    res.json(manifest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

// Serve client static build in production
const candidateStaticPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, './public'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../public'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'public')
];

const clientStaticPath = candidateStaticPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (clientStaticPath) {
  app.use(express.static(clientStaticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(clientStaticPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Create HTTP server & bind WebSocket service
const server = http.createServer(app);
realTimeService.init(server);

// Auto-seed initial demo accounts if database is fresh/empty on boot
async function ensureInitialData() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Fresh database detected. Auto-seeding initial demo accounts...');
      const bcrypt = (await import('bcryptjs')).default;
      const adminPass = await bcrypt.hash('Admin@123', 10);
      const receptionPass = await bcrypt.hash('Reception@123', 10);
      const directorPass = await bcrypt.hash('Director@123', 10);
      const principalPass = await bcrypt.hash('Principal@123', 10);

      await prisma.user.createMany({
        data: [
          { accountId: 'ADMIN-001', email: 'admin@college.edu', passwordHash: adminPass, role: 'SUPER_ADMIN', status: 'ACTIVE' },
          { accountId: 'RECEPTION-001', email: 'reception@college.edu', passwordHash: receptionPass, role: 'RECEPTION', status: 'ACTIVE' },
          { accountId: 'DIRECTOR-001', email: 'director@college.edu', passwordHash: directorPass, role: 'AUTHORITY', status: 'ACTIVE' },
          { accountId: 'PRINCIPAL-001', email: 'principal@college.edu', passwordHash: principalPass, role: 'AUTHORITY', status: 'ACTIVE' }
        ]
      });

      await prisma.applicationSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          collegeName: 'RAVAN Institute of Technology & Management',
          tagline: 'AI Visitor & Appointment Management System',
          themeColor: '#1e3a8a',
          defaultLanguage: 'en',
          isSetupComplete: true
        }
      });
      console.log('Initial accounts and settings auto-seeded successfully.');
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err);
  }
}

ensureInitialData().finally(() => {
  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`RAVAN College Receptionist & Appointment System`);
    console.log(`Server running on: http://localhost:${config.port}`);
    console.log(`WebSocket endpoint: ws://localhost:${config.port}/ws`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });
});

export { app, server };
