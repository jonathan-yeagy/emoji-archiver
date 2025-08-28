// Only load .env in development (not in Docker)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { registerRawEvent } = require('./events/raw');
const { registerGuildEmojiCreate } = require('./events/guildEmojiCreate');
const { registerGuildEmojiUpdate } = require('./events/guildEmojiUpdate');
const { registerGuildEmojiDelete } = require('./events/guildEmojiDelete');
const { archiveEmoji } = require('./utils/archiveEmoji');

// Send embed to the specified channel
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

//login to bot
bot.login(process.env.DISCORD_TOKEN);

//on ready
bot.on('ready', async () => {
  console.log(`✅ Logged in as ${bot.user.tag}`);

  bot.user.setStatus('online');
  bot.user.setActivity('your emojis', { type: ActivityType.Watching });

  try {
    const guilds = await bot.guilds.fetch();
    console.log(`🔍 Found ${guilds.size} servers`);
    for (const [_, guildPartial] of guilds) {
      const guild = await guildPartial.fetch();
      const emojis = await guild.emojis.fetch();
      console.log(`📦 Archiving ${emojis.size} emojis from ${guild.name}`);
      for (const emoji of emojis.values()) {
        await archiveEmoji(emoji, guild);
      }
    }
    console.log('✅ Finished archiving emojis from all servers');
  } catch (error) {
    console.error('❌ Failed to fetch guilds or emojis:', error.message);
  }
});

// Register event modules
registerRawEvent(bot);
registerGuildEmojiCreate(bot);
registerGuildEmojiUpdate(bot);
registerGuildEmojiDelete(bot);
