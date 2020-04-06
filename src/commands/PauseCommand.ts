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
        if (!message.member!.voice.channel) return message.channel.send("You're not in a voice channel");
        if (!message.guild!.queue) return message.channel.send("There is nothing playing.");
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel.id) return message.channel.send("You need to be in the same voice channel as mine");

        if (message.guild!.queue.playing) {
            message.guild!.queue.playing = false;
            message.guild!.queue.connection!.dispatcher.pause();
            return message.channel.send("Pause the music for you!");
        } else {
            message.channel.send("Music is already paused!");
        }
    }
}