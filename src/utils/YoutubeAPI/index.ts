import got from "got";
import URL from "url";
import querystring from "querystring";
import { Playlist } from "./structures/Playlist";
import { Video } from "./structures/Video";

export class YoutubeAPI {
    private readonly request = got;
    public constructor(key: string) {
        this.request = got.extend({
            prefixUrl: "https://www.googleapis.com/youtube/v3/",
            searchParams: { key, part: "snippet,id" }
        });
    }

    public async getVideo(url: string): Promise<Video> {
        const id = querystring.parse(URL.parse(url).query!).v as string;
        const raw: any = await this.request.get("videos", { searchParams: { id, maxResults: 1 } }).json();
        return new Video(this, raw.items[0]);
    }

    public async getPlaylist(url: string): Promise<Playlist> {
        const id = querystring.parse(URL.parse(url).query!).list as string;
        const raw: any = await this.request.get("playlists", { searchParams: { id } }).json();
        const { items }: any = await this.request.get("playlistItems", { searchParams: { playlistId: id } }).json();
        return new Playlist(this, raw, items);
    }

    public async searchVideos(query: string, maxResults: number): Promise<Video[]> {
        const { items }: any = await this.request.get("search", { searchParams: { q: query, safeSearch: "none", type: "video", maxResults } }).json();
        const videos = [];
        for (const item of items) { videos.push(await this.getVideo(`https://youtube.com/watch?v=${item.id.videoId}`)); }
        return videos;
    }
}
