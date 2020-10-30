import type { YoutubeAPI } from "..";
import type { Thumbnails } from "../types/Thumbnails";

export class Video {
    public id: string;
    public url: string;
    public publishedAt!: string;
    public channelId!: string;
    public title!: string;
    public description!: string;
    public thumbnails!: Thumbnails;
    public channelTitle!: string;
    public tags!: ReadonlyArray<string>;
    public constructor(public yt: YoutubeAPI, raw: any) {
        this.id = raw.id;
        this.url = `https://youtube.com/playlist?list=${this.id}`;
        Object.assign(this, raw.snippet);
    }
}
