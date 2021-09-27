import { Readable } from "stream";
import { raw } from "youtube-dl-exec";

export function YouTubeDownload(url: string): Promise<Readable> {
    return new Promise<Readable>((res, rej) => {
        const stream = raw(url, {
            o: "-",
            q: "",
            f: "bestaudio"
        }, { stdio: ["ignore", "pipe", "ignore"] });

        if (!stream.stdout) rej(Error("Unable to retrieve audio data from youtube"));

        stream.on("spawn", () => {
            res(stream.stdout!);
        }).catch(rej);
    });
}
