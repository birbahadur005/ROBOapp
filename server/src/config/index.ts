import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5000').split(','),
  jwtSecret: process.env.JWT_SECRET || 'ravan-default-jwt-secret-min-32-chars-2026',
  sessionSecret: process.env.SESSION_SECRET || 'ravan-default-session-secret-2026',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  storageUploadDir: path.resolve(__dirname, process.env.STORAGE_UPLOAD_DIR || '../../uploads/visitor-photos'),
  defaultCollegeName: process.env.DEFAULT_COLLEGE_NAME || 'RAVAN Institute of Technology & Management',
  defaultTagline: process.env.DEFAULT_COLLEGE_TAGLINE || 'AI Visitor & Appointment Management System',
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en'
};
