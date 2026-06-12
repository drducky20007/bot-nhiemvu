const { db } = require('../db');

console.log('🔧 Updating rank tiers to 6 ranks (E, D, C, B, A, S)...\n');

try {
  // Clear old rank tiers
  db.prepare('DELETE FROM rank_tiers').run();
  console.log('✅ Cleared old rank tiers\n');

  // Insert 7 mission rank tiers
  console.log('📝 Inserting new rank tiers:\n');
  
  const ranks = [
    [1, 'E', '🔰', 0, null, '#3498db', 'Can accept E rank missions'],
    [5, 'D', '📘', 2000, null, '#1abc9c', 'Can accept E-D rank missions'],
    [10, 'C', '📗', 5000, null, '#2ecc71', 'Can accept E-C rank missions'],
    [15, 'B', '📙', 10000, null, '#f39c12', 'Can accept E-B rank missions'],
    [30, 'A', '📕', 30000, null, '#e74c3c', 'Can accept E-A rank missions'],
    [50, 'S', '⭐', 100000, null, '#f1c40f', 'Can accept all missions (E-S)']
  ];

  const insert = db.prepare(`
    INSERT INTO rank_tiers (level, tier_name, tier_emoji, required_exp, discord_role_id, color, perks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  ranks.forEach(rank => {
    insert.run(...rank);
    console.log(`  ✅ Level ${rank[0]}: ${rank[2]} ${rank[1]}-Rank - ${rank[3].toLocaleString()} EXP required`);
  });

  console.log('\n✅ Successfully updated rank tiers!\n');

  // Verify
  const count = db.prepare('SELECT COUNT(*) as count FROM rank_tiers').get();
  console.log(`📊 Verification: ${count.count}/6 rank tiers in database\n`);

  if (count.count === 6) {
    console.log('✅ Migration successful! All 6 ranks added.');
    
    console.log('\n📋 Rank progression:');
    console.log('   🔰 E-Rank (Lv 1)  → 📘 D-Rank (Lv 10)');
    console.log('   📘 D-Rank (Lv 10) → 📗 C-Rank (Lv 15)');
    console.log('   📗 C-Rank (Lv 15) → 📙 B-Rank (Lv 20)');
    console.log('   📙 B-Rank (Lv 20) → 📕 A-Rank (Lv 30)');
    console.log('   📕 A-Rank (Lv 30) → ⭐ S-Rank (Lv 50)');
    console.log('   ⭐ S-Rank (Lv 50+) → MAX RANK\n');
  } else {
    console.log('❌ Warning: Expected 6 ranks, but got', count.count);
  }

} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('🎉 Migration complete!\n');
