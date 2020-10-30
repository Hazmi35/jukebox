import type { YoutubeAPI } from "../index";
import type { Thumbnails } from "../types/Thumbnails";
import type { Video } from "./Video";

export class Playlist {
    public id: string;
    public url: string;
    public publishedAt!: string;
    public channelId!: string;
    public title!: string;
    public description!: string;
    public thumbnails!: Thumbnails;
    public channelTitle!: string;
    public constructor(public yt: YoutubeAPI, raw: any, private readonly items: any[]) {
        this.id = raw.id;
        this.url = `https://youtube.com/playlist?list=${this.id}`;
        Object.assign(this, raw.snippet);
    }

    public async getVideos(): Promise<Video[]> {
        const videos: Video[] = [];
        for (const item of this.items) { videos.push(await this.yt.getVideo(`https://youtube.com/watch?v=${item.snippet.resourceId}`)); }
        return videos;
    }
}
