import { Message } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";
import { createEmbed } from "../utils/createEmbed";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicQueueExists, isSameVoiceChannel, isUserInTheVoiceChannel } from "../utils/decorators/MusicHelper";

@DefineCommand({
    aliases: ["rm"],
    name: "remove",
    description: "Remove a track from the current queue",
    usage: "{prefix}remove <Track number>"
})
export class RemoveCommand extends BaseCommand {
    @isMusicQueueExists()
    @isUserInTheVoiceChannel()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        if (isNaN(Number(args[0]))) {
            return message.channel.send({
                embeds: [createEmbed("error", `Invalid value, please see \`${this.client.config.prefix}help ${this.meta.name}\` for more info!`)]
            });
        }

        const songs = message.guild!.queue!.songs.map(s => s);
        const currentSong = message.guild!.queue!.songs.first()!;
        const song = songs[Number(args[0]) - 1];

        if (currentSong.id === song.id) {
            if (message.guild?.queue?.playing === false) message.guild.queue.currentPlayer?.unpause();
            message.guild!.queue?.currentPlayer!.stop();
        } else {
            message.guild?.queue?.songs.delete(message.guild.queue.songs.findKey(x => x.id === song.id)!);
        }

        message.channel.send({
            embeds: [
                createEmbed("info", `✅ Removed **[${song.title}](${song.url}})**`)
                    .setThumbnail(song.thumbnail)
            ]
        }).catch(e => this.client.logger.error("REMOVE_COMMAND_ERR:", e));
    }
}
