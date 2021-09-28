import { createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import { ITrack, ITrackMetadata } from "../typings";

// TODO: Recreate YTDL Caching
export function createYouTubeResource(metadata: ITrackMetadata): Promise<ITrack> {
    return new Promise((resolve, reject) => {
        const process = ytdl(
            metadata.url,
            {
                o: "-",
                q: "",
                f: "bestaudio/best",
                r: "100K"
            },
            { stdio: ["ignore", "pipe", "ignore"] }
        );
        if (!process.stdout) {
            reject(new Error("No stdout"));
            return;
        }
        const stream = process.stdout;
        const onError = (error: Error): void => {
            if (!process.killed) process.kill();
            stream.resume();
            reject(error);
        };
        process
            .once("spawn", () => {
                demuxProbe(stream)
                    .then(probe => resolve(createAudioResource(probe.stream, { metadata, inputType: probe.type })))
                    .catch(onError);
            })
            .catch(onError);
    });
}
