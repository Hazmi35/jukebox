import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["st", "skip-to", "s-t"],
    name: "skipto",
    description: lang => lang.COMMAND_SKIPTO_META_DESCRIPTION(),
    usage: lang => `{prefix}skipto <${lang.COMMAND_SKIPTO_META_ARGS(0)}>`
})
export class SkipToCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        if (isNaN(Number(args[0]))) {
            return message.channel.send({
                embeds: [createEmbed("error", this.client.lang.COMMAND_INVALID_ARGS(message.client.config.prefix, this.meta.name))]
            });
        }

        const tracks = message.guild!.queue!.tracks;

        const currentTrack = tracks.first()!;
        const track = tracks.getByIndex(Number(args[0]) - 1);

        if (track === undefined) return message.channel.send({ embeds: [createEmbed("error", message.client.lang.COMMAND_SKIPTO_NOT_FOUND(Number(args[0])))] });

        if (currentTrack.id === track.id) return message.channel.send({ embeds: [createEmbed("error", message.client.lang.COMMAND_SKIPTO_FAIL())] });

        const index = tracks.findIndex(t => t.id === track.id);
        const newTracks = tracks.slice(index, tracks.size);
        const diff = tracks.filter(f => !newTracks.includes(f));

        diff.shift();
        diff.forEach(T => message.guild?.queue?.tracks.delete(T));
        if (message.guild?.queue?.playing === false) message.guild.queue.player.unpause();
        message.guild!.queue?.player!.stop();

        message.channel.send({
            embeds: [
                createEmbed("info", message.client.lang.COMMAND_SKIPTO_SUCCESS(track.metadata.title, track.metadata.url, diff.length + 1))
                    .setThumbnail(track.metadata.thumbnail)
            ]
        }).catch(e => this.client.logger.error(e));
    }
}
