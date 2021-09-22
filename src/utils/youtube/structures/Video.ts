import { stream as download } from "play-dl";
import { Video as IVideo } from "ytsr";
import { Item, itemType, videoBasicInfo } from "./Item";

export class Video extends Item {
    public constructor(public raw: IVideo | videoBasicInfo, protected readonly _type: itemType) {
        super(raw, _type);
    }

    public async download(): ReturnType<typeof download> {
        return download(this.url);
    }
}
