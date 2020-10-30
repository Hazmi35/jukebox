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
            searchParams: { key, part: "snippet,id,status,contentDetails" }
        });
    }

    public async getVideo(url: string): Promise<Video> {
        const id = querystring.parse(URL.parse(url).query!).v as string;
        const raw: any = await this.request.get("videos", { searchParams: { id, maxResults: 1 } }).json();
        return new Video(this, raw.items[0]);
    }

    public getVideoByID(id: string): Promise<Video> {
        return this.getVideo(`https://youtube.com/watch?v=${id}`);
    }

/*     public async getPlaylist(url: string): Promise<Playlist> {
        const id = querystring.parse(URL.parse(url).query!).list as string;
        const result: any = await this.request.get("playlists", { searchParams: { id } }).json();
        const raw = result.items[0];
        let itemCount: number = raw.contentDetails.itemCount;
        const items: any[] = [];
        while (itemCount !== 0) {
            const raw: any = await this.request.get("playlistItems", { searchParams: { playlistId: id, maxResults: 50 } }).json();
            raw.items.forEach((i: any) => items.push(i));
            itemCount -= 50;
        }
        return new Playlist(this, raw, items);
    }

    public async searchVideos(query: string, maxResults = 5): Promise<Video[]> {
        const { items }: any = await this.request.get("search", { searchParams: { q: query, safeSearch: "none", type: "video", maxResults } }).json();
        console.log(items);
        const videos = [];
        for (const item of items) { videos.push(await this.getVideo(`https://youtube.com/watch?v=${item.id.videoId}`)); }
        return videos;
    } */
}
