import { query, run } from '../db.js';

export class ScheduleService {
    
    // Auto Schedule Logic
    static async autoSchedule(poolId, year, month) {
        const addedRequests = 0;
        
        // 1. Get Pool
        const pool = query('SELECT * FROM pools WHERE id = ?', [poolId])[0];
        if (!pool) throw new Error('Pool not found');
        
        const requiredLifeguards = Math.ceil(pool.surface_area / 250);
        const numDays = new Date(year, month, 0).getDate();
        
        // 2. Get Available Lifeguards
        const potentialRedders = query(`
            SELECT u.id, u.name 
            FROM users u 
            JOIN lifeguards l ON u.id = l.user_id 
        `);
        
        if (potentialRedders.length === 0) {
            throw new Error('Geen redders gevonden in het systeem.');
        }

        let count = 0;
        for (let d = 1; d <= numDays; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            // Check coverage
            const shifts = query("SELECT * FROM schedule_items WHERE date = ? AND type = 'redder'", [dateStr]);
            const requests = query("SELECT * FROM shift_requests WHERE date = ? AND status = 'pending'", [dateStr]);
            
            let currentCoverage = shifts.length + requests.length;
            
            while (currentCoverage < requiredLifeguards) {
                const busyUserIds = [
                    ...shifts.map(s => s.user_id),
                    ...requests.map(r => r.user_id)
                ];
                
                const candidates = potentialRedders.filter(r => !busyUserIds.includes(r.id));
                if (candidates.length === 0) break;
                
                const candidate = candidates[Math.floor(Math.random() * candidates.length)];
                
                run(
                  'INSERT INTO shift_requests (user_id, pool_id, date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
                  [candidate.id, poolId, dateStr, '09:00', '17:00', 'pending']
                );
                
                count++;
                currentCoverage++;
                busyUserIds.push(candidate.id); 
            }
        }
        return { success: true, added_requests: count };
    }

    // Manual Schedule Creation
    static createShift(poolId, data) {
        const { user_id, date, start_time, end_time, type, notes } = data;
        const result = run(
          'INSERT INTO schedule_items (user_id, pool_id, date, start_time, end_time, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [user_id, poolId, date, start_time, end_time, type, notes]
        );
        return { id: result.lastInsertRowid };
    }

    // Get Schedule
    static getMonthSchedule(year, month, poolId) {
        let sql = `
            SELECT s.*, u.name as user_name, u.color as user_color 
            FROM schedule_items s
            JOIN users u ON s.user_id = u.id
            WHERE s.date BETWEEN ? AND ?
        `;
        const params = [`${year}-${String(month).padStart(2,'0')}-01`, `${year}-${String(month).padStart(2,'0')}-31`];

        if (poolId) {
            sql += ' AND s.pool_id = ?';
            params.push(poolId);
        }
        return query(sql + ' ORDER BY s.date, s.start_time', params);
    }

    static getUserSchedule(userId) {
        const sql = `
            SELECT s.*, u.name as user_name, u.color as user_color 
            FROM schedule_items s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ?
            ORDER BY s.date, s.start_time
        `;
        return query(sql, [userId]);
    }

    static deleteShift(id) {
        run('DELETE FROM schedule_items WHERE id = ?', [id]);
    }

    // Requests
    static getRequests(userId, isAdmin) {
        if (isAdmin) {
            return query(`
                SELECT r.*, u.name as user_name, u.color as user_color 
                FROM shift_requests r
                JOIN users u ON r.user_id = u.id
                ORDER BY r.date, r.start_time
            `);
        } else {
             return query(`
                SELECT r.*, u.name as user_name, u.color as user_color 
                FROM shift_requests r
                JOIN users u ON r.user_id = u.id
                WHERE r.user_id = ? AND r.status = 'pending'
                ORDER BY r.date
            `, [userId]);
        }
    }

    static getRequestById(id) {
        return query('SELECT * FROM shift_requests WHERE id = ?', [id])[0];
    }

    static respondToRequest(requestId, status) {
        if (status === 'accepted') {
            const request = this.getRequestById(requestId);
            if (!request) throw new Error('Request not found');
            
            // Create Shift
            run(
                'INSERT INTO schedule_items (user_id, pool_id, date, start_time, end_time, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [request.user_id, request.pool_id, request.date, request.start_time, request.end_time, 'redder', 'Accepted Request']
            );
            
            run("UPDATE shift_requests SET status = 'accepted' WHERE id = ?", [requestId]);
        } else if (status === 'rejected') {
            run("UPDATE shift_requests SET status = 'rejected' WHERE id = ?", [requestId]);
        } else {
            throw new Error('Invalid status');
        }
    }
}
