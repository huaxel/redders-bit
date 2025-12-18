import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { checkRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', checkRole(['any']), AuthController.me);

export default router;
