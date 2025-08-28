const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { sanitize } = require('../utils/sanitize');
const { archiveEmoji } = require('../utils/archiveEmoji');

function registerGuildEmojiUpdate(bot, { guildId, channelId }) {
  bot.on('guildEmojiUpdate', async (oldEmoji, newEmoji) => {
    if (oldEmoji.name === newEmoji.name) return;

    const oldName = oldEmoji.name;
    const newName = newEmoji.name;

    const fileExtension = newEmoji.animated ? 'gif' : 'png';
    const dirPath = path.join(__dirname, '../../../emojis', `${sanitize(newEmoji.guild.name)} (${newEmoji.guild.id})`);
    const oldPath = path.join(dirPath, `${sanitize(oldName)}-${newEmoji.id}.${fileExtension}`);
    const newPath = path.join(dirPath, `${sanitize(newName)}-${newEmoji.id}.${fileExtension}`);

    if (fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`✏️ Emoji renamed: ${oldName} → ${newName}`);
      } catch (err) {
        console.error(`❌ Failed to rename emoji file:`, err.message);
      }
    } else {
      console.warn(`⚠️ Could not find old file for ${oldName}, re-downloading...`);
      await archiveEmoji(newEmoji, newEmoji.guild);
    }

    const guild = await bot.guilds.fetch(guildId).catch(() => null);
    const channel = guild?.channels.cache.get(channelId) 
      || await guild?.channels.fetch(channelId).catch(() => null);

    if (guild && channel && channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('Emoji Renamed')
        .setDescription(`An emoji has been renamed in **${newEmoji.guild.name}**`)
        .addFields(
          { name: 'Old Name', value: oldName, inline: true },
          { name: 'New Name', value: newName, inline: true }
        )
        .setThumbnail(newEmoji.url)
        .setColor(0x00BFFF)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      console.log(`✏️ Emoji rename embed sent: ${oldName} → ${newName}`);
    }
  });
}

module.exports = { registerGuildEmojiUpdate };


