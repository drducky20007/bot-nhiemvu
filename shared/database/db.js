const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/bot.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;
let SQL = null;

async function initDb() {
  if (db) return db; // Already initialized
  
  SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    console.log('✅ Database connection established');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

function getDb() {
  if (!db) throw new Error('Database not initialized! Call initDb() first');
  return db;
}

module.exports = {
  initDb,
  getDb,
  db: () => getDb()
};