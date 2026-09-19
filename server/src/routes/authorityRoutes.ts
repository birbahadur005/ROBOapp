import { Router } from 'express';
import { AuthorityController } from '../controllers/authorityController';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// Public Directory
router.get('/', AuthorityController.listPublic);
router.get('/:id', AuthorityController.getById);

// Self Management
router.patch('/self/availability', authenticate, requireRoles(['AUTHORITY']), AuthorityController.updateSelfAvailability);

export default router;
