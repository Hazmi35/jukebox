import stripIndent from "strip-indent";

export const lang = {
    // Language Metadata
    META_ID: () => "en-US",

    // Commands
    // About Commands
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

    // Misc
    NOT_AVAILABLE: () => "N/A"
};
