import got from "got";
import URL from "url";
import querystring from "querystring";
import { Playlist } from "./structures/Playlist";
import { Video } from "./structures/Video";

export class YoutubeAPI {
    public readonly request = got;
    public constructor(key: string) {
        this.request = got.extend({
            prefixUrl: "https://www.googleapis.com/youtube/v3/",
            searchParams: { key, part: "snippet,id,status,contentDetails" }
        });
    }

    public async getVideo(id: string): Promise<Video> {
        const raw: any = await this.request.get("videos", { searchParams: { id, maxResults: 1 } }).json();
        return new Video(this, raw.items[0]);
    }

    public getVideoByURL(url: string): Promise<Video> {
        const id = querystring.parse(URL.parse(url).query!).v as string;
        return this.getVideo(id);
    }

    public async getPlaylist(id: string): Promise<Playlist> {
        const raw: any = await this.request.get("playlists", { searchParams: { id, maxResults: 1 } }).json();
        return new Playlist(this, raw.items[0]);
    }

    public getPlaylistByURL(url: string): Promise<Playlist> {
        const id = querystring.parse(URL.parse(url).query!).list as string;
        return this.getPlaylist(id);
    }

    public async searchVideos(q: string, maxResults = 5): Promise<Video[]> {
        const { items }: any = await this.request.get("search", { searchParams: { maxResults, part: "snippet", q, safeSearch: "none", type: "video" } }).json();
        const videos = [];
        for (const item of items) { videos.push(await this.getVideo(item.id.videoId)); }
        return videos;
    }
}
