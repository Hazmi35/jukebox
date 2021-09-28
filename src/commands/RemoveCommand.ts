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

        if (currentSong.metadata.id === song.metadata.id) {
            if (message.guild?.queue?.playing === false) message.guild.queue.player.unpause();
            message.guild!.queue?.player!.stop();
        } else {
            message.guild?.queue?.songs.delete(message.guild.queue.songs.findKey(x => x.metadata.id === song.metadata.id)!);
        }

        message.channel.send({
            embeds: [
                createEmbed("info", `✅ Removed **[${song.metadata.title}](${song.metadata.url}})**`)
                    .setThumbnail(song.metadata.thumbnail)
            ]
        }).catch(e => this.client.logger.error("REMOVE_COMMAND_ERR:", e));
    }
}
