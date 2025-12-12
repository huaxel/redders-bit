import { ComplianceService } from '../services/ComplianceService.js';

export class ComplianceController {
    static validate(req, res) {
        const result = ComplianceService.validateScheduleItem(req.body);
        res.json(result);
    }

    static getVlaremReport(req, res) {
        try {
            const { poolId, year, month } = req.params;
            const report = ComplianceService.getVlaremCompliance(poolId, year, month);
            res.json(report);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static getTimeReport(req, res) {
        try {
            const { year, month } = req.params;
            const report = ComplianceService.getTimeRegistrationReport(year, month);
            res.json(report);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
