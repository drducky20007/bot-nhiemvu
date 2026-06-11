const { EmbedBuilder } = require('discord.js');
const { USER_MISSION_PATH } = require('./path');

const EMOJI = '🎯';

module.exports = async function postChooseMissionMessage(client) {
  try {
    const channel = await client.channels.fetch(process.env.MISSION_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.log('❌ Không tìm thấy kênh chọn nhiệm vụ hoặc không phải kênh text!');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('🎮 CHỌN NHIỆM VỤ')
      .setDescription(`Nhấn vào biểu tượng ${EMOJI} để nhận nhiệm vụ ngẫu nhiên!`)
      .setFooter({ text: 'Một nhiệm vụ - Một số phận!' });

    const message = await channel.send({ embeds: [embed] });
    await message.react(EMOJI);

    console.log('✅ Đã gửi tin nhắn chọn nhiệm vụ và thêm emoji thành công.');
  } catch (err) {
    console.error('❌ Lỗi khi gửi message chọn nhiệm vụ:', err);
  }
};