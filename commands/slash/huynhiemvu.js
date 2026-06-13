const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');

// ========================================
// IMPORT DATABASE
// ========================================
const dbPath = path.join(__dirname, '../../shared', 'database', 'db.js');
const { db } = require(dbPath);
const logger = require('../../shared/utils/logger');

// ========================================
// COMMAND DEFINITION
// ========================================
module.exports = {
  data: new SlashCommandBuilder()
    .setName('huynhiemvu')
    .setDescription('🚫 Hủy nhiệm vụ hiện tại của bạn'),

  // ========================================
  // EXECUTE FUNCTION
  // ========================================
  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // 1. KIỂM TRA CÓ NHIỆM VỤ KHÔNG
      const userMission = db.prepare(`
        SELECT mission_id FROM user_missions WHERE user_id = ?
      `).get(userId);
      logger.command('huynhiemvu', userId, true);

      if (!userMission) {
        return interaction.reply({ 
          content: '⚠️ Bạn chưa nhận nhiệm vụ nào để hủy.', 
          ephemeral: true 
        });
      }

      // 2. LẤY THÔNG TIN NHIỆM VỤ
      const mission = db.prepare(`
        SELECT title FROM missions WHERE id = ?
      `).get(userMission.mission_id);

      // 3. XÓA NHIỆM VỤ
      db.prepare('DELETE FROM user_missions WHERE user_id = ?').run(userId);

      // 4. TẠO EMBED XÁC NHẬN
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('✅ Đã hủy nhiệm vụ')
        .setDescription(mission ? `Nhiệm vụ **"${mission.title}"** đã được hủy.` : 'Nhiệm vụ đã được hủy.')
        .addFields({
          name: '📌 Lưu ý',
          value: 'Bạn có thể react 🎯 vào message trong kênh nhiệm vụ để nhận nhiệm vụ mới!',
          inline: false
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      logger.command('huynhiemvu', userId, false, error);
      console.error('❌ Error in /huynhiemvu:', error);
      return interaction.reply({ 
        content: '❌ Có lỗi xảy ra khi hủy nhiệm vụ.', 
        ephemeral: true 
      });
    }
  }
};