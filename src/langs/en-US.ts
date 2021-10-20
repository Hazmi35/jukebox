/* eslint-disable sort-keys */
import stripIndent from "strip-indent";

export const lang = {
    // Language Metadata
    META_ID: () => "en-US",

    // Commands

    // About Command
    COMMAND_ABOUT_META_DESCRIPTION: () => "Send the bot's info",
    COMMAND_ABOUT_EMBED_AUTHOR: (username: string) => `${username} - Just a simple music bot.`,
    COMMAND_ABOUT_EMBED_DESCRIPTION: (
        channelCount: number, guildsCount: number, shardsCount: string, shardID: string, queueCount: number,
        platform: string, arch: string, osUptime: string, memoryRSS: string, memoryHeapTotal: string, memoryHeapUsed: string, processUptime: string, botUptime: string,
        nodejsVersion: string, discordjsVersion: string, ffmpegVersion: string, ytDlpVersion: string, OpusEncoder: string, botVersion: string
    ) => stripIndent(`
    \`\`\`asciidoc
    Channels count      :: ${channelCount}
    Guilds count        :: ${guildsCount}
    Shards count        :: ${shardsCount}
    Shard ID            :: #${shardID}
    Playing Music on    :: ${queueCount} guilds

    Platform            :: ${platform}
    OS Uptime           :: ${osUptime}
    Arch                :: ${arch}
    Memory (RSS)        :: ${memoryRSS}
    Memory (Heap Total) :: ${memoryHeapTotal}
    Memory (Heap Used)  :: ${memoryHeapUsed}
    Process Uptime      :: ${processUptime}
    Bot Uptime          :: ${botUptime}

    Node.js version     :: ${nodejsVersion}
    Discord.js version  :: ${discordjsVersion}
    FFmpeg version      :: ${ffmpegVersion}
    yt-dlp version      :: ${ytDlpVersion}
    Opus Encoder        :: ${OpusEncoder}
    Bot Version         :: ${botVersion}

    Source code         :: https://sh.hzmi.xyz/jukebox
    \`\`\`
    `),

    // Eval command
    COMMAND_EVAL_META_DESCRIPTION: () => "Only the bot owner can use this command",
    COMMAND_EVAL_META_ARGS: () => ["Some js code"],

    // Help Command
    COMMAND_HELP_META_DESCRIPTION: () => "Shows the help menu",
    COMMAND_HELP_META_ARGS: () => ["Command name"],

    // Invite Command
    COMMAND_INVITE_META_DESCRIPTION: () => "Send the bot's invite link",

    // Now playing command
    COMMAND_NOWPLAYING_META_DESCRIPTION: () => "Send info about the current music player",

    // Pause command
    COMMAND_PAUSE_META_DESCRIPTION: () => "Pause the music player",

    // Ping command
    COMMAND_PING_META_DESCRIPTION: () => "Shows the current ping of the bot.",

    // Play command
    COMMAND_PLAY_META_DESCRIPTION: () => "Play some music",
    COMMAND_PLAY_META_ARGS: () => ["YouTube video or playlist URL / YouTube video name"],

    // Queue command
    COMMAND_QUEUE_META_DESCRIPTION: () => "Show the current queue",

    // Remove command
    COMMAND_REMOVE_META_DESCRIPTION: () => "Remove a track from the current queue",
    COMMAND_REMOVE_META_ARGS: () => ["Track number"],

    // Repeat command
    COMMAND_REPEAT_META_DESCRIPTION: () => "Repeat current music or the queue",

    // Resume command
    COMMAND_RESUME_META_DESCRIPTION: () => "Resume the music player",

    // Skip Command
    COMMAND_SKIP_META_DESCRIPTION: () => "Skip the current music",

    // Stop command
    COMMAND_STOP_META_DESCRIPTION: () => "Stop the queue",

    // Volume command
    COMMAND_VOLUME_META_DESCRIPTION: () => "Show or change the music player's volume",
    COMMAND_VOLUME_META_ARGS: () => ["New volume"],

    // Misc
    NOT_AVAILABLE: () => "N/A"
};
