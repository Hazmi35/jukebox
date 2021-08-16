import { itemType } from "..";
import { Playlist, Video } from "ytsr";
import { Result as PlaylistData } from "ytpl";
import { IMusicInfo } from "../downloader";

export class Item {
    public id: string;
    public title: string;
    public url: string;
    public constructor(protected readonly rawData: Video | Playlist | PlaylistData | IMusicInfo, protected readonly type: itemType) {
        this.id = type === "ytdl-core" ? (rawData as IMusicInfo).videoDetails.videoId : (rawData as Video).id;

        this.title = type === "ytdl-core" ? (rawData as IMusicInfo).videoDetails.title : (rawData as Video).title;

        this.url = type === "ytdl-core" ? (rawData as IMusicInfo).videoDetails.video_url : (rawData as Video).url;
    }
}
