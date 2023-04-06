import { AudioPlayerError, AudioResource, createAudioResource, demuxProbe } from "@discordjs/voice";
import { ITrackMetadata } from "../typings";
// @ts-expect-error No typings for ffmpeg-static
import ffmpegStatic from "ffmpeg-static";
import { ServerQueue } from "./ServerQueue";
import execa from "execa";
import { SnowflakeUtil } from "discord.js";
import { YtFlags } from "youtube-dl-exec";
import { TimeUtil } from "../utils/TimeUtil";

export enum TrackType {
    unknown = 0,
    youtube = 1
}

export const defaultYtFlags = {
    ffmpegLocation: `"${ffmpegStatic as string}"`,
    format: "bestaudio[acodec=opus]/bestaudio",
    limitRate: "800K",
    output: "-",
    quiet: true
};

export class Track {
    public readonly id = SnowflakeUtil.generate();
    public type = TrackType.unknown;
    private _resource: AudioResource<ITrackMetadata> | null = null;
    public constructor(
        public readonly queue: ServerQueue,
        public readonly metadata: ITrackMetadata,
        public readonly inlineVolume: boolean = false,
        public readonly ytdlFlags: YtDlpFlags = defaultYtFlags
    ) {
        this.ytdlFlags = { ...defaultYtFlags, ...ytdlFlags };
        Object.defineProperty(this, "_resource", { enumerable: false });
    }

    // TODO: Recreate Resource Caching
    public createAudioResource(): Promise<{ resource: AudioResource<ITrackMetadata>; process: execa.ExecaChildProcess }> {
        return new Promise((resolve, reject) => {
            const process = this.queue.client.ytdl.exec(this.metadata.url, this.ytdlFlags, { stdio: ["ignore", "pipe", "ignore"] });
            if (!process.stdout) {
                reject(new Error("No stdout"));
                return;
            }
            const stream = process.stdout;
            const onError = (err: any): void => {
                if (!process.killed) process.kill();
                stream.resume();
                const error = err as AudioPlayerError; // TODO: Why do we need to assign resource on this error anyway?
                // @ts-expect-error Error here is expected.
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

    public getPlaybackDuration(): string {
        if (this._resource) {
            const playbackDuration: number = this._resource.playbackDuration;
            return TimeUtil.millisecondsToFormat(playbackDuration);
        }
        return "00:00:00";
    }

    public getTotalDuration(): string {
        if (this._resource) {
            const duration: number = this.metadata.duration;
            return TimeUtil.secondsToFormat(duration);
        }
        return "00:00:00";
    }

    public setVolume(newVolume: number): void {
        this._resource?.volume?.setVolumeLogarithmic(newVolume);
    }
}

export interface YtDlpFlags extends YtFlags {
    downloaderArgs?: string;
    extractorArgs?: string;
}
