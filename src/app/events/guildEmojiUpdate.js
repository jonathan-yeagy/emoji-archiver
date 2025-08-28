const fs = require('fs');
const path = require('path');
const { sanitize } = require('../utils/sanitize');
const { archiveEmoji } = require('../utils/archiveEmoji');
const { sendRenameEmbed } = require('../utils/sendEmbed');

function registerGuildEmojiUpdate(bot) {
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

    await sendRenameEmbed(oldName, newEmoji, bot);


    
  });
}

module.exports = { registerGuildEmojiUpdate };


