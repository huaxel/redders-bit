import { jest } from '@jest/globals';

// Mock DB before importing service
jest.unstable_mockModule('../src/db.js', () => ({
  query: jest.fn(),
}));

const { query } = await import('../src/db.js');
const { ComplianceService } = await import('../src/services/ComplianceService.js');

describe('ComplianceService', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation: return empty array
        query.mockReturnValue([]);
    });

    test('US-03: Rejects shifts < 3 hours', () => {
        const result = ComplianceService.validateScheduleItem({
            user_id: 1, date: '2025-12-01', start_time: '09:00', end_time: '11:00', type: 'redder' // 2 hours
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Minimale shift is 3 uur (Wetgeving)');
    });

    test('US-03: Rejects shifts > 9 hours', () => {
        const result = ComplianceService.validateScheduleItem({
            user_id: 1, date: '2025-12-01', start_time: '08:00', end_time: '18:01', type: 'redder' // 10h 1m
        });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Maximale dagshift is 9 uur (Wetgeving)');
    });

    test('US-07: Rejects 8th consecutive day', () => {
        // Mock query to return true for past 7 days
        query.mockImplementation((sql, params) => {
            // If checking for consecutive days (SELECT 1 ...)
            if (sql.includes('SELECT 1 FROM schedule_items')) {
                 // Simulate shifts existing for all checked dates
                 return [{ 1: 1 }]; 
            }
            return [];
        });

        const result = ComplianceService.validateScheduleItem({
            user_id: 1, date: '2025-12-08', start_time: '09:00', end_time: '17:00', type: 'redder'
        });

        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/Te veel opeenvolgende werkdagen/);
    });

    test('US-06: Rental Period Blocking', () => {
         query.mockImplementation((sql) => {
             if (sql.includes('rental_periods')) {
                 return [{ renter_name: 'School' }];
             }
             return [];
         });

         const result = ComplianceService.validateScheduleItem({
            user_id: 1, date: '2025-12-01', start_time: '09:00', end_time: '17:00', type: 'redder'
         });

         expect(result.valid).toBe(false);
         expect(result.errors[0]).toMatch(/Zwembad verhuurd aan School/);
    });
});
