import { initDatabase } from './backend/src/db.js';
import { ComplianceService } from './backend/src/services/ComplianceService.js';

async function test() {
    await initDatabase();
    
    console.log("Testing Validate...");
    try {
        const result = ComplianceService.validateScheduleItem({
            user_id: 2,
            date: '2025-12-01',
            start_time: '09:00',
            end_time: '17:00',
            type: 'redder'
        });
        console.log("Result:", result);
    } catch (e) {
        console.error("CRASH:", e);
    }
}

test();
