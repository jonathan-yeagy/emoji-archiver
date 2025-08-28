// Only load .env in development (not in Docker)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Send embed to the specified channel
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

//login to bot
bot.login(process.env.DISCORD_TOKEN);

//function to sanitize the server and emoji names
function sanitize(str) {
  return str.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}

//function to send embeds
async function sendEmbed(emoji, guild, channel) {
    //send embed to the specified channel
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



// Archive a single emoji to disk
async function archiveEmoji(emoji, guild) {
  const fileExtension = emoji.animated ? 'gif' : 'png';
  
  let emojiURL;
  if (typeof emoji.imageURL === 'function') {
    emojiURL = emoji.imageURL();
  } else {
    emojiURL = emoji.url || `https://cdn.discordapp.com/emojis/${emoji.id}.${fileExtension}`;
  }

  const dirPath = path.join(__dirname, '../../emojis', `${sanitize(guild.name)} (${guild.id})`);
  const filePath = path.join(dirPath, `${sanitize(emoji.name)}-${emoji.id}.${fileExtension}`);

  // Skip if already exists
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

//on ready
bot.on('ready', async () => {
  console.log(`✅ Logged in as ${bot.user.tag}`);

  bot.user.setStatus('online');
  bot.user.setActivity('your emojis', { type: ActivityType.Watching });

  try {
    // Get all guilds the bot is in
    const guilds = await bot.guilds.fetch();
    console.log(`🔍 Found ${guilds.size} servers`);

    // Process each guild
    for (const [_, guildPartial] of guilds) {
      const guild = await guildPartial.fetch();
      const emojis = await guild.emojis.fetch();
      
      console.log(`📦 Archiving ${emojis.size} emojis from ${guild.name}`);

      for (const emoji of emojis.values()) {
        await archiveEmoji(emoji, guild);
      }
    }

    console.log('✅ Finished archiving emojis from all servers');

  } catch (error) {
    console.error('❌ Failed to fetch guilds or emojis:', error.message);
  }
});




//emoji caching update thing
bot.on('raw', (packet) => {
  if (packet.t === 'GUILD_EMOJIS_UPDATE') {
    const guild = bot.guilds.cache.get(packet.d.guild_id);
    if (!guild) return;

    const oldEmojis = new Map(guild.emojis.cache.map(e => [e.id, e]));
    const newEmojis = new Map(packet.d.emojis.map(e => [e.id, e]));

    // Handle new emojis
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
        // Compare names for rename
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

    // Handle removed emojis
    for (const [id, oldEmoji] of oldEmojis) {
      if (!newEmojis.has(id)) {
        // Removed emoji
        bot.emit('guildEmojiDelete', oldEmoji);
      }
    }
  }
});



//when a new emoji is added
bot.on('guildEmojiCreate', async (emoji) => {
  console.log(`New emoji added ${emoji.name} from ${emoji.guild.name}`);

  //archive emoji
  await archiveEmoji(emoji, emoji.guild);



  const guild = await bot.guilds.fetch(guildId).catch(() => null);
  const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);

  //send embed
  await sendEmbed(emoji, guild, channel);


});


//when an emoji is renamed
bot.on('guildEmojiUpdate', async (oldEmoji, newEmoji) => {
  if (oldEmoji.name === newEmoji.name) return;

  const oldName = oldEmoji.name; // snapshot the old name
  const newName = newEmoji.name;

  const fileExtension = newEmoji.animated ? 'gif' : 'png';
  const dirPath = path.join(__dirname, '../../emojis', `${sanitize(newEmoji.guild.name)} (${newEmoji.guild.id})`);
  const oldPath = path.join(dirPath, `${sanitize(oldName)}-${newEmoji.id}.${fileExtension}`);
  const newPath = path.join(dirPath, `${sanitize(newName)}-${newEmoji.id}.${fileExtension}`);

  // Try to rename the file
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

  // Send an embed to the target channel
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





//Emoji Removed
// When an emoji is deleted (in discord)
bot.on('guildEmojiDelete', async (emoji) => {
  console.log(`Emoji removed: ${emoji.name} from ${emoji.guild.name}`);

  // Fetch your target guild and channel
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
