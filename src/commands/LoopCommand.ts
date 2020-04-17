/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";
import { MessageEmbed } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {
            aliases: ["repeat", "music-loop"]
        }, {
            name: "loop",
            description: "Loop current song or queue",
            usage: "{prefix}loop <all | one | disable>"
        });
    }
    public execute(message: IMessage, args: string[]): any {
        if (!message.member!.voice.channel) return message.channel.send("You're not in a voice channel");
        if (!message.guild!.queue) return message.channel.send("There is nothing playing.");
        if (message.member!.voice.channel.id !== message.guild!.queue.voiceChannel!.id) return message.channel.send("You need to be in the same voice channel as mine");
        const mode = args[0];
        if (mode === "all" || mode === "queue" || mode === "*" || mode === "2") {
            message.guild!.queue.loopMode = 2;
            return message.channel.send("🔁 Looping all music in the queue.");
        } else if (mode === "current" || mode === "one" || mode === "musiconly" || mode === "1") {
            message.guild!.queue.loopMode = 1;
            return message.channel.send("🔂 Looping only this music.");
        } else if (mode === "disable" || mode === "off" || mode === "0") {
            message.guild!.queue.loopMode = 0;
            return message.channel.send("▶ Loop disabled.");
        } else {
            message.channel.send(`Invalid value, see \`${this.client.config.prefix}help loop\` for more info!`); // TODO: Make this informational
        }
    }
}