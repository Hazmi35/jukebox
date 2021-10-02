import { Snowflake, SnowflakeUtil, Collection } from "discord.js";
import { Track } from "../structures/Track";

export class TrackManager extends Collection<Snowflake, Track> {
    public constructor(data?: ReadonlyArray<readonly [Snowflake, Track]> | null) {
        super(data);
    }

    public add(track: Track): Track {
        this.set(SnowflakeUtil.generate(), track);
        return track;
    }

    public deleteFirst(): boolean {
        return this.delete(this.firstKey()!);
    }

    public clear(): this {
        this.forEach((v: Track, k: Snowflake) => {
            this.delete(k);
        });
        return this;
    }
}
