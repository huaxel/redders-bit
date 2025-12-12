import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'redders.db');
const schemaPath = join(__dirname, 'schema.sql');

console.log('🗄️  Initializing database...');

const db = new Database(dbPath);

// Run schema
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);

console.log('✅ Schema created successfully');

// Add sample data
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, color, contract_type, hourly_rate)
  VALUES (?, ?, ?, ?, ?)
`);

const insertLifeguard = db.prepare(`
  INSERT OR IGNORE INTO lifeguards (user_id, max_hours_month)
  VALUES (?, ?)
`);

const insertInstructor = db.prepare(`
  INSERT OR IGNORE INTO instructors (user_id, has_initiator_diploma)
  VALUES (?, ?)
`);

// Sample users
const sampleUsers = [
  { name: 'Jan Peeters', email: 'jan@zwembad.be', color: '#e74c3c', type: 'voltijds', rate: 38, isLifeguard: true, isInstructor: false },
  { name: 'Marie Claes', email: 'marie@zwembad.be', color: '#3498db', type: 'deeltijds', rate: 35, isLifeguard: true, isInstructor: true },
  { name: 'Pieter Janssens', email: 'pieter@zwembad.be', color: '#2ecc71', type: 'deeltijds', rate: 32, isLifeguard: false, isInstructor: true },
  { name: 'An Vermeersch', email: 'an@zwembad.be', color: '#9b59b6', type: 'voltijds', rate: 38, isLifeguard: true, isInstructor: false },
  { name: 'Tom De Smet', email: 'tom@zwembad.be', color: '#f39c12', type: 'deeltijds', rate: 35, isLifeguard: true, isInstructor: true },
];

console.log('👥 Adding sample users...');

for (const user of sampleUsers) {
  insertUser.run(user.name, user.email, user.color, user.type, user.rate);
  
  const userData = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
  if (userData) {
    if (user.isLifeguard) {
      insertLifeguard.run(userData.id, user.type === 'voltijds' ? 160 : 80);
    }
    if (user.isInstructor) {
      insertInstructor.run(userData.id, user.name === 'Pieter Janssens' ? 1 : 0);
    }
  }
}

// Add sample schedule items for current month
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();

const insertSchedule = db.prepare(`
  INSERT INTO schedule_items (user_id, date, start_time, end_time, type)
  VALUES (?, ?, ?, ?, ?)
`);

console.log('📅 Adding sample schedule items...');

// Add some schedule entries for the current week
const users = db.prepare('SELECT * FROM users').all();
for (let i = 0; i < 7; i++) {
  const date = new Date(year, month, now.getDate() + i);
  const dateStr = date.toISOString().split('T')[0];
  
  // Assign 2-3 lifeguards per day
  const lifeguardUsers = users.filter((u, idx) => idx % 2 === i % 2).slice(0, 3);
  for (const user of lifeguardUsers) {
    insertSchedule.run(user.id, dateStr, '09:00', '17:00', 'redder');
  }
}

console.log('✅ Database initialized with sample data!');
console.log(`📁 Database location: ${dbPath}`);

db.close();
