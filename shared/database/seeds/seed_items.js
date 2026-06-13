<<<<<<< HEAD
<<<<<<< HEAD
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🌱 Seeding sample items...\n');

const items = [
  // ========================================
  // ROLES
  // ========================================
  {
    id: 'item_vip_role',
    name: '👑 VIP Role',
    description: 'Role VIP với màu vàng và quyền đặc biệt',
    category: 'role',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 50000,
    metadata: JSON.stringify({ role_id: 'YOUR_VIP_ROLE_ID_HERE' })
  },
  {
    id: 'item_mvp_role',
    name: '💎 MVP Role',
    description: 'Role cao cấp nhất với màu rainbow',
    category: 'role',
    rarity: 'legendary',
    is_tradeable: 1,
    base_price: 100000,
    metadata: JSON.stringify({ role_id: 'YOUR_MVP_ROLE_ID_HERE' })
  },
  {
    id: 'item_supporter_role',
    name: '❤️ Supporter Role',
    description: 'Role dành cho người ủng hộ server',
    category: 'role',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 30000,
    metadata: JSON.stringify({ role_id: 'YOUR_SUPPORTER_ROLE_ID_HERE' })
  },
  {
    id: 'item_exclusive_role',
    name: '✨ Exclusive Role',
    description: 'Role giới hạn, chỉ 10 người có được',
    category: 'role',
    rarity: 'legendary',
    is_tradeable: 0, // Soulbound - không trade được
    base_price: 500000,
    metadata: JSON.stringify({ role_id: 'YOUR_EXCLUSIVE_ROLE_ID_HERE', max_holders: 10 })
  },

  // ========================================
  // CONSUMABLES
  // ========================================
  {
    id: 'item_exp_boost_1h',
    name: '⚡ 2x EXP Boost (1h)',
    description: 'Nhân đôi EXP trong 1 giờ',
    category: 'consumable',
    rarity: 'common',
    is_tradeable: 1,
    base_price: 2000,
    metadata: JSON.stringify({ duration: 3600, multiplier: 2 })
  },
  {
    id: 'item_exp_boost_6h',
    name: '⚡ 3x EXP Boost (6h)',
    description: 'Nhân 3 EXP trong 6 giờ',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 10000,
    metadata: JSON.stringify({ duration: 21600, multiplier: 3 })
  },
  {
    id: 'item_ely_boost_2h',
    name: '💰 2x Ely Boost (2h)',
    description: 'Nhân đôi Ely khi chơi game trong 2 giờ',
    category: 'consumable',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ duration: 7200, multiplier: 2 })
  },
  {
    id: 'item_lucky_charm',
    name: '🍀 Lucky Charm',
    description: 'Tăng 15% tỷ lệ thắng trong 30 phút',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 15000,
    metadata: JSON.stringify({ duration: 1800, luck_bonus: 15 })
  },
  {
    id: 'item_daily_reset',
    name: '🔄 Daily Reset Ticket',
    description: 'Reset lại daily reward (dùng được 1 lần/tuần)',
    category: 'consumable',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 8000,
    metadata: JSON.stringify({ cooldown: 604800 })
  },

  // ========================================
  // COLLECTIBLES
  // ========================================
  {
    id: 'item_gold_coin',
    name: '🪙 Gold Coin',
    description: 'Đồng xu vàng quý hiếm - có thể dùng để trade',
    category: 'collectible',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 1000,
    metadata: JSON.stringify({ collection: 'coins' })
  },
  {
    id: 'item_diamond',
    name: '💎 Diamond',
    description: 'Kim cương hiếm - giá trị cao',
    category: 'collectible',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ collection: 'gems' })
  },
  {
    id: 'item_legendary_sword',
    name: '⚔️ Legendary Sword',
    description: 'Thanh kiếm huyền thoại - chỉ có 5 thanh tồn tại',
    category: 'collectible',
    rarity: 'legendary',
    is_tradeable: 1,
    base_price: 100000,
    metadata: JSON.stringify({ collection: 'weapons', edition: 5 })
  },
  {
    id: 'item_founder_badge',
    name: '🏆 Founder Badge',
    description: 'Badge dành cho người ủng hộ từ đầu',
    category: 'collectible',
    rarity: 'legendary',
    is_tradeable: 0, // Soulbound
    base_price: 0,
    metadata: JSON.stringify({ special: true })
  },

  // ========================================
  // SERVICES
  // ========================================
  {
    id: 'item_name_change',
    name: '📝 Name Change Ticket',
    description: 'Đổi nickname trong server (1 lần)',
    category: 'service',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ uses: 1 })
  },
  {
    id: 'item_custom_color',
    name: '🎨 Custom Role Color',
    description: 'Đổi màu role thành màu tùy chỉnh',
    category: 'service',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 10000,
    metadata: JSON.stringify({ uses: 1 })
  },
  {
    id: 'item_channel_access_1d',
    name: '🔓 VIP Channel Access (1 day)',
    description: 'Truy cập channels VIP trong 1 ngày',
    category: 'service',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 3000,
    metadata: JSON.stringify({ duration: 86400 })
  },
  {
    id: 'item_premium_support',
    name: '⭐ Premium Support Ticket',
    description: 'Ưu tiên hỗ trợ từ staff',
    category: 'service',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 20000,
    metadata: JSON.stringify({ priority: 1 })
  },

  // ========================================
  // SPECIAL/SEASONAL
  // ========================================
  {
    id: 'item_christmas_box',
    name: '🎁 Christmas Mystery Box',
    description: 'Hộp quà giáng sinh - chứa items ngẫu nhiên',
    category: 'consumable',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 25000,
    metadata: JSON.stringify({ seasonal: 'christmas', mystery: true })
  },
  {
    id: 'item_lunar_new_year_envelope',
    name: '🧧 Lucky Red Envelope',
    description: 'Lì xì Tết - chứa Ely ngẫu nhiên (1000-10000)',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ seasonal: 'tet', random_ely: [1000, 10000] })
  }
];

// Insert items
const insert = db.prepare(`
  INSERT OR REPLACE INTO registered_items 
  (id, name, description, category, rarity, is_tradeable, base_price, metadata, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system')
`);

const transaction = db.transaction(() => {
  items.forEach(item => {
    insert.run(
      item.id,
      item.name,
      item.description,
      item.category,
      item.rarity,
      item.is_tradeable,
      item.base_price,
      item.metadata
    );
    console.log(`✅ ${item.name}`);
  });
});

transaction();

console.log(`\n🎉 Seeded ${items.length} items!\n`);

// Stats
const stats = {
  roles: items.filter(i => i.category === 'role').length,
  consumables: items.filter(i => i.category === 'consumable').length,
  collectibles: items.filter(i => i.category === 'collectible').length,
  services: items.filter(i => i.category === 'service').length,
  tradeable: items.filter(i => i.is_tradeable === 1).length,
  soulbound: items.filter(i => i.is_tradeable === 0).length
};

console.log('📊 Statistics:');
console.log(`   Roles: ${stats.roles}`);
console.log(`   Consumables: ${stats.consumables}`);
console.log(`   Collectibles: ${stats.collectibles}`);
console.log(`   Services: ${stats.services}`);
console.log(`   Tradeable: ${stats.tradeable}`);
console.log(`   Soulbound: ${stats.soulbound}\n`);

=======
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🌱 Seeding sample items...\n');

const items = [
  // ========================================
  // ROLES
  // ========================================
  {
    id: 'item_vip_role',
    name: '👑 VIP Role',
    description: 'Role VIP với màu vàng và quyền đặc biệt',
    category: 'role',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 50000,
    metadata: JSON.stringify({ role_id: 'YOUR_VIP_ROLE_ID_HERE' })
  },
  {
    id: 'item_mvp_role',
    name: '💎 MVP Role',
    description: 'Role cao cấp nhất với màu rainbow',
    category: 'role',
    rarity: 'legendary',
    is_tradeable: 1,
    base_price: 100000,
    metadata: JSON.stringify({ role_id: 'YOUR_MVP_ROLE_ID_HERE' })
  },
  {
    id: 'item_supporter_role',
    name: '❤️ Supporter Role',
    description: 'Role dành cho người ủng hộ server',
    category: 'role',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 30000,
    metadata: JSON.stringify({ role_id: 'YOUR_SUPPORTER_ROLE_ID_HERE' })
  },
  {
    id: 'item_exclusive_role',
    name: '✨ Exclusive Role',
    description: 'Role giới hạn, chỉ 10 người có được',
    category: 'role',
    rarity: 'legendary',
    is_tradeable: 0, // Soulbound - không trade được
    base_price: 500000,
    metadata: JSON.stringify({ role_id: 'YOUR_EXCLUSIVE_ROLE_ID_HERE', max_holders: 10 })
  },

  // ========================================
  // CONSUMABLES
  // ========================================
  {
    id: 'item_exp_boost_1h',
    name: '⚡ 2x EXP Boost (1h)',
    description: 'Nhân đôi EXP trong 1 giờ',
    category: 'consumable',
    rarity: 'common',
    is_tradeable: 1,
    base_price: 2000,
    metadata: JSON.stringify({ duration: 3600, multiplier: 2 })
  },
  {
    id: 'item_exp_boost_6h',
    name: '⚡ 3x EXP Boost (6h)',
    description: 'Nhân 3 EXP trong 6 giờ',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 10000,
    metadata: JSON.stringify({ duration: 21600, multiplier: 3 })
  },
  {
    id: 'item_ely_boost_2h',
    name: '💰 2x Ely Boost (2h)',
    description: 'Nhân đôi Ely khi chơi game trong 2 giờ',
    category: 'consumable',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ duration: 7200, multiplier: 2 })
  },
  {
    id: 'item_lucky_charm',
    name: '🍀 Lucky Charm',
    description: 'Tăng 15% tỷ lệ thắng trong 30 phút',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 15000,
    metadata: JSON.stringify({ duration: 1800, luck_bonus: 15 })
  },
  {
    id: 'item_daily_reset',
    name: '🔄 Daily Reset Ticket',
    description: 'Reset lại daily reward (dùng được 1 lần/tuần)',
    category: 'consumable',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 8000,
    metadata: JSON.stringify({ cooldown: 604800 })
  },

  // ========================================
  // COLLECTIBLES
  // ========================================
  {
    id: 'item_gold_coin',
    name: '🪙 Gold Coin',
    description: 'Đồng xu vàng quý hiếm - có thể dùng để trade',
    category: 'collectible',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 1000,
    metadata: JSON.stringify({ collection: 'coins' })
  },
  {
    id: 'item_diamond',
    name: '💎 Diamond',
    description: 'Kim cương hiếm - giá trị cao',
    category: 'collectible',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ collection: 'gems' })
  },
  {
    id: 'item_legendary_sword',
    name: '⚔️ Legendary Sword',
    description: 'Thanh kiếm huyền thoại - chỉ có 5 thanh tồn tại',
    category: 'collectible',
    rarity: 'legendary',
    is_tradeable: 1,
    base_price: 100000,
    metadata: JSON.stringify({ collection: 'weapons', edition: 5 })
  },
  {
    id: 'item_founder_badge',
    name: '🏆 Founder Badge',
    description: 'Badge dành cho người ủng hộ từ đầu',
    category: 'collectible',
    rarity: 'legendary',
    is_tradeable: 0, // Soulbound
    base_price: 0,
    metadata: JSON.stringify({ special: true })
  },

  // ========================================
  // SERVICES
  // ========================================
  {
    id: 'item_name_change',
    name: '📝 Name Change Ticket',
    description: 'Đổi nickname trong server (1 lần)',
    category: 'service',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ uses: 1 })
  },
  {
    id: 'item_custom_color',
    name: '🎨 Custom Role Color',
    description: 'Đổi màu role thành màu tùy chỉnh',
    category: 'service',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 10000,
    metadata: JSON.stringify({ uses: 1 })
  },
  {
    id: 'item_channel_access_1d',
    name: '🔓 VIP Channel Access (1 day)',
    description: 'Truy cập channels VIP trong 1 ngày',
    category: 'service',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 3000,
    metadata: JSON.stringify({ duration: 86400 })
  },
  {
    id: 'item_premium_support',
    name: '⭐ Premium Support Ticket',
    description: 'Ưu tiên hỗ trợ từ staff',
    category: 'service',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 20000,
    metadata: JSON.stringify({ priority: 1 })
  },

  // ========================================
  // SPECIAL/SEASONAL
  // ========================================
  {
    id: 'item_christmas_box',
    name: '🎁 Christmas Mystery Box',
    description: 'Hộp quà giáng sinh - chứa items ngẫu nhiên',
    category: 'consumable',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 25000,
    metadata: JSON.stringify({ seasonal: 'christmas', mystery: true })
  },
  {
    id: 'item_lunar_new_year_envelope',
    name: '🧧 Lucky Red Envelope',
    description: 'Lì xì Tết - chứa Ely ngẫu nhiên (1000-10000)',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ seasonal: 'tet', random_ely: [1000, 10000] })
  }
];

// Insert items
const insert = db.prepare(`
  INSERT OR REPLACE INTO registered_items 
  (id, name, description, category, rarity, is_tradeable, base_price, metadata, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system')
`);

const transaction = db.transaction(() => {
  items.forEach(item => {
    insert.run(
      item.id,
      item.name,
      item.description,
      item.category,
      item.rarity,
      item.is_tradeable,
      item.base_price,
      item.metadata
    );
    console.log(`✅ ${item.name}`);
  });
});

transaction();

console.log(`\n🎉 Seeded ${items.length} items!\n`);

// Stats
const stats = {
  roles: items.filter(i => i.category === 'role').length,
  consumables: items.filter(i => i.category === 'consumable').length,
  collectibles: items.filter(i => i.category === 'collectible').length,
  services: items.filter(i => i.category === 'service').length,
  tradeable: items.filter(i => i.is_tradeable === 1).length,
  soulbound: items.filter(i => i.is_tradeable === 0).length
};

console.log('📊 Statistics:');
console.log(`   Roles: ${stats.roles}`);
console.log(`   Consumables: ${stats.consumables}`);
console.log(`   Collectibles: ${stats.collectibles}`);
console.log(`   Services: ${stats.services}`);
console.log(`   Tradeable: ${stats.tradeable}`);
console.log(`   Soulbound: ${stats.soulbound}\n`);

>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
=======
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bot.db');
const db = new Database(dbPath);

console.log('🌱 Seeding sample items...\n');

const items = [
  // ========================================
  // ROLES
  // ========================================
  {
    id: 'item_vip_role',
    name: '👑 VIP Role',
    description: 'Role VIP với màu vàng và quyền đặc biệt',
    category: 'role',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 50000,
    metadata: JSON.stringify({ role_id: 'YOUR_VIP_ROLE_ID_HERE' })
  },
  {
    id: 'item_mvp_role',
    name: '💎 MVP Role',
    description: 'Role cao cấp nhất với màu rainbow',
    category: 'role',
    rarity: 'legendary',
    is_tradeable: 1,
    base_price: 100000,
    metadata: JSON.stringify({ role_id: 'YOUR_MVP_ROLE_ID_HERE' })
  },
  {
    id: 'item_supporter_role',
    name: '❤️ Supporter Role',
    description: 'Role dành cho người ủng hộ server',
    category: 'role',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 30000,
    metadata: JSON.stringify({ role_id: 'YOUR_SUPPORTER_ROLE_ID_HERE' })
  },
  {
    id: 'item_exclusive_role',
    name: '✨ Exclusive Role',
    description: 'Role giới hạn, chỉ 10 người có được',
    category: 'role',
    rarity: 'legendary',
    is_tradeable: 0, // Soulbound - không trade được
    base_price: 500000,
    metadata: JSON.stringify({ role_id: 'YOUR_EXCLUSIVE_ROLE_ID_HERE', max_holders: 10 })
  },

  // ========================================
  // CONSUMABLES
  // ========================================
  {
    id: 'item_exp_boost_1h',
    name: '⚡ 2x EXP Boost (1h)',
    description: 'Nhân đôi EXP trong 1 giờ',
    category: 'consumable',
    rarity: 'common',
    is_tradeable: 1,
    base_price: 2000,
    metadata: JSON.stringify({ duration: 3600, multiplier: 2 })
  },
  {
    id: 'item_exp_boost_6h',
    name: '⚡ 3x EXP Boost (6h)',
    description: 'Nhân 3 EXP trong 6 giờ',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 10000,
    metadata: JSON.stringify({ duration: 21600, multiplier: 3 })
  },
  {
    id: 'item_ely_boost_2h',
    name: '💰 2x Ely Boost (2h)',
    description: 'Nhân đôi Ely khi chơi game trong 2 giờ',
    category: 'consumable',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ duration: 7200, multiplier: 2 })
  },
  {
    id: 'item_lucky_charm',
    name: '🍀 Lucky Charm',
    description: 'Tăng 15% tỷ lệ thắng trong 30 phút',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 15000,
    metadata: JSON.stringify({ duration: 1800, luck_bonus: 15 })
  },
  {
    id: 'item_daily_reset',
    name: '🔄 Daily Reset Ticket',
    description: 'Reset lại daily reward (dùng được 1 lần/tuần)',
    category: 'consumable',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 8000,
    metadata: JSON.stringify({ cooldown: 604800 })
  },

  // ========================================
  // COLLECTIBLES
  // ========================================
  {
    id: 'item_gold_coin',
    name: '🪙 Gold Coin',
    description: 'Đồng xu vàng quý hiếm - có thể dùng để trade',
    category: 'collectible',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 1000,
    metadata: JSON.stringify({ collection: 'coins' })
  },
  {
    id: 'item_diamond',
    name: '💎 Diamond',
    description: 'Kim cương hiếm - giá trị cao',
    category: 'collectible',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ collection: 'gems' })
  },
  {
    id: 'item_legendary_sword',
    name: '⚔️ Legendary Sword',
    description: 'Thanh kiếm huyền thoại - chỉ có 5 thanh tồn tại',
    category: 'collectible',
    rarity: 'legendary',
    is_tradeable: 1,
    base_price: 100000,
    metadata: JSON.stringify({ collection: 'weapons', edition: 5 })
  },
  {
    id: 'item_founder_badge',
    name: '🏆 Founder Badge',
    description: 'Badge dành cho người ủng hộ từ đầu',
    category: 'collectible',
    rarity: 'legendary',
    is_tradeable: 0, // Soulbound
    base_price: 0,
    metadata: JSON.stringify({ special: true })
  },

  // ========================================
  // SERVICES
  // ========================================
  {
    id: 'item_name_change',
    name: '📝 Name Change Ticket',
    description: 'Đổi nickname trong server (1 lần)',
    category: 'service',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ uses: 1 })
  },
  {
    id: 'item_custom_color',
    name: '🎨 Custom Role Color',
    description: 'Đổi màu role thành màu tùy chỉnh',
    category: 'service',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 10000,
    metadata: JSON.stringify({ uses: 1 })
  },
  {
    id: 'item_channel_access_1d',
    name: '🔓 VIP Channel Access (1 day)',
    description: 'Truy cập channels VIP trong 1 ngày',
    category: 'service',
    rarity: 'uncommon',
    is_tradeable: 1,
    base_price: 3000,
    metadata: JSON.stringify({ duration: 86400 })
  },
  {
    id: 'item_premium_support',
    name: '⭐ Premium Support Ticket',
    description: 'Ưu tiên hỗ trợ từ staff',
    category: 'service',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 20000,
    metadata: JSON.stringify({ priority: 1 })
  },

  // ========================================
  // SPECIAL/SEASONAL
  // ========================================
  {
    id: 'item_christmas_box',
    name: '🎁 Christmas Mystery Box',
    description: 'Hộp quà giáng sinh - chứa items ngẫu nhiên',
    category: 'consumable',
    rarity: 'epic',
    is_tradeable: 1,
    base_price: 25000,
    metadata: JSON.stringify({ seasonal: 'christmas', mystery: true })
  },
  {
    id: 'item_lunar_new_year_envelope',
    name: '🧧 Lucky Red Envelope',
    description: 'Lì xì Tết - chứa Ely ngẫu nhiên (1000-10000)',
    category: 'consumable',
    rarity: 'rare',
    is_tradeable: 1,
    base_price: 5000,
    metadata: JSON.stringify({ seasonal: 'tet', random_ely: [1000, 10000] })
  }
];

// Insert items
const insert = db.prepare(`
  INSERT OR REPLACE INTO registered_items 
  (id, name, description, category, rarity, is_tradeable, base_price, metadata, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system')
`);

const transaction = db.transaction(() => {
  items.forEach(item => {
    insert.run(
      item.id,
      item.name,
      item.description,
      item.category,
      item.rarity,
      item.is_tradeable,
      item.base_price,
      item.metadata
    );
    console.log(`✅ ${item.name}`);
  });
});

transaction();

console.log(`\n🎉 Seeded ${items.length} items!\n`);

// Stats
const stats = {
  roles: items.filter(i => i.category === 'role').length,
  consumables: items.filter(i => i.category === 'consumable').length,
  collectibles: items.filter(i => i.category === 'collectible').length,
  services: items.filter(i => i.category === 'service').length,
  tradeable: items.filter(i => i.is_tradeable === 1).length,
  soulbound: items.filter(i => i.is_tradeable === 0).length
};

console.log('📊 Statistics:');
console.log(`   Roles: ${stats.roles}`);
console.log(`   Consumables: ${stats.consumables}`);
console.log(`   Collectibles: ${stats.collectibles}`);
console.log(`   Services: ${stats.services}`);
console.log(`   Tradeable: ${stats.tradeable}`);
console.log(`   Soulbound: ${stats.soulbound}\n`);

>>>>>>> 1150c8ebff999fa5ef5c846e6aea21bc922d8f73
db.close();