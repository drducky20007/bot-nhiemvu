const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔧 Fixing mission progression columns...\n');

// Helper function to add column safely
function addColumnSafely(tableName, columnName, columnType, defaultValue = null) {
  try {
    const defaultClause = defaultValue !== null ? `DEFAULT ${defaultValue}` : '';
    const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType} ${defaultClause}`;
    db.exec(sql);
    console.log(`  ✅ Added ${tableName}.${columnName}`);
    return true;
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log(`  ⚠️  ${tableName}.${columnName} already exists - OK`);
      return true;
    } else {
      console.error(`  ❌ Failed to add ${tableName}.${columnName}: ${error.message}`);
      return false;
    }
  }
}

try {
  console.log('📝 Missions table:');
  addColumnSafely('missions', 'min_words', 'INTEGER', 500);
  addColumnSafely('missions', 'reward_exp', 'INTEGER', 0);
  addColumnSafely('missions', 'difficulty', 'TEXT', "'normal'");
  addColumnSafely('missions', 'emoji', 'TEXT', "'📝'");
  addColumnSafely('missions', 'is_active', 'INTEGER', 1);

  console.log('\n📝 User_missions table:');
  addColumnSafely('user_missions', 'thread_id', 'TEXT', null);
  addColumnSafely('user_missions', 'thread_url', 'TEXT', null);
  addColumnSafely('user_missions', 'submitted_at', 'TIMESTAMP', null);
  addColumnSafely('user_missions', 'completed_at', 'TIMESTAMP', null);

  console.log('\n📝 Task_logs table:');
  addColumnSafely('task_logs', 'reward_ely', 'INTEGER', 0);
  addColumnSafely('task_logs', 'reward_exp', 'INTEGER', 0);
  addColumnSafely('task_logs', 'points_earned', 'INTEGER', 0);
  addColumnSafely('task_logs', 'completed_at', 'TIMESTAMP', 'CURRENT_TIMESTAMP');

  console.log('\n📝 User_stats table:');
  addColumnSafely('user_stats', 'total_missions_completed', 'INTEGER', 0);
  addColumnSafely('user_stats', 'total_missions_failed', 'INTEGER', 0);
  addColumnSafely('user_stats', 'mission_streak_days', 'INTEGER', 0);
  addColumnSafely('user_stats', 'last_mission_completed_date', 'TEXT', null);

  console.log('\n📝 Adding achievements:');
  
  const achievements = [
    ['achievement_first_mission', '📝 Nhiệm Vụ Đầu Tiên', 'Hoàn thành nhiệm vụ đầu tiên', 'missions', 'total_missions_completed', 1, 500, '📝', 'common', 100],
    ['achievement_10_missions', '📋 Tác Giả', 'Hoàn thành 10 nhiệm vụ', 'missions', 'total_missions_completed', 10, 2000, '📋', 'rare', 101],
    ['achievement_50_missions', '✍️ Đại Văn Hào', 'Hoàn thành 50 nhiệm vụ', 'missions', 'total_missions_completed', 50, 10000, '✍️', 'epic', 102],
    ['achievement_100_missions', '🏆 Mission Master', 'Hoàn thành 100 nhiệm vụ', 'missions', 'total_missions_completed', 100, 25000, '🏆', 'legendary', 103],
    ['achievement_streak_7', '🔥 Week Warrior', '7-day mission streak', 'missions', 'mission_streak_days', 7, 5000, '🔥', 'rare', 104],
    ['achievement_streak_30', '💫 Monthly Master', '30-day mission streak', 'missions', 'mission_streak_days', 30, 20000, '💫', 'legendary', 105]
  ];

  const insertAch = db.prepare(`
    INSERT OR IGNORE INTO achievements 
    (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  achievements.forEach(ach => {
    insertAch.run(...ach);
    console.log(`  ✅ ${ach[1]}`);
  });

  console.log('\n✅ All columns and achievements added!\n');

  // Verify
  console.log('📊 Verification:\n');
  
  const missionsColumns = db.prepare("PRAGMA table_info(missions)").all();
  const hasRewardExp = missionsColumns.some(c => c.name === 'reward_exp');
  const hasDifficulty = missionsColumns.some(c => c.name === 'difficulty');
  
  if (hasRewardExp && hasDifficulty) {
    console.log('✅ missions table: OK');
  } else {
    console.log('❌ missions table: Missing columns!');
  }

  const achCount = db.prepare(`
    SELECT COUNT(*) as count FROM achievements WHERE category = 'missions'
  `).get();
  console.log(`✅ Mission achievements: ${achCount.count}/6\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

db.close();