import { readdirSync } from "fs";
import Jukebox from "../structures/Jukebox";
import { ClientEvent } from "../../typings";

export default class ClientEventsLoader {
    public constructor(public client: Jukebox, public readonly path: string) {}

    public load(): Jukebox {
        const eventFiles: string[] | undefined = readdirSync(this.path);
        for (const eventFile of eventFiles) {
            if (eventFile.endsWith(".map")) continue;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const event: ClientEvent = new (require(`${this.path}/${eventFile}`).default)(this.client);
            this.client.on(event.name, (...args) => event.execute(...args));
            this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Event ${event.name} has been loaded!`);
        }
        return this.client;
    }
}
