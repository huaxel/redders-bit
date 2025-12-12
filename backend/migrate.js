const sqlite3 = require('better-sqlite3');
const db = new sqlite3('database/redders.db');

console.log('🔄 Running migration: Add shift_requests table...');

try {
    db.prepare(`
    CREATE TABLE IF NOT EXISTS shift_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        pool_id INTEGER,
        date TEXT,
        start_time TEXT,
        end_time TEXT,
        status TEXT DEFAULT 'pending', -- pending, accepted, rejected
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(pool_id) REFERENCES pools(id)
    );
    `).run();
    console.log('✅ Migration successful.');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
}
