-- Zwembadredders Planning Database Schema

-- Gebruikers (basis info voor alle medewerkers)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT, -- For future JWT implementation
    color TEXT DEFAULT '#3788d8',
    contract_type TEXT CHECK(contract_type IN ('voltijds', 'deeltijds')) DEFAULT 'deeltijds',
    role TEXT CHECK(role IN ('admin', 'redder', 'lesgever')) DEFAULT 'redder',
    hourly_rate REAL DEFAULT 38.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Redders (extended info)
CREATE TABLE IF NOT EXISTS lifeguards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    max_hours_month REAL DEFAULT 160,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Lesgevers (extended info)
CREATE TABLE IF NOT EXISTS instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    has_initiator_diploma INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Diploma's voor lesgevers
CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    obtained_date DATE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE
);

-- Zwembad locaties
CREATE TABLE IF NOT EXISTS pools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    surface_area REAL NOT NULL DEFAULT 250, -- m2, bepaalt aantal redders
    is_active INTEGER DEFAULT 1
);

-- Default zwembad
INSERT OR IGNORE INTO pools (id, name, surface_area) VALUES (1, 'Hoofdbad', 450);

-- Planning items
CREATE TABLE IF NOT EXISTS schedule_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pool_id INTEGER NOT NULL DEFAULT 1,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT CHECK(type IN ('redder', 'lesgever')) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
    -- Prevent overlapping shifts for the same user
    UNIQUE(user_id, date, start_time),
    -- Data sanity: end time must be after start time
    CHECK(end_time > start_time)
);

-- Verhuurperiodes (zwembad verhuurd = geen redders nodig)
CREATE TABLE IF NOT EXISTS rental_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renter_name TEXT,
    notes TEXT
);

-- Configuratie (bijv. max werkdagen)
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- Default configuratie
INSERT OR IGNORE INTO config (key, value, description) VALUES 
    ('max_consecutive_work_days', '7', 'Maximum aantal werkdagen achtereen'),
    ('required_rest_days', '2', 'Verplichte rustdagen na werkperiode'),
    ('min_hours_per_day', '4', 'Minimum werkuren per dag'),
    ('max_hours_per_day', '9', 'Maximum werkuren per dag');

-- Shift Requests (Verzoeken aan redders)
CREATE TABLE IF NOT EXISTS shift_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pool_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
    -- Prevent duplicate identical requests
    UNIQUE(user_id, pool_id, date, start_time, end_time),
    CHECK(end_time > start_time)
);

-- Sick Leaves (Audit log)
CREATE TABLE IF NOT EXISTS sick_leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    schedule_item_id INTEGER, -- Optional link to original shift
    date DATE NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shift Swaps (Marketplace)
CREATE TABLE IF NOT EXISTS shift_swaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_item_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    candidate_id INTEGER,
    status TEXT CHECK(status IN ('open', 'accepted_by_peer', 'approved', 'rejected')) DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_item_id) REFERENCES schedule_items(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE SET NULL
);
