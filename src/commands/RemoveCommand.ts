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

        const tracks = message.guild!.queue!.tracks.map(s => s);
        const currentTrack = message.guild!.queue!.tracks.first()!;
        const track = tracks[Number(args[0]) - 1];

        if (currentTrack.metadata.id === track.metadata.id) {
            if (message.guild?.queue?.playing === false) message.guild.queue.player.unpause();
            message.guild!.queue?.player!.stop();
        } else {
            message.guild?.queue?.tracks.delete(message.guild.queue.tracks.findKey(x => x.metadata.id === track.metadata.id)!);
        }

        message.channel.send({
            embeds: [
                createEmbed("info", `✅ Removed **[${track.metadata.title}](${track.metadata.url}})**`)
                    .setThumbnail(track.metadata.thumbnail)
            ]
        }).catch(e => this.client.logger.error("REMOVE_COMMAND_ERR:", e));
    }
}
