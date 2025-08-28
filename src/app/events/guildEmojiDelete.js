const { EmbedBuilder } = require('discord.js');

function registerGuildEmojiDelete(bot, { guildId, channelId }) {
  bot.on('guildEmojiDelete', async (emoji) => {
    console.log(`Emoji removed: ${emoji.name} from ${emoji.guild.name}`);

    const guild = await bot.guilds.fetch(guildId).catch(() => null);
    const channel = guild?.channels.cache.get(channelId) 
      || await guild?.channels.fetch(channelId).catch(() => null);

    if (guild && channel && channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('Emoji Removed')
        .setDescription(`An emoji has been removed from **${emoji.guild.name}**.\n\n*It still exists in the archive.*`)
        .addFields(
          { name: 'Emoji Name', value: emoji.name, inline: true },
          { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true }
        )
        .setThumbnail(emoji.imageURL())
        .setColor(0xFF4500)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log(`🗑️ Emoji removed embed sent: ${emoji.name}`);
    }
  });
}

module.exports = { registerGuildEmojiDelete };


