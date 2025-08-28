const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sanitize } = require('./sanitize');

async function archiveEmoji(emoji, guild) {
  const fileExtension = emoji.animated ? 'gif' : 'png';

  let emojiURL;
  if (typeof emoji.imageURL === 'function') {
    emojiURL = emoji.imageURL();
  } else {
    emojiURL = emoji.url || `https://cdn.discordapp.com/emojis/${emoji.id}.${fileExtension}`;
  }

  const dirPath = path.join(__dirname, '../../../emojis', `${sanitize(guild.name)} (${guild.id})`);
  const filePath = path.join(dirPath, `${sanitize(emoji.name)}-${emoji.id}.${fileExtension}`);

  if (fs.existsSync(filePath)) {
    console.log(`⚠️ Emoji already exists: ${emoji.name}`);
    return { status: 'exists', filePath };
  }

  try {
    console.log(`⬇️ Downloading ${emoji.name} from ${emojiURL}`);
    const response = await axios.get(emojiURL, { responseType: 'arraybuffer' });
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, response.data);
    console.log(`✅ Archived: ${emoji.name}`);
    return { status: 'archived', filePath };
  } catch (err) {
    console.error(`❌ Failed to download ${emoji.name}:`, err.message);
    return { status: 'error', error: err };
  }
}

module.exports = { archiveEmoji };


