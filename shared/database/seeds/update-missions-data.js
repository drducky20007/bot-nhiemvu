const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🔄 Updating missions with EXP and difficulty...\n');

// Difficulty and EXP multipliers for each rank (6 ranks only)
const difficultyMap = {
  'E': { difficulty: 'easy', minWords: 400, expMultiplier: 0.7 },
  'D': { difficulty: 'normal', minWords: 500, expMultiplier: 1.0 },
  'C': { difficulty: 'normal', minWords: 600, expMultiplier: 1.2 },
  'B': { difficulty: 'hard', minWords: 800, expMultiplier: 1.5 },
  'A': { difficulty: 'hard', minWords: 1000, expMultiplier: 2.0 },
  'S': { difficulty: 'special', minWords: 1500, expMultiplier: 3.0 }
};

// Emoji for each rank
const emojiMap = {
  'E': '🔰',
  'D': '📘',
  'C': '📗',
  'B': '📙',
  'A': '📕',
  'S': '⭐'
};

try {
  const updateTransaction = db.transaction(() => {
    // Get all missions
    const missions = db.prepare('SELECT * FROM missions').all();
    
    console.log(`📊 Found ${missions.length} missions to update\n`);

    // Update each mission
    const updateStmt = db.prepare(`
      UPDATE missions 
      SET 
        min_words = ?,
        reward_exp = ?,
        difficulty = ?,
        emoji = ?
      WHERE id = ?
    `);

    let updated = 0;

    for (const mission of missions) {
      const rank = mission.rank || 'F';
      const config = difficultyMap[rank] || difficultyMap['F'];
      
      const minWords = config.minWords;
      const expMultiplier = config.expMultiplier;
      const difficulty = config.difficulty;
      const emoji = emojiMap[rank] || '📝';
      
      // Calculate reward_exp based on reward and multiplier
      const rewardEly = mission.reward || 500;
      const rewardExp = Math.floor(rewardEly * expMultiplier);

      // Update mission - CORRECT PARAMETER ORDER!
      updateStmt.run(minWords, rewardExp, difficulty, emoji, mission.id);
      
      updated++;
      console.log(`  ✅ ${emoji} ${rank}-Rank Mission #${mission.id}: ${minWords} words, ${rewardExp} EXP`);
    }

    console.log(`\n✅ Updated ${updated} missions!`);
  });

  updateTransaction();

  // Verify
  console.log('\n📊 Verification:\n');
  
  const stats = db.prepare(`
    SELECT 
      rank,
      COUNT(*) as count,
      AVG(min_words) as avg_words,
      AVG(reward_exp) as avg_exp
    FROM missions
    WHERE rank IS NOT NULL
    GROUP BY rank
    ORDER BY 
      CASE rank
        WHEN 'S' THEN 6
        WHEN 'A' THEN 5
        WHEN 'B' THEN 4
        WHEN 'C' THEN 3
        WHEN 'D' THEN 2
        WHEN 'E' THEN 1
      END DESC
  `).all();

  stats.forEach(stat => {
    const emoji = emojiMap[stat.rank] || '📝';
    console.log(`  ${emoji} ${stat.rank}-Rank: ${stat.count} missions, Avg ${Math.round(stat.avg_words)} words, Avg ${Math.round(stat.avg_exp)} EXP`);
  });

  console.log('\n✅ Mission data update complete!\n');

} catch (error) {
  console.error('\n❌ Error updating missions:', error.message);
  console.error(error.stack);
  process.exit(1);
}

db.close();
