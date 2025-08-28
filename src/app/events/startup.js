const { archiveEmoji } = require('../utils/archiveEmoji');

async function archiveAllEmojis(bot) {
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
}

module.exports = { archiveAllEmojis };
