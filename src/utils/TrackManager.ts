import { Snowflake, SnowflakeUtil, Collection } from "discord.js";
import { ITrack } from "../typings";

export class TrackManager extends Collection<Snowflake, ITrack> {
    public constructor(data?: ReadonlyArray<readonly [Snowflake, ITrack]> | null) {
        super(data);
    }

    public add(track: ITrack): this {
        return this.set(SnowflakeUtil.generate(), track);
    }

    public deleteFirst(): boolean {
        return this.delete(this.firstKey()!);
    }

    public clear(): this {
        this.forEach((v: ITrack, k: Snowflake) => {
            this.delete(k);
        });
        return this;
    }
}
