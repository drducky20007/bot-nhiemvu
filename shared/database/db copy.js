const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/bot.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;
let SQL;

async function initDb() {
  SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initDatabase() {
  try {
    console.log('🔨 Initializing database schema...');
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.run(schema);
    saveDb();
    console.log('✅ Database schema initialized!');
  } catch (error) {
    console.error('❌ Failed to initialize schema:', error);
  }
}

function getOrCreateUser(userId, username = null) {
  let user = db.exec('SELECT * FROM users WHERE user_id = ?', [userId]);
  
  if (!user || user.length === 0) {
    db.run('INSERT INTO users (user_id, username, balance) VALUES (?, ?, 0)', [userId, username]);
    saveDb();
    console.log(`➕ Created new user: ${userId}`);
  }
  
  return user;
}

module.exports = {
  db,
  initDb,
  initDatabase,
  getOrCreateUser,
  saveDb
};