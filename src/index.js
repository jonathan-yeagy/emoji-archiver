// Only load .env in development (not in Docker)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { registerRawEvent } = require('./events/raw');
const { onEmojiCreate } = require('./events/emojiCreate');
const { onEmojiUpdate } = require('./events/emojiUpdate');
const { onEmojiDelete } = require('./events/emojiRemove');
const { archiveAllEmojis } = require('./events/startup');


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
  console.log(`Logged in as ${bot.user.tag}`);

  bot.user.setStatus('online');
  bot.user.setActivity('your emojis', { type: ActivityType.Watching });

  await archiveAllEmojis(bot);
});

// Register event modules
registerRawEvent(bot);
onEmojiCreate(bot);
onEmojiUpdate(bot);
onEmojiDelete(bot);
