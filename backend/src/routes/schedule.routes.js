import { Router } from 'express';
import { ScheduleController } from '../controllers/ScheduleController.js';
import { checkRole } from '../middleware/auth.js';

const router = Router();

// Schedule
router.get('/month/:year/:month', checkRole(['admin', 'redder', 'lesgever']), ScheduleController.getSchedule);
router.get('/user/:userId', checkRole(['admin', 'redder', 'lesgever']), ScheduleController.getUserSchedule);
router.post('/', checkRole(['admin']), ScheduleController.createShift);
router.delete('/:id', checkRole(['admin']), ScheduleController.deleteShift);

// Auto & Requests
router.post('/auto', checkRole(['admin']), ScheduleController.autoSchedule);
router.get('/requests', checkRole(['admin', 'redder', 'lesgever']), ScheduleController.getRequests);
router.post('/requests/:id/respond', checkRole(['admin', 'redder', 'lesgever']), ScheduleController.respondToRequest);

export default router;
