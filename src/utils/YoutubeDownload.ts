import ytdl from "ytdl-core";
import { Readable } from "stream";

// This fixes: https://github.com/discordjs/discord.js/issues/4027, highWatermark option is will be increased or decreased in the future // 1048576 * 1 = 1MB
export default function playSong(YoutubeLink: string, options: ytdl.downloadOptions = { filter: "audio", quality: "highestaudio", highWaterMark: 1048576 * 32 }): Promise<ISongData> { // Inspired by ytdl-core-discord (https://github.com/amishshah/ytdl-core-discord)
    return new Promise((resolve, reject) => {
        ytdl.getInfo(YoutubeLink, (err, info) => {
            if (err) return reject(err);
            const canDemux: boolean = info.formats.find(filter)! && Number(info.length_seconds) != 0;
            options = canDemux ? { ...options, filter } : { ...options };
            return resolve({ data: ytdl.downloadFromInfo(info, options), canDemux });
        });
    });
}

function filter(f: ytdl.videoFormat): boolean {
    return f.codecs === "opus" && f.container === "webm" && Number(f.audioSampleRate) === 48000;
}

interface ISongData {
    data: Readable;
    canDemux: boolean;
}
