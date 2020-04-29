import { getInfo, downloadFromInfo, videoInfo, downloadOptions, videoFormat } from "ytdl-core";
import { Readable, PassThrough } from "stream";
import { resolve as resolvePath } from "path";
import { createReadStream, createWriteStream, existsSync } from "fs";

// Inspired by ytdl-core-discord (https://github.com/amishshah/ytdl-core-discord)  // 1048576 * 1 = 1MB
export default function playSong(YoutubeLink: string, options: IdownloadOptions = { filter: "audio", quality: "highestaudio", highWaterMark: 1048576 * 32 }): Promise<ISongData> {
    return new Promise((resolve, reject) => {
        getInfo(YoutubeLink, (err, info) => {
            if (err) return reject(err);
            const canDemux: boolean = info.formats.find(filter)! && Number(info.length_seconds) != 0;
            options = canDemux ? { ...options, filter } : { ...options };
            if (options.cache && info.formats.find(f => !f.live)) {
                const path = resolvePath(process.cwd(), "cache", `${info.video_id}.webm`);
                if (existsSync(resolvePath(path))) return resolve({ canDemux, info, stream: createReadStream(path) });
                const data = downloadFromInfo(info, options);
                const stream = new PassThrough();
                data.on("data", (chunk) => stream.write(chunk)); data.pipe(createWriteStream(path));
                return resolve({ canDemux, info, stream });
            }
            return resolve({ canDemux, info, stream: downloadFromInfo(info, options) });
        });
    });
}

function filter(f: videoFormat): boolean {
    return f.codecs === "opus" && f.container === "webm" && Number(f.audioSampleRate) === 48000;
}

interface ISongData {
    canDemux: boolean;
    info: videoInfo;
    stream: Readable;
}

interface IdownloadOptions extends downloadOptions { cache?: boolean }