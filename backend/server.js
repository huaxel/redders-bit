import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
let db;
const dbPath = join(__dirname, 'database', 'redders.db');
const schemaPath = join(__dirname, 'database', 'schema.sql');

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    const schema = readFileSync(schemaPath, 'utf-8');
    db.run(schema);
    
    // Add sample data
    seedDatabase();
    saveDatabase();
  }
  
  console.log('✅ Database initialized');
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

function seedDatabase() {
  // Sample users
  const users = [
    ['Jan Peeters', 'jan@zwembad.be', '#e74c3c', 'voltijds', 38],
    ['Marie Claes', 'marie@zwembad.be', '#3498db', 'deeltijds', 35],
    ['Pieter Janssens', 'pieter@zwembad.be', '#2ecc71', 'deeltijds', 32],
    ['An Vermeersch', 'an@zwembad.be', '#9b59b6', 'voltijds', 38],
    ['Tom De Smet', 'tom@zwembad.be', '#f39c12', 'deeltijds', 35],
  ];
  
  users.forEach(([name, email, color, type, rate]) => {
    db.run('INSERT INTO users (name, email, color, contract_type, hourly_rate) VALUES (?, ?, ?, ?, ?)', 
           [name, email, color, type, rate]);
  });
  
  // Lifeguards
  db.run('INSERT INTO lifeguards (user_id, max_hours_month) VALUES (1, 160)');
  db.run('INSERT INTO lifeguards (user_id, max_hours_month) VALUES (2, 80)');
  db.run('INSERT INTO lifeguards (user_id, max_hours_month) VALUES (4, 160)');
  db.run('INSERT INTO lifeguards (user_id, max_hours_month) VALUES (5, 80)');
  
  // Instructors
  db.run('INSERT INTO instructors (user_id, has_initiator_diploma) VALUES (2, 0)');
  db.run('INSERT INTO instructors (user_id, has_initiator_diploma) VALUES (3, 1)');
  db.run('INSERT INTO instructors (user_id, has_initiator_diploma) VALUES (5, 0)');
  
  // Sample schedule for current week
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Assign lifeguards
    const userId = (i % 4) + 1;
    db.run('INSERT INTO schedule_items (user_id, date, start_time, end_time, type) VALUES (?, ?, ?, ?, ?)',
           [userId, dateStr, '09:00', '17:00', 'redder']);
    db.run('INSERT INTO schedule_items (user_id, date, start_time, end_time, type) VALUES (?, ?, ?, ?, ?)',
           [((userId % 4) + 1), dateStr, '09:00', '17:00', 'redder']);
  }
  
  console.log('✅ Sample data seeded');
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper to run queries
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
}

// ========== EMPLOYEES ROUTES ==========

app.get('/api/employees', (req, res) => {
  try {
    const employees = query(`
      SELECT 
        u.*,
        CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END as is_lifeguard,
        CASE WHEN i.id IS NOT NULL THEN 1 ELSE 0 END as is_instructor,
        l.max_hours_month,
        i.has_initiator_diploma
      FROM users u
      LEFT JOIN lifeguards l ON u.id = l.user_id
      LEFT JOIN instructors i ON u.id = i.user_id
    `);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:id', (req, res) => {
  try {
    const employees = query(`
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
    `, [parseInt(req.params.id)]);
    
    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employees[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', (req, res) => {
  try {
    const { name, email, color, contract_type, hourly_rate, is_lifeguard, is_instructor, has_initiator_diploma } = req.body;
    
    run('INSERT INTO users (name, email, color, contract_type, hourly_rate) VALUES (?, ?, ?, ?, ?)',
        [name, email, color || '#3788d8', contract_type || 'deeltijds', hourly_rate || 38]);
    
    const result = db.exec('SELECT last_insert_rowid()');
    const userId = result[0]?.values[0]?.[0];
    
    if (is_lifeguard) {
      run('INSERT INTO lifeguards (user_id) VALUES (?)', [userId]);
    }
    if (is_instructor) {
      run('INSERT INTO instructors (user_id, has_initiator_diploma) VALUES (?, ?)', [userId, has_initiator_diploma ? 1 : 0]);
    }
    
    res.status(201).json({ id: userId, message: 'Employee created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SCHEDULE ROUTES ==========

app.get('/api/schedule/month/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const items = query(`
      SELECT 
        s.*,
        u.name as user_name,
        u.color as user_color
      FROM schedule_items s
      JOIN users u ON s.user_id = u.id
      WHERE s.date BETWEEN ? AND ?
      ORDER BY s.date, s.start_time
    `, [startDate, endDate]);
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedule/user/:userId', (req, res) => {
  try {
    const items = query(`
      SELECT * FROM schedule_items 
      WHERE user_id = ?
      ORDER BY date, start_time
    `, [parseInt(req.params.userId)]);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    
    // Check rental period
    const rentals = query('SELECT * FROM rental_periods WHERE ? BETWEEN start_date AND end_date', [date]);
    if (rentals.length > 0 && type === 'redder') {
      return res.status(400).json({ 
        error: 'Zwembad is verhuurd in deze periode - geen redders nodig',
        rental: rentals[0]
      });
    }
    
    run('INSERT INTO schedule_items (user_id, date, start_time, end_time, type, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, date, start_time, end_time, type, notes || null]);
    
    const result = db.exec('SELECT last_insert_rowid()');
    res.status(201).json({ id: result[0]?.values[0]?.[0], message: 'Schedule item created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/schedule/:id', (req, res) => {
  try {
    const { date, start_time, end_time, type, notes } = req.body;
    run('UPDATE schedule_items SET date = ?, start_time = ?, end_time = ?, type = ?, notes = ? WHERE id = ?',
        [date, start_time, end_time, type, notes, parseInt(req.params.id)]);
    res.json({ message: 'Schedule item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/schedule/:id', (req, res) => {
  try {
    run('DELETE FROM schedule_items WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ message: 'Schedule item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HOURS TRACKING ==========

app.get('/api/employees/:id/hours/:year/:month', (req, res) => {
  try {
    const { id, year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const result = query(`
      SELECT 
        SUM(
          (CAST(substr(end_time, 1, 2) AS INTEGER) * 60 + CAST(substr(end_time, 4, 2) AS INTEGER)) -
          (CAST(substr(start_time, 1, 2) AS INTEGER) * 60 + CAST(substr(start_time, 4, 2) AS INTEGER))
        ) / 60.0 as total_hours
      FROM schedule_items
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `, [parseInt(id), startDate, endDate]);
    
    const employee = query('SELECT max_hours_month FROM lifeguards WHERE user_id = ?', [parseInt(id)]);
    
    const workedHours = result[0]?.total_hours || 0;
    const maxHours = employee[0]?.max_hours_month || 160;
    
    res.json({
      worked_hours: workedHours,
      max_hours: maxHours,
      remaining_hours: maxHours - workedHours
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== RENTAL PERIODS ==========

app.get('/api/rental-periods', (req, res) => {
  try {
    const periods = query('SELECT * FROM rental_periods ORDER BY start_date');
    res.json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rental-periods', (req, res) => {
  try {
    const { start_date, end_date, renter_name, notes } = req.body;
    run('INSERT INTO rental_periods (start_date, end_date, renter_name, notes) VALUES (?, ?, ?, ?)',
        [start_date, end_date, renter_name, notes]);
    const result = db.exec('SELECT last_insert_rowid()');
    res.status(201).json({ id: result[0]?.values[0]?.[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONFIG ==========

app.get('/api/config', (req, res) => {
  try {
    const config = query('SELECT * FROM config');
    const configObj = {};
    config.forEach(c => { configObj[c.key] = c.value; });
    res.json(configObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🏊 Zwembadredders API running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   GET  /api/employees');
    console.log('   GET  /api/schedule/month/:year/:month');
    console.log('   POST /api/schedule');
    console.log('   GET  /api/employees/:id/hours/:year/:month');
  });
});
