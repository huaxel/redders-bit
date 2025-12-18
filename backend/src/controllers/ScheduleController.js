import { ScheduleService } from '../services/ScheduleService.js';

export class ScheduleController {
    static getMonthSchedule(req, res) {
        try {
            const { year, month } = req.params;
            const schedule = ScheduleService.getMonthSchedule(year, month);
            res.json(schedule);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static createShift(req, res) {
        try {
            const shift = ScheduleService.createShift(req.body);
            // If warnings exist, we return 200/201 but with body data
            res.json(shift); 
        } catch (e) {
            // If it's a validation error, we might want 400, but simple catch-all 500 or 400 is fine for now
            res.status(400).json({ error: e.message });
        }
    }

    static deleteShift(req, res) {
        try {
            const { id } = req.params;
            ScheduleService.deleteShift(id);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static autoSchedule(req, res) {
        try {
            const { year, month } = req.body;
            const result = ScheduleService.autoSchedule(year, month);
            res.json(result);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static getRequests(req, res) {
        // ... missing implementation, let's add it
        // Or actually the previous code accessed ScheduleService directly or through simple route handlers?
        // Ah, looking at schedule.routes.js in a moment.
        // Let's implement full controller.
        try {
            // Hacky: ScheduleService doesn't have getAllRequests for month, only getUserRequests.
            // But we have query access. Let's assume a Service method exists or logic is simple.
            // For now, let's stick to what we need for swaps.
            res.status(501).json({ error: 'Not implemented' });
        } catch (e) {
           res.status(500).json({ error: e.message });
        }
    }

    // --- New Exception Methods ---

    static async reportSickness(req, res) {
        try {
            const { id } = req.params; // shift id
            const userId = req.user.id;
            const { reason } = req.body;
            ScheduleService.reportSickness(id, userId, reason);
            res.json({ success: true });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    static async requestSwap(req, res) {
        try {
            const { id } = req.params; // shift id
            const userId = req.user.id;
            ScheduleService.createSwapRequest(id, userId);
            res.json({ success: true });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    static async getOpenSwaps(req, res) {
        try {
            const swaps = ScheduleService.getOpenSwaps();
            res.json(swaps);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async acceptSwap(req, res) {
        try {
            const { id } = req.params; // swap id
            const candidateId = req.user.id;
            ScheduleService.acceptSwap(id, candidateId);
            res.json({ success: true });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    static async getPendingSwaps(req, res) { // For Admin
        try {
            const swaps = ScheduleService.getPendingSwapApprovals();
            res.json(swaps);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static async approveSwap(req, res) { // Admin only
        try {
            const { id } = req.params; // swap id
            ScheduleService.approveSwap(id);
            res.json({ success: true });
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }
}
