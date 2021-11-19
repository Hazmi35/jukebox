import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["s"],
    name: "skip",
    description: lang => lang.COMMAND_SKIP_META_DESCRIPTION(),
    usage: () => "{prefix}skip"
})
export class SkipCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        if (message.guild?.queue?.playing === false) message.guild.queue.player.unpause();
        message.guild!.queue?.player!.stop();

        const { metadata } = message.guild!.queue!.tracks.first()!;

        message.channel.send({
            embeds: [
                createEmbed("info", message.client.lang.COMMAND_SKIP_SUCCESS(metadata.title, metadata.url))
                    .setThumbnail(metadata.thumbnail)
            ]
        }).catch(e => this.client.logger.error(e));
    }
}
