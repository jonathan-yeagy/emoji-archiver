const { sendCreateEmbed } = require('../utils/sendEmbed');
const { archiveEmoji } = require('../utils/archiveEmoji');

function onEmojiCreate(bot) {
  bot.on('guildEmojiCreate', async (emoji) => {
    console.log(`New emoji added ${emoji.name} from ${emoji.guild.name}`);

    await archiveEmoji(emoji, emoji.guild);
    await sendCreateEmbed(emoji, bot);
  });
}

module.exports = { onEmojiCreate };


