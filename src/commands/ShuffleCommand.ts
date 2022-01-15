import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";
import { shuffleMode } from "../constants/shuffleMode";

@DefineCommand({
    aliases: ["randomize", "shuffle-queue"],
    name: "shuffle",
    description: lang => lang.COMMAND_SHUFFLE_META_DESCRIPTION(),
    usage: () => "{prefix}shuffle [enable | disable]"
})
export class ShuffleCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        const mode = args[0] as keyof typeof shuffleMode;

        if (Object.keys(shuffleMode).includes(mode)) {
            message.guild!.queue!.shuffleMode = shuffleMode[mode];
            message.channel.send({
                embeds: [
                    createEmbed("info", message.client.lang.COMMAND_SHUFFLE_MODE_SUCCESS(message.guild!.queue!.shuffleMode === 1))
                        .setFooter({ text: message.client.lang.COMMAND_SHUFFLE_MODE_SUCCESS_FOOTER() })
                ]
            }).catch(e => this.client.logger.error(e));
        } else {
            message.guild!.queue?.tracks.shuffle();

            message.channel.send({
                embeds: [createEmbed("info", message.client.lang.COMMAND_SHUFFLE_SUCCESS())]
            }).catch(e => this.client.logger.error(e));
        }
    }
}
