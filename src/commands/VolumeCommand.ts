import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { IMessage } from "../../typings";
import { MessageEmbed } from "discord.js";

export default class VolumeCommand extends BaseCommand {
    constructor(public client: Jukebox, readonly path: string) {
        super(client, path, {}, {
            name: "volume",
            description: "Show or change the music volume",
            usage: "{prefix}volume [new volume]"
        });
    }
    public execute(message: IMessage, args: string[]): any {
        let volume = Number(args[0]);
        if (!message.member!.voice.channel) return message.channel.send(new MessageEmbed().setDescription("You're not in a voice channel").setColor("#FFFF00"));
        if (!message.guild!.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel!.id) return message.channel.send(
            new MessageEmbed().setDescription("You need to be in the same voice channel as mine").setColor("#FF0000"));
        if (volume < 0) volume = 0;

        if (isNaN(volume)) return message.channel.send(new MessageEmbed().setDescription(`📶 The current volume is ${message.guild!.queue.volume}`).setColor("#00FF00"));
        if (volume === 0) return message.channel.send(new MessageEmbed().setDescription("🔇 Muting song...").setColor("#00FF00"));
        if (Number(args[0]) > this.client.config.maxVolume) return message.channel.send(new MessageEmbed()
            .setDescription(`❗ Can't set the volume above ${this.client.config.maxVolume}`).setColor("#FFFF00"));

        message.channel.send(new MessageEmbed().setDescription(`📶 Volume set to ${args[0]}`).setColor("#00FF00"));
        message.guild!.queue.volume = Number(args[0]);
        message.guild!.queue.connection!.dispatcher.setVolume(Number(args[0]) / this.client.config.maxVolume);
    }
}