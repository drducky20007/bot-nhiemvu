const { Events } = require('discord.js');
const path = require('path');

// ========================================
// IMPORT DATABASE
// ========================================
const { db } = require('../../shared/database/db.js');
const rateLimiter = require('../../shared/utils/rateLimiter.js');

// ========================================
// EVENT HANDLER
// ========================================
module.exports = {
  name: Events.InteractionCreate,
  
  async execute(interaction) {
    // ========================================
    // XỬ LÝ SLASH COMMANDS
    // ========================================
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`❌ Không tìm thấy command: ${interaction.commandName}`);
        return;
      }

      try {
        // ========================================
        // GLOBAL RATE LIMIT CHECK
        // ========================================
        const userId = interaction.user.id;
        const commandName = interaction.commandName;
        
        const rateLimit = rateLimiter.checkRateLimit(userId, commandName);
        
        if (!rateLimit.allowed) {
          return interaction.reply({
            content: rateLimit.message,
            flags: 64
          });
        }
        
        // ========================================
        // EXECUTE COMMAND
        // ========================================
        await command.execute(interaction);
        
      } catch (error) {
        console.error(`❌ Lỗi khi thực thi command ${interaction.commandName}:`, error);
        
        const errorMessage = { 
          content: '❌ Có lỗi xảy ra khi thực thi lệnh này!', 
          flags: 64
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage).catch(() => {});
        } else {
          await interaction.reply(errorMessage).catch(() => {});
        }
      }
    }

    // ========================================
    // XỬ LÝ STRING SELECT MENU
    // ========================================
    else if (interaction.isStringSelectMenu()) {
      const customId = interaction.customId;

      // ========================================
      // SELECT MENU: HỦY NHIỆM VỤ
      // ========================================
      if (customId.startsWith('cancel_mission_')) {
        const targetUserId = customId.split('_')[2];

        // Kiểm tra user
        if (interaction.user.id !== targetUserId) {
          return interaction.reply({ 
            content: '❌ Đây không phải nhiệm vụ của bạn!', 
            flags: 64
          });
        }

        // Lấy user_mission.id từ select value
        const userMissionId = parseInt(interaction.values[0]);

        // Lấy thông tin nhiệm vụ trước khi xóa
        const missionInfo = db.prepare(`
          SELECT um.id, um.mission_id, m.title
          FROM user_missions um
          JOIN missions m ON um.mission_id = m.id
          WHERE um.id = ? AND um.user_id = ?
        `).get(userMissionId, interaction.user.id);

        if (!missionInfo) {
          return interaction.reply({
            content: '❌ Không tìm thấy nhiệm vụ này!',
            flags: 64
          });
        }

        // Xóa nhiệm vụ CỤ THỂ
        db.prepare('DELETE FROM user_missions WHERE id = ?').run(userMissionId);

        // Update message
        await interaction.update({
          content: `✅ Đã hủy nhiệm vụ **"${missionInfo.title}"** (ID: ${missionInfo.mission_id})!\n\n` +
                   `📌 Bạn có thể react 🎯 vào message trong kênh nhiệm vụ để nhận nhiệm vụ mới!`,
          components: []
        });
      }
    }

    // ========================================
    // XỬ LÝ BUTTON INTERACTIONS
    // ========================================
    else if (interaction.isButton()) {
      const customId = interaction.customId;

      // ========================================
      // BUTTON: CHỌN NHIỆM VỤ
      // ========================================
      if (customId.startsWith('choose_mission_')) {
        const parts = customId.split('_');
        const missionId = parts[2];
        const targetUserId = parts[3];

        if (interaction.user.id !== targetUserId) {
          return interaction.reply({ content: '❌ Đây không phải nhiệm vụ của bạn!', flags: 64 });
        }

        const existingMission = db.prepare('SELECT mission_id FROM user_missions WHERE user_id = ?').get(interaction.user.id);

        if (existingMission) {
          return interaction.reply({ content: '⚠️ Bạn đã nhận nhiệm vụ rồi! Dùng `/huynhiemvu` để hủy trước.', flags: 64 });
        }

        const mission = db.prepare('SELECT id, title, description, reward, rank, type FROM missions WHERE id = ?').get(missionId);

        if (!mission) {
          return interaction.reply({ content: '❌ Không tìm thấy nhiệm vụ này!', flags: 64 });
        }

        try {
          db.prepare('INSERT INTO user_missions (user_id, mission_id, status, accepted_at) VALUES (?, ?, \'active\', CURRENT_TIMESTAMP)').run(interaction.user.id, missionId);
          console.log(`✅ User ${interaction.user.tag} nhận nhiệm vụ ${missionId}`);
        } catch (error) {
          console.error('❌ Lỗi lưu nhiệm vụ:', error);
          return interaction.reply({ content: '❌ Lỗi khi nhận nhiệm vụ!', flags: 64 });
        }

        if (global.pendingMissionChoices?.[interaction.user.id]) {
          delete global.pendingMissionChoices[interaction.user.id];
        }

        try {
          await interaction.message.edit({ 
            content: `✅ **Đã nhận: ${mission.title}**\n\n🆔 **ID: ${mission.id}**\n\n📋 ${mission.description}\n\n🎖️ Rank: ${mission.rank}\n💰 Thưởng: ${mission.reward.toLocaleString()} Ely\n🏷️ Loại: ${mission.type}\n\n📝 **Hướng dẫn:**\n1. Tạo thread trong forum\n2. Tên thread: "NV ${mission.id} - ${mission.title}" (BẮT BUỘC có ID)\n3. Viết >= 500 từ\n4. Đợi admin duyệt \`/duyetnhiemvu\``,
            components: []
          });
        } catch (err) {
          console.error('❌ Không edit được message:', err);
        }

        return interaction.reply({ 
          content: `✅ Nhận **${mission.title}**!\n🆔 ID: **${mission.id}**\n⚠️ Nhớ ghi ID vào tên thread!\n\nDùng \`/nhiemvu\` để xem chi tiết.`,
          flags: 64
        });
      }

      // ========================================
      // BUTTON: HỦY (NGHĨ LẠI) - từ DM
      // ========================================
      else if (customId.startsWith('cancel_mission_')) {
        const targetUserId = customId.split('_')[2];

        if (interaction.user.id !== targetUserId) {
          return interaction.reply({ content: '❌ Đây không phải nhiệm vụ của bạn!', flags: 64 });
        }

        if (global.pendingMissionChoices?.[interaction.user.id]) {
          delete global.pendingMissionChoices[interaction.user.id];
        }

        try {
          await interaction.message.edit({ 
            content: '❌ **Đã hủy chọn.**\n\nReact 🎯 lại để nhận nhiệm vụ mới!',
            components: []
          });
        } catch (err) {
          console.error('❌ Không edit được:', err);
        }

        return interaction.reply({ content: '✅ Đã hủy. React 🎯 lại để nhận nhiệm vụ mới.', flags: 64 });
      }
    }
  }
};
