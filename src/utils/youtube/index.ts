import ytsr from "ytsr";
import ytpl from "ytpl";
import { IMusicData, playMusic, IdownloadOptions, getMusicInfo } from "./downloader";
import { Video } from "./structures/Video";
import { Playlist } from "./structures/Playlist";

interface scrape { search: typeof ytsr; playlist: typeof ytpl; getVideo: typeof getMusicInfo }

export type itemType = "scrape" | "ytdl-core";

export class YouTube {
    private readonly engine: scrape | undefined;
    public constructor(private readonly mode?: itemType) {
        if (mode === "scrape") {
            this.engine = {
                search: ytsr,
                playlist: ytpl,
                getVideo: getMusicInfo
            };
        } else {
            throw new Error("Unknown mode! Available modes are 'scrape'.");
        }
    }

    public downloadVideo(link: string, options?: IdownloadOptions): Promise<IMusicData> {
        return playMusic(link, options);
    }

    public async getVideo(id: string): Promise<Video> {
        let data;
        if (this.mode === "scrape") data = (await (this.engine as scrape).getVideo(`https://youtube.com/watch?v=${id}`));
        if (data === undefined) throw new Error("I could not get any data!");
        return new Video(data, "ytdl-core");
    }

    public async getPlaylist(id: string): Promise<Playlist> {
        let data;
        if (this.mode === "scrape") data = (await (this.engine as scrape).playlist(id, { limit: Infinity }));
        if (data === undefined) throw new Error("I could not get any data!");
        return new Playlist(data, this.mode!);
    }

    public async searchVideos(query: string, maxResults = 5): Promise<Video[]> {
        let data;
        if (this.mode === "scrape") data = (await (this.engine as scrape).search(query, { limit: maxResults, safeSearch: false })).items;
        if (data === undefined) throw new Error("I could not get any data!");
        return data.filter((x: any) => {
            if (this.mode === "scrape") return x.type === "video";
            return true;
        }).map((i: any) => new Video(i, this.mode!));
    }
}
