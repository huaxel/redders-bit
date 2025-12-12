import { ScheduleService } from '../services/ScheduleService.js';
import { ComplianceService } from '../services/ComplianceService.js';

export class ScheduleController {
    
    static async autoSchedule(req, res) {
        try {
            const { year, month } = req.body;
            // Assuming Pool 1 for MVP
            const result = await ScheduleService.autoSchedule(1, year, month);
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    }

    static async createShift(req, res) {
        const validation = ComplianceService.validateScheduleItem(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.errors.join(', ') });
        }

        try {
            const result = ScheduleService.createShift(req.body.pool_id || 1, req.body);
            res.json({ id: result.id, warnings: validation.warnings });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static getSchedule(req, res) {
        const { year, month } = req.params;
        const { pool_id } = req.query;
        res.json(ScheduleService.getMonthSchedule(year, month, pool_id));
    }

    static getUserSchedule(req, res) {
        res.json(ScheduleService.getUserSchedule(req.params.userId));
    }

    static deleteShift(req, res) {
        try {
            ScheduleService.deleteShift(req.params.id);
            res.json({ message: 'Deleted' });
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    }

    // Requests
    static getRequests(req, res) {
        const isAdmin = req.user.role === 'admin';
        res.json(ScheduleService.getRequests(req.user.id, isAdmin));
    }

    static respondToRequest(req, res) {
        const requestId = req.params.id;
        const { status } = req.body;
        
        try {
            const request = ScheduleService.getRequestById(requestId);
            if (!request) return res.status(404).json({ error: 'Request not found' });
            
            // Auth check
            if (request.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            ScheduleService.respondToRequest(requestId, status);
            res.json({ success: true, message: `Request ${status}` });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
