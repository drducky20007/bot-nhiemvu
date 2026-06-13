const Database = require('sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/bot.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Tạo thư mục data
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Khởi tạo DB (SYNCHRONOUS - không cần async!)
let db;
try {
  db = new Database(DB_PATH);
  console.log('✅ Database connection established');
} catch (error) {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
}

function initDatabase() {
  try {
    console.log('🔨 Initializing database schema...');
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('✅ Database schema initialized!');
  } catch (error) {
    console.error('❌ Failed to initialize schema:', error);
  }
}

function getOrCreateUser(userId, username = null) {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  
  if (!user) {
    db.prepare('INSERT INTO users (user_id, username, balance) VALUES (?, ?, 0)')
      .run(userId, username);
    console.log(`➕ Created new user: ${userId}`);
  }
  
  return user;
}

module.exports = {
  db,
  initDatabase,
  getOrCreateUser
};