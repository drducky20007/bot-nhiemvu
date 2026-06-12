/**
 * Discord Role Rewards Configuration
 * 
 * SETUP:
 * 1. Tạo roles trong Discord Server Settings
 * 2. Copy Role IDs
 * 3. Paste vào đây
 * 4. Run seed script
 */

module.exports = {
  // ========================================
  // LEVEL ROLES (Tự động theo level)
  // ========================================
  levelRoles: [
    {
      level: 5,
      roleId: 'YOUR_ROLE_ID_LEVEL_5',
      roleName: '🌱 Tân Thủ',
      color: '#95A5A6',
      autoRemovePrevious: true,  // Xóa role level trước
      priority: 10
    },
    {
      level: 10,
      roleId: 'YOUR_ROLE_ID_LEVEL_10',
      roleName: '⭐ Chuyên Gia',
      color: '#3498DB',
      autoRemovePrevious: true,
      priority: 20
    },
    {
      level: 20,
      roleId: 'YOUR_ROLE_ID_LEVEL_20',
      roleName: '💎 Tinh Anh',
      color: '#9B59B6',
      autoRemovePrevious: true,
      priority: 30
    },
    {
      level: 30,
      roleId: 'YOUR_ROLE_ID_LEVEL_30',
      roleName: '🏆 Đại Sư',
      color: '#E67E22',
      autoRemovePrevious: true,
      priority: 40
    },
    {
      level: 50,
      roleId: 'YOUR_ROLE_ID_LEVEL_50',
      roleName: '👑 Huyền Thoại',
      color: '#F1C40F',
      autoRemovePrevious: true,
      priority: 50
    },
    {
      level: 75,
      roleId: 'YOUR_ROLE_ID_LEVEL_75',
      roleName: '⚡ Thần Thoại',
      color: '#E74C3C',
      autoRemovePrevious: true,
      priority: 60
    },
    {
      level: 100,
      roleId: 'YOUR_ROLE_ID_LEVEL_100',
      roleName: '💫 Bất Tử',
      color: '#1ABC9C',
      autoRemovePrevious: true,
      priority: 100
    }
  ],

  // ========================================
  // WEALTH ROLES (Theo số dư)
  // ========================================
  wealthRoles: [
    {
      balance: 100000,
      roleId: 'YOUR_ROLE_ID_WEALTH_100K',
      roleName: '💰 Khá Giả',
      color: '#F39C12',
      autoRemovePrevious: true,
      priority: 15
    },
    {
      balance: 1000000,
      roleId: 'YOUR_ROLE_ID_WEALTH_1M',
      roleName: '💎 Triệu Phú',
      color: '#8E44AD',
      autoRemovePrevious: true,
      priority: 25
    },
    {
      balance: 10000000,
      roleId: 'YOUR_ROLE_ID_WEALTH_10M',
      roleName: '👑 Đại Gia',
      color: '#C0392B',
      autoRemovePrevious: true,
      priority: 35
    }
  ],

  // ========================================
  // ACHIEVEMENT ROLES (Không tự xóa)
  // ========================================
  achievementRoles: [
    {
      achievementId: 'achievement_first_game',
      roleId: 'YOUR_ROLE_ID_ACH_FIRST_GAME',
      roleName: '🎲 First Timer',
      color: '#95A5A6',
      autoRemovePrevious: false,  // Giữ achievements
      priority: 5
    },
    {
      achievementId: 'achievement_100_games',
      roleId: 'YOUR_ROLE_ID_ACH_100_GAMES',
      roleName: '🎰 Gambler',
      color: '#E74C3C',
      autoRemovePrevious: false,
      priority: 12
    },
    {
      achievementId: 'achievement_500_games',
      roleId: 'YOUR_ROLE_ID_ACH_500_GAMES',
      roleName: '🃏 Cao Thủ Cờ Bạc',
      color: '#8E44AD',
      autoRemovePrevious: false,
      priority: 18
    },
    {
      achievementId: 'achievement_first_sale',
      roleId: 'YOUR_ROLE_ID_ACH_TRADER',
      roleName: '🏪 Thương Nhân',
      color: '#16A085',
      autoRemovePrevious: false,
      priority: 8
    },
    {
      achievementId: 'achievement_tycoon',
      roleId: 'YOUR_ROLE_ID_ACH_TYCOON',
      roleName: '🏰 Đại Gia Thương Mại',
      color: '#D4AF37',
      autoRemovePrevious: false,
      priority: 45
    }
  ],

  // ========================================
  // SPECIAL ROLES (Manual hoặc event)
  // ========================================
  specialRoles: [
    {
      id: 'founder',
      roleId: 'YOUR_ROLE_ID_FOUNDER',
      roleName: '⭐ Founder',
      color: '#FFD700',
      autoRemovePrevious: false,
      priority: 200
    },
    {
      id: 'vip',
      roleId: 'YOUR_ROLE_ID_VIP',
      roleName: '💎 VIP',
      color: '#9B59B6',
      autoRemovePrevious: false,
      priority: 150
    },
    {
      id: 'supporter',
      roleId: 'YOUR_ROLE_ID_SUPPORTER',
      roleName: '❤️ Supporter',
      color: '#E91E63',
      autoRemovePrevious: false,
      priority: 120
    }
  ]
};