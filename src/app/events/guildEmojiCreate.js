const { sendEmbed } = require('../utils/sendEmbed');
const { archiveEmoji } = require('../utils/archiveEmoji');

function registerGuildEmojiCreate(bot, { guildId, channelId }) {
  bot.on('guildEmojiCreate', async (emoji) => {
    console.log(`New emoji added ${emoji.name} from ${emoji.guild.name}`);

    await archiveEmoji(emoji, emoji.guild);

    const guild = await bot.guilds.fetch(guildId).catch(() => null);
    const channel = guild?.channels.cache.get(channelId) 
      || await guild?.channels.fetch(channelId).catch(() => null);

    await sendEmbed(emoji, guild, channel);
  });
}

module.exports = { registerGuildEmojiCreate };


