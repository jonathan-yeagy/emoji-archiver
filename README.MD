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

# Installation

Before installing, you'll need to register this bot in the [Discord Developer Portal](https://discord.com/developers/applications).

## Discord Developer Portal Setup

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Emoji Archiver")
4. Give your application an icon to add some extra flair


### Step 2: Generate Bot Token

1. Go to the "Bot" section in the left sidebar
2. Click "Reset Token" to generate a new bot token
3. Copy the token (you'll need this for the `DISCORD_TOKEN` environment variable)
4. **Keep this token secret!** Never share it publicly.

### Step 3: Create OAuth2 URL

1. Go to the "OAuth2" → "URL Generator" section
2. Select "bot" under "Scopes"
3. Under "Bot Permissions", enable these permissions:
    - Add Reactions
    - Send Messages
    - Use External Emojis
4. Copy the generated URL and use it to invite the bot to your server (you can use this link for multiple servers)

## Get Server and Channel IDs

In order to send notifications, you'll need the Guild and Channel IDs so the Bot knows where to send them to

1. Right Click on a message in the channel you intend for this bot to send updates to
2. In the pop-up menu, click copy message link. The link should be formatted like seen below
    - Example: `https://discord.com/channels/[GUILD_ID]/[CHANNEL_ID]/[MESSAGE_ID]`
3. You'll want to pull the `GUILD_ID` and `CHANNEL_ID` from the URL. Keep them handy for the Docker Compose deployment.

## Deploy With Docker Compose

You can view the full Docker Compose configuration here: [docker-compose.yml](./docker-compose.yml)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Your Discord bot token |
| `GUILD_ID` | ID of the server for notifications |
| `CHANNEL_ID` | ID of the channel for notifications |
| `NODE_ENV` | Set to `production` for Docker |
