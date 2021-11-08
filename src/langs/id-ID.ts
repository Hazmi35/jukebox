/* eslint-disable sort-keys */
import stripIndent from "strip-indent";
import pluralize from "plur";
import { lang as enUS } from "./en-US";

export const lang = {
    ...enUS, // Extend the defaults from enUS

    // Language Metadata
    META_ID: () => "id-ID",

    // Commands

    // About Command
    COMMAND_ABOUT_META_DESCRIPTION: () => "Kirim informasi tentang bot",
    COMMAND_ABOUT_EMBED_AUTHOR: (username: string) => `${username} - Hanya bot musik sederhana.`,
    COMMAND_ABOUT_EMBED_DESCRIPTION: (
        channelCount: number, guildsCount: number, shardsCount: string, shardID: string, queueCount: number,
        platform: string, arch: string, osUptime: string, memoryRSS: string, memoryHeapTotal: string, memoryHeapUsed: string, processUptime: string, botUptime: string,
        nodejsVersion: string, discordjsVersion: string, ffmpegVersion: string, ytDlpVersion: string, OpusEncoder: string, botVersion: string
    ) => stripIndent(`
    \`\`\`asciidoc
    Jumlah channel      :: ${channelCount}
    Jumlah guilds       :: ${guildsCount}
    Jumlah shard        :: ${shardsCount}
    ID Shard            :: #${shardID}
    Music berputar di   :: ${queueCount} guilds

    Platform            :: ${platform}
    Waktu aktif OS      :: ${osUptime}
    Arsitektur          :: ${arch}
    Memori (RSS)        :: ${memoryRSS}
    Memori (Heap Total) :: ${memoryHeapTotal}
    Memori (Heap Used)  :: ${memoryHeapUsed}
    Waktu aktif process :: ${processUptime}
    Waktu aktif bot     :: ${botUptime}

    Versi Node.js       :: ${nodejsVersion}
    Versi Discord.js    :: ${discordjsVersion}
    Versi FFmpeg        :: ${ffmpegVersion}
    Versi yt-dlp        :: ${ytDlpVersion}
    Opus Encoder        :: ${OpusEncoder}
    Versi Bot           :: ${botVersion}

    Kode sumber         :: https://sh.hzmi.xyz/jukebox
    \`\`\`
    `)
};
