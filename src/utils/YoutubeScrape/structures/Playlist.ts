import { VideoInfo } from "./Video";

export class Playlist {
    public readonly url: string;
    public constructor(public readonly id: string, public readonly title: string, public readonly author: string, public readonly videos: VideoInfo[]) {
        this.url = `http://www.youtube.com/playlist?list=${this.id}`;
    }
}
