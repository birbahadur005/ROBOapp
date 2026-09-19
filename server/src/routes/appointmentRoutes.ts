import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// Public Visitor Endpoints
router.post('/', AppointmentController.create);
router.get('/track', AppointmentController.trackStatus);
router.get('/photos/:photoId', AppointmentController.streamPhoto);

// Authenticated Endpoints
router.use(authenticate);

router.get('/', AppointmentController.list);
router.get('/:id', AppointmentController.getById);

// Status Transitions (Authority & Admin)
router.post('/:id/accept', requireRoles(['AUTHORITY', 'COLLEGE_ADMIN', 'SUPER_ADMIN']), AppointmentController.accept);
router.post('/:id/reject', requireRoles(['AUTHORITY', 'COLLEGE_ADMIN', 'SUPER_ADMIN']), AppointmentController.reject);
router.post('/:id/reschedule', requireRoles(['AUTHORITY', 'COLLEGE_ADMIN', 'SUPER_ADMIN']), AppointmentController.reschedule);

// Reception & Authority Actions
router.post('/:id/complete', requireRoles(['RECEPTION', 'AUTHORITY', 'COLLEGE_ADMIN', 'SUPER_ADMIN']), AppointmentController.complete);
router.post('/verify-qr', requireRoles(['RECEPTION', 'COLLEGE_ADMIN', 'SUPER_ADMIN']), AppointmentController.verifyQR);

export default router;
