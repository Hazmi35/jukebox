import { ClientEvent, IVoiceState } from "../../typings";
import Jukebox from "../structures/Jukebox";

export default class ReadyEvent implements ClientEvent {
    readonly name = "voiceStateUpdate";
    constructor(private client: Jukebox) {}

    public execute(oldState: IVoiceState, newState: IVoiceState): void {
        if (newState.guild.queue) {
            const oldID = newState.channel === undefined ? undefined : newState.channel?.id;
            const newID = newState.channel === undefined ? undefined : newState.channel?.id;

            // Bot-Disconnected
            if (oldState.id === this.client.user?.id && oldID === newState.guild.queue.voiceChannel?.id && newID === undefined) {
                newState.guild.queue.songs.clear();
                return newState.guild.queue.connection!.dispatcher.end();
            }
        }
    }
}
