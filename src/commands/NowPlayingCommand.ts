import BaseCommand from "../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { ICommandComponent, IMessage } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineCommand } from "../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: ["np", "now-playing"],
    name: "nowplaying",
    description: "Send an info about the current playing song",
    usage: "{prefix}nowplaying"
})
export default class NowPlayingCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) { super(client, meta); }

    public execute(message: IMessage): any {
        if (!message.guild?.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        return message.channel.send(
            new MessageEmbed().setDescription(`${message.guild.queue.playing ? "▶ Now playing:" : "⏸ Now playing (paused):"} ` +
                `**[${message.guild.queue.songs.first()?.title as string}](${message.guild.queue.songs.first()?.url as string})**`)
                .setColor("#00FF00")
        );
    }
}
