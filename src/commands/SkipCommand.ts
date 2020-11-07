import BaseCommand from "../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import Jukebox from "../structures/Jukebox";
import { ICommandComponent, IMessage } from "../../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: ["s"],
    name: "skip",
    description: "Skip the current song",
    usage: "{prefix}skip"
})
export default class SkipCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) { super(client, meta); }

    public execute(message: IMessage): any {
        if (!message.member?.voice.channel) return message.channel.send(new MessageEmbed().setDescription("You're not in a voice channel").setColor("#FFFF00"));
        if (!message.guild?.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        if (message.member.voice.channel.id !== message.guild.queue.voiceChannel?.id) {
            return message.channel.send(
                new MessageEmbed().setDescription("❗ You need to be in the same voice channel as mine").setColor("#FF0000")
            );
        }

        message.guild.queue.playing = true;
        message.guild.queue.connection?.dispatcher.resume();
        message.guild.queue.connection?.dispatcher.end();

        message.channel.send(
            new MessageEmbed()
                .setDescription(`⏭ Skipped [**${message.guild.queue.songs.first()?.title as string}**](${message.guild.queue.songs.first()?.url as string}})`)
                .setColor("#00FF00")
        )
            .catch(e => this.client.logger.error("SKIP_CMD_ERR:", e));
    }
}
