import { ITrackMetadata } from "../typings";
import { ServerQueue } from "./ServerQueue";
import { Track, TrackType, defaultYtFlags } from "./Track";


export class YouTubeTrack extends Track {
    public type = TrackType.youtube;
    public constructor(public readonly queue: ServerQueue, public readonly metadata: ITrackMetadata, public readonly inlineVolume: boolean = false) {
        super(queue, metadata, inlineVolume, {
            format: `${defaultYtFlags.format}/95`,
            downloaderArgs: "ffmpeg:-acodec libopus -f opus",
            extractorArgs: "youtube:include-live-dash"
        });
    }
}
