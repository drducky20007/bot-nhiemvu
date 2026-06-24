const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const isAsherBot = __dirname.includes('asher-bot');
const DB_PATH = isAsherBot 
  ? path.join(__dirname, '../../data/asher-bot.db')
  : path.join(__dirname, '../../data/bot-nhiemvu.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let SQL = null;
let sqlDb = null;
let isInitialized = false;

// ========================================
// INITIALIZE DATABASE
// ========================================
async function initDb() {
  if (isInitialized) return sqlDb;
  
  try {
    SQL = await initSqlJs();
    
    // Load existing DB or create new
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      sqlDb = new SQL.Database(buffer);
      console.log('✅ Database loaded from file');
    } else {
      sqlDb = new SQL.Database();
      console.log('✅ Database created (new)');
    }
    
    // Initialize schema
    initDatabase();
    
    isInitialized = true;
    console.log('✅ Database connection established');
    return sqlDb;
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

// ========================================
// CREATE SCHEMA
// ========================================
function initDatabase() {
  if (!sqlDb) {
    console.error('❌ DB not initialized!');
    return;
  }
  
  try {
    console.log('🔨 Initializing database schema...');
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    // Execute schema
    sqlDb.run(schema);
    
    // Save to file
    saveDb();
    
    console.log('✅ Database schema initialized!');
  } catch (error) {
    // Schema may already exist - that's ok
    console.log('ℹ️  Schema check: ' + error.message);
  }
}

// ========================================
// SAVE DATABASE TO FILE
// ========================================
function saveDb() {
  if (!sqlDb) return;
  
  try {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(DB_PATH, buffer);
  } catch (error) {
    console.error('❌ Failed to save database:', error);
  }
}

// ========================================
// DATABASE WRAPPER - Mimic better-sqlite3 API
// ========================================
const db = {
  prepare: (sql) => ({
    get: (...params) => {
      if (!sqlDb) {
        console.error('❌ Database not initialized!');
        return null;
      }
      
      try {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        
        if (stmt.step()) {
          const result = stmt.getAsObject();
          stmt.free();
          return result;
        }
        
        stmt.free();
        return null;
      } catch (error) {
        console.error('❌ DB get error:', error.message);
        console.error('   SQL:', sql);
        console.error('   Params:', params);
        return null;
      }
    },
    
    all: (...params) => {
      if (!sqlDb) {
        console.error('❌ Database not initialized!');
        return [];
      }
      
      try {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      } catch (error) {
        console.error('❌ DB all error:', error.message);
        console.error('   SQL:', sql);
        console.error('   Params:', params);
        return [];
      }
    },
    
    run: (...params) => {
      if (!sqlDb) {
        console.error('❌ Database not initialized!');
        return { changes: 0 };
      }
      
      try {
        const stmt = sqlDb.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        
        stmt.step();
        stmt.free();
        
        // Save after every write
        saveDb();
        
        return { changes: 1 };
      } catch (error) {
        console.error('❌ DB run error:', error.message);
        console.error('   SQL:', sql);
        console.error('   Params:', params);
        return { changes: 0 };
      }
    }
  }),
  
  exec: (sql) => {
    if (!sqlDb) {
      console.error('❌ Database not initialized!');
      return;
    }
    
    try {
      sqlDb.run(sql);
      saveDb();
    } catch (error) {
      console.error('❌ DB exec error:', error.message);
    }
  },
  
  transaction: (fn) => {
    return (...args) => {
      if (!sqlDb) {
        console.error('❌ Database not initialized!');
        throw new Error('Database not initialized');
      }
      
      try {
        // sql.js doesn't support BEGIN/COMMIT - just run the function
        const result = fn(...args);
        saveDb();
        return result;
      } catch (error) {
        console.error('❌ Transaction error:', error.message);
        throw error;
      }
    };
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================
function getOrCreateUser(userId, username = null) {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  
  if (!user) {
    db.prepare('INSERT INTO users (user_id, username, balance) VALUES (?, ?, 0)')
      .run(userId, username);
    console.log(`➕ Created new user: ${userId}`);
    return db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  }
  
  return user;
}

// ========================================
// EXPORTS
// ========================================
module.exports = {
  initDb,
  db,
  saveDb,
  initDatabase,
  getOrCreateUser
};
