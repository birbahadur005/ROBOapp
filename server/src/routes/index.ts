import { Router } from 'express';
import authRoutes from './authRoutes';
import appointmentRoutes from './appointmentRoutes';
import authorityRoutes from './authorityRoutes';
import adminRoutes from './adminRoutes';
import collegeRoutes from './collegeRoutes';
import aiRoutes from './aiRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/authorities', authorityRoutes);
router.use('/admin', adminRoutes);
router.use('/college', collegeRoutes);
router.use('/ai', aiRoutes);

// Health check endpoint (Phase 0 Acceptance test)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'RAVAN College Receptionist API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
