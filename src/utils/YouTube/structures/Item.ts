import { Video as APIVideo } from "../utils/YouTubeAPI/structures/Video";
import { Video as SRVideo } from "ytsr";
import { Playlist as APIPlaylist } from "../utils/YouTubeAPI/structures/Playlist";
import { Result as SRPlaylist } from "ytpl";

export class Item {
    public id: string;
    public title: string;
    public url: string;
    public constructor(protected readonly rawData: APIVideo | SRVideo | APIPlaylist | SRPlaylist, protected readonly type: "api" | "scrape") {
        this.id = type === "api" ? (rawData as APIVideo).id : (rawData as SRVideo).id;

        this.title = rawData.title;

        this.url = type === "api" ? (rawData as APIVideo).url : (rawData as SRVideo).url;
    }
}
