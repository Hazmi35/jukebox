import { getInfo, downloadFromInfo, videoInfo, downloadOptions, videoFormat } from "ytdl-core";
import { Readable, PassThrough } from "stream";
import { resolve as resolvePath } from "path";
import { createReadStream, createWriteStream, existsSync } from "fs";

// Inspired by ytdl-core-discord (https://github.com/amishshah/ytdl-core-discord)  // 1048576 * 1 = 1MB
export default function playSong(YoutubeLink: string, options: IdownloadOptions = { filter: "audio", quality: "highestaudio", highWaterMark: 1048576 * 32 }): Promise<ISongData> {
    return new Promise((resolve, reject) => {
        getInfo(YoutubeLink).then((info) => {
            const canDemux: boolean = info.formats.find(filter)! && Number(info.length_seconds) != 0;
            options = canDemux ? { ...options, filter } : { ...options };
            if (options.cache && info.formats.find(f => !f.live)) {
                const path = resolvePath(process.cwd(), "cache", `${info.video_id}.webm`);
                if (existsSync(resolvePath(path))) return resolve({ canDemux, info, stream: createReadStream(path), cache: true });
                const data = downloadFromInfo(info, options);
                const stream = new PassThrough();
                const cache = createWriteStream(path);
                data.on("data", (chunk) => { stream.write(chunk); cache.write(chunk); } );
                data.on("end", () => { stream.end(); cache.end(); });
                return resolve({ canDemux, info, stream, cache: false });
            }
            return resolve({ canDemux, info, stream: downloadFromInfo(info, options), cache: false });
        }).catch(reject);
    });
}

function filter(f: videoFormat): boolean {
    return f.codecs === "opus" && f.container === "webm" && Number(f.audioSampleRate) === 48000;
}

interface ISongData {
    canDemux: boolean;
    info: videoInfo;
    stream: Readable;
    cache: boolean;
}

interface IdownloadOptions extends downloadOptions { cache?: boolean }