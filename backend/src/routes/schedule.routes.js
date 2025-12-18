import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController.js';
import { checkRole } from '../middleware/auth.js';

const router = Router();

// Schedule
router.get('/month/:year/:month', checkRole(['admin', 'redder', 'lesgever', 'any']), ScheduleController.getMonthSchedule);
router.post('/', checkRole(['admin']), ScheduleController.createShift);
router.delete('/:id', checkRole(['admin']), ScheduleController.deleteShift);

// Auto & Requests
router.post('/auto', checkRole(['admin']), ScheduleController.autoSchedule);

// Exceptions: Sickness
router.post('/:id/sick', checkRole(['any']), ScheduleController.reportSickness);

// Exceptions: Swaps
router.post('/:id/swap', checkRole(['any']), ScheduleController.requestSwap);
router.get('/swaps/open', checkRole(['any']), ScheduleController.getOpenSwaps);
router.post('/swaps/:id/accept', checkRole(['any']), ScheduleController.acceptSwap);
router.get('/swaps/pending', checkRole(['admin']), ScheduleController.getPendingSwaps);
router.post('/swaps/:id/approve', checkRole(['admin']), ScheduleController.approveSwap);

export default router;
