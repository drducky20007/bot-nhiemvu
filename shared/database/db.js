const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/bot.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let SQL;
let sqlDb = null;

async function initDb() {
  SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      sqlDb = new SQL.Database(buffer);
    } else {
      sqlDb = new SQL.Database();
    }

        initDatabase();
    console.log('✅ Database connection established');
    return sqlDb;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

function initDatabase() {
  try {
    if (!sqlDb) return;
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    sqlDb.run(schema);
    saveDb();
    console.log('✅ Database schema initialized!');
  } catch (error) {
    console.error('❌ Failed to initialize schema:', error);
  }
}

// WRAPPER - Check if DB ready
const db = {
  prepare: (sql) => ({
    get: (...params) => {
      if (!sqlDb) {
        console.error('❌ DB not initialized yet!');
        return null;
      }
      try {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          return stmt.getAsObject();
        }
        stmt.free();
        return null;
      } catch (e) {
        console.error('❌ DB get error:', e);
        return null;
      }
    },
    all: (...params) => {
      if (!sqlDb) {
        console.error('❌ DB not initialized yet!');
        return [];
      }
      try {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      } catch (e) {
        console.error('❌ DB all error:', e);
        return [];
      }
    },
    run: (...params) => {
      if (!sqlDb) {
        console.error('❌ DB not initialized yet!');
        return { changes: 0 };
      }
      try {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        stmt.step();
        stmt.free();
        saveDb();
        return { changes: 1 };
      } catch (e) {
        console.error('❌ DB run error:', e);
        return { changes: 0 };
      }
    }
  }),
  exec: (sql) => {
    if (!sqlDb) {
      console.error('❌ DB not initialized yet!');
      return;
    }
    try {
      sqlDb.run(sql);
      saveDb();
    } catch (e) {
      console.error('❌ DB exec error:', e);
    }
  }
};

function saveDb() {
  if (sqlDb) {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function getOrCreateUser(userId, username = null) {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) {
    db.prepare('INSERT INTO users (user_id, username, balance) VALUES (?, ?, 0)')
      .run(userId, username);
  }
  return user;
}

module.exports = {
  initDb,
  db,
  saveDb,
  getOrCreateUser
};