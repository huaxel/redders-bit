import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Go up one level from src/ to backend/
const rootDir = join(__dirname, '..');
const dbPath = join(rootDir, 'database', 'redders.db');
const schemaPath = join(rootDir, 'database', 'schema.sql');

let db;

export async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (existsSync(dbPath)) {
    try {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } catch (e) {
      console.error('Data corrupt, recreating...');
      return recreateDatabase(SQL);
    }
  } else {
    await recreateDatabase(SQL);
  }
  
  console.log('✅ Database initialized');
}

async function recreateDatabase(SQL) {
  db = new SQL.Database();
  const schema = readFileSync(schemaPath, 'utf-8');
  db.run(schema);
  seedDatabase();
  saveDatabase();
}

export function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

// Helper to execute query and return results
export function query(sql, params = []) {
  try {
    const safeParams = params.map(p => p === undefined ? null : p);
    const stmt = db.prepare(sql);
    stmt.bind(safeParams);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  } catch (err) {
    console.error("SQL Error:", sql, err);
    throw err;
  }
}

// Helper to run insert/update/delete
export function run(sql, params = []) {
  const safeParams = params.map(p => p === undefined ? null : p);
  db.run(sql, safeParams);
  saveDatabase();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
}

function seedDatabase() {
  // Sample users with ROLES
  const users = [
    ['Jan Peeters', 'jan@zwembad.be', '#e74c3c', 'voltijds', 38, 'admin'],
    ['Marie Claes', 'marie@zwembad.be', '#3498db', 'deeltijds', 35, 'redder'],
    ['Pieter Janssens', 'pieter@zwembad.be', '#2ecc71', 'deeltijds', 32, 'redder'],
    ['An Vermeersch', 'an@zwembad.be', '#9b59b6', 'voltijds', 38, 'lesgever'],
    ['Tom De Smet', 'tom@zwembad.be', '#f39c12', 'deeltijds', 35, 'redder'],
  ];
  
  users.forEach(([name, email, color, type, rate, role]) => {
    db.run('INSERT INTO users (name, email, color, contract_type, hourly_rate, role) VALUES (?, ?, ?, ?, ?, ?)', 
           [name, email, color, type, rate, role]);
  });
  
  // Helpers
  const addLifeguard = (id, max) => db.run('INSERT INTO lifeguards (user_id, max_hours_month) VALUES (?, ?)', [id, max]);
  const addInstructor = (id, dip) => db.run('INSERT INTO instructors (user_id, has_initiator_diploma) VALUES (?, ?)', [id, dip]);

  addLifeguard(1, 160); // Jan (Admin/Redder)
  addLifeguard(2, 80);  // Marie
  addLifeguard(3, 160); // Pieter
  addLifeguard(5, 80);  // Tom
  
  addInstructor(2, 0); // Marie
  addInstructor(4, 1); // An
  addInstructor(5, 0); // Tom
  
  // Sample schedule for current week
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Assign to Pool 1
    const userId = (i % 3) + 1; // 1, 2, 3
    db.run('INSERT INTO schedule_items (user_id, pool_id, date, start_time, end_time, type) VALUES (?, ?, ?, ?, ?, ?)',
           [userId, 1, dateStr, '09:00', '17:00', 'redder']);
           
    // Second shift for VLAREM compliance
    if (i % 2 === 0) {
      db.run('INSERT INTO schedule_items (user_id, pool_id, date, start_time, end_time, type) VALUES (?, ?, ?, ?, ?, ?)',
             [((userId % 3) + 2), 1, dateStr, '12:00', '20:00', 'redder']);
    }
  }

  // Create some initial shift requests for demo
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];
  // No, let's keep it clean or just basic seeding
}
