//it is used to catch all emoji events and emit them to the bot (needed for caching reasons)
function registerRawEvent(bot) {
  bot.on('raw', (packet) => {
    if (packet.t === 'GUILD_EMOJIS_UPDATE') {
      const guild = bot.guilds.cache.get(packet.d.guild_id);
      if (!guild) return;

      const oldEmojis = new Map(guild.emojis.cache.map(e => [e.id, e]));
      const newEmojis = new Map(packet.d.emojis.map(e => [e.id, e]));

      for (const [id, emojiData] of newEmojis) {
        if (!oldEmojis.has(id)) {
          const emoji = {
            id: emojiData.id,
            name: emojiData.name,
            animated: emojiData.animated,
            url: `https://cdn.discordapp.com/emojis/${emojiData.id}.${emojiData.animated ? 'gif' : 'png'}`,
            guild
          };
          bot.emit('guildEmojiCreate', emoji);
        } else {
          const oldEmoji = oldEmojis.get(id);
          if (oldEmoji.name !== emojiData.name) {
            const newEmoji = {
              ...oldEmoji,
              name: emojiData.name,
              url: `https://cdn.discordapp.com/emojis/${emojiData.id}.${emojiData.animated ? 'gif' : 'png'}`
            };
            bot.emit('guildEmojiUpdate', oldEmoji, newEmoji);
          }
        }
      }

      for (const [id, oldEmoji] of oldEmojis) {
        if (!newEmojis.has(id)) {
          bot.emit('guildEmojiDelete', oldEmoji);
        }
      }
    }
  });
}

module.exports = { registerRawEvent };


