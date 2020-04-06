/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";

export default class VolumeCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "queue",
            description: "Show the current queue",
            usage: "{prefix}queue"
        });
    }
    public execute(message: IMessage, args: string[]): any {
        if (!message.guild!.getQueue()) return message.channel.send("There is nothing playing.");
        else return message.channel.send(`
        **Song queue:**
        ${message.guild!.getQueue()!.songs.map(s => `- **${s.title}**`)}
        `);
    }
}