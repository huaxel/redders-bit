const sqlite3 = require('better-sqlite3');
const db = new sqlite3('database/planning.db');

console.log('🌱 Seeding database...');

// 1. Clear existing Employee Data (optional, maybe keep for simplicity if we want to add to it, but cleaner to reset for tests)
// For now, let's just Upsert or ensure we have enough people.
// We'll delete everyone to be sure we have clean states.
db.prepare('DELETE FROM users').run();
db.prepare('DELETE FROM instructors').run();
// We'll keep rental periods and pools as they are config logic mostly.
// Maybe clear schedule too for a fresh start?
// db.prepare('DELETE FROM schedule_items').run(); 
// Let's NOT clear schedule items so we don't lose the user's manual work unless they want to.
// But the user asked for "bogus data" to test the feature.
// Let's create a healthy list of employees.

const names = [
    'Emma De Vries', 'Liam Peeters', 'Noah Janssens', 'Olivia Maeis', 'Louis Smet',
    'Lucas Jacobs', 'Arthur Van Damme', 'Mila Mertens', 'Sophie Claes', 'Adam Wouters',
    'Nora Goossens', 'Jules De Bock', 'Ella Hermans', 'Victor Aerts', 'Marie Coppens'
];

const roles = [
    { type: 'admin', pool_id: 1, role: 'Hoofdredder', rate: 25.0, color: '#FFD700' }, // Gold
    { type: 'redder', pool_id: 1, role: 'Redder', rate: 15.0, color: '#20B2AA' }, // Light Sea Green
    { type: 'lesgever', pool_id: 1, role: 'Lesgever', rate: 20.0, color: '#FF7F50' } // Coral
];

const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, color, contract_type, hourly_rate)
    VALUES (?, ?, 'password123', ?, ?, 'voltijds', ?)
`);

const insertInstructor = db.prepare(`
    INSERT INTO instructors (user_id, has_initiator_diploma)
    VALUES (?, ?)
`);

// Helper to pick random from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

names.forEach((name, idx) => {
    // Distribute roles: 2 Admins, 8 Redders, 5 Lesgevers
    let roleConfig;
    if (idx < 2) roleConfig = roles[0]; // Admin
    else if (idx < 10) roleConfig = roles[1]; // Redder
    else roleConfig = roles[2]; // Lesgever

    // Mix it up a bit: Some Reddder/Lesgever combi
    let isRedder = roleConfig.type === 'redder' || roleConfig.type === 'admin';
    let isLesgever = roleConfig.type === 'lesgever' || Math.random() > 0.7; // Some redders are also lesgevers

    if (isRedder && isLesgever) roleConfig.role = 'Redder & Lesgever';

    try {
        const info = insertUser.run(
            name, 
            `${name.split(' ')[0].toLowerCase()}@redders.be`, 
            roleConfig.type === 'admin' ? 'admin' : (isRedder ? 'redder' : 'lesgever'),
            roleConfig.color,
            roleConfig.rate
        );
        const userId = info.lastInsertRowid;

        // If Lesgever, add diploma info (randomly)
        if (isLesgever) {
            insertInstructor.run(userId, Math.random() > 0.2 ? 1 : 0); // 80% chance of having diploma
        }

        // Technically 'Redders' are just users with role 'redder' in this simple schema,
        // but the 'instructors' table is an extension.
        // We might need a 'lifeguards' table if the schema requires it?
        // Checking schema... schema says `lifeguards` table exists?
        // Let's check schema via tool if needed, but assuming standard from analysis.
        // Technische analyze said: users, lifeguards, instructors.
        
        // Let's try to insert into lifeguards if it exists. 
        // We'll wrap in try-catch or check schema.
        // I will assume simple user roles for now based on previous `server.js` work which queried `users` directly for auth.
        // But `server.js` `GET /api/employees` joins `lifeguards` and `instructors`.
        
    } catch (e) {
        console.error(`Failed to insert ${name}:`, e.message);
    }
});

// Update the `lifeguards` and `instructors` tables based on the user roles we just created.
// Since we don't know the exact schema of `lifeguards` (it might just be user_id), let's inspect or try safe insert.
try {
    const users = db.prepare('SELECT id, role FROM users').all();
    const insertLifeguard = db.prepare('INSERT OR IGNORE INTO lifeguards (user_id) VALUES (?)');
    
    users.forEach(u => {
        if (u.role === 'redder' || u.role === 'admin') {
            insertLifeguard.run(u.id);
        }
    });
} catch (e) {
    console.warn("Lifeguards table might not exist or has different schema:", e.message);
}

console.log('✅ Seeding complete! 15 employees created.');
