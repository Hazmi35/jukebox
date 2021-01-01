import { Collection, GuildMember, Snowflake } from "discord.js";
import { IVoiceState } from "../../typings";
import { BaseListener } from "../structures/BaseListener";
import { ServerQueue } from "../structures/ServerQueue";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";
import { formatMS } from "../utils/formatMS";

enum Messages {
    NO_PEOPLE = "Currently, no one is in my voice channel, to save resources, the queue was paused. " +
    `If there's no one who joins my voice channel in the next {duration}, the queue will be deleted.`,
    NO_PEOPLE_TIMEOUT = "{duration} has passed and there is no one who joins my voice channel, the queue was deleted.",
    NO_PEOPLE_END = "Someones joins the voice channel. Enjoy the music 🎶\nNow Playing: **[{song.title}]({song.url})**",
    BOT_MUTED = "I see that I'm server muted. And I can't play a song while muted, the queue will be paused, " +
    "If I'm not unmuted by the next {duration}, the queue will be deleted.",
    BOT_MUTED_TIMEOUT = "{duration} has passed, and I'm still muted, the queue was deleted.",
    BOT_MUTED_END = "Hooray! I'm not muted anymore, Enjoy the music 🎶\nNow Playing: **[{song.title}]({song.url})**"
}

@DefineListener("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseListener {
    public execute(oldState: IVoiceState, newState: IVoiceState): any {
        if (newState.speaking || oldState.speaking) return undefined;

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
        const botID = this.client.user?.id;

        // Handle when bot gets kicked from the voice channel
        if (oldMember?.id === botID && oldID === queueVC.id && newID === undefined) {
            try {
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, queue deleted.`);
                queue.textChannel?.send(createEmbed("warn", "I'm disconnected from the voice channel, the queue will be deleted"))
                    .catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                return newState.guild.queue = null;
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        // Handle when the bot gets muted and or every user in voice channel is deaf
        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) {
            if (oldState.mute === null) return undefined;
            if (oldState.deaf === null) return undefined;

            // If Jukebox is muted or unmuted then do:
            if (newState.mute !== oldState.mute && member?.id === botID) {
                if (newState.mute) this.doTimeout(queueVCMembers, queue, newState, true);
                else this.resumeTimeout(queueVCMembers, queue, newState, true);
            }
            // If some bot is deafened do nothing
            if (newState.deaf && member?.user.bot) return undefined;
            // If some user deafened then do:
            if (newState.deaf !== oldState.deaf && !member?.user.bot) return console.log("SOME GUY DEAFENED");
        }

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

    private doTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: IVoiceState, alt = false): any {
        try {
            if (vcMembers.size !== 0 && !alt) return undefined;
            if (queue.timeout !== null) return undefined;
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
                    createEmbed("error", alt ? this.formatString(Messages.BOT_MUTED_TIMEOUT, duration) : this.formatString(Messages.NO_PEOPLE_TIMEOUT, duration))
                        .setTitle("⏹ Queue deleted.")
                ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            }, timeout);
            queue.textChannel?.send(
                createEmbed("warn", alt ? this.formatString(Messages.BOT_MUTED, duration) : this.formatString(Messages.NO_PEOPLE, duration))
                    .setTitle("⏸ Queue paused.")
            ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
        } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
    }

    private resumeTimeout(vcMembers: Collection<Snowflake, GuildMember>, queue: ServerQueue, newState: IVoiceState, alt = false): any {
        if (vcMembers.size > 0) {
            if (queue.playing) return undefined;
            try {
                clearTimeout(queue.timeout!);
                newState.guild.queue!.timeout = null;
                const song = queue.songs.first();
                queue.textChannel?.send(
                    createEmbed("info", alt ? this.formatString(Messages.BOT_MUTED_END, song) : this.formatString(Messages.NO_PEOPLE_END, song))
                        .setThumbnail(song!.thumbnail)
                        .setTitle("▶ Queue resumed")
                ).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                newState.guild.queue!.playing = true;
                newState.guild.queue?.connection?.dispatcher.resume();
            } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
        }
    }

    private formatString(string: string, data: any): string {
        return string
            .replace(/{duration}/g, data)
            .replace(/{song.title}/g, data.title)
            .replace(/{song.url}/g, data.url);
    }
}
