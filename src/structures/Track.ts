import { AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { ITrackMetadata } from "../typings";
// @ts-expect-error No typings for ffmpeg-static
import ffmpegStatic from "ffmpeg-static";
import { ServerQueue } from "./ServerQueue";
import execa from "execa";
import { SnowflakeUtil } from "discord.js";

export enum TrackType {
    unknown,
    youtube
}

export class Track {
    public readonly id = SnowflakeUtil.generate();
    public type = TrackType.unknown;
    public readonly resourceFormat: string = "bestaudio";
    private _resource: AudioResource<ITrackMetadata> | null = null;
    public constructor(
        public readonly queue: ServerQueue,
        public readonly metadata: ITrackMetadata,
        public readonly inlineVolume: boolean = false,
        public ytdlArgs = {}
    ) {
        const defaultYtdlArgs = {
            ffmpegLocation: `"${ffmpegStatic}"`,
            format: this.resourceFormat,
            limitRate: "800K",
            output: "-",
            quiet: true
        };
        this.ytdlArgs = { ...defaultYtdlArgs, ...ytdlArgs };
        Object.defineProperty(this, "_resource", { enumerable: false });
    }

    // TODO: Recreate Resource Caching
    public createAudioResource(): Promise<{ resource: AudioResource<ITrackMetadata>; process: execa.ExecaChildProcess }> {
        return new Promise((resolve, reject) => {
            const process = this.queue.client.ytdl.raw(
                this.metadata.url, this.ytdlArgs, { stdio: ["ignore", "pipe", "ignore"] }
            );
            if (!process.stdout) {
                reject(new Error("No stdout"));
                return;
            }
            const stream = process.stdout;
            const onError = (error: any): void => {
                if (!process.killed) process.kill();
                stream.resume();
                error.resource = this._resource;
                reject(error);
            };
            process
                .once("spawn", () => {
                    demuxProbe(stream)
                        .then(probe => {
                            this._resource = createAudioResource(probe.stream, {
                                metadata: this.metadata,
                                inputType: probe.type,
                                inlineVolume: this.inlineVolume
                            });
                            resolve({ resource: this._resource, process });
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
