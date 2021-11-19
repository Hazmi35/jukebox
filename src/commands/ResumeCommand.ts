import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    name: "resume",
    description: lang => lang.COMMAND_RESUME_META_DESCRIPTION(),
    usage: () => "{prefix}resume",
    aliases: ["unpause"]
})
export class ResumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        if (message.guild?.queue?.playing) {
            message.channel.send({ embeds: [createEmbed("warn", message.client.lang.COMMAND_RESUME_FAILED())] })
                .catch(e => this.client.logger.error(e));
        } else {
            message.guild?.queue?.player!.unpause();
            message.channel.send({ embeds: [createEmbed("info", message.client.lang.COMMAND_RESUME_SUCCESS())] })
                .catch(e => this.client.logger.error(e));
        }
    }
}
