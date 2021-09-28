import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["vol"],
    name: "volume",
    description: "Show or change the music player's volume",
    usage: "{prefix}volume [new volume]"
})
export class VolumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        if (!this.client.config.enableInlineVolume) return message.channel.send({ embeds: [createEmbed("warn", "⚠ Volume command is disabled within this bot configuration. Please use the volume functionality in Discord client directly")] });

        let volume = Number(args[0]);
        if (isNaN(volume)) return message.channel.send({ embeds: [createEmbed("info", `📶 The current volume is \`${message.guild!.queue!.volume.toString()}\``)] });
        if (volume < 0) volume = 0;
        if (volume === 0) return message.channel.send({ embeds: [createEmbed("warn", "❗ Please pause the music player instead of setting the volume to \`0\`")] });
        if (Number(args[0]) > this.client.config.maxVolume) {
            return message.channel.send({
                embeds: [createEmbed("warn", `❗ I can't set the volume above \`${this.client.config.maxVolume}\``)]
            });
        }

        message.guild!.queue!.volume = Number(args[0]);
        message.channel.send({ embeds: [createEmbed("info", `📶 Volume set to \`${args[0]}\``)] }).catch(e => this.client.logger.error("VOLUME_CMD_ERR:", e));
    }
}
