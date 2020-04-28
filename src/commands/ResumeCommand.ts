import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../../typings";

export default class PingCommand extends BaseCommand {
    constructor(client: Jukebox, readonly path: string) {
        super(client, path, {}, {
            name: "resume",
            description: "Resume the music.",
            usage: "{prefix}resume"
        });
    }

    public execute(message: IMessage): any {
        if (!message.member!.voice.channel) return message.channel.send(new MessageEmbed().setDescription("You're not in a voice channel").setColor("#FFFF00"));
        if (!message.guild!.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel!.id) return message.channel.send(
            new MessageEmbed().setDescription("You need to be in the same voice channel as mine").setColor("#FF0000"));

        if (message.guild!.queue.playing) {
            message.channel.send(new MessageEmbed().setDescription("Music is not paused!").setColor("#FFFF00"));
        } else {
            message.guild!.queue.playing = true;
            message.guild!.queue.connection!.dispatcher.resume();
            return message.channel.send(new MessageEmbed().setDescription("▶ Resumed the music for you!").setColor("#00FF00"));
        }
    }
}