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
        message.guild!.queue!.playing = true;
        message.guild?.queue?.connection?.dispatcher.once("speaking", () => message.guild?.queue?.connection?.dispatcher.end());
        message.guild!.queue?.connection?.dispatcher.resume();

        const song = message.guild?.queue?.songs.first();

        message.channel.send(
            createEmbed("info", `⏭ Skipped **[${song!.title}](${song!.url}})**`)
                .setThumbnail(song?.thumbnail as string)
        ).catch(e => this.client.logger.error("SKIP_CMD_ERR:", e));
    }
}
