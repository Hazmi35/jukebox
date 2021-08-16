import { itemType } from "..";
import { Result as IPlaylist } from "ytpl";
import { Item } from "./Item";
import { Video } from "./Video";

export class Playlist extends Item {
    public channel: IPlaylist["author"];
    public itemCount: number;
    public thumbnailURL: string;
    public constructor(protected readonly rawData: IPlaylist, protected readonly type: itemType) {
        super(rawData, type);

        this.channel = rawData.author;

        this.itemCount = rawData.items.length;

        this.thumbnailURL = rawData.bestThumbnail.url!;
    }

    public async getVideos(): Promise<Video[]> {
        return this.rawData.items.map((i: any) => new Video(i, this.type));
    }
}
