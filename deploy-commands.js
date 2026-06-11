require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

console.log('========================================');
console.log('  DEPLOY COMMANDS - DETAILED VERSION');
console.log('========================================\n');

// ========================================
// 1. CHECK ENVIRONMENT
// ========================================
console.log('📋 Step 1: Checking environment variables...');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
  console.error('❌ Missing TOKEN or DISCORD_TOKEN in .env!');
  process.exit(1);
}
if (!CLIENT_ID) {
  console.error('❌ Missing CLIENT_ID in .env!');
  process.exit(1);
}
if (!GUILD_ID) {
  console.error('❌ Missing GUILD_ID in .env!');
  process.exit(1);
}

console.log(`  ✅ TOKEN: ${TOKEN.substring(0, 30)}...`);
console.log(`  ✅ CLIENT_ID: ${CLIENT_ID}`);
console.log(`  ✅ GUILD_ID: ${GUILD_ID}\n`);

// ========================================
// 2. LOAD COMMANDS
// ========================================
console.log('📦 Step 2: Loading commands from /commands folder...\n');

const commands = [];
const commandsPath = path.join(__dirname, 'commands/slash');

function loadCommandsFromDir(dir, depth = 0) {
  const indent = '  '.repeat(depth + 1);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      console.log(`${indent}📁 ${file}/`);
      loadCommandsFromDir(fullPath, depth + 1);
      continue;
    }

    if (!file.endsWith('.js')) continue;

    try {
      delete require.cache[require.resolve(fullPath)];
      const command = require(fullPath);

      if (command.data && command.execute) {
        const json = command.data.toJSON();
        commands.push(json);
        console.log(`${indent}✅ ${file} → /${json.name}`);
      } else {
        console.log(`${indent}⚠️  ${file} → Missing data or execute`);
      }
    } catch (error) {
      console.log(`${indent}❌ ${file} → Error: ${error.message}`);
    }
  }
}

if (!fs.existsSync(commandsPath)) {
  console.error(`❌ Commands folder not found: ${commandsPath}`);
  process.exit(1);
}

loadCommandsFromDir(commandsPath);

console.log(`\n📊 Total commands loaded: ${commands.length}\n`);

if (commands.length === 0) {
  console.error('❌ No commands to deploy!');
  process.exit(1);
}

// ========================================
// 3. TEST API CONNECTION
// ========================================
console.log('🔌 Step 3: Testing Discord API connection...');

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    // Test connection
    const user = await rest.get(Routes.user());
    console.log(`  ✅ Connected as: ${user.username}#${user.discriminator || '0000'}`);
    console.log(`  ✅ Bot ID: ${user.id}\n`);

    // ========================================
    // 4. CHECK EXISTING COMMANDS
    // ========================================
    console.log('🔍 Step 4: Checking existing commands...\n');

    console.log('  📋 Guild commands:');
    const existingGuild = await rest.get(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    );
    console.log(`     Current count: ${existingGuild.length}`);
    if (existingGuild.length > 0) {
      existingGuild.forEach(cmd => console.log(`       - /${cmd.name}`));
    }

    console.log('\n  🌍 Global commands:');
    const existingGlobal = await rest.get(
      Routes.applicationCommands(CLIENT_ID)
    );
    console.log(`     Current count: ${existingGlobal.length}`);
    if (existingGlobal.length > 0) {
      existingGlobal.forEach(cmd => console.log(`       - /${cmd.name}`));
    }

    // ========================================
    // 6. DEPLOY NEW COMMANDS
    // ========================================
    console.log('🚀 Step 6: Deploying new commands...\n');

    console.log(`  📤 Sending ${commands.length} commands to Discord...`);
    
    const startTime = Date.now();
    
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`  ✅ Deploy completed in ${duration}s\n`);

    // ========================================
    // 7. VERIFY DEPLOYMENT
    // ========================================
    console.log('✔️  Step 7: Verifying deployment...\n');

    console.log(`  📊 Expected: ${commands.length} commands`);
    console.log(`  📊 Deployed: ${data.length} commands\n`);

    if (data.length === commands.length) {
      console.log('  ✅ All commands deployed successfully!\n');
    } else {
      console.log('  ⚠️  Command count mismatch!\n');
    }

    console.log('  📋 Deployed commands:');
    data.forEach((cmd, i) => {
      console.log(`     ${i + 1}. /${cmd.name} (ID: ${cmd.id})`);
    });

    // ========================================
    // 8. FINAL CHECK
    // ========================================
    console.log('\n🔍 Step 8: Final verification...\n');

    const finalCheck = await rest.get(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    );

    console.log(`  ✅ Commands now registered: ${finalCheck.length}`);
    
    console.log('\n========================================');
    console.log('  ✅ DEPLOYMENT COMPLETE!');
    console.log('========================================\n');

    console.log("COMMANDS SENT:");
    commands.forEach(c => console.log(c.name));

    console.log('📝 Next steps:');
    console.log('  1. Restart bot: node index.js');
    console.log('  2. Type / in Discord to see commands');
    console.log('  3. Test each command\n');

    console.log('💡 If commands don\'t appear:');
    console.log('  - Wait 5-10 minutes for Discord cache');
    console.log('  - Re-invite bot with applications.commands scope');
    console.log('  - Check bot is in the server\n');

  } catch (error) {
    console.error('\n❌ ERROR during deployment:\n');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'Unknown'}`);
    console.error(`  Status: ${error.status || 'Unknown'}\n`);

    if (error.code === 50001) {
      console.error('💡 Missing Access:');
      console.error('  - Bot not in server');
      console.error('  - Missing applications.commands scope');
    } else if (error.code === 50013) {
      console.error('💡 Missing Permissions:');
      console.error('  - Bot needs administrator or manage guild permission');
    } else if (error.code === 10004) {
      console.error('💡 Unknown Guild:');
      console.error('  - Check GUILD_ID is correct');
      console.error('  - Bot must be in the server');
    }

    console.error('\n📋 Debug Info:');
    console.error(`  CLIENT_ID: ${CLIENT_ID}`);
    console.error(`  GUILD_ID: ${GUILD_ID}`);
    console.error(`  Commands to deploy: ${commands.length}\n`);

    process.exit(1);
  }
})();