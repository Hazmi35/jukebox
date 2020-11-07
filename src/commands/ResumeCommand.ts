import BaseCommand from "../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { ICommandComponent, IMessage } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineCommand } from "../utils/decorators/DefineCommand";

@DefineCommand({
    name: "resume",
    description: "Resume the music.",
    usage: "{prefix}resume"
})
export default class ResumeCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) { super(client, meta); }

    public execute(message: IMessage): any {
        if (!message.member?.voice.channel) return message.channel.send(new MessageEmbed().setDescription("You're not in a voice channel").setColor("#FFFF00"));
        if (!message.guild?.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        if (message.member.voice.channel.id !== message.guild.queue.voiceChannel?.id) {
            return message.channel.send(
                new MessageEmbed().setDescription("You need to be in the same voice channel as mine").setColor("#FF0000")
            );
        }

        if (message.guild.queue.playing) {
            message.channel.send(new MessageEmbed().setDescription("Music is not paused!").setColor("#FFFF00")).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        } else {
            message.guild.queue.playing = true;
            message.guild.queue.connection?.dispatcher.resume();
            message.channel.send(new MessageEmbed().setDescription("▶ Resumed the music for you!").setColor("#00FF00")).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        }
    }
}
