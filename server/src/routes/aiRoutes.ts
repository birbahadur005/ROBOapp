import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.post('/ask', AIController.ask);

export default router;
