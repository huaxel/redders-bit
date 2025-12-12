import { query, run } from '../db.js';

export class PoolController {
    static getAll(req, res) {
        res.json(query('SELECT * FROM pools WHERE is_active = 1'));
    }
    
    static create(req, res) {
        const { name, surface_area } = req.body;
        const result = run('INSERT INTO pools (name, surface_area) VALUES (?, ?)', [name, surface_area]);
        res.json({ id: result.lastInsertRowid });
    }
}

export class EmployeeController {
    static getAll(req, res) {
        const isAdmin = req.user.role === 'admin';
        const sql = `
            SELECT u.id, u.name, u.email, u.color, u.role,
            CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as is_lifeguard,
            CASE WHEN i.id IS NOT NULL THEN 1 ELSE 0 END as is_instructor,
            ${isAdmin ? 'u.hourly_rate, u.contract_type' : "NULL as hourly_rate, NULL as contract_type"}
            FROM users u
            LEFT JOIN lifeguards l ON u.id = l.user_id
            LEFT JOIN instructors i ON u.id = i.user_id
        `;
        res.json(query(sql));
    }

    static getConfig(req, res) {
        const config = query('SELECT * FROM config');
        const configObj = {};
        config.forEach(c => { configObj[c.key] = c.value; });
        res.json(configObj);
    }

    static getHours(req, res) {
        // Only allow users to see their own hours or admin
        if (req.user.role !== 'admin' && parseInt(req.params.userId) !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { userId, year, month } = req.params;
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`;

        const shifts = query(`
            SELECT start_time, end_time 
            FROM schedule_items 
            WHERE user_id = ? AND date BETWEEN ? AND ?
        `, [userId, startDate, endDate]);

        let totalHours = 0;
        shifts.forEach(s => {
            const start = new Date(`2000-01-01T${s.start_time}`);
            const end = new Date(`2000-01-01T${s.end_time}`);
            totalHours += (end - start) / 3600000;
        });

        res.json({ total_hours: Math.round(totalHours * 10) / 10 });
    }
}
