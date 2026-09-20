import { Router } from 'express';
import multer from 'multer';
import { AdminController } from '../controllers/adminController';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public setup & department directory
router.get('/setup-status', AdminController.getSetupStatus);
router.post('/setup', AdminController.completeSetupWizard);
router.get('/settings', AdminController.getSettings);
router.get('/departments', AdminController.listDepartments);

// Protected Admin Routes
router.use(authenticate);
router.use(requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']));

router.patch('/settings', AdminController.updateSettings);
router.post('/upload-logo', upload.single('logo'), AdminController.uploadLogo);
router.get('/analytics', AdminController.getAnalytics);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/export-csv', AdminController.exportAppointmentsCsv);

// Department management
router.post('/departments', AdminController.createDepartment);
router.patch('/departments/:id', AdminController.updateDepartment);
router.delete('/departments/:id', AdminController.deleteDepartment);

// Authority management
router.post('/authorities', AdminController.createAuthority);
router.patch('/authorities/:id', AdminController.updateAuthority);
router.delete('/authorities/:id', AdminController.deleteAuthority);

// User accounts & credentials management (Admin only)
router.get('/users', AdminController.listUsers);
router.post('/users', AdminController.createUser);
router.patch('/users/:userId', AdminController.updateUser);
router.patch('/users/:userId/status', AdminController.toggleUserStatus);
router.delete('/users/:userId', AdminController.deleteUser);

export default router;
