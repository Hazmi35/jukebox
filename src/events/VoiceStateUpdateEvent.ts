import { ClientEvent, IVoiceState } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { MessageEmbed, TextChannel } from "discord.js";
import { msToTime } from "../utils/msToTime";

export default class VoiceStateUpdateEvent implements ClientEvent {
    public readonly name = "voiceStateUpdate";
    public constructor(private readonly client: Jukebox) {}

    public execute(oldState: IVoiceState, newState: IVoiceState): any {
        if (newState.guild.queue) {
            const oldID = oldState.channel ? oldState.channel.id : undefined;
            const newID = newState.channel ? newState.channel.id : undefined;
            const musicVcID = newState.guild.queue.voiceChannel!.id;

            // Handle when bot gets kicked from the voice channel
            if (oldState.id === this.client.user!.id && oldID === newState.guild.queue.voiceChannel!.id && newID === undefined) {
                try {
                    newState.guild.queue.textChannel!.send(new MessageEmbed().setDescription("I'm disconnected from the voice channel, the queue will be deleted").setColor("#FFFF00"));
                    return newState.guild.queue = null;
                } catch (e) {
                    this.client.log.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
                }
            }

            // Handle when the bot is moved to another voice channel
            if (oldState.id === this.client.user!.id && oldID === musicVcID && newID !== musicVcID) {
                return newState.guild.queue!.voiceChannel = newState.channel;
            }

            // Handle when user leaves voice channel
            const vc = newState.guild.queue!.voiceChannel!.members.filter(m => !m.user.bot);
            if (oldID === musicVcID && newID !== musicVcID && !newState.member!.user.bot) {
                try {
                    if (vc.size === 0) {
                        clearTimeout(newState.guild.queue!.timeout!);
                        newState.guild.queue!.timeout = null;
                        newState.guild.queue!.playing = false;
                        newState.guild.queue!.connection!.dispatcher.pause();
                        const timeout = this.client.config.deleteQueueTimeout;
                        const duration = msToTime(timeout);
                        newState.guild.queue!.textChannel!.send(new MessageEmbed().setTitle("⏸ Queue paused.").setColor("#FFFF00")
                            .setDescription("Currently, no one is the in the voice channel, to save resources, the queue was paused. " +
                            `If there's no people the in voice channel in the next ${duration}, the queue will be deleted.`));
                        return newState.guild.queue!.timeout = setTimeout(() => {
                            newState.guild.queue!.connection!.dispatcher.once("speaking", () => {
                                newState.guild.queue!.songs.clear();
                                const textChannel = this.client.channels.resolve(newState.guild.queue!.textChannel!.id) as TextChannel;
                                newState.guild.queue!.connection!.dispatcher.end(() => {
                                    textChannel.send(new MessageEmbed().setTitle("⏹ Queue deleted.").setColor("#FF0000")
                                        .setDescription(`${duration} have passed and there is no one who joins the voice channel, the queue was deleted.`));
                                });
                            });
                            newState.guild.queue!.playing = true;
                            newState.guild.queue!.connection!.dispatcher.resume(); // I don't know why but I think I should resume and then end the dispatcher or it won't work
                        }, timeout);
                    }
                } catch (e) { this.client.log.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
            }

            // Handle when user joins voice channel
            if (newID === musicVcID && !newState.member!.user.bot) {
                if (vc.size > 0) {
                    if (vc.size === 1) { clearTimeout(newState.guild.queue!.timeout!); newState.guild.queue!.timeout = null; }
                    if (!newState.guild.queue!.playing && vc.size < 2) {
                        try {
                            const song = newState.guild.queue!.songs.first()!;
                            newState.guild.queue!.textChannel!.send(new MessageEmbed().setTitle("▶ Queue resumed").setColor("#00FF00")
                                .setDescription(`Someones joins the voice channel. Enjoy the music 🎶\nNow Playing: **[${song.title}](${song.url})**`));
                            newState.guild.queue!.playing = true;
                            newState.guild.queue!.connection!.dispatcher.resume();
                        } catch (e) {
                            this.client.log.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
                        }
                    }
                }
            }
        }
    }
}
