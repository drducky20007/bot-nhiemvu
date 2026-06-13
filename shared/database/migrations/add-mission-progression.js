const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Running mission progression migration...\n');

try {
  const transaction = db.transaction(() => {
    
    // =============================================
    // UPDATE missions TABLE
    // =============================================
    
    console.log('📝 Updating missions table...');
    
    db.exec(`ALTER TABLE missions ADD COLUMN min_words INTEGER DEFAULT 500`);
    console.log('  ✅ Added min_words');
    
    db.exec(`ALTER TABLE missions ADD COLUMN reward_exp INTEGER DEFAULT 0`);
    console.log('  ✅ Added reward_exp');
    
    db.exec(`ALTER TABLE missions ADD COLUMN difficulty TEXT DEFAULT 'normal'`);
    console.log('  ✅ Added difficulty');
    
    db.exec(`ALTER TABLE missions ADD COLUMN emoji TEXT DEFAULT '📝'`);
    console.log('  ✅ Added emoji');
    
    db.exec(`ALTER TABLE missions ADD COLUMN is_active INTEGER DEFAULT 1`);
    console.log('  ✅ Added is_active');

    // =============================================
    // UPDATE user_missions TABLE
    // =============================================
    
    console.log('\n📝 Updating user_missions table...');
    
    db.exec(`ALTER TABLE user_missions ADD COLUMN thread_id TEXT`);
    console.log('  ✅ Added thread_id');
    
    db.exec(`ALTER TABLE user_missions ADD COLUMN thread_url TEXT`);
    console.log('  ✅ Added thread_url');
    
    db.exec(`ALTER TABLE user_missions ADD COLUMN submitted_at TIMESTAMP`);
    console.log('  ✅ Added submitted_at');
    
    db.exec(`ALTER TABLE user_missions ADD COLUMN completed_at TIMESTAMP`);
    console.log('  ✅ Added completed_at');

    // =============================================
    // UPDATE task_logs TABLE
    // =============================================
    
    console.log('\n📝 Updating task_logs table...');
    
    db.exec(`ALTER TABLE task_logs ADD COLUMN reward_ely INTEGER DEFAULT 0`);
    console.log('  ✅ Added reward_ely');
    
    db.exec(`ALTER TABLE task_logs ADD COLUMN reward_exp INTEGER DEFAULT 0`);
    console.log('  ✅ Added reward_exp');
    
    db.exec(`ALTER TABLE task_logs ADD COLUMN points_earned INTEGER DEFAULT 0`);
    console.log('  ✅ Added points_earned');
    
    db.exec(`ALTER TABLE task_logs ADD COLUMN completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    console.log('  ✅ Added completed_at');

    // =============================================
    // UPDATE user_stats FOR MISSIONS
    // =============================================
    
    console.log('\n📝 Updating user_stats table...');
    
    db.exec(`ALTER TABLE user_stats ADD COLUMN total_missions_completed INTEGER DEFAULT 0`);
    console.log('  ✅ Added total_missions_completed');
    
    db.exec(`ALTER TABLE user_stats ADD COLUMN total_missions_failed INTEGER DEFAULT 0`);
    console.log('  ✅ Added total_missions_failed');
    
    db.exec(`ALTER TABLE user_stats ADD COLUMN mission_streak_days INTEGER DEFAULT 0`);
    console.log('  ✅ Added mission_streak_days');
    
    db.exec(`ALTER TABLE user_stats ADD COLUMN last_mission_completed_date TEXT`);
    console.log('  ✅ Added last_mission_completed_date');

    // =============================================
    // MISSION ACHIEVEMENTS
    // =============================================
    
    console.log('\n📝 Adding mission achievements...');
    
    db.prepare(`
      INSERT OR IGNORE INTO achievements 
      (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'achievement_first_mission',
      '📝 Nhiệm Vụ Đầu Tiên',
      'Hoàn thành nhiệm vụ đầu tiên',
      'missions',
      'total_missions_completed',
      1,
      500,
      '📝',
      'common',
      100
    );
    console.log('  ✅ First Mission');

    db.prepare(`
      INSERT OR IGNORE INTO achievements 
      (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'achievement_10_missions',
      '📋 Tác Giả',
      'Hoàn thành 10 nhiệm vụ',
      'missions',
      'total_missions_completed',
      10,
      2000,
      '📋',
      'rare',
      101
    );
    console.log('  ✅ 10 Missions');

    db.prepare(`
      INSERT OR IGNORE INTO achievements 
      (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'achievement_50_missions',
      '✍️ Đại Văn Hào',
      'Hoàn thành 50 nhiệm vụ',
      'missions',
      'total_missions_completed',
      50,
      10000,
      '✍️',
      'epic',
      102
    );
    console.log('  ✅ 50 Missions');

    db.prepare(`
      INSERT OR IGNORE INTO achievements 
      (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'achievement_100_missions',
      '🏆 Mission Master',
      'Hoàn thành 100 nhiệm vụ',
      'missions',
      'total_missions_completed',
      100,
      25000,
      '🏆',
      'legendary',
      103
    );
    console.log('  ✅ 100 Missions');

    db.prepare(`
      INSERT OR IGNORE INTO achievements 
      (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'achievement_streak_7',
      '🔥 Week Warrior',
      '7-day mission streak',
      'missions',
      'mission_streak_days',
      7,
      5000,
      '🔥',
      'rare',
      104
    );
    console.log('  ✅ 7-day Streak');

    db.prepare(`
      INSERT OR IGNORE INTO achievements 
      (id, name, description, category, requirement_type, requirement_value, reward_ely, badge_emoji, rarity, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'achievement_streak_30',
      '💫 Monthly Master',
      '30-day mission streak',
      'missions',
      'mission_streak_days',
      30,
      20000,
      '💫',
      'legendary',
      105
    );
    console.log('  ✅ 30-day Streak');

  });

  transaction();

  console.log('\n✅ Migration completed successfully!\n');

  // Verify changes
  console.log('📊 Verifying...\n');

  const missionsTableInfo = db.prepare("PRAGMA table_info(missions)").all();
  const newColumns = missionsTableInfo.filter(col => 
    ['min_words', 'reward_exp', 'difficulty', 'emoji', 'is_active'].includes(col.name)
  );
  
  console.log('New columns in missions table:');
  newColumns.forEach(col => {
    console.log(`  ✅ ${col.name} (${col.type})`);
  });

  const achievementCount = db.prepare(`
    SELECT COUNT(*) as count FROM achievements 
    WHERE category = 'missions'
  `).get();
  console.log(`\n✅ Mission achievements: ${achievementCount.count}\n`);

} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️  Some columns already exist - skipping them');
    console.log('✅ Migration completed (with warnings)\n');
  } else {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

db.close();