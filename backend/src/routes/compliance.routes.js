import { Router } from 'express';
import { ComplianceController } from '../controllers/ComplianceController.js';
import { checkRole } from '../middleware/auth.js';

const router = Router();

router.post('/validate', checkRole(['admin']), ComplianceController.validate);
router.get('/vlarem/:poolId/:year/:month', ComplianceController.getVlaremReport);
router.get('/report/:year/:month', checkRole(['admin']), ComplianceController.getTimeReport);

export default router;
