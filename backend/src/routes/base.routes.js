import { Router } from 'express';
import { PoolController, EmployeeController } from '../controllers/BaseControllers.js';
import { checkRole } from '../middleware/auth.js';
import { query, run } from '../db.js';

const router = Router();

// Pools
router.get('/pools', PoolController.getAll);
router.post('/pools', checkRole(['admin']), PoolController.create);

// Config
router.get('/config', EmployeeController.getConfig);

// Employees
router.get('/employees', checkRole(['admin', 'redder', 'lesgever']), EmployeeController.getAll);
router.get('/employees/:userId/hours/:year/:month', checkRole(['admin', 'redder', 'lesgever']), EmployeeController.getHours);

// Reset (Demo)
router.post('/reset', checkRole(['admin']), (req, res) => {
    try {
        run('DELETE FROM schedule_items');
        run('DELETE FROM shift_requests');
        res.json({ success: true, message: 'Database schedule reset for demo.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
