/* eslint-disable radix */
import { Video as APIVideo } from "../utils/YouTubeAPI/structures/Video";
import { Video as SRVideo } from "ytsr";
import { Item } from "./Item";
import parse from "parse-ms";

export class Video extends Item {
    public channel: { id: string; name: string; url: string };
    public duration: parse.Parsed | null;
    public isPrivate: boolean;
    public thumbnailURL: string;
    public constructor(protected readonly rawData: APIVideo | SRVideo, protected readonly type: "api" | "scrape") {
        super(rawData, type);

        this.channel = {
            id: type === "api" ? (rawData as APIVideo).channel.id : (rawData as SRVideo).author!.channelID,
            name: type === "api" ? (rawData as APIVideo).channel.name : (rawData as SRVideo).author!.name,
            url: type === "api" ? (rawData as APIVideo).channel.url : (rawData as SRVideo).author!.url
        };

        // TODO: API Should always fetch Videos.
        this.duration = type === "api"
            ? (rawData as APIVideo).durationMS ? parse((rawData as APIVideo).durationMS!) : null
            : parse(this.durationToMS((rawData as SRVideo).duration!));

        this.isPrivate = type === "api" ? (rawData as APIVideo).status.privacyStatus === "private" : false;

        this.thumbnailURL = type === "api" ? (rawData as APIVideo).thumbnailURL! : (rawData as SRVideo).bestThumbnail.url!;
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
