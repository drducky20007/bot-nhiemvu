const { ActivityType, Events } = require('discord.js');
const postChooseMissionMessage = require('../utils/postChooseMissionMessage');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`🤖 Bot đã online với tên: ${client.user.tag}`);
    client.user.setActivity("Nhiệm vụ bí ẩn...", { type: ActivityType.Watching });

    try {
      await postChooseMissionMessage(client);
    } catch (err) {
      console.error("❌ Không thể gửi message chọn nhiệm vụ:", err);
    }
  },
};