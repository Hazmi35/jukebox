/* import type { YoutubeAPI } from "../index";
import type { IThumbnails } from "../types/Thumbnails";
import type { Video } from "./Video";

export class Playlist {
    public id: string;
    public url: string;
    public count: number;
    public publishedAt!: string;
    public channelId!: string;
    public title!: string;
    public description!: string;
    public thumbnails!: IThumbnails;
    public channelTitle!: string;
    public constructor(public yt: YoutubeAPI, raw: any, private readonly items: any[]) {
        this.id = raw.id;
        this.url = `https://youtube.com/playlist?list=${this.id}`;
        this.count = this.items.length;
        console.log(this);
    }

    public async getVideos(): Promise<Video[]> {
        const videos: Video[] = [];
        for (const item of this.items) { videos.push(Object.assign(item.snippet, { status: item.status })); }
        console.log(videos);
        return videos;
    }
}
 */