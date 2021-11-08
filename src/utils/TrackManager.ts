import { Snowflake } from "discord-api-types";
import { Track } from "../structures/Track";

export class TrackManager {
    public constructor(public store: Track[] = []) {}

    public add(track: Track): Track {
        this.store.push(track);
        return track;
    }

    public clear(): void {
        this.store.splice(0, this.store.length);
    }

    public delete(track: Track): Track {
        this.store = this.store.filter(t => t.id !== track.id);
        return track;
    }

    public deleteByID(id: Snowflake): Track | undefined {
        const track = this.store.find(t => t.id === id);
        if (track === undefined) return undefined;
        return this.delete(track);
    }

    public deleteFirst(): Track | undefined {
        return this.store.shift();
    }

    public find(predicate: (value: Track) => boolean): Track | undefined {
        return this.store.find(predicate);
    }

    public first(): Track | undefined {
        return this.store.at(0);
    }

    public get(id: Snowflake): Track | undefined {
        return this.store.find(t => t.id === id);
    }

    public get size(): number {
        return this.store.length;
    }

    public map<U>(callbackfn: (value: Track, index: number, array: Track[]) => U, thisArg?: any): U[] {
        return this.store.map(callbackfn, thisArg);
    }
}
