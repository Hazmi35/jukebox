import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicQueueExists } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";
import { repeatMode } from "../constants/repeatMode";
import { images } from "../constants/images";

@DefineCommand({
    aliases: ["np", "now-playing"],
    name: "nowplaying",
    description: lang => lang.COMMAND_NOWPLAYING_META_DESCRIPTION(),
    usage: () => "{prefix}nowplaying"
})
export class NowPlayingCommand extends BaseCommand {
    @isMusicQueueExists()
    public execute(message: Message): any {
        const track = message.guild!.queue!.tracks.first()!;
        const embed = createEmbed("info",
            `${message.guild?.queue?.playing ? this.client.lang.COMMAND_NOWPLAYING_MESSAGE() : this.client.lang.COMMAND_NOWPLAYING_MESSAGE_PAUSED()} ` +
            `**[${track.metadata.title}](${track.metadata.url})**
            (${track.getPlaybackDuration()} / ${track.getTotalDuration()})`)
            .setThumbnail(track.metadata.thumbnail);

        if (message.guild?.queue?.repeatMode !== repeatMode.disable) {
            embed.setFooter({
                text: this.client.lang.COMMAND_NOWPLAYING_EMBED_FOOTER(message.client.lang.MUSIC_REPEAT_MODE_TYPES(message.guild!.queue!.repeatMode)),
                iconURL: images.info
            });
        }
        return message.channel.send({ embeds: [embed] });
    }
}
