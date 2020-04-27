import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { IMessage } from "../../typings";
import { MessageEmbed } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: Jukebox, readonly path: string) {
        super(client, path, {}, {
            name: "skip",
            description: "Skip the current song",
            usage: "{prefix}skip"
        });
    }
    public execute(message: IMessage): any {
        if (!message.member!.voice.channel) return message.channel.send(new MessageEmbed().setDescription("You're not in a voice channel").setColor("#FFFF00"));
        if (!message.guild!.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel!.id) return message.channel.send(
            new MessageEmbed().setDescription("❗ You need to be in the same voice channel as mine").setColor("#FF0000"));

        message.channel.send(new MessageEmbed().setDescription(`⏭ Skipped ${message.guild!.queue.songs.first()}`).setColor("#00FF00"));
        message.guild!.queue.connection!.dispatcher.end();
    }
}