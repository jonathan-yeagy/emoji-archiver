const { EmbedBuilder } = require('discord.js');

async function sendEmbed(emoji, guild, channel) {
  if (guild) {
    if (channel && channel.isTextBased && channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('New Emoji Added!')
        .setDescription(`**${emoji.name}** has been added to **${emoji.guild.name}**!`)
        .setImage(emoji.url)
        .addFields(
          { name: 'Emoji', value: emoji.name, inline: true },
          { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true }
        )
        .setColor(0xFFD700)
        .setTimestamp();
      const sentMessage = await channel.send({ embeds: [embed] });
      try {
        await sentMessage.react(emoji);
      } catch (error) {
        console.error(`❌ Failed to react with emoji ${emoji.name}:`, error);
      }
    } else {
      console.error('❌ Could not find or send to the target channel in the specified guild.');
    }
  } else {
    console.error('❌ Could not find the specified guild.');
  }
}

module.exports = { sendEmbed };


