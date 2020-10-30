import { formatISODuration } from "date-fns";
import type { YoutubeAPI } from "..";
import type { IVideo } from "../types/Video";

export class Video implements IVideo {
    public id: IVideo["id"];
    public url: IVideo["url"];
    public title: IVideo["title"];
    public description: IVideo["description"];
    public channel: IVideo["channel"];
    public thumbnails: IVideo["thumbnails"];
    public duration: IVideo["duration"];
    public status: IVideo["status"];
    public publishedAt: IVideo["publishedAt"];
    public constructor(public yt: YoutubeAPI, public raw: IVideo["raw"]) {
        this.id = raw.id;
        this.url = `https://youtube.com/watch?v=${raw.id}`;
        this.title = raw.snippet.title;
        this.description = raw.snippet.description;
        this.channel = {
            id: raw.snippet.channelID,
            name: raw.snippet.channelTitle,
            url: `https://www.youtube.com/channel/${raw.snippet.channelID}`
        };
        this.thumbnails = raw.snippet.thumbnails;
        this.duration = formatISODuration(raw.contentDetails.duration as Duration);
        this.status = raw.status;
        this.publishedAt = new Date(raw.snippet.publishedAt);
    }
}
