import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["st", "disconnect", "dc", "leave"],
    name: "stop",
    description: lang => lang.COMMAND_STOP_META_DESCRIPTION(),
    usage: () => "{prefix}stop"
})
export class StopCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        message.guild?.queue?.tracks.clear();
        message.guild?.queue?.player.stop(true);

        message.channel.send({ embeds: [createEmbed("info", message.client.lang.COMMAND_STOP_SUCCESS())] })
            .catch(e => this.client.logger.error(e));
    }
}
