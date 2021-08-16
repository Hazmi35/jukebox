import { itemType } from "..";
import { Video as SRVideo } from "ytsr";
import { Item } from "./Item";
import parse from "parse-ms";
import { IMusicInfo } from "../downloader";

export class Video extends Item {
    public channel: { id: string; name: string; url: string };
    public duration: parse.Parsed | null;
    public thumbnailURL: string;
    public constructor(protected readonly rawData: SRVideo | IMusicInfo, protected readonly type: itemType) {
        super(rawData, type);

        this.channel = {
            id: type === "scrape"
                ? (rawData as SRVideo).author!.channelID
                : (rawData as IMusicInfo).videoDetails.author.id,
            name: type === "scrape"
                ? (rawData as SRVideo).author!.name
                : (rawData as IMusicInfo).videoDetails.author.name,
            url: type === "scrape"
                ? (rawData as SRVideo).author!.url
                : (rawData as IMusicInfo).videoDetails.author.name
        };

        this.duration = type === "scrape"
            ? parse(this.durationToMS((rawData as SRVideo).duration!))
            : parse(Number((rawData as IMusicInfo).videoDetails.lengthSeconds) * 1000);

        this.thumbnailURL = type === "scrape"
            ? (rawData as SRVideo).bestThumbnail.url!
            : (rawData as IMusicInfo).videoDetails.thumbnails[(rawData as IMusicInfo).videoDetails.thumbnails.length - 1].url;
    }

    private durationToMS(duration: string): number {
        const args = duration.split(":");
        let dur = 0;

        switch (args.length) {
            case 3:
                dur = ((parseInt(args[0]) * 60) * 60) * ((1000 + parseInt(args[1])) * 60) * (1000 + parseInt(args[2])) * 1000;
                break;
            case 2:
                dur = (parseInt(args[0]) * 60) * (1000 + (parseInt(args[1]) * 1000));
                break;
            default:
                dur = parseInt(args[0]) * 1000;
        }

        return dur;
    }
}
