import { ClientEvent } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { Presence } from "discord.js";

export default class ReadyEvent implements ClientEvent {
    readonly name = "ready";
    constructor(private client: Jukebox) {}

    public execute(): void {
        this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} I'm ready to serve `
        + `${this.client.users.cache.filter(u => !u.equals(this.client.user!)).size} users on ${this.client.guilds.cache.size} guilds!`);
        const updatePresence = async (): Promise<Presence> => this.client.user!.setPresence({
            activity: { name: `music with ${await this.client.getUsersCount()} users!`, type: "LISTENING" }
        });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(updatePresence, 30 * 1000); updatePresence();
    }
}
