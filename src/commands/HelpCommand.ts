/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { Message } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, { aliases: ["commands"] }, {
            name: "help",
            description: "Send help menu",
            usage: "{prefix}help"
        });
    }
    public async execute(message: Message, args: string[]): Promise<void> {
        // TODO: Finish this
    }
}