const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Đường dẫn database
const DB_PATH = path.join(__dirname, '../../data/bot.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Tạo thư mục data nếu chưa có
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Khởi tạo database
let db;
try {
  db = new Database(DB_PATH, { 
    verbose: console.log // Log SQL queries (tắt trong production)
  });
  
  // Enable WAL mode cho performance tốt hơn
  db.pragma('journal_mode = WAL');
  console.log('✅ Database connection established');
  
} catch (error) {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
}

/**
 * Khởi tạo database schema
 */
function initDatabase() {
  try {
    console.log('🔨 Initializing database schema...');
    
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    
    // Insert treasury row nếu chưa có
    const treasuryExists = db.prepare('SELECT id FROM treasury WHERE id = 1').get();
    if (!treasuryExists) {
      db.prepare('INSERT INTO treasury (id, balance) VALUES (1, 0)').run();
      console.log('✅ Treasury initialized');
    }
    
    console.log('✅ Database schema initialized!');
    
  } catch (error) {
    console.error('❌ Failed to initialize schema:', error);
    throw error;
  }
}

/**
 * Helper: Get user by ID (tạo nếu chưa có)
 */
function getOrCreateUser(userId, username = null) {
  let user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  
  if (!user) {
    db.prepare('INSERT INTO users (user_id, username, balance) VALUES (?, ?, 0)')
      .run(userId, username);
    user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
    console.log(`➕ Created new user: ${userId}`);
  }
  
  return user;
}

/**
 * Helper: Log transaction
 */
function logTransaction(userId, type, amount, extra = {}) {
  db.prepare(`
    INSERT INTO transactions (user_id, type, amount, from_user, to_user, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    userId, 
    type, 
    amount,
    extra.from_user || null,
    extra.to_user || null,
    extra.description || null
  );
}

/**
 * Helper: Update user balance
 */
function updateBalance(userId, amount) {
  const result = db.prepare(`
    UPDATE users 
    SET balance = balance + ? 
    WHERE user_id = ?
  `).run(amount, userId);
  
  return result.changes > 0;
}

/**
 * Helper: Get balance
 */
function getBalance(userId) {
  const user = getOrCreateUser(userId);
  return user.balance;
}

// Export
module.exports = {
  db,
  initDatabase,
  getOrCreateUser,
  logTransaction,
  updateBalance,
  getBalance
};