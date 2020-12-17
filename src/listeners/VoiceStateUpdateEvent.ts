import { VoiceChannel } from "discord.js";
import { IVoiceState } from "../../typings";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

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
        if (oldID === vc.id && newID === vc.id && member?.user.bot && queue.timeout === null) this.doTimeout(vc, newState);

        // Handle when user joins voice channel or bot gets moved
        if (newID === vc.id && member?.user.bot) this.resumeTimeout(vc, newState);
    }

    public doTimeout(vc: VoiceChannel, newState: IVoiceState): any {}

    public resumeTimeout(vc: VoiceChannel, newState: IVoiceState): any {}
}
