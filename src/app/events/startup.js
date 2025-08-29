const { archiveEmoji } = require('../utils/archiveEmoji');

//old working version
async function archiveAllEmojis(bot) {
  try {
    const guilds = await bot.guilds.fetch();
    console.log(`Found ${guilds.size} servers`);
    
    // Process all guilds in parallel
    await Promise.all(
      guilds.map(async (guildPartial) => {
        const guild = await guildPartial.fetch();
        const emojis = await guild.emojis.fetch();
        console.log(`Archiving ${emojis.size} emojis from ${guild.name}`);
        
        // Process all emojis in parallel for each guild
        await Promise.all(
          emojis.map(emoji => archiveEmoji(emoji, guild))
        );
      })
    );
    
    console.log('Finished archiving emojis from all servers');
  } catch (error) {
    console.error('Failed to fetch guilds or emojis:', error.message);
  }
}

module.exports = { archiveAllEmojis };
