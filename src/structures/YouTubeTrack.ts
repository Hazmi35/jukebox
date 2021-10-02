import { ITrackMetadata } from "../typings";
import { Track, TrackType } from "./Track";


export class YouTubeTrack extends Track {
    public type = TrackType.youtube;
    public readonly resourceFormat: string = "bestaudio/93";
    public constructor(public metadata: ITrackMetadata) { super(metadata); }
}
