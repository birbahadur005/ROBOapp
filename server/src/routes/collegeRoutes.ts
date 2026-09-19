import { Router } from 'express';
import { CollegeController } from '../controllers/collegeController';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// Public Visitor Endpoints
router.get('/info', CollegeController.listInfo);
router.get('/campus', CollegeController.listCampusLocations);
router.get('/announcements', CollegeController.listAnnouncements);
router.get('/search', CollegeController.searchGlobal);

// Admin Knowledge & Campus Management
router.post('/info', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.createInfo);
router.patch('/info/:id', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.updateInfo);
router.delete('/info/:id', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.deleteInfo);

router.post('/campus', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.createCampusLocation);
router.patch('/campus/:id', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.updateCampusLocation);
router.delete('/campus/:id', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.deleteCampusLocation);

router.post('/announcements', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.createAnnouncement);
router.patch('/announcements/:id', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.updateAnnouncement);
router.delete('/announcements/:id', authenticate, requireRoles(['COLLEGE_ADMIN', 'SUPER_ADMIN']), CollegeController.deleteAnnouncement);

export default router;
