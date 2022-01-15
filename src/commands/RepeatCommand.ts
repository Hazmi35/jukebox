import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";
import { repeatMode } from "../constants/repeatMode";

@DefineCommand({
    aliases: ["loop", "music-loop", "music-repeat"],
    name: "repeat",
    description: lang => lang.COMMAND_REPEAT_META_DESCRIPTION(),
    usage: () => "{prefix}repeat [all | one | off]"
})
export class RepeatCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        const baseRepeatModes = ["off", "one", "all"];
        if (!args[0]) args[0] = baseRepeatModes[message.guild?.queue?.repeatMode === 2 ? 0 : Number(message.guild?.queue?.repeatMode) + 1];

        const mode = args[0] as keyof typeof repeatMode;

        if (Object.keys(repeatMode).includes(mode)) {
            message.guild!.queue!.repeatMode = repeatMode[mode];
            message.channel.send({
                embeds: [
                    createEmbed("info",
                        message.client.lang.COMMAND_REPEAT_SUCCESS(
                            message.client.lang.MUSIC_REPEAT_MODE_EMOJIS(message.guild!.queue!.repeatMode),
                            message.client.lang.MUSIC_REPEAT_MODE_TYPES(message.guild!.queue!.repeatMode)
                        ))
                ]
            }).catch(e => this.client.logger.error(e));
        } else {
            message.channel.send({
                embeds: [createEmbed("error", message.client.lang.COMMAND_INVALID_ARGS(message.client.config.prefix, this.meta.name))]
            }).catch(e => this.client.logger.error(e));
        }
    }
}
