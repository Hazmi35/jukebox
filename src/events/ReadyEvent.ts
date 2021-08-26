import { Presence } from "discord.js";
import { BaseEvent } from "../structures/BaseEvent";
import { DefineEvent } from "../utils/decorators/DefineEvent";

@DefineEvent("ready")
export class ReadyEvent extends BaseEvent {
    public execute(): void {
        this.client.logger.info(
            `${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} I'm ready to serve ${this.client.guilds.cache.size} guilds ` +
            `with ${this.client.channels.cache.filter(c => c.type === "GUILD_TEXT").size} text channels and ` +
            `${this.client.channels.cache.filter(c => c.type === "GUILD_VOICE").size} voice channels`
        );
        this.doPresence();
    }

    private doPresence(): void {
        this.updatePresence()
            .then(() => setInterval(() => this.updatePresence(), 30 * 1000))
            .catch(e => {
                if (e.message === "Shards are still being spawned.") return this.doPresence();
                this.client.logger.error("DO_PRESENCE_ERR:", e);
            });
        return undefined;
    }

    private async updatePresence(): Promise<Presence | undefined> {
        const activityName = this.client.config.status.activity
            .replace(/{guildsCount}/g, (await this.client.util.getGuildsCount()).toString())
            .replace(/{playingCount}/g, (await this.client.util.getTotalPlaying()).toString())
            .replace(/{usersCount}/g, (await this.client.util.getUsersCount()).toString())
            .replace(/{botPrefix}/g, this.client.config.prefix);
        return this.client.user!.setPresence({
            activities: [{ name: activityName, type: this.client.config.status.type }]
        });
    }
}
