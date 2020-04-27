import { Collection, SnowflakeUtil, Snowflake } from "discord.js";
import { ISongs as ISongManager, ISong } from "../../typings";

export default class SongManager extends Collection<Snowflake, ISong> implements ISongManager {
    constructor(data?: any) {
        super(data);
    }
    public addSong(song: ISong): this {
        return this.set(SnowflakeUtil.generate(), song);
    }
    public deleteFirst(): boolean {
        return this.delete(this.firstKey()!);
    }
    public clear(): this {
        this.forEach((v: ISong, k: Snowflake) => {
            this.delete(k);
        });
        return this;
    }
}