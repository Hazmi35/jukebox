import { Video as APIVideo } from "../utils/YouTubeAPI/structures/Video";
import { Playlist as APIPlaylist } from "../utils/YouTubeAPI/structures/Playlist";
import { Playlist as SRPlaylist, Video as SRVideo } from "youtube-sr";
import { YTDLInfo } from "..";

export class Item {
    public id: string;
    public title: string;
    public url: string;
    public thumbnailURL: string;
    public constructor(protected readonly rawData: APIVideo | YTDLInfo | APIPlaylist | SRPlaylist | SRVideo, protected readonly type: "api" | "scrape" | "ytdl") {
        this.id = type === "api"
            ? (rawData as APIVideo).id
            : type === "scrape" ? (rawData as SRVideo).id! : (rawData as YTDLInfo).videoId;
        this.title = rawData.title!;
        this.url = type === "api"
            ? (rawData as APIVideo).url
            : type === "scrape" ? (rawData as SRVideo).url : (rawData as YTDLInfo).video_url;
        this.thumbnailURL = type === "api"
            ? (rawData as APIVideo).thumbnailURL
            : type === "scrape" ? (rawData as SRVideo).thumbnail!.displayThumbnailURL("maxresdefault") : (rawData as YTDLInfo).thumbnails[(rawData as YTDLInfo).thumbnails.length - 1].url;
    }
}
