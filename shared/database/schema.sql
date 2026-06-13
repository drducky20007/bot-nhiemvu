<<<<<<< HEAD
<<<<<<< HEAD
-- =============================================
-- SCHEMA FOR DISCORD BOT DATABASE
-- =============================================

-- Bảng người dùng (thay userdata.json)
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng daily claims (thay lastDaily.json)
CREATE TABLE IF NOT EXISTS daily_claims (
    user_id TEXT PRIMARY KEY,
    last_claim_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng lương (thay salaryTable.json)
CREATE TABLE IF NOT EXISTS salaries (
    role_id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL
);

-- Bảng kho bạc (thay treasury.json)
CREATE TABLE IF NOT EXISTS treasury (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    balance INTEGER DEFAULT 0
);

-- Bảng giao dịch (thay historylog.json)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    from_user TEXT,
    to_user TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng lịch sử game Tài Xỉu
CREATE TABLE IF NOT EXISTS taixiu_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    bet_choice TEXT NOT NULL,
    result TEXT NOT NULL,
    dice1 INTEGER,
    dice2 INTEGER,
    dice3 INTEGER,
    bet_amount INTEGER,
    win_amount INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng nhiệm vụ (thay missions.json)
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    rank TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL,
    type TEXT NOT NULL,
    short TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Bảng nhiệm vụ của user (thay userMissions.json)
CREATE TABLE IF NOT EXISTS user_missions (
    user_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id)
);

-- Bảng log duyệt nhiệm vụ (thay task_logs.json)
CREATE TABLE IF NOT EXISTS task_logs (
    thread_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mission_id TEXT,
    passed BOOLEAN NOT NULL,
    word_count INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_taixiu_user ON taixiu_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
=======
-- =============================================
-- SCHEMA FOR DISCORD BOT DATABASE
-- =============================================

-- Bảng người dùng (thay userdata.json)
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng daily claims (thay lastDaily.json)
CREATE TABLE IF NOT EXISTS daily_claims (
    user_id TEXT PRIMARY KEY,
    last_claim_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng lương (thay salaryTable.json)
CREATE TABLE IF NOT EXISTS salaries (
    role_id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL
);

-- Bảng kho bạc (thay treasury.json)
CREATE TABLE IF NOT EXISTS treasury (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    balance INTEGER DEFAULT 0
);

-- Bảng giao dịch (thay historylog.json)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    from_user TEXT,
    to_user TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng lịch sử game Tài Xỉu
CREATE TABLE IF NOT EXISTS taixiu_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    bet_choice TEXT NOT NULL,
    result TEXT NOT NULL,
    dice1 INTEGER,
    dice2 INTEGER,
    dice3 INTEGER,
    bet_amount INTEGER,
    win_amount INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng nhiệm vụ (thay missions.json)
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    rank TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL,
    type TEXT NOT NULL,
    short TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Bảng nhiệm vụ của user (thay userMissions.json)
CREATE TABLE IF NOT EXISTS user_missions (
    user_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id)
);

-- Bảng log duyệt nhiệm vụ (thay task_logs.json)
CREATE TABLE IF NOT EXISTS task_logs (
    thread_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mission_id TEXT,
    passed BOOLEAN NOT NULL,
    word_count INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_taixiu_user ON taixiu_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
-- =============================================
-- SCHEMA FOR DISCORD BOT DATABASE
-- =============================================

-- Bảng người dùng (thay userdata.json)
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng daily claims (thay lastDaily.json)
CREATE TABLE IF NOT EXISTS daily_claims (
    user_id TEXT PRIMARY KEY,
    last_claim_time BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng lương (thay salaryTable.json)
CREATE TABLE IF NOT EXISTS salaries (
    role_id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL
);

-- Bảng kho bạc (thay treasury.json)
CREATE TABLE IF NOT EXISTS treasury (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    balance INTEGER DEFAULT 0
);

-- Bảng giao dịch (thay historylog.json)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    from_user TEXT,
    to_user TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng lịch sử game Tài Xỉu
CREATE TABLE IF NOT EXISTS taixiu_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    bet_choice TEXT NOT NULL,
    result TEXT NOT NULL,
    dice1 INTEGER,
    dice2 INTEGER,
    dice3 INTEGER,
    bet_amount INTEGER,
    win_amount INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng nhiệm vụ (thay missions.json)
CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    rank TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL,
    type TEXT NOT NULL,
    short TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Bảng nhiệm vụ của user (thay userMissions.json)
CREATE TABLE IF NOT EXISTS user_missions (
    user_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id)
);

-- Bảng log duyệt nhiệm vụ (thay task_logs.json)
CREATE TABLE IF NOT EXISTS task_logs (
    thread_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mission_id TEXT,
    passed BOOLEAN NOT NULL,
    word_count INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_taixiu_user ON taixiu_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
END;