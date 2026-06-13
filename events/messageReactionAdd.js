const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');

// ========================================
// IMPORT DATABASE
// ========================================
const { db } = require('../../shared/database/db.js');

// ========================================
// IMPORT UTILS
// ========================================
const getUserRank = require('../utils/getUserRank');

// ========================================
// CONFIG
// ========================================
const EMOJI = '🎯';

// ========================================
// EVENT HANDLER
// ========================================
module.exports = {
  name: Events.MessageReactionAdd,
  
  async execute(reaction, user) {
    // 1. SKIP BOTS
    if (user.bot) return;

    // 2. FETCH PARTIAL REACTION
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('❌ Lỗi khi fetch reaction:', error);
        return;
      }
    }

    // 3. CHECK CHANNEL & EMOJI
    if (
      reaction.message.channel.id !== process.env.MISSION_CHANNEL_ID ||
      reaction.emoji.name !== EMOJI
    ) {
      return;
    }

    // 4. FETCH MEMBER
    const guild = reaction.message.guild;
    let member;
    try {
      member = await guild.members.fetch(user.id);
    } catch (err) {
      console.error('❌ Không thể fetch member từ guild:', err);
      return;
    }

    // 5. CHECK RANK
    const rank = getUserRank(member);
    if (!rank) {
      try {
        await user.send('❌ Bạn chưa có rank nên không thể nhận nhiệm vụ!');
      } catch {}
      return;
    }

    // 6. REMOVE REACTION
    try {
      await reaction.users.remove(user.id);
    } catch (err) {
      console.error('❌ Không thể gỡ emoji:', err);
    }

    // 7. TEST DM CONNECTION
    try {
      await user.send('✅ Kết nối DM thành công! Đang gửi nhiệm vụ...');
    } catch (err) {
      console.log(`❌ Không thể gửi DM đến ${user.tag}. Có thể do user chặn hoặc chưa bật DM.`);
      try {
        await reaction.message.channel.send(
          `<@${user.id}> ⚠️ Không thể gửi nhiệm vụ qua DM. Vui lòng bật tin nhắn trực tiếp để nhận nhiệm vụ.`
        );
      } catch {}
      return;
    }

    // ========================================
    // CHECK USER ĐÃ CÓ NHIỆM VỤ CHƯA
    // ========================================
    const existingMission = db.prepare(`
      SELECT mission_id, status FROM user_missions WHERE user_id = ?
    `).get(user.id);

    if (existingMission) {
      try {
        await user.send('⚠️ Bạn đã nhận nhiệm vụ rồi. Dùng `/huynhiemvu` để hủy nhiệm vụ hiện tại trước khi nhận nhiệm vụ mới!');
      } catch {}
      return;
    }

    // ========================================
    // LẤY DANH SÁCH NHIỆM VỤ TỪ DATABASE
    // ========================================
    let missions;
    try {
      missions = db.prepare(`
        SELECT id, rank, title, description, reward, type, short
        FROM missions
        WHERE is_active = 1
      `).all();
    } catch (err) {
      console.error('❌ Không thể đọc missions từ database:', err);
      await user.send('❌ Lỗi hệ thống khi tải nhiệm vụ. Vui lòng thử lại sau.');
      return;
    }

    if (missions.length === 0) {
      await user.send('⚠️ Hiện tại không có nhiệm vụ nào.');
      return;
    }

    // ========================================
    // LỌC NHIỆM VỤ PHÙ HỢP VỚI RANK
    // ========================================
    const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];
    const userRankIndex = RANK_ORDER.indexOf(rank);
    
    const availableMissions = missions.filter(m => 
      RANK_ORDER.indexOf(m.rank) <= userRankIndex
    );

    if (availableMissions.length < 5) {
      await user.send('⚠️ Không đủ nhiệm vụ phù hợp với rank của bạn.');
      return;
    }

    // ========================================
    // LỌC BỎ NHIỆM VỤ TRÙNG ID
    // ========================================
    const uniqueMissionsMap = new Map();
    for (const mission of availableMissions) {
      if (!uniqueMissionsMap.has(mission.id)) {
        uniqueMissionsMap.set(mission.id, mission);
      }
    }
    const uniqueMissions = Array.from(uniqueMissionsMap.values());

    // ========================================
    // RANDOM 5 NHIỆM VỤ
    // ========================================
    const shuffled = uniqueMissions.sort(() => 0.5 - Math.random());
    const selectedMissions = shuffled.slice(0, 5);

    // ========================================
    // TẠO BUTTONS
    // ========================================
    const buttons = selectedMissions.map((mission, i) =>
      new ButtonBuilder()
        .setCustomId(`choose_mission_${mission.id}_${user.id}`)
        .setLabel(`Nhiệm vụ ${i + 1}`)
        .setStyle(ButtonStyle.Primary)
    );

    const cancelButton = new ButtonBuilder()
      .setCustomId(`cancel_mission_${user.id}`)
      .setLabel('❌ Nghĩ lại')
      .setStyle(ButtonStyle.Danger);

    // Chia nút thành các row (tối đa 5 nút/row)
    const allButtons = [...buttons, cancelButton];
    const rows = [];
    for (let i = 0; i < allButtons.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(allButtons.slice(i, i + 5)));
    }

    // ========================================
    // TẠO MESSAGE CONTENT
    // ========================================
    const description = selectedMissions.map((m, i) =>
      `**Nhiệm vụ ${i + 1}:** ${m.title}\n` +
      `> Rank: ${m.rank} | Thưởng: ${m.reward.toLocaleString()} Ely | Loại: ${m.type}\n` +
      `> ${m.short || m.description.substring(0, 100) + '...'}`
    ).join('\n\n');

    const fullMessage = `🎯 **Hãy chọn một trong các nhiệm vụ sau:**\n\n${description}`;

    // ========================================
    // GỬI MESSAGE
    // ========================================
    try {
      if (fullMessage.length > 1900) {
        // Nếu message quá dài → chia nhỏ
        await user.send("🎯 **Hãy chọn một trong các nhiệm vụ sau:**");
        await user.send(description);
        await user.send({ components: rows });
      } else {
        await user.send({ content: fullMessage, components: rows });
      }
    } catch (err) {
      console.log(`❌ Không thể gửi danh sách nhiệm vụ cho ${user.tag}:`, err.message);
      return;
    }

    // ========================================
    // LƯU PENDING CHOICES VÀO MEMORY (TEMPORARY)
    // ========================================
    // Note: Vì pending choices chỉ tạm thời (chờ user chọn),
    // ta có thể lưu vào memory thay vì database
    // Hoặc có thể tạo table riêng nếu cần persistent storage
    
    if (!global.pendingMissionChoices) {
      global.pendingMissionChoices = {};
    }

    global.pendingMissionChoices[user.id] = {
      missions: selectedMissions.map(m => m.id),
      timestamp: Date.now()
    };

    console.log(`✅ Gửi danh sách nhiệm vụ cho ${user.tag} (Rank ${rank})`);
    console.log(`   Nhiệm vụ: ${selectedMissions.map(m => m.id).join(', ')}`);
  }
};