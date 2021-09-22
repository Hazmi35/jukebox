import { video_basic_info } from "play-dl";
import { Result as Playlist } from "ytpl";
import { Video } from "ytsr";

export type normalType = (Video | Playlist);
// @ts-expect-error next-line
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, no-return-await
const videoBasicInfoTypeHack = () => await video_basic_info();
export type videoBasicInfo = ReturnType<typeof videoBasicInfoTypeHack>;
export type raw = normalType | videoBasicInfo;
export type itemType = "normal" | "play-dl";
export type videoBasicInfoVideoDetails = videoBasicInfo["video_details"];

export class Item {
    public id: string;
    public title: string;
    public url: string;
    public author: { id: string | undefined; name: string | undefined; url: string | undefined };
    public bestThumbnailURL: string | undefined;
    public constructor(public raw: raw, protected readonly _type: itemType) {
        Object.defineProperty(this, "_type", { enumerable: false });

        const videoDetails = _type === "normal" ? (raw as normalType) : (raw as videoBasicInfo).video_details;

        if (_type === "normal") Object.assign(videoDetails, { channel: (videoDetails as normalType).author });

        this.id = videoDetails.id;

        this.title = videoDetails.title;

        this.url = videoDetails.url;

        this.author = {
            id: _type === "normal" ? (raw as normalType).author?.channelID : (videoDetails as videoBasicInfoVideoDetails).channel.id,
            url: _type === "normal" ? (raw as normalType).author?.url : (videoDetails as videoBasicInfoVideoDetails).channel.url,
            name: _type === "normal" ? (raw as normalType).author?.name : (videoDetails as videoBasicInfoVideoDetails).channel.name
        };

        this.bestThumbnailURL = _type === "normal" ? (raw as normalType).bestThumbnail.url ?? undefined : (raw as videoBasicInfo).video_details.thumbnail.url;
    }
}
