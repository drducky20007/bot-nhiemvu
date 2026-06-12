const Database = require('better-sqlite3');
const path = require('path');
const roleConfig = require('../config/roleRewards');

const dbPath = path.join(__dirname, '../../data/bot.db');
const db = new Database(dbPath);

console.log('🌱 Seeding role rewards...\n');

const insert = db.prepare(`
  INSERT INTO role_rewards 
  (reward_type, requirement_type, requirement_value, role_id, role_name, role_color, auto_remove_previous, priority)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const transaction = db.transaction(() => {
  // Level roles
  roleConfig.levelRoles.forEach(role => {
    insert.run(
      'level',
      'level',
      role.level.toString(),
      role.roleId,
      role.roleName,
      role.color,
      role.autoRemovePrevious ? 1 : 0,
      role.priority
    );
    console.log(`✅ ${role.roleName} (Level ${role.level})`);
  });

  // Wealth roles
  roleConfig.wealthRoles.forEach(role => {
    insert.run(
      'wealth',
      'balance',
      role.balance.toString(),
      role.roleId,
      role.roleName,
      role.color,
      role.autoRemovePrevious ? 1 : 0,
      role.priority
    );
    console.log(`✅ ${role.roleName} (${role.balance.toLocaleString()} Ely)`);
  });

  // Achievement roles
  roleConfig.achievementRoles.forEach(role => {
    insert.run(
      'achievement',
      'achievement_id',
      role.achievementId,
      role.roleId,
      role.roleName,
      role.color,
      role.autoRemovePrevious ? 1 : 0,
      role.priority
    );
    console.log(`✅ ${role.roleName} (${role.achievementId})`);
  });

  // Special roles
  roleConfig.specialRoles.forEach(role => {
    insert.run(
      'special',
      'manual',
      role.id,
      role.roleId,
      role.roleName,
      role.color,
      role.autoRemovePrevious ? 1 : 0,
      role.priority
    );
    console.log(`✅ ${role.roleName} (Special)`);
  });
});

transaction();

const total = db.prepare('SELECT COUNT(*) as count FROM role_rewards').get();
console.log(`\n🎉 Seeded ${total.count} role rewards!\n`);

db.close();