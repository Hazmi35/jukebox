/* eslint-disable no-bitwise */
import ytdl from "ytdl-core";
import { Readable } from "stream";

// This fixes: https://github.com/discordjs/discord.js/issues/4027, highWatermark option is will be increased or decreased in the future
export default function playSong(YoutubeLink: string, options: ytdl.downloadOptions = { filter: "audio", quality: "highestaudio", highWaterMark: 1<<25 }): Promise<ISongData> { // Inspired by ytdl-core-discord (https://github.com/amishshah/ytdl-core-discord)
    return new Promise((resolve, reject) => {
        ytdl.getInfo(YoutubeLink, (err, info) => {
            if (err) return reject(err);
            const opus = info.formats.find(filter);
            const canDemux = opus && Number(info.length_seconds) != 0;
            if (canDemux) {
                options = { ...options, filter };
                return resolve({ data: ytdl.downloadFromInfo(info, options), canDemux: true});
            } else {
                return resolve({ data: ytdl(YoutubeLink, options), canDemux: false });
            }
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
