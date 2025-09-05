const { EmbedBuilder } = require('discord.js');

// Get guild and channel from environment variables
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;

// Get guild and channel helper function
async function getGuildAndChannel(bot) {
  const guild = await bot.guilds.fetch(guildId).catch(() => null);
  const channel = guild?.channels.cache.get(channelId) 
    || await guild?.channels.fetch(channelId).catch(() => null);
  
  return { guild, channel };
}

async function sendCreateEmbed(emoji, bot) {
  const { guild, channel } = await getGuildAndChannel(bot);

  if (guild && channel && channel.isTextBased()) {
    const embed = new EmbedBuilder()
      .setTitle('New Emoji Added!')
      .setDescription(`**${emoji.name}** has been added to **${emoji.guild.name}**!`)
      .setURL(`https://discord.com/channels/${emoji.guild.id}`)
      .setImage(emoji.url)
      .addFields(
        { name: 'Emoji', value: emoji.name, inline: true },
        { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true }
      )
      .setColor(0xFFD700)
      .setTimestamp();
    const sentMessage = await channel.send({ embeds: [embed] });
    console.log(`Emoji create embed sent: ${emoji.name}`);
    try {
      await sentMessage.react(emoji);
    } catch (error) {
      console.error(`Failed to react with emoji ${emoji.name}:`, error);
    }
  } else {
    console.error('Could not find or send to the target channel in the specified guild.');
  }
}

async function sendRenameEmbed(oldName, newEmoji, bot) {
  const { guild, channel } = await getGuildAndChannel(bot);

  if (guild && channel && channel.isTextBased()) {
    const embed = new EmbedBuilder()
      .setTitle('Emoji Renamed')
      .setDescription(`An emoji has been renamed in **${newEmoji.guild.name}**`)
      .setURL(`https://discord.com/channels/${emojnewEmoji.guild.id}`)
      .addFields(
        { name: 'Old Name', value: oldName, inline: true },
        { name: 'New Name', value: newEmoji.name, inline: true }
      )
      .setThumbnail(newEmoji.url)
      .setColor(0x00BFFF)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log(`Emoji rename embed sent: ${oldName} → ${newEmoji.name}`);
  } else {
    console.error('Could not find or send to the target channel in the specified guild.');
  }
}

async function sendDeleteEmbed(emoji, bot) {
  const { guild, channel } = await getGuildAndChannel(bot);

  if (guild && channel && channel.isTextBased()) {
    const embed = new EmbedBuilder()
      .setTitle('Emoji Removed')
      .setDescription(`An emoji has been removed from **${emoji.guild.name}**.\n\n*It still exists in the archive.*`)
      .setURL(`https://discord.com/channels/${emoji.guild.id}`)
      .addFields(
        { name: 'Emoji Name', value: emoji.name, inline: true },
        { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true }
      )
      .setThumbnail(emoji.imageURL())
      .setColor(0xFF4500)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log(`Emoji removed embed sent: ${emoji.name}`);
  } else {
    console.error('Could not find or send to the target channel in the specified guild.');
  }
}

module.exports = { sendCreateEmbed, sendRenameEmbed, sendDeleteEmbed };


