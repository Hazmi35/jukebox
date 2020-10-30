import type { IPlaylistItems } from "../types";
import type { Playlist } from "./Playlist";

export class PlaylistItems implements IPlaylistItems {
    public addedAt: IPlaylistItems["addedAt"];
    public id: IPlaylistItems["id"];
    public url: IPlaylistItems["url"];
    public title: IPlaylistItems["title"];
    public description: IPlaylistItems["description"];
    public channel: IPlaylistItems["channel"];
    public thumbnails: IPlaylistItems["thumbnails"];
    public privacyStatus: IPlaylistItems["privacyStatus"];
    public publishedAt: IPlaylistItems["publishedAt"];
    public position: IPlaylistItems["position"];
    public constructor(public playlist: Playlist, public raw: IPlaylistItems["raw"]) {
        this.addedAt = new Date(raw.snippet.publishedAt);
        this.id = raw.contentDetails.videoId;
        this.url = `https://youtube.com/watch?v=${this.id}`;
        this.title = raw.snippet.title;
        this.description = raw.snippet.description;
        this.channel = {
            id: raw.snippet.channelId,
            name: raw.snippet.channelTitle,
            url: `https://www.youtube.com/channel/${raw.snippet.channelId}`
        };
        this.thumbnails = raw.snippet.thumbnails;
        this.privacyStatus = raw.status.privacyStatus;
        this.publishedAt = new Date(raw.contentDetails.videoPublishedAt);
        this.position = raw.snippet.position;
    }
}
