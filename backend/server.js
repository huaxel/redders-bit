import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const db = new Database(join(__dirname, 'database', 'redders.db'));

// Middleware
app.use(cors());
app.use(express.json());

// ========== EMPLOYEES ROUTES ==========

// Get all employees with their roles
app.get('/api/employees', (req, res) => {
  try {
    const employees = db.prepare(`
      SELECT 
        u.*,
        CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as is_lifeguard,
        CASE WHEN i.id IS NOT NULL THEN 1 ELSE 0 END as is_instructor,
        l.max_hours_month,
        i.has_initiator_diploma
      FROM users u
      LEFT JOIN lifeguards l ON u.id = l.user_id
      LEFT JOIN instructors i ON u.id = i.user_id
    `).all();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single employee
app.get('/api/employees/:id', (req, res) => {
  try {
    const employee = db.prepare(`
      SELECT 
        u.*,
        CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as is_lifeguard,
        CASE WHEN i.id IS NOT NULL THEN 1 ELSE 0 END as is_instructor,
        l.max_hours_month,
        i.has_initiator_diploma
      FROM users u
      LEFT JOIN lifeguards l ON u.id = l.user_id
      LEFT JOIN instructors i ON u.id = i.user_id
      WHERE u.id = ?
    `).get(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new employee
app.post('/api/employees', (req, res) => {
  try {
    const { name, email, color, contract_type, hourly_rate, is_lifeguard, is_instructor, has_initiator_diploma } = req.body;
    
    const result = db.prepare(`
      INSERT INTO users (name, email, color, contract_type, hourly_rate)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, color || '#3788d8', contract_type || 'deeltijds', hourly_rate || 38);
    
    const userId = result.lastInsertRowid;
    
    if (is_lifeguard) {
      db.prepare('INSERT INTO lifeguards (user_id) VALUES (?)').run(userId);
    }
    if (is_instructor) {
      db.prepare('INSERT INTO instructors (user_id, has_initiator_diploma) VALUES (?, ?)').run(userId, has_initiator_diploma ? 1 : 0);
    }
    
    res.status(201).json({ id: userId, message: 'Employee created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SCHEDULE ROUTES ==========

// Get schedule for a month
app.get('/api/schedule/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const items = db.prepare(`
      SELECT 
        s.*,
        u.name as user_name,
        u.color as user_color
      FROM schedule_items s
      JOIN users u ON s.user_id = u.id
      WHERE s.date BETWEEN ? AND ?
      ORDER BY s.date, s.start_time
    `).all(startDate, endDate);
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get schedule for a specific user
app.get('/api/schedule/user/:userId', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT * FROM schedule_items 
      WHERE user_id = ?
      ORDER BY date, start_time
    `).all(req.params.userId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create schedule item with validation
app.post('/api/schedule', (req, res) => {
  try {
    const { user_id, date, start_time, end_time, type, notes } = req.body;
    
    // Validate working hours (min 4h, max 9h)
    const start = new Date(`2000-01-01T${start_time}`);
    const end = new Date(`2000-01-01T${end_time}`);
    const hours = (end - start) / (1000 * 60 * 60);
    
    if (hours < 4) {
      return res.status(400).json({ error: 'Minimum 4 uur per dag vereist' });
    }
    if (hours > 9) {
      return res.status(400).json({ error: 'Maximum 9 uur per dag toegestaan' });
    }
    
    // Check if date falls within a rental period
    const rental = db.prepare(`
      SELECT * FROM rental_periods 
      WHERE ? BETWEEN start_date AND end_date
    `).get(date);
    
    if (rental && type === 'redder') {
      return res.status(400).json({ 
        error: 'Zwembad is verhuurd in deze periode - geen redders nodig',
        rental: rental
      });
    }
    
    // Check instructor diploma for instructor type
    if (type === 'lesgever') {
      const instructor = db.prepare(`
        SELECT i.* FROM instructors i WHERE i.user_id = ?
      `).get(user_id);
      
      if (!instructor) {
        return res.status(400).json({ 
          warning: 'Deze persoon is geen geregistreerde lesgever'
        });
      }
    }
    
    const result = db.prepare(`
      INSERT INTO schedule_items (user_id, date, start_time, end_time, type, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user_id, date, start_time, end_time, type, notes);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Schedule item created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule item
app.put('/api/schedule/:id', (req, res) => {
  try {
    const { date, start_time, end_time, type, notes } = req.body;
    
    db.prepare(`
      UPDATE schedule_items 
      SET date = ?, start_time = ?, end_time = ?, type = ?, notes = ?
      WHERE id = ?
    `).run(date, start_time, end_time, type, notes, req.params.id);
    
    res.json({ message: 'Schedule item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule item
app.delete('/api/schedule/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM schedule_items WHERE id = ?').run(req.params.id);
    res.json({ message: 'Schedule item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HOURS TRACKING ==========

// Get worked hours for a user in a month
app.get('/api/employees/:id/hours/:year/:month', (req, res) => {
  try {
    const { id, year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const result = db.prepare(`
      SELECT 
        SUM(
          (CAST(substr(end_time, 1, 2) AS INTEGER) * 60 + CAST(substr(end_time, 4, 2) AS INTEGER)) -
          (CAST(substr(start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(start_time, 4, 2) AS INTEGER))
        ) / 60.0 as total_hours
      FROM schedule_items
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `).get(id, startDate, endDate);
    
    const employee = db.prepare(`
      SELECT l.max_hours_month FROM lifeguards l WHERE l.user_id = ?
    `).get(id);
    
    res.json({
      worked_hours: result?.total_hours || 0,
      max_hours: employee?.max_hours_month || 160,
      remaining_hours: (employee?.max_hours_month || 160) - (result?.total_hours || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== RENTAL PERIODS ==========

app.get('/api/rental-periods', (req, res) => {
  try {
    const periods = db.prepare('SELECT * FROM rental_periods ORDER BY start_date').all();
    res.json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rental-periods', (req, res) => {
  try {
    const { start_date, end_date, renter_name, notes } = req.body;
    const result = db.prepare(`
      INSERT INTO rental_periods (start_date, end_date, renter_name, notes)
      VALUES (?, ?, ?, ?)
    `).run(start_date, end_date, renter_name, notes);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONFIG ==========

app.get('/api/config', (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM config').all();
    const configObj = {};
    config.forEach(c => { configObj[c.key] = c.value; });
    res.json(configObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========

app.listen(PORT, () => {
  console.log(`🏊 Zwembadredders API running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET  /api/employees');
  console.log('   GET  /api/schedule/month/:year/:month');
  console.log('   POST /api/schedule');
  console.log('   GET  /api/employees/:id/hours/:year/:month');
});
