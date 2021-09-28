import { Collection, GuildMember, Snowflake, VoiceState } from "discord.js";
import { BaseEvent } from "../structures/BaseEvent";
import { ServerQueue } from "../structures/ServerQueue";
import { createEmbed } from "../utils/createEmbed";
import { DefineEvent } from "../utils/decorators/DefineEvent";

@DefineEvent("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseEvent {
    public execute(oldState: VoiceState, newState: VoiceState): any {
        const queue = newState.guild.queue;

        if (!queue) return undefined;

        const newVC = newState.channel;
        const oldVC = oldState.channel;
        const oldID = oldVC?.id;
        const newID = newVC?.id;
        const queueVC = queue.voiceChannel!;
        const oldMember = oldState.member;
        const member = newState.member;
        const queueVCMembers = queueVC.members.filter(m => !m.user.bot);
        const newVCMembers = newVC?.members.filter(m => !m.user.bot);
        const botID = this.client.user?.id; // TODO: Handle bot moved & kicked from voice channel in VoiceConnection directly?

        // Handle when bot gets kicked from the voice channel
        if (oldMember?.id === botID && oldID === queueVC.id && newID === undefined) {
            try {
                newState.guild.queue?.player.stop(true);
                clearTimeout(queue.timeout!);
                newState.guild.queue = null;
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, the queue was deleted.`);
                queue.textChannel?.send({ embeds: [createEmbed("warn", "I was disconnected from the voice channel, the queue will be deleted")] })
                    .then(() => { queue.oldMusicMessage = null; queue.oldVoiceStateUpdateMessage = null; })
                    .catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) return undefined; // TODO: Handle all listeners deaf & bot muted event?

        // Handle when the bot is moved to another voice channel
        if (member?.id === botID && oldID === queueVC.id && newID !== queueVC.id && newID !== undefined) {
            if (!newVCMembers) return undefined;
            if (newVCMembers.size === 0 && queue.timeout === null) this.doTimeout(newVCMembers, queue, newState);
            else if (newVCMembers.size !== 0 && queue.timeout !== null) this.resumeTimeout(newVCMembers, queue, newState);
            newState.guild.queue!.voiceChannel = newVC;
        }

        // Handle when user leaves voice channel
        if (oldID === queueVC.id && newID !== queueVC.id && !member?.user.bot && queue.timeout === null) this.doTimeout(queueVCMembers, queue, newState);

        // Handle when user joins voice channel or bot gets moved
        if (newID === queueVC.id && !member?.user.bot) this.resumeTimeout(queueVCMembers, queue, newState);
    }

    private doTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: VoiceState): any {
        try {
            if (vcMembers.size !== 0) return undefined;
            clearTimeout(queue.timeout!);
            newState.guild.queue!.timeout = null;
            queue.player.pause();
            const timeout = this.client.config.deleteQueueTimeout;
            const duration = this.client.util.formatMS(timeout);
            queue.oldVoiceStateUpdateMessage = null;
            newState.guild.queue!.timeout = setTimeout(() => {
                queue.connection?.disconnect();
                newState.guild.queue = null;
                queue.oldMusicMessage = null; queue.oldVoiceStateUpdateMessage = null;
                queue.textChannel?.send({
                    embeds: [
                        createEmbed("error", `**${duration}** have passed and there is no one who joins my voice channel, the queue was deleted.`)
                            .setTitle("⏹ Queue deleted.")
                    ]
                }).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            }, timeout);
            queue.textChannel?.send({
                embeds: [
                    createEmbed("warn", "Everyone has left from my voice channel, to save resources, the queue was paused. " +
                    `If there's no one who joins my voice channel in the next **${duration}**, the queue will be deleted.`)
                        .setTitle("⏸ Queue paused.")
                ]
            }).then(m => queue.oldVoiceStateUpdateMessage = m.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
        } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
    }

    private resumeTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: VoiceState): any {
        if (vcMembers.size > 0) {
            if (queue.playing) return undefined;
            try {
                clearTimeout(queue.timeout!);
                newState.guild.queue!.timeout = null;
                const tracks = queue.tracks.first();
                queue.textChannel?.send({
                    embeds: [
                        createEmbed("info", `Someone joins the voice channel. Enjoy the music 🎶\nNow Playing: **[${tracks!.metadata.title}](${tracks!.metadata.url})**`)
                            .setThumbnail(tracks!.metadata.thumbnail)
                            .setTitle("▶ Queue resumed")
                    ]
                }).then(m => queue.oldVoiceStateUpdateMessage = m.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                newState.guild.queue?.player.unpause();
            } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
        }
    }
}
