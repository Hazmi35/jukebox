/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../typings";

export default class NowPlayingCommand extends BaseCommand {
    constructor(client: BotClient, readonly path: string) {
        super(client, path, {
            aliases: ["np", "now-playing"],
        }, {
            name: "nowplaying",
            description: "Send an info about the current playing song",
            usage: "{prefix}nowplaying"
        });
    }

    public execute(message: IMessage): any {
        if (!message.guild!.getQueue()) return message.channel.send("There is nothing playing.");
        return message.channel.send(`Now playing: **${message.guild!.getQueue()!.songs[0].title}**`);
    }
}