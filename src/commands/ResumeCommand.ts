/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../typings";

export default class PingCommand extends BaseCommand {
    constructor(client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "resume",
            description: "Resume the music.",
            usage: "{prefix}resume"
        });
    }

    public execute(message: IMessage): any {
        if (!message.member!.voice.channel) return message.channel.send("You're not in a voice channel");
        if (!message.guild!.getQueue()) return message.channel.send("There is nothing playing.");
        if (message.member!.voice.channel.id !== message.guild!.getQueue()!.voiceChannel.id) return message.channel.send("You need to be in the same voice channel as mine");

        if (message.guild!.getQueue()!.playing) {
            message.channel.send("Music is not paused!");
        } else {
            message.guild!.getQueue()!.playing = true;
            message.guild!.getQueue()!.connection!.dispatcher.resume();
            return message.channel.send("Resumed the music for you!");
        }
    }
}