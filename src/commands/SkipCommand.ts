import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["s"],
    name: "skip",
    description: "Skip the current music",
    usage: "{prefix}skip"
})
export class SkipCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        if (message.guild?.queue?.playing === false) message.guild.queue.player.unpause();
        message.guild!.queue?.player!.stop();

        const track = message.guild?.queue?.tracks.first();

        message.channel.send({
            embeds: [
                createEmbed("info", `⏭ Skipped **[${track!.metadata.title}](${track!.metadata.url}})**`)
                    .setThumbnail(track?.metadata.thumbnail as string)
            ]
        }).catch(e => this.client.logger.error("SKIP_CMD_ERR:", e));
    }
}
