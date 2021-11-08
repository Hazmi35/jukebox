import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";
import { loopMode } from "../constants/loopMode";

@DefineCommand({
    aliases: ["loop", "music-loop", "music-repeat"],
    name: "repeat",
    description: "Repeat current music or the queue",
    usage: "{prefix}repeat [all | one | off]"
})
export class RepeatCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message, args: string[]): any {
        const modeTypes = ["disabled", "current track", "all tracks in the queue"];
        const modeEmoji = ["▶", "🔂", "🔁"];
        const baseModes = ["off", "one", "all"];
        if (!args[0]) args[0] = baseModes[message.guild?.queue?.loopMode === 2 ? 0 : Number(message.guild?.queue?.loopMode) + 1];

        const mode = args[0] as keyof typeof loopMode;

        if (loopMode[mode] as any === undefined) {
            message.channel.send({
                embeds: [createEmbed("error", `Invalid value, see \`${this.client.config.prefix}help ${this.meta.name}\` for more info!`)]
            }).catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        } else {
            message.guild!.queue!.loopMode = loopMode[mode];
            message.channel.send({ embeds: [createEmbed("info", `${modeEmoji[message.guild!.queue!.loopMode]} Repeating **${modeTypes[message.guild!.queue!.loopMode]}**`)] })
                .catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        }
    }
}
