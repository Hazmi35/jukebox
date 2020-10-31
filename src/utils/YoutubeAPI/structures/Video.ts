import duration from "iso8601-duration";
import type { YoutubeAPI } from "..";
import type { IVideo } from "../types";

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
    public constructor(public yt: YoutubeAPI, public raw: IVideo["raw"], type: "video" | "playlistItem" | "searchResults" = "video") {
        this.id = type === "video"
            ? raw.id
            : type === "playlistItem" ? (raw as any).snippet.resourceId.videoId : (raw as any).id.videoId;
        this.url = `https://youtube.com/watch?v=${raw.id}`;
        this.title = raw.snippet.title;
        this.description = raw.snippet.description;
        this.channel = {
            id: raw.snippet.channelId,
            name: raw.snippet.channelTitle,
            url: `https://www.youtube.com/channel/${raw.snippet.channelId}`
        };
        this.thumbnails = raw.snippet.thumbnails;
        this.duration = raw.contentDetails?.duration ? duration.parse(raw.contentDetails.duration) : null;
        this.status = raw.status;
        this.publishedAt = new Date(raw.snippet.publishedAt);
    }
}
