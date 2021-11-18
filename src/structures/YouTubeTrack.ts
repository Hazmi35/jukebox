import { ITrackMetadata } from "../typings";
import { ServerQueue } from "./ServerQueue";
import { Track, TrackType } from "./Track";


export class YouTubeTrack extends Track {
    public type = TrackType.youtube;
    public readonly resourceFormat: string = "bestaudio/140";
    public constructor(public readonly queue: ServerQueue, public readonly metadata: ITrackMetadata, public readonly inlineVolume: boolean = false) {
        super(queue, metadata, inlineVolume, {
            downloaderArgs: '"ffmpeg:-movflags frag_keyframe+empty_moov frag_keyframe+empty_moov -f opus"',
            extractorArgs: "youtube:include-live-dash"
        });
    }
}
