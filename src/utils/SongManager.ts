import { Collection } from "discord.js";
import { ISongs as ISongManager, ISong } from "../typings";

export default class SongManager extends Collection<any, any> implements ISongManager {
    constructor(data?: any) {
        super(data);
    }
    public addSong(song: ISong): this {
        return this.set(String(this.size + 1), song);
    }
    public deleteFirst(): boolean {
        return this.delete(this.firstKey());
    }
    public clear(): this {
        this.forEach((v: ISong, k: number) => {
            this.delete(k);
        });
        return this;
    }
}