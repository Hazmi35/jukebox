import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["vol"],
    name: "volume",
    description: lang => lang.COMMAND_VOLUME_META_DESCRIPTION(),
    usage: lang => `{prefix}volume [${lang.COMMAND_VOLUME_META_ARGS(0)}]`
})
export class VolumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        if (!this.client.config.enableInlineVolume) return message.channel.send({ embeds: [createEmbed("warn", message.client.lang.COMMAND_VOLUME_DISABLED())] });

        let volume = Number(args[0]);
        if (isNaN(volume)) return message.channel.send({ embeds: [createEmbed("info", message.client.lang.COMMAND_VOLUME_CURRENT(Number(message.guild!.queue!.volume)))] });
        if (volume < 0) volume = 0;
        if (volume === 0) return message.channel.send({ embeds: [createEmbed("warn", message.client.lang.COMMAND_VOLUME_USE_PAUSE_INSTEAD())] });
        if (volume > this.client.config.maxVolume) {
            return message.channel.send({
                embeds: [createEmbed("warn", message.client.lang.COMMAND_VOLUME_OVER_LIMIT(this.client.config.maxVolume))]
            });
        }

        message.guild!.queue!.volume = volume;
        message.channel.send({ embeds: [createEmbed("info", message.client.lang.COMMAND_VOLUME_SET(volume))] }).catch(e => this.client.logger.error(e));
    }
}
