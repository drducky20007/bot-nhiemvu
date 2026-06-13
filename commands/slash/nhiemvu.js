const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');

// ========================================
// IMPORT DATABASE
// ========================================
const dbPath = path.join(__dirname, 'shared', 'database', 'db.js');
const { db } = require(dbPath);
const logger = require('./shared/utils/logger');

// ========================================
// COMMAND DEFINITION
// ========================================
module.exports = {
  data: new SlashCommandBuilder()
    .setName('nhiemvu')
    .setDescription('📋 Xem nhiệm vụ bạn đang nhận'),

  // ========================================
  // EXECUTE FUNCTION
  // ========================================
  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // 1. LẤY NHIỆM VỤ HIỆN TẠI CỦA USER
      const userMission = db.prepare(`
        SELECT mission_id, status, accepted_at
        FROM user_missions
        WHERE user_id = ?
      `).get(userId);
      logger.command('nhiemvu', userId, true);

      // 2. KIỂM TRA CÓ NHIỆM VỤ KHÔNG
      if (!userMission) {
        return interaction.reply({ 
          content: '⚠️ Bạn chưa nhận nhiệm vụ nào.\n\nReact 🎯 vào message trong kênh nhiệm vụ để nhận nhiệm vụ mới!', 
          ephemeral: true 
        });
      }

      // 3. LẤY THÔNG TIN CHI TIẾT NHIỆM VỤ
      const mission = db.prepare(`
        SELECT id, rank, title, description, reward, type
        FROM missions
        WHERE id = ?
      `).get(userMission.mission_id);

      // 4. KIỂM TRA TÌM THẤY NHIỆM VỤ KHÔNG
      if (!mission) {
        return interaction.reply({ 
          content: `⚠️ Không tìm thấy nhiệm vụ với ID \`${userMission.mission_id}\`.`, 
          ephemeral: true 
        });
      }

      // 5. FORMAT THỜI GIAN
      const acceptedDate = new Date(userMission.accepted_at);
      const formattedDate = acceptedDate.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      //6. BUILD EMBED
      const embed = new EmbedBuilder()
        .setColor(mission.rank === 'S' || mission.rank === 'A+' ? '#FF6B6B' : '#4CAF50')
        .setTitle(`📝 ${mission.title}`)
        .setDescription(mission.description)
        .addFields(
          { 
            name: '🆔 ID', 
            value: `**${userMission.mission_id}**`, 
            inline: true 
          },
          { 
            name: '🎖️ Rank', 
            value: mission.rank || 'N/A', 
            inline: true 
          },
          { 
            name: '🏷️ Loại', 
            value: mission.type || 'N/A', 
            inline: true 
          },
          { 
            name: '💰 Thưởng', 
            value: `${mission.reward.toLocaleString()} Ely`, 
            inline: true 
          },
          { 
            name: '⭐ EXP', 
            value: `${mission.reward_exp || Math.floor(mission.reward / 50)} EXP`, 
            inline: true 
          },
          { 
            name: '📏 Yêu Cầu', 
            value: `${mission.min_words || 500} từ`, 
            inline: true 
          }
        )
        .addFields({
          name: '📌 Hướng Dẫn',
          value:
            `1️⃣ Tạo thread trong forum\n` +
            `2️⃣ Tên thread **PHẢI** chứa ID: **${userMission.mission_id}**\n` +
            `3️⃣ Viết >= ${mission.min_words || 500} từ (tính cả comment)\n` +
            `4️⃣ Admin sẽ dùng \`/duyetnhiemvu\` để duyệt`,
          inline: false
        })
        .setFooter({ 
          text: `Nhận lúc: ${new Date(userMission.accepted_at).toLocaleString('vi-VN')}` 
        })
        .setTimestamp();

      // Check if mission is high rank (special)
      if (mission.rank === 'S' || mission.rank === 'A+') {
        embed.addFields({
          name: '⚠️ Lưu Ý',
          value: 'Nhiệm vụ rank cao - cần viết rất kỹ!',
          inline: false
        });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      logger.command('nhiemvu', userId, false, error);
      console.error('❌ Error in /nhiemvu:', error);
      return interaction.reply({ 
        content: '❌ Có lỗi xảy ra khi xem nhiệm vụ.', 
        ephemeral: true 
      });
    }
  }
};