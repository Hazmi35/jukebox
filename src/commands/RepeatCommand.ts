import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { loopMode } from "../structures/ServerQueue";
import { Message } from "discord.js";

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
        if (!args[0]) {
            return message.channel.send(
                createEmbed("info", `Current mode: "${modeEmoji[message.guild!.queue!.loopMode]} Repeating **${modeTypes[message.guild!.queue!.loopMode]}**"`)
            );
        }

        const mode = args[0] as keyof typeof loopMode;

        if (loopMode[mode] as any === undefined || !isNaN(Number(mode))) {
            message.channel.send(createEmbed("error", `Invalid value, see \`${this.client.config.prefix}help ${this.meta.name}\` for more info!`))
                .catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        } else {
            message.guild!.queue!.loopMode = loopMode[mode];
            message.channel.send(createEmbed("info", `${modeEmoji[message.guild!.queue!.loopMode]} Repeating **${modeTypes[message.guild!.queue!.loopMode]}**`))
                .catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        }
    }
}
