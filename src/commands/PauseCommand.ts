/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../typings";

export default class PingCommand extends BaseCommand {
    constructor(client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "pause",
            description: "Pause the current song.",
            usage: "{prefix}pause"
        });
    }

    public execute(message: IMessage): any {
        if (!message.member!.voice.channel) return message.channel.send(new MessageEmbed().setDescription("You're not in a voice channel").setColor("#FFFF00"));
        if (!message.guild!.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel!.id) return message.channel.send(
            new MessageEmbed().setDescription("You need to be in the same voice channel as mine").setColor("#FF0000"));

        if (message.guild!.queue.playing) {
            message.guild!.queue.playing = false;
            message.guild!.queue.connection!.dispatcher.pause();
            return message.channel.send(new MessageEmbed().setDescription("⏸ Paused the music for you!").setColor("#00FF00"));
        } else {
            message.channel.send(new MessageEmbed().setDescription("Music is already paused!").setColor("#FFFF00"));
        }
    }
}