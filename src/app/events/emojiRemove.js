const { sendDeleteEmbed } = require('../utils/sendEmbed');

function onEmojiDelete(bot) {
  bot.on('guildEmojiDelete', async (emoji) => {
    console.log(`Emoji removed: ${emoji.name} from ${emoji.guild.name}`);

    await sendDeleteEmbed(emoji, bot);


    
  });
}

module.exports = { onEmojiDelete };


