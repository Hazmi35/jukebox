import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    name: "pause",
    description: lang => lang.COMMAND_PAUSE_META_DESCRIPTION(),
    usage: () => "{prefix}pause"
})
export class PauseCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        if (message.guild?.queue?.playing) {
            message.guild.queue.player.pause();
            return message.channel.send({ embeds: [createEmbed("info", this.client.lang.COMMAND_PAUSE_SUCCESS())] });
        }
        message.channel.send({ embeds: [createEmbed("warn", this.client.lang.COMMAND_PAUSE_ALREADY_PAUSED())] })
            .catch(e => this.client.logger.error(e));
    }
}
