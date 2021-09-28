import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import { ITrackMetadata } from "../typings";

export class Track {
    private _resource: AudioResource<ITrackMetadata> | null = null;
    public constructor(public metadata: ITrackMetadata) {
        Object.defineProperty(this, "_resource", { enumerable: false });
    }

    // TODO: Recreate YTDL Caching
    public createAudioResource(): Promise<AudioResource<ITrackMetadata>> {
        return new Promise((resolve, reject) => {
            const process = ytdl(
                this.metadata.url,
                {
                    o: "-",
                    q: "",
                    f: "bestaudio/best", // NOTE: Best is added here because live videos doesn't have audioonly
                    r: "100K" // TODO: Make so user can configure this?
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
                        .then(probe => {
                            this._resource = createAudioResource(probe.stream, {
                                metadata: this.metadata,
                                inputType: probe.type,
                                inlineVolume: this.metadata.inlineVolume
                            });
                            resolve(this._resource);
                        })
                        .catch(onError);
                })
                .catch(onError);
        });
    }

    public setVolume(newVolume: number): void {
        this._resource?.volume?.setVolumeLogarithmic(newVolume);
    }
}
