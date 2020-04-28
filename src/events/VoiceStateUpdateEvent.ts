import { ClientEvent, IVoiceState } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { MessageEmbed } from "discord.js";

export default class ReadyEvent implements ClientEvent {
    readonly name = "voiceStateUpdate";
    constructor(private client: Jukebox) {}

    public execute(oldState: IVoiceState, newState: IVoiceState): any {
        if (newState.guild.queue) {
            const oldID = oldState.channel ? oldState.channel.id : undefined;
            const newID = newState.channel ?  newState.channel.id : undefined;

            // Handle when bot gets kicked from the voice channel
            if (oldState.id === this.client.user!.id && oldID === newState.guild.queue.voiceChannel!.id && newID === undefined) {
                newState.guild.queue.textChannel!.send(new MessageEmbed().setDescription("I'm disconnected from the voice channel, queue will be deleted").setColor("#FFFF00"));
                return newState.guild.queue = null;
            }

            // Handle when the bot is moved to another voice channel
            if (oldState.id === this.client.user!.id && oldID === newState.guild.queue.voiceChannel!.id && newID !== newState.guild.queue.voiceChannel!.id) {
                return newState.guild.queue.voiceChannel = newState.channel;
            }

            // Handle when user leaves voice channel
            const vc = newState.guild.queue.voiceChannel!.members.filter(m => !m.user.bot);
            if (oldID === newState.guild.queue.voiceChannel!.id && newID === undefined) {
                if (!vc.size) {
                    newState.guild.queue.timeouts.set(1, setTimeout(() => {
                        clearTimeout(newState.guild.queue!.timeouts.get(1)!);
                        newState.guild.queue!.timeouts.delete(1);
                        newState.guild.queue!.playing = false;
                        newState.guild.queue!.connection!.dispatcher.pause();
                        newState.guild.queue!.textChannel!.send(new MessageEmbed().setTitle("⏸ Queue paused.").setColor("#FFFF00")
                            .setDescription("Currently, no one is the in voice channel, to save resources, queue was pasued. "
                            + "if there's no people the in voice channel in the next 3 minutes, queue will be deleted."));
                        return newState.guild.queue!.timeouts.set(2, setTimeout(() => {
                            newState.guild.queue!.textChannel!.send(new MessageEmbed().setTitle("⏹ Queue deleted.").setColor("#FF0000")
                                .setDescription("3 minutes passed and no one is in the voice channel"));
                            newState.guild.queue!.playing = true;
                            newState.guild.queue!.connection!.dispatcher.resume();
                            newState.guild.queue!.songs.clear();
                            return newState.guild.queue!.connection!.dispatcher.end();
                        }, 180000));
                    }, 30000));
                    return undefined;
                }
            }

            // Handle when user joins voice channel
            if (newID === newState.guild.queue.voiceChannel!.id && !newState.member!.user.bot) {
                if (vc.size > 0) {
                    if (vc.size === 1) { clearTimeout(newState.guild.queue.timeouts.get(1)!); newState.guild.queue.timeouts.delete(1); }
                    if (vc.size === 1) { clearTimeout(newState.guild.queue.timeouts.get(2)!); newState.guild.queue.timeouts.delete(2); }
                    if (newState.guild.queue.playing === false && vc.size < 2) {
                        newState.guild.queue.textChannel!.send(new MessageEmbed().setTitle("▶ Queue resumed").setColor("#00FF00")
                            .setDescription(`Someones joins te voice channel. Enjoy the music 🎶\nNow Playing: **${newState.guild.queue.songs.first()!.title}**`));
                        newState.guild.queue.playing = true;
                        try {
                            newState.guild.queue.connection!.dispatcher.resume();
                        } catch (e) {
                            this.client.log.error("VOICESTATEUPDATE_ERR:", e);
                        }
                    }
                }
            }
        }
    }
}
