const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const missionsPath = path.join(__dirname, "..", "data", "missions.json");
const userDataPath = path.join(__dirname, "..", "..", "asher-bot", "data", "userdata.json");
const userMissionsPath = path.join(__dirname, "..", "data", "userMissions.json");

// Helper đọc/ghi JSON
function readJSON(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Hàm xóa nhiệm vụ của user (theo dạng object { missionId: "xxx" })
function removeMissionFromUser(userId, missionId) {
  const userMissions = readJSON(userMissionsPath, {});

  if (userMissions[userId] && userMissions[userId].missionId === missionId) {
    delete userMissions[userId];
    writeJSON(userMissionsPath, userMissions);
  }
}

module.exports = async function handleApproveMission(interaction, isApproved) {
  try {
    if (!isApproved) return;

    const thread = interaction.channel;
    if (!thread || !thread.isThread()) return;

    // Lấy ID từ tên thread (bắt số ID)
    const idMatch = thread.name.match(/\d+/); 
    if (!idMatch) {
      return await thread.send(`⚠️ Không tìm thấy ID nhiệm vụ trong tên thread!`);
    }
    const missionId = idMatch[0];

    // Đọc file missions.json (là array)
    const missions = readJSON(missionsPath, []);
    const mission = missions.find(m => m.id === missionId);

    if (!mission) {
      return await thread.send(`⚠️ Không tìm thấy nhiệm vụ **${missionId}** trong dữ liệu!`);
    }

    const reward = mission.reward || 0;
    const userData = readJSON(userDataPath, {});
    const threadOwnerId = thread.ownerId;

    if (!userData[threadOwnerId]) userData[threadOwnerId] = { balance: 0 };
    userData[threadOwnerId].balance += reward;

    writeJSON(userDataPath, userData);

    // XÓA nhiệm vụ đã hoàn thành khỏi userMissions.json
    removeMissionFromUser(threadOwnerId, missionId);

    await thread.send(
      `💰 <@${threadOwnerId}> nhận được **${reward} Ely** vì hoàn thành nhiệm vụ **${missionId} - ${mission.title}**!`
    );

  } catch (err) {
    console.error("Lỗi khi xử lý thưởng nhiệm vụ:", err);
    await interaction.followUp({ content: "❌ Lỗi khi cộng thưởng!", ephemeral: true });
  }
};
