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

    const oldEmojis = new Map(guild.emojis.cache);
    const newEmojis = new Map(packet.d.emojis.map(e => [e.id, e]));

    // Find newly created emojis
    for (const [id, emojiData] of newEmojis) {
      if (!oldEmojis.has(id)) {
        // Create a proper emoji object
        const emoji = {
          id: emojiData.id,
          name: emojiData.name,
          animated: emojiData.animated,
          url: `https://cdn.discordapp.com/emojis/${emojiData.id}.${emojiData.animated ? 'gif' : 'png'}`,
          guild: guild
        };
        bot.emit('guildEmojiCreate', emoji);
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




