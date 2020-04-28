import { readdirSync } from "fs";
import Jukebox from "../structures/Jukebox";
import { ClientEvent } from "../../typings";

export default class ClientEventsLoader {
    constructor(public client: Jukebox, readonly path: string) {}

    public load(): Jukebox {
        const eventFiles: string[] | undefined = readdirSync(this.path);
        for (const eventFile of eventFiles) {
            if (eventFile.endsWith(".map")) continue;
            const event: ClientEvent = new (require(`${this.path}/${eventFile}`).default)(this.client);
            this.client.on(event.name, (...args) => event.execute(...args));
            this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Event ${event.name} has been loaded!`);
        }
        return this.client;
    }
}