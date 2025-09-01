# Emoji Archiver Bot

A Discord bot that automatically archives emojis from servers it's added to and sends notifications when emojis are added, updated, or deleted.

## Features

- **Automatic Archiving**: Downloads and stores all emojis from servers the bot is added to
- **Real-time Notifications**: Sends Discord embeds when emojis are created, renamed, or deleted
- **Organized Storage**: Emojis are organized by server in separate directories
- **Docker Support**: Easy deployment with Docker Compose
- **Cross-platform**: Works on any platform that supports Node.js or Docker

## How It Works

The bot monitors Discord servers for emoji events and:
1. **On Startup**: Archives all existing emojis from servers it's in
2. **On Emoji Create**: Downloads the new emoji and sends a notification
3. **On Emoji Update**: Sends a notification about the change
4. **On Emoji Delete**: Sends a notification (emoji remains in archive)

## Emoji Storage Location

Emojis are downloaded to the `emojis/` directory in your project folder. Each server gets its own subdirectory named with the server name and ID:

```
emojis/
├── Server Name (123456789012345678)/
│   ├── emoji_name-123456789012345678.png
│   ├── animated_emoji-123456789012345679.gif
│   └── ...
└── Another Server (987654321098765432)/
    ├── cool_emoji-111111111111111111.png
    └── ...
```


The bot will start and begin archiving emojis from all servers it's in.

## Discord Developer Portal Setup

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Emoji Archiver")
4. Go to the "Bot" section in the left sidebar

### Step 2: Configure Bot Permissions

In the Bot section, enable these permissions under "Privileged Gateway Intents":
- ✅ **Server Members Intent** (if needed for your use case)
- ✅ **Message Content Intent** (if needed for your use case)

### Step 3: Set Bot Permissions

Under "Bot Permissions", enable these permissions:
- ✅ **Add Reactions**
- ✅ **Send Messages**
- ✅ **Use External Emojis**

### Step 4: Generate Bot Token

1. Click "Reset Token" to generate a new bot token
2. Copy the token (you'll need this for the `DISCORD_TOKEN` environment variable)
3. **Keep this token secret!** Never share it publicly.

### Step 5: Create OAuth2 URL

1. Go to the "OAuth2" → "URL Generator" section
2. Select "bot" under "Scopes"
3. Select the permissions listed above under "Bot Permissions"
4. Copy the generated URL and use it to invite the bot to your server

### Step 6: Get Server and Channel IDs

1. **Server ID (Guild ID)**: Right-click on your server name and select "Copy Server ID"
2. **Channel ID**: Right-click on the channel where you want notifications and select "Copy Channel ID"

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | Yes |
| `GUILD_ID` | ID of the server for notifications | Yes |
| `CHANNEL_ID` | ID of the channel for notifications | Yes |
| `NODE_ENV` | Set to `production` for Docker | No |

### Bot Intents

The bot uses these Discord.js intents:
- `Guilds` - To access server information
- `GuildEmojisAndStickers` - To monitor emoji events

## Usage

Once the bot is running:

1. **Invite the bot** to servers you want to archive emojis from
2. **Monitor the notification channel** for emoji updates
3. **Check the `emojis/` directory** to see archived emojis

The bot will automatically:
- Archive all existing emojis when it starts up
- Download new emojis as they're added
- Send notifications for emoji changes
- Keep emojis even after they're deleted from Discord

## Troubleshooting

### Common Issues

**Bot not responding to emoji events:**
- Ensure the bot has the correct permissions
- Check that the bot is online in your server
- Verify the bot token is correct

**Emojis not downloading:**
- Check the `emojis/` directory permissions
- Ensure the bot has internet access
- Look for error messages in the console

**Notifications not sending:**
- Verify `GUILD_ID` and `CHANNEL_ID` are correct
- Ensure the bot can see and send messages to the channel
- Check that the channel is a text channel

### Logs

View Docker logs:
```bash
docker-compose logs -f emoji-archiver
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License - see package.json for details

## Author

Jonathan Yeagy