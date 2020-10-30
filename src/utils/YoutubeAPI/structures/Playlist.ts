import type { YoutubeAPI } from "..";
import type { IPlaylist, IPlaylistItems } from "../types";
import { PlaylistItems } from "./PlaylistItems";

export class Playlist implements IPlaylist {
    public id: IPlaylist["id"];
    public url: IPlaylist["url"];
    public title: IPlaylist["title"];
    public description: IPlaylist["description"];
    public channel: IPlaylist["channel"];
    public thumbnails: IPlaylist["thumbnails"];
    public itemCount: IPlaylist["itemCount"];
    public privacyStatus: IPlaylist["privacyStatus"];
    public createdAt: IPlaylist["createdAt"];
    public constructor(public yt: YoutubeAPI, public raw: IPlaylist["raw"]) {
        this.id = raw.id;
        this.url = `https://youtube.com/playlist?vlist=${raw.id}`;
        this.title = raw.snippet.title;
        this.description = raw.snippet.description;
        this.channel = {
            id: raw.snippet.channelId,
            name: raw.snippet.channelTitle,
            url: `https://www.youtube.com/channel/${raw.snippet.channelId}`
        };
        this.thumbnails = raw.snippet.thumbnails;
        this.itemCount = raw.contentDetails.itemCount;
        this.privacyStatus = raw.status.privacyStatus;
        this.createdAt = new Date(raw.snippet.publishedAt);
    }

    public async getVideos(): Promise<IPlaylistItems[]> {
        const videos: IPlaylistItems[] = [];
        let pageToken: string | null = "";
        while (videos.length !== this.itemCount) {
            let searchParams = { playlistId: this.id, maxResults: 50 };
            if (pageToken !== null) searchParams = Object.assign(searchParams, { pageToken });
            const raw: any = await this.yt.request.get("playlistItems", { searchParams }).json();
            pageToken = raw.nextPageToken;
            for (const item of raw.items) { videos.push(new PlaylistItems(this, item)); }
        }
        return videos;
    }
}
