import { Collection, GuildMember, Snowflake } from "discord.js";
import { IVoiceState } from "../../typings";
import { BaseListener } from "../structures/BaseListener";
import { ServerQueue } from "../structures/ServerQueue";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";
import { formatMS } from "../utils/formatMS";

@DefineListener("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseListener {
    public execute(oldState: IVoiceState, newState: IVoiceState): any {
        const queue = newState.guild.queue;

        if (!queue) return undefined;

        const oldID = oldState.channel?.id;
        const newID = newState.channel?.id;
        const vc = queue.voiceChannel!;
        const member = newState.member;
        const vcMembers = vc.members.filter(m => !m.user.bot);

        // Handle when bot gets kicked from the voice channel
        if (oldState.id === this.client.user?.id && oldID === vc.id && newID === undefined) {
            try {
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, queue deleted.`);
                queue.textChannel?.send(createEmbed("warn", "I'm disconnected from the voice channel, the queue will be deleted"))
                    .catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                return newState.guild.queue = null;
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        // Handle when user leaves voice channel
        if (oldID === vc.id && newID !== vc.id && !member?.user.bot && queue.timeout === null) this.doTimeout(vcMembers, queue, newState);

        // Handle when user joins voice channel or bot gets moved
        if (newID === vc.id && !member?.user.bot) this.resumeTimeout(vcMembers, queue, newState);
    }

    public doTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: IVoiceState): any {
        try {
            if (vcMembers.size !== 0) return undefined;
            console.log(vcMembers.size);
            clearTimeout(queue.timeout!);
            newState.guild.queue!.timeout = null;
            newState.guild.queue!.playing = false;
            queue.connection?.dispatcher.pause();
            const timeout = this.client.config.deleteQueueTimeout;
            const duration = formatMS(timeout);
            newState.guild.queue!.timeout = setTimeout(() => {
                queue.voiceChannel?.leave();
                newState.guild.queue = null;
                queue.textChannel?.send(
                    createEmbed("error", `${duration} have passed and there is no one who joins my voice channel, the queue was deleted.`)
                        .setTitle("⏹ Queue deleted.")
                ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            }, timeout);
            queue.textChannel?.send(
                createEmbed("warn", "Currently, no one is in my voice channel, to save resources, the queue was paused. " +
                    `If there's no one who joins my voice channel in the next ${duration}, the queue will be deleted.`)
                    .setTitle("⏸ Queue paused.")
            ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
        } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
    }

    public resumeTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: IVoiceState): any {
        if (vcMembers.size > 0) {
            if (queue.playing) return undefined;
            try {
                clearTimeout(queue.timeout!); newState.guild.queue!.timeout = null;
                const song = queue.songs.first();
                queue.textChannel?.send(
                    createEmbed("info", `Someones joins the voice channel. Enjoy the music 🎶\nNow Playing: **[${song!.title}](${song!.url})**`)
                        .setThumbnail(song!.thumbnail)
                        .setTitle("▶ Queue resumed")
                ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                newState.guild.queue!.playing = true;
                newState.guild.queue?.connection?.dispatcher.resume();
            } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
        }
    }
}
