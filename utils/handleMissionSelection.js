const fs = require('fs');
const { MISSION_PATH, USER_MISSION_PATH } = require('./path');

async function handleMissionSelection(interaction) {
  const selectedMission = interaction.values[0];
  const missionId = selectedMission.split('-')[0];

  // Load danh sách nhiệm vụ
  if (!fs.existsSync(MISSION_PATH)) {
    return interaction.reply({ content: '❌ Không tìm thấy dữ liệu nhiệm vụ.', ephemeral: true });
  }

  const missions = JSON.parse(fs.readFileSync(MISSION_PATH));
  const mission = missions.find(m => m.id === missionId);

  if (!mission) {
    return interaction.reply({ content: '❌ Nhiệm vụ không tồn tại.', ephemeral: true });
  }

  // Gửi DM cho user
  try {
    await interaction.user.send(
      `🔥 **Bạn đã chọn nhiệm vụ:**\n\`\`\`${mission.title}\nLoại: ${mission.type}\nRank: ${mission.rank}\n\n${mission.short}\`\`\``
    );
  } catch (err) {
    await interaction.reply({ content: '⚠️ Không thể gửi tin nhắn riêng. Hãy bật DM với bot.', ephemeral: true });
    return;
  }

  // Trả lời trong kênh
  await interaction.reply({ content: `✅ Bạn đã chọn nhiệm vụ **${mission.title}**!`, ephemeral: true });

  // Ghi vào userMissions.json
  let userMissions = {};
  if (fs.existsSync(USER_MISSION_PATH)) {
    userMissions = JSON.parse(fs.readFileSync(USER_MISSION_PATH, 'utf8'));
  }

  userMissions[interaction.user.id] = {
    missionId: mission.id
  };

  fs.writeFileSync(USER_MISSION_PATH, JSON.stringify(userMissions, null, 2));
  console.log(`✅ Ghi nhận nhiệm vụ chọn tay cho ${interaction.user.tag}: ${mission.id}`);
}

module.exports = handleMissionSelection;