const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      client.slashCommands.set(command.data.name, command.data.toJSON());
    } else {
      console.warn(`⚠️ Lệnh ${file} thiếu 'data' hoặc 'execute'`);
    }
  }
};
