const fs = require('fs');
const path = require('path');
const { db, initDatabase } = require('./db');

console.log('🚀 Starting migration from JSON to SQLite...\n');

/**
 * Main migration function
 */
function migrateData() {
  try {
    // 1. Initialize database
    initDatabase();
    
    // 2. Migrate users
    migrateUsers();
    
    // 3. Migrate daily claims
    migrateDailyClaims();
    
    // 4. Migrate salaries
    migrateSalaries();
    
    // 5. Migrate treasury
    migrateTreasury();
    
    // 6. Migrate transactions
    migrateTransactions();
    
    // 7. Migrate taixiu history
    migrateTaixiuHistory();
    
    // 8. Migrate missions
    migrateMissions();
    
    // 9. Migrate user missions
    migrateUserMissions();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Please verify data before using in production.\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Migrate users from userdata.json
 */
function migrateUsers() {
  const filePath = path.join(__dirname, '../../asher-bot/data/userdata.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  userdata.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const insert = db.prepare('INSERT OR REPLACE INTO users (user_id, balance) VALUES (?, ?)');
    
    const transaction = db.transaction((users) => {
      for (const [userId, userData] of Object.entries(users)) {
        insert.run(userId, userData.balance || 0);
      }
    });
    
    transaction(data);
    console.log(`✅ Migrated ${Object.keys(data).length} users`);
    
  } catch (error) {
    console.error('❌ Error migrating users:', error.message);
  }
}

/**
 * Migrate daily claims from lastDaily.json
 */
function migrateDailyClaims() {
  const filePath = path.join(__dirname, '../../asher-bot/data/lastDaily.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  lastDaily.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const insert = db.prepare('INSERT OR REPLACE INTO daily_claims (user_id, last_claim_time) VALUES (?, ?)');
    
    const transaction = db.transaction((claims) => {
      for (const [userId, timestamp] of Object.entries(claims)) {
        insert.run(userId, timestamp);
      }
    });
    
    transaction(data);
    console.log(`✅ Migrated ${Object.keys(data).length} daily claims`);
    
  } catch (error) {
    console.error('❌ Error migrating daily claims:', error.message);
  }
}

/**
 * Migrate salaries from salaryTable.json
 */
function migrateSalaries() {
  const filePath = path.join(__dirname, '../../asher-bot/data/salaryTable.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  salaryTable.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const insert = db.prepare('INSERT OR REPLACE INTO salaries (role_id, amount) VALUES (?, ?)');
    
    const transaction = db.transaction((salaries) => {
      for (const [roleId, amount] of Object.entries(salaries)) {
        insert.run(roleId, amount);
      }
    });
    
    transaction(data);
    console.log(`✅ Migrated ${Object.keys(data).length} salary entries`);
    
  } catch (error) {
    console.error('❌ Error migrating salaries:', error.message);
  }
}

/**
 * Migrate treasury from treasury.json
 */
function migrateTreasury() {
  const filePath = path.join(__dirname, '../../asher-bot/data/treasury.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  treasury.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    db.prepare('UPDATE treasury SET balance = ? WHERE id = 1').run(data.balance || 0);
    
    console.log(`✅ Migrated treasury balance: ${data.balance || 0}`);
    
  } catch (error) {
    console.error('❌ Error migrating treasury:', error.message);
  }
}

/**
 * Migrate transactions from historylog.json
 */
function migrateTransactions() {
  const filePath = path.join(__dirname, '../../asher-bot/data/historylog.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  historylog.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const insert = db.prepare(`
      INSERT INTO transactions (user_id, type, amount, from_user, to_user, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((logs) => {
      for (const log of logs) {
        insert.run(
          log.userId,
          log.type,
          log.amount,
          log.from || null,
          log.to || null,
          log.timestamp
        );
      }
    });
    
    transaction(data);
    console.log(`✅ Migrated ${data.length} transaction logs`);
    
  } catch (error) {
    console.error('❌ Error migrating transactions:', error.message);
  }
}

/**
 * Migrate taixiu history from taixiuHistory.json
 */
function migrateTaixiuHistory() {
  const filePath = path.join(__dirname, '../../asher-bot/data/taixiuHistory.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  taixiuHistory.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // ✅ Filter valid records
    const validRecords = data.filter(record => {
      if (!record.userId) {
        console.log(`⚠️  Skipping record without userId`);
        return false;
      }
      if (!record.dice || !Array.isArray(record.dice) || record.dice.length !== 3) {
        console.log(`⚠️  Skipping record with invalid dice for user ${record.userId}`);
        return false;
      }
      return true;
    });
    
    console.log(`📊 Valid records: ${validRecords.length} / ${data.length}`);
    
    if (validRecords.length === 0) {
      console.log('⚠️  No valid taixiu history to migrate');
      return;
    }
    
    const insert = db.prepare(`
      INSERT INTO taixiu_history (user_id, bet_choice, result, dice1, dice2, dice3, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((history) => {
      for (const record of history) {
        try {
          insert.run(
            record.userId,
            record.luaChon || 'tai',
            record.ketqua || 'tai',
            record.dice[0],
            record.dice[1],
            record.dice[2],
            record.timestamp || new Date().toISOString()
          );
        } catch (err) {
          console.log(`⚠️  Error inserting record for user ${record.userId}: ${err.message}`);
        }
      }
    });
    
    transaction(validRecords);
    console.log(`✅ Migrated ${validRecords.length} taixiu history records`);
    
  } catch (error) {
    console.error('❌ Error migrating taixiu history:', error.message);
  }
}

/**
 * Migrate missions from missions.json
 */
function migrateMissions() {
  const filePath = path.join(__dirname, '../../bot-nhiemvu/data/missions.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  missions.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const insert = db.prepare(`
      INSERT OR REPLACE INTO missions (id, rank, title, description, reward, type, short)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction((missions) => {
      for (const mission of missions) {
        insert.run(
          mission.id || mission.Id, // Handle both 'id' and 'Id'
          mission.rank,
          mission.title,
          mission.description,
          mission.reward,
          mission.type,
          mission.short
        );
      }
    });
    
    transaction(data);
    console.log(`✅ Migrated ${data.length} missions`);
    
  } catch (error) {
    console.error('❌ Error migrating missions:', error.message);
  }
}

/**
 * Migrate user missions from userMissions.json
 */
function migrateUserMissions() {
  const filePath = path.join(__dirname, '../../bot-nhiemvu/data/userMissions.json');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  userMissions.json not found, skipping...');
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const insert = db.prepare(`
      INSERT OR REPLACE INTO user_missions (user_id, mission_id, status)
      VALUES (?, ?, ?)
    `);
    
    let count = 0;
    const transaction = db.transaction((userMissions) => {
      for (const [userId, missionData] of Object.entries(userMissions)) {
        // Skip if pendingChoices (not accepted yet)
        if (missionData.pendingChoices) continue;
        
        insert.run(userId, missionData.missionId, 'active');
        count++;
      }
    });
    
    transaction(data);
    console.log(`✅ Migrated ${count} user missions`);
    
  } catch (error) {
    console.error('❌ Error migrating user missions:', error.message);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };