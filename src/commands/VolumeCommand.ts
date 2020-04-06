/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";

export default class VolumeCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "volume",
            description: "Show or change the music volume",
            usage: "{prefix}volume"
        });
    }
    public execute(message: IMessage, args: string[]): any {
        if (!message.member!.voice.channel) return message.channel.send("You're not in a voice channel");
        if (!message.guild!.queue) return message.channel.send("There is nothing playing.");
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel!.id) return message.channel.send("You need to be in the same voice channel as mine");
        if (isNaN(Number(args[0]))) return message.channel.send(`The current volume is ${message.guild!.queue.volume}`);
        message.channel.send(`Volume set to ${args[0]}`);
        message.guild!.queue.volume = Number(args[0]);
        message.guild!.queue.connection!.dispatcher.setVolumeLogarithmic(Number(args[0]) / 100);
    }
}