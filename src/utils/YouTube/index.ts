import { YoutubeAPI } from "./utils/YouTubeAPI";
import ytsr, { Video as SRVideo } from "ytsr";
import ytpl, { Result as SRPlaylist } from "ytpl";
import { IMusicData, playMusic, IdownloadOptions } from "./downloader";
import { Video } from "./structures/Video";
import { Playlist } from "./structures/Playlist";

interface scrape { search: typeof ytsr; playlist: typeof ytpl }

export class YouTube {
    private readonly engine: YoutubeAPI | scrape | undefined;
    public constructor(private readonly mode?: "api" | "scrape", private readonly apiKey?: string) {
        Object.defineProperty(this, "apiKey", {
            enumerable: false,
            writable: false
        });
        if (mode === "api") {
            if (!apiKey) throw new Error("Missing API Key for mode: api");
            this.engine = new YoutubeAPI(apiKey);
        } else if (mode === "scrape") {
            this.engine = {
                search: ytsr,
                playlist: ytpl
            };
        } else {
            throw new Error("Unknown mode! Available modes are 'api' and 'scrape'.");
        }
    }

    public downloadVideo(link: string, options?: IdownloadOptions): Promise<IMusicData> {
        return playMusic(link, options);
    }

    public async getVideo(id: string): Promise<Video> {
        let data;
        if (this.mode === "api") data = await (this.engine as YoutubeAPI).getVideo(id);
        if (this.mode === "scrape") data = (await (this.engine as scrape).search(`https://youtube.com/watch?v=${id}`, { limit: 1, safeSearch: false })).items[0] as unknown as SRVideo;
        if (data === undefined) throw new Error("I could not get any data!");
        return new Video(data, this.mode!);
    }

    public async getPlaylist(id: string): Promise<Playlist> {
        let data;
        if (this.mode === "api") data = await (this.engine as YoutubeAPI).getPlaylist(id);
        if (this.mode === "scrape") data = (await (this.engine as scrape).playlist(id, { limit: Infinity })) as unknown as SRPlaylist;
        if (data === undefined) throw new Error("I could not get any data!");
        return new Playlist(data, this.mode!);
    }

    public async searchVideos(query: string, maxResults = 5): Promise<Video[]> {
        let data;
        if (this.mode === "api") data = await (this.engine as YoutubeAPI).searchVideos(query, maxResults);
        if (this.mode === "scrape") data = (await (this.engine as scrape).search(query, { limit: maxResults, safeSearch: false })).items as unknown as SRVideo[];
        if (data === undefined) throw new Error("I could not get any data!");
        // @ts-expect-error Error expected
        return data.filter((x: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this.mode === "scrape") return (x as SRVideo).type === "video";
            return true;
        }).map((i: any) => new Video(i, this.mode!));
    }
}
