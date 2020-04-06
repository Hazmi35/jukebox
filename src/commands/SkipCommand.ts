/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";

export default class SkipCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "skip",
            description: "Skip the current song",
            usage: "{prefix}skip"
        });
    }
    public execute(message: IMessage, args: string[]): any {
        if (!message.member!.voice.channel) return message.channel.send("You're not in a voice channel");
        if (!message.guild!.getQueue()) return message.channel.send("There is nothing playing.");
        if (message.member!.voice.channel.id !== message.guild!.getQueue()!.voiceChannel.id) return message.channel.send("You need to be in the same voice channel as mine");
        message.guild!.getQueue()!.connection!.dispatcher.emit("skip");
    }
}