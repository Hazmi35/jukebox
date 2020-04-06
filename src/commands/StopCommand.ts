/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";
import { Collection } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "stop",
            description: "Stop the current queue",
            "usage": "{prefix}stop"
        });
    }
    public execute(message: IMessage, args: string[]): any {
        if (!message.member!.voice.channel) return message.channel.send("You're not in a voice channel");
        if (!message.guild!.queue!) return message.channel.send("There is nothing playing.");
        if (message.member!.voice.channel.id !== message.guild!.queue!.voiceChannel!.id) return message.channel.send("You need to be in the same voice channel as mine");
        message.guild!.queue!.songs.clear();
        message.guild!.queue!.connection!.dispatcher.end();
    }
}