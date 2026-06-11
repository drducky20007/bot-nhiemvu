require("dotenv").config();
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {

    console.log("🧹 Deleting GUILD commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: [] }
    );

    console.log("✅ Guild commands deleted");

    console.log("🧹 Deleting GLOBAL commands...");

    await rest.put(
      Routes.applicationCommands(
        process.env.CLIENT_ID
      ),
      { body: [] }
    );

    console.log("✅ Global commands deleted");

  } catch (error) {
    console.error(error);
  }
})();