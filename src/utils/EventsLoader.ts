import { promises as fs } from "fs";
import { parse, resolve } from "path";
import { Jukebox } from "../structures/Jukebox";
import { IEvent } from "../typings";

export class EventsLoader {
    public constructor(public client: Jukebox, public readonly path: string) {}

    public async load(): Promise<Jukebox> {
        const files: string[] | undefined = await fs.readdir(resolve(this.path));
        for (const file of files) {
            const event = await EventsLoader.import(resolve(this.path, file), this.client);
            if (event === undefined) throw new Error(`File ${file} is not a valid event file`);
            this.client.on(event.name, (...args) => event.execute(...args));
            this.client.logger.info(`Event for listener ${event.name} has been loaded!`);
        }
        this.client.logger.info(`A total of ${files.length} of events has been loaded!`);
        return this.client;
    }

    private static async import(path: string, ...args: any[]): Promise<IEvent | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const file = await import(resolve(path)).then(m => m[parse(path).name]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return file ? new file(...args) : undefined;
    }
}
