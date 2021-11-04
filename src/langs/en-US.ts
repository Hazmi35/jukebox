/* eslint-disable sort-keys */
import stripIndent from "strip-indent";
import pluralize from "plur";

// TODO: Make this more readable by adding spaces

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
    COMMAND_EVAL_NO_PERM: () => "⚠️ This command is limited to the bot owner only",
    COMMAND_EVAL_NO_INPUT: () => "⚠️ No js code was provided",
    COMMAND_EVAL_INPUT_FIELD_NAME: () => "Input",
    COMMAND_EVAL_OUTPUT_FIELD_NAME: () => "Output",
    COMMAND_EVAL_ERROR_FIELD_NAME: () => "Error",

    // Help Command
    COMMAND_HELP_META_DESCRIPTION: () => "Shows the help menu",
    COMMAND_HELP_META_ARGS: () => ["Command name"],
    COMMAND_HELP_EMBED_TITLE: () => "Help menu",
    COMMAND_HELP_EMBED_FOOTER: (prefix: string) => `Use ${prefix}help <command> to get more info on a specific command!`,
    COMMAND_HELP_EXTENDED_EMBED_TITLE: (name: string) => `Information for the ${name} command`,
    COMMAND_HELP_EXTENDED_EMBED_CMD_NAME: () => "Name",
    COMMAND_HELP_EXTENDED_EMBED_CMD_DESC: () => "Description",
    COMMAND_HELP_EXTENDED_EMBED_CMD_ALIASES: () => "Aliases",
    COMMAND_HELP_EXTENDED_EMBED_CMD_USAGE: () => "Usage",

    // Invite Command
    COMMAND_INVITE_META_DESCRIPTION: () => "Send the bot's invite link",
    COMMAND_INVITE_EMBED_FIELD_NAME: () => "Discord bot invite link",
    COMMAND_INVITE_EMBED_FIELD_VALUE: () => "Click here",

    // Now playing command
    COMMAND_NOWPLAYING_META_DESCRIPTION: () => "Send info about the current music player",
    COMMAND_NOWPLAYING_MESSAGE: () => "▶ Now playing:",
    COMMAND_NOWPLAYING_MESSAGE_PAUSED: () => "⏸ Now playing (paused):",

    // Pause command
    COMMAND_PAUSE_META_DESCRIPTION: () => "Pause the music player",
    COMMAND_PAUSE_SUCCESS: () => "⏸ The music player paused",
    COMMAND_PAUSE_ALREADY_PAUSED: () => "⚠️ The music player is already paused!",

    // Ping command
    COMMAND_PING_META_DESCRIPTION: () => "Shows the current ping of the bot.",
    COMMAND_PING_INITIAL_MESSAGE: () => "🏓 PING...",
    COMMAND_PING_RESULT_MESSAGE: () => "🏓 PONG!",
    COMMAND_PING_API_LATENCY: () => "📶 API Latency",
    COMMAND_PING_WS_LATENCY: () => "🌐 WebSocket Latency",
    COMMAND_PING_EMBED_FOOTER: (userTag: string) => `Requested by: ${userTag}`,

    // Play command
    COMMAND_PLAY_META_DESCRIPTION: () => "Play some music",
    COMMAND_PLAY_META_ARGS: () => ["YouTube video or playlist URL / YouTube video name"],
    COMMAND_PLAY_INVALID_ARGS: (prefix: string) => `⚠️ Invalid argument, type \`${prefix}help play\` for more info`,
    COMMAND_PLAY_ALREADY_PLAYING: (vcName: string) => `⚠️ The music player is already playing to **${vcName}** voice channel`,
    COMMAND_PLAY_INVALID_YOUTUBE_URL: () => "⚠️ Invalid YouTube URL",
    COMMAND_PLAY_INVALID_SOURCE: () => "⚠️ Jukebox currently only supports YouTube as a source.",
    COMMAND_PLAY_COULD_NOT_RESOLVE_RESOURCE: () => "⚠️ Could not resolve the track resource",
    COMMAND_PLAY_RESOURCE_PROCESSING_ERR: (message: string) => `Error while processing track resource\nReason: \`${message}\``,
    COMMAND_PLAY_RESOURCE_NOT_FOUND: () => "[404] YouTube Item not found.",
    COMMAND_PLAY_TRACK_ADDED: (title: string, url: string) => `✅ Track **[${title}](${url})** has been added to the queue`,
    COMMAND_PLAY_ALREADY_QUEUED_TITLE: () => "Already queued / duplicate",
    COMMAND_PLAY_ALREADY_QUEUED_TITLE2: () => "Duplicated tracks",
    COMMAND_PLAY_ALREADY_QUEUED_MSG: (title: string, url: string, prefix: string) => stripIndent(
        `Track **[${title}](${url})** is already queued, and this bot configuration disallow duplicated tracks in queue.
        Please use \`${prefix}repeat\` instead`
    ),
    COMMAND_PLAY_ALREADY_QUEUED_MSG2: (count: number, prefix: string) => stripIndent(
        `Over ${count} ${pluralize("track", count)} are skipped because it was a duplicate, and this bot configuration disallow duplicated tracks in queue.
        Please use \`${prefix}repeat\` instead`
    ),
    COMMAND_PLAY_COULD_NOT_JOIN_VC: (message: string) => `Error: Could not join the voice channel!\nReason: \`${message}\``,
    // TODO: Rename PLAYLIST to YOUTUBE_PLAYLIST to be more verbose.
    COMMAND_PLAY_PLAYLIST_NOT_FOUND: () => "⚠️ Playlist not found",
    COMMAND_PLAY_PLAYLIST_EMPTY: () => "⚠️ The specified playlist is empty.",
    COMMAND_PLAY_RD_PLAYLIST_NOT_SUPPORTED: () => "⚠️ RD / YouTube mix playlist is not supported yet. Please see [this issue](https://github.com/Hazmi35/jukebox/issues/594)",
    COMMAND_PLAY_PLAYLIST_ADDING_VIDEOS: (index: number, playlistTitle: string) => `Adding all tracks starting from number ${index} video in playlist: ${playlistTitle}, hang on...`,
    COMMAND_PLAY_PLAYLIST_ALL_ADDING_VIDEOS: (playlistTitle: string) => `Adding all tracks in playlist: ${playlistTitle}, hang on...`,
    COMMAND_PLAY_PLAYLIST_ADDING_FIRST_VIDEOS_ERR: () => "⚠️ Could not add the first video of the playlist",
    COMMAND_PLAY_PLAYLIST_ADDING_REST_VIDEOS_ERR: () => "⚠️ Could not add the rest videos of the playlist",
    COMMAND_PLAY_PLAYLIST_SUCCESS: (playlistTitle: string) => `All tracks in playlist: ${playlistTitle}, has been added to the queue!`,
    COMMAND_PLAY_PLAYLIST_LOAD_ERR: (message: string) => `I could not load the playlist!\nError: \`${message}\``,
    COMMAND_PLAY_YOUTUBE_SEARCH_NO_RESULTS: () => "⚠️ I could not obtain any search results!",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_TITLE: () => "Tracks Selection",
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_CANCEL_MSG: () => "Type `cancel` or `c` to cancel tracks selection", // TODO: Make that so it's possible to localize "cancel" and "c" just like RepeatCommand
    COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_FOOTER: (count: number) => `Please select one of the results ranging from 1-${count}`,
    COMMAND_PLAY_YOUTUBE_SEARCH_CANCELED: () => "Tracks selection canceled.",
    COMMAND_PLAY_YOUTUBE_SEARCH_INVALID_INPUT: () => "No or invalid value entered, tracks selection canceled.",

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
