import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { MessageEmbed } from "discord.js";
import { IMessage } from "../../typings";

export default class NowPlayingCommand extends BaseCommand {
    public constructor(client: Jukebox, public readonly path: string) {
        super(client, path, {
            aliases: ["np", "now-playing"]
        }, {
            name: "nowplaying",
            description: "Send an info about the current playing song",
            usage: "{prefix}nowplaying"
        });
    }

    public execute(message: IMessage): any {
        if (!message.guild!.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        return message.channel.send(new MessageEmbed().setDescription(`▶ Now playing: **[${message.guild!.queue.songs.first()!.title}](${message.guild!.queue.songs.first()!.url})**`).setColor("#00FF00"));
    }
}
